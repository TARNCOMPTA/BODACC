import { BodaccAnnouncement, SearchFilters, ApiResponse } from '../types/bodacc';

const BODACC_API_BASE = 'https://bodacc-datadila.opendatasoft.com/api/v2/catalog/datasets/annonces-commerciales/records';
const BODACC_DATASET_BASE = 'https://bodacc-datadila.opendatasoft.com/api/v2/catalog/datasets/annonces-commerciales';
const REQUEST_TIMEOUT = 15000; // 15 secondes

export class BodaccApiService {
  /**
   * Échappe les caractères spéciaux Lucene
   */
  private static escapeLucene(query: string): string {
    return query.replace(/([+\-!(){}[\]^"~*?:\\/])/g, '\\$1');
  }

  /**
   * Échappe les quotes simples pour les valeurs ODSQL dans where
   */
  private static escapeSqlValue(value: string): string {
    return value.replace(/'/g, "\\'");
  }

  /**
   * Construit les paramètres de requête pour récupérer toutes les annonces avec filtres
   */
  private static buildQueryParams(filters: SearchFilters): URLSearchParams {
    const params = new URLSearchParams();
    
    // Pagination
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const page = Math.max(1, filters.page || 1);
    const offset = (page - 1) * limit;
    
    params.set('limit', limit.toString());
    params.set('offset', offset.toString());
    
    // Tri
    if (filters.sort) {
      params.set('order_by', filters.sort);
    }
    
    // Construction des conditions WHERE
    const whereConditions: string[] = [];
    
    // Recherche textuelle dans plusieurs champs
    if (filters.query && filters.query.trim()) {
      const escapedQuery = this.escapeSqlValue(filters.query.trim());
      whereConditions.push(`(commercant LIKE '%${escapedQuery}%' OR registre LIKE '%${escapedQuery}%')`);
    }
    
    // Filtre par tribunal
    if (filters.departement && filters.departement.trim()) {
      const escapedDepartement = this.escapeSqlValue(filters.departement.trim());
      whereConditions.push(`numerodepartement = '${escapedDepartement}'`);
    }
    
    // Filtre par catégorie (typeavis_lib)
    if (filters.category && filters.category.trim()) {
      const escapedCategory = this.escapeSqlValue(filters.category.trim());
      whereConditions.push(`typeavis_lib = '${escapedCategory}'`);
    }
    
    // Filtre par sous-catégorie (familleavis_lib)
    if (filters.subCategory && filters.subCategory.trim()) {
      const escapedSubCategory = this.escapeSqlValue(filters.subCategory.trim());
      whereConditions.push(`familleavis_lib = '${escapedSubCategory}'`);
    }
    
    // Filtres de dates
    if (filters.dateFrom && filters.dateFrom.trim()) {
      whereConditions.push(`dateparution >= date'${filters.dateFrom}'`);
    }
    
    if (filters.dateTo && filters.dateTo.trim()) {
      whereConditions.push(`dateparution <= date'${filters.dateTo}'`);
    }
    
    // Ajouter la clause WHERE si on a des conditions
    if (whereConditions.length > 0) {
      params.set('where', whereConditions.join(' AND '));
    }
    
    return params;
  }

  /**
   * Récupère les annonces BODACC avec filtres
   */
  static async getAnnouncements(filters: SearchFilters): Promise<ApiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
      const params = this.buildQueryParams(filters);
      const url = `${BODACC_API_BASE}?${params.toString()}`;
      
      // Logs de debug détaillés
      console.log('🌐 URL BODACC:', url);
      console.log('📋 Paramètres:', Object.fromEntries(params));
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('📡 Status:', response.status);
      console.log('📡 Headers:', Object.fromEntries(response.headers));
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur réponse:', errorText);
        if (response.status === 429) {
          throw new Error('Trop de requêtes simultanées. Veuillez patienter quelques instants avant de relancer la recherche.');
        }
        throw new Error(`Erreur API BODACC: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Logs de debug détaillés
      console.log('📊 Total résultats:', data.total_count);
      console.log('📋 Résultats retournés:', data.records?.length || 0);
      if (data.results?.[0]) {
        console.log('🔍 Champs disponibles:', Object.keys(data.results[0].record?.fields || {}));
      }
      
      const announcements = (data.records || []).map((result: any) => this.mapRecord(result.record));
      
      return {
        total_count: data.total_count || 0,
        results: announcements
      };
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('La requête a pris trop de temps. Veuillez réessayer.');
        }
        throw error;
      }
      
      throw new Error('Erreur inattendue lors du chargement des annonces BODACC. Veuillez réessayer.');
    }
  }

  /**
   * Récupère les catégories disponibles depuis l'API
   */
  static async getCategories(): Promise<string[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
      const params = new URLSearchParams();
      params.set('limit', '0'); // On ne veut que les facettes, pas les données
      
      const url = `${BODACC_API_BASE}?${params.toString()}&facet=typeavis_lib`;
      
      console.log('🏷️ URL Catégories:', url);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erreur API BODACC: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log('🏷️ Données facettes récupérées:', JSON.stringify(data, null, 2));
      
      // Extraire les catégories depuis les facettes
      if (data.facet_groups && data.facet_groups.length > 0) {
        const typeavisFacetGroup = data.facet_groups.find((group: any) => group.name === 'typeavis_lib');
        if (typeavisFacetGroup && typeavisFacetGroup.facets) {
          return typeavisFacetGroup.facets
            .map((facet: any) => facet.name)
            .filter((name: string) => name && name.trim())
            .sort();
        }
      }
      
      // Fallback: essayer la structure alternative
      if (data.facets) {
        return data.facets
          .map((facet: any) => facet.name || facet.value)
          .filter((name: string) => name && name.trim())
          .sort();
      }
      
      return [];
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      console.error('❌ Erreur lors du chargement des catégories:', error);
      
      // Retourner une liste par défaut en cas d'erreur
      return [
        'Avis de constitution',
        'Modification',
        'Dissolution',
        'Clôture de liquidation',
        'Vente de fonds de commerce',
        'Location-gérance'
      ];
    }
  }

  /**
   * Mappe un enregistrement de l'API vers notre type BodaccAnnouncement
   */
  private static mapRecord(record: any): BodaccAnnouncement {
    const fields = record.fields || {};
    
    // Construire l'adresse complète
    const adresseParts = [];
    if (fields.numerovoie) adresseParts.push(fields.numerovoie);
    if (fields.typevoie) adresseParts.push(fields.typevoie);
    if (fields.nomvoie) adresseParts.push(fields.nomvoie);
    const adresse = adresseParts.join(' ') || '';
    
    return {
      id: record.recordid || `bodacc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tribunal: fields.tribunal || fields.nomgreffe || '',
      numero_parution: fields.parution || '',
      date_parution: fields.dateparution || '',
      numero_annonce: fields.numeroannonce || '',
      categorie: fields.typeavis_lib || fields.typeavis || '',
      sous_categorie: fields.familleavis_lib || fields.familleavis || '',
      libelle: fields.typeavis_lib || '',
      type: fields.publicationavis || '',
      denomination: fields.commercant || fields.denomination || 'Dénomination non spécifiée',
      adresse: adresse,
      code_postal: fields.cp || '',
      ville: fields.ville || '',
      departement: fields.departement_nom_officiel || fields.departement || '',
      region: fields.region_nom_officiel || fields.region || '',
      activite: fields.activite || '',
      capital: fields.capital || '',
      devise: 'EUR', // Par défaut EUR pour la France
      date_jugement: fields.datejugement || '',
      texte: this.extractTextFromJson(fields) || ''
    };
  }
  
  /**
   * Extrait le texte lisible depuis les champs JSON complexes
   */
  private static extractTextFromJson(fields: any): string {
    const textParts: string[] = [];
    
    // Extraire les informations des personnes
    if (fields.listepersonnes) {
      try {
        const personnes = JSON.parse(fields.listepersonnes);
        if (personnes.personne) {
          const p = personnes.personne;
          if (p.denomination) textParts.push(`Dénomination: ${p.denomination}`);
          if (p.formeJuridique) textParts.push(`Forme juridique: ${p.formeJuridique}`);
          if (p.numeroImmatriculation?.numeroIdentification) {
            textParts.push(`N° immatriculation: ${p.numeroImmatriculation.numeroIdentification}`);
          }
          if (p.adresseSiegeSocial) {
            const addr = p.adresseSiegeSocial;
            const addrParts = [addr.numeroVoie, addr.typeVoie, addr.nomVoie].filter(Boolean);
            if (addrParts.length > 0) {
              textParts.push(`Adresse: ${addrParts.join(' ')}, ${addr.codePostal} ${addr.ville}`);
            }
          }
        }
      } catch (e) {
        // Ignorer les erreurs de parsing JSON
      }
    }
    
    // Extraire les informations de dépôt
    if (fields.depot) {
      try {
        const depot = JSON.parse(fields.depot);
        if (depot.dateCloture) textParts.push(`Date de clôture: ${depot.dateCloture}`);
        if (depot.typeDepot) textParts.push(`Type de dépôt: ${depot.typeDepot}`);
      } catch (e) {
        // Ignorer les erreurs de parsing JSON
      }
    }
    
    return textParts.join('\n');
  }
}
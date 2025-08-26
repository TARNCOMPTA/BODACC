import { BodaccAnnouncement, SearchFilters, ApiResponse } from '../types/bodacc';

const BODACC_API_BASE = 'https://bodacc-datadila.opendatasoft.com/api/v2/catalog/datasets/annonces-commerciales';
const REQUEST_TIMEOUT = 15000; // 15 secondes

export class BodaccApiService {
  /**
   * Échappe les caractères spéciaux Lucene
   */
  private static escapeLucene(query: string): string {
    return query.replace(/([+\-!(){}[\]^"~*?:\\/])/g, '\\$1');
  }

  /**
   * Échappe les guillemets pour les filtres where
   */
  private static escapeWhereValue(value: string): string {
    return value.replace(/"/g, '\\"');
  }

  /**
   * Construit les paramètres de requête pour récupérer toutes les annonces avec filtres
   */
  private static buildQueryParams(filters: SearchFilters): URLSearchParams {
    const params = new URLSearchParams();
    
    // Pagination sécurisée
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));
    const page = Math.max(1, Number(filters.page) || 1);
    params.set('limit', String(limit));
    params.set('offset', String((page - 1) * limit));
    
    // Tri par date de parution décroissante
    const sortField = filters.sort?.trim() || '-dateparution';
    // Convertir le format de tri si nécessaire
    if (sortField.startsWith('-')) {
      params.set('order_by', `${sortField.substring(1)} desc`);
    } else {
      params.set('order_by', `${sortField} asc`);
    }
    
    // Construire la requête q avec tous les éléments
    let queryParts = [];
    
    // 1. Recherche textuelle
    const qText = (filters.query || '').trim();
    if (qText) {
      queryParts.push(this.escapeLucene(qText));
    }
    
    // 2. Filtres de dates - utiliser la syntaxe de plage
    const dateFrom = (filters.dateFrom || '').trim();
    const dateTo = (filters.dateTo || '').trim();
    
    if (dateFrom && dateTo) {
      queryParts.push(`dateparution:[${dateFrom} TO ${dateTo}]`);
    } else if (dateFrom) {
      queryParts.push(`dateparution:[${dateFrom} TO *]`);
    } else if (dateTo) {
      queryParts.push(`dateparution:[* TO ${dateTo}]`);
    }
    
    if (queryParts.length > 0) {
      params.set('q', queryParts.join(' AND '));
    }
    
    // 3. Filtres exacts avec where (échapper les guillemets)
    let whereConditions = [];
    
    if (filters.tribunal?.trim()) {
      whereConditions.push(`tribunal="${this.escapeWhereValue(filters.tribunal.trim())}"`);
    }
    
    if (filters.category?.trim()) {
      whereConditions.push(`typeavis_lib="${this.escapeWhereValue(filters.category.trim())}"`);
    }
    
    if (filters.subCategory?.trim()) {
      whereConditions.push(`familleavis_lib="${this.escapeWhereValue(filters.subCategory.trim())}"`);
    }
    
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
      const url = `${BODACC_API_BASE}/records?${params.toString()}`;
      
      // Log uniquement en développement
      if (process.env.NODE_ENV === 'development') {
        console.log('🌐 URL BODACC:', url);
      }
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Trop de requêtes simultanées. Veuillez patienter quelques instants avant de relancer la recherche.');
        }
        throw new Error(`Erreur API BODACC: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Logs de debug en développement uniquement
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Total résultats:', data.total_count);
        console.log('📋 Résultats retournés:', data.records?.length || 0);
        if (data.records?.[0]) {
          console.log('🔍 Champs disponibles:', Object.keys(data.records[0].fields || {}));
        }
      }
      
      // API v2 renvoie directement un tableau records
      const announcements = (data.records || []).map((record: any) => this.mapRecord(record));
      
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
      const url = `${BODACC_API_BASE}/facets/typeavis_lib`;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🏷️ URL Catégories:', url);
      }
      
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
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🏷️ Catégories récupérées:', data);
      }
      
      // Structure réelle de l'API v2 avec facet_groups
      if (data.facet_groups && data.facet_groups.length > 0) {
        const facetGroup = data.facet_groups[0];
        if (facetGroup.facets) {
          return facetGroup.facets
            .map((facet: any) => facet.name)
            .filter((name: string) => name && name.trim())
            .sort();
        }
      }
      
      return [];
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Erreur lors du chargement des catégories:', error);
      }
      
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
    
    return {
      id: record.recordid || record.id || `bodacc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      tribunal: fields.tribunal || '',
      numero_parution: fields.numeroparution || fields.parution || '',
      date_parution: fields.dateparution || '',
      numero_annonce: fields.numeroannonce || '',
      categorie: fields.typeavis_lib || fields.typeavis || '',
      sous_categorie: fields.familleavis_lib || fields.familleavis || '',
      libelle: fields.typeavis_lib || '',
      type: fields.publicationavis || fields.publicationavis_facette || '',
      denomination: fields.commercant || fields.denomination || 'Dénomination non spécifiée',
      adresse: fields.adresse || '',
      code_postal: fields.cp || '',
      ville: fields.ville || '',
      departement: fields.departement || '',
      region: fields.region || '',
      activite: fields.activite || '',
      capital: fields.capital || '',
      devise: 'EUR', // Par défaut EUR pour la France
      date_jugement: fields.datejugement || '',
      texte: fields.texte || fields.contenu || ''
    };
  }
}
import { BodaccAnnouncement, SearchFilters, ApiResponse } from '../types/bodacc';

const BODACC_API_BASE = 'https://bodacc-datadila.opendatasoft.com/api/records/1.0/search/';
const REQUEST_TIMEOUT = 15000; // 15 secondes

export class BodaccApiService {
  /**
   * Échappe les caractères spéciaux Lucene
   */
  private static escapeLucene(query: string): string {
    return query.replace(/([+\-!(){}[\]^"~*?:\\/])/g, '\\$1');
  }

  /**
   * Construit les paramètres de requête pour récupérer toutes les annonces avec filtres
   */
  private static buildQueryParams(filters: SearchFilters): URLSearchParams {
    const params = new URLSearchParams();
    
    // Dataset obligatoire
    params.set('dataset', 'annonces-commerciales');
    
    // Pagination sécurisée
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));
    const page = Math.max(1, Number(filters.page) || 1);
    params.set('rows', String(limit));
    params.set('start', String((page - 1) * limit));
    
    // Tri par date de parution décroissante
    const sortField = filters.sort?.trim() || '-dateparution';
    params.set('sort', sortField);
    
    // 1. Recherche textuelle dans q - amélioration pour les noms d'entreprise
    if (qText) {
      // Pour une recherche plus flexible sur les noms d'entreprise
      // On recherche dans plusieurs champs : commercant, denomination, etc.
      const searchTerms = qText.split(/\s+/).map(term => this.escapeLucene(term));
      
      if (searchTerms.length === 1) {
        // Recherche simple : utiliser des wildcards pour une correspondance partielle
        const term = searchTerms[0];
        params.set('q', `*${term}*`);
      } else {
        // Recherche multi-termes : tous les termes doivent être présents
        const multiTermQuery = searchTerms.map(term => `*${term}*`).join(' AND ');
        params.set('q', multiTermQuery);
      }
    }
    
    // 2. Filtres de dates - utiliser la syntaxe de plage dans un paramètre séparé si pas de recherche textuelle
    const dateFrom = (filters.dateFrom || '').trim();
    const dateTo = (filters.dateTo || '').trim();
    
    if ((dateFrom || dateTo) && !qText) {
      // Si pas de recherche textuelle, utiliser q pour les dates
      let dateQuery = '';
      if (dateFrom && dateTo) {
        dateQuery = `dateparution:[${dateFrom} TO ${dateTo}]`;
      } else if (dateFrom) {
        dateQuery = `dateparution:[${dateFrom} TO *]`;
      } else if (dateTo) {
        dateQuery = `dateparution:[* TO ${dateTo}]`;
      }
      params.set('q', dateQuery);
    } else if ((dateFrom || dateTo) && qText) {
      // Si recherche textuelle + dates, combiner dans q
      const currentQ = params.get('q') || '';
      let dateQuery = '';
      if (dateFrom && dateTo) {
        dateQuery = `dateparution:[${dateFrom} TO ${dateTo}]`;
      } else if (dateFrom) {
        dateQuery = `dateparution:[${dateFrom} TO *]`;
      } else if (dateTo) {
        dateQuery = `dateparution:[* TO ${dateTo}]`;
      }
      params.set('q', `${currentQ} AND ${dateQuery}`);
    }
    
    // 3. Filtres exacts avec refine.*
    if (queryParts.length > 0) {
      params.set('q', queryParts.join(' AND '));
    }
    
    // 3. Filtres exacts avec refine.*
    if (filters.tribunal?.trim()) {
      params.set('refine.tribunal', filters.tribunal.trim());
    }
    
    if (filters.category?.trim()) {
      params.set('refine.typeavis_lib', filters.category.trim());
    }
    
    if (filters.subCategory?.trim()) {
      params.set('refine.familleavis_lib', filters.subCategory.trim());
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
        console.log('📊 Total résultats:', data.nhits);
        console.log('📋 Résultats retournés:', data.records?.length || 0);
        if (data.records?.[0]) {
          console.log('🔍 Champs disponibles:', Object.keys(data.records[0].fields || {}));
        }
      }
      
      const announcements = (data.records || []).map((record: any) => this.mapRecord(record));
      
      return {
        total_count: data.nhits || 0,
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
      params.set('dataset', 'annonces-commerciales');
      params.set('facet', 'typeavis_lib');
      params.set('rows', '0'); // On ne veut que les facettes, pas les données
      
      const url = `${BODACC_API_BASE}?${params.toString()}`;
      
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
        console.log('🏷️ Catégories récupérées:', data.facet_groups);
      }
      
      // Extraire les catégories depuis les facettes
      const facetGroup = data.facet_groups?.find((group: any) => group.name === 'typeavis_lib');
      if (facetGroup?.facets) {
        return facetGroup.facets
          .map((facet: any) => facet.name)
          .filter((name: string) => name && name.trim())
          .sort();
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
   * Récupère les sous-catégories disponibles depuis l'API
   */
  static async getSubCategories(): Promise<string[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
      const params = new URLSearchParams();
      params.set('dataset', 'annonces-commerciales');
      params.set('facet', 'familleavis_lib');
      params.set('rows', '0'); // On ne veut que les facettes, pas les données
      
      const url = `${BODACC_API_BASE}?${params.toString()}`;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🏷️ URL Sous-catégories:', url);
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
        console.log('🏷️ Sous-catégories récupérées:', data.facet_groups);
      }
      
      // Extraire les sous-catégories depuis les facettes
      const facetGroup = data.facet_groups?.find((group: any) => group.name === 'familleavis_lib');
      if (facetGroup?.facets) {
        return facetGroup.facets
          .map((facet: any) => facet.name)
          .filter((name: string) => name && name.trim())
          .sort();
      }
      
      return [];
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Erreur lors du chargement des sous-catégories:', error);
      }
      
      // Retourner une liste par défaut en cas d'erreur
      return [
        'Procédures collectives',
        'Ventes et cessions',
        'Créations d\'entreprise',
        'Modifications statutaires',
        'Dissolutions'
      ];
    }
  }

  /**
   * Mappe un enregistrement de l'API vers notre type BodaccAnnouncement
   */
  private static mapRecord(record: any): BodaccAnnouncement {
    const fields = record.fields || {};
    
    return {
      id: record.recordid || `bodacc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
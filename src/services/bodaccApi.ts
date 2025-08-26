import { BodaccAnnouncement, SearchFilters, ApiResponse } from '../types/bodacc';

const BODACC_API_BASE = 'https://bodacc-datadila.opendatasoft.com/api/v2/catalog/datasets/annonces-commerciales/records';
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
    
    // Pagination sécurisée
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));
    const page = Math.max(1, Number(filters.page) || 1);
    params.set('limit', String(limit));
    params.set('offset', String((page - 1) * limit));
    
    // Tri par date de parution décroissante
    const sortField = filters.sort?.trim() || '-dateparution';
    params.set('order_by', sortField);
    
    // 1. Recherche textuelle dans q
    const qText = (filters.query || '').trim();
    if (qText) {
      params.set('q', this.escapeLucene(qText));
    }
    
    // 2. Filtres de dates - utiliser la syntaxe de plage dans q
    const dateFrom = (filters.dateFrom || '').trim();
    const dateTo = (filters.dateTo || '').trim();
    
    // Construire la requête avec plage de dates si nécessaire
    let queryParts = [];
    if (qText) {
      queryParts.push(this.escapeLucene(qText));
    }
    
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
    
    // 3. Filtres exacts avec refine.*
    if (filters.tribunal?.trim()) {
      params.set('where', `tribunal="${filters.tribunal.trim()}"`);
    }
    
    if (filters.category?.trim()) {
      const whereClause = params.get('where');
      const categoryFilter = `typeavis_lib="${filters.category.trim()}"`;
      if (whereClause) {
        params.set('where', `${whereClause} AND ${categoryFilter}`);
      } else {
        params.set('where', categoryFilter);
      }
    }
    
    if (filters.subCategory?.trim()) {
      const whereClause = params.get('where');
      const subCategoryFilter = `familleavis_lib="${filters.subCategory.trim()}"`;
      if (whereClause) {
        params.set('where', `${whereClause} AND ${subCategoryFilter}`);
      } else {
        params.set('where', subCategoryFilter);
      }
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
        console.log('📊 Total résultats:', data.total_count);
        console.log('📋 Résultats retournés:', data.results?.length || 0);
        if (data.results?.[0]) {
          console.log('🔍 Champs disponibles:', Object.keys(data.results[0].record.fields || {}));
        }
      }
      
      const announcements = (data.results || []).map((result: any) => this.mapRecord(result.record));
      
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
      
      const url = `https://bodacc-datadila.opendatasoft.com/api/v2/catalog/datasets/annonces-commerciales/facets/typeavis_lib?${params.toString()}`;
      
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
      if (data.facets) {
        return data.facets
          .map((facet: any) => facet.value)
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
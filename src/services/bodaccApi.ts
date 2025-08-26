import { BodaccAnnouncement, SearchFilters, ApiResponse } from '../types/bodacc';

const BODACC_API_BASE = 'https://bodacc-datadila.opendatasoft.com/api/v2/catalog/datasets/annonces-commerciales';
const REQUEST_TIMEOUT = 15000; // 15 secondes

// Mots réservés Lucene à échapper complètement
const LUCENE_RESERVED_WORDS = new Set(['AND', 'OR', 'NOT', 'TO']);

export class BodaccApiService {
  /**
   * Échappe complètement les caractères spéciaux Lucene et les mots réservés
   */
  private static escapeLucene(query: string): string {
    if (!query || typeof query !== 'string') return '';
    
    // Normaliser les espaces
    const normalized = query.trim().replace(/\s+/g, ' ');
    
    // Échapper tous les caractères spéciaux Lucene (regex complète avec opérateurs booléens)
    const escaped = normalized.replace(/([+\-!(){}[\]^"~*?:\\/&|])/g, '\\$1');
    
    // Traiter les mots réservés seulement s'ils ne sont pas déjà entre guillemets
    // et ne font pas partie d'une expression complexe
    return escaped.replace(/\b(AND|OR|NOT)\b/g, (match) => {
      // Vérifier si le mot est déjà entre guillemets ou échappé
      const beforeMatch = escaped.substring(0, escaped.indexOf(match));
      const afterMatch = escaped.substring(escaped.indexOf(match) + match.length);
      
      // Si déjà entre guillemets, ne pas modifier
      const openQuotes = (beforeMatch.match(/"/g) || []).length;
      const closeQuotes = (afterMatch.match(/"/g) || []).length;
      if (openQuotes % 2 === 1 && closeQuotes > 0) {
        return match; // Déjà entre guillemets
      }
      
      // Si précédé ou suivi d'un caractère spécial, ne pas modifier
      if (/[\\:]/.test(beforeMatch.slice(-1)) || /[\\:]/.test(afterMatch.charAt(0))) {
        return match; // Fait partie d'une expression field:value
      }
      
      return `"${match}"`;
    });
  }

  /**
   * Échappe complètement les valeurs pour les filtres where
   */
  private static escapeWhereValue(value: string): string {
    if (!value || typeof value !== 'string') return '';
    
    // Normaliser les espaces et échapper backslashes puis guillemets
    return value.trim()
      .replace(/\s+/g, ' ')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');
  }

  /**
   * Parse et normalise le champ de tri
   */
  private static parseSort(sort: string): string {
    if (!sort || typeof sort !== 'string') return 'dateparution desc';
    
    const trimmed = sort.trim();
    
    // Si déjà formaté avec desc/asc, le retourner tel quel
    if (trimmed.includes(' desc') || trimmed.includes(' asc')) {
      return trimmed;
    }
    
    // Gérer le format "-champ"
    if (trimmed.startsWith('-')) {
      const field = trimmed.substring(1);
      return `${field} desc`;
    }
    
    // Par défaut, tri ascendant
    return `${trimmed} asc`;
  }

  /**
   * Construit les paramètres de requête pour récupérer toutes les annonces avec filtres
   */
  private static buildQueryParams(filters: SearchFilters): URLSearchParams {
    // Garde contre filters undefined
    if (!filters || typeof filters !== 'object') {
      throw new Error('Filtres invalides');
    }

    const params = new URLSearchParams();
    
    // Pagination sécurisée
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));
    const page = Math.max(1, Number(filters.page) || 1);
    params.set('limit', String(limit));
    params.set('offset', String((page - 1) * limit));
    
    // Tri sécurisé
    const sortField = this.parseSort(filters.sort || '-dateparution');
    params.set('order_by', sortField);
    
    // Construire la requête q avec parenthésage approprié
    const queryParts: string[] = [];
    
    // 1. Recherche textuelle avec échappement sécurisé
    const qText = (filters.query || '').trim();
    if (qText) {
      queryParts.push(`(${this.escapeLucene(qText)})`);
    }
    
    // 2. Filtres de dates avec validation
    const dateFrom = (filters.dateFrom || '').trim();
    const dateTo = (filters.dateTo || '').trim();
    
    // Validation basique des dates
    const isValidDate = (dateStr: string): boolean => {
      return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    };
    
    if (dateFrom && dateTo && isValidDate(dateFrom) && isValidDate(dateTo)) {
      queryParts.push(`dateparution:[${dateFrom} TO ${dateTo}]`);
    } else if (dateFrom && isValidDate(dateFrom)) {
      queryParts.push(`dateparution:[${dateFrom} TO *]`);
    } else if (dateTo && isValidDate(dateTo)) {
      queryParts.push(`dateparution:[* TO ${dateTo}]`);
    }
    
    if (queryParts.length > 0) {
      params.set('q', queryParts.join(' AND '));
    }
    
    // 3. Filtres exacts avec where et échappement complet
    const whereConditions: string[] = [];
    
    const tribunal = (filters.tribunal || '').trim();
    if (tribunal) {
      whereConditions.push(`tribunal="${this.escapeWhereValue(tribunal)}"`);
    }
    
    const category = (filters.category || '').trim();
    if (category) {
      whereConditions.push(`typeavis_lib="${this.escapeWhereValue(category)}"`);
    }
    
    const subCategory = (filters.subCategory || '').trim();
    if (subCategory) {
      whereConditions.push(`familleavis_lib="${this.escapeWhereValue(subCategory)}"`);
    }
    
    if (whereConditions.length > 0) {
      // Parenthésage pour éviter les ambiguïtés
      params.set('where', `(${whereConditions.join(' AND ')})`);
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
      
      // Log sécurisé uniquement en développement
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
      
      // Validation de la structure de réponse
      if (!data || typeof data !== 'object') {
        throw new Error('Réponse API invalide');
      }
      
      // Logs de debug sécurisés en développement uniquement
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Total résultats:', data.total_count);
        console.log('📋 Résultats retournés:', Array.isArray(data.records) ? data.records.length : 0);
        
        // Log sécurisé des champs disponibles
        if (Array.isArray(data.records) && data.records[0] && 
            typeof data.records[0] === 'object' && data.records[0].fields &&
            typeof data.records[0].fields === 'object') {
          console.log('🔍 Champs disponibles:', Object.keys(data.records[0].fields));
        }
      }
      
      // API v2 renvoie directement un tableau records
      const announcements = Array.isArray(data.records) 
        ? data.records.map((record: any) => this.mapRecord(record))
        : [];
      
      return {
        total_count: typeof data.total_count === 'number' ? data.total_count : 0,
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
   * Récupère les catégories disponibles depuis l'API avec gestion robuste des facettes
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
      
      // Validation et parsing robuste des facettes
      if (!data || typeof data !== 'object') {
        throw new Error('Structure de facettes invalide');
      }
      
      const categories: string[] = [];
      
      // Gestion de plusieurs structures possibles
      if (Array.isArray(data.facet_groups)) {
        // Structure avec facet_groups
        for (const group of data.facet_groups) {
          if (group && typeof group === 'object' && Array.isArray(group.facets)) {
            for (const facet of group.facets) {
              if (facet && typeof facet === 'object') {
                // Essayer plusieurs propriétés possibles
                const value = facet.name || facet.value || facet.label;
                if (typeof value === 'string' && value.trim()) {
                  categories.push(value.trim());
                }
              }
            }
          }
        }
      } else if (Array.isArray(data.facets)) {
        // Structure directe avec facets
        for (const facet of data.facets) {
          if (facet && typeof facet === 'object') {
            const value = facet.name || facet.value || facet.label;
            if (typeof value === 'string' && value.trim()) {
              categories.push(value.trim());
            }
          }
        }
      }
      
      // Dédoublonner et trier
      const uniqueCategories = [...new Set(categories)].sort();
      
      if (uniqueCategories.length === 0) {
        throw new Error('Aucune catégorie trouvée');
      }
      
      return uniqueCategories;
      
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
   * Mappe un enregistrement de l'API vers notre type BodaccAnnouncement avec typage sécurisé
   */
  private static mapRecord(record: any): BodaccAnnouncement {
    // Validation de base
    if (!record || typeof record !== 'object') {
      throw new Error('Enregistrement invalide');
    }
    
    const fields = record.fields || {};
    
    // Fonction helper pour convertir en string de manière sécurisée
    const toString = (value: any): string => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'number') return String(value);
      return String(value);
    };
    
    // ID avec fallbacks multiples
    const id = record.recordid || record.id || record.record_id || 
              `bodacc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Dénomination avec fallbacks étendus
    const denomination = toString(
      fields.commercant || 
      fields.denomination || 
      fields.nom_entreprise || 
      fields.raison_sociale || 
      fields.enseigne ||
      fields.nom ||
      fields.societe ||
      'Dénomination non spécifiée'
    );
    
    // Devise avec validation
    let devise = toString(fields.devise || 'EUR');
    if (!devise || devise.length > 10) { // Validation basique
      devise = 'EUR';
    }
    
    return {
      id: toString(id),
      tribunal: toString(fields.tribunal),
      numero_parution: toString(fields.numeroparution || fields.parution),
      date_parution: toString(fields.dateparution),
      numero_annonce: toString(fields.numeroannonce),
      categorie: toString(fields.typeavis_lib || fields.typeavis),
      sous_categorie: toString(fields.familleavis_lib || fields.familleavis),
      libelle: toString(fields.typeavis_lib || fields.libelle),
      type: toString(fields.publicationavis || fields.publicationavis_facette),
      denomination,
      adresse: toString(fields.adresse),
      code_postal: toString(fields.cp || fields.code_postal),
      ville: toString(fields.ville),
      departement: toString(fields.departement),
      region: toString(fields.region),
      activite: toString(fields.activite),
      capital: toString(fields.capital),
      devise,
      date_jugement: toString(fields.datejugement),
      texte: toString(fields.texte || fields.contenu)
    };
  }
}
// bodaccApi.ts

import { BodaccAnnouncement, SearchFilters, ApiResponse, DepartmentData } from '../types/bodacc';
import { StatisticsFilters, StatisticsData, StatisticsPeriod } from '../types/bodacc';

const ODS_EXPLORE_BASE = 'https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales';
const ODS_RECORDS_BASE = 'https://bodacc-datadila.opendatasoft.com/api/v2/catalog/datasets/annonces-commerciales/records';
const REQUEST_TIMEOUT = 15000; // 15s

// --- Paramétrage produit ---
// Active le filtre "créations" (immatriculations/constitutions) pour la météo économique
const CREATION_FILTER_ENABLED = true;
const CREATION_FILTER_CLAUSE = `typeavis_lib IN ('Immatriculation','Avis de constitution')`;
// Ajuste les seuils de météo
const POSITIVE_THRESHOLD = 10;  // > +10% => sunny
const NEGATIVE_THRESHOLD = -10; // < -10% => rainy
// Logs détaillés
const DEBUG = true;

export class BodaccApiService {
  // --- Utils ---

  private static escapeSqlValue(value: string): string {
    // Opendatasoft ODSQL : échappement par doublement de la quote
    return value.replace(/'/g, "''");
  }

  private static fmt(d: Date) {
    // YYYY-MM-DD en local (évite les décalages UTC)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  private static assertValidRange(from: string, to: string) {
    if (new Date(from) > new Date(to)) {
      throw new Error(`Plage de dates invalide: ${from} > ${to}`);
    }
  }

  // --- Génération & formatage des périodes ---

  private static generatePeriods(dateFrom: string, dateTo: string, periodicity: 'month' | 'quarter' | 'year'): string[] {
    const periods: string[] = [];
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    let current = new Date(start);

    while (current <= end) {
      let periodKey: string;
      switch (periodicity) {
        case 'month':
          periodKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
          current.setMonth(current.getMonth() + 1);
          break;
        case 'quarter': {
          const q = Math.floor(current.getMonth() / 3) + 1;
          periodKey = `${current.getFullYear()}-T${q}`;
          current.setMonth(current.getMonth() + 3);
          break;
        }
        case 'year':
          periodKey = current.getFullYear().toString();
          current.setFullYear(current.getFullYear() + 1);
          break;
      }
      periods.push(periodKey);
    }
    return periods;
  }

  private static formatPeriodName(period: string, periodicity: 'month' | 'quarter' | 'year'): string {
    switch (periodicity) {
      case 'month': {
        const [year, month] = period.split('-');
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      }
      case 'quarter': {
        const [y, q] = period.split('-T');
        return `T${q} ${y}`;
      }
      case 'year':
        return period;
      default:
        return period;
    }
  }

  private static getPeriodDates(period: string, periodicity: 'month' | 'quarter' | 'year'): { startDate: string; endDate: string } {
    switch (periodicity) {
      case 'month': {
        const [ys, ms] = period.split('-').map(Number);
        const start = new Date(ys, ms - 1, 1);
        const end = new Date(ys, ms, 0);
        return { startDate: this.fmt(start), endDate: this.fmt(end) };
      }
      case 'quarter': {
        const [yStr, qStr] = period.split('-T');
        const y = Number(yStr), q = Number(qStr);
        const start = new Date(y, (q - 1) * 3, 1);
        const end = new Date(y, q * 3, 0);
        return { startDate: this.fmt(start), endDate: this.fmt(end) };
      }
      case 'year': {
        return { startDate: `${period}-01-01`, endDate: `${period}-12-31` };
      }
      default:
        throw new Error(`Périodicité non supportée: ${periodicity}`);
    }
  }

  // --- Stats par période ---

  static async getStatistics(filters: StatisticsFilters): Promise<StatisticsData> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT * 2);
    try {
      const periods = this.generatePeriods(filters.dateFrom, filters.dateTo, filters.periodicity);
      const promises = periods.map(p => this.getStatisticsForPeriod(filters, p, controller.signal));
      const statisticsPeriods = await Promise.all(promises);

      // Agrégations globales
      let totalCount = 0;
      const globalCategories: Record<string, number> = {};
      const globalDepartments: Record<string, number> = {};
      const globalSubCategories: Record<string, number> = {};

      for (const periodData of statisticsPeriods) {
        totalCount += periodData.count;
        for (const [k, v] of Object.entries(periodData.categories)) globalCategories[k] = (globalCategories[k] || 0) + v;
        for (const [k, v] of Object.entries(periodData.departments)) globalDepartments[k] = (globalDepartments[k] || 0) + v;
        for (const [k, v] of Object.entries(periodData.subCategories)) globalSubCategories[k] = (globalSubCategories[k] || 0) + v;
      }

      clearTimeout(timeoutId);
      return {
        periods: statisticsPeriods,
        totalCount,
        averagePerPeriod: statisticsPeriods.length ? totalCount / statisticsPeriods.length : 0
      };
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof Error && e.name === 'AbortError') {
        throw new Error('La requête a pris trop de temps. Veuillez réessayer.');
      }
      throw e instanceof Error ? e : new Error('Erreur inattendue lors du chargement des statistiques BODACC. Veuillez réessayer.');
    }
  }

  private static async getStatisticsForPeriod(
    filters: StatisticsFilters,
    period: string,
    signal: AbortSignal
  ): Promise<StatisticsPeriod> {
    const { startDate, endDate } = this.getPeriodDates(period, filters.periodicity);
    this.assertValidRange(startDate, endDate);

    const params = new URLSearchParams();
    params.set('limit', '0');
    params.append('facet', 'typeavis_lib');
    params.append('facet', 'familleavis_lib');
    params.append('facet', 'departement_nom_officiel');

    const where: string[] = [
      `dateparution >= date'${startDate}'`,
      `dateparution <= date'${endDate}'`
    ];
    if (filters.departement?.trim()) where.push(`numerodepartement = '${this.escapeSqlValue(filters.departement.trim())}'`);
    if (filters.category?.trim()) where.push(`typeavis_lib = '${this.escapeSqlValue(filters.category.trim())}'`);
    if (filters.subCategory?.trim()) where.push(`familleavis_lib = '${this.escapeSqlValue(filters.subCategory.trim())}'`);

    params.set('where', where.join(' AND '));
    const url = `${ODS_RECORDS_BASE}?${params.toString()}`;
    if (DEBUG) console.log('📊 URL stats (records+facets):', url);

    const res = await fetch(url, { signal, headers: { Accept: 'application/json' }});
    if (!res.ok) throw new Error(`Erreur API BODACC: ${res.status} ${res.statusText}`);
    const data = await res.json();

    const categories: Record<string, number> = {};
    const subCategories: Record<string, number> = {};
    const departments: Record<string, number> = {};

    if (Array.isArray(data.facet_groups)) {
      for (const group of data.facet_groups) {
        if (group.name === 'typeavis_lib' && group.facets) {
          for (const f of group.facets) categories[f.name || f.value] = f.count;
        }
        if (group.name === 'familleavis_lib' && group.facets) {
          for (const f of group.facets) subCategories[f.name || f.value] = f.count;
        }
        if (group.name === 'departement_nom_officiel' && group.facets) {
          for (const f of group.facets) departments[f.name || f.value] = f.count;
        }
      }
    }

    return {
      period: this.formatPeriodName(period, filters.periodicity),
      count: data.total_count || 0,
      categories,
      subCategories,
      departments
    };
  }

  // --- Météo économique ---

  static async getEconomicWeatherData(): Promise<DepartmentData[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      // Mois de référence = décembre 2024 ; comparaison = novembre 2024
      const now = new Date();
      
      // Référence : décembre 2024 (dernier mois complet avec des données)
      const refStart = new Date(2024, 11, 1); // 1er décembre 2024
      const refEnd = new Date(2024, 11, 31);  // 31 décembre 2024
      
      // Comparaison : novembre 2024
      const cmpStart = new Date(2024, 10, 1);  // 1er novembre 2024
      const cmpEnd = new Date(2024, 10, 30);   // 30 novembre 2024

      const refFrom = this.fmt(refStart), refTo = this.fmt(refEnd);
      const cmpFrom = this.fmt(cmpStart), cmpTo = this.fmt(cmpEnd);

      if (DEBUG) {
        console.log(`📅 Référence: ${refFrom} → ${refTo}`);
        console.log(`📅 Comparaison: ${cmpFrom} → ${cmpTo}`);
      }

      const [refData, cmpData] = await Promise.all([
        this.getDepartmentCreations(refFrom, refTo, controller.signal),
        this.getDepartmentCreations(cmpFrom, cmpTo, controller.signal)
      ]);

      clearTimeout(timeoutId);

      const deps = this.getDepartmentsList();
      return deps.map(d => {
        const current = refData[d.code] || 0;
        const previous = cmpData[d.code] || 0;
        let evolution = 0;
        if (previous > 0) evolution = ((current - previous) / previous) * 100;
        else if (current > 0) evolution = 100;

        let weather: 'sunny' | 'cloudy' | 'rainy';
        if (evolution > POSITIVE_THRESHOLD) weather = 'sunny';
        else if (evolution < NEGATIVE_THRESHOLD) weather = 'rainy';
        else weather = 'cloudy';

        return {
          code: d.code,
          name: d.name,
          creations: current,
          previousCreations: previous,
          evolution,
          weather
        };
      });
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof Error && e.name === 'AbortError') {
        throw new Error('La requête a pris trop de temps. Veuillez réessayer.');
      }
      throw e instanceof Error ? e : new Error('Erreur lors du chargement des données météo économique.');
    }
  }

  private static async getDepartmentCreations(dateFrom: string, dateTo: string, signal: AbortSignal): Promise<Record<string, number>> {
    this.assertValidRange(dateFrom, dateTo);
    const clauses = [
      `dateparution >= date'${dateFrom}'`,
      `dateparution <= date'${dateTo}'`
    ];
    if (CREATION_FILTER_ENABLED) {
      clauses.push(CREATION_FILTER_CLAUSE);
    }
    const where = clauses.join(' AND ');

    const params = new URLSearchParams();
    params.set('select', 'numerodepartement, count(*) as count');
    params.set('group_by', 'numerodepartement');
    params.set('where', where);

    const url = `${ODS_EXPLORE_BASE}/aggregates?${params.toString()}`;
    if (DEBUG) console.log('🌐 URL aggregates (v2.1):', url);

    const res = await fetch(url, { signal, headers: { Accept: 'application/json' }});
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Erreur API BODACC aggregates: ${res.status} ${res.statusText} - ${t}`);
    }
    const data = await res.json();

    const out: Record<string, number> = {};
    if (Array.isArray(data.results)) {
      for (const row of data.results) {
        const code = row.numerodepartement;
        const count = row.count ?? 0;
        if (code != null) out[code] = count;
      }
    }
    if (DEBUG) console.log('📈 Résultat départements:', out);
    return out;
  }

  // --- Recherche d'annonces ---

  private static buildQueryParams(filters: SearchFilters): URLSearchParams {
    const params = new URLSearchParams();

    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const page = Math.max(1, filters.page || 1);
    const offset = Math.max(0, (page - 1) * limit);

    params.set('limit', String(limit));
    params.set('offset', String(offset));

    if (filters.sort) params.set('order_by', filters.sort);

    const where: string[] = [];
    if (filters.query?.trim()) {
      const q = this.escapeSqlValue(filters.query.trim());
      where.push(`(commercant LIKE '%${q}%' OR registre LIKE '%${q}%')`);
    }
    if (filters.departement?.trim()) where.push(`numerodepartement = '${this.escapeSqlValue(filters.departement.trim())}'`);
    if (filters.category?.trim()) where.push(`typeavis_lib = '${this.escapeSqlValue(filters.category.trim())}'`);
    if (filters.subCategory?.trim()) where.push(`familleavis_lib = '${this.escapeSqlValue(filters.subCategory.trim())}'`);
    if (filters.dateFrom?.trim()) where.push(`dateparution >= date'${filters.dateFrom}'`);
    if (filters.dateTo?.trim()) where.push(`dateparution <= date'${filters.dateTo}'`);

    if (where.length) params.set('where', where.join(' AND '));
    return params;
  }

  static async getAnnouncements(filters: SearchFilters): Promise<ApiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const params = this.buildQueryParams(filters);
      const url = `${ODS_RECORDS_BASE}?${params.toString()}`;

      if (DEBUG) {
        console.log('🌐 URL BODACC:', url);
        console.log('📋 Paramètres:', Object.fromEntries(params));
      }

      const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' }});
      if (DEBUG) {
        console.log('📡 Status:', res.status);
        console.log('📡 Headers:', Object.fromEntries(res.headers as any));
      }

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 429) {
          throw new Error('Trop de requêtes simultanées. Veuillez patienter quelques instants avant de relancer la recherche.');
        }
        throw new Error(`Erreur API BODACC: ${res.status} ${res.statusText} - ${errorText}`);
      }

      const data = await res.json();
      if (DEBUG) {
        console.log('📊 Total résultats:', data.total_count);
        console.log('📋 Résultats retournés:', data.records?.length || 0);
        if (data.records?.[0]?.record?.fields) {
          console.log('🔍 Champs dispo:', Object.keys(data.records[0].record.fields));
        }
      }

      const announcements = (data.records || []).map((r: any) => this.mapRecord(r.record));
      return { total_count: data.total_count || 0, results: announcements };
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof Error && e.name === 'AbortError') {
        throw new Error('La requête a pris trop de temps. Veuillez réessayer.');
      }
      throw e instanceof Error ? e : new Error('Erreur inattendue lors du chargement des annonces BODACC. Veuillez réessayer.');
    }
  }

  // --- Catégories ---

  static async getCategories(): Promise<string[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      // Essai via endpoint facets
      const url = `${ODS_EXPLORE_BASE.replace('/explore/v2.1', '/v2')}/facets/typeavis_lib`;
      if (DEBUG) console.log('🏷️ URL Catégories:', url);

      const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' }});
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.buckets)) {
          return data.buckets
            .map((b: any) => b.value ?? b.name)
            .filter((x: string) => x && x.trim())
            .sort();
        }
        if (Array.isArray(data.facets)) {
          return data.facets
            .map((f: any) => f.value ?? f.name)
            .filter((x: string) => x && x.trim())
            .sort();
        }
      }

      // Fallback via records + facet_groups
      return await this.getCategoriesFromRecords();
    } catch {
      clearTimeout(timeoutId);
      return await this.getCategoriesFromRecords();
    }
  }

  private static async getCategoriesFromRecords(): Promise<string[]> {
    const params = new URLSearchParams();
    params.set('limit', '0');
    params.append('facet', 'typeavis_lib');

    const url = `${ODS_RECORDS_BASE}?${params.toString()}`;
    if (DEBUG) console.log('🏷️ URL Catégories (records):', url);

    const res = await fetch(url, { headers: { Accept: 'application/json' }});
    if (!res.ok) {
      // liste par défaut
      return [
        'Avis de constitution',
        'Modification',
        'Dissolution',
        'Clôture de liquidation',
        'Vente de fonds de commerce',
        'Location-gérance',
        'Procédure collective',
        'Immatriculation',
        'Radiation'
      ];
    }
    const data = await res.json();

    if (Array.isArray(data.facet_groups)) {
      const g = data.facet_groups.find((x: any) => x.name === 'typeavis_lib');
      if (g?.facets) {
        return g.facets
          .map((f: any) => f.name || f.value)
          .filter((x: string) => x && x.trim())
          .sort();
      }
    }
    // autres structures possibles
    if (data.parameters?.facets?.typeavis_lib) {
      return data.parameters.facets.typeavis_lib
        .map((f: any) => f.name || f.value || f)
        .filter((x: string) => x && x.trim())
        .sort();
    }
    if (Array.isArray(data.facets)) {
      return data.facets
        .map((f: any) => f.name || f.value)
        .filter((x: string) => x && x.trim())
        .sort();
    }
    if (Array.isArray(data.typeavis_lib)) {
      return data.typeavis_lib
        .map((f: any) => f.name || f.value || f)
        .filter((x: string) => x && x.trim())
        .sort();
    }

    // défaut
    return [
      'Avis de constitution',
      'Modification',
      'Dissolution',
      'Clôture de liquidation',
      'Vente de fonds de commerce',
      'Location-gérance',
      'Procédure collective',
      'Immatriculation',
      'Radiation'
    ];
  }

  // --- Mapping des enregistrements ---

  private static mapRecord(record: any): BodaccAnnouncement {
    const fields = record?.fields || {};
    const adresseParts: string[] = [];
    if (fields.numerovoie) adresseParts.push(fields.numerovoie);
    if (fields.typevoie) adresseParts.push(fields.typevoie);
    if (fields.nomvoie) adresseParts.push(fields.nomvoie);
    const adresse = adresseParts.join(' ') || '';

    return {
      id: record.recordid || `bodacc-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      tribunal: fields.tribunal || fields.nomgreffe || '',
      numero_parution: fields.parution || '',
      date_parution: fields.dateparution || '',
      numero_annonce: fields.numeroannonce || '',
      categorie: fields.typeavis_lib || fields.typeavis || '',
      sous_categorie: fields.familleavis_lib || fields.familleavis || '',
      libelle: fields.typeavis_lib || '',
      type: fields.publicationavis || '',
      denomination: fields.commercant || fields.denomination || 'Dénomination non spécifiée',
      adresse,
      code_postal: fields.cp || '',
      ville: fields.ville || '',
      departement: fields.departement_nom_officiel || fields.departement || '',
      region: fields.region_nom_officiel || fields.region || '',
      activite: fields.activite || '',
      capital: fields.capital || '',
      devise: 'EUR',
      date_jugement: fields.datejugement || '',
      texte: this.extractTextFromJson(fields) || ''
    };
  }

  private static extractTextFromJson(fields: any): string {
    const textParts: string[] = [];
    // personnes
    if (fields.listepersonnes) {
      try {
        const personnes = JSON.parse(fields.listepersonnes);
        const p = personnes.personne;
        if (p) {
          if (p.denomination) textParts.push(`Dénomination: ${p.denomination}`);
          if (p.formeJuridique) textParts.push(`Forme juridique: ${p.formeJuridique}`);
          if (p.numeroImmatriculation?.numeroIdentification) {
            textParts.push(`N° immatriculation: ${p.numeroImmatriculation.numeroIdentification}`);
          }
          if (p.adresseSiegeSocial) {
            const a = p.adresseSiegeSocial;
            const ap = [a.numeroVoie, a.typeVoie, a.nomVoie].filter(Boolean);
            if (ap.length) textParts.push(`Adresse: ${ap.join(' ')}, ${a.codePostal} ${a.ville}`);
          }
        }
      } catch { /* ignore */ }
    }
    // dépôt
    if (fields.depot) {
      try {
        const depot = JSON.parse(fields.depot);
        if (depot.dateCloture) textParts.push(`Date de clôture: ${depot.dateCloture}`);
        if (depot.typeDepot) textParts.push(`Type de dépôt: ${depot.typeDepot}`);
      } catch { /* ignore */ }
    }
    return textParts.join('\n');
  }

  // --- Référentiel départements ---

  private static getDepartmentsList() {
    return [
      { code: '01', name: 'Ain' }, { code: '02', name: 'Aisne' }, { code: '03', name: 'Allier' },
      { code: '04', name: 'Alpes-de-Haute-Provence' }, { code: '05', name: 'Hautes-Alpes' },
      { code: '06', name: 'Alpes-Maritimes' }, { code: '07', name: 'Ardèche' }, { code: '08', name: 'Ardennes' },
      { code: '09', name: 'Ariège' }, { code: '10', name: 'Aube' }, { code: '11', name: 'Aude' },
      { code: '12', name: 'Aveyron' }, { code: '13', name: 'Bouches-du-Rhône' }, { code: '14', name: 'Calvados' },
      { code: '15', name: 'Cantal' }, { code: '16', name: 'Charente' }, { code: '17', name: 'Charente-Maritime' },
      { code: '18', name: 'Cher' }, { code: '19', name: 'Corrèze' }, { code: '21', name: 'Côte-d\'Or' },
      { code: '22', name: 'Côtes-d\'Armor' }, { code: '23', name: 'Creuse' }, { code: '24', name: 'Dordogne' },
      { code: '25', name: 'Doubs' }, { code: '26', name: 'Drôme' }, { code: '27', name: 'Eure' },
      { code: '28', name: 'Eure-et-Loir' }, { code: '29', name: 'Finistère' }, { code: '2A', name: 'Corse-du-Sud' },
      { code: '2B', name: 'Haute-Corse' }, { code: '30', name: 'Gard' }, { code: '31', name: 'Haute-Garonne' },
      { code: '32', name: 'Gers' }, { code: '33', name: 'Gironde' }, { code: '34', name: 'Hérault' },
      { code: '35', name: 'Ille-et-Vilaine' }, { code: '36', name: 'Indre' }, { code: '37', name: 'Indre-et-Loire' },
      { code: '38', name: 'Isère' }, { code: '39', name: 'Jura' }, { code: '40', name: 'Landes' },
      { code: '41', name: 'Loir-et-Cher' }, { code: '42', name: 'Loire' }, { code: '43', name: 'Haute-Loire' },
      { code: '44', name: 'Loire-Atlantique' }, { code: '45', name: 'Loiret' }, { code: '46', name: 'Lot' },
      { code: '47', name: 'Lot-et-Garonne' }, { code: '48', name: 'Lozère' }, { code: '49', name: 'Maine-et-Loire' },
      { code: '50', name: 'Manche' }, { code: '51', name: 'Marne' }, { code: '52', name: 'Haute-Marne' },
      { code: '53', name: 'Mayenne' }, { code: '54', name: 'Meurthe-et-Moselle' }, { code: '55', name: 'Meuse' },
      { code: '56', name: 'Morbihan' }, { code: '57', name: 'Moselle' }, { code: '58', name: 'Nièvre' },
      { code: '59', name: 'Nord' }, { code: '60', name: 'Oise' }, { code: '61', name: 'Orne' },
      { code: '62', name: 'Pas-de-Calais' }, { code: '63', name: 'Puy-de-Dôme' }, { code: '64', name: 'Pyrénées-Atlantiques' },
      { code: '65', name: 'Hautes-Pyrénées' }, { code: '66', name: 'Pyrénées-Orientales' }, { code: '67', name: 'Bas-Rhin' },
      { code: '68', name: 'Haut-Rhin' }, { code: '69', name: 'Rhône' }, { code: '70', name: 'Haute-Saône' },
      { code: '71', name: 'Saône-et-Loire' }, { code: '72', name: 'Sarthe' }, { code: '73', name: 'Savoie' },
      { code: '74', name: 'Haute-Savoie' }, { code: '75', name: 'Paris' }, { code: '76', name: 'Seine-Maritime' },
      { code: '77', name: 'Seine-et-Marne' }, { code: '78', name: 'Yvelines' }, { code: '79', name: 'Deux-Sèvres' },
      { code: '80', name: 'Somme' }, { code: '81', name: 'Tarn' }, { code: '82', name: 'Tarn-et-Garonne' },
      { code: '83', name: 'Var' }, { code: '84', name: 'Vaucluse' }, { code: '85', name: 'Vendée' },
      { code: '86', name: 'Vienne' }, { code: '87', name: 'Haute-Vienne' }, { code: '88', name: 'Vosges' },
      { code: '89', name: 'Yonne' }, { code: '90', name: 'Territoire de Belfort' }, { code: '91', name: 'Essonne' },
      { code: '92', name: 'Hauts-de-Seine' }, { code: '93', name: 'Seine-Saint-Denis' }, { code: '94', name: 'Val-de-Marne' },
      { code: '95', name: 'Val-d\'Oise' }, { code: '971', name: 'Guadeloupe' }, { code: '972', name: 'Martinique' },
      { code: '973', name: 'Guyane' }, { code: '974', name: 'La Réunion' }, { code: '976', name: 'Mayotte' }
    ];
  }
}
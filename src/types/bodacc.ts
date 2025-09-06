export interface BodaccAnnouncement {
  id: string;
  tribunal: string;
  numero_parution: string;
  date_parution: string;
  numero_annonce: string;
  categorie: string;
  sous_categorie: string;
  libelle: string;
  type: string;
  denomination: string;
  adresse: string;
  code_postal: string;
  ville: string;
  departement: string;
  region: string;
  activite: string;
  capital: string;
  devise: string;
  date_jugement?: string;
  texte: string;
}

export type BodaccCategory = 'Avis initial' | 'Avis rectificatif' | 'Avis d\'annulation';

export type BodaccFamily =
  | 'Dépôts des comptes'
  | 'Modifications diverses'
  | 'Créations'
  | 'Radiations'
  | 'Procédures collectives'
  | 'Ventes et cessions'
  | 'Immatriculations'
  | 'Annonces diverses'
  | 'Procédures de conciliation'
  | 'Procédures de rétablissement professionnel';

export interface SearchFilters {
  query: string;
  departement: string;
  category: string;
  subCategory: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  limit: number;
  sort?: string;
}

export interface StatisticsFilters {
  departement: string;
  category: string;
  subCategory: string;
  dateFrom: string;
  dateTo: string;
  periodicity: 'month' | 'quarter' | 'year';
}

export interface StatisticsPeriod {
  period: string;
  count: number;
  categories: Record<string, number>;
  departments: Record<string, number>;
  subCategories: Record<string, number>;
}

export interface StatisticsData {
  periods: StatisticsPeriod[];
  totalCount: number;
  averagePerPeriod: number;
}

export interface DepartmentData {
  code: string;
  name: string;
  creations: number;
  previousCreations: number;
  evolution: number;
  weather: 'sunny' | 'cloudy' | 'rainy';
}

export interface ApiResponse {
  total_count: number;
  results: BodaccAnnouncement[];
}
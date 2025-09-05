import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { SearchFilters } from '../types/bodacc';
import { useBodaccCategories } from '../hooks/useBodaccCategories';

// Liste des départements français
const DEPARTEMENTS_LIST = [
  { code: '', name: 'Tous les départements' },
  { code: '01', name: '01 - Ain' },
  { code: '02', name: '02 - Aisne' },
  { code: '03', name: '03 - Allier' },
  { code: '04', name: '04 - Alpes-de-Haute-Provence' },
  { code: '05', name: '05 - Hautes-Alpes' },
  { code: '06', name: '06 - Alpes-Maritimes' },
  { code: '07', name: '07 - Ardèche' },
  { code: '08', name: '08 - Ardennes' },
  { code: '09', name: '09 - Ariège' },
  { code: '10', name: '10 - Aube' },
  { code: '11', name: '11 - Aude' },
  { code: '12', name: '12 - Aveyron' },
  { code: '13', name: '13 - Bouches-du-Rhône' },
  { code: '14', name: '14 - Calvados' },
  { code: '15', name: '15 - Cantal' },
  { code: '16', name: '16 - Charente' },
  { code: '17', name: '17 - Charente-Maritime' },
  { code: '18', name: '18 - Cher' },
  { code: '19', name: '19 - Corrèze' },
  { code: '21', name: '21 - Côte-d\'Or' },
  { code: '22', name: '22 - Côtes-d\'Armor' },
  { code: '23', name: '23 - Creuse' },
  { code: '24', name: '24 - Dordogne' },
  { code: '25', name: '25 - Doubs' },
  { code: '26', name: '26 - Drôme' },
  { code: '27', name: '27 - Eure' },
  { code: '28', name: '28 - Eure-et-Loir' },
  { code: '29', name: '29 - Finistère' },
  { code: '2A', name: '2A - Corse-du-Sud' },
  { code: '2B', name: '2B - Haute-Corse' },
  { code: '30', name: '30 - Gard' },
  { code: '31', name: '31 - Haute-Garonne' },
  { code: '32', name: '32 - Gers' },
  { code: '33', name: '33 - Gironde' },
  { code: '34', name: '34 - Hérault' },
  { code: '35', name: '35 - Ille-et-Vilaine' },
  { code: '36', name: '36 - Indre' },
  { code: '37', name: '37 - Indre-et-Loire' },
  { code: '38', name: '38 - Isère' },
  { code: '39', name: '39 - Jura' },
  { code: '40', name: '40 - Landes' },
  { code: '41', name: '41 - Loir-et-Cher' },
  { code: '42', name: '42 - Loire' },
  { code: '43', name: '43 - Haute-Loire' },
  { code: '44', name: '44 - Loire-Atlantique' },
  { code: '45', name: '45 - Loiret' },
  { code: '46', name: '46 - Lot' },
  { code: '47', name: '47 - Lot-et-Garonne' },
  { code: '48', name: '48 - Lozère' },
  { code: '49', name: '49 - Maine-et-Loire' },
  { code: '50', name: '50 - Manche' },
  { code: '51', name: '51 - Marne' },
  { code: '52', name: '52 - Haute-Marne' },
  { code: '53', name: '53 - Mayenne' },
  { code: '54', name: '54 - Meurthe-et-Moselle' },
  { code: '55', name: '55 - Meuse' },
  { code: '56', name: '56 - Morbihan' },
  { code: '57', name: '57 - Moselle' },
  { code: '58', name: '58 - Nièvre' },
  { code: '59', name: '59 - Nord' },
  { code: '60', name: '60 - Oise' },
  { code: '61', name: '61 - Orne' },
  { code: '62', name: '62 - Pas-de-Calais' },
  { code: '63', name: '63 - Puy-de-Dôme' },
  { code: '64', name: '64 - Pyrénées-Atlantiques' },
  { code: '65', name: '65 - Hautes-Pyrénées' },
  { code: '66', name: '66 - Pyrénées-Orientales' },
  { code: '67', name: '67 - Bas-Rhin' },
  { code: '68', name: '68 - Haut-Rhin' },
  { code: '69', name: '69 - Rhône' },
  { code: '70', name: '70 - Haute-Saône' },
  { code: '71', name: '71 - Saône-et-Loire' },
  { code: '72', name: '72 - Sarthe' },
  { code: '73', name: '73 - Savoie' },
  { code: '74', name: '74 - Haute-Savoie' },
  { code: '75', name: '75 - Paris' },
  { code: '76', name: '76 - Seine-Maritime' },
  { code: '77', name: '77 - Seine-et-Marne' },
  { code: '78', name: '78 - Yvelines' },
  { code: '79', name: '79 - Deux-Sèvres' },
  { code: '80', name: '80 - Somme' },
  { code: '81', name: '81 - Tarn' },
  { code: '82', name: '82 - Tarn-et-Garonne' },
  { code: '83', name: '83 - Var' },
  { code: '84', name: '84 - Vaucluse' },
  { code: '85', name: '85 - Vendée' },
  { code: '86', name: '86 - Vienne' },
  { code: '87', name: '87 - Haute-Vienne' },
  { code: '88', name: '88 - Vosges' },
  { code: '89', name: '89 - Yonne' },
  { code: '90', name: '90 - Territoire de Belfort' },
  { code: '91', name: '91 - Essonne' },
  { code: '92', name: '92 - Hauts-de-Seine' },
  { code: '93', name: '93 - Seine-Saint-Denis' },
  { code: '94', name: '94 - Val-de-Marne' },
  { code: '95', name: '95 - Val-d\'Oise' },
  { code: '971', name: '971 - Guadeloupe' },
  { code: '972', name: '972 - Martinique' },
  { code: '973', name: '973 - Guyane' },
  { code: '974', name: '974 - La Réunion' },
  { code: '976', name: '976 - Mayotte' }
];

interface SearchFormProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onApplyFilters: () => void;
  isLoading: boolean;
}

export function SearchForm({ filters, onFiltersChange, onApplyFilters, isLoading }: SearchFormProps) {
  const { categories: dynamicCategories, subCategories, isLoading: categoriesLoading, isLoadingSubCategories } = useBodaccCategories();
  
  // Protection contre les valeurs undefined pour éviter les warnings React
  const safeCategories = dynamicCategories ?? [];
  const safeSubCategories = subCategories ?? [];

  // Construire la liste des catégories avec l'option "Toutes"
  const categories = [
    { value: '', label: 'Toutes les catégories' },
    ...safeCategories.map(cat => ({ value: cat, label: cat }))
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtres BODACC</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3">
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
              Recherche textuelle
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                id="query"
                value={filters.query || ''}
                onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
                placeholder="Nom d'entreprise, SIREN, activité..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="departement" className="block text-sm font-medium text-gray-700 mb-2">
              Département
            </label>
            <select
              id="departement"
              value={filters.departement || ''}
              onChange={(e) => onFiltersChange({ ...filters, departement: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              {DEPARTEMENTS_LIST.map((dept) => (
                <option key={dept.code} value={dept.code}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
              {categoriesLoading && (
                <span className="ml-2 text-xs text-gray-500">(chargement...)</span>
              )}
            </label>
            <select
              id="category"
              value={filters.category || ''}
              onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
              disabled={categoriesLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 mb-2">
              Sous-catégorie
              {isLoadingSubCategories && (
                <span className="ml-2 text-xs text-gray-500">(chargement...)</span>
              )}
            </label>
            <select
              id="subCategory"
              value={filters.subCategory || ''}
              onChange={(e) => onFiltersChange({ ...filters, subCategory: e.target.value })}
              disabled={isLoadingSubCategories}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">Toutes les sous-catégories</option>
              {safeSubCategories.map((subCat) => (
                <option key={subCat} value={subCat}>
                  {subCat}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-2">
              Date de début
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                id="dateFrom"
                value={filters.dateFrom || ''}
                onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-2">
              Date de fin
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                id="dateTo"
                value={filters.dateTo || ''}
                onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Chargement...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
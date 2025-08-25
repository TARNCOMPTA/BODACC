import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { SearchFilters } from '../types/bodacc';
import { useBodaccCategories } from '../hooks/useBodaccCategories';

// Liste des tribunaux extraite du composant pour éviter la recréation à chaque rendu
const TRIBUNAUX_LIST = [
  { code: '', name: 'Tous les tribunaux' },
  { code: 'TRIBUNAL DE COMMERCE D\'AIX EN PROVENCE', name: 'Aix-en-Provence' },
  { code: 'TRIBUNAL DE COMMERCE D\'AJACCIO', name: 'Ajaccio' },
  { code: 'TRIBUNAL DE COMMERCE D\'ALBERTVILLE', name: 'Albertville' },
  { code: 'TRIBUNAL DE COMMERCE D\'ALBI', name: 'Albi' },
  { code: 'TRIBUNAL DE COMMERCE D\'ALES', name: 'Alès' },
  { code: 'TRIBUNAL DE COMMERCE D\'AMIENS', name: 'Amiens' },
  { code: 'TRIBUNAL DE COMMERCE D\'ANGERS', name: 'Angers' },
  { code: 'TRIBUNAL DE COMMERCE D\'ANGOULEME', name: 'Angoulême' },
  { code: 'TRIBUNAL DE COMMERCE D\'ANNECY', name: 'Annecy' },
  { code: 'TRIBUNAL DE COMMERCE D\'ARRAS', name: 'Arras' },
  { code: 'TRIBUNAL DE COMMERCE D\'AUCH', name: 'Auch' },
  { code: 'TRIBUNAL DE COMMERCE D\'AUXERRE', name: 'Auxerre' },
  { code: 'TRIBUNAL DE COMMERCE D\'AVIGNON', name: 'Avignon' },
  { code: 'TRIBUNAL DE COMMERCE DE BAR LE DUC', name: 'Bar-le-Duc' },
  { code: 'TRIBUNAL DE COMMERCE DE BASTIA', name: 'Bastia' },
  { code: 'TRIBUNAL DE COMMERCE DE BAYONNE', name: 'Bayonne' },
  { code: 'TRIBUNAL DE COMMERCE DE BEAUVAIS', name: 'Beauvais' },
  { code: 'TRIBUNAL DE COMMERCE DE BELFORT', name: 'Belfort' },
  { code: 'TRIBUNAL DE COMMERCE DE BERGERAC', name: 'Bergerac' },
  { code: 'TRIBUNAL DE COMMERCE DE BESANCON', name: 'Besançon' },
  { code: 'TRIBUNAL DE COMMERCE DE BEZIERS', name: 'Béziers' },
  { code: 'TRIBUNAL DE COMMERCE DE BLOIS', name: 'Blois' },
  { code: 'TRIBUNAL DE COMMERCE DE BOBIGNY', name: 'Bobigny' },
  { code: 'TRIBUNAL DE COMMERCE DE BORDEAUX', name: 'Bordeaux' },
  { code: 'TRIBUNAL DE COMMERCE DE BOULOGNE SUR MER', name: 'Boulogne-sur-Mer' },
  { code: 'TRIBUNAL DE COMMERCE DE BOURG EN BRESSE', name: 'Bourg-en-Bresse' },
  { code: 'TRIBUNAL DE COMMERCE DE BOURGES', name: 'Bourges' },
  { code: 'TRIBUNAL DE COMMERCE DE BREST', name: 'Brest' },
  { code: 'TRIBUNAL DE COMMERCE DE BRIVE', name: 'Brive' },
  { code: 'TRIBUNAL DE COMMERCE DE CAEN', name: 'Caen' },
  { code: 'TRIBUNAL DE COMMERCE DE CAHORS', name: 'Cahors' },
  { code: 'TRIBUNAL DE COMMERCE DE CANNES', name: 'Cannes' },
  { code: 'TRIBUNAL DE COMMERCE DE CARCASSONNE', name: 'Carcassonne' },
  { code: 'TRIBUNAL DE COMMERCE DE CASTRES', name: 'Castres' },
  { code: 'TRIBUNAL DE COMMERCE DE CHALONS EN CHAMPAGNE', name: 'Châlons-en-Champagne' },
  { code: 'TRIBUNAL DE COMMERCE DE CHAMBERY', name: 'Chambéry' },
  { code: 'TRIBUNAL DE COMMERCE DE CHARLEVILLE MEZIERES', name: 'Charleville-Mézières' },
  { code: 'TRIBUNAL DE COMMERCE DE CHARTRES', name: 'Chartres' },
  { code: 'TRIBUNAL DE COMMERCE DE CHATEAUROUX', name: 'Châteauroux' },
  { code: 'TRIBUNAL DE COMMERCE DE CHERBOURG', name: 'Cherbourg' },
  { code: 'TRIBUNAL DE COMMERCE DE CLERMONT FERRAND', name: 'Clermont-Ferrand' },
  { code: 'TRIBUNAL DE COMMERCE DE COLMAR', name: 'Colmar' },
  { code: 'TRIBUNAL DE COMMERCE DE COMPIEGNE', name: 'Compiègne' },
  { code: 'TRIBUNAL DE COMMERCE DE CRETEIL', name: 'Créteil' },
  { code: 'TRIBUNAL DE COMMERCE DE DIJON', name: 'Dijon' },
  { code: 'TRIBUNAL DE COMMERCE DE DUNKERQUE', name: 'Dunkerque' },
  { code: 'TRIBUNAL DE COMMERCE D\'EPINAL', name: 'Épinal' },
  { code: 'TRIBUNAL DE COMMERCE D\'EVREUX', name: 'Évreux' },
  { code: 'TRIBUNAL DE COMMERCE DE FOIX', name: 'Foix' },
  { code: 'TRIBUNAL DE COMMERCE DE FORT DE FRANCE', name: 'Fort-de-France' },
  { code: 'TRIBUNAL DE COMMERCE DE GAP', name: 'Gap' },
  { code: 'TRIBUNAL DE COMMERCE DE GRENOBLE', name: 'Grenoble' },
  { code: 'TRIBUNAL DE COMMERCE DE GUERET', name: 'Guéret' },
  { code: 'TRIBUNAL DE COMMERCE DE LA ROCHELLE', name: 'La Rochelle' },
  { code: 'TRIBUNAL DE COMMERCE DE LA ROCHE SUR YON', name: 'La Roche-sur-Yon' },
  { code: 'TRIBUNAL DE COMMERCE DE LAON', name: 'Laon' },
  { code: 'TRIBUNAL DE COMMERCE DE LAVAL', name: 'Laval' },
  { code: 'TRIBUNAL DE COMMERCE DE LE MANS', name: 'Le Mans' },
  { code: 'TRIBUNAL DE COMMERCE DE LILLE', name: 'Lille' },
  { code: 'TRIBUNAL DE COMMERCE DE LIMOGES', name: 'Limoges' },
  { code: 'TRIBUNAL DE COMMERCE DE LORIENT', name: 'Lorient' },
  { code: 'TRIBUNAL DE COMMERCE DE LYON', name: 'Lyon' },
  { code: 'TRIBUNAL DE COMMERCE DE MACON', name: 'Mâcon' },
  { code: 'TRIBUNAL DE COMMERCE DE MARSEILLE', name: 'Marseille' },
  { code: 'TRIBUNAL DE COMMERCE DE MEAUX', name: 'Meaux' },
  { code: 'TRIBUNAL DE COMMERCE DE MELUN', name: 'Melun' },
  { code: 'TRIBUNAL DE COMMERCE DE METZ', name: 'Metz' },
  { code: 'TRIBUNAL DE COMMERCE DE MONTAUBAN', name: 'Montauban' },
  { code: 'TRIBUNAL DE COMMERCE DE MONTPELLIER', name: 'Montpellier' },
  { code: 'TRIBUNAL DE COMMERCE DE MOULINS', name: 'Moulins' },
  { code: 'TRIBUNAL DE COMMERCE DE NANCY', name: 'Nancy' },
  { code: 'TRIBUNAL DE COMMERCE DE NANTERRE', name: 'Nanterre' },
  { code: 'TRIBUNAL DE COMMERCE DE NANTES', name: 'Nantes' },
  { code: 'TRIBUNAL DE COMMERCE DE NARBONNE', name: 'Narbonne' },
  { code: 'TRIBUNAL DE COMMERCE DE NEVERS', name: 'Nevers' },
  { code: 'TRIBUNAL DE COMMERCE DE NICE', name: 'Nice' },
  { code: 'TRIBUNAL DE COMMERCE DE NIMES', name: 'Nîmes' },
  { code: 'TRIBUNAL DE COMMERCE DE NIORT', name: 'Niort' },
  { code: 'TRIBUNAL DE COMMERCE D\'ORLEANS', name: 'Orléans' },
  { code: 'TRIBUNAL DE COMMERCE DE PARIS', name: 'Paris' },
  { code: 'TRIBUNAL DE COMMERCE DE PAU', name: 'Pau' },
  { code: 'TRIBUNAL DE COMMERCE DE PERIGUEUX', name: 'Périgueux' },
  { code: 'TRIBUNAL DE COMMERCE DE PERPIGNAN', name: 'Perpignan' },
  { code: 'TRIBUNAL DE COMMERCE DE POITIERS', name: 'Poitiers' },
  { code: 'TRIBUNAL DE COMMERCE DE PONTOISE', name: 'Pontoise' },
  { code: 'TRIBUNAL DE COMMERCE DE QUIMPER', name: 'Quimper' },
  { code: 'TRIBUNAL DE COMMERCE DE REIMS', name: 'Reims' },
  { code: 'TRIBUNAL DE COMMERCE DE RENNES', name: 'Rennes' },
  { code: 'TRIBUNAL DE COMMERCE DE RODEZ', name: 'Rodez' },
  { code: 'TRIBUNAL DE COMMERCE DE ROUEN', name: 'Rouen' },
  { code: 'TRIBUNAL DE COMMERCE DE SAINT BRIEUC', name: 'Saint-Brieuc' },
  { code: 'TRIBUNAL DE COMMERCE DE SAINT ETIENNE', name: 'Saint-Étienne' },
  { code: 'TRIBUNAL DE COMMERCE DE SAINT NAZAIRE', name: 'Saint-Nazaire' },
  { code: 'TRIBUNAL DE COMMERCE DE SAINTES', name: 'Saintes' },
  { code: 'TRIBUNAL DE COMMERCE DE SAVERNE', name: 'Saverne' },
  { code: 'TRIBUNAL DE COMMERCE DE SEDAN', name: 'Sedan' },
  { code: 'TRIBUNAL DE COMMERCE DE SENS', name: 'Sens' },
  { code: 'TRIBUNAL DE COMMERCE DE SOISSONS', name: 'Soissons' },
  { code: 'TRIBUNAL DE COMMERCE DE STRASBOURG', name: 'Strasbourg' },
  { code: 'TRIBUNAL DE COMMERCE DE TARBES', name: 'Tarbes' },
  { code: 'TRIBUNAL DE COMMERCE DE THIONVILLE', name: 'Thionville' },
  { code: 'TRIBUNAL DE COMMERCE DE THONON LES BAINS', name: 'Thonon-les-Bains' },
  { code: 'TRIBUNAL DE COMMERCE DE TOULON', name: 'Toulon' },
  { code: 'TRIBUNAL DE COMMERCE DE TOULOUSE', name: 'Toulouse' },
  { code: 'TRIBUNAL DE COMMERCE DE TOURS', name: 'Tours' },
  { code: 'TRIBUNAL DE COMMERCE DE TROYES', name: 'Troyes' },
  { code: 'TRIBUNAL DE COMMERCE DE VALENCE', name: 'Valence' },
  { code: 'TRIBUNAL DE COMMERCE DE VALENCIENNES', name: 'Valenciennes' },
  { code: 'TRIBUNAL DE COMMERCE DE VANNES', name: 'Vannes' },
  { code: 'TRIBUNAL DE COMMERCE DE VERSAILLES', name: 'Versailles' },
  { code: 'TRIBUNAL DE COMMERCE DE VESOUL', name: 'Vesoul' }
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
            <label htmlFor="tribunal" className="block text-sm font-medium text-gray-700 mb-2">
              Tribunal de commerce
            </label>
            <select
              id="tribunal"
              value={filters.tribunal || ''}
              onChange={(e) => onFiltersChange({ ...filters, tribunal: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              {TRIBUNAUX_LIST.map((tribunal) => (
                <option key={tribunal.code} value={tribunal.code}>
                  {tribunal.name}
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
import React from 'react';
import { FileText, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { BodaccAnnouncement, SearchFilters } from '../types/bodacc';
import { AnnouncementCard } from './AnnouncementCard';

interface SearchResultsProps {
  announcements: BodaccAnnouncement[];
  totalCount: number;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isLoading: boolean;
}

export function SearchResults({ 
  announcements, 
  totalCount, 
  filters, 
  onFiltersChange, 
  isLoading 
}: SearchResultsProps) {
  const limit = Math.max(1, Number(filters.limit ?? 20));
  const page = Math.max(1, Number(filters.page ?? 1));
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalCount);

  const handleExport = () => {
    if (announcements.length === 0) return;
    
    const escapeCsv = (value: string) => {
      if (!value) return '""';
      const escaped = value.replace(/"/g, '""');
      return `"${escaped}"`;
    };
    
    const csvHeaders = [
      'Dénomination',
      'Catégorie',
      'Type',
      'Adresse',
      'Ville',
      'Code postal',
      'Département',
      'Date parution',
      'Numéro parution',
      'Activité',
      'Capital'
    ];
    
    const csvData = announcements.map(ann => [
      escapeCsv(ann.denomination || ''),
      escapeCsv(ann.categorie || ''),
      escapeCsv(ann.type || ''),
      escapeCsv(ann.adresse || ''),
      escapeCsv(ann.ville || ''),
      escapeCsv(ann.code_postal || ''),
      escapeCsv(ann.departement || ''),
      escapeCsv(ann.date_parution || ''),
      escapeCsv(ann.numero_parution || ''),
      escapeCsv(ann.activite || ''),
      escapeCsv(ann.capital || '')
    ]);
    
    // Ajouter BOM UTF-8 pour Excel FR
    const BOM = '\uFEFF';
    const csvContent = BOM + [csvHeaders.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bodacc-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Nettoyer l'URL pour éviter les fuites mémoire
      URL.revokeObjectURL(url);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement des annonces...</span>
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
        <p className="text-gray-500">
          Essayez de modifier vos filtres ou d'élargir vos critères.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">
                {startIndex}-{endIndex} sur {totalCount.toLocaleString('fr-FR')} résultats
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <label htmlFor="sort" className="text-sm text-gray-600">Trier par:</label>
              <select
                id="sort"
                value={filters.sort || '-dateparution'}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  sort: e.target.value,
                  page: 1 
                })}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
              >
                <option value="-dateparution">Date (plus récent)</option>
                <option value="dateparution">Date (plus ancien)</option>
                <option value="numerodepartement">Département (01, 02, 03...)</option>
                <option value="-numerodepartement">Département (99, 98, 97...)</option>
                <option value="departement_nom_officiel">Département nom (A-Z)</option>
                <option value="-departement_nom_officiel">Département nom (Z-A)</option>
                <option value="ville">Ville (A-Z)</option>
                <option value="-ville">Ville (Z-A)</option>
                <option value="commercant">Entreprise (A-Z)</option>
                <option value="-commercant">Entreprise (Z-A)</option>
                <option value="tribunal">Tribunal (A-Z)</option>
                <option value="-tribunal">Tribunal (Z-A)</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label htmlFor="limit" className="text-sm text-gray-600">Afficher:</label>
              <select
                id="limit"
                value={filters.limit}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  limit: parseInt(e.target.value),
                  page: 1 
                })}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">par page</span>
            </div>
          </div>
          
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <AnnouncementCard 
            key={announcement.id} 
            announcement={announcement} 
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onFiltersChange({ ...filters, page: page - 1 })}
              disabled={page <= 1}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Page {page} sur {totalPages}
              </span>
            </div>
            
            <button
              onClick={() => onFiltersChange({ ...filters, page: page + 1 })}
              disabled={page >= totalPages}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
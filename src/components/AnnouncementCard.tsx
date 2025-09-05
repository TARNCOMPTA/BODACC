import React from 'react';
import { Building2, MapPin, Calendar, FileText, Euro, Hash, Globe, FolderOpen, Users, Scale } from 'lucide-react';
import { BodaccAnnouncement } from '../types/bodacc';

interface AnnouncementCardProps {
  announcement: BodaccAnnouncement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  const formatCapital = (capital: string, devise: string) => {
    if (!capital) return '';
    const amount = parseFloat(capital.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (isNaN(amount)) return capital;
    return `${amount.toLocaleString('fr-FR')} ${devise || '€'}`;
  };

  const getRegistrationNumber = () => {
    // Essayer d'extraire le numéro d'immatriculation depuis listepersonnes
    if (announcement.texte && announcement.texte.includes('N° immatriculation:')) {
      const match = announcement.texte.match(/N° immatriculation:\s*([^\n]+)/);
      if (match) return match[1].trim();
    }
    return null;
  };

  const registrationNumber = getRegistrationNumber();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {announcement.denomination || 'Dénomination non spécifiée'}
              {registrationNumber && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({registrationNumber})
                </span>
              )}
            </h3>
            {(announcement.adresse || announcement.ville || announcement.code_postal) && (
              <div className="text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                {announcement.adresse && <span>{announcement.adresse}</span>}
                {(announcement.code_postal || announcement.ville) && (
                  <span className={announcement.adresse ? " • " : ""}>
                    {announcement.code_postal} {announcement.ville}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center text-sm text-blue-600 mb-2">
              <Building2 className="w-4 h-4 mr-1" />
              <span className="font-medium">{announcement.categorie}</span>
              {announcement.sous_categorie && (
                <span className="text-gray-500 ml-2">• {announcement.sous_categorie}</span>
              )}
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {announcement.type || 'Annonce'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {announcement.adresse && (
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-gray-900">{announcement.adresse}</div>
                <div className="text-gray-500">
                  {announcement.code_postal} {announcement.ville}
                </div>
                {announcement.departement && (
                  <div className="text-gray-500">Département: {announcement.departement}</div>
                )}
                {announcement.region && (
                  <div className="text-gray-500">Région: {announcement.region}</div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {announcement.date_parution && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Parution: {formatDate(announcement.date_parution)}</span>
              </div>
            )}
            
            {announcement.numero_parution && (
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">N° {announcement.numero_parution}</span>
                {announcement.numero_annonce && (
                  <span className="text-gray-500">• Annonce {announcement.numero_annonce}</span>
                )}
              </div>
            )}
            
            {announcement.capital && (
              <div className="flex items-center space-x-2">
                <Euro className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Capital: {formatCapital(announcement.capital, announcement.devise)}</span>
              </div>
            )}
            
            {announcement.id && (
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 font-mono text-xs">ID: {announcement.id}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {announcement.libelle && announcement.libelle !== announcement.categorie && (
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Libellé: {announcement.libelle}</span>
              </div>
            )}
            
            {announcement.tribunal && (
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Tribunal: {announcement.tribunal}</span>
              </div>
            )}
            
            {announcement.date_jugement && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Jugement: {formatDate(announcement.date_jugement)}</span>
              </div>
            )}
          </div>
        </div>

        {announcement.activite && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Activité:</span> {announcement.activite}
            </p>
          </div>
        )}

        {announcement.texte && (
          <div className="pt-3 border-t border-gray-100">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                Voir le détail de l'annonce
              </summary>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {announcement.texte}
                </p>
              </div>
            </details>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
              Informations techniques
            </summary>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
                <div>
                  <span className="font-medium">ID Record:</span> {announcement.id}
                </div>
                {announcement.numero_parution && (
                  <div>
                    <span className="font-medium">N° Parution:</span> {announcement.numero_parution}
                  </div>
                )}
                {announcement.numero_annonce && (
                  <div>
                    <span className="font-medium">N° Annonce:</span> {announcement.numero_annonce}
                  </div>
                )}
                {announcement.type && (
                  <div>
                    <span className="font-medium">Type publication:</span> {announcement.type}
                  </div>
                )}
                {announcement.categorie && (
                  <div>
                    <span className="font-medium">Catégorie:</span> {announcement.categorie}
                  </div>
                )}
                {announcement.sous_categorie && (
                  <div>
                    <span className="font-medium">Sous-catégorie:</span> {announcement.sous_categorie}
                  </div>
                )}
                {announcement.libelle && (
                  <div>
                    <span className="font-medium">Libellé:</span> {announcement.libelle}
                  </div>
                )}
                {announcement.region && (
                  <div>
                    <span className="font-medium">Région:</span> {announcement.region}
                  </div>
                )}
                {announcement.departement && (
                  <div>
                    <span className="font-medium">Département:</span> {announcement.departement}
                  </div>
                )}
                {announcement.devise && (
                  <div>
                    <span className="font-medium">Devise:</span> {announcement.devise}
                  </div>
                )}
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
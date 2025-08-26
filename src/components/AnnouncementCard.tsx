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
    // Nettoyer et formater le capital
    const cleanCapital = capital.replace(/[^\d.,]/g, '').replace(',', '.');
    const amount = parseFloat(cleanCapital);
    if (isNaN(amount)) return `${capital} ${devise || '€'}`;
    return `${amount.toLocaleString('fr-FR')} ${devise || '€'}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {announcement.denomination || 'Dénomination non spécifiée'}
            </h3>
            <div className="flex flex-wrap items-center text-sm text-blue-600 mb-2 gap-2">
              <Building2 className="w-4 h-4 mr-1" />
              <span className="font-medium">{announcement.categorie}</span>
              {announcement.sous_categorie && (
                <span className="text-gray-500">• {announcement.sous_categorie}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {announcement.type || 'Annonce'}
            </span>
            {announcement.date_parution && (
              <span className="text-xs text-gray-500">
                {formatDate(announcement.date_parution)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          {announcement.adresse && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Adresse
              </h4>
              <div className="pl-5 space-y-1">
                <div className="text-gray-900">{announcement.adresse}</div>
                <div className="text-gray-600">
                  {announcement.code_postal} {announcement.ville}
                </div>
                {announcement.departement && (
                  <div className="text-gray-500 text-xs">
                    Département: {announcement.departement}
                  </div>
                )}
                {announcement.region && (
                  <div className="text-gray-500 text-xs">
                    Région: {announcement.region}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              Informations légales
            </h4>
            <div className="pl-5 space-y-2">
              {announcement.tribunal && (
                <div className="flex items-start space-x-2">
                  <Scale className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-gray-600 text-xs">Tribunal:</span>
                    <div className="text-gray-900 text-sm">{announcement.tribunal}</div>
                  </div>
                </div>
              )}
              
              {announcement.numero_parution && (
                <div className="flex items-center space-x-2">
                  <Hash className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600 text-xs">N° Parution:</span>
                  <span className="text-gray-900 font-mono text-sm">{announcement.numero_parution}</span>
                </div>
              )}
              
              {announcement.numero_annonce && (
                <div className="flex items-center space-x-2">
                  <Hash className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600 text-xs">N° Annonce:</span>
                  <span className="text-gray-900 font-mono text-sm">{announcement.numero_annonce}</span>
                </div>
              )}
              
              {announcement.capital && (
                <div className="flex items-center space-x-2">
                  <Euro className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600 text-xs">Capital:</span>
                  <span className="text-gray-900 font-medium text-sm">
                    {formatCapital(announcement.capital, announcement.devise)}
                  </span>
                </div>
              )}
              
              {announcement.date_jugement && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600 text-xs">Date jugement:</span>
                  <span className="text-gray-900 text-sm">{formatDate(announcement.date_jugement)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {announcement.activite && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Activité
            </h4>
            <p className="text-sm text-gray-700 pl-5">
              {announcement.activite}
            </p>
          </div>
        )}

        {announcement.libelle && announcement.libelle !== announcement.categorie && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <FolderOpen className="w-4 h-4 mr-1" />
              Libellé
            </h4>
            <p className="text-sm text-gray-700 pl-5">
              {announcement.libelle}
            </p>
          </div>
        )}

        {announcement.texte && (
          <div className="pt-4 border-t border-gray-100">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Voir le détail complet de l'annonce
              </summary>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {announcement.texte}
                </p>
              </div>
            </details>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors flex items-center">
              <Globe className="w-4 h-4 mr-1" />
              Données techniques et métadonnées
            </summary>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
                <div>
                  <span className="font-medium">ID Record:</span>
                  <div className="font-mono text-gray-800 mt-1">{announcement.id}</div>
                </div>
                {announcement.numero_parution && (
                  <div>
                    <span className="font-medium">N° Parution:</span>
                    <div className="font-mono text-gray-800 mt-1">{announcement.numero_parution}</div>
                  </div>
                )}
                {announcement.numero_annonce && (
                  <div>
                    <span className="font-medium">N° Annonce:</span>
                    <div className="font-mono text-gray-800 mt-1">{announcement.numero_annonce}</div>
                  </div>
                )}
                {announcement.type && (
                  <div>
                    <span className="font-medium">Type publication:</span>
                    <div className="text-gray-800 mt-1">{announcement.type}</div>
                  </div>
                )}
                {announcement.categorie && (
                  <div>
                    <span className="font-medium">Catégorie:</span>
                    <div className="text-gray-800 mt-1">{announcement.categorie}</div>
                  </div>
                )}
                {announcement.sous_categorie && (
                  <div>
                    <span className="font-medium">Sous-catégorie:</span>
                    <div className="text-gray-800 mt-1">{announcement.sous_categorie}</div>
                  </div>
                )}
                {announcement.libelle && (
                  <div>
                    <span className="font-medium">Libellé:</span>
                    <div className="text-gray-800 mt-1">{announcement.libelle}</div>
                  </div>
                )}
                {announcement.region && (
                  <div>
                    <span className="font-medium">Région:</span>
                    <div className="text-gray-800 mt-1">{announcement.region}</div>
                  </div>
                )}
                {announcement.departement && (
                  <div>
                    <span className="font-medium">Département:</span>
                    <div className="text-gray-800 mt-1">{announcement.departement}</div>
                  </div>
                )}
                {announcement.devise && (
                  <div>
                    <span className="font-medium">Devise:</span>
                    <div className="text-gray-800 mt-1">{announcement.devise}</div>
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
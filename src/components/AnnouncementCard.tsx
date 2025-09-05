import React from 'react';
import { Building2, MapPin, Calendar, FileText, Euro, Hash, Globe, FolderOpen, Users, Scale, ExternalLink } from 'lucide-react';
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

  const getSiretNumber = () => {
    console.log('=== DEBUG SIREN EXTRACTION ===');
    console.log('registrationNumber:', registrationNumber);
    console.log('announcement.texte:', announcement.texte);
    
    // Utiliser directement le numéro d'immatriculation comme SIREN
    if (registrationNumber && /\d{9}/.test(registrationNumber)) {
      console.log('Processing registrationNumber:', registrationNumber);
      // Nettoyer les espaces et caractères non numériques
      const cleanedNumber = registrationNumber.replace(/\s+/g, '').replace(/[^\d]/g, '');
      console.log('cleanedNumber:', cleanedNumber);
      const match = cleanedNumber.match(/(\d{9})/);
        console.log('SIREN found from registration:', match[1]);
      console.log('match result:', match);
      if (match) return match[1];
    }
    
    // Si pas de numéro d'immatriculation, essayer d'extraire depuis le texte
    if (announcement.texte) {
      console.log('Searching in texte...');
      // Rechercher un numéro SIREN (9 chiffres)
      const sirenMatch = announcement.texte.match(/SIREN[:\s]*(\d{9})/i);
      if (sirenMatch) {
        console.log('SIREN found in texte:', sirenMatch[1]);
        return sirenMatch[1];
      }
      
      // Rechercher un numéro SIRET (14 chiffres) et extraire le SIREN
      const siretMatch = announcement.texte.match(/SIRET[:\s]*(\d{14})/i);
      if (siretMatch) {
        console.log('SIRET found in texte, extracting SIREN:', siretMatch[1].substring(0, 9));
        return siretMatch[1].substring(0, 9);
      }
      
      // Rechercher des numéros dans le texte (patterns plus larges)
      const numberMatch = announcement.texte.match(/(\d{9})/);
      if (numberMatch) {
        console.log('9-digit number found in texte:', numberMatch[1]);
        return numberMatch[1];
      }
    }
    
    console.log('No SIREN found');
    return null;
  };

  const registrationNumber = getRegistrationNumber();
  const sirenNumber = getSiretNumber();

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

        {sirenNumber && (
          <div className="pt-3 border-t border-gray-100">
            <a
              href={`https://data.inpi.fr/export/companies?format=pdf&ids=[%22${sirenNumber}%22]`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Consulter l'avis INPI
              <span className="ml-2 text-xs text-gray-500">({sirenNumber})</span>
            </a>
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
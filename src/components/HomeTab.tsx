import React from 'react';
import { Search, BarChart3, Scale, Building2, FileText, TrendingUp, Users, Globe, Shield, Clock } from 'lucide-react';
import { FranceMapWeather } from './FranceMapWeather';

interface HomeTabProps {
  onTabChange: (tab: 'home' | 'search' | 'statistics') => void;
}

export function HomeTab({ onTabChange }: HomeTabProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" role="main">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" itemScope itemType="https://schema.org/WebApplication">
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl shadow-lg">
              <Scale className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6" itemProp="name">
            BODACC Explorer
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed" itemProp="description">
            Explorez et analysez les annonces officielles du 
            <span className="font-semibold text-blue-600"> Bulletin officiel des annonces civiles et commerciales</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <Shield className="w-4 h-4 mr-2" />
              Données officielles certifiées
            </div>
            <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Globe className="w-4 h-4 mr-2" />
              Source: data.gouv.fr
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Météo économique */}
        <div className="mb-16">
          <FranceMapWeather />
        </div>
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" id="fonctionnalites">
            Fonctionnalités principales
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez tous les outils mis à votre disposition pour explorer les données BODACC
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recherche d'annonces */}
          <article className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 ml-4" id="recherche-annonces">Recherche d'annonces</h3>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Recherchez et filtrez les annonces BODACC selon vos critères : entreprise, département, 
              catégorie, période, et bien plus encore.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Recherche textuelle avancée
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Filtres par département et catégorie
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Export des résultats en CSV
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Pagination et tri personnalisés
              </div>
            </div>
          </article>

          {/* Statistiques */}
          <article className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 ml-4" id="analyses-statistiques">Analyses statistiques</h3>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Analysez les tendances et évolutions des annonces BODACC avec des graphiques 
              interactifs et des tableaux détaillés.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Évolution temporelle par période
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Comparaisons année sur année
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Analyses par catégorie et région
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Export des statistiques
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4" id="bodacc-chiffres">
              Le BODACC en chiffres
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez l'ampleur des données officielles disponibles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-4">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">Millions</div>
              <div className="text-gray-600">d'annonces disponibles</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">101</div>
              <div className="text-gray-600">départements couverts</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">Quotidien</div>
              <div className="text-gray-600">mise à jour des données</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">Temps réel</div>
              <div className="text-gray-600">accès aux dernières annonces</div>
            </div>
          </div>
        </div>
      </section>

      {/* What is BODACC */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" id="quest-ce-que-bodacc">
              Qu'est-ce que le BODACC ?
            </h2>
            
            <div className="text-lg leading-relaxed space-y-4 mb-8">
              <p>
                Le <strong>Bulletin officiel des annonces civiles et commerciales (BODACC)</strong> 
                est une publication officielle française qui recense toutes les annonces légales 
                concernant la vie des entreprises.
              </p>
              
              <p>
                Il contient les informations sur les créations, modifications, dissolutions d'entreprises, 
                les procédures collectives, les dépôts de comptes, et bien d'autres événements 
                juridiques importants de la vie économique française.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <Scale className="w-8 h-8 mb-4" />
                <h3 className="font-semibold mb-2">Valeur légale</h3>
                <p className="text-sm opacity-90">
                  Publication officielle avec force juridique
                </p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <Users className="w-8 h-8 mb-4" />
                <h3 className="font-semibold mb-2">Transparence</h3>
                <p className="text-sm opacity-90">
                  Information publique accessible à tous
                </p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <Globe className="w-8 h-8 mb-4" />
                <h3 className="font-semibold mb-2">Exhaustivité</h3>
                <p className="text-sm opacity-90">
                  Couverture complète du territoire français
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4" id="commencer">
            Prêt à explorer les données BODACC ?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Commencez dès maintenant votre recherche ou découvrez les tendances 
            avec nos outils d'analyse statistique.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onTabChange('search')}
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-lg"
              aria-label="Accéder à la recherche d'annonces BODACC"
            >
              <Search className="w-5 h-5 mr-2" />
              Rechercher des annonces
            </button>
            
            <button 
              onClick={() => onTabChange('statistics')}
              className="inline-flex items-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-lg"
              aria-label="Accéder aux statistiques BODACC"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Voir les statistiques
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
import { useState, useEffect } from 'react';
import { BodaccApiService } from '../services/bodaccApi';

export function useBodaccCategories() {
  const [categories, setCategories] = useState<string[]>([
    'Avis de constitution',
    'Modification',
    'Dissolution',
    'Clôture de liquidation',
    'Vente de fonds de commerce',
    'Location-gérance'
  ]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les sous-catégories depuis l'API
  useEffect(() => {
    const loadSubCategories = async () => {
      setIsLoadingSubCategories(true);
      try {
        const subCats = await BodaccApiService.getSubCategories();
        setSubCategories(subCats);
      } catch (err) {
        console.error('Erreur chargement sous-catégories:', err);
        // Fallback vers liste statique
        setSubCategories([
          'Avis initial',
          'Avis rectificatif',
          'Avis d\'annulation',
          'Création d\'entreprise',
          'Modification',
          'Dissolution',
          'Clôture de liquidation',
          'Procédure collective',
          'Vente de fonds',
          'Location-gérance',
          'Dépôt des comptes'
        ]);
      } finally {
        setIsLoadingSubCategories(false);
      }
    };

    loadSubCategories();
  }, []);

  return { 
    categories, 
    subCategories, 
    isLoading, 
    isLoadingSubCategories, 
    error 
  };
}
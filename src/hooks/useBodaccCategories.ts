import { useState, useEffect } from 'react';
import { BodaccApiService } from '../services/bodaccApi';

export function useBodaccCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const fetchedCategories = await BodaccApiService.getCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des catégories';
        setError(errorMessage);
        
        // Utiliser des catégories par défaut en cas d'erreur
        setCategories([
          'Avis initial',
          'Avis rectificatif',
          'Avis d\'annulation'
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    // Utiliser une liste statique de sous-catégories
    setSubCategories([
      'Dépôts des comptes',
      'Modifications diverses',
      'Créations',
      'Radiations',
      'Procédures collectives',
      'Ventes et cessions',
      'Immatriculations',
      'Annonces diverses',
      'Procédures de conciliation',
      'Procédures de rétablissement professionnel'
    ]);

    loadCategories();
  }, []);

  return { 
    categories, 
    subCategories, 
    isLoading, 
    isLoadingSubCategories, 
    error 
  };
}
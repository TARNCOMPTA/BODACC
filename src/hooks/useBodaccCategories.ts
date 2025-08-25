import { useState, useEffect } from 'react';
import { BodaccApiService } from '../services/bodaccApi';

export function useBodaccCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(true);
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

    const loadSubCategories = async () => {
      setIsLoadingSubCategories(true);
      
      try {
        const fetchedSubCategories = await BodaccApiService.getSubCategories();
        setSubCategories(fetchedSubCategories);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erreur lors du chargement des sous-catégories:', err);
        }
        
        // Utiliser des sous-catégories par défaut en cas d'erreur
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
      } finally {
        setIsLoadingSubCategories(false);
      }
    };

    loadCategories();
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
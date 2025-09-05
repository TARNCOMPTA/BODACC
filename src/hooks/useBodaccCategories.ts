import { useState, useEffect } from 'react';

export function useBodaccCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Utiliser les vraies catégories BODACC
    setCategories([
      'Avis initial',
      'Avis rectificatif',
      'Avis d\'annulation'
    ]);

    // Utiliser les vraies sous-catégories BODACC
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
  }, []);

  return { 
    categories, 
    subCategories, 
    isLoading, 
    isLoadingSubCategories, 
    error 
  };
}
import { useState, useEffect } from 'react';

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

  useEffect(() => {
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
  }, []);

  return { 
    categories, 
    subCategories, 
    isLoading, 
    isLoadingSubCategories, 
    error 
  };
}
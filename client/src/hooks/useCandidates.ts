import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { type Candidate } from '../types';
import { announceToScreenReader } from '../utils/announcer';

export const useCandidates = () => {
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCandidates = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const response = await api.get('/api/candidates', {
        params: {
          limit: 1000,
          page: 1,
        }
      });
      
      setAllCandidates(response.data.candidates);
      
      const message = `${response.data.candidates.length} candidats chargés avec succès`;
      announceToScreenReader(message);
    } catch (error) {
      console.error('Erreur lors du chargement des candidats', error);
      setError('Impossible de charger les candidats. Veuillez réessayer.');
      announceToScreenReader('Erreur lors du chargement des candidats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAllCandidates(true);
  };

  const handleDeleteCandidate = (deletedId: string) => {
    setAllCandidates(prevCandidates => 
      prevCandidates.filter(candidate => candidate._id !== deletedId)
    );
    announceToScreenReader('Candidat supprimé avec succès');
  };

  useEffect(() => {
    fetchAllCandidates();
  }, []);

  return {
    allCandidates,
    loading,
    refreshing,
    error,
    setError,
    handleRefresh,
    handleDeleteCandidate,
    fetchAllCandidates,
  };
};
// src/pages/Candidates.tsx
import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import api from '../../lib/axios';
import type { Candidate } from '../../types';
import { CandidateCard } from '../../components/CandidateCard';
import { Pagination } from '../../components/Pagination';
import { Header } from '../../components/Header';

export const Candidates = () => {
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    name: '',
    status: '',
    position: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 9;

  // Charger tous les candidats une seule fois au montage du composant
  useEffect(() => {
    fetchAllCandidates();
  }, []);

  const fetchAllCandidates = async () => {
    setLoading(true);
    try {
      // Récupérer tous les candidats sans pagination
      const response = await api.get('/api/candidates', {
        params: {
          limit: 1000, // ou un nombre suffisamment grand pour tous les candidats
          page: 1,
        }
      });
      
      setAllCandidates(response.data.candidates);
      console.log(`Chargé ${response.data.candidates.length} candidats`);
    } catch (error) {
      console.error('Erreur lors du chargement des candidats', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les candidats côté client
  const filteredCandidates = useMemo(() => {
    let result = [...allCandidates];
    
    // Filtre par nom
    if (filters.name && filters.name.trim()) {
      const searchTerm = filters.name.toLowerCase().trim();
      result = result.filter(candidate => 
        candidate.name?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtre par statut
    if (filters.status && filters.status.trim()) {
      result = result.filter(candidate => 
        candidate.status === filters.status
      );
    }
    
    // Filtre par poste
    if (filters.position && filters.position.trim()) {
      const searchTerm = filters.position.toLowerCase().trim();
      result = result.filter(candidate => 
        candidate.position?.toLowerCase().includes(searchTerm)
      );
    }
    
    console.log(`Filtres appliqués: ${result.length} candidats trouvés`);
    return result;
  }, [allCandidates, filters]);

  // Calculer la pagination côté client
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCandidates.slice(startIndex, endIndex);
  }, [filteredCandidates, currentPage]);

  // Mettre à jour le nombre total de pages quand les filtres changent
  useEffect(() => {
    const newTotalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
    setTotalPages(newTotalPages > 0 ? newTotalPages : 1);
    
    // Si la page courante est plus grande que le nouveau total, revenir à la page 1
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredCandidates, currentPage]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Retour à la première page quand les filtres changent
  };

  const resetFilters = () => {
    setFilters({ name: '', status: '', position: '' });
    setCurrentPage(1);
    setShowFilters(false);
  };

  const activeFilterCount = Object.values(filters).filter(value => value && value.trim() !== '').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-gray-900 dark:border-gray-100 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barre de recherche et filtres */}
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom..."
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-light-border dark:border-dark-border
                           rounded-md bg-light-bg dark:bg-dark-bg
                           text-light-text dark:text-dark-text
                           focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              {filters.name && (
                <button
                  onClick={() => handleFilterChange('name', '')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-light-border dark:border-dark-border
                       rounded-md hover:bg-gray-100 dark:hover:bg-gray-800
                       transition-colors duration-200 flex items-center gap-2 relative"
            >
              <Filter className="h-4 w-4" />
              Filtres
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary
                           border border-light-border dark:border-dark-border rounded-md">
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                  Statut
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-light-border dark:border-dark-border
                             rounded-md bg-light-bg dark:bg-dark-bg
                             text-light-text dark:text-dark-text
                             focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">Tous</option>
                  <option value="pending">En attente</option>
                  <option value="validated">Validé</option>
                  <option value="rejected">Rejeté</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                  Poste
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filtrer par poste..."
                    value={filters.position}
                    onChange={(e) => handleFilterChange('position', e.target.value)}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border
                               rounded-md bg-light-bg dark:bg-dark-bg
                               text-light-text dark:text-dark-text
                               focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                  {filters.position && (
                    <button
                      onClick={() => handleFilterChange('position', '')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 flex justify-between items-center">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400
                           hover:text-gray-900 dark:hover:text-gray-200
                           transition-colors duration-200"
                >
                  Réinitialiser les filtres
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md
                           hover:bg-blue-600 transition-colors duration-200"
                >
                  Appliquer
                </button>
              </div>
            </div>
          )}
          
          {/* Indicateur du nombre de résultats */}
          <div className="mt-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {filteredCandidates.length} candidat{filteredCandidates.length !== 1 ? 's' : ''} trouvé{filteredCandidates.length !== 1 ? 's' : ''}
            {activeFilterCount > 0 && ` (filtres actifs)`}
          </div>
        </div>

        {/* Liste des candidats */}
        {paginatedCandidates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Aucun candidat ne correspond à vos critères
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 text-sm text-blue-500 hover:text-blue-600"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCandidates.map((candidate) => (
                <CandidateCard key={candidate._id} candidate={candidate} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </main>
    </div>
  );
};
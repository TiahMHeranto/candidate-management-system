// src/pages/Candidates.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';
import type { Candidate } from '../../types';
import { CandidateCard } from '../../components/CandidateCard';
import { CandidateCardSkeleton } from '../../components/CandidateCardSkeleton';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Pagination } from '../../components/Pagination';
import { Header } from '../../components/Header';

// Constantes pour les statuts
const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'validated', label: 'Validé' },
] as const;

export const Candidates = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    name: '',
    status: '',
    position: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const itemsPerPage = 9;

  useEffect(() => {
    fetchAllCandidates();
  }, []);

  // Gestion du focus trap pour le panneau de filtres
  useEffect(() => {
    if (showFilters && filterPanelRef.current) {
      const focusableElements = filterPanelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [showFilters]);

  // Fermeture du panneau de filtres avec Echap
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showFilters) {
        setShowFilters(false);
        filterButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showFilters]);

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
      
      // Annonce vocale pour les lecteurs d'écran
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

  // Fonction pour annoncer les changements aux lecteurs d'écran
  const announceToScreenReader = (message: string) => {
    const announcer = document.getElementById('a11y-announcer');
    if (announcer) {
      announcer.textContent = message;
      setTimeout(() => {
        announcer.textContent = '';
      }, 3000);
    }
  };

  const handleRefresh = () => {
    fetchAllCandidates(true);
  };

  const filteredCandidates = useMemo(() => {
    let result = [...allCandidates];
    
    if (filters.name && filters.name.trim()) {
      const searchTerm = filters.name.toLowerCase().trim();
      result = result.filter(candidate => 
        candidate.name?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.status && filters.status.trim()) {
      result = result.filter(candidate => 
        candidate.status === filters.status
      );
    }
    
    if (filters.position && filters.position.trim()) {
      const searchTerm = filters.position.toLowerCase().trim();
      result = result.filter(candidate => 
        candidate.position?.toLowerCase().includes(searchTerm)
      );
    }
    
    return result;
  }, [allCandidates, filters]);

  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCandidates.slice(startIndex, endIndex);
  }, [filteredCandidates, currentPage]);

  useEffect(() => {
    const newTotalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
    setTotalPages(newTotalPages > 0 ? newTotalPages : 1);
    
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredCandidates, currentPage]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    
    // Annonce du filtre appliqué
    if (value) {
      announceToScreenReader(`Filtre ${key} appliqué: ${value}`);
    }
  };

  const resetFilters = () => {
    setFilters({ name: '', status: '', position: '' });
    setCurrentPage(1);
    setShowFilters(false);
    announceToScreenReader('Tous les filtres ont été réinitialisés');
    searchInputRef.current?.focus();
  };

  const activeFilterCount = Object.values(filters).filter(value => value && value.trim() !== '').length;

  const handleDeleteCandidate = (deletedId: string) => {
    setAllCandidates(prevCandidates => 
      prevCandidates.filter(candidate => candidate._id !== deletedId)
    );
    announceToScreenReader('Candidat supprimé avec succès');
  };

  // Afficher les skeletons pendant le chargement initial
  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <Header />
        <main 
          id="main-content" 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          tabIndex={-1}
        >
          <div className="mb-8" aria-label="Chargement des candidats">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
              </div>
              <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
              <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, index) => (
              <CandidateCardSkeleton key={index} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Header />
      
      {/* Annonceur pour lecteurs d'écran */}
      <div 
        id="a11y-announcer" 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      />
      
      <main 
        id="main-content" 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        tabIndex={-1}
      >
        {/* Barre de recherche et filtres */}
        <section aria-label="Recherche et filtres" className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <label htmlFor="search-name" className="sr-only">
                Rechercher par nom
              </label>
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" 
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                id="search-name"
                type="text"
                placeholder="Rechercher par nom..."
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-light-border dark:border-dark-border
                           rounded-md bg-light-bg dark:bg-dark-bg
                           text-light-text dark:text-dark-text
                           focus:outline-none focus:ring-2 focus:ring-primary-500
                           transition-colors duration-200"
                aria-label="Rechercher un candidat par son nom"
              />
              {filters.name && (
                <button
                  onClick={() => handleFilterChange('name', '')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2
                           text-gray-400 hover:text-gray-600
                           focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/candidates/create')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700
                         text-white rounded-md font-medium
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                         transition-colors duration-200 flex items-center gap-2"
                aria-label="Ajouter un nouveau candidat"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Ajouter</span>
              </button>
              
              <button
                ref={filterButtonRef}
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                aria-controls="filter-panel"
                className="px-4 py-2 border border-light-border dark:border-dark-border
                         rounded-md hover:bg-gray-100 dark:hover:bg-gray-800
                         focus:outline-none focus:ring-2 focus:ring-primary-500
                         transition-colors duration-200 flex items-center gap-2 relative"
              >
                <Filter className="h-4 w-4" aria-hidden="true" />
                <span>Filtres</span>
                {activeFilterCount > 0 && (
                  <span 
                    className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    aria-label={`${activeFilterCount} filtre actif`}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {showFilters && (
            <div 
              id="filter-panel"
              ref={filterPanelRef}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary
                       border border-light-border dark:border-dark-border rounded-md
                       animate-slide-up"
              role="region"
              aria-label="Panneau de filtres"
            >
              <div>
                <label htmlFor="filter-status" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                  Statut
                </label>
                <select
                  id="filter-status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-light-border dark:border-dark-border
                           rounded-md bg-light-bg dark:bg-dark-bg
                           text-light-text dark:text-dark-text
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Filtrer par statut"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="filter-position" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                  Poste
                </label>
                <div className="relative">
                  <input
                    id="filter-position"
                    type="text"
                    placeholder="Filtrer par poste..."
                    value={filters.position}
                    onChange={(e) => handleFilterChange('position', e.target.value)}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border
                             rounded-md bg-light-bg dark:bg-dark-bg
                             text-light-text dark:text-dark-text
                             focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Filtrer par poste"
                  />
                  {filters.position && (
                    <button
                      onClick={() => handleFilterChange('position', '')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2
                               text-gray-400 hover:text-gray-600
                               focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full"
                      aria-label="Effacer le filtre de poste"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-2 flex justify-between items-center pt-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400
                           hover:text-gray-900 dark:hover:text-gray-200
                           focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md
                           transition-colors duration-200"
                  aria-label="Réinitialiser tous les filtres"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-sm bg-primary-500 text-white rounded-md
                           hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                           transition-colors duration-200"
                  aria-label="Appliquer les filtres et fermer"
                >
                  Appliquer
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div 
              className="text-sm text-light-text-secondary dark:text-dark-text-secondary"
              aria-live="polite"
            >
              <strong>{filteredCandidates.length}</strong> candidat{filteredCandidates.length !== 1 ? 's' : ''} trouvé{filteredCandidates.length !== 1 ? 's' : ''}
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="ml-2 text-primary-500 hover:text-primary-600
                           focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md px-2"
                  aria-label="Effacer tous les filtres"
                >
                  (effacer les filtres)
                </button>
              )}
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1 text-sm
                       text-light-text-secondary dark:text-dark-text-secondary
                       hover:text-light-text dark:hover:text-dark-text
                       focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Rafraîchir la liste des candidats"
            >
              {refreshing ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Rafraîchissement...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  <span>Rafraîchir</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Message d'erreur */}
        {error && (
          <div 
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                      rounded-md text-red-600 dark:text-red-400 flex items-start gap-2"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800
                       focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1"
              aria-label="Fermer le message d'erreur"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Liste des candidats */}
        <section aria-label="Liste des candidats">
          {paginatedCandidates.length === 0 ? (
            <div 
              className="text-center py-12"
              role="status"
              aria-live="polite"
            >
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Aucun candidat ne correspond à vos critères
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 text-sm text-primary-500 hover:text-primary-600
                           focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
                  aria-label="Réinitialiser les filtres pour voir tous les candidats"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCandidates.map((candidate) => (
                  <CandidateCard 
                    key={candidate._id} 
                    candidate={candidate} 
                    onDelete={handleDeleteCandidate}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="mt-8" role="navigation" aria-label="Pagination">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};
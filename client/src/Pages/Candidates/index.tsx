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
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const response = await api.get('/api/candidates', {
        params: { limit: 1000, page: 1 },
      });

      setAllCandidates(response.data.candidates);
      announceToScreenReader(`${response.data.candidates.length} candidats chargés`);
    } catch (error) {
      setError('Impossible de charger les candidats.');
      announceToScreenReader('Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const announceToScreenReader = (message: string) => {
    const announcer = document.getElementById('a11y-announcer');
    if (announcer) {
      announcer.textContent = message;
      setTimeout(() => (announcer.textContent = ''), 3000);
    }
  };

  const handleRefresh = () => fetchAllCandidates(true);

  const filteredCandidates = useMemo(() => {
    let result = [...allCandidates];

    if (filters.name?.trim()) {
      const searchTerm = filters.name.toLowerCase().trim();
      result = result.filter(c => c.name?.toLowerCase().includes(searchTerm));
    }

    if (filters.status?.trim()) {
      result = result.filter(c => c.status === filters.status);
    }

    if (filters.position?.trim()) {
      const searchTerm = filters.position.toLowerCase().trim();
      result = result.filter(c => c.position?.toLowerCase().includes(searchTerm));
    }

    return result;
  }, [allCandidates, filters]);

  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(start, start + itemsPerPage);
  }, [filteredCandidates, currentPage]);

  useEffect(() => {
    const newTotal = Math.ceil(filteredCandidates.length / itemsPerPage);
    setTotalPages(newTotal || 1);
  }, [filteredCandidates]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ name: '', status: '', position: '' });
    setCurrentPage(1);
    setShowFilters(false);
    searchInputRef.current?.focus();
  };

  const activeFilterCount = Object.values(filters).filter(v => v?.trim()).length;

  const handleDeleteCandidate = (deletedId: string) => {
    setAllCandidates(prev => prev.filter(c => c._id !== deletedId));
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="space-y-4 mb-6">
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-1/3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <CandidateCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />

      <div id="a11y-announcer" className="sr-only" aria-live="polite" />

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER BAR */}
        <section className="mb-10 space-y-5">

          <div className="flex flex-col md:flex-row gap-4 md:items-center">

            {/* SEARCH */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                ref={searchInputRef}
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder="Rechercher un candidat..."
                className="w-full pl-10 pr-4 py-2 border border-black/10 rounded-lg
                         bg-white text-black
                         focus:outline-none focus:ring-1 focus:ring-black"
              />
              {filters.name && (
                <button
                  onClick={() => handleFilterChange('name', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">

              <button
                onClick={() => navigate('/candidates/create')}
                className="px-4 py-2 rounded-lg bg-black text-white
                         hover:bg-gray-900 transition"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Ajouter
              </button>

              <button
                ref={filterButtonRef}
                onClick={() => setShowFilters(v => !v)}
                className="px-4 py-2 border border-black/10 rounded-lg
                         hover:bg-black hover:text-white transition
                         relative"
              >
                <Filter className="w-4 h-4 inline mr-2" />
                Filtres
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-xs bg-black text-white w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

            </div>
          </div>

          {/* FILTER PANEL */}
          {showFilters && (
            <div
              ref={filterPanelRef}
              className="border border-black/10 rounded-xl p-5 bg-gray-50 space-y-4"
            >
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-2 border border-black/10 rounded-lg bg-white"
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <input
                value={filters.position}
                onChange={(e) => handleFilterChange('position', e.target.value)}
                placeholder="Filtrer par poste"
                className="w-full p-2 border border-black/10 rounded-lg"
              />

              <div className="flex justify-between">
                <button onClick={resetFilters} className="text-sm text-gray-600 hover:text-black">
                  Réinitialiser
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-black text-white rounded-lg"
                >
                  Appliquer
                </button>
              </div>
            </div>
          )}

          {/* INFO BAR */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>{filteredCandidates.length} candidats</span>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 hover:text-black"
            >
              <RefreshCw className="w-4 h-4" />
              {refreshing ? 'Chargement...' : 'Rafraîchir'}
            </button>
          </div>

        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-6 p-4 border border-black/10 bg-white rounded-lg flex gap-2">
            <AlertCircle className="w-4 h-4 mt-1" />
            <span>{error}</span>
          </div>
        )}

        {/* LIST */}
        {paginatedCandidates.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Aucun candidat trouvé
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCandidates.map(c => (
                <CandidateCard
                  key={c._id}
                  candidate={c}
                  onDelete={handleDeleteCandidate}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
};
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  Plus,
  RefreshCw,
  AlertCircle,
  List,
  LayoutGrid,
} from 'lucide-react';
import api from '../../lib/axios';
import type { Candidate } from '../../types';
import { CandidateCard } from '../../components/CandidateCard';
import { Pagination } from '../../components/Pagination';
import { Header } from '../../components/Header';

type ViewMode = 'list' | 'grid';

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'validated', label: 'Validé' },
] as const;

const VIEW_STORAGE_KEY = 'candidatesViewMode';

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
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(VIEW_STORAGE_KEY);
    return saved === 'grid' || saved === 'list' ? saved : 'list';
  });

  const itemsPerPage = viewMode === 'list' ? 12 : 9;

  useEffect(() => {
    fetchAllCandidates();
  }, []);

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
    setCurrentPage(1);
  }, [viewMode]);

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
    } catch {
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
      result = result.filter((c) => c.name?.toLowerCase().includes(searchTerm));
    }

    if (filters.status?.trim()) {
      result = result.filter((c) => c.status === filters.status);
    }

    if (filters.position?.trim()) {
      const searchTerm = filters.position.toLowerCase().trim();
      result = result.filter((c) =>
        c.position?.toLowerCase().includes(searchTerm)
      );
    }

    return result;
  }, [allCandidates, filters]);

  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(start, start + itemsPerPage);
  }, [filteredCandidates, currentPage, itemsPerPage]);

  useEffect(() => {
    const newTotal = Math.ceil(filteredCandidates.length / itemsPerPage);
    setTotalPages(newTotal || 1);
    if (currentPage > (newTotal || 1)) setCurrentPage(1);
  }, [filteredCandidates, itemsPerPage, currentPage]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ name: '', status: '', position: '' });
    setCurrentPage(1);
    setShowFilters(false);
    searchInputRef.current?.focus();
  };

  const activeFilterCount = Object.values(filters).filter((v) => v?.trim()).length;

  const handleDeleteCandidate = (deletedId: string) => {
    setAllCandidates((prev) => prev.filter((c) => c._id !== deletedId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Header />

      <div id="a11y-announcer" className="sr-only" aria-live="polite" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <section className="mb-8">
          <p className="font-brand text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            TiahMHeranto Company
          </p>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-brand text-3xl font-extrabold tracking-tight text-light-text dark:text-dark-text">
                Candidats
              </h1>
              <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {filteredCandidates.length} profil
                {filteredCandidates.length > 1 ? 's' : ''} dans le pipeline
              </p>
            </div>

            <button
              onClick={() => navigate('/candidates/create')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>
        </section>

        <section className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder="Rechercher un candidat..."
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-light-border dark:border-dark-border
                         bg-white dark:bg-slate-900 text-sm
                         focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              {filters.name && (
                <button
                  onClick={() => handleFilterChange('name', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                ref={filterButtonRef}
                onClick={() => setShowFilters((v) => !v)}
                className="relative px-3 py-2.5 rounded-lg border border-light-border dark:border-dark-border
                         text-sm hover:bg-slate-900 hover:text-white transition inline-flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtres
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-[10px] bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div
                className="inline-flex rounded-lg border border-light-border dark:border-dark-border p-0.5"
                role="group"
                aria-label="Mode d'affichage"
              >
                <button
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  className={`px-3 py-2 rounded-md text-sm inline-flex items-center gap-1.5 transition ${
                    viewMode === 'list'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                  Liste
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  className={`px-3 py-2 rounded-md text-sm inline-flex items-center gap-1.5 transition ${
                    viewMode === 'grid'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Grille
                </button>
              </div>

              <button
                onClick={handleRefresh}
                className="px-3 py-2.5 rounded-lg border border-light-border dark:border-dark-border
                         text-sm inline-flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {refreshing ? 'Chargement...' : 'Rafraîchir'}
                </span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div
              ref={filterPanelRef}
              className="rounded-xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-slate-900 text-sm"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <input
                  value={filters.position}
                  onChange={(e) => handleFilterChange('position', e.target.value)}
                  placeholder="Filtrer par poste"
                  className="w-full p-2.5 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-slate-900 text-sm"
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={resetFilters}
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm"
                >
                  Appliquer
                </button>
              </div>
            </div>
          )}
        </section>

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 flex gap-2 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {paginatedCandidates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-light-border dark:border-dark-border py-16 text-center text-light-text-secondary dark:text-dark-text-secondary">
            Aucun candidat trouvé
          </div>
        ) : viewMode === 'list' ? (
          <div className="rounded-xl border border-light-border dark:border-dark-border overflow-hidden bg-light-bg-secondary dark:bg-dark-bg-secondary">
            <div className="hidden sm:grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto_auto_auto] gap-4 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-light-border dark:border-dark-border bg-slate-50/80 dark:bg-white/[0.02]">
              <span>Nom</span>
              <span>Poste</span>
              <span className="text-center">Statut</span>
              <span className="text-right">Exp.</span>
              <span className="text-right pr-2">Actions</span>
            </div>
            <div className="divide-y divide-light-border dark:divide-dark-border">
              {paginatedCandidates.map((c) => (
                <CandidateCard
                  key={c._id}
                  candidate={c}
                  view="list"
                  onDelete={handleDeleteCandidate}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedCandidates.map((c) => (
              <CandidateCard
                key={c._id}
                candidate={c}
                view="grid"
                onDelete={handleDeleteCandidate}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </main>
    </div>
  );
};

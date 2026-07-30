import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Clock3,
  Plus,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useCandidates } from '../../hooks/useCandidates';
import type { Candidate } from '../../types';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { allCandidates, loading, error } = useCandidates();

  const stats = useMemo(() => {
    const total = allCandidates.length;
    const pending = allCandidates.filter((c) => c.status === 'pending').length;
    const validated = allCandidates.filter((c) => c.status === 'validated').length;
    const avgExperience =
      total === 0
        ? 0
        : Math.round(
            (allCandidates.reduce((sum, c) => sum + (c.experience || 0), 0) / total) *
              10
          ) / 10;

    return { total, pending, validated, avgExperience };
  }, [allCandidates]);

  const recentCandidates = useMemo(
    () =>
      [...allCandidates]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [allCandidates]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <Header />
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="lg" message="Chargement du tableau de bord..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12 animate-fade-in">
        {/* Brand welcome */}
        <section className="relative overflow-hidden rounded-2xl border border-light-border dark:border-dark-border bg-[#0f172a] text-white px-6 py-10 sm:px-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.18), transparent 42%), radial-gradient(circle at 85% 80%, rgba(148,163,184,0.25), transparent 40%)',
            }}
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="font-brand text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                Tableau de bord
              </p>
              <h1 className="font-brand mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
                TiahMHeranto Company
              </h1>
              <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                Vue d’ensemble du recrutement. Suivez vos candidats, validez les
                profils et pilotez vos prochaines embauches.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/candidates')}
                className="inline-flex items-center gap-2 rounded-lg bg-white text-slate-900 px-4 py-2.5 text-sm font-medium hover:bg-slate-100 transition"
              >
                Voir les candidats
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/candidates/create')}
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition"
              >
                <Plus className="w-4 h-4" />
                Nouveau candidat
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Metrics */}
        <section>
          <h2 className="font-brand text-xl font-bold text-light-text dark:text-dark-text mb-5">
            Indicateurs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Metric
              icon={<Users className="w-5 h-5" />}
              label="Candidats"
              value={String(stats.total)}
            />
            <Metric
              icon={<Clock3 className="w-5 h-5" />}
              label="En attente"
              value={String(stats.pending)}
            />
            <Metric
              icon={<UserCheck className="w-5 h-5" />}
              label="Validés"
              value={String(stats.validated)}
            />
            <Metric
              icon={<Briefcase className="w-5 h-5" />}
              label="Expérience moy."
              value={`${stats.avgExperience} ans`}
            />
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-brand text-xl font-bold text-light-text dark:text-dark-text">
                Activité récente
              </h2>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                Derniers profils ajoutés au pipeline
              </p>
            </div>
            <button
              onClick={() => navigate('/candidates')}
              className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:underline inline-flex items-center gap-1"
            >
              Tout voir
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {recentCandidates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-light-border dark:border-dark-border px-6 py-12 text-center">
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Aucun candidat pour le moment.
              </p>
              <button
                onClick={() => navigate('/candidates/create')}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 transition"
              >
                <Plus className="w-4 h-4" />
                Ajouter le premier candidat
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-light-border dark:divide-dark-border rounded-xl border border-light-border dark:border-dark-border overflow-hidden bg-light-bg-secondary dark:bg-dark-bg-secondary">
              {recentCandidates.map((candidate) => (
                <RecentRow
                  key={candidate._id}
                  candidate={candidate}
                  onOpen={() => navigate(`/candidates/${candidate._id}`)}
                />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

const Metric = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="rounded-xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-5">
    <div className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary text-sm">
      {icon}
      <span>{label}</span>
    </div>
    <p className="font-brand mt-3 text-3xl font-bold tracking-tight text-light-text dark:text-dark-text">
      {value}
    </p>
  </div>
);

const RecentRow = ({
  candidate,
  onOpen,
}: {
  candidate: Candidate;
  onOpen: () => void;
}) => (
  <li>
    <button
      onClick={onOpen}
      className="w-full text-left px-5 py-4 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition flex items-center justify-between gap-4"
    >
      <div className="min-w-0">
        <p className="font-medium text-light-text dark:text-dark-text truncate">
          {candidate.name}
        </p>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">
          {candidate.position}
        </p>
      </div>
      <span
        className={`shrink-0 text-xs px-2.5 py-1 rounded-full ${
          candidate.status === 'validated'
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-amber-100 text-amber-800'
        }`}
      >
        {candidate.status === 'validated' ? 'Validé' : 'En attente'}
      </span>
    </button>
  </li>
);

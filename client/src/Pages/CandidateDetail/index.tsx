import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Star,
  CheckCircle,
  Calendar,
  Edit2,
  Trash2,
  AlertCircle,
  Download,
  Code2,
} from 'lucide-react';
import api from '../../lib/axios';
import type { Candidate } from '../../types';
import { exportCandidatePdf } from '../../utils/exportCandidatePdf';
import { getIsOffline } from '../../hooks/useOffline';

import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Toast } from '../../components/Toast';

export const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/candidates/${id}`);
      setCandidate(response.data);
    } catch (err: any) {
      setCandidate(null);
      setError(
        err.response?.data?.message ||
          'Impossible de charger les détails du candidat'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!confirm('Valider ce candidat ?')) return;

    setValidating(true);
    setError(null);

    try {
      await api.post(`/api/candidates/${id}/validate`);
      setSuccessMessage(
        getIsOffline()
          ? 'Candidat validé (mode hors-ligne).'
          : 'Validation lancée — mise à jour dans un instant…'
      );

      // Backend async job ~2s; offline store validates immediately
      setTimeout(async () => {
        await fetchCandidate();
        setSuccessMessage('Candidat validé avec succès !');
        setValidating(false);
      }, getIsOffline() ? 300 : 2200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur validation');
      setValidating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer ce candidat ?')) return;

    setDeleting(true);
    setError(null);

    try {
      await api.delete(`/api/candidates/${id}`);
      setSuccessMessage('Candidat supprimé !');
      setTimeout(() => navigate('/candidates'), 900);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur suppression');
      setDeleting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!candidate) return;

    setExporting(true);
    setError(null);

    try {
      await exportCandidatePdf(candidate);
      setSuccessMessage('PDF exporté avec succès !');
    } catch (err) {
      console.error('PDF export failed', err);
      setError("Erreur lors de l'export PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <Header />
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="lg" message="Chargement du profil..." />
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="font-brand text-2xl font-bold text-light-text dark:text-dark-text">
            Candidat introuvable
          </h1>
          <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {error || 'Ce profil n’existe pas ou a été supprimé.'}
          </p>
          <button
            onClick={() => navigate('/candidates')}
            className="mt-6 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800 transition"
          >
            Retour à la liste
          </button>
        </main>
      </div>
    );
  }

  const isValidated = candidate.status === 'validated';
  const createdLabel = candidate.createdAt
    ? new Date(candidate.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        {successMessage && (
          <Toast
            message={successMessage}
            type="success"
            onClose={() => setSuccessMessage(null)}
          />
        )}

        <button
          onClick={() => navigate('/candidates')}
          className="mb-8 flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux candidats
        </button>

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 flex justify-between gap-3 text-sm">
            <span className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              className="shrink-0 hover:opacity-70"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Identity header */}
        <section className="relative overflow-hidden rounded-2xl border border-light-border dark:border-dark-border bg-[#0f172a] text-white px-6 py-8 sm:px-8 mb-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(circle at 12% 20%, rgba(255,255,255,0.16), transparent 40%), radial-gradient(circle at 90% 75%, rgba(148,163,184,0.22), transparent 38%)',
            }}
          />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="font-brand text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                TiahMHeranto Company · Profil
              </p>
              <h1 className="font-brand mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight break-words">
                {candidate.name}
              </h1>
              <p className="mt-2 text-slate-300 text-sm sm:text-base">
                {candidate.position}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isValidated
                      ? 'bg-emerald-400/20 text-emerald-200'
                      : 'bg-amber-400/20 text-amber-100'
                  }`}
                >
                  {isValidated ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : null}
                  {isValidated ? 'Validé' : 'En attente'}
                </span>
                {getIsOffline() && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200">
                    Mode hors-ligne
                  </span>
                )}
              </div>
            </div>

            {/* Primary actions */}
            <div className="flex flex-wrap gap-2">
              {!isValidated && (
                <ActionButton
                  onClick={handleValidate}
                  loading={validating}
                  variant="primary"
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Valider
                </ActionButton>
              )}
              <ActionButton
                onClick={() => navigate(`/candidates/${id}/edit`)}
                variant="secondary"
                icon={<Edit2 className="w-4 h-4" />}
              >
                Modifier
              </ActionButton>
              <ActionButton
                onClick={handleExportPDF}
                loading={exporting}
                variant="ghost"
                icon={<Download className="w-4 h-4" />}
              >
                PDF
              </ActionButton>
              <ActionButton
                onClick={handleDelete}
                loading={deleting}
                variant="danger"
                icon={<Trash2 className="w-4 h-4" />}
              >
                Supprimer
              </ActionButton>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          {/* Contact & role */}
          <section className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 sm:p-7">
            <h2 className="font-brand text-lg font-bold text-light-text dark:text-dark-text mb-5">
              Informations
            </h2>

            <dl className="space-y-4">
              <DetailRow
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={
                  <a
                    href={`mailto:${candidate.email}`}
                    className="hover:underline break-all"
                  >
                    {candidate.email}
                  </a>
                }
              />
              <DetailRow
                icon={<Phone className="w-4 h-4" />}
                label="Téléphone"
                value={
                  <a href={`tel:${candidate.phone}`} className="hover:underline">
                    {candidate.phone}
                  </a>
                }
              />
              <DetailRow
                icon={<Briefcase className="w-4 h-4" />}
                label="Poste"
                value={candidate.position}
              />
              <DetailRow
                icon={<Star className="w-4 h-4" />}
                label="Expérience"
                value={`${candidate.experience} an${candidate.experience > 1 ? 's' : ''}`}
              />
              <DetailRow
                icon={<Calendar className="w-4 h-4" />}
                label="Ajouté le"
                value={createdLabel}
              />
            </dl>
          </section>

          {/* Skills + quick summary */}
          <section className="space-y-6">
            <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 sm:p-7">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="w-4 h-4 text-slate-500" />
                <h2 className="font-brand text-lg font-bold text-light-text dark:text-dark-text">
                  Compétences
                </h2>
              </div>

              {candidate.skills?.length ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Aucune compétence renseignée.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 sm:p-7">
              <h2 className="font-brand text-lg font-bold text-light-text dark:text-dark-text mb-3">
                Actions rapides
              </h2>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                Exportez la fiche, mettez à jour le profil ou retirez le candidat
                du pipeline.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="w-full text-left px-4 py-3 rounded-lg border border-light-border dark:border-dark-border text-sm
                           hover:bg-slate-900 hover:text-white transition disabled:opacity-50"
                >
                  Exporter la fiche PDF
                </button>
                <button
                  onClick={() => navigate(`/candidates/${id}/edit`)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-light-border dark:border-dark-border text-sm
                           hover:bg-slate-900 hover:text-white transition"
                >
                  Modifier les informations
                </button>
                {!isValidated && (
                  <button
                    onClick={handleValidate}
                    disabled={validating}
                    className="w-full text-left px-4 py-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm
                             hover:bg-emerald-600 hover:text-white transition disabled:opacity-50"
                  >
                    {validating ? 'Validation en cours…' : 'Valider ce candidat'}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex gap-3 items-start">
    <div className="mt-0.5 text-slate-400 shrink-0">{icon}</div>
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm sm:text-base font-medium text-light-text dark:text-dark-text">
        {value}
      </dd>
    </div>
  </div>
);

const ActionButton = ({
  children,
  onClick,
  loading,
  icon,
  variant = 'secondary',
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) => {
  const styles = {
    primary: 'bg-white text-slate-900 hover:bg-slate-100',
    secondary: 'border border-white/25 hover:bg-white/10',
    ghost: 'border border-white/15 text-slate-200 hover:bg-white/10',
    danger: 'border border-red-400/40 text-red-200 hover:bg-red-500/20',
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${styles}`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};

import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Eye } from 'lucide-react';
import type { Candidate } from '../../types';
import api from '../../lib/axios';

interface CandidateCardProps {
  candidate: Candidate;
  view?: 'list' | 'grid';
  onDelete?: (id: string) => void;
}

export const CandidateCard = ({
  candidate,
  view = 'list',
  onDelete,
}: CandidateCardProps) => {
  const navigate = useNavigate();

  const statusLabel = candidate.status === 'validated' ? 'Validé' : 'En attente';
  const statusClass =
    candidate.status === 'validated'
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-amber-100 text-amber-800';

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/candidates/${candidate._id}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Supprimer ${candidate.name} ?`)) return;

    try {
      await api.delete(`/api/candidates/${candidate._id}`);
      onDelete?.(candidate._id);
    } catch {
      alert('Erreur lors de la suppression du candidat');
    }
  };

  const handleOpen = () => navigate(`/candidates/${candidate._id}`);

  const Actions = ({ compact = false }: { compact?: boolean }) => (
    <div
      className={`flex items-center gap-1 ${compact ? '' : 'opacity-100'}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleOpen}
        className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        title="Voir"
        aria-label={`Voir ${candidate.name}`}
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={handleEdit}
        className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        title="Modifier"
        aria-label={`Modifier ${candidate.name}`}
      >
        <Edit2 className="h-4 w-4" />
      </button>
      <button
        onClick={handleDelete}
        className="p-2 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        title="Supprimer"
        aria-label={`Supprimer ${candidate.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  if (view === 'grid') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpen();
          }
        }}
        className="rounded-xl border border-light-border dark:border-dark-border
                   bg-light-bg-secondary dark:bg-dark-bg-secondary p-4
                   hover:border-slate-400 dark:hover:border-slate-500 transition cursor-pointer
                   flex flex-col gap-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-medium text-light-text dark:text-dark-text truncate">
              {candidate.name}
            </h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate mt-0.5">
              {candidate.position}
            </p>
          </div>
          <span className={`shrink-0 text-xs px-2 py-1 rounded-full ${statusClass}`}>
            {statusLabel}
          </span>
        </div>

        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
          {candidate.experience} ans d’expérience
        </p>

        <div className="mt-auto pt-2 border-t border-light-border dark:border-dark-border flex justify-end">
          <Actions compact />
        </div>
      </div>
    );
  }

  // List row
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpen();
        }
      }}
      className="grid grid-cols-[1fr_auto] sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto_auto_auto]
                 gap-3 sm:gap-4 items-center px-4 py-3
                 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition cursor-pointer"
    >
      <div className="min-w-0">
        <p className="font-medium text-light-text dark:text-dark-text truncate">
          {candidate.name}
        </p>
        <p className="sm:hidden text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">
          {candidate.position}
        </p>
      </div>

      <p className="hidden sm:block text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">
        {candidate.position}
      </p>

      <span className={`hidden sm:inline-flex text-xs px-2.5 py-1 rounded-full justify-center ${statusClass}`}>
        {statusLabel}
      </span>

      <p className="hidden md:block text-sm text-light-text-secondary dark:text-dark-text-secondary text-right tabular-nums">
        {candidate.experience} ans
      </p>

      <div className="justify-self-end">
        <Actions />
      </div>
    </div>
  );
};

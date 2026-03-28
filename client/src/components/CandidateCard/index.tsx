// src/components/CandidateCard.tsx
import { useNavigate } from 'react-router-dom';
import { Briefcase, Mail, Phone, Star, Edit2, Trash2 } from 'lucide-react';
import type { Candidate } from '../../types';
import api from '../../lib/axios';

interface CandidateCardProps {
  candidate: Candidate;
  onDelete?: (id: string) => void; // Callback optionnel pour rafraîchir la liste après suppression
}

export const CandidateCard = ({ candidate, onDelete }: CandidateCardProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    return status === 'validated'
      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche la navigation vers le détail
    navigate(`/candidates/${candidate._id}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche la navigation vers le détail
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${candidate.name} ?`)) return;
    
    try {
      await api.delete(`/api/candidates/${candidate._id}`);
      // Appeler le callback pour rafraîchir la liste si fourni
      if (onDelete) {
        onDelete(candidate._id);
      } else {
        // Sinon, recharger la page
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression', error);
      alert('Erreur lors de la suppression du candidat');
    }
  };

  return (
    <div className="relative group">
      {/* Carte principale avec navigation */}
      <div
        onClick={() => navigate(`/candidates/${candidate._id}`)}
        className="bg-light-bg-secondary dark:bg-dark-bg-secondary
                   border border-light-border dark:border-dark-border
                   rounded-lg p-6 hover:shadow-lg transition-all duration-200
                   cursor-pointer hover:scale-[1.02]"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
            {candidate.name}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
            {candidate.status === 'validated' ? 'Validé' : 'En attente'}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <Mail className="h-4 w-4" />
            <span>{candidate.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <Phone className="h-4 w-4" />
            <span>{candidate.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <Briefcase className="h-4 w-4" />
            <span>{candidate.position}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <Star className="h-4 w-4" />
            <span>{candidate.experience} ans d'expérience</span>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {candidate.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-800
                         text-gray-600 dark:text-gray-400"
            >
              {skill}
            </span>
          ))}
          {candidate.skills.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-800
                           text-gray-600 dark:text-gray-400">
              +{candidate.skills.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Boutons d'action (apparaissent au survol) */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Bouton Modifier */}
        <button
          onClick={handleEdit}
          className="p-2 bg-orange-500 hover:bg-orange-600
                   text-white rounded-md shadow-lg
                   transition-all duration-200 hover:scale-110"
          title="Modifier"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        
        {/* Bouton Supprimer */}
        <button
          onClick={handleDelete}
          className="p-2 bg-red-600 hover:bg-red-700
                   text-white rounded-md shadow-lg
                   transition-all duration-200 hover:scale-110"
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
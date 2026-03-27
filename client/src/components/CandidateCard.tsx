// src/components/CandidateCard.tsx
import { useNavigate } from 'react-router-dom';
import { Briefcase, Mail, Phone, Star } from 'lucide-react';
import type { Candidate } from '../types';

interface CandidateCardProps {
  candidate: Candidate;
}

export const CandidateCard = ({ candidate }: CandidateCardProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    return status === 'validated'
      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
  };

  return (
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
  );
};
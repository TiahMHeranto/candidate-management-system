// src/Pages/CandidateDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Briefcase, Star, CheckCircle, Award } from 'lucide-react';
import api from '../../lib/axios';
import type { Candidate } from '../../types';
import { Header } from '../../components/Header';

export const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    try {
      const response = await api.get(`/api/candidates/${id}`);
      setCandidate(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du candidat', error);
      setError('Impossible de charger les détails du candidat');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!confirm('Êtes-vous sûr de vouloir valider ce candidat ?')) return;
    
    setValidating(true);
    setError(null);
    
    try {
      await api.post(`/api/candidates/${id}/validate`);
      await fetchCandidate();
    } catch (error) {
      console.error('Erreur lors de la validation', error);
      setError('Erreur lors de la validation du candidat');
    } finally {
      setValidating(false);
    }
  };

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

  if (!candidate) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Candidat non trouvé
            </p>
            <button
              onClick={() => navigate('/candidates')}
              className="mt-4 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
                       rounded-md hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/candidates')}
          className="mb-6 flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary
                   hover:text-light-text dark:hover:text-dark-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                        rounded-md text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary
                       border border-light-border dark:border-dark-border
                       rounded-lg overflow-hidden">
          <div className="p-6 border-b border-light-border dark:border-dark-border">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
                  {candidate.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    candidate.status === 'validated'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {candidate.status === 'validated' ? 'Validé' : 'En attente de validation'}
                  </span>
                </div>
              </div>
              {candidate.status === 'pending' && (
                <button
                  onClick={handleValidate}
                  disabled={validating}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700
                           text-white rounded-md font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors duration-200 flex items-center gap-2"
                >
                  {validating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Validation...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Valider le candidat
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Email
                    </p>
                    <p className="text-light-text dark:text-dark-text">
                      {candidate.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Téléphone
                    </p>
                    <p className="text-light-text dark:text-dark-text">
                      {candidate.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Poste
                    </p>
                    <p className="text-light-text dark:text-dark-text">
                      {candidate.position}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Expérience
                    </p>
                    <p className="text-light-text dark:text-dark-text">
                      {candidate.experience} ans
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Date de candidature
                    </p>
                    <p className="text-light-text dark:text-dark-text">
                      {new Date(candidate.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-3">
                Compétences
              </h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800
                             text-gray-700 dark:text-gray-300 text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
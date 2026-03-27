// src/Pages/CandidateDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Briefcase, Star, CheckCircle, Award, 
  Edit2, Trash2, AlertCircle 
} from 'lucide-react';
import api from '../../lib/axios';
import type { Candidate } from '../../types';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { LoadingButton } from '../../components/LoadingButton';
import { Toast } from '../../components/Toast';

export const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
    } catch (error: any) {
      console.error('Erreur lors du chargement du candidat', error);
      setError(error.response?.data?.message || 'Impossible de charger les détails du candidat');
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
      setSuccessMessage('Candidat validé avec succès !');
      // Attendre 2 secondes avant de recharger pour voir le message de succès
      setTimeout(() => {
        fetchCandidate();
      }, 2000);
    } catch (error: any) {
      console.error('Erreur lors de la validation', error);
      setError(error.response?.data?.message || 'Erreur lors de la validation du candidat');
    } finally {
      setValidating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce candidat ? Cette action est irréversible.')) return;
    
    setDeleting(true);
    setError(null);
    
    try {
      await api.delete(`/api/candidates/${id}`);
      setSuccessMessage('Candidat supprimé avec succès !');
      // Rediriger après 1.5 secondes pour voir le message
      setTimeout(() => {
        navigate('/candidates');
      }, 1500);
    } catch (error: any) {
      console.error('Erreur lors de la suppression', error);
      setError(error.response?.data?.message || 'Erreur lors de la suppression du candidat');
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/candidates/${id}/edit`);
  };

  // Loading state avec spinner amélioré
  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <Header />
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="lg" message="Chargement du candidat..." />
        </div>
      </div>
    );
  }

  // Error state pour candidat non trouvé
  if (!candidate) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="mb-4">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            </div>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg mb-4">
              Candidat non trouvé
            </p>
            <button
              onClick={() => navigate('/candidates')}
              className="px-6 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
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
        {/* Toast pour les messages de succès */}
        {successMessage && (
          <Toast
            message={successMessage}
            type="success"
            onClose={() => setSuccessMessage(null)}
            duration={3000}
          />
        )}

        <button
          onClick={() => navigate('/candidates')}
          className="mb-6 flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary
                   hover:text-light-text dark:hover:text-dark-text transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Retour à la liste
        </button>

        {/* Message d'erreur amélioré */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                        rounded-md text-red-600 dark:text-red-400 flex items-start gap-2 animate-shake">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary
                       border border-light-border dark:border-dark-border
                       rounded-lg overflow-hidden shadow-lg">
          <div className="p-6 border-b border-light-border dark:border-dark-border bg-gradient-to-r from-transparent to-gray-50 dark:to-gray-900/20">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
                  {candidate.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    candidate.status === 'validated'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {candidate.status === 'validated' ? '✓ Validé' : '⏳ En attente de validation'}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3">
                {candidate.status === 'pending' && (
                  <LoadingButton
                    onClick={handleValidate}
                    loading={validating}
                    loadingText="Validation en cours..."
                    variant="success"
                    icon={<CheckCircle className="h-4 w-4" />}
                  >
                    Valider
                  </LoadingButton>
                )}
                
                <LoadingButton
                  onClick={handleEdit}
                  variant="warning"
                  icon={<Edit2 className="h-4 w-4" />}
                >
                  Modifier
                </LoadingButton>
                
                <LoadingButton
                  onClick={handleDelete}
                  loading={deleting}
                  loadingText="Suppression..."
                  variant="danger"
                  icon={<Trash2 className="h-4 w-4" />}
                >
                  Supprimer
                </LoadingButton>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Email
                    </p>
                    <p className="text-light-text dark:text-dark-text font-medium">
                      {candidate.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Téléphone
                    </p>
                    <p className="text-light-text dark:text-dark-text font-medium">
                      {candidate.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Poste
                    </p>
                    <p className="text-light-text dark:text-dark-text font-medium">
                      {candidate.position}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <Star className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Expérience
                    </p>
                    <p className="text-light-text dark:text-dark-text font-medium">
                      {candidate.experience} {candidate.experience === 1 ? 'an' : 'ans'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <Award className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Date de candidature
                    </p>
                    <p className="text-light-text dark:text-dark-text font-medium">
                      {new Date(candidate.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                Compétences
              </h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800
                             text-gray-700 dark:text-gray-300 text-sm font-medium
                             hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
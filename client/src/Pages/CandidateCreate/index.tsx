// src/pages/CandidateCreate.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, AlertCircle, User, Mail, Phone, Briefcase, Calendar, Code } from 'lucide-react';
import api from '../../lib/axios';
import { Header } from '../../components/Header';

interface CandidateFormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: number;
  skills: string;
}

export const CandidateCreate = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CandidateFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      position: '',
      experience: 0,
      skills: '',
    },
  });

  const onSubmit = async (data: CandidateFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      // Transformer les compétences en tableau
      const skillsArray = data.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill);

      const candidateData = {
        ...data,
        skills: skillsArray,
        experience: Number(data.experience),
      };

      const response = await api.post('/api/candidates', candidateData);
      
      // Rediriger vers la page du candidat créé
      navigate(`/candidates/${response.data._id}`);
    } catch (error: any) {
      console.error('Erreur lors de la création', error);
      
      // Gérer les erreurs du serveur
      if (error.response?.data?.message) {
        const serverMessage = error.response.data.message;
        
        // Vérifier si c'est une erreur de validation spécifique
        if (serverMessage.includes('email')) {
          setError('email', { message: serverMessage });
        } else if (serverMessage.includes('phone')) {
          setError('phone', { message: serverMessage });
        } else if (serverMessage.includes('compétence')) {
          setError('skills', { message: serverMessage });
        } else {
          setServerError(serverMessage);
        }
      } else {
        setServerError('Une erreur est survenue lors de la création du candidat');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/candidates')}
          className="mb-6 flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary
                   hover:text-light-text dark:hover:text-dark-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </button>

        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary
                       border border-light-border dark:border-dark-border
                       rounded-lg overflow-hidden">
          <div className="p-6 border-b border-light-border dark:border-dark-border">
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">
              Nouveau candidat
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">
              Remplissez les informations du candidat
            </p>
          </div>

          {serverError && (
            <div className="m-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                          rounded-md text-red-600 dark:text-red-400 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Nom complet *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('name', {
                    required: 'Le nom est requis',
                    minLength: {
                      value: 2,
                      message: 'Le nom doit contenir au moins 2 caractères',
                    },
                    maxLength: {
                      value: 100,
                      message: 'Le nom ne peut pas dépasser 100 caractères',
                    },
                  })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md
                             bg-light-bg dark:bg-dark-bg
                             text-light-text dark:text-dark-text
                             focus:outline-none focus:ring-2 focus:ring-gray-400
                             ${errors.name 
                               ? 'border-red-500 dark:border-red-500' 
                               : 'border-light-border dark:border-dark-border'
                             }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  {...register('email', {
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Veuillez fournir un email valide (exemple: nom@domaine.com)',
                    },
                  })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md
                             bg-light-bg dark:bg-dark-bg
                             text-light-text dark:text-dark-text
                             focus:outline-none focus:ring-2 focus:ring-gray-400
                             ${errors.email 
                               ? 'border-red-500 dark:border-red-500' 
                               : 'border-light-border dark:border-dark-border'
                             }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Téléphone *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  {...register('phone', {
                    required: 'Le numéro de téléphone est requis',
                    pattern: {
                      value: /^[0-9+\-\s]{10,}$/,
                      message: 'Veuillez fournir un numéro de téléphone valide (chiffres, espaces, tirets, + acceptés)',
                    },
                  })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md
                             bg-light-bg dark:bg-dark-bg
                             text-light-text dark:text-dark-text
                             focus:outline-none focus:ring-2 focus:ring-gray-400
                             ${errors.phone 
                               ? 'border-red-500 dark:border-red-500' 
                               : 'border-light-border dark:border-dark-border'
                             }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Poste */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Poste *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('position', {
                    required: 'Le poste est requis',
                    minLength: {
                      value: 2,
                      message: 'Le poste doit contenir au moins 2 caractères',
                    },
                  })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md
                             bg-light-bg dark:bg-dark-bg
                             text-light-text dark:text-dark-text
                             focus:outline-none focus:ring-2 focus:ring-gray-400
                             ${errors.position 
                               ? 'border-red-500 dark:border-red-500' 
                               : 'border-light-border dark:border-dark-border'
                             }`}
                />
              </div>
              {errors.position && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.position.message}
                </p>
              )}
            </div>

            {/* Expérience */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Années d'expérience *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  {...register('experience', {
                    required: 'Les années d\'expérience sont requises',
                    min: {
                      value: 0,
                      message: 'L\'expérience ne peut pas être négative',
                    },
                    max: {
                      value: 50,
                      message: 'L\'expérience ne peut pas dépasser 50 ans',
                    },
                    valueAsNumber: true,
                  })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md
                             bg-light-bg dark:bg-dark-bg
                             text-light-text dark:text-dark-text
                             focus:outline-none focus:ring-2 focus:ring-gray-400
                             ${errors.experience 
                               ? 'border-red-500 dark:border-red-500' 
                               : 'border-light-border dark:border-dark-border'
                             }`}
                />
              </div>
              {errors.experience && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* Compétences */}
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Compétences * (séparées par des virgules)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Code className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  rows={3}
                  {...register('skills', {
                    required: 'Au moins une compétence est requise',
                    validate: (value) => {
                      const skills = value.split(',').map(s => s.trim()).filter(s => s);
                      if (skills.length === 0) {
                        return 'Ajoutez au moins une compétence';
                      }
                      return true;
                    },
                  })}
                  placeholder="React, TypeScript, Node.js, ..."
                  className={`w-full pl-10 pr-3 py-2 border rounded-md
                             bg-light-bg dark:bg-dark-bg
                             text-light-text dark:text-dark-text
                             focus:outline-none focus:ring-2 focus:ring-gray-400
                             ${errors.skills 
                               ? 'border-red-500 dark:border-red-500' 
                               : 'border-light-border dark:border-dark-border'
                             }`}
                />
              </div>
              {errors.skills && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.skills.message}
                </p>
              )}
              <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Exemple: React, TypeScript, Node.js, MongoDB
              </p>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/candidates')}
                className="px-4 py-2 border border-light-border dark:border-dark-border
                         rounded-md text-light-text dark:text-dark-text
                         hover:bg-gray-100 dark:hover:bg-gray-800
                         transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-900 dark:bg-gray-100
                         text-gray-50 dark:text-gray-900
                         hover:bg-gray-700 dark:hover:bg-gray-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         rounded-md font-medium transition-all duration-200
                         flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Créer le candidat
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
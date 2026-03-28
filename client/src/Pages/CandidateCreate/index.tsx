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
      const skillsArray = data.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(Boolean);

      const candidateData = {
        ...data,
        skills: skillsArray,
        experience: Number(data.experience),
      };

      const response = await api.post('/api/candidates', candidateData);

      navigate(`/candidates/${response.data._id}`);
    } catch (error: any) {
      console.error('Erreur lors de la création', error);

      const message = error.response?.data?.message;

      if (message) {
        if (message.includes('email')) {
          setError('email', { message });
        } else if (message.includes('phone')) {
          setError('phone', { message });
        } else if (message.includes('compétence')) {
          setError('skills', { message });
        } else {
          setServerError(message);
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
          onClick={() => navigate('/')}
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
              <label className="block text-sm font-medium mb-2">Nom complet *</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  {...register('name', {
                    required: 'Le nom est requis',
                    minLength: { value: 2, message: 'Minimum 2 caractères' },
                  })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md
                    ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email requis',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Email invalide',
                    },
                  })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md
                    ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium mb-2">Téléphone *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  {...register('phone', {
                    required: 'Téléphone requis',
                  })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md
                    ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
            </div>

            {/* Poste */}
            <div>
              <label className="block text-sm font-medium mb-2">Poste *</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  {...register('position', {
                    required: 'Poste requis',
                  })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md
                    ${errors.position ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              {errors.position && <p className="text-red-500 text-sm">{errors.position.message}</p>}
            </div>

            {/* Expérience */}
            <div>
              <label className="block text-sm font-medium mb-2">Expérience *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  {...register('experience', { valueAsNumber: true })}
                  className="w-full pl-10 pr-3 py-2 border rounded-md border-gray-300"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium mb-2">Compétences *</label>
              <div className="relative">
                <Code className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <textarea
                  rows={3}
                  {...register('skills', { required: 'Compétences requises' })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md
                    ${errors.skills ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 border rounded-md"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md
                         flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Création...
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
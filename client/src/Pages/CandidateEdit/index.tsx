import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Code2,
} from 'lucide-react';
import api from '../../lib/axios';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useCandidateValidationRules } from '../../hooks/useCandidateValidationRules';
import { getIsOffline } from '../../hooks/useOffline';

interface CandidateFormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: number;
  skills: string;
}

export const CandidateEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const rules = useCandidateValidationRules();

  const [loading, setLoading] = useState(true);
  const [candidateName, setCandidateName] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setError,
    reset,
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

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    setLoading(true);
    setServerError(null);

    try {
      const response = await api.get(`/api/candidates/${id}`);
      const candidate = response.data;

      setCandidateName(candidate.name || '');
      reset({
        name: candidate.name || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        position: candidate.position || '',
        experience: candidate.experience || 0,
        skills: candidate.skills?.join(', ') || '',
      });
    } catch {
      setServerError('Impossible de charger le candidat');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CandidateFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const skillsArray = data.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.put(`/api/candidates/${id}`, {
        ...data,
        skills: skillsArray,
        experience: Number(data.experience),
      });

      navigate(`/candidates/${id}`);
    } catch (error: any) {
      const msg = error.response?.data?.message;

      if (msg?.toLowerCase().includes('email')) {
        setError('email', { message: msg });
      } else if (msg?.toLowerCase().includes('phone') || msg?.includes('téléphone')) {
        setError('phone', { message: msg });
      } else if (msg?.includes('compétence')) {
        setError('skills', { message: msg });
      } else {
        setServerError(msg || 'Erreur lors de la mise à jour');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <Header />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" message="Chargement du profil..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <button
          onClick={() => navigate(`/candidates/${id}`)}
          className="mb-8 flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au profil
        </button>

        {/* Page intro */}
        <section className="mb-8">
          <p className="font-brand text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            TiahMHeranto Company
          </p>
          <h1 className="font-brand mt-2 text-3xl font-extrabold tracking-tight text-light-text dark:text-dark-text">
            Modifier le candidat
          </h1>
          <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {candidateName
              ? `Mise à jour du profil de ${candidateName}`
              : 'Mettre à jour les informations du profil'}
            {getIsOffline() && (
              <span className="ml-2 text-amber-700">· Mode hors-ligne</span>
            )}
          </p>
        </section>

        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary overflow-hidden">
          {serverError && (
            <div className="m-6 mb-0 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                label="Nom complet"
                htmlFor="name"
                error={errors.name?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="name"
                  icon={<User className="w-4 h-4" />}
                  error={!!errors.name}
                  placeholder="Alice Martin"
                  {...register('name', rules.nameRules)}
                />
              </Field>

              <Field label="Email" htmlFor="email" error={errors.email?.message}>
                <Input
                  id="email"
                  type="email"
                  icon={<Mail className="w-4 h-4" />}
                  error={!!errors.email}
                  placeholder="alice@example.com"
                  {...register('email', rules.emailRules)}
                />
              </Field>

              <Field
                label="Téléphone"
                htmlFor="phone"
                error={errors.phone?.message}
              >
                <Input
                  id="phone"
                  icon={<Phone className="w-4 h-4" />}
                  error={!!errors.phone}
                  placeholder="+33 6 12 34 56 78"
                  {...register('phone', rules.phoneRules)}
                />
              </Field>

              <Field
                label="Poste"
                htmlFor="position"
                error={errors.position?.message}
              >
                <Input
                  id="position"
                  icon={<Briefcase className="w-4 h-4" />}
                  error={!!errors.position}
                  placeholder="Développeuse Frontend"
                  {...register('position', rules.positionRules)}
                />
              </Field>

              <Field
                label="Expérience (années)"
                htmlFor="experience"
                error={errors.experience?.message}
              >
                <Input
                  id="experience"
                  type="number"
                  min={0}
                  max={50}
                  icon={<Calendar className="w-4 h-4" />}
                  error={!!errors.experience}
                  {...register('experience', rules.experienceRules)}
                />
              </Field>

              <Field
                label="Compétences"
                htmlFor="skills"
                error={errors.skills?.message}
                hint="Séparez les compétences par des virgules"
                className="sm:col-span-2"
              >
                <div className="relative">
                  <div className="absolute left-3 top-3 text-slate-400 pointer-events-none">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <textarea
                    id="skills"
                    rows={3}
                    placeholder="React, TypeScript, Node.js"
                    {...register('skills', rules.skillsRules)}
                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-900
                      text-light-text dark:text-dark-text resize-none
                      focus:outline-none focus:ring-2 focus:ring-slate-400
                      ${
                        errors.skills
                          ? 'border-red-400'
                          : 'border-light-border dark:border-dark-border'
                      }`}
                  />
                </div>
              </Field>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-light-border dark:border-dark-border">
              <button
                type="button"
                onClick={() => navigate(`/candidates/${id}`)}
                className="px-4 py-2.5 rounded-lg border border-light-border dark:border-dark-border text-sm
                         hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium
                         hover:bg-slate-800 transition flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Enregistrer les modifications
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

const Field = ({
  label,
  htmlFor,
  error,
  hint,
  className = '',
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-light-text dark:text-dark-text"
    >
      {label}
    </label>
    {children}
    {hint && !error && (
      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
        {hint}
      </p>
    )}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

const Input = ({
  icon,
  error,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode;
  error?: boolean;
}) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
      {icon}
    </div>
    <input
      {...props}
      className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-900
        text-light-text dark:text-dark-text
        focus:outline-none focus:ring-2 focus:ring-slate-400
        disabled:opacity-50
        ${error ? 'border-red-400' : 'border-light-border dark:border-dark-border'}
        ${className}`}
    />
  </div>
);

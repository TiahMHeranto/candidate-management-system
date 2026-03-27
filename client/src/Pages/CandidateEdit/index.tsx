// src/pages/CandidateEdit.tsx
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
  Code
} from 'lucide-react';
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

export const CandidateEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
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
    try {
      const response = await api.get(`/api/candidates/${id}`);
      const candidate = response.data;

      reset({
        name: candidate.name || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        position: candidate.position || '',
        experience: candidate.experience || 0,
        skills: candidate.skills?.join(', ') || '',
      });
    } catch (error) {
      setServerError("Impossible de charger le candidat");
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
        .map(s => s.trim())
        .filter(Boolean);

      await api.put(`/api/candidates/${id}`, {
        ...data,
        skills: skillsArray,
        experience: Number(data.experience),
      });

      navigate(`/candidates/${id}`);
    } catch (error: any) {
      const msg = error.response?.data?.message;

      if (msg?.includes('email')) setError('email', { message: msg });
      else if (msg?.includes('phone')) setError('phone', { message: msg });
      else if (msg?.includes('compétence')) setError('skills', { message: msg });
      else setServerError(msg || "Erreur serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black">
        <Header />
        <div className="flex items-center justify-center h-72">
          <div className="w-6 h-6 border border-black border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-12">

        {/* BACK */}
        <button
          onClick={() => navigate(`/candidates/${id}`)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        {/* CARD */}
        <div className="border border-black/10 rounded-2xl bg-white shadow-sm overflow-hidden">

          {/* HEADER */}
          <div className="p-6 border-b border-black/10">
            <h1 className="text-xl font-semibold tracking-tight">
              Modifier le candidat
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Mettre à jour les informations du profil
            </p>
          </div>

          {/* ERROR */}
          {serverError && (
            <div className="mx-6 mt-6 p-3 border border-black/10 bg-gray-50 rounded-lg flex gap-2 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

            {/* INPUT COMPONENT STYLE REPEAT */}

            {/* NAME */}
            <Field label="Nom complet" error={errors.name?.message}>
              <Input icon={<User />} error={!!errors.name} {...register('name', {
                required: 'Nom requis',
                minLength: { value: 2, message: 'Min 2 caractères' }
              })} />
            </Field>

            {/* EMAIL */}
            <Field label="Email" error={errors.email?.message}>
              <Input icon={<Mail />} error={!!errors.email} {...register('email', {
                required: 'Email requis',
                pattern: { value: /^\S+@\S+$/, message: 'Email invalide' }
              })} />
            </Field>

            {/* PHONE */}
            <Field label="Téléphone" error={errors.phone?.message}>
              <Input icon={<Phone />} error={!!errors.phone} {...register('phone')} />
            </Field>

            {/* POSITION */}
            <Field label="Poste" error={errors.position?.message}>
              <Input icon={<Briefcase />} error={!!errors.position} {...register('position')} />
            </Field>

            {/* EXPERIENCE */}
            <Field label="Expérience (années)" error={errors.experience?.message}>
              <Input icon={<Calendar />} type="number" error={!!errors.experience} {...register('experience')} />
            </Field>

            {/* SKILLS */}
            <Field label="Compétences" error={errors.skills?.message}>
              <textarea
                {...register('skills')}
                rows={3}
                placeholder="React, TypeScript, Node.js"
                className="w-full pl-10 pr-3 py-2 border border-black/10 rounded-lg
                         focus:outline-none focus:ring-1 focus:ring-black
                         resize-none"
              />
            </Field>

            {/* ACTIONS */}
            <div className="flex gap-3 pt-4">

              <button
                type="button"
                onClick={() => navigate(`/candidates/${id}`)}
                className="px-4 py-2 border border-black/10 rounded-lg text-sm
                         hover:bg-black hover:text-white transition"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm
                         hover:bg-gray-900 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Sauvegarder
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

/* ================= COMPONENTS ================= */

const Field = ({ label, error, children }: any) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600">{label}</label>
    {children}
    {error && <p className="text-xs text-black">{error}</p>}
  </div>
);

const Input = ({ icon, error, ...props }: any) => (
  <div className="relative">
    <div className="absolute left-3 top-2.5 text-gray-400 w-4 h-4">
      {icon}
    </div>
    <input
      {...props}
      className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm
        ${error ? 'border-black' : 'border-black/10'}
        focus:outline-none focus:ring-1 focus:ring-black`}
    />
  </div>
);
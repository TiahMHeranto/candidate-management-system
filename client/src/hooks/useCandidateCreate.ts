import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../lib/axios';
import { parseSkills, validateSkills } from '../utils/skillsUtils';
import { handleCreateCandidateError } from '../utils/createCandidateErrorHandler';

export interface CandidateFormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: number;
  skills: string;
}

export const useCandidateCreate = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit: rhfHandleSubmit,
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
      // Valider les compétences
      const skillsValidation = validateSkills(data.skills);
      if (!skillsValidation.isValid) {
        setError('skills', { message: skillsValidation.error! });
        setIsSubmitting(false);
        return;
      }

      // Transformer les compétences en tableau
      const skillsArray = parseSkills(data.skills);

      const candidateData = {
        ...data,
        skills: skillsArray,
        experience: Number(data.experience),
      };

      const response = await api.post('/api/candidates', candidateData);
      
      // Rediriger vers la page du candidat créé
      navigate(`/candidates/${response.data._id}`);
    } catch (error: any) {
      handleCreateCandidateError(error, setServerError, setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigate('/');
  };

  return {
    register,
    handleSubmit: rhfHandleSubmit(onSubmit),
    errors,
    serverError,
    isSubmitting,
    goBack,
  };
};
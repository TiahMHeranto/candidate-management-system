// src/utils/createCandidateErrorHandler.ts
import { type CandidateFormData } from '../types';

export const handleCreateCandidateError = (
  error: any,
  setServerError: (error: string) => void,
  setFieldError: (field: keyof CandidateFormData, error: { message: string }) => void
) => {
  console.error('Erreur lors de la création', error);
  
  if (error.response?.data?.message) {
    const serverMessage = error.response.data.message;
    
    // Vérifier si c'est une erreur de validation spécifique
    if (serverMessage.includes('email')) {
      setFieldError('email', { message: serverMessage });
    } else if (serverMessage.includes('phone')) {
      setFieldError('phone', { message: serverMessage });
    } else if (serverMessage.includes('compétence') || serverMessage.includes('skill')) {
      setFieldError('skills', { message: serverMessage });
    } else {
      setServerError(serverMessage);
    }
  } else {
    setServerError('Une erreur est survenue lors de la création du candidat');
  }
};
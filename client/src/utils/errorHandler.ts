import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

export const getLoginErrorMessage = (error: AxiosError<ErrorResponse>): string => {
  if (error.code === 'ECONNABORTED') {
    return 'Le serveur ne répond pas. Veuillez réessayer.';
  }

  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  switch (status) {
    case 401:
      return serverMessage || 'Email ou mot de passe incorrect';
    case 404:
      return serverMessage || 'Aucun compte associé à cet email';
    case 429:
      return 'Trop de tentatives. Veuillez réessayer plus tard.';
    case 500:
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    default:
      return serverMessage || 'Une erreur est survenue. Veuillez réessayer.';
  }
};
// src/pages/Login.tsx
import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff, AlertCircle, Lock, Mail } from 'lucide-react';

interface ErrorResponse {
  message: string;
}

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  // Validation simple côté client
  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ quand l'utilisateur tape
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Effacer l'erreur serveur quand l'utilisateur tape
    if (serverError) {
      setServerError(null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (isLoading) return;
    
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/login',
        {
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { token } = response.data;
      localStorage.setItem('authToken', token);
      
      // Redirection
      window.location.href = '/candidates';
      
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      
      // Gestion des erreurs avec les messages du serveur
      if (axiosError.code === 'ECONNABORTED') {
        setServerError('Le serveur ne répond pas. Veuillez réessayer.');
      } else if (axiosError.response?.status === 401) {
        // Utiliser le message du serveur pour 401
        const serverMessage = axiosError.response.data?.message;
        if (serverMessage) {
          setServerError(serverMessage);
        } else {
          setServerError('Email ou mot de passe incorrect');
        }
      } else if (axiosError.response?.status === 404) {
        // Utiliser le message du serveur pour 404
        const serverMessage = axiosError.response.data?.message;
        setServerError(serverMessage || 'Aucun compte associé à cet email');
      } else if (axiosError.response?.status === 429) {
        setServerError('Trop de tentatives. Veuillez réessayer plus tard.');
      } else if (axiosError.response?.status === 500) {
        setServerError('Erreur serveur. Veuillez réessayer plus tard.');
      } else if (axiosError.response?.data?.message) {
        // Pour toute autre erreur avec message du serveur
        setServerError(axiosError.response.data.message);
      } else {
        setServerError('Une erreur est survenue. Veuillez réessayer.');
      }
      
      // Log pour débogage
      console.error('Login error:', {
        status: axiosError.response?.status,
        message: axiosError.response?.data?.message,
        error: axiosError.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
      <div className="w-full max-w-md">
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary 
                        border border-light-border dark:border-dark-border
                        rounded-lg shadow-lg p-8">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">
              Connexion
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">
              Connectez-vous à votre compte
            </p>
          </div>

          {serverError && (
            <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 
                            border border-red-200 dark:border-red-800
                            flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{serverError}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md
                             bg-light-bg dark:bg-dark-bg
                             text-light-text dark:text-dark-text
                             focus:outline-none focus:ring-2 focus:ring-gray-400
                             disabled:opacity-50 disabled:cursor-not-allowed
                             ${errors.email 
                               ? 'border-red-500 dark:border-red-500' 
                               : 'border-light-border dark:border-dark-border'
                             }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md
                             bg-light-bg dark:bg-dark-bg
                             text-light-text dark:text-dark-text
                             focus:outline-none focus:ring-2 focus:ring-gray-400
                             disabled:opacity-50 disabled:cursor-not-allowed
                             ${errors.password 
                               ? 'border-red-500 dark:border-red-500' 
                               : 'border-light-border dark:border-dark-border'
                             }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center
                           text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gray-900 dark:bg-gray-50 
                       text-gray-50 dark:text-gray-900
                       hover:bg-gray-700 dark:hover:bg-gray-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       rounded-md font-medium transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Connexion...</span>
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
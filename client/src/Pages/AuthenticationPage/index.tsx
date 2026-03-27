import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Lock, Mail } from 'lucide-react';
import { useLogin } from '../../hooks/useLogin';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { formData, errors, serverError, isLoading, handleChange, onSubmit } = useLogin();

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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
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
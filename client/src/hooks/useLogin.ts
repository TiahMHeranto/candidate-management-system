import { useState } from 'react';
import { AxiosError } from 'axios';
import { validateLoginForm } from '../utils/validation';
import { getLoginErrorMessage } from '../utils/errorHandler';
import api from '../lib/axios'; // Import your configured axios instance

interface ErrorResponse {
  message: string;
}

export const useLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (serverError) {
      setServerError(null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    const { isValid, errors: validationErrors } = validateLoginForm(
      formData.email,
      formData.password
    );

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      // Use the configured api instance instead of axios directly
      const response = await api.post('/auth/login', {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      const { token } = response.data;
      localStorage.setItem('authToken', token);
      window.location.href = '/candidates';
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = getLoginErrorMessage(axiosError);
      setServerError(errorMessage);
      
      console.error('Login error:', {
        status: axiosError.response?.status,
        message: axiosError.response?.data?.message,
        error: axiosError.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    errors,
    serverError,
    isLoading,
    handleChange,
    onSubmit,
  };
};
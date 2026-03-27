import { describe, it, expect, vi } from 'vitest';
import { handleCreateCandidateError } from '../createCandidateErrorHandler';

describe('handleCreateCandidateError', () => {
  it('should handle email error', () => {
    const setServerError = vi.fn();
    const setFieldError = vi.fn();
    
    const error = {
      response: {
        data: { message: 'email already exists' }
      }
    };
    
    handleCreateCandidateError(error, setServerError, setFieldError);
    
    expect(setFieldError).toHaveBeenCalledWith('email', { message: 'email already exists' });
    expect(setServerError).not.toHaveBeenCalled();
  });

  it('should handle phone error', () => {
    const setServerError = vi.fn();
    const setFieldError = vi.fn();
    
    const error = {
      response: {
        data: { message: 'phone number invalid' }
      }
    };
    
    handleCreateCandidateError(error, setServerError, setFieldError);
    
    expect(setFieldError).toHaveBeenCalledWith('phone', { message: 'phone number invalid' });
    expect(setServerError).not.toHaveBeenCalled();
  });

  it('should handle skills error', () => {
    const setServerError = vi.fn();
    const setFieldError = vi.fn();
    
    const error = {
      response: {
        data: { message: 'compétence invalide' }
      }
    };
    
    handleCreateCandidateError(error, setServerError, setFieldError);
    
    expect(setFieldError).toHaveBeenCalledWith('skills', { message: 'compétence invalide' });
    expect(setServerError).not.toHaveBeenCalled();
  });

  it('should handle server error without field specific', () => {
    const setServerError = vi.fn();
    const setFieldError = vi.fn();
    
    const error = {
      response: {
        data: { message: 'Database error' }
      }
    };
    
    handleCreateCandidateError(error, setServerError, setFieldError);
    
    expect(setServerError).toHaveBeenCalledWith('Database error');
    expect(setFieldError).not.toHaveBeenCalled();
  });

  it('should handle error without response', () => {
    const setServerError = vi.fn();
    const setFieldError = vi.fn();
    
    const error = new Error('Network error');
    
    handleCreateCandidateError(error, setServerError, setFieldError);
    
    expect(setServerError).toHaveBeenCalledWith('Une erreur est survenue lors de la création du candidat');
    expect(setFieldError).not.toHaveBeenCalled();
  });
});
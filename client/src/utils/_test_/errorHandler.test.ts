import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import { getLoginErrorMessage } from './errorHandler';

// Définir le type ErrorResponse pour les tests
interface ErrorResponse {
  message: string;
}

describe('getLoginErrorMessage', () => {
  it('should return timeout message for ECONNABORTED error', () => {
    const error = { code: 'ECONNABORTED' } as AxiosError;
    expect(getLoginErrorMessage(error as AxiosError<ErrorResponse>)).toBe('Le serveur ne répond pas. Veuillez réessayer.');
  });

  it('should return 401 error with server message', () => {
    const error = {
      response: {
        status: 401,
        data: { message: 'Invalid credentials' }
      }
    } as AxiosError<ErrorResponse>;
    expect(getLoginErrorMessage(error)).toBe('Invalid credentials');
  });

  it('should return default 401 error without server message', () => {
    const error = {
      response: {
        status: 401,
        data: {} as ErrorResponse
      }
    } as AxiosError<ErrorResponse>;
    expect(getLoginErrorMessage(error)).toBe('Email ou mot de passe incorrect');
  });

  it('should return 404 error with server message', () => {
    const error = {
      response: {
        status: 404,
        data: { message: 'User not found' }
      }
    } as AxiosError<ErrorResponse>;
    expect(getLoginErrorMessage(error)).toBe('User not found');
  });

  it('should return default 404 error without server message', () => {
    const error = {
      response: {
        status: 404,
        data: {} as ErrorResponse
      }
    } as AxiosError<ErrorResponse>;
    expect(getLoginErrorMessage(error)).toBe('Aucun compte associé à cet email');
  });

  it('should return 429 rate limit message', () => {
    const error = {
      response: {
        status: 429,
        data: {} as ErrorResponse
      }
    } as AxiosError<ErrorResponse>;
    expect(getLoginErrorMessage(error)).toBe('Trop de tentatives. Veuillez réessayer plus tard.');
  });

  it('should return 500 server error message', () => {
    const error = {
      response: {
        status: 500,
        data: {} as ErrorResponse
      }
    } as AxiosError<ErrorResponse>;
    expect(getLoginErrorMessage(error)).toBe('Erreur serveur. Veuillez réessayer plus tard.');
  });

  it('should return default error for unknown status', () => {
    const error = {
      response: {
        status: 418,
        data: {} as ErrorResponse
      }
    } as AxiosError<ErrorResponse>;
    expect(getLoginErrorMessage(error)).toBe('Une erreur est survenue. Veuillez réessayer.');
  });

  it('should return server message for any error with message', () => {
    const error = {
      response: {
        status: 403,
        data: { message: 'Access denied' }
      }
    } as AxiosError<ErrorResponse>;
    expect(getLoginErrorMessage(error)).toBe('Access denied');
  });
});
import { describe, it, expect } from 'vitest';
import { validateLoginForm } from './validation';

describe('validateLoginForm', () => {
  it('should return error when email is empty', () => {
    const result = validateLoginForm('', 'password123');
    
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe("L'email est requis");
    expect(result.errors.password).toBe('');
  });

  it('should return error when email format is invalid', () => {
    const result = validateLoginForm('invalid-email', 'password123');
    
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe("Format d'email invalide");
    expect(result.errors.password).toBe('');
  });

  it('should return error when password is empty', () => {
    const result = validateLoginForm('test@example.com', '');
    
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe('');
    expect(result.errors.password).toBe("Le mot de passe est requis");
  });

  it('should return valid when both email and password are correct', () => {
    const result = validateLoginForm('test@example.com', 'password123');
    
    expect(result.isValid).toBe(true);
    expect(result.errors.email).toBe('');
    expect(result.errors.password).toBe('');
  });
});
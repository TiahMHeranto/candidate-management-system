import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCandidateValidationRules } from '../useCandidateValidationRules';

describe('useCandidateValidationRules', () => {
  it('should return name validation rules', () => {
    const { result } = renderHook(() => useCandidateValidationRules());
    
    expect(result.current.nameRules).toHaveProperty('required');
    expect(result.current.nameRules).toHaveProperty('minLength');
    expect(result.current.nameRules).toHaveProperty('maxLength');
  });

  it('should return email validation rules with pattern', () => {
    const { result } = renderHook(() => useCandidateValidationRules());
    
    expect(result.current.emailRules).toHaveProperty('required');
    expect(result.current.emailRules).toHaveProperty('pattern');
  });

  it('should return phone validation rules with pattern', () => {
    const { result } = renderHook(() => useCandidateValidationRules());
    
    expect(result.current.phoneRules).toHaveProperty('required');
    expect(result.current.phoneRules).toHaveProperty('pattern');
  });

  it('should return position validation rules', () => {
    const { result } = renderHook(() => useCandidateValidationRules());
    
    expect(result.current.positionRules).toHaveProperty('required');
    expect(result.current.positionRules).toHaveProperty('minLength');
  });

  it('should return experience validation rules with min and max', () => {
    const { result } = renderHook(() => useCandidateValidationRules());
    
    expect(result.current.experienceRules).toHaveProperty('required');
    expect(result.current.experienceRules).toHaveProperty('min');
    expect(result.current.experienceRules).toHaveProperty('max');
    expect(result.current.experienceRules).toHaveProperty('valueAsNumber');
  });

  it('should return skills validation rules with validate function', () => {
    const { result } = renderHook(() => useCandidateValidationRules());
    
    expect(result.current.skillsRules).toHaveProperty('required');
    expect(result.current.skillsRules).toHaveProperty('validate');
    
    // Test validate function
    const validate = result.current.skillsRules.validate as (value: string) => boolean | string;
    expect(validate('React, TypeScript')).toBe(true);
    expect(validate('')).toBe('Ajoutez au moins une compétence');
    expect(validate(',,,')).toBe('Ajoutez au moins une compétence');
  });
});
import { describe, it, expect } from 'vitest';
import { filterCandidates, getActiveFilterCount } from '../filterUtils';
import { type Candidate } from '../../types';

const mockCandidates: Candidate[] = [
  { _id: '1', name: 'Jean Dupont', status: 'pending', position: 'Développeur Frontend', email: 'jean@test.com' },
  { _id: '2', name: 'Marie Martin', status: 'validated', position: 'Développeur Backend', email: 'marie@test.com' },
  { _id: '3', name: 'Pierre Durand', status: 'pending', position: 'Chef de Projet', email: 'pierre@test.com' },
] as any;

describe('filterCandidates', () => {
  it('should return all candidates when no filters applied', () => {
    const result = filterCandidates(mockCandidates, { name: '', status: '', position: '' });
    expect(result).toHaveLength(3);
  });

  it('should filter by name', () => {
    const result = filterCandidates(mockCandidates, { name: 'Jean', status: '', position: '' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Jean Dupont');
  });

  it('should filter by name case insensitive', () => {
    const result = filterCandidates(mockCandidates, { name: 'jean', status: '', position: '' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Jean Dupont');
  });

  it('should filter by status', () => {
    const result = filterCandidates(mockCandidates, { name: '', status: 'validated', position: '' });
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('validated');
  });

  it('should filter by position', () => {
    const result = filterCandidates(mockCandidates, { name: '', status: '', position: 'Frontend' });
    expect(result).toHaveLength(1);
    expect(result[0].position).toBe('Développeur Frontend');
  });

  it('should filter by multiple filters', () => {
    const result = filterCandidates(mockCandidates, { name: '', status: 'pending', position: 'Frontend' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Jean Dupont');
  });

  it('should return empty array when no matches', () => {
    const result = filterCandidates(mockCandidates, { name: 'Inexistant', status: '', position: '' });
    expect(result).toHaveLength(0);
  });
});

describe('getActiveFilterCount', () => {
  it('should return 0 when no filters active', () => {
    const result = getActiveFilterCount({ name: '', status: '', position: '' });
    expect(result).toBe(0);
  });

  it('should return 1 when one filter active', () => {
    const result = getActiveFilterCount({ name: 'test', status: '', position: '' });
    expect(result).toBe(1);
  });

  it('should return 2 when two filters active', () => {
    const result = getActiveFilterCount({ name: 'test', status: 'pending', position: '' });
    expect(result).toBe(2);
  });

  it('should ignore empty strings with spaces', () => {
    const result = getActiveFilterCount({ name: '   ', status: '', position: '' });
    expect(result).toBe(0);
  });
});
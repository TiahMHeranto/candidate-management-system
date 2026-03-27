import { describe, it, expect } from 'vitest';
import { parseSkills, validateSkills } from '../skillsUtils';

describe('parseSkills', () => {
  it('should parse comma separated skills', () => {
    const result = parseSkills('React, TypeScript, Node.js');
    expect(result).toEqual(['React', 'TypeScript', 'Node.js']);
  });

  it('should trim whitespace', () => {
    const result = parseSkills('  React  ,  TypeScript  ,  Node.js  ');
    expect(result).toEqual(['React', 'TypeScript', 'Node.js']);
  });

  it('should filter empty skills', () => {
    const result = parseSkills('React,,TypeScript,,Node.js');
    expect(result).toEqual(['React', 'TypeScript', 'Node.js']);
  });

  it('should return empty array for empty string', () => {
    const result = parseSkills('');
    expect(result).toEqual([]);
  });
});

describe('validateSkills', () => {
  it('should return valid for non-empty skills', () => {
    const result = validateSkills('React, TypeScript');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return invalid for empty skills', () => {
    const result = validateSkills('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Ajoutez au moins une compétence');
  });

  it('should return invalid for skills with only commas', () => {
    const result = validateSkills(',,,');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Ajoutez au moins une compétence');
  });

  it('should return invalid for skills with only spaces', () => {
    const result = validateSkills('   ,   ,   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Ajoutez au moins une compétence');
  });
});
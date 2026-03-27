import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { announceToScreenReader } from '../announcer';

describe('announceToScreenReader', () => {
  let announcerElement: HTMLElement;

  beforeEach(() => {
    // Créer l'élément annonceur
    announcerElement = document.createElement('div');
    announcerElement.id = 'a11y-announcer';
    announcerElement.className = 'sr-only';
    document.body.appendChild(announcerElement);
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.removeChild(announcerElement);
    vi.useRealTimers();
  });

  it('should set text content of announcer element', () => {
    announceToScreenReader('Test message');
    expect(announcerElement.textContent).toBe('Test message');
  });

  it('should clear text content after 3 seconds by default', () => {
    announceToScreenReader('Test message');
    expect(announcerElement.textContent).toBe('Test message');
    
    vi.advanceTimersByTime(3000);
    expect(announcerElement.textContent).toBe('');
  });

  it('should clear text content after custom delay', () => {
    announceToScreenReader('Test message', 1000);
    expect(announcerElement.textContent).toBe('Test message');
    
    vi.advanceTimersByTime(1000);
    expect(announcerElement.textContent).toBe('');
  });

  it('should not clear if message changed before timeout', () => {
    announceToScreenReader('First message', 3000);
    expect(announcerElement.textContent).toBe('First message');
    
    announceToScreenReader('Second message');
    expect(announcerElement.textContent).toBe('Second message');
    
    vi.advanceTimersByTime(3000);
    expect(announcerElement.textContent).toBe('');
  });
});
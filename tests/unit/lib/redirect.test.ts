// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { getValidatedRedirect } from '@/lib/auth/redirect';

describe('getValidatedRedirect', () => {
  it('accepte /calculateur', () => {
    expect(getValidatedRedirect('/calculateur')).toBe('/calculateur');
  });

  it('accepte /simulations', () => {
    expect(getValidatedRedirect('/simulations')).toBe('/simulations');
  });

  it('accepte /simulations/abc-123', () => {
    expect(getValidatedRedirect('/simulations/abc-123')).toBe('/simulations/abc-123');
  });

  it('accepte /auth/login', () => {
    expect(getValidatedRedirect('/auth/login')).toBe('/auth/login');
  });

  it('accepte / (racine)', () => {
    expect(getValidatedRedirect('/')).toBe('/');
  });

  it('rejette https://evil.com → retourne /', () => {
    expect(getValidatedRedirect('https://evil.com')).toBe('/');
  });

  it('rejette //evil.com (protocol-relative) → retourne /', () => {
    expect(getValidatedRedirect('//evil.com')).toBe('/');
  });

  it('rejette les tentatives de path traversal /../etc/passwd → retourne /', () => {
    expect(getValidatedRedirect('/../etc/passwd')).toBe('/');
  });

  it('retourne / pour une URL null', () => {
    expect(getValidatedRedirect(null)).toBe('/');
  });

  it('retourne / pour une URL vide', () => {
    expect(getValidatedRedirect('')).toBe('/');
  });

  it('rejette les paths non autorisés comme /admin', () => {
    expect(getValidatedRedirect('/admin')).toBe('/');
  });

  it('rejette les backslashes (Windows path traversal)', () => {
    expect(getValidatedRedirect('/simulations\\..\\admin')).toBe('/');
  });
});

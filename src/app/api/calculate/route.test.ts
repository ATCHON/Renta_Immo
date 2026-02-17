/**
 * Tests pour la route API /api/calculate
 * 
 * Story TECH-008 : Route POST /api/calculate
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, OPTIONS } from './route';
import { NextRequest } from 'next/server';

// Mock de performCalculations pour isoler le test de la route
vi.mock('@/server/calculations', () => ({
  performCalculations: vi.fn(async (input) => {
    // Simulation d'erreur de validation
    if (input.fail === 'validation') {
      return {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        field: 'test',
      };
    }
    // Simulation d'erreur de calcul
    if (input.fail === 'calculation') {
      return {
        success: false,
        error: 'Calculation failed',
        code: 'CALCULATION_ERROR',
      };
    }
    // Succès
    return {
      success: true,
      resultats: { test: true },
      timestamp: '2026-01-26T00:00:00Z',
      alertes: ['Test alerte'],
    };
  }),
}));

describe('API Route: /api/calculate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/calculate', () => {
    it('should return 200 and results for valid input', async () => {
      const body = { wellFormed: true };
      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.resultats).toBeDefined();
      expect(data.alertes).toEqual(['Test alerte']);
      expect(data.meta).toBeDefined();
      expect(data.meta.version).toBe('1.0.0');
      expect(data.meta.execution_time_ms).toBeGreaterThanOrEqual(0);
      expect(data.pdf_url).toBeNull();
    });

    it('should return 400 for validation errors', async () => {
      const body = { fail: 'validation' };
      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toBe('Validation failed');
      expect(data.timestamp).toBeDefined();
    });

    it('should return 422 for calculation errors', async () => {
      const body = { fail: 'calculation' };
      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('CALCULATION_ERROR');
    });

    it('should return 400 for malformed JSON', async () => {
      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: 'not-json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('JSON');
    });

    it('should return 400 for empty body', async () => {
      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify(null),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should include CORS headers in response', async () => {
      const body = { wellFormed: true };
      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Origin: 'http://localhost:3001',
        },
      });

      const response = await POST(request);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });

    it('should respond in less than 500ms', async () => {
      const body = { wellFormed: true };
      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });

      const start = performance.now();
      await POST(request);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });

  describe('OPTIONS /api/calculate', () => {
    it('should return 204 with CORS headers', async () => {
      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:3001',
          'Access-Control-Request-Method': 'POST',
        },
      });

      const response = await OPTIONS(request);

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
      expect(response.headers.get('Access-Control-Max-Age')).toBe('86400');
    });
  });
});

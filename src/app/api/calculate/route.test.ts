import { describe, it, expect, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock de performCalculations pour isoler le test de la route
vi.mock('@/server/calculations', () => ({
  performCalculations: vi.fn((input) => {
    if (input.fail) {
      return {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        field: 'test'
      };
    }
    return {
      success: true,
      resultats: { test: true },
      timestamp: '2026-01-26T00:00:00Z',
      alertes: []
    };
  })
}));

describe('API Route: /api/calculate', () => {
  it('should return 200 and results for valid input', async () => {
    const body = { wellFormed: true };
    const request = new NextRequest('http://localhost/api/calculate', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.resultats).toBeDefined();
  });

  it('should return 400 for validation errors', async () => {
    const body = { fail: true };
    const request = new NextRequest('http://localhost/api/calculate', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 for malformed JSON', async () => {
    // On simule une requête avec un body qui n'est pas du JSON valide
    const request = new NextRequest('http://localhost/api/calculate', {
      method: 'POST',
      body: 'not-json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.code).toBe('SERVER_ERROR');
  });
});

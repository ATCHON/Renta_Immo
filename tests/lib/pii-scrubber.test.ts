// tests/lib/pii-scrubber.test.ts — TU PII scrubbing Sentry (ARCH-S02)
import { describe, it, expect } from 'vitest';
import { scrubPii, PII_FIELDS, FINANCIAL_FIELDS } from '@/lib/pii-scrubber';
import type { Event } from '@sentry/nextjs';

describe('scrubPii', () => {
  it('supprime email et ip_address de event.user', () => {
    const event: Event = {
      user: {
        id: 'user-123',
        email: 'user@example.com',
        ip_address: '1.2.3.4',
        username: 'johndoe',
      },
    };

    const result = scrubPii(event);

    expect(result.user?.id).toBe('user-123');
    expect(result.user?.email).toBeUndefined();
    expect(result.user?.ip_address).toBeUndefined();
    expect(result.user?.username).toBeUndefined();
  });

  it('redacte request.data (données financières)', () => {
    const event: Event = {
      request: {
        data: { revenuAnnuel: 50000, apport: 30000 },
      },
    };

    const result = scrubPii(event);

    expect(result.request?.data).toBe('[REDACTED — financial data]');
  });

  it('redacte les breadcrumbs contenant des champs financiers', () => {
    const event: Event = {
      breadcrumbs: {
        values: [
          { message: 'navigation', data: { url: '/simulateur' } },
          { message: 'api call', data: { revenuAnnuel: 50000, action: 'calculate' } },
          { message: 'click', data: { element: 'button' } },
        ],
      },
    };

    const result = scrubPii(event);
    const crumbs = result.breadcrumbs?.values ?? [];

    // Breadcrumb sans champ financier : inchangé
    expect(crumbs[0]?.data).toEqual({ url: '/simulateur' });
    // Breadcrumb avec champ financier : redacté
    expect(crumbs[1]?.data).toEqual({ redacted: true });
    // Breadcrumb sans champ financier : inchangé
    expect(crumbs[2]?.data).toEqual({ element: 'button' });
  });

  it('préserve les erreurs métier sans données sensibles', () => {
    const event: Event = {
      exception: {
        values: [
          {
            type: 'ValidationError',
            value: 'Champ obligatoire manquant',
          },
        ],
      },
    };

    const result = scrubPii(event);

    expect(result.exception?.values?.[0]?.type).toBe('ValidationError');
    expect(result.exception?.values?.[0]?.value).toBe('Champ obligatoire manquant');
  });

  it('gère gracieusement un event sans user ni request ni breadcrumbs', () => {
    const event: Event = { message: 'Simple error' };
    const result = scrubPii(event);
    expect(result.message).toBe('Simple error');
  });
});

describe('constantes PII_FIELDS et FINANCIAL_FIELDS', () => {
  it('PII_FIELDS inclut les champs personnels attendus', () => {
    expect(PII_FIELDS).toContain('email');
    expect(PII_FIELDS).toContain('nom');
    expect(PII_FIELDS).toContain('telephone');
  });

  it('FINANCIAL_FIELDS inclut les champs financiers sensibles', () => {
    expect(FINANCIAL_FIELDS).toContain('revenuAnnuel');
    expect(FINANCIAL_FIELDS).toContain('apport');
    expect(FINANCIAL_FIELDS).toContain('donnees_entree');
    expect(FINANCIAL_FIELDS).toContain('form_data');
  });
});

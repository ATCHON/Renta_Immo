// src/lib/pii-scrubber.ts — Masquage des PII avant envoi à Sentry (ARCH-S02)
// Référence : §4.1 du guide d'évolutivité architecture v2.0

import type { Event, Breadcrumb } from '@sentry/nextjs';

/** Champs personnels à supprimer des events Sentry */
export const PII_FIELDS = ['email', 'nom', 'prenom', 'telephone', 'adresse'] as const;

/** Champs financiers sensibles à redacter des breadcrumbs et request bodies */
export const FINANCIAL_FIELDS = [
  'revenuAnnuel',
  'revenuImposable',
  'patrimoineNet',
  'apport',
  'montantCredit',
  'capaciteEmprunt',
  'chargesAnnuelles',
  'donnees_entree', // colonne JSONB simulations — contient tout le formulaire
  'form_data', // alias frontend
  'resultats', // JSONB — peut contenir des données inférées sensibles
] as const;

/**
 * Hook beforeSend Sentry : supprime les PII et données financières avant envoi.
 * Conforme RGPD — les données financières personnelles ne doivent pas transiter vers Sentry.
 */
export function scrubPii(event: Event): Event {
  // 1. Supprimer les données utilisateur PII
  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
    delete event.user.username;
  }

  // 2. Redacter les request bodies (form_data, donnees_entree, etc.)
  if (event.request?.data) {
    event.request.data = '[REDACTED — financial data]';
  }

  // 3. Supprimer les breadcrumbs contenant des données financières
  if (event.breadcrumbs?.values) {
    event.breadcrumbs.values = event.breadcrumbs.values.map((bc: Breadcrumb): Breadcrumb => {
      if (bc.data && FINANCIAL_FIELDS.some((f) => f in (bc.data ?? {}))) {
        return { ...bc, data: { redacted: true } };
      }
      return bc;
    });
  }

  return event;
}

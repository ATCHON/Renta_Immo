// sentry.client.config.ts — Configuration Sentry côté browser (ARCH-S02)
// Datacenter EU : DSN ingest.de.sentry.io garantit le routage vers Frankfurt/EU (RGPD)
import * as Sentry from '@sentry/nextjs';
import { scrubPii } from '@/lib/pii-scrubber';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Datacenter EU obligatoire (RGPD §4.2 guide évolutivité)
  // Le DSN doit contenir .de. pour router vers Frankfurt : https://<key>@o<org>.ingest.de.sentry.io/<project>

  // Désactivé en dev pour ne pas polluer Sentry avec les erreurs de développement
  enabled: process.env.NODE_ENV === 'production',

  // Pas de cookies ni de session tracking côté client (provisoire — en attente banner CNIL ARCH-S23)
  autoSessionTracking: false,

  // Taux d'échantillonnage : 10% des transactions (performance)
  tracesSampleRate: 0.1,

  // Erreurs browser sans impact utilisateur à ignorer
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    /Loading chunk \d+ failed/,
    /ChunkLoadError/,
    'NetworkError',
    'Failed to fetch',
  ],

  // Ne pas capturer les erreurs depuis les extensions Chrome
  denyUrls: [/extensions\//i, /^chrome:\/\//i],

  // Hook PII scrubbing — obligatoire RGPD
  beforeSend(event) {
    return scrubPii(event);
  },
});

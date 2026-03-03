// sentry.server.config.ts — Configuration Sentry côté Node.js (ARCH-S02)
import * as Sentry from '@sentry/nextjs';
import type { ErrorEvent } from '@sentry/nextjs';
import { scrubPii } from '@/lib/pii-scrubber';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  enabled: process.env.NODE_ENV === 'production' && process.env.SENTRY_ENABLED !== 'false',

  // Échantillonnage conservateur côté serveur
  tracesSampleRate: 0.1,

  // Hook PII scrubbing — obligatoire RGPD
  beforeSend(event) {
    return scrubPii(event) as ErrorEvent;
  },
});

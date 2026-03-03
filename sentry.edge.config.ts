// sentry.edge.config.ts — Configuration Sentry Edge Runtime (ARCH-S02)
import * as Sentry from '@sentry/nextjs';
import type { ErrorEvent } from '@sentry/nextjs';
import { scrubPii } from '@/lib/pii-scrubber';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  enabled: process.env.NODE_ENV === 'production' && process.env.SENTRY_ENABLED !== 'false',

  tracesSampleRate: 0.1,

  // Hook PII scrubbing — obligatoire RGPD
  beforeSend(event) {
    return scrubPii(event) as ErrorEvent;
  },
});

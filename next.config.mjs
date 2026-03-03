// @ts-check
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mode standalone : produit .next/standalone/ avec uniquement les dépendances utilisées.
  // Réduit la taille de l'image Docker de 60-80%. Transparent pour Vercel (ignoré).
  output: 'standalone',

  // Packages externalisés côté serveur (ne sont pas bundlés, chargés à l'exécution)
  // Remplace experimental.serverComponentsExternalPackages (Next.js 15+)
  serverExternalPackages: [
    '@react-pdf/renderer',
    'pg',
    'pg-native',
    'pg-connection-string',
    'pgpass',
    'pg-pool',
    'pg-protocol',
    'pg-types',
    'canvas',
  ],

  // Remplace experimental.outputFileTracingIncludes (Next.js 15+)
  outputFileTracingIncludes: {
    '/**': ['./supabase/migrations/**'],
  },

  // Turbopack est le bundler par défaut en Next.js 16
  // Déclarer une config vide pour éviter le warning webpack/turbopack
  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''} https://accounts.google.com; ` +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' https: data:; " +
              "font-src 'self' data:; " +
              // Sentry EU ingest ajouté (ARCH-S02)
              "connect-src 'self' https://*.supabase.co https://accounts.google.com https://*.sentry.io https://o*.ingest.de.sentry.io; " +
              "frame-ancestors 'self';",
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Webpack config (utilisé en mode non-Turbopack : next build --webpack)
  webpack: (config, { isServer }) => {
    // Prevent canvas errors with react-pdf
    config.resolve.alias.canvas = false;

    if (!isServer) {
      // Côté client : indiquer que ces modules ne sont pas disponibles
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        net: false,
        tls: false,
        dns: false,
        crypto: false,
      };
    }

    return config;
  },
};

// withSentryConfig : wrap Next.js config pour upload source maps en CI (ARCH-S02)
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload source maps uniquement en CI pour les erreurs prod debuggables
  silent: !process.env.CI,

  // Désactiver le widget de feedback Sentry (non nécessaire)
  disableClientWebpackPlugin: false,

  // Tunnel désactivé pour Sprint 0 — CSP suffit (activer si bloqueurs de pubs mesurés)
  // tunnelRoute: '/api/sentry-tunnel',

  // Supprimer les source maps du bundle public (sécurité)
  hideSourceMaps: true,

  // Désactiver les logs Sentry en dev
  disableLogger: true,
});

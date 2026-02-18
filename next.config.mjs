/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer', 'pg'],
    instrumentationHook: true,
    outputFileTracingIncludes: {
      '/**': ['./supabase/migrations/**'],
    },
  },
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
              "connect-src 'self' https://*.supabase.co https://accounts.google.com; " +
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
  webpack: (config, { isServer }) => {
    // Prevent canvas errors with react-pdf
    config.resolve.alias.canvas = false;

    if (isServer) {
      // Externalise pg, ses dépendances, et les built-ins Node.js pour le bundle serveur
      // (y compris instrumentation.ts). serverComponentsExternalPackages ne couvre que
      // les Server Components, pas instrumentation.ts.
      const nodeBuiltins = ['fs', 'path', 'stream', 'net', 'tls', 'dns', 'crypto', 'os', 'util', 'events', 'buffer', 'url', 'http', 'https', 'zlib', 'child_process'];
      const pgModules = [
        'pg',
        'pg-native',
        'pg-connection-string',
        'pgpass',
        'pg-pool',
        'pg-protocol',
        'pg-types',
      ];
      const externalModules = [...nodeBuiltins, ...pgModules];
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        ({ request }, callback) => {
          if (externalModules.some((mod) => request === mod || request?.startsWith(mod + '/'))) {
            return callback(null, 'commonjs ' + request);
          }
          callback();
        },
      ];
    } else {
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

export default nextConfig;

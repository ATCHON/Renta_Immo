import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined'); // Fail fast if env var is missing
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  // Déploiements preview Vercel : URL dynamique par branche/commit, donc
  // BETTER_AUTH_URL (valeur fixe) ne suffit pas pour l'origin-check de better-auth.
  trustedOrigins: ['https://*.vercel.app'],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});

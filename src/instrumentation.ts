/**
 * Next.js Instrumentation Hook
 *
 * Ce fichier s'exécute au démarrage du serveur Next.js (runtime Node.js uniquement).
 * Il applique les migrations SQL pendantes via runner.ts.
 *
 * `pg` est externalisé via next.config.mjs (config.externals) pour que webpack
 * ne tente pas de le bundler — il est chargé nativement par Node.js au runtime.
 */
export async function register() {
  // Ne s'exécute que dans le runtime Node.js (pas edge, pas client)
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const isProduction = process.env.NODE_ENV === 'production';

  // On utilise une variable pour l'import dynamique afin d'éviter que le bundler Vercel
  // ne détecte statiquement ce module et ne tente de l'inclure dans le Edge Runtime (middleware),
  // ce qui causerait une erreur car 'pg' et 'fs' ne sont pas supportés sur Edge.
  const runnerModule = './server/migrations/runner';
  const { runMigrations, resolveMigrationsDir, migrationsDirectoryExists } =
    (await import(runnerModule)) as typeof import('./server/migrations/runner');

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    if (isProduction) {
      throw new Error('[migrate] DATABASE_URL manquant — déploiement impossible sans connexion DB');
    }
    console.warn('[migrate] ⚠️  DATABASE_URL absent — migrations ignorées');
    return;
  }

  const migrationsDir = resolveMigrationsDir();

  if (!migrationsDirectoryExists(migrationsDir)) {
    console.log('[migrate] ℹ️  Dossier migrations absent — supposé appliqué au build');
    return;
  }

  try {
    console.log('[migrate] Vérification des migrations pendantes...');
    const { applied, skipped } = await runMigrations(connectionString, migrationsDir);

    if (applied > 0) {
      console.log(`[migrate] ✅ ${applied} migration(s) appliquée(s)`);
    } else {
      console.log(`[migrate] ✅ Schéma à jour (${skipped} migration(s) déjà appliquée(s))`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (isProduction) {
      throw new Error(`[migrate] Échec critique : ${message}`);
    }
    console.warn(`[migrate] ⚠️  Échec non-bloquant en dev : ${message}`);
  }
}

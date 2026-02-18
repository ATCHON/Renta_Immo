/* eslint-disable no-console */
/**
 * Instrumentation Node.js uniquement.
 *
 * Ce fichier est exclu des bundles Edge par Next.js (convention .node.ts).
 * Il est importé conditionnellement depuis instrumentation.ts.
 */
import { runMigrations, resolveMigrationsDir, migrationsDirectoryExists } from './server/migrations/runner';

export async function setupMigrations(): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';
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

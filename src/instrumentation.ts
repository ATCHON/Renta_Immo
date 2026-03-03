/**
 * Next.js Instrumentation Hook
 *
 * Ce fichier s'exécute pour tous les runtimes mais délègue à instrumentation.node.ts
 * pour le code Node.js uniquement (pg, fs, path).
 * Next.js exclut automatiquement les fichiers *.node.ts des bundles Edge.
 */
export async function register() {
  // Initialisation Sentry selon le runtime (ARCH-S02)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
    const { setupMigrations } = await import('./instrumentation.node');
    await setupMigrations();
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

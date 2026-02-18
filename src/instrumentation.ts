/**
 * Next.js Instrumentation Hook
 *
 * Ce fichier s'exécute pour tous les runtimes mais délègue à instrumentation.node.ts
 * pour le code Node.js uniquement (pg, fs, path).
 * Next.js exclut automatiquement les fichiers *.node.ts des bundles Edge.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { setupMigrations } = await import('./instrumentation.node');
    await setupMigrations();
  }
}

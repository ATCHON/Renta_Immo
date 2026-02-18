/* eslint-disable no-console */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

const { Client } = pg;

const ADVISORY_LOCK_ID = 987654321;

export interface MigrationStatus {
  applied: string[];
  pending: string[];
}

async function createMigrationsTable(client: pg.Client): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function getAppliedMigrations(client: pg.Client): Promise<Set<string>> {
  const { rows } = await client.query('SELECT name FROM _migrations');
  return new Set(rows.map((r: { name: string }) => r.name));
}

function getMigrationFiles(migrationsDir: string): string[] {
  return readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

export async function getMigrationStatus(
  connectionString: string,
  migrationsDir: string
): Promise<MigrationStatus> {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await createMigrationsTable(client);
    const applied = await getAppliedMigrations(client);
    const files = getMigrationFiles(migrationsDir);

    return {
      applied: files.filter((f) => applied.has(f)),
      pending: files.filter((f) => !applied.has(f)),
    };
  } finally {
    await client.end();
  }
}

export async function runMigrations(
  connectionString: string,
  migrationsDir: string
): Promise<{ applied: number; skipped: number }> {
  const client = new Client({ connectionString });
  await client.connect();

  let applied = 0;
  let skipped = 0;

  try {
    await createMigrationsTable(client);

    // Advisory lock — protège contre les exécutions concurrentes
    await client.query("SET lock_timeout = '30s'");
    try {
      await client.query('SELECT pg_advisory_lock($1)', [ADVISORY_LOCK_ID]);
    } catch (err: unknown) {
      const pgErr = err as { code?: string };
      if (pgErr.code === '55P03') {
        throw new Error(
          '[migrate] Advisory lock timeout — une autre migration est peut-être en cours'
        );
      }
      throw err;
    }

    try {
      const appliedMigrations = await getAppliedMigrations(client);
      const files = getMigrationFiles(migrationsDir);

      for (const file of files) {
        if (appliedMigrations.has(file)) {
          skipped++;
          continue;
        }

        console.log(`[migrate]   📄 Applying: ${file}...`);
        const sql = readFileSync(join(migrationsDir, file), 'utf8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          // ON CONFLICT DO NOTHING — sécurité contre double insertion concurrente
          await client.query('INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT DO NOTHING', [
            file,
          ]);
          await client.query('COMMIT');
          console.log(`[migrate]   ✅ Applied: ${file}`);
          applied++;
        } catch (err: unknown) {
          await client.query('ROLLBACK');
          const pgErr = err as { code?: string };
          if (pgErr.code === '42P07') {
            // Relation already exists — marquer comme appliquée
            console.log(`[migrate]   ℹ️  Already exists: ${file}. Marking as applied.`);
            await client.query(
              'INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT DO NOTHING',
              [file]
            );
            applied++;
          } else {
            throw err;
          }
        }
      }
    } finally {
      await client.query('SELECT pg_advisory_unlock($1)', [ADVISORY_LOCK_ID]);
    }

    return { applied, skipped };
  } finally {
    await client.end();
  }
}

// Utilitaire : résoudre le dossier des migrations depuis process.cwd()
export function resolveMigrationsDir(cwd: string = process.cwd()): string {
  return join(cwd, 'supabase', 'migrations');
}

export function migrationsDirectoryExists(dir: string): boolean {
  return existsSync(dir);
}

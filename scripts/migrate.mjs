import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ ERROR: DATABASE_URL not found in .env.local");
    process.exit(1);
}

const ADVISORY_LOCK_ID = 987654321;

async function migrate() {
    console.log("🚀 Starting database migrations...");
    console.log(`🔗 Target DB: ${connectionString.split('@')[1]}`);

    const client = new Client({ connectionString });
    await client.connect();

    try {
        // 1. Create migrations table if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS _migrations (
                id SERIAL PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Advisory lock — protège contre les builds/runs concurrents
        await client.query("SET lock_timeout = '30000ms'");
        try {
            await client.query('SELECT pg_advisory_lock($1)', [ADVISORY_LOCK_ID]);
        } catch (err) {
            if (err.code === '55P03') {
                console.error("❌ Lock timeout — une autre migration est en cours (>30s)");
                process.exit(1);
            }
            throw err;
        }

        try {
            // 3. Get list of migrations from file system
            const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
            const files = fs.readdirSync(migrationsDir)
                .filter(f => f.endsWith('.sql'))
                .sort();

            // 4. Get applied migrations from DB
            const { rows } = await client.query('SELECT name FROM _migrations');
            const appliedMigrations = new Set(rows.map(r => r.name));

            // 5. Apply pending migrations
            let applied = 0;
            for (const file of files) {
                if (!appliedMigrations.has(file)) {
                    console.log(`  📄 Applying: ${file}...`);
                    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

                    await client.query('BEGIN');
                    try {
                        await client.query(sql);
                        await client.query(
                            'INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT DO NOTHING',
                            [file]
                        );
                        await client.query('COMMIT');
                        console.log(`  ✅ Success: ${file}`);
                        applied++;
                    } catch (err) {
                        await client.query('ROLLBACK');
                        if (err.code === '42P07') {
                            console.log(`  ℹ️  Notice: Relation already exists for ${file}. Marking as applied.`);
                            await client.query(
                                'INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT DO NOTHING',
                                [file]
                            );
                            applied++;
                        } else {
                            console.error(`  ❌ Failed: ${file}`);
                            throw err;
                        }
                    }
                }
            }

            if (applied === 0) {
                console.log("✅ All migrations are up to date.");
            } else {
                console.log(`🎉 Applied ${applied} migration(s) successfully.`);
            }
        } finally {
            await client.query('SELECT pg_advisory_unlock($1)', [ADVISORY_LOCK_ID]);
        }
    } catch (err) {
        console.error("❌ Migration runner failed:", err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();

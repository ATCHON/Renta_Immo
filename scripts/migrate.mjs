import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ ERROR: DATABASE_URL not found in .env.local");
    process.exit(1);
}

const pool = new Pool({ connectionString });

async function migrate() {
    console.log("🚀 Starting database migrations...");
    console.log(`🔗 Target DB: ${connectionString.split('@')[1]}`); // Log host without credentials
    const client = await pool.connect();

    try {
        // 1. Create migrations table if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS _migrations (
                id SERIAL PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Get list of migrations from file system
        const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        // 3. Get applied migrations from DB
        const { rows } = await client.query('SELECT name FROM _migrations');
        const appliedMigrations = new Set(rows.map(r => r.name));

        // 4. Apply pending migrations
        for (const file of files) {
            if (!appliedMigrations.has(file)) {
                console.log(`  📄 Applying: ${file}...`);
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

                await client.query('BEGIN');
                try {
                    await client.query(sql);
                    await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
                    await client.query('COMMIT');
                    console.log(`  ✅ Success: ${file}`);
                } catch (err) {
                    await client.query('ROLLBACK');
                    if (err.code === '42P07') {
                        console.log(`  ℹ️  Notice: Relation already exists for ${file}. Marking as applied.`);
                        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
                    } else {
                        console.error(`  ❌ Failed: ${file}`);
                        throw err;
                    }
                }
            }
        }

        console.log("🎉 All migrations are up to date.");
    } catch (err) {
        console.error("❌ Migration runner failed:", err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();

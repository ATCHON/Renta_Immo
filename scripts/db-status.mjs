import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local si DATABASE_URL absent
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.join(process.cwd(), '.env.local') });
}

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ ERROR: DATABASE_URL not found (ni en env ni dans .env.local)");
    process.exit(1);
}

async function dbStatus() {
    const client = new Client({ connectionString });
    await client.connect();

    try {
        // S'assurer que la table existe
        await client.query(`
            CREATE TABLE IF NOT EXISTS _migrations (
                id SERIAL PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Migrations appliquées en DB
        const { rows } = await client.query(
            'SELECT name, applied_at FROM _migrations ORDER BY applied_at ASC'
        );
        const appliedMap = new Map(rows.map(r => [r.name, r.applied_at]));

        // Migrations présentes sur le filesystem
        const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');

        if (!fs.existsSync(migrationsDir)) {
            console.error(`❌ Dossier migrations introuvable : ${migrationsDir}`);
            process.exit(1);
        }

        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        const applied = files.filter(f => appliedMap.has(f));
        const pending = files.filter(f => !appliedMap.has(f));

        console.log(`\n📊 Migration status — ${connectionString.split('@')[1] ?? 'DB'}`);
        console.log(`${'─'.repeat(60)}`);
        console.log(`✅ Applied  : ${applied.length}`);
        console.log(`⏳ Pending  : ${pending.length}`);
        console.log(`${'─'.repeat(60)}`);

        if (applied.length > 0) {
            console.log('\nApplied migrations:');
            for (const name of applied) {
                const date = appliedMap.get(name);
                const dateStr = date ? new Date(date).toISOString().slice(0, 19).replace('T', ' ') : '?';
                console.log(`  ✅ ${name}  (${dateStr})`);
            }
        }

        if (pending.length > 0) {
            console.log('\nPending migrations:');
            for (const name of pending) {
                console.log(`  ⏳ ${name}`);
            }
        } else {
            console.log('\n✅ All migrations are up to date.');
        }

        console.log('');
    } catch (err) {
        console.error("❌ db:status failed:", err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

dbStatus();

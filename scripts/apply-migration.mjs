import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

// Use port 5433 directly
const connectionString = "postgresql://postgres:postgres@localhost:5433/postgres";

const pool = new Pool({
    connectionString,
});

async function applyMigration() {
    console.log("Applying migration to:", connectionString);
    try {
        const client = await pool.connect();
        console.log("Connected.");

        // 1. Drop existing tables to ensure clean slate with new schema
        console.log("Dropping existing auth tables...");
        await client.query('DROP TABLE IF EXISTS "verification", "account", "session", "user" CASCADE');
        console.log("Tables dropped.");

        // 2. Read Migration File
        // Adjust path as needed. We are running from project root.
        const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260204_better_auth_setup.sql');
        console.log("Reading migration file:", migrationPath);
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // 3. Execute SQL associated with migration
        console.log("Executing migration SQL...");
        await client.query(sql);
        console.log("Migration executed successfully!");

        client.release();
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await pool.end();
    }
}

applyMigration();

// scripts/promote-admin.mjs
import pg from 'pg';
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

async function promote(email) {
    if (!email) {
        console.error("❌ ERROR: Please provide an email address.");
        process.exit(1);
    }

    console.log(`🚀 Promoting user ${email} to admin...`);
    const client = await pool.connect();

    try {
        const { rowCount } = await client.query(
            "UPDATE public.user SET role = 'admin' WHERE email = $1",
            [email]
        );

        if (rowCount === 0) {
            console.error(`❌ ERROR: User with email ${email} not found.`);
        } else {
            console.log(`✅ Success: ${email} is now an admin.`);
        }
    } catch (err) {
        console.error("❌ Promotion failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

const email = process.argv[2];
promote(email);

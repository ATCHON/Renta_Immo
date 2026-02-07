import pg from 'pg';
const { Pool } = pg;

const connectionString = "postgresql://postgres:postgres@localhost:5433/postgres";

const pool = new Pool({
    connectionString,
});

async function testConnection() {
    console.log("Testing DB Connection to:", connectionString);
    try {
        const client = await pool.connect();
        console.log("Successfully connected!");
        const res = await client.query("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users';");
        console.log("Table check result:", res.rows[0]);
        client.release();
    } catch (err) {
        console.error("Connection error:", err);
    } finally {
        await pool.end();
    }
}

testConnection();

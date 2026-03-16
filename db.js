const { Pool } = require('pg');

// Uses DATABASE_URL provided by Vercel / Supabase
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// A helper function to execute queries
async function query(text, params) {
    // Return early if no DB URL is set (to prevent crashing during local HTML testing without backend)
    if (!process.env.DATABASE_URL) {
        console.warn('⚠️ DATABASE_URL not provided. Database operations will fail.');
        return { rows: [] };
    }
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
}

module.exports = {
    query,
    pool
};

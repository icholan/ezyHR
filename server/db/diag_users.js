const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    try {
        const tables = ['tenants', 'users'];

        for (const table of tables) {
            console.log(`\n--- Schema for: ${table} ---`);
            const res = await pool.query(`
                SELECT column_name, data_type, is_nullable, column_default 
                FROM information_schema.columns 
                WHERE table_name = '${table}'
                ORDER BY ordinal_position
            `);
            if (res.rows.length === 0) {
                console.log(`Table '${table}' not found.`);
            } else {
                console.table(res.rows);
            }
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

run();

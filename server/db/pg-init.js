require('dotenv').config();
const { Pool } = require('pg');

// Make sure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
    console.warn("⚠️ WARNING: DATABASE_URL is not set. Using local fallback.");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/hrms_singapore',
    // Consider adjusting max connections based on production needs
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    // Remove process.exit(-1) to prevent the entire server from crashing on a transient DB error
});

/**
 * Enhanced query wrapper to mimic some properties of sqlite/sql.js while we transition,
 * and provide helper methods for easier Postgres integration.
 */
const db = {
    /**
     * Translates SQLite ? parameter bindings to PostgreSQL $1, $2, etc.
     * This allows us to migrate raw queries more easily without rewriting everything immediately.
     */
    async query(text, params = []) {
        let pgText = text;

        // More robust replacement: only replace '?' if it's not part of a string or identifier
        // For now, simple replacement is okay, but we should be aware of limitations.
        if (text.includes('?')) {
            let i = 1;
            pgText = text.replace(/\?/g, () => `$${i++}`);
        }

        const client = await pool.connect();
        try {
            const result = await client.query(pgText, params);

            // Handle cases where no rows are returned (e.g., INSERT/UPDATE/DELETE)
            if (!result.rows || result.rows.length === 0) {
                return [];
            }

            const columns = Object.keys(result.rows[0]);
            const values = result.rows.map(row => columns.map(col => row[col]));

            return [{
                columns: columns,
                values: values
            }];

        } catch (err) {
            console.error(`[DB Error] Query: ${pgText}`, err);
            throw err;
        } finally {
            client.release();
        }
    },

    /**
     * Aliases for SQLite compatibility
     */
    async exec(text, params) {
        return this.query(text, params);
    },

    async run(text, params) {
        return this.query(text, params);
    },

    /**
     * Stub for the old saveDb() function from SQLite
     */
    saveDb() {
        // No-op for Postgres
    },

    /**
     * Stub for the old reloadDb() function
     */
    reloadDb() {
        // No-op for Postgres
    }
};

async function getDb() {
    // Test connection
    try {
        const res = await pool.query('SELECT NOW()');
        console.log(`[DB] Connected to PostgreSQL at ${res.rows[0].now}`);
    } catch (err) {
        console.error('[DB] Failed to connect to PostgreSQL. Ensure it is running.', err);
        throw err;
    }
    return db;
}

module.exports = { getDb, pool, db, saveDb: db.saveDb, reloadDb: db.reloadDb };

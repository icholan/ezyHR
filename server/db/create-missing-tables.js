const { pool } = require('./pg-init');

async function createMissingTables() {
    console.log('Creating missing tables in PostgreSQL...');
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                entity_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT
                -- In SQLite it referenced business_entities, but our PG main table is entities
                -- FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
            )
        `);
        console.log('customers table created');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS sites (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT
                -- FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
            )
        `);
        console.log('sites table created');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS site_working_hours (
                id SERIAL PRIMARY KEY,
                site_id INTEGER NOT NULL,
                shift_type TEXT NOT NULL,
                day_of_week INTEGER NOT NULL,
                start_time TEXT,
                end_time TEXT,
                meal_start_time TEXT,
                meal_end_time TEXT,
                ot_start_time TEXT,
                compulsory_ot_hours REAL DEFAULT 0
                -- FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
            )
        `);
        console.log('site_working_hours table created');

    } catch (err) {
        console.error('Error creating tables:', err);
    } finally {
        pool.end();
    }
}

createMissingTables();

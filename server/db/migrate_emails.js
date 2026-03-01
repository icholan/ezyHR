const { pool } = require('./pg-init');

async function migrateUsernames() {
    try {
        console.log('🚀 Migrating existing usernames to email format...');

        // 1. Update 'system'
        await pool.query("UPDATE users SET username = 'system@ezyhr.com' WHERE username = 'system'");
        console.log('✅ Updated system -> system@ezyhr.com');

        // 2. Update 'admin'
        await pool.query("UPDATE users SET username = 'admin@ezyhr.com' WHERE username = 'admin'");
        console.log('✅ Updated admin -> admin@ezyhr.com');

        // 3. Update any other non-email usernames (best effort)
        const res = await pool.query("SELECT id, username FROM users WHERE username NOT LIKE '%@%'");
        for (const row of res.rows) {
            const newUsername = `${row.username}@placeholder.com`;
            await pool.query("UPDATE users SET username = $1 WHERE id = $2", [newUsername, row.id]);
            console.log(`✅ Updated ${row.username} -> ${newUsername}`);
        }

        console.log('Done.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

migrateUsernames();

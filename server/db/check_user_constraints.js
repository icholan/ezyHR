const { pool } = require('./pg-init');

async function checkConstraints() {
    try {
        const res = await pool.query(`
            SELECT conname, contype, pg_get_constraintdef(c.oid) as def
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE conrelid = 'users'::regclass;
        `);
        console.table(res.rows);

        const dupes = await pool.query(`
            SELECT username, COUNT(*) 
            FROM users 
            GROUP BY username 
            HAVING COUNT(*) > 1
        `);
        console.log('Duplicate usernames found:');
        console.table(dupes.rows);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkConstraints();

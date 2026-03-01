const { pool } = require('./pg-init');

async function listUsers() {
    try {
        const res = await pool.query('SELECT id, username, full_name, is_system_admin FROM users LIMIT 10');
        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

listUsers();

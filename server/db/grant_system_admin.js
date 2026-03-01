const { pool } = require('./pg-init');

async function grantAdmin(username) {
    try {
        const checkRes = await pool.query('SELECT id, username FROM users WHERE username = $1', [username]);
        if (checkRes.rows.length === 0) {
            console.log(`User '${username}' not found.`);
            return;
        }

        await pool.query('UPDATE users SET is_system_admin = true WHERE username = $1', [username]);
        console.log(`✅ Platform Owner privileges granted to user: ${username}`);

        const verify = await pool.query('SELECT id, username, is_system_admin FROM users WHERE username = $1', [username]);
        console.table(verify.rows);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

grantAdmin('system');

const { pool } = require('./pg-init');

async function debugUser() {
    try {
        const res = await pool.query(`
            SELECT u.username, u.tenant_id, t.name as tenant_name 
            FROM users u 
            LEFT JOIN tenants t ON u.tenant_id = t.id 
            WHERE u.username = 'system'
        `);
        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

debugUser();

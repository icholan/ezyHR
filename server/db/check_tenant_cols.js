const { pool } = require('./pg-init');

async function checkColumns() {
    try {
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tenants'
        `);
        console.log('Columns in tenants table:');
        console.table(res.rows.map(r => r.column_name));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkColumns();

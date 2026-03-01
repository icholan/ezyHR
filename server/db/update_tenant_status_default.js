const { pool } = require('./pg-init');

async function updateDefaultStatus() {
    try {
        console.log('--- Updating tenants.status default to "pending" ---');
        await pool.query("ALTER TABLE tenants ALTER COLUMN status SET DEFAULT 'pending'");
        console.log('✅ Default status updated.');
    } catch (err) {
        console.error('❌ Error updating default status:', err);
    } finally {
        await pool.end();
    }
}

updateDefaultStatus();

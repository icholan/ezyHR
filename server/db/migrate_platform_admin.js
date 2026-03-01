const { pool } = require('./pg-init');

async function migrate() {
    try {
        console.log('--- Migrating Users Table ---');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_system_admin BOOLEAN DEFAULT false');
        console.log('✅ Added is_system_admin to users');

        console.log('\n--- Migrating Tenants Table ---');
        await pool.query('ALTER TABLE tenants ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT \'active\'');
        await pool.query('ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan_expiry_date TIMESTAMP WITH TIME ZONE');
        await pool.query('ALTER TABLE tenants ADD COLUMN IF NOT EXISTS max_entities INTEGER DEFAULT 5');
        console.log('✅ Updated tenants table with status and limits');

        // Optional: Make a specific user a system admin for testing
        // You can update this with your desired username
        // await pool.query("UPDATE users SET is_system_admin = true WHERE username = 'admin'");

    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

migrate();

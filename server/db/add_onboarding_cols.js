const { pool } = require('./pg-init');

async function addOnboardingCols() {
    const client = await pool.connect();
    try {
        console.log('--- Adding onboarding columns to tenants table ---');

        await client.query('BEGIN');

        // Add onboarding_completed column if it doesn't exist
        await client.query(`
            ALTER TABLE tenants 
            ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE
        `);

        // Add onboarding_step column if it doesn't exist
        await client.query(`
            ALTER TABLE tenants 
            ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1
        `);

        await client.query('COMMIT');
        console.log('✅ Onboarding columns added successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error adding onboarding columns:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

addOnboardingCols();

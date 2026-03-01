const { pool } = require('./db/pg-init');

async function testOnboardingFlow() {
    const client = await pool.connect();
    try {
        console.log('--- Testing Tenant Onboarding Flow (Backend) ---');

        // 1. Create a dummy tenant to simulate signup
        console.log('1. Creating test tenant...');
        const tenantRes = await client.query(
            "INSERT INTO tenants (name, billing_email, status) VALUES ('Onboarding Test Corp', 'test@onboarding.com', 'active') RETURNING id, onboarding_completed, onboarding_step"
        );
        const tenantId = tenantRes.rows[0].id;
        console.log(`   Tenant ID: ${tenantId}, Completed: ${tenantRes.rows[0].onboarding_completed}, Step: ${tenantRes.rows[0].onboarding_step}`);

        if (tenantRes.rows[0].onboarding_completed !== false || tenantRes.rows[0].onboarding_step !== 1) {
            throw new Error('Initial onboarding state is incorrect');
        }

        // Create initial entity as auth.js does
        const entityRes = await client.query(
            "INSERT INTO entities (tenant_id, name, is_active) VALUES ($1, 'Onboarding Test Corp', true) RETURNING id",
            [tenantId]
        );
        const entityId = entityRes.rows[0].id;
        console.log(`   Initial Entity ID: ${entityId}`);

        // 2. Simulate Step 1 (Company Profile)
        console.log('2. Simulating Step 1...');
        await client.query("UPDATE tenants SET name = 'Updated Corp Name', onboarding_step = 2 WHERE id = $1", [tenantId]);
        await client.query("UPDATE entities SET address = '123 Test St', uen = 'UEN12345' WHERE tenant_id = $1", [tenantId]);

        const step1Check = await client.query("SELECT name, onboarding_step FROM tenants WHERE id = $1", [tenantId]);
        console.log(`   Updated Name: ${step1Check.rows[0].name}, New Step: ${step1Check.rows[0].onboarding_step}`);

        // 3. Simulate Step 2 (Operations)
        console.log('3. Simulating Step 2...');
        await client.query(`
            INSERT INTO shift_settings (entity_id, shift_name, start_time, end_time, lunch_break_mins)
            VALUES ($1, 'General', '09:00', '18:00', 60)
        `, [entityId]);
        await client.query("UPDATE tenants SET onboarding_step = 3 WHERE id = $1", [tenantId]);

        const shiftCheck = await client.query("SELECT start_time FROM shift_settings WHERE entity_id = $1", [entityId]);
        console.log(`   Shift Start Time: ${shiftCheck.rows[0].start_time}`);

        // 4. Simulate Completion
        console.log('4. Simulating Completion...');
        await client.query("UPDATE tenants SET onboarding_completed = TRUE WHERE id = $1", [tenantId]);

        const finalCheck = await client.query("SELECT onboarding_completed FROM tenants WHERE id = $1", [tenantId]);
        console.log(`   Final Onboarding Completed: ${finalCheck.rows[0].onboarding_completed}`);

        if (finalCheck.rows[0].onboarding_completed !== true) {
            throw new Error('Onboarding completion failed');
        }

        console.log('\n🎉 Onboarding Backend Flow Verified!');

        // Cleanup
        await client.query("DELETE FROM shift_settings WHERE entity_id = $1", [entityId]);
        await client.query("DELETE FROM entities WHERE tenant_id = $1", [tenantId]);
        await client.query("DELETE FROM tenants WHERE id = $1", [tenantId]);

    } catch (err) {
        console.error('\n❌ Test failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

testOnboardingFlow();

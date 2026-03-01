const { pool } = require('./db/pg-init');
const bcrypt = require('bcryptjs');

async function testApprovalFlow() {
    const client = await pool.connect();
    try {
        console.log('--- Testing Tenant Approval Flow ---');

        const testEmail = `test_tenant_${Date.now()}@example.com`;
        const companyName = 'Test Corp Approval';
        const password = 'Password123!';
        const hash = bcrypt.hashSync(password, 10);

        await client.query('BEGIN');

        // 1. Simulate Signup
        console.log('1. Simulating Signup...');
        const tenantRes = await client.query(
            `INSERT INTO tenants (name, billing_email, subscription_plan) 
             VALUES ($1, $2, 'starter') RETURNING id, status`,
            [companyName, testEmail]
        );
        const tenantId = tenantRes.rows[0].id;
        const initialStatus = tenantRes.rows[0].status;
        console.log(`   Tenant created with ID: ${tenantId}, Status: ${initialStatus}`);

        if (initialStatus !== 'pending') {
            throw new Error(`Expected initial status to be 'pending', got '${initialStatus}'`);
        }

        // 2. Mock Login Check (Simulate what auth.js does)
        console.log('2. Checking Login Restriction...');
        const loginCheck = await client.query('SELECT status FROM tenants WHERE id = $1', [tenantId]);
        const statusForLogin = loginCheck.rows[0].status;
        console.log(`   Tenant status for login check: ${statusForLogin}`);

        if (statusForLogin === 'active') {
            throw new Error('Login should be restricted for pending tenants!');
        }
        console.log('   ✅ Access correctly restricted.');

        // 3. Simulate Admin Approval
        console.log('3. Simulating Admin Approval...');
        await client.query('UPDATE tenants SET status = $1 WHERE id = $2', ['active', tenantId]);

        const approvalCheck = await client.query('SELECT status FROM tenants WHERE id = $1', [tenantId]);
        const finalStatus = approvalCheck.rows[0].status;
        console.log(`   Tenant status after approval: ${finalStatus}`);

        if (finalStatus !== 'active') {
            throw new Error(`Expected final status to be 'active', got '${finalStatus}'`);
        }
        console.log('   ✅ Approval successful.');

        await client.query('ROLLBACK'); // Don't leave test data
        console.log('\n🎉 All tests passed!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('\n❌ Test failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

testApprovalFlow();

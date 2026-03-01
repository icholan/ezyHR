const { pool } = require('./pg-init');

async function testDupe() {
    try {
        console.log('--- Testing Duplicate Usernames ---');

        // 1. Create two dummy tenants
        const t1 = await pool.query("INSERT INTO tenants (name, billing_email) VALUES ('Test Tenant 1', 't1@test.com') RETURNING id");
        const t2 = await pool.query("INSERT INTO tenants (name, billing_email) VALUES ('Test Tenant 2', 't2@test.com') RETURNING id");

        const id1 = t1.rows[0].id;
        const id2 = t2.rows[0].id;

        console.log('Created Tenants:', id1, id2);

        // 2. Create user 'dupeuser' in Tenant 1
        await pool.query("INSERT INTO users (tenant_id, username, password_hash, full_name) VALUES ($1, $2, $3, $4)",
            [id1, 'dupeuser', 'hash', 'User 1']);
        console.log('Created dupeuser in Tenant 1');

        try {
            // 3. Try to create user 'dupeuser' in Tenant 2
            await pool.query("INSERT INTO users (tenant_id, username, password_hash, full_name) VALUES ($1, $2, $3, $4)",
                [id2, 'dupeuser', 'hash', 'User 2']);
            console.log('❌ ERROR: Successfully created same username in Tenant 2! (Contraint failed)');
        } catch (err) {
            console.log('✅ SUCCESS: Database blocked duplicate username. Message:', err.message);
        }

        // Cleanup
        await pool.query("DELETE FROM users WHERE username = 'dupeuser'");
        await pool.query("DELETE FROM tenants WHERE id IN ($1, $2)", [id1, id2]);

    } catch (err) {
        console.error('Test Error:', err.message);
    } finally {
        await pool.end();
    }
}

testDupe();

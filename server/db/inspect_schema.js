const { pool } = require('./pg-init');

async function inspectSchema() {
    try {
        console.log('--- Table: tenants ---');
        const tenantsRes = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tenants'");
        console.table(tenantsRes.rows);

        console.log('\n--- Table: users ---');
        const usersRes = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        console.table(usersRes.rows);

        console.log('\n--- Table: entities ---');
        const entitiesRes = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'entities'");
        console.table(entitiesRes.rows);

        console.log('\n--- Table: user_entity_roles ---');
        const rolesRes = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_entity_roles'");
        console.table(rolesRes.rows);

    } catch (err) {
        console.error('Error inspecting schema:', err);
    } finally {
        pool.end();
    }
}

inspectSchema();

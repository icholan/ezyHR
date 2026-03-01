const express = require('express');
const { pool } = require('../db/pg-init');
const { authMiddleware, systemAdminMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes here are protected by both auth and systemAdmin middleware
router.use(authMiddleware);
router.use(systemAdminMiddleware);

// GET /api/admin/tenants - List all tenants with stats
router.get('/tenants', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                t.*,
                (SELECT COUNT(*) FROM entities e WHERE e.tenant_id = t.id) as entity_count,
                (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.id) as user_count,
                (SELECT COUNT(*) FROM employees emp JOIN entities ent ON emp.entity_id = ent.id WHERE ent.tenant_id = t.id) as employee_count
            FROM tenants t
            ORDER BY t.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/tenants/:id - Update tenant (status, plan, etc.)
router.put('/tenants/:id', async (req, res) => {
    try {
        const { status, subscription_plan, max_entities, plan_expiry_date } = req.body;
        const { id } = req.params;

        await pool.query(`
            UPDATE tenants 
            SET status = COALESCE($1, status),
                subscription_plan = COALESCE($2, subscription_plan),
                max_entities = COALESCE($3, max_entities),
                plan_expiry_date = COALESCE($4, plan_expiry_date),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
        `, [status, subscription_plan, max_entities, plan_expiry_date, id]);

        res.json({ message: 'Tenant updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/stats - Global platform stats
router.get('/stats', async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM tenants) as total_tenants,
                (SELECT COUNT(*) FROM entities) as total_entities,
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM employees) as total_employees
        `);
        res.json(stats.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

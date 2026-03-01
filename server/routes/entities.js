const express = require('express');
const { getDb, saveDb } = require('../db/pg-init');
const { authMiddleware } = require('../middleware/auth');
const auditLogger = require('../utils/auditLogger');

const router = express.Router();

function toObjects(result) {
    if (!result.length) return [];
    const { columns, values } = result[0];
    return values.map(row => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        return obj;
    });
}

// GET /api/entities - Get all entities the current user has access to
router.get('/', authMiddleware, async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.user.id;

        const query = `
            SELECT e.*, uer.role, uer.managed_groups 
            FROM entities e
            JOIN user_entity_roles uer ON e.id = uer.entity_id
            WHERE uer.user_id = ?
        `;

        const result = await db.exec(query, [userId]);
        res.json(toObjects(result));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/entities (Admin only)
router.post('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Access denied' });
    try {
        const db = await getDb();
        const { pool } = require('../db/pg-init');
        const {
            name, uen, address, contact_number, website, email_domains, logo_url, performance_multiplier,
            cpf_submission_no, iras_ais_id, bank_name, bank_account_no, bank_code, bank_branch_code, giro_customer_name,
            is_active
        } = req.body;

        // Quota Check: Count current entities vs max_entities
        const tenantRes = await pool.query('SELECT max_entities FROM tenants WHERE id = $1', [req.user.tenantId]);
        const maxEntities = tenantRes.rows[0]?.max_entities || 5;

        const countRes = await pool.query('SELECT COUNT(*) FROM entities WHERE tenant_id = $1', [req.user.tenantId]);
        const currentCount = parseInt(countRes.rows[0].count);

        if (currentCount >= maxEntities) {
            return res.status(400).json({
                error: `Limit Reached: Your plan allows a maximum of ${maxEntities} entities. Please upgrade to add more.`
            });
        }

        // Insert Entity
        const insertResult = await db.exec(
            `INSERT INTO entities (
                tenant_id, name, uen, address, contact_number, website, email_domains, logo_url, performance_multiplier,
                cpf_submission_no, iras_ais_id, bank_name, bank_account_no, bank_code, bank_branch_code, giro_customer_name,
                is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
            [
                req.user.tenantId,
                name, uen, address || '', contact_number || '', website || '', email_domains || '', logo_url || '', performance_multiplier || 0,
                cpf_submission_no || '', iras_ais_id || '', bank_name || '', bank_account_no || '', bank_code || '', bank_branch_code || '', giro_customer_name || '',
                is_active === undefined ? true : is_active
            ]
        );

        // Get inserted ID
        const entityId = insertResult[0].values[0][0];

        // Assign current Admin to this new Entity automatically
        await db.run(
            'INSERT INTO user_entity_roles (user_id, entity_id, role, managed_groups) VALUES (?, ?, ?, ?)',
            [req.user.id, entityId, 'Admin', '[]']
        );

        saveDb();
        await auditLogger.log({
            tenantId: req.user.tenantId, // Admin creating a new entity is still within their tenant's data isolated scope or global
            userId: req.user.id,
            action: 'CREATE_ENTITY',
            entityType: 'entities',
            entityId: entityId,
            newValues: { name, uen, is_active },
            req
        });

        res.status(201).json({ id: entityId, name, uen, address, contact_number, website, email_domains, is_active, role: 'Admin', managed_groups: '[]' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/entities/:id (Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Access denied' });
    try {
        const db = await getDb();
        const {
            name, uen, address, contact_number, website, email_domains, logo_url, performance_multiplier,
            cpf_submission_no, iras_ais_id, bank_name, bank_account_no, bank_code, bank_branch_code, giro_customer_name,
            is_active
        } = req.body;

        // Capture OLD values before update
        const oldResult = await db.exec('SELECT name, uen, is_active FROM entities WHERE id = ?', [req.params.id]);
        const oldValues = toObjects(oldResult)[0];

        await db.run(
            `UPDATE entities SET 
                name = ?, uen = ?, address = ?, contact_number = ?, website = ?, email_domains = ?, logo_url = ?, performance_multiplier = ?,
                cpf_submission_no = ?, iras_ais_id = ?, bank_name = ?, bank_account_no = ?, bank_code = ?, bank_branch_code = ?, giro_customer_name = ?,
                is_active = ?
            WHERE id = ?`,
            [
                name, uen, address || '', contact_number || '', website || '', email_domains || '', logo_url || '', performance_multiplier || 0,
                cpf_submission_no || '', iras_ais_id || '', bank_name || '', bank_account_no || '', bank_code || '', bank_branch_code || '', giro_customer_name || '',
                is_active,
                req.params.id
            ]
        );
        saveDb();
        await auditLogger.log({
            tenantId: req.user.tenantId,
            userId: req.user.id,
            action: 'UPDATE_ENTITY',
            entityType: 'entities',
            entityId: req.params.id,
            oldValues: oldValues,
            newValues: { name, uen, is_active },
            req
        });

        res.json({ message: 'Entity updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/entities/:id (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Access denied' });
    try {
        const db = await getDb();
        await db.run('DELETE FROM user_entity_roles WHERE entity_id = ?', [req.params.id]);
        await db.run('DELETE FROM entities WHERE id = ?', [req.params.id]);
        saveDb();
        await auditLogger.log({
            tenantId: req.user.tenantId,
            userId: req.user.id,
            action: 'DELETE_ENTITY',
            entityType: 'entities',
            entityId: req.params.id,
            req
        });

        res.json({ message: 'Entity deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

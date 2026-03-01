const express = require('express');
const { getDb } = require('../db/pg-init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function toObjects(result) {
    if (!result || !result.length) return [];
    const { columns, values } = result[0];
    return values.map(row => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        return obj;
    });
}

// GET /api/audit-logs
router.get('/', authMiddleware, async (req, res) => {
    // Audit logs are typically for Admins only
    if (req.user.role !== 'Admin' && req.user.role !== 'HR') {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const db = await getDb();
        const tenantId = req.user.tenantId;

        let query = `
            SELECT al.*, u.full_name as user_name, u.username
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE al.tenant_id = ?
        `;
        const params = [tenantId];

        const { action, entityType, startDate, endDate } = req.query;

        if (action) {
            query += ' AND al.action = ?';
            params.push(action);
        }
        if (entityType) {
            query += ' AND al.entity_type = ?';
            params.push(entityType);
        }
        if (startDate) {
            query += ' AND al.created_at >= ?';
            params.push(startDate);
        }
        if (endDate) {
            query += ' AND al.created_at <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY al.created_at DESC LIMIT 500';

        const result = await db.exec(query, params);
        res.json(toObjects(result));
    } catch (err) {
        console.error('[AUDIT_LOG_GET_ERROR]', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

const express = require('express');
const { getDb, saveDb } = require('../db/pg-init');
const { authMiddleware } = require('../middleware/auth');

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

// GET /api/holidays
router.get('/', authMiddleware, async (req, res) => {
    try {
        const db = await getDb();
        // Support entityId override via query param (used by Attendance page cross-entity)
        const entityId = req.query.entityId || req.user.entityId;
        const { year, month } = req.query;

        let sql = 'SELECT * FROM holidays WHERE entity_id = ?';
        const params = [entityId];

        if (year && month) {
            const paddedMonth = String(month).padStart(2, '0');
            sql += ` AND TO_CHAR(date, 'YYYY-MM') = '${year}-${paddedMonth}'`;
        } else if (year) {
            sql += ` AND TO_CHAR(date, 'YYYY') = '${year}'`;
        }

        sql += ' ORDER BY date ASC';

        const result = await db.exec(sql, params);
        res.json(toObjects(result));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/holidays (Admin and HR only)
router.post('/', authMiddleware, async (req, res) => {
    if (!['Admin', 'HR'].includes(req.user.role)) return res.status(403).json({ error: 'Access denied' });
    try {
        const db = await getDb();
        const entityId = req.user.entityId;
        const { name, date, description } = req.body;

        const insertResult = await db.exec('INSERT INTO holidays (entity_id, name, date, description) VALUES (?, ?, ?, ?) RETURNING id', [entityId, name, date, description]);
        const id = insertResult[0].values[0][0];

        saveDb();
        res.status(201).json({ id, entity_id: entityId, name, date, description });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/holidays/:id
router.put('/:id', authMiddleware, async (req, res) => {
    if (!['Admin', 'HR'].includes(req.user.role)) return res.status(403).json({ error: 'Access denied' });
    try {
        const db = await getDb();
        const entityId = req.user.entityId;
        const { name, date, description } = req.body;

        await db.run('UPDATE holidays SET name = ?, date = ?, description = ? WHERE id = ? AND entity_id = ?', [name, date, description, req.params.id, entityId]);
        saveDb();
        res.json({ message: 'Holiday updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/holidays/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    if (!['Admin', 'HR'].includes(req.user.role)) return res.status(403).json({ error: 'Access denied' });
    try {
        const db = await getDb();
        const entityId = req.user.entityId;

        await db.run('DELETE FROM holidays WHERE id = ? AND entity_id = ?', [req.params.id, entityId]);
        saveDb();
        res.json({ message: 'Holiday deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

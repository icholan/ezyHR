const express = require('express');
const { pool } = require('../db/pg-init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes are protected by authMiddleware
router.use(authMiddleware);

// GET /api/onboarding/status
router.get('/status', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT onboarding_completed, onboarding_step FROM tenants WHERE id = $1',
            [req.user.tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/onboarding/step-1 - Save Company Profile
router.post('/step-1', async (req, res) => {
    const client = await pool.connect();
    try {
        const { companyName, address, uen } = req.body;
        const tenantId = req.user.tenantId;

        await client.query('BEGIN');

        // Update Tenant Name
        await client.query(
            'UPDATE tenants SET name = $1 WHERE id = $2',
            [companyName, tenantId]
        );

        // Update Primary Entity details
        // Note: During signup, the primary entity name is set to the company name.
        // We find the first entity created for this tenant.
        await client.query(
            `UPDATE entities SET name = $1, address = $2, uen = $3 
             WHERE tenant_id = $4 AND id = (SELECT id FROM entities WHERE tenant_id = $4 ORDER BY created_at ASC LIMIT 1)`,
            [companyName, address, uen, tenantId]
        );

        // Advance to next step
        await client.query(
            'UPDATE tenants SET onboarding_step = 2 WHERE id = $1',
            [tenantId]
        );

        await client.query('COMMIT');
        res.json({ message: 'Step 1 saved successfully', nextStep: 2 });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// POST /api/onboarding/step-2 - Save Basic Operations
router.post('/step-2', async (req, res) => {
    const client = await pool.connect();
    try {
        const { startTime, endTime, lunchBreakMins, workingDaysPerWeek } = req.body;
        const tenantId = req.user.tenantId;

        await client.query('BEGIN');

        // Update default shift settings for the first entity
        const entityRes = await client.query(
            'SELECT id FROM entities WHERE tenant_id = $1 ORDER BY created_at ASC LIMIT 1',
            [tenantId]
        );
        const entityId = entityRes.rows[0].id;

        // Upsert shift settings
        await client.query(`
            INSERT INTO shift_settings (entity_id, shift_name, start_time, end_time, lunch_break_mins)
            VALUES ($1, 'General', $2, $3, $4)
            ON CONFLICT (entity_id, shift_name) DO UPDATE 
            SET start_time = $2, end_time = $3, lunch_break_mins = $4
        `, [entityId, startTime || '08:00', endTime || '17:00', lunchBreakMins || 60]);

        // Advance step
        await client.query(
            'UPDATE tenants SET onboarding_step = 3 WHERE id = $1',
            [tenantId]
        );

        await client.query('COMMIT');
        res.json({ message: 'Step 2 saved successfully', nextStep: 3 });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// POST /api/onboarding/complete
router.post('/complete', async (req, res) => {
    try {
        await pool.query(
            'UPDATE tenants SET onboarding_completed = TRUE WHERE id = $1',
            [req.user.tenantId]
        );
        res.json({ message: 'Onboarding completed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

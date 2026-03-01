const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, saveDb, pool } = require('../db/pg-init');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const auditLogger = require('../utils/auditLogger');

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

// POST /api/auth/signup - SaaS Multi-tenant Signup
router.post('/signup', async (req, res) => {
    const client = await pool.connect();
    try {
        const { companyName, username, password, fullName, billingEmail } = req.body;

        if (!companyName || !username || !password || !fullName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username)) {
            return res.status(400).json({ error: 'Username must be a valid email address' });
        }

        await client.query('BEGIN');

        // 1. Create Tenant
        const tenantRes = await client.query(
            `INSERT INTO tenants (name, billing_email, subscription_plan) 
             VALUES ($1, $2, 'starter') RETURNING id`,
            [companyName, billingEmail || username]
        );
        const tenantId = tenantRes.rows[0].id;

        // 2. Create User
        const hash = bcrypt.hashSync(password, 10);
        const userRes = await client.query(
            `INSERT INTO users (tenant_id, username, password_hash, full_name) 
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [tenantId, username, hash, fullName]
        );
        const userId = userRes.rows[0].id;

        // 3. Create Initial Entity
        const entityRes = await client.query(
            `INSERT INTO entities (tenant_id, name, is_active) 
             VALUES ($1, $2, true) RETURNING id`,
            [tenantId, companyName]
        );
        const entityId = entityRes.rows[0].id;

        // 4. Assign User as Admin to this Entity
        await client.query(
            `INSERT INTO user_entity_roles (user_id, entity_id, role, managed_groups) 
             VALUES ($1, $2, 'Admin', '[]')`,
            [userId, entityId]
        );

        await client.query('COMMIT');

        // Generate token for automatic login after signup
        const token = jwt.sign(
            { id: userId, username, fullName, tenantId, isSystemAdmin: false },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Log Signup
        await auditLogger.log({
            tenantId,
            userId,
            action: 'SIGNUP',
            entityType: 'tenants',
            entityId: tenantId,
            newValues: { companyName, username, fullName },
            req
        });

        res.status(201).json({
            message: 'Signup successful',
            token,
            user: { id: userId, username, fullName, tenantId, tenantName: companyName, isSystemAdmin: false },
            entityId // Return the first entity ID to help front-end initial load
        });

    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505') { // Unique constraint violation
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const db = await getDb();
        const user = await db.exec(`
            SELECT u.*, t.name as tenant_display_name 
            FROM users u
            JOIN tenants t ON u.tenant_id = t.id
            WHERE u.username = '${username}'
        `);

        if (!user.length || !user[0].values.length) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const row = user[0].values[0];
        const columns = user[0].columns;
        const userData = {};
        columns.forEach((col, i) => userData[col] = row[i]);

        const valid = bcrypt.compareSync(password, userData.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check Tenant Status
        const tenantRes = await pool.query('SELECT status FROM tenants WHERE id = $1', [userData.tenant_id]);
        const tenantStatus = tenantRes.rows[0]?.status || 'active';

        if (tenantStatus !== 'active' && !userData.is_system_admin) {
            return res.status(403).json({ error: `Your organization account is ${tenantStatus}. Please contact support.` });
        }

        // Fetch available entities for this user under their tenant
        const entitiesRes = await pool.query(`
            SELECT e.id, e.name, uer.role, e.uen
            FROM entities e
            JOIN user_entity_roles uer ON e.id = uer.entity_id
            WHERE uer.user_id = $1 AND e.tenant_id = $2
        `, [userData.id, userData.tenant_id]);

        const entities = entitiesRes.rows;

        const token = jwt.sign(
            {
                id: userData.id,
                username: userData.username,
                fullName: userData.full_name,
                tenantId: userData.tenant_id,
                isSystemAdmin: !!userData.is_system_admin
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Log Login
        await auditLogger.log({
            tenantId: userData.tenant_id,
            userId: userData.id,
            action: 'LOGIN',
            entityType: 'users',
            entityId: userData.id,
            req
        });

        res.json({
            token,
            user: {
                id: userData.id,
                username: userData.username,
                fullName: userData.full_name,
                tenantId: userData.tenant_id,
                tenantName: userData.tenant_display_name,
                isSystemAdmin: !!userData.is_system_admin
            },
            entities: entities
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, password, fullName } = req.body;
        if (!username || !password || !fullName) {
            return res.status(400).json({ error: 'All fields required' });
        }

        const db = await getDb();
        const hash = bcrypt.hashSync(password, 10);
        await db.run(
            `INSERT INTO users (username, password_hash, full_name) VALUES (?, ?, ?)`,
            [username, hash, fullName]
        );
        saveDb();

        res.json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Both old and new passwords are required' });
        }

        const userRes = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = userRes.rows[0];

        if (!bcrypt.compareSync(oldPassword, user.password_hash)) {
            return res.status(401).json({ error: 'Incorrect current password' });
        }

        const newHash = bcrypt.hashSync(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/auth/profile - Update user profile
router.post('/update-profile', authMiddleware, async (req, res) => {
    try {
        const { fullName } = req.body;
        if (!fullName) return res.status(400).json({ error: 'Full name is required' });

        await pool.query('UPDATE users SET full_name = $1 WHERE id = $2', [fullName, req.user.id]);

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/me - Get current user profile and tenant info
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id, u.username, u.full_name, u.tenant_id, t.name as tenant_display_name, u.is_system_admin
            FROM users u
            JOIN tenants t ON u.tenant_id = t.id
            WHERE u.id = $1
        `, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = result.rows[0];

        res.json({
            id: userData.id,
            username: userData.username,
            fullName: userData.full_name,
            tenantId: userData.tenant_id,
            tenantName: userData.tenant_display_name,
            isSystemAdmin: !!userData.is_system_admin
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

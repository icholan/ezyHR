const jwt = require('jsonwebtoken');
const { getDb } = require('../db/init');

const JWT_SECRET = process.env.JWT_SECRET || 'hrms-sg-secret-key-2026';

function toObjects(result) {
    if (!result || !result.length) return [];
    const { columns, values } = result[0];
    return values.map(row => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        return obj;
    });
}

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;

    let entityId = req.headers['entity-id'] || req.query.entityId;

    try {
        const { pool } = require('../db/pg-init');

        // 1. Verify User and Tenant status
        const userRes = await pool.query(`
            SELECT u.tenant_id, u.is_system_admin, t.status as tenant_status
            FROM users u
            JOIN tenants t ON u.tenant_id = t.id
            WHERE u.id = $1
        `, [req.user.id]);

        if (userRes.rows.length === 0) {
            return res.status(401).json({ error: 'User does not exist' });
        }
        const { tenant_id: userTenantId, is_system_admin: isSystemAdmin, tenant_status: tenantStatus } = userRes.rows[0];

        // Enforce Tenant Status (Except for System Admins managing the platform)
        if (tenantStatus !== 'active' && !isSystemAdmin) {
            return res.status(403).json({ error: `Your account is ${tenantStatus}. Please contact support.` });
        }

        req.user.tenantId = userTenantId;
        req.user.isSystemAdmin = !!isSystemAdmin;

        // 2. If no entity provided, auto-detect primary entity for this user/tenant
        if (!entityId) {
            const entitiesRes = await pool.query(`
                SELECT uer.entity_id 
                FROM user_entity_roles uer
                JOIN entities e ON uer.entity_id = e.id
                WHERE uer.user_id = $1 AND e.tenant_id = $2
                LIMIT 1
            `, [req.user.id, userTenantId]);

            if (entitiesRes.rows.length > 0) {
                entityId = entitiesRes.rows[0].entity_id;
            }
        }

        if (entityId) {
            const parsedEntityId = parseInt(entityId, 10);
            if (isNaN(parsedEntityId)) {
                return res.status(400).json({ error: 'Invalid entity ID format' });
            }

            // 3. Verify user has role AND entity belongs to user's tenant (Security Heart)
            const roleRes = await pool.query(`
                SELECT uer.role, uer.managed_groups 
                FROM user_entity_roles uer
                JOIN entities e ON uer.entity_id = e.id
                WHERE uer.user_id = $1 AND uer.entity_id = $2 AND e.tenant_id = $3
            `, [req.user.id, parsedEntityId, userTenantId]);

            if (roleRes.rows.length > 0) {
                const { role, managed_groups } = roleRes.rows[0];
                let decodedGroups = [];
                try {
                    decodedGroups = typeof managed_groups === 'string' ? JSON.parse(managed_groups) : managed_groups;
                } catch (e) {
                    decodedGroups = [];
                }

                req.user.entityId = parsedEntityId;
                req.user.role = role;
                req.user.managedGroups = decodedGroups;
            } else {
                // If they provided an Entity ID but have no role or it's cross-tenant
                return res.status(403).json({ error: 'Access denied: Entity not found in your tenant group' });
            }
        }
    } catch (err) {
        console.error('[Auth Middleware Error]', err);
        return res.status(500).json({ error: 'Internal auth error: ' + err.message });
    }

    next();
}

function systemAdminMiddleware(req, res, next) {
    if (!req.user || !req.user.isSystemAdmin) {
        return res.status(403).json({ error: 'Access denied: System Admin privileges required' });
    }
    next();
}

module.exports = { authMiddleware, systemAdminMiddleware, JWT_SECRET };

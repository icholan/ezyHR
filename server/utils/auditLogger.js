const { pool } = require('../db/pg-init');

/**
 * Audit Logger Utility
 * Captures user actions and data changes for compliance and security.
 */
const auditLogger = {
    /**
     * Log an action to the audit_logs table.
     * @param {Object} params
     * @param {string} params.tenantId - UUID of the tenant
     * @param {number} params.userId - INTEGER ID of the user
     * @param {string} params.action - Action name (e.g., 'LOGIN', 'UPDATE_EMPLOYEE')
     * @param {string} params.entityType - Table or entity name
     * @param {string} [params.entityId] - UUID or ID of the specific record
     * @param {Object} [params.oldValues] - Data before change
     * @param {Object} [params.newValues] - Data after change
     * @param {Object} [params.req] - Express request object to extract IP/User-Agent
     */
    async log({ tenantId, userId, action, entityType, entityId, oldValues, newValues, req }) {
        try {
            const ipAddress = req ? req.ip || req.connection.remoteAddress : null;
            const userAgent = req ? req.get('User-Agent') : null;

            await pool.query(
                `INSERT INTO audit_logs 
                (tenant_id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    tenantId,
                    userId,
                    action,
                    entityType,
                    entityId,
                    oldValues ? JSON.stringify(oldValues) : null,
                    newValues ? JSON.stringify(newValues) : null,
                    ipAddress,
                    userAgent
                ]
            );
        } catch (err) {
            // We log the error but don't throw it to avoid breaking the main application flow
            console.error('[Audit Log Error]', err);
        }
    }
};

module.exports = auditLogger;

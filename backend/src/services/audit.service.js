const { pool } = require("../config/db");

const AuditService = {
  /**
   * Write an audit log entry.
   *
   * @param {number} userId - who performed the action (req.user.id)
   * @param {string} action - e.g. "CREATE", "UPDATE", "DELETE", "STATUS_CHANGE"
   * @param {string} entityType - e.g. "User", "Order", "KitchenOrder"
   * @param {number} entityId - the affected row's id
   * @param {object} [details] - optional JSON payload (e.g. { before, after })
   *
   * Usage:
   *   await AuditService.log(req.user.id, "DELETE", "User", userId);
   *   await AuditService.log(req.user.id, "UPDATE", "User", userId, { changedFields: ["role_id"] });
   *
   * Failures here are logged but never thrown — an audit log write
   * should never block or break the actual business operation.
   */
  async log(userId, action, entityType, entityId, details = null) {
    try {
      await pool.execute(
        `INSERT INTO Audit_Logs (user_id, action, entity_type, entity_id, details)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, action, entityType, entityId, details ? JSON.stringify(details) : null]
      );
    } catch (err) {
      // Audit logging must never break the calling request.
      console.error("⚠️  Audit log write failed:", err.message);
    }
  },

  /**
   * Fetch recent audit log entries, optionally filtered.
   * Useful for an admin "activity feed" screen.
   */
  async getRecent({ entityType, userId, limit = 50 } = {}) {
    let query = `
      SELECT
        a.id,
        a.action,
        a.entity_type,
        a.entity_id,
        a.details,
        a.created_at,
        u.name AS user_name,
        u.email AS user_email
      FROM Audit_Logs a
      LEFT JOIN Users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (entityType) {
      query += " AND a.entity_type = ?";
      params.push(entityType);
    }
    if (userId) {
      query += " AND a.user_id = ?";
      params.push(userId);
    }

    query += " ORDER BY a.created_at DESC LIMIT ?";
    params.push(Number(limit));

    const [rows] = await pool.execute(query, params);
    return rows;
  },
};

module.exports = AuditService;
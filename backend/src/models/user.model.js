const { pool } = require("../config/db");

const UserModel = {
  /**
   * Find a user by email, including role name and full permission list.
   * Permissions are aggregated via Role_Permissions -> Permissions.
   */
  async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.password,
        u.branch_id,
        u.is_active,
        u.created_at,
        r.id AS role_id,
        r.name AS role_name
       FROM Users u
       JOIN Roles r ON u.role_id = r.id
       WHERE u.email = ? AND u.deleted_at IS NULL
       LIMIT 1`,
      [email]
    );

    const user = rows[0];
    if (!user) return null;

    user.permissions = await this.getPermissionsForRole(user.role_id);
    return user;
  },

  /**
   * Find a user by ID, including role name and full permission list.
   */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.branch_id,
        u.is_active,
        u.created_at,
        r.id AS role_id,
        r.name AS role_name
       FROM Users u
       JOIN Roles r ON u.role_id = r.id
       WHERE u.id = ? AND u.deleted_at IS NULL
       LIMIT 1`,
      [id]
    );

    const user = rows[0];
    if (!user) return null;

    user.permissions = await this.getPermissionsForRole(user.role_id);
    return user;
  },

  /**
   * Get all permission_keys granted to a role via Role_Permissions.
   * Returns a flat array of strings, e.g. ["orders.create", "orders.view"]
   */
  async getPermissionsForRole(roleId) {
    const [rows] = await pool.execute(
      `SELECT p.permission_key
       FROM Role_Permissions rp
       JOIN Permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ?`,
      [roleId]
    );
    return rows.map((r) => r.permission_key);
  },

  /**
   * Get all users (excludes passwords). Does not include permissions
   * to keep list responses light — fetch findById() for full detail.
   */
  async findAll({ branch_id, role_id } = {}) {
    let query = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.branch_id,
        u.is_active,
        u.created_at,
        r.id AS role_id,
        r.name AS role_name,
        b.name AS branch_name
      FROM Users u
      JOIN Roles r ON u.role_id = r.id
      LEFT JOIN Branches b ON u.branch_id = b.id
      WHERE u.deleted_at IS NULL
    `;
    const params = [];

    if (branch_id) {
      query += " AND u.branch_id = ?";
      params.push(branch_id);
    }
    if (role_id) {
      query += " AND u.role_id = ?";
      params.push(role_id);
    }

    query += " ORDER BY u.created_at DESC";
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  /**
   * Create a new user
   */
  async create({ name, email, password, role_id, branch_id }) {
    const [result] = await pool.execute(
      `INSERT INTO Users (name, email, password, role_id, branch_id)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, password, role_id, branch_id || null]
    );
    return result.insertId;
  },

  /**
   * Update a user
   */
  async update(id, { name, email, password, role_id, branch_id }) {
    const fields = [];
    const params = [];

    if (name !== undefined) { fields.push("name = ?"); params.push(name); }
    if (email !== undefined) { fields.push("email = ?"); params.push(email); }
    if (password !== undefined) { fields.push("password = ?"); params.push(password); }
    if (role_id !== undefined) { fields.push("role_id = ?"); params.push(role_id); }
    if (branch_id !== undefined) { fields.push("branch_id = ?"); params.push(branch_id); }

    if (fields.length === 0) return false;

    params.push(id);
    const [result] = await pool.execute(
      `UPDATE Users SET ${fields.join(", ")} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  },

  /**
   * Soft-delete a user: marks deleted_at + is_active=false instead of
   * removing the row. Preserves history for audit logs, reports, and
   * any FK references (e.g. Orders.created_by, Kitchen_Orders.assigned_chef)
   * that would otherwise break on a hard delete.
   */
  async delete(id) {
    const [result] = await pool.execute(
      `UPDATE Users
       SET deleted_at = CURRENT_TIMESTAMP, is_active = FALSE
       WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Check if email already exists
   */
  async emailExists(email, excludeId = null) {
    let query = "SELECT id FROM Users WHERE email = ? AND deleted_at IS NULL";
    const params = [email];
    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }
    const [rows] = await pool.execute(query, params);
    return rows.length > 0;
  },
};

module.exports = UserModel;
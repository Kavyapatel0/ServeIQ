const { pool } = require("../config/db");

const UserModel = {
  /**
   * Find a user by email (includes role name via JOIN)
   */
  async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.password,
        u.branch_id,
        u.created_at,
        r.id   AS role_id,
        r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ?
       LIMIT 1`,
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Find a user by ID (excludes password)
   */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.branch_id,
        u.created_at,
        r.id   AS role_id,
        r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Get all users (excludes passwords)
   */
  async findAll({ branch_id, role_id } = {}) {
    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.branch_id,
        u.created_at,
        r.id   AS role_id,
        r.role_name,
        b.name AS branch_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN branches b ON u.branch_id = b.id
      WHERE 1=1
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
      `INSERT INTO users (name, email, password, role_id, branch_id)
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
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  },

  /**
   * Soft-delete by marking role or just delete
   */
  async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM users WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Check if email already exists
   */
  async emailExists(email, excludeId = null) {
    let query = "SELECT id FROM users WHERE email = ?";
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
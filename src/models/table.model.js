const { pool } = require("../config/db");

const TABLE_STATUS = {
  AVAILABLE: "AVAILABLE",
  OCCUPIED: "OCCUPIED",
  RESERVED: "RESERVED",
  CLEANING: "CLEANING",
};

const TableModel = {
  /**
   * Get all tables, optionally scoped to a branch.
   * Includes branch name for context.
   */
  async findAll({ branch_id, status } = {}) {
    let query = `
      SELECT
        t.id,
        t.table_number,
        t.capacity,
        t.status,
        t.branch_id,
        b.name AS branch_name,
        t.created_at,
        t.updated_at
      FROM Restaurant_Tables t
      JOIN Branches b ON t.branch_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (branch_id) {
      query += " AND t.branch_id = ?";
      params.push(branch_id);
    }
    if (status) {
      query += " AND t.status = ?";
      params.push(status);
    }

    query += " ORDER BY t.branch_id, t.table_number";
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT
        t.id,
        t.table_number,
        t.capacity,
        t.status,
        t.branch_id,
        b.name AS branch_name,
        t.created_at,
        t.updated_at
       FROM Restaurant_Tables t
       JOIN Branches b ON t.branch_id = b.id
       WHERE t.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ table_number, capacity, branch_id, status = "AVAILABLE" }) {
    const [result] = await pool.execute(
      `INSERT INTO Restaurant_Tables (table_number, capacity, branch_id, status)
       VALUES (?, ?, ?, ?)`,
      [table_number, capacity, branch_id, status]
    );
    return result.insertId;
  },

  async update(id, { table_number, capacity, status }) {
    const fields = [];
    const params = [];

    if (table_number !== undefined) { fields.push("table_number = ?"); params.push(table_number); }
    if (capacity !== undefined)     { fields.push("capacity = ?");      params.push(capacity); }
    if (status !== undefined)       { fields.push("status = ?");        params.push(status); }

    if (fields.length === 0) return false;

    params.push(id);
    const [result] = await pool.execute(
      `UPDATE Restaurant_Tables SET ${fields.join(", ")} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  },

  async updateStatus(id, status) {
    const [result] = await pool.execute(
      `UPDATE Restaurant_Tables SET status = ? WHERE id = ?`,
      [status, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute(
      `DELETE FROM Restaurant_Tables WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = { TableModel, TABLE_STATUS };
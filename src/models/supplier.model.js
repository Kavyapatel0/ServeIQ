const { pool } = require("../config/db");

const SupplierModel = {
  /**
   * ?search=fresh    — partial match on name or contact_person
   * ?is_active=true  — filter
   */
  async findAll({ search, is_active } = {}) {
    let query = `
      SELECT id, name, contact_person, phone, email, gst_number, address,
             is_active, created_at, updated_at
      FROM Suppliers
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      query += " AND (name LIKE ? OR contact_person LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }
    if (is_active !== undefined) {
      query += " AND is_active = ?";
      params.push(is_active);
    }

    query += " ORDER BY name";
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, name, contact_person, phone, email, gst_number, address,
              is_active, created_at, updated_at
       FROM Suppliers WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, contact_person, phone, email, gst_number, address }) {
    const [result] = await pool.execute(
      `INSERT INTO Suppliers (name, contact_person, phone, email, gst_number, address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, contact_person || null, phone || null, email || null, gst_number || null, address || null]
    );
    return result.insertId;
  },

  async update(id, { name, contact_person, phone, email, gst_number, address }) {
    const fields = [];
    const params = [];

    if (name !== undefined)           { fields.push("name = ?");           params.push(name); }
    if (contact_person !== undefined) { fields.push("contact_person = ?"); params.push(contact_person); }
    if (phone !== undefined)          { fields.push("phone = ?");          params.push(phone); }
    if (email !== undefined)          { fields.push("email = ?");          params.push(email); }
    if (gst_number !== undefined)     { fields.push("gst_number = ?");     params.push(gst_number); }
    if (address !== undefined)        { fields.push("address = ?");        params.push(address); }

    if (fields.length === 0) return false;

    params.push(id);
    const [result] = await pool.execute(
      `UPDATE Suppliers SET ${fields.join(", ")} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  },

  async toggleActive(id) {
    const [rows] = await pool.execute(
      `SELECT is_active FROM Suppliers WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!rows[0]) return null;

    const newState = !rows[0].is_active;
    await pool.execute(`UPDATE Suppliers SET is_active = ? WHERE id = ?`, [newState, id]);
    return newState;
  },

  /**
   * Soft delete — disables rather than removing, to preserve
   * Ingredients.supplier_id and Purchase_Orders.supplier_id history.
   */
  async delete(id) {
    const [result] = await pool.execute(
      `UPDATE Suppliers SET is_active = FALSE WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = { SupplierModel };
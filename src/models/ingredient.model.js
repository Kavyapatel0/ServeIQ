const { pool } = require("../config/db");

const IngredientModel = {
  /**
   * Find all ingredients with optional search/filter.
   * ?search=tomato        — partial match on name
   * ?supplier_id=1         — filter by supplier
   * ?is_active=true        — filter active/inactive
   * ?low_stock=true        — only items where current_stock <= minimum_stock
   */
  async findAll({ search, supplier_id, is_active, low_stock } = {}) {
    let query = `
      SELECT
        i.id,
        i.name,
        i.unit,
        i.current_stock,
        i.minimum_stock,
        i.cost_price,
        i.supplier_id,
        s.name AS supplier_name,
        i.is_active,
        i.created_at,
        i.updated_at
      FROM Ingredients i
      LEFT JOIN Suppliers s ON i.supplier_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      query += " AND i.name LIKE ?";
      params.push(`%${search.trim()}%`);
    }
    if (supplier_id) {
      query += " AND i.supplier_id = ?";
      params.push(supplier_id);
    }
    if (is_active !== undefined) {
      query += " AND i.is_active = ?";
      params.push(is_active);
    }
    if (low_stock) {
      query += " AND i.current_stock <= i.minimum_stock";
    }

    query += " ORDER BY i.name";
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT
        i.id,
        i.name,
        i.unit,
        i.current_stock,
        i.minimum_stock,
        i.cost_price,
        i.supplier_id,
        s.name AS supplier_name,
        i.is_active,
        i.created_at,
        i.updated_at
       FROM Ingredients i
       LEFT JOIN Suppliers s ON i.supplier_id = s.id
       WHERE i.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, unit, current_stock = 0, minimum_stock, cost_price, supplier_id }) {
    const [result] = await pool.execute(
      `INSERT INTO Ingredients (name, unit, current_stock, minimum_stock, cost_price, supplier_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, unit, current_stock, minimum_stock, cost_price, supplier_id || null]
    );
    return result.insertId;
  },

  async update(id, { name, unit, minimum_stock, cost_price, supplier_id }) {
    const fields = [];
    const params = [];

    if (name !== undefined)          { fields.push("name = ?");          params.push(name); }
    if (unit !== undefined)          { fields.push("unit = ?");          params.push(unit); }
    if (minimum_stock !== undefined) { fields.push("minimum_stock = ?"); params.push(minimum_stock); }
    if (cost_price !== undefined)    { fields.push("cost_price = ?");    params.push(cost_price); }
    if (supplier_id !== undefined)   { fields.push("supplier_id = ?");   params.push(supplier_id); }

    if (fields.length === 0) return false;

    params.push(id);
    const [result] = await pool.execute(
      `UPDATE Ingredients SET ${fields.join(", ")} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  },

  /**
   * Toggle is_active (enable/disable an ingredient).
   * Returns the new boolean state, or null if not found.
   */
  async toggleActive(id) {
    const [rows] = await pool.execute(
      `SELECT is_active FROM Ingredients WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!rows[0]) return null;

    const newState = !rows[0].is_active;
    await pool.execute(`UPDATE Ingredients SET is_active = ? WHERE id = ?`, [newState, id]);
    return newState;
  },

  /**
   * Soft delete — disables rather than removing, to preserve
   * Inventory_Transactions / Purchase_Order_Items history.
   */
  async delete(id) {
    const [result] = await pool.execute(
      `UPDATE Ingredients SET is_active = FALSE WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Increase current_stock by `quantity`. Used after receiving a
   * purchase order, or for a positive manual adjustment.
   * Must be called within a transaction connection for atomicity —
   * accepts an optional `conn` (defaults to pool).
   */
  async increaseStock(id, quantity, conn = pool) {
    const [result] = await conn.execute(
      `UPDATE Ingredients SET current_stock = current_stock + ? WHERE id = ?`,
      [quantity, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Set current_stock to an exact value (manual adjustment).
   */
  async setStock(id, newStock, conn = pool) {
    const [result] = await conn.execute(
      `UPDATE Ingredients SET current_stock = ? WHERE id = ?`,
      [newStock, id]
    );
    return result.affectedRows > 0;
  },

  async getStockLevel(id, conn = pool) {
    const [rows] = await conn.execute(
      `SELECT current_stock, minimum_stock FROM Ingredients WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = { IngredientModel };
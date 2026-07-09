const { pool } = require("../config/db");

const MenuModel = {
  // ─── Categories ──────────────────────────────────────────────

  async findAllCategories() {
    const [rows] = await pool.execute(
      `SELECT id, name FROM Menu_Categories ORDER BY name`
    );
    return rows;
  },

  async findCategoryById(id) {
    const [rows] = await pool.execute(
      `SELECT id, name FROM Menu_Categories WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async createCategory({ name }) {
    const [result] = await pool.execute(
      `INSERT INTO Menu_Categories (name) VALUES (?)`,
      [name]
    );
    return result.insertId;
  },

  async updateCategory(id, { name }) {
    const [result] = await pool.execute(
      `UPDATE Menu_Categories SET name = ? WHERE id = ?`,
      [name, id]
    );
    return result.affectedRows > 0;
  },

  async deleteCategory(id) {
    const [result] = await pool.execute(
      `DELETE FROM Menu_Categories WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },

  // ─── Menu Items ───────────────────────────────────────────────

  /**
   * Find menu items with optional filters.
   * Joins Branch_Menu_Items so we can filter by branch availability.
   */
  async findAllItems({ category_id, branch_id, is_available, search } = {}) {
    let query = `
      SELECT
        mi.id,
        mi.name,
        mi.description,
        mi.selling_price,
        mi.cost_price,
        mi.is_available,
        mi.is_active,
        mi.category_id,
        mc.name AS category_name,
        mi.created_at,
        mi.updated_at
      FROM Menu_Items mi
      JOIN Menu_Categories mc ON mi.category_id = mc.id
    `;
    const params = [];

    // If branch_id given, only show items available at that branch
    if (branch_id) {
      query += `
        JOIN Branch_Menu_Items bmi
          ON mi.id = bmi.menu_item_id AND bmi.branch_id = ?
      `;
      params.push(branch_id);
    }

    query += " WHERE mi.is_active = TRUE";

    if (category_id) {
      query += " AND mi.category_id = ?";
      params.push(category_id);
    }
    if (is_available !== undefined) {
      query += " AND mi.is_available = ?";
      params.push(is_available);
    }
    if (branch_id) {
      query += " AND bmi.is_available = TRUE";
    }
    // Partial match on name or description
    if (search && search.trim()) {
      query += " AND (mi.name LIKE ? OR mi.description LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    query += " ORDER BY mc.name, mi.name";
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async findItemById(id) {
    const [rows] = await pool.execute(
      `SELECT
        mi.id,
        mi.name,
        mi.description,
        mi.selling_price,
        mi.cost_price,
        mi.is_available,
        mi.is_active,
        mi.category_id,
        mc.name AS category_name,
        mi.created_at,
        mi.updated_at
       FROM Menu_Items mi
       JOIN Menu_Categories mc ON mi.category_id = mc.id
       WHERE mi.id = ? AND mi.is_active = TRUE
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Fetch selling price from DB — never trust frontend price.
   * Called before inserting Order_Items.
   */
  async getSellingPrice(id) {
    const [rows] = await pool.execute(
      `SELECT selling_price, is_available, is_active
       FROM Menu_Items
       WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async createItem({ category_id, name, description, selling_price, cost_price, is_available = true }) {
    const [result] = await pool.execute(
      `INSERT INTO Menu_Items
         (category_id, name, description, selling_price, cost_price, is_available)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category_id, name, description || null, selling_price, cost_price, is_available]
    );
    return result.insertId;
  },

  async updateItem(id, { category_id, name, description, selling_price, cost_price, is_available }) {
    const fields = [];
    const params = [];

    if (category_id !== undefined)  { fields.push("category_id = ?");  params.push(category_id); }
    if (name !== undefined)         { fields.push("name = ?");          params.push(name); }
    if (description !== undefined)  { fields.push("description = ?");   params.push(description); }
    if (selling_price !== undefined){ fields.push("selling_price = ?"); params.push(selling_price); }
    if (cost_price !== undefined)   { fields.push("cost_price = ?");    params.push(cost_price); }
    if (is_available !== undefined) { fields.push("is_available = ?");  params.push(is_available); }

    if (fields.length === 0) return false;

    params.push(id);
    const [result] = await pool.execute(
      `UPDATE Menu_Items SET ${fields.join(", ")} WHERE id = ? AND is_active = TRUE`,
      params
    );
    return result.affectedRows > 0;
  },

  /**
   * Toggle is_available for a single item.
   * Returns the new boolean state, or null if item not found.
   */
  async toggleAvailability(id) {
    const [rows] = await pool.execute(
      `SELECT is_available FROM Menu_Items WHERE id = ? AND is_active = TRUE LIMIT 1`,
      [id]
    );
    if (!rows[0]) return null;

    const newState = !rows[0].is_available;
    await pool.execute(
      `UPDATE Menu_Items SET is_available = ? WHERE id = ?`,
      [newState, id]
    );
    return newState;
  },

  /**
   * Soft-delete: mark is_active = FALSE.
   * Preserves history in Order_Items.
   */
  async deleteItem(id) {
    const [result] = await pool.execute(
      `UPDATE Menu_Items SET is_active = FALSE WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = { MenuModel };
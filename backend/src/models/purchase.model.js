const { pool } = require("../config/db");

const PO_STATUS = {
  PENDING: "PENDING",
  RECEIVED: "RECEIVED",
  CANCELLED: "CANCELLED",
};

const PurchaseOrderModel = {
  /**
   * Generate a unique, human-readable PO number: PO-YYYYMMDD-XXXX
   */
  async generatePoNumber() {
    const date = new Date();
    const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS cnt FROM Purchase_Orders WHERE DATE(created_at) = CURDATE()`
    );
    const seq = (rows[0].cnt + 1).toString().padStart(4, "0");
    return `PO-${datePart}-${seq}`;
  },

  async create({ supplier_id, branch_id, created_by }) {
    const po_number = await this.generatePoNumber();
    const [result] = await pool.execute(
      `INSERT INTO Purchase_Orders
         (po_number, supplier_id, branch_id, created_by, status, total_amount)
       VALUES (?, ?, ?, ?, 'PENDING', 0)`,
      [po_number, supplier_id, branch_id, created_by]
    );
    return { insertId: result.insertId, po_number };
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT
        po.id,
        po.po_number,
        po.supplier_id,
        s.name AS supplier_name,
        po.branch_id,
        b.name AS branch_name,
        po.created_by,
        u.name AS created_by_name,
        po.status,
        po.total_amount,
        po.order_date,
        po.received_at,
        po.created_at,
        po.updated_at
       FROM Purchase_Orders po
       JOIN Suppliers s ON po.supplier_id = s.id
       JOIN Branches b ON po.branch_id = b.id
       JOIN Users u ON po.created_by = u.id
       WHERE po.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async findAll({ branch_id, supplier_id, status } = {}) {
    let query = `
      SELECT
        po.id,
        po.po_number,
        po.supplier_id,
        s.name AS supplier_name,
        po.branch_id,
        po.status,
        po.total_amount,
        po.order_date,
        po.received_at
      FROM Purchase_Orders po
      JOIN Suppliers s ON po.supplier_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (branch_id) {
      query += " AND po.branch_id = ?";
      params.push(branch_id);
    }
    if (supplier_id) {
      query += " AND po.supplier_id = ?";
      params.push(supplier_id);
    }
    if (status) {
      query += " AND po.status = ?";
      params.push(status);
    }

    query += " ORDER BY po.created_at DESC";
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async updateStatus(id, status, conn = pool) {
    const fields = ["status = ?"];
    const params = [status];

    if (status === PO_STATUS.RECEIVED) {
      fields.push("received_at = NOW()");
    }

    params.push(id);
    const [result] = await conn.execute(
      `UPDATE Purchase_Orders SET ${fields.join(", ")} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  },

  async recalculateTotal(poId, conn = pool) {
    const [rows] = await conn.execute(
      `SELECT SUM(total_price) AS total FROM Purchase_Order_Items WHERE purchase_order_id = ?`,
      [poId]
    );
    const total = parseFloat(rows[0].total || 0);
    await conn.execute(`UPDATE Purchase_Orders SET total_amount = ? WHERE id = ?`, [total, poId]);
    return total;
  },

  // ─── Purchase Order Items ──────────────────────────────────────

  async addItem({ purchase_order_id, ingredient_id, quantity, unit_price }, conn = pool) {
    const total_price = parseFloat((quantity * unit_price).toFixed(2));
    const [result] = await conn.execute(
      `INSERT INTO Purchase_Order_Items (purchase_order_id, ingredient_id, quantity, unit_price, total_price)
       VALUES (?, ?, ?, ?, ?)`,
      [purchase_order_id, ingredient_id, quantity, unit_price, total_price]
    );
    return result.insertId;
  },

  async findItemsByPoId(poId, conn = pool) {
    const [rows] = await conn.execute(
      `SELECT
        poi.id,
        poi.purchase_order_id,
        poi.ingredient_id,
        i.name AS ingredient_name,
        i.unit,
        poi.quantity,
        poi.unit_price,
        poi.total_price
       FROM Purchase_Order_Items poi
       JOIN Ingredients i ON poi.ingredient_id = i.id
       WHERE poi.purchase_order_id = ?
       ORDER BY poi.id`,
      [poId]
    );
    return rows;
  },

  async updateItem(itemId, poId, { quantity, unit_price }, conn = pool) {
    const total_price = parseFloat((quantity * unit_price).toFixed(2));
    const [result] = await conn.execute(
      `UPDATE Purchase_Order_Items
       SET quantity = ?, unit_price = ?, total_price = ?
       WHERE id = ? AND purchase_order_id = ?`,
      [quantity, unit_price, total_price, itemId, poId]
    );
    return result.affectedRows > 0;
  },

  async removeItem(itemId, poId, conn = pool) {
    const [result] = await conn.execute(
      `DELETE FROM Purchase_Order_Items WHERE id = ? AND purchase_order_id = ?`,
      [itemId, poId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = { PurchaseOrderModel, PO_STATUS };
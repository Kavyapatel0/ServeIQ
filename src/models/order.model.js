const { pool } = require("../config/db");

const ORDER_STATUS = {
  CREATED: "CREATED",
  PREPARING: "PREPARING",
  READY: "READY",
  SERVED: "SERVED",
  PAID: "PAID",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

const OrderModel = {
  // ─── Orders ──────────────────────────────────────────────────

  /**
   * Generate a unique, human-readable order number: ORD-YYYYMMDD-XXXX
   */
  async generateOrderNumber() {
    const date = new Date();
    const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS cnt FROM Orders
       WHERE DATE(created_at) = CURDATE()`
    );
    const seq = (rows[0].cnt + 1).toString().padStart(4, "0");
    return `ORD-${datePart}-${seq}`;
  },

  async create({ customer_id, branch_id, table_id, created_by }) {
    const order_number = await this.generateOrderNumber();
    const [result] = await pool.execute(
      `INSERT INTO Orders
         (order_number, customer_id, branch_id, table_id, created_by, status,
          subtotal, tax_amount, discount_amount, grand_total)
       VALUES (?, ?, ?, ?, ?, 'CREATED', 0, 0, 0, 0)`,
      [order_number, customer_id || null, branch_id, table_id || null, created_by]
    );
    return { insertId: result.insertId, order_number };
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT
        o.id,
        o.order_number,
        o.status,
        o.subtotal,
        o.tax_amount,
        o.discount_amount,
        o.grand_total,
        o.branch_id,
        o.table_id,
        o.customer_id,
        o.created_by,
        o.order_date,
        o.created_at,
        o.updated_at,
        b.name AS branch_name,
        rt.table_number,
        c.name AS customer_name,
        c.phone AS customer_phone,
        u.name AS created_by_name
       FROM Orders o
       JOIN Branches b ON o.branch_id = b.id
       LEFT JOIN Restaurant_Tables rt ON o.table_id = rt.id
       LEFT JOIN Customers c ON o.customer_id = c.id
       LEFT JOIN Users u ON o.created_by = u.id
       WHERE o.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async findAll({ branch_id, status, customer_id, date, created_by } = {}) {
    let query = `
      SELECT
        o.id,
        o.order_number,
        o.status,
        o.subtotal,
        o.tax_amount,
        o.discount_amount,
        o.grand_total,
        o.branch_id,
        o.table_id,
        o.customer_id,
        o.created_by,
        o.order_date,
        o.created_at,
        b.name AS branch_name,
        rt.table_number,
        c.name AS customer_name,
        u.name AS created_by_name
      FROM Orders o
      JOIN Branches b ON o.branch_id = b.id
      LEFT JOIN Restaurant_Tables rt ON o.table_id = rt.id
      LEFT JOIN Customers c ON o.customer_id = c.id
      LEFT JOIN Users u ON o.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (branch_id) {
      query += " AND o.branch_id = ?";
      params.push(branch_id);
    }
    if (status) {
      query += " AND o.status = ?";
      params.push(status);
    }
    if (customer_id) {
      query += " AND o.customer_id = ?";
      params.push(customer_id);
    }
    if (date) {
      query += " AND DATE(o.order_date) = ?";
      params.push(date);
    }
    if (created_by) {
      query += " AND o.created_by = ?";
      params.push(created_by);
    }

    query += " ORDER BY o.created_at DESC";
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async updateStatus(id, status) {
    const [result] = await pool.execute(
      `UPDATE Orders SET status = ? WHERE id = ?`,
      [status, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Recalculate and persist totals from Order_Items.
   * TAX = CGST 2.5% + SGST 2.5% = 5% on subtotal.
   * discount_amount is passed in (from coupon/manual discount).
   */
  async recalculateTotals(orderId, discountAmount = 0) {
    const [itemRows] = await pool.execute(
      `SELECT SUM(total_price) AS subtotal FROM Order_Items WHERE order_id = ?`,
      [orderId]
    );
    const subtotal = parseFloat(itemRows[0].subtotal || 0);
    const TAX_RATE = 0.05; // 5% (CGST 2.5 + SGST 2.5)
    const taxAmount = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const grandTotal = parseFloat((subtotal + taxAmount - discountAmount).toFixed(2));

    await pool.execute(
      `UPDATE Orders
       SET subtotal = ?, tax_amount = ?, discount_amount = ?, grand_total = ?
       WHERE id = ?`,
      [subtotal, taxAmount, discountAmount, grandTotal, orderId]
    );

    return { subtotal, taxAmount, discountAmount, grandTotal };
  },

  // ─── Order Items ─────────────────────────────────────────────

  async addItem({ order_id, menu_item_id, quantity, unit_price }) {
    const total_price = parseFloat((unit_price * quantity).toFixed(2));
    const [result] = await pool.execute(
      `INSERT INTO Order_Items (order_id, menu_item_id, quantity, unit_price, total_price)
       VALUES (?, ?, ?, ?, ?)`,
      [order_id, menu_item_id, quantity, unit_price, total_price]
    );
    return result.insertId;
  },

  async findItemsByOrderId(orderId) {
    const [rows] = await pool.execute(
      `SELECT
        oi.id,
        oi.order_id,
        oi.menu_item_id,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        mi.name AS item_name,
        mc.name AS category_name
       FROM Order_Items oi
       JOIN Menu_Items mi ON oi.menu_item_id = mi.id
       JOIN Menu_Categories mc ON mi.category_id = mc.id
       WHERE oi.order_id = ?
       ORDER BY oi.id`,
      [orderId]
    );
    return rows;
  },

  async removeItem(itemId, orderId) {
    const [result] = await pool.execute(
      `DELETE FROM Order_Items WHERE id = ? AND order_id = ?`,
      [itemId, orderId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Update quantity of an existing order item and recalculate its total_price.
   * Fetches unit_price from DB — never trusts the client value.
   * Call recalculateTotals() on the order after this.
   */
  async updateItemQuantity(itemId, orderId, quantity) {
    const [rows] = await pool.execute(
      `SELECT unit_price FROM Order_Items WHERE id = ? AND order_id = ? LIMIT 1`,
      [itemId, orderId]
    );
    if (!rows[0]) return false;

    const unit_price = parseFloat(rows[0].unit_price);
    const total_price = parseFloat((unit_price * quantity).toFixed(2));

    const [result] = await pool.execute(
      `UPDATE Order_Items SET quantity = ?, total_price = ? WHERE id = ? AND order_id = ?`,
      [quantity, total_price, itemId, orderId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = { OrderModel, ORDER_STATUS };
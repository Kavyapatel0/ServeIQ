const { pool } = require("../config/db");

const PAYMENT_METHOD = {
  CASH: "CASH",
  CARD: "CARD",
  UPI: "UPI",
  WALLET: "WALLET",
};

const PAYMENT_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
};

const PaymentModel = {
  async create({ order_id, amount, payment_method, payment_status = "SUCCESS" }) {
    const [result] = await pool.execute(
      `INSERT INTO Payments (order_id, amount, payment_method, payment_status)
       VALUES (?, ?, ?, ?)`,
      [order_id, amount, payment_method, payment_status]
    );
    return result.insertId;
  },

  async findByOrderId(order_id) {
    const [rows] = await pool.execute(
      `SELECT
        p.id,
        p.order_id,
        p.amount,
        p.payment_method,
        p.payment_status,
        p.payment_date
       FROM Payments p
       WHERE p.order_id = ?
       ORDER BY p.payment_date DESC`,
      [order_id]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM Payments WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = { PaymentModel, PAYMENT_METHOD, PAYMENT_STATUS };
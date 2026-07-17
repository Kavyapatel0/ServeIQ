const { pool } = require("../config/db");

const CustomerModel = {
  // ─── Module 1: Customer Profiles ─────────────────────────────

  async findAll({ search, is_active } = {}) {
    let query = `
      SELECT id, name, email, phone, date_of_birth, gender, address,
             loyalty_points, is_active, created_at, updated_at
      FROM Customers
      WHERE 1=1
    `;
    const params = [];

    if (is_active !== undefined) {
      query += " AND is_active = ?";
      params.push(is_active);
    }
    if (search) {
      query += " AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += " ORDER BY created_at DESC";
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, name, email, phone, date_of_birth, gender, address,
              loyalty_points, is_active, created_at, updated_at
       FROM Customers WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByPhone(phone, excludeId = null) {
    let query = "SELECT id FROM Customers WHERE phone = ?";
    const params = [phone];
    if (excludeId) { query += " AND id != ?"; params.push(excludeId); }
    const [rows] = await pool.execute(query, params);
    return rows[0] || null;
  },

  async findByEmail(email, excludeId = null) {
    let query = "SELECT id FROM Customers WHERE email = ?";
    const params = [email];
    if (excludeId) { query += " AND id != ?"; params.push(excludeId); }
    const [rows] = await pool.execute(query, params);
    return rows[0] || null;
  },

  async create({ name, email, phone, date_of_birth, gender, address }) {
    const [result] = await pool.execute(
      `INSERT INTO Customers (name, email, phone, date_of_birth, gender, address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email || null, phone || null, date_of_birth || null, gender || null, address || null]
    );
    return result.insertId;
  },

  async update(id, { name, email, phone, date_of_birth, gender, address }) {
    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push("name = ?"); params.push(name); }
    if (email !== undefined) { fields.push("email = ?"); params.push(email); }
    if (phone !== undefined) { fields.push("phone = ?"); params.push(phone); }
    if (date_of_birth !== undefined) { fields.push("date_of_birth = ?"); params.push(date_of_birth); }
    if (gender !== undefined) { fields.push("gender = ?"); params.push(gender); }
    if (address !== undefined) { fields.push("address = ?"); params.push(address); }
    if (fields.length === 0) return false;
    params.push(id);
    const [result] = await pool.execute(
      `UPDATE Customers SET ${fields.join(", ")} WHERE id = ?`, params
    );
    return result.affectedRows > 0;
  },

  async setActive(id, is_active) {
    const [result] = await pool.execute(
      "UPDATE Customers SET is_active = ? WHERE id = ?",
      [is_active, id]
    );
    return result.affectedRows > 0;
  },

  // ─── Module 2: Visit History ──────────────────────────────────

  async getVisitHistory(customerId) {
    const [rows] = await pool.execute(
      `SELECT
         o.id AS order_id,
         o.order_number,
         o.order_date,
         o.status,
         o.subtotal,
         o.tax_amount,
         o.discount_amount,
         o.grand_total,
         p.payment_method,
         p.payment_status,
         p.payment_date,
         b.name AS branch_name
       FROM Orders o
       LEFT JOIN Payments p ON p.order_id = o.id
       LEFT JOIN Branches b ON b.id = o.branch_id
       WHERE o.customer_id = ?
         AND o.status IN ('PAID', 'COMPLETED')
       ORDER BY o.order_date DESC`,
      [customerId]
    );
    return rows;
  },

  // ─── Module 3: Loyalty ───────────────────────────────────────

  async getLoyaltySummary(customerId) {
    const [pointsRow] = await pool.execute(
      "SELECT loyalty_points FROM Customers WHERE id = ?",
      [customerId]
    );
    const currentPoints = pointsRow[0]?.loyalty_points || 0;

    const [earned] = await pool.execute(
      `SELECT COALESCE(SUM(ABS(points)), 0) AS total
       FROM Loyalty_Transactions
       WHERE customer_id = ? AND transaction_type = 'EARNED'`,
      [customerId]
    );
    const [redeemed] = await pool.execute(
      `SELECT COALESCE(SUM(ABS(points)), 0) AS total
       FROM Loyalty_Transactions
       WHERE customer_id = ? AND transaction_type = 'REDEEMED'`,
      [customerId]
    );

    const [history] = await pool.execute(
      `SELECT id, points, transaction_type, transaction_date
       FROM Loyalty_Transactions
       WHERE customer_id = ?
       ORDER BY transaction_date DESC
       LIMIT 20`,
      [customerId]
    );

    return {
      current_points: currentPoints,
      lifetime_points_earned: Number(earned[0].total),
      total_points_redeemed: Number(redeemed[0].total),
      recent_transactions: history,
    };
  },

  async redeemPoints(customerId, points) {
    const [row] = await pool.execute(
      "SELECT loyalty_points FROM Customers WHERE id = ? FOR UPDATE",
      [customerId]
    );
    if (!row[0] || row[0].loyalty_points < points) {
      throw { status: 400, message: "Insufficient loyalty points" };
    }
    await pool.execute(
      "UPDATE Customers SET loyalty_points = loyalty_points - ? WHERE id = ?",
      [points, customerId]
    );
    await pool.execute(
      `INSERT INTO Loyalty_Transactions (customer_id, points, transaction_type)
       VALUES (?, ?, 'REDEEMED')`,
      [customerId, points]
    );
  },

  async awardPoints(customerId, points) {
    await pool.execute(
      "UPDATE Customers SET loyalty_points = loyalty_points + ? WHERE id = ?",
      [points, customerId]
    );
    await pool.execute(
      `INSERT INTO Loyalty_Transactions (customer_id, points, transaction_type)
       VALUES (?, ?, 'EARNED')`,
      [customerId, points]
    );
  },

  // ─── Global Loyalty Transactions (for CRM Loyalty tab) ───────
  async getAllLoyaltyTransactions({ limit = 100, offset = 0 } = {}) {
    const [rows] = await pool.query(
      `SELECT
         lt.id,
         lt.points,
         lt.transaction_type,
         lt.transaction_date AS created_at,
         c.id   AS customer_id,
         c.name AS customer_name,
         c.loyalty_points AS customer_current_points
       FROM Loyalty_Transactions lt
       JOIN Customers c ON c.id = lt.customer_id
       ORDER BY lt.transaction_date DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows.map(r => ({
      id:               r.id,
      points:           r.transaction_type === "EARNED" ? Number(r.points) : -Number(r.points),
      transaction_type: r.transaction_type,
      created_at:       r.created_at,
      customer: {
        id:   r.customer_id,
        name: r.customer_name,
      },
      balance_after: r.customer_current_points,
    }));
  },

  async getLoyaltyStats() {
    const [totals] = await pool.execute(
      `SELECT
         COUNT(DISTINCT customer_id) AS active_members,
         COALESCE(SUM(CASE WHEN transaction_type = 'EARNED'   THEN ABS(points) ELSE 0 END), 0) AS total_issued,
         COALESCE(SUM(CASE WHEN transaction_type = 'REDEEMED' THEN ABS(points) ELSE 0 END), 0) AS total_redeemed
       FROM Loyalty_Transactions`
    );
    const [custTotal] = await pool.execute(
      "SELECT COUNT(*) AS total FROM Customers WHERE is_active = TRUE"
    );
    return {
      total_customers:       Number(custTotal[0].total),
      active_members:        Number(totals[0].active_members),
      total_points_issued:   Number(totals[0].total_issued),
      total_points_redeemed: Number(totals[0].total_redeemed),
    };
  },
};

module.exports = CustomerModel;
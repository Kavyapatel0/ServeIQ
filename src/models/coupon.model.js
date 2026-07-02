const { pool } = require("../config/db");

const CouponModel = {
  // ─── Module 4: Coupons ────────────────────────────────────────

  async findAll({ is_active } = {}) {
    let query = `
      SELECT id, code, discount, discount_type, valid_from, valid_to,
             minimum_order_amount, max_usage, is_active, created_at, updated_at,
             (SELECT COUNT(*) FROM Coupon_Redemptions WHERE coupon_id = Coupons.id) AS times_used
      FROM Coupons WHERE 1=1
    `;
    const params = [];
    if (is_active !== undefined) {
      query += " AND is_active = ?";
      params.push(is_active);
    }
    query += " ORDER BY created_at DESC";
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, code, discount, discount_type, valid_from, valid_to,
              minimum_order_amount, max_usage, is_active, created_at, updated_at
       FROM Coupons WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByCode(code) {
    const [rows] = await pool.execute(
      `SELECT id, code, discount, discount_type, valid_from, valid_to,
              minimum_order_amount, max_usage, is_active
       FROM Coupons WHERE code = ?`,
      [code]
    );
    return rows[0] || null;
  },

  async create({ code, discount, discount_type, valid_from, valid_to, minimum_order_amount, max_usage }) {
    const [result] = await pool.execute(
      `INSERT INTO Coupons (code, discount, discount_type, valid_from, valid_to, minimum_order_amount, max_usage)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, discount, discount_type, valid_from || null, valid_to || null, minimum_order_amount || null, max_usage || null]
    );
    return result.insertId;
  },

  async update(id, { discount, discount_type, valid_from, valid_to, minimum_order_amount, max_usage }) {
    const fields = [];
    const params = [];
    if (discount !== undefined) { fields.push("discount = ?"); params.push(discount); }
    if (discount_type !== undefined) { fields.push("discount_type = ?"); params.push(discount_type); }
    if (valid_from !== undefined) { fields.push("valid_from = ?"); params.push(valid_from); }
    if (valid_to !== undefined) { fields.push("valid_to = ?"); params.push(valid_to); }
    if (minimum_order_amount !== undefined) { fields.push("minimum_order_amount = ?"); params.push(minimum_order_amount); }
    if (max_usage !== undefined) { fields.push("max_usage = ?"); params.push(max_usage); }
    if (fields.length === 0) return false;
    params.push(id);
    const [result] = await pool.execute(
      `UPDATE Coupons SET ${fields.join(", ")} WHERE id = ?`, params
    );
    return result.affectedRows > 0;
  },

  async setActive(id, is_active) {
    const [result] = await pool.execute(
      "UPDATE Coupons SET is_active = ? WHERE id = ?",
      [is_active, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM Coupons WHERE id = ?", [id]
    );
    return result.affectedRows > 0;
  },

  // ─── Module 5: Coupon Redemption ─────────────────────────────

  /**
   * Validate a coupon code for a given order total.
   * Returns the coupon and calculated discount — never trusts the client on price.
   */
  async validateAndCalculate(code, order_grand_total, customer_id) {
    const coupon = await this.findByCode(code);
    if (!coupon) throw { status: 404, message: "Coupon not found" };
    if (!coupon.is_active) throw { status: 400, message: "Coupon is inactive" };

    const today = new Date().toISOString().split("T")[0];
    if (coupon.valid_from && today < coupon.valid_from) {
      throw { status: 400, message: "Coupon is not yet valid" };
    }
    if (coupon.valid_to && today > coupon.valid_to) {
      throw { status: 400, message: "Coupon has expired" };
    }
    if (coupon.minimum_order_amount && order_grand_total < coupon.minimum_order_amount) {
      throw {
        status: 400,
        message: `Minimum order amount of ₹${coupon.minimum_order_amount} required`,
      };
    }

    // Check max usage
    if (coupon.max_usage) {
      const [usageRow] = await pool.execute(
        "SELECT COUNT(*) AS cnt FROM Coupon_Redemptions WHERE coupon_id = ?",
        [coupon.id]
      );
      if (usageRow[0].cnt >= coupon.max_usage) {
        throw { status: 400, message: "Coupon usage limit reached" };
      }
    }

    // Check customer hasn't already used this coupon
    if (customer_id) {
      const [alreadyUsed] = await pool.execute(
        "SELECT id FROM Coupon_Redemptions WHERE coupon_id = ? AND customer_id = ? LIMIT 1",
        [coupon.id, customer_id]
      );
      if (alreadyUsed.length > 0) {
        throw { status: 400, message: "You have already used this coupon" };
      }
    }

    const discount_applied =
      coupon.discount_type === "PERCENTAGE"
        ? Math.round((order_grand_total * coupon.discount) / 100 * 100) / 100
        : Math.min(coupon.discount, order_grand_total);

    return { coupon, discount_applied };
  },

  async recordRedemption({ customer_id, coupon_id, order_id, discount_applied }) {
    const [result] = await pool.execute(
      `INSERT INTO Coupon_Redemptions (customer_id, coupon_id, order_id, discount_applied)
       VALUES (?, ?, ?, ?)`,
      [customer_id, coupon_id, order_id, discount_applied]
    );
    return result.insertId;
  },

  async getRedemptionHistory(customerId) {
    const [rows] = await pool.execute(
      `SELECT
         cr.id, cr.discount_applied, cr.redeemed_at,
         c.code AS coupon_code, c.discount_type,
         o.order_number
       FROM Coupon_Redemptions cr
       JOIN Coupons c ON cr.coupon_id = c.id
       JOIN Orders o ON cr.order_id = o.id
       WHERE cr.customer_id = ?
       ORDER BY cr.redeemed_at DESC`,
      [customerId]
    );
    return rows;
  },
};

module.exports = CouponModel;
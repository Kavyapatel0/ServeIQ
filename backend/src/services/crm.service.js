const { pool } = require("../config/db");
const CouponModel = require("../models/coupon.model");
const AuditService = require("./audit.service");

const CRMService = {
  /**
   * Module 5: Coupon Redemption
   *
   * Called from the payment flow when a customer applies a coupon at checkout.
   * Uses a DB transaction to ensure the redemption record and the order's
   * discount_amount are both written or both rolled back together.
   *
   * Usage in payment controller (future hook):
   *   const { discount_applied } = await CRMService.applyCoupon({
   *     coupon_code, customer_id, order_id, order_grand_total, userId
   *   });
   */
  async applyCoupon({ coupon_code, customer_id, order_id, userId }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Fetch authoritative order total from DB — never trust a client-sent value
      const [orderRows] = await conn.execute(
        "SELECT id, grand_total, subtotal, tax_amount FROM Orders WHERE id = ? LIMIT 1",
        [order_id]
      );
      const order = orderRows[0];
      if (!order) throw { status: 404, message: "Order not found" };

      const { coupon, discount_applied } = await CouponModel.validateAndCalculate(
        coupon_code,
        parseFloat(order.grand_total),
        customer_id
      );

      // Record redemption in Coupon_Redemptions
      await conn.execute(
        `INSERT INTO Coupon_Redemptions (customer_id, coupon_id, order_id, discount_applied)
         VALUES (?, ?, ?, ?)`,
        [customer_id, coupon.id, order_id, discount_applied]
      );

      // Update the order's discount_amount and grand_total
      const new_grand_total = Math.max(0,
        Math.round((parseFloat(order.subtotal) + parseFloat(order.tax_amount) - discount_applied) * 100) / 100
      );

      await conn.execute(
        "UPDATE Orders SET discount_amount = ?, grand_total = ? WHERE id = ?",
        [discount_applied, new_grand_total, order_id]
      );

      await conn.commit();

      await AuditService.log(userId, "COUPON_REDEEMED", "Order", order_id, {
        coupon_code: coupon.code,
        coupon_id: coupon.id,
        discount_applied,
        customer_id,
      });

      return {
        coupon_code: coupon.code,
        discount_type: coupon.discount_type,
        discount_applied,
        new_grand_total,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = CRMService;
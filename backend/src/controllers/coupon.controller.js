const CouponModel = require("../models/coupon.model");
const CRMService = require("../services/crm.service");
const AuditService = require("../services/audit.service");

const CouponController = {
  // ─── Module 4: Coupons ────────────────────────────────────────

  async getAll(req, res) {
    try {
      const { is_active } = req.query;
      const filters = {};
      if (is_active !== undefined) filters.is_active = is_active !== "false";
      const coupons = await CouponModel.findAll(filters);
      return res.status(200).json({ success: true, data: coupons });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async getById(req, res) {
    try {
      const coupon = await CouponModel.findById(req.params.id);
      if (!coupon) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
      }
      return res.status(200).json({ success: true, data: coupon });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async create(req, res) {
    try {
      const { code, discount, discount_type, valid_from, valid_to, minimum_order_amount, max_usage } = req.body;

      if (!code || discount === undefined || !discount_type) {
        return res.status(422).json({
          success: false,
          message: "code, discount, and discount_type are required",
        });
      }
      if (!["PERCENTAGE", "FIXED"].includes(discount_type)) {
        return res.status(422).json({
          success: false,
          message: "discount_type must be PERCENTAGE or FIXED",
        });
      }

      const existing = await CouponModel.findByCode(code);
      if (existing) {
        return res.status(409).json({ success: false, message: "Coupon code already exists" });
      }

      const newId = await CouponModel.create({
        code: code.toUpperCase(),
        discount, discount_type, valid_from, valid_to, minimum_order_amount, max_usage,
      });

      await AuditService.log(req.user.id, "COUPON_CREATED", "Coupon", newId, { code, discount, discount_type });

      const newCoupon = await CouponModel.findById(newId);
      return res.status(201).json({
        success: true,
        message: "Coupon created successfully",
        data: newCoupon,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async update(req, res) {
    try {
      const existing = await CouponModel.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
      }

      await CouponModel.update(req.params.id, req.body);
      await AuditService.log(req.user.id, "COUPON_UPDATED", "Coupon", req.params.id, {
        changed_fields: Object.keys(req.body),
      });

      const updated = await CouponModel.findById(req.params.id);
      return res.status(200).json({ success: true, message: "Coupon updated", data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async toggleActive(req, res) {
    try {
      const { is_active } = req.body;
      if (typeof is_active !== "boolean") {
        return res.status(422).json({ success: false, message: "is_active must be true or false" });
      }

      const existing = await CouponModel.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
      }

      await CouponModel.setActive(req.params.id, is_active);
      await AuditService.log(req.user.id, "COUPON_UPDATED", "Coupon", req.params.id, {
        is_active,
      });

      return res.status(200).json({
        success: true,
        message: `Coupon ${is_active ? "enabled" : "disabled"} successfully`,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async remove(req, res) {
    try {
      const existing = await CouponModel.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
      }
      await CouponModel.delete(req.params.id);
      await AuditService.log(req.user.id, "COUPON_DELETED", "Coupon", req.params.id, { code: existing.code });

      return res.status(200).json({ success: true, message: "Coupon deleted successfully" });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // ─── Module 5: Coupon Validation (POS — no order needed yet) ──
  /**
   * POST /api/coupons/validate
   * Body: { code, order_total }
   * Validates coupon eligibility and returns the discount amount.
   * No redemption recorded — just a preview/check for the POS cart.
   */
  async validate(req, res) {
    try {
      const { code, order_total } = req.body;
      if (!code) {
        return res.status(422).json({ success: false, message: "code is required" });
      }

      const orderTotal = parseFloat(order_total ?? 0);

      // Use the model's existing validation logic (handles expiry + usage limits)
      const { coupon, discount_applied } = await CouponModel.validateAndCalculate(
        code.toUpperCase(),
        orderTotal,
        null // no customer_id at this point (pre-order)
      );

      return res.status(200).json({
        success: true,
        message: "Coupon is valid",
        data: {
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount,
          discount_amount: discount_applied,
          minimum_order_amount: coupon.minimum_order_amount,
        },
      });
    } catch (err) {
      console.error("CouponController.validate:", err);
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
      });
    }
  },

  // ─── Module 5: Coupon Redemption ─────────────────────────────

  /**
   * POST /api/coupons/redeem
   * Body: { coupon_code, customer_id, order_id }
   * The order's grand_total is fetched from DB — never trusted from client.
   */
  async redeem(req, res) {
    try {
      const { coupon_code, customer_id, order_id } = req.body;

      if (!coupon_code || !customer_id || !order_id) {
        return res.status(422).json({
          success: false,
          message: "coupon_code, customer_id, and order_id are required",
        });
      }

      const result = await CRMService.applyCoupon({
        coupon_code: coupon_code.toUpperCase(),
        customer_id,
        order_id,
        userId: req.user.id,
      });

      return res.status(200).json({
        success: true,
        message: "Coupon applied successfully",
        data: result,
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
      });
    }
  },
};

module.exports = CouponController;
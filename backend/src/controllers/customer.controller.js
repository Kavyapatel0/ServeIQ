const CustomerModel = require("../models/customer.model");
const AuditService = require("../services/audit.service");

const CustomerController = {
  // ─── Module 1: Customer Profiles ─────────────────────────────

  async getAll(req, res) {
    try {
      const { search, is_active } = req.query;
      const filters = { search };
      if (is_active !== undefined) filters.is_active = is_active !== "false";
      else filters.is_active = true; // default to active only

      const customers = await CustomerModel.findAll(filters);
      return res.status(200).json({ success: true, data: customers });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async getById(req, res) {
    try {
      const customer = await CustomerModel.findById(req.params.id);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }
      return res.status(200).json({ success: true, data: customer });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async create(req, res) {
    try {
      const { name, email, phone, date_of_birth, gender, address } = req.body;

      if (!name) {
        return res.status(422).json({ success: false, message: "name is required" });
      }
      if (phone) {
        const exists = await CustomerModel.findByPhone(phone);
        if (exists) {
          return res.status(409).json({ success: false, message: "Phone number already registered" });
        }
      }
      if (email) {
        const exists = await CustomerModel.findByEmail(email);
        if (exists) {
          return res.status(409).json({ success: false, message: "Email already registered" });
        }
      }

      const newId = await CustomerModel.create({ name, email, phone, date_of_birth, gender, address });
      const newCustomer = await CustomerModel.findById(newId);

      await AuditService.log(req.user.id, "CUSTOMER_CREATED", "Customer", newId, { name, phone });

      return res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: newCustomer,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async update(req, res) {
    try {
      const customerId = req.params.id;
      const existing = await CustomerModel.findById(customerId);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      const { phone, email } = req.body;
      if (phone && phone !== existing.phone) {
        const taken = await CustomerModel.findByPhone(phone, customerId);
        if (taken) {
          return res.status(409).json({ success: false, message: "Phone number already registered" });
        }
      }
      if (email && email !== existing.email) {
        const taken = await CustomerModel.findByEmail(email, customerId);
        if (taken) {
          return res.status(409).json({ success: false, message: "Email already registered" });
        }
      }

      await CustomerModel.update(customerId, req.body);
      const updated = await CustomerModel.findById(customerId);

      await AuditService.log(req.user.id, "CUSTOMER_UPDATED", "Customer", customerId, {
        changed_fields: Object.keys(req.body),
      });

      return res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        data: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * DELETE /customers/:id — deactivates (soft delete) rather than removing.
   * Preserves all order history and loyalty data.
   */
  async remove(req, res) {
    try {
      const customerId = req.params.id;
      const existing = await CustomerModel.findById(customerId);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      await CustomerModel.setActive(customerId, false);
      await AuditService.log(req.user.id, "CUSTOMER_DEACTIVATED", "Customer", customerId, {
        name: existing.name,
      });

      return res.status(200).json({ success: true, message: "Customer deactivated successfully" });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // ─── Module 2: Visit History ──────────────────────────────────

  async getHistory(req, res) {
    try {
      const customer = await CustomerModel.findById(req.params.id);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      const history = await CustomerModel.getVisitHistory(req.params.id);
      return res.status(200).json({
        success: true,
        data: {
          customer: { id: customer.id, name: customer.name },
          total_visits: history.length,
          total_spent: history.reduce((s, h) => s + Number(h.grand_total), 0),
          visits: history,
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // ─── Module 3: Loyalty ───────────────────────────────────────

  async getLoyalty(req, res) {
    try {
      const customer = await CustomerModel.findById(req.params.id);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      const summary = await CustomerModel.getLoyaltySummary(req.params.id);
      return res.status(200).json({
        success: true,
        data: { customer: { id: customer.id, name: customer.name }, ...summary },
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async redeemPoints(req, res) {
    try {
      const { points } = req.body;
      if (!points || points < 1) {
        return res.status(422).json({ success: false, message: "points must be a positive integer" });
      }

      const customer = await CustomerModel.findById(req.params.id);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      await CustomerModel.redeemPoints(req.params.id, points);

      await AuditService.log(req.user.id, "LOYALTY_POINTS_REDEEMED", "Customer", req.params.id, {
        points_redeemed: points,
      });

      const updated = await CustomerModel.findById(req.params.id);
      return res.status(200).json({
        success: true,
        message: `${points} points redeemed successfully`,
        data: { remaining_points: updated.loyalty_points },
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
      });
    }
  },

  // ─── Adjust Points (award/deduct manually) ───────────────────
  async adjustPoints(req, res) {
    try {
      const { points, type = "EARNED" } = req.body;
      const pts = Number(points);
      if (!pts || pts < 1) {
        return res.status(422).json({ success: false, message: "points must be a positive integer" });
      }

      const customer = await CustomerModel.findById(req.params.id);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      if (type === "REDEEMED") {
        await CustomerModel.redeemPoints(req.params.id, pts);
      } else {
        await CustomerModel.awardPoints(req.params.id, pts);
      }

      await AuditService.log(req.user.id, "LOYALTY_POINTS_ADJUSTED", "Customer", req.params.id, {
        points, type,
      });

      const updated = await CustomerModel.findById(req.params.id);
      return res.status(200).json({
        success: true,
        message: `${pts} points ${type === "REDEEMED" ? "deducted" : "awarded"} successfully`,
        data: { remaining_points: updated.loyalty_points },
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
      });
    }
  },

  // ─── Global Loyalty Transactions ─────────────────────────────
  async getAllLoyaltyTransactions(req, res) {
    try {
      const limit  = Math.min(Number(req.query.limit)  || 100, 500);
      const offset = Math.max(Number(req.query.offset) || 0,   0);
      const transactions = await CustomerModel.getAllLoyaltyTransactions({ limit, offset });
      return res.status(200).json({ success: true, data: transactions });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async getLoyaltyStats(req, res) {
    try {
      const stats = await CustomerModel.getLoyaltyStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },
};

module.exports = CustomerController;
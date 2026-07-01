const { KitchenModel, KITCHEN_STATUS } = require("../models/kitchen.model");
const KitchenService = require("../services/kitchen.service");

const KitchenController = {
  /**
   * GET /api/kitchen/orders
   * Kitchen queue — all orders for this branch.
   *
   * Query params:
   *   ?status=PENDING               — filter by status
   *   ?search=ORD-2026              — search by order number or table
   *   ?sort=oldest | newest         — oldest first (FIFO) is default
   *   ?date=2026-07-01              — filter by date
   */
  async getAll(req, res) {
    try {
      const { status, search, sort, date } = req.query;
      const branch_id = req.branchScope;

      // Validate status if provided
      if (status && !Object.values(KITCHEN_STATUS).includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed: ${Object.values(KITCHEN_STATUS).join(", ")}.`,
        });
      }

      const orders = await KitchenModel.findAll({
        branch_id,
        status,
        search,
        sort,
        date,
      });

      return res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (err) {
      console.error("KitchenController.getAll:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch kitchen orders." });
    }
  },

  /**
   * GET /api/kitchen/orders/:id
   * Single kitchen order with full order items.
   */
  async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const ko = await KitchenModel.findById(id);

      if (!ko) {
        return res.status(404).json({ success: false, message: "Kitchen order not found." });
      }
      if (req.branchScope && ko.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      const items = await KitchenModel.findOrderItems(id);

      return res.status(200).json({
        success: true,
        data: { ...ko, items },
      });
    } catch (err) {
      console.error("KitchenController.getById:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch kitchen order." });
    }
  },

  /**
   * PATCH /api/kitchen/orders/:id/preparing
   * Chef starts cooking. PENDING → PREPARING.
   */
  async markPreparing(req, res) {
    try {
      const id = parseInt(req.params.id);

      // Branch scope check before delegating to service
      const ko = await KitchenModel.findById(id);
      if (!ko) return res.status(404).json({ success: false, message: "Kitchen order not found." });
      if (req.branchScope && ko.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      const updated = await KitchenService.updateStatus(id, KITCHEN_STATUS.PREPARING, req.user.id);

      return res.status(200).json({
        success: true,
        message: `Order is now being prepared.`,
        data: updated,
      });
    } catch (err) {
      console.error("KitchenController.markPreparing:", err);
      return res
        .status(err.status || 500)
        .json({ success: false, message: err.message || "Failed to update kitchen order status." });
    }
  },

  /**
   * PATCH /api/kitchen/orders/:id/ready
   * Chef finishes. PREPARING → READY. Notifies waiter via Socket.IO.
   */
  async markReady(req, res) {
    try {
      const id = parseInt(req.params.id);

      const ko = await KitchenModel.findById(id);
      if (!ko) return res.status(404).json({ success: false, message: "Kitchen order not found." });
      if (req.branchScope && ko.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      const updated = await KitchenService.updateStatus(id, KITCHEN_STATUS.READY, req.user.id);

      return res.status(200).json({
        success: true,
        message: "Order is ready. Waiter has been notified.",
        data: updated,
      });
    } catch (err) {
      console.error("KitchenController.markReady:", err);
      return res
        .status(err.status || 500)
        .json({ success: false, message: err.message || "Failed to update kitchen order status." });
    }
  },

  /**
   * PATCH /api/kitchen/orders/:id/served
   * Waiter served food. READY → SERVED.
   */
  async markServed(req, res) {
    try {
      const id = parseInt(req.params.id);

      const ko = await KitchenModel.findById(id);
      if (!ko) return res.status(404).json({ success: false, message: "Kitchen order not found." });
      if (req.branchScope && ko.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      const updated = await KitchenService.updateStatus(id, KITCHEN_STATUS.SERVED, req.user.id);

      return res.status(200).json({
        success: true,
        message: "Order marked as served.",
        data: updated,
      });
    } catch (err) {
      console.error("KitchenController.markServed:", err);
      return res
        .status(err.status || 500)
        .json({ success: false, message: err.message || "Failed to update kitchen order status." });
    }
  },

  /**
   * GET /api/kitchen/dashboard
   * Summary cards: Pending / Preparing / Ready / Served Today
   */
  async getDashboard(req, res) {
    try {
      const branch_id = req.branchScope;
      const stats = await KitchenModel.getDashboardStats(branch_id);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      console.error("KitchenController.getDashboard:", err);
      return res.status(500).json({ success: false, message: "Failed to load kitchen dashboard." });
    }
  },
};

module.exports = KitchenController;
const POSService = require("../services/pos.service");
const { OrderModel, ORDER_STATUS } = require("../models/order.model");
const AuditService = require("../services/audit.service");

const OrderController = {
  /**
   * POST /api/orders
   * Creates a new order and marks the table as OCCUPIED.
   */
  async create(req, res) {
    try {
      const {
        customer_id,
        table_id,
        items,           // optional: [{ menu_item_id, quantity }]
        coupon_code,
        payment_method,
        amount_tendered,
        order_type,
        branch_id: bodyBranchId,
      } = req.body;

      // Branch resolution priority:
      //   1. req.branchScope (set by enforceBranchScope for non-admins)
      //   2. branch_id from request body (allows Super Admin to specify)
      //   3. req.user.branch_id (user's own branch)
      //   4. Default to branch 1 (Super Admin fallback)
      const branch_id =
        req.branchScope ??
        (bodyBranchId ? parseInt(bodyBranchId) : null) ??
        req.user.branch_id ??
        1;

      const { orderId, order_number } = await POSService.createOrder({
        customer_id: customer_id || null,
        branch_id,
        table_id: table_id || null,
        created_by: req.user.id,
      });

      // If items were provided in the body, add them all in one call
      if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await POSService.addOrderItem({
            order_id: orderId,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity || 1,
            userId: req.user.id,
            branch_id,
          });
        }

        // Apply coupon discount if provided
        if (coupon_code) {
          try {
            const { CouponModel } = require("../models/coupon.model");
            const coupon = await CouponModel.findByCode(coupon_code);
            if (coupon && coupon.is_active) {
              const { pool } = require("../config/db");
              const [orderRow] = await pool.execute(
                "SELECT subtotal FROM Orders WHERE id = ?", [orderId]
              );
              const subtotal = parseFloat(orderRow[0]?.subtotal ?? 0);
              let discountAmt = 0;
              if (coupon.discount_type === "PERCENTAGE") {
                discountAmt = parseFloat(((subtotal * coupon.discount) / 100).toFixed(2));
              } else {
                discountAmt = parseFloat(Math.min(coupon.discount, subtotal).toFixed(2));
              }
              const newGrandTotal = parseFloat((
                subtotal * 1.05 - discountAmt
              ).toFixed(2));
              await pool.execute(
                "UPDATE Orders SET discount_amount = ?, grand_total = ? WHERE id = ?",
                [discountAmt, Math.max(0, newGrandTotal), orderId]
              );
            }
          } catch (couponErr) {
            console.warn("Coupon application failed (non-fatal):", couponErr.message);
          }
        }

        // Send to kitchen automatically
        await POSService.sendToKitchen(orderId, req.user.id);

        // Process payment if method was provided
        if (payment_method) {
          await POSService.processPayment({
            order_id: orderId,
            payment_method: payment_method.toUpperCase(),
            userId: req.user.id,
          });
        }
      }

      const order = await OrderModel.findById(orderId);
      return res.status(201).json({
        success: true,
        message: `Order ${order_number} created.`,
        data: order,
      });
    } catch (err) {
      console.error("OrderController.create:", err);
      return res
        .status(err.status || 500)
        .json({ success: false, message: err.message || "Failed to create order." });
    }
  },

  /**
   * GET /api/orders
   * Filters: ?status=PAID &customer_id=5 &date=2026-06-20
   * Waiters only see orders they created.
   */
  async getAll(req, res) {
    try {
      const { status, customer_id, date } = req.query;
      const branch_id = req.branchScope;

      // Waiters are locked to their own orders
      const WAITER_ROLE = "Waiter";
      const created_by =
        req.user.role === WAITER_ROLE ? req.user.id : undefined;

      const orders = await OrderModel.findAll({
        branch_id,
        status,
        customer_id: customer_id ? parseInt(customer_id) : undefined,
        date,
        created_by,
      });

      return res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
      console.error("OrderController.getAll:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch orders." });
    }
  },

  /**
   * GET /api/orders/:id
   */
  async getById(req, res) {
    try {
      const order = await OrderModel.findById(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found." });
      }

      // Branch scope check
      if (req.branchScope && order.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      // Attach items
      const { OrderModel: OM } = require("../models/order.model");
      const items = await OrderModel.findItemsByOrderId(order.id);

      return res.status(200).json({ success: true, data: { ...order, items } });
    } catch (err) {
      console.error("OrderController.getById:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch order." });
    }
  },

  /**
   * POST /api/orders/:id/items
   * Add item(s) to an existing order.
   * Body: { menu_item_id, quantity }
   */
  async addItem(req, res) {
    try {
      const order_id = parseInt(req.params.id);
      const { menu_item_id, quantity } = req.body;

      if (!menu_item_id || !quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "menu_item_id and quantity (≥ 1) are required.",
        });
      }

      const branch_id = req.branchScope ?? req.user.branch_id;

      const result = await POSService.addOrderItem({
        order_id,
        menu_item_id: parseInt(menu_item_id),
        quantity: parseInt(quantity),
        userId: req.user.id,
        branch_id,
      });

      return res.status(201).json({
        success: true,
        message: "Item added to order.",
        data: result,
      });
    } catch (err) {
      console.error("OrderController.addItem:", err);
      return res
        .status(err.status || 500)
        .json({ success: false, message: err.message || "Failed to add item." });
    }
  },

  /**
   * GET /api/orders/:id/items
   */
  async getItems(req, res) {
    try {
      const order_id = parseInt(req.params.id);
      const order = await OrderModel.findById(order_id);
      if (!order) return res.status(404).json({ success: false, message: "Order not found." });
      if (req.branchScope && order.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      const items = await OrderModel.findItemsByOrderId(order_id);
      return res.status(200).json({ success: true, count: items.length, data: items });
    } catch (err) {
      console.error("OrderController.getItems:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch order items." });
    }
  },

  /**
   * PATCH /api/orders/:id/items/:itemId
   * Update quantity of a single order item. Recalculates bill after.
   * Body: { quantity }
   */
  async updateItemQuantity(req, res) {
    try {
      const order_id = parseInt(req.params.id);
      const itemId   = parseInt(req.params.itemId);
      const quantity = parseInt(req.body.quantity);

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "quantity must be a positive integer. To remove an item use DELETE.",
        });
      }

      const order = await OrderModel.findById(order_id);
      if (!order) return res.status(404).json({ success: false, message: "Order not found." });
      if (req.branchScope && order.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }
      if (order.status !== ORDER_STATUS.CREATED) {
        return res.status(409).json({
          success: false,
          message: `Cannot edit items on an order with status: ${order.status}.`,
        });
      }

      const updated = await OrderModel.updateItemQuantity(itemId, order_id, quantity);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Order item not found." });
      }

      const totals = await OrderModel.recalculateTotals(order_id, parseFloat(order.discount_amount));

      await AuditService.log(req.user.id, "ITEM_QUANTITY_UPDATED", "Order", order_id, {
        itemId,
        quantity,
      });

      const items = await OrderModel.findItemsByOrderId(order_id);
      return res.status(200).json({
        success: true,
        message: "Item quantity updated.",
        data: { items, totals },
      });
    } catch (err) {
      console.error("OrderController.updateItemQuantity:", err);
      return res.status(500).json({ success: false, message: "Failed to update item quantity." });
    }
  },

  /**
   * DELETE /api/orders/:id/items/:itemId
   * Remove a single item from a CREATED order and recalculate.
   */
  async removeItem(req, res) {
    try {
      const order_id = parseInt(req.params.id);
      const itemId = parseInt(req.params.itemId);

      const order = await OrderModel.findById(order_id);
      if (!order) return res.status(404).json({ success: false, message: "Order not found." });
      if (req.branchScope && order.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }
      if (order.status !== ORDER_STATUS.CREATED) {
        return res.status(409).json({
          success: false,
          message: `Cannot remove items from an order with status: ${order.status}.`,
        });
      }

      const removed = await OrderModel.removeItem(itemId, order_id);
      if (!removed) return res.status(404).json({ success: false, message: "Order item not found." });

      const totals = await OrderModel.recalculateTotals(order_id, parseFloat(order.discount_amount));

      await AuditService.log(req.user.id, "ITEM_REMOVED", "Order", order_id, { itemId });

      return res.status(200).json({ success: true, message: "Item removed.", data: { totals } });
    } catch (err) {
      console.error("OrderController.removeItem:", err);
      return res.status(500).json({ success: false, message: "Failed to remove item." });
    }
  },

  /**
   * POST /api/orders/:id/send-to-kitchen
   */
  async sendToKitchen(req, res) {
    try {
      const order_id = parseInt(req.params.id);
      await POSService.sendToKitchen(order_id, req.user.id);

      const order = await OrderModel.findById(order_id);
      return res.status(200).json({
        success: true,
        message: "Order sent to kitchen.",
        data: order,
      });
    } catch (err) {
      console.error("OrderController.sendToKitchen:", err);
      return res
        .status(err.status || 500)
        .json({ success: false, message: err.message || "Failed to send order to kitchen." });
    }
  },

  /**
   * PATCH /api/orders/:id/status
   * Generic status update (for managers). Body: { status }
   */
  async updateStatus(req, res) {
    try {
      const order_id = parseInt(req.params.id);
      const { status } = req.body;

      if (!status || !Object.values(ORDER_STATUS).includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed: ${Object.values(ORDER_STATUS).join(", ")}.`,
        });
      }

      const order = await OrderModel.findById(order_id);
      if (!order) return res.status(404).json({ success: false, message: "Order not found." });
      if (req.branchScope && order.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      await OrderModel.updateStatus(order_id, status);
      await AuditService.log(req.user.id, "ORDER_STATUS_UPDATED", "Order", order_id, {
        previous: order.status,
        new: status,
      });

      const updated = await OrderModel.findById(order_id);
      return res.status(200).json({ success: true, message: "Order status updated.", data: updated });
    } catch (err) {
      console.error("OrderController.updateStatus:", err);
      return res.status(500).json({ success: false, message: "Failed to update order status." });
    }
  },

  /**
   * POST /api/orders/:id/cancel
   */
  async cancel(req, res) {
    try {
      const order_id = parseInt(req.params.id);

      const order = await OrderModel.findById(order_id);
      if (!order) return res.status(404).json({ success: false, message: "Order not found." });
      if (req.branchScope && order.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      await POSService.cancelOrder(order_id, req.user.id);
      const updated = await OrderModel.findById(order_id);
      return res.status(200).json({ success: true, message: "Order cancelled.", data: updated });
    } catch (err) {
      console.error("OrderController.cancel:", err);
      return res
        .status(err.status || 500)
        .json({ success: false, message: err.message || "Failed to cancel order." });
    }
  },

  /**
   * GET /api/orders/:id/receipt
   */
  async getReceipt(req, res) {
    try {
      const order_id = parseInt(req.params.id);
      const receipt = await POSService.generateReceipt(order_id);

      // Branch check
      const order = await OrderModel.findById(order_id);
      if (req.branchScope && order.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      return res.status(200).json({ success: true, data: receipt });
    } catch (err) {
      console.error("OrderController.getReceipt:", err);
      return res
        .status(err.status || 500)
        .json({ success: false, message: err.message || "Failed to generate receipt." });
    }
  },
};

module.exports = OrderController;
const { PurchaseOrderModel, PO_STATUS } = require("../models/purchase.model");
const { IngredientModel } = require("../models/ingredient.model");
const InventoryService = require("../services/inventory.service");
const AuditService = require("../services/audit.service");

const PurchaseController = {
  /**
   * POST /api/purchase-orders
   * Creates an empty PENDING purchase order. Items are added separately.
   * Body: { supplier_id }
   */
  async create(req, res) {
    try {
      const { supplier_id } = req.body;
      if (!supplier_id) {
        return res.status(400).json({ success: false, message: "supplier_id is required." });
      }

      const branch_id = req.branchScope ?? req.user.branch_id;
      if (!branch_id) {
        return res.status(400).json({
          success: false,
          message: "No branch assigned. Contact your administrator.",
        });
      }

      const { insertId, po_number } = await PurchaseOrderModel.create({
        supplier_id,
        branch_id,
        created_by: req.user.id,
      });

      await AuditService.log(req.user.id, "PURCHASE_CREATED", "Purchase_Order", insertId, {
        po_number, supplier_id, branch_id,
      });

      const po = await PurchaseOrderModel.findById(insertId);
      return res.status(201).json({
        success: true,
        message: `Purchase order ${po_number} created.`,
        data: po,
      });
    } catch (err) {
      console.error("PurchaseController.create:", err);
      return res.status(500).json({ success: false, message: "Failed to create purchase order." });
    }
  },

  /**
   * GET /api/purchase-orders
   * ?status=PENDING &supplier_id=1
   */
  async getAll(req, res) {
    try {
      const { status, supplier_id } = req.query;
      const branch_id = req.branchScope;

      const orders = await PurchaseOrderModel.findAll({
        branch_id,
        supplier_id: supplier_id ? parseInt(supplier_id) : undefined,
        status,
      });

      return res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
      console.error("PurchaseController.getAll:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch purchase orders." });
    }
  },

  /**
   * GET /api/purchase-orders/:id
   */
  async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const po = await PurchaseOrderModel.findById(id);
      if (!po) return res.status(404).json({ success: false, message: "Purchase order not found." });
      if (req.branchScope && po.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      const items = await PurchaseOrderModel.findItemsByPoId(id);
      return res.status(200).json({ success: true, data: { ...po, items } });
    } catch (err) {
      console.error("PurchaseController.getById:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch purchase order." });
    }
  },

  // ─── Purchase Order Items ───────────────────────────────────────

  /**
   * POST /api/purchase-orders/:id/items
   * Body: { ingredient_id, quantity, unit_price }
   * Only allowed while the PO is still PENDING.
   */
  async addItem(req, res) {
    try {
      const poId = parseInt(req.params.id);
      const { ingredient_id, quantity, unit_price } = req.body;

      if (!ingredient_id || !quantity || unit_price == null) {
        return res.status(400).json({
          success: false,
          message: "ingredient_id, quantity, and unit_price are required.",
        });
      }

      const po = await PurchaseOrderModel.findById(poId);
      if (!po) return res.status(404).json({ success: false, message: "Purchase order not found." });
      if (req.branchScope && po.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }
      if (po.status !== PO_STATUS.PENDING) {
        return res.status(409).json({
          success: false,
          message: `Cannot add items to a purchase order with status: ${po.status}.`,
        });
      }

      const ingredient = await IngredientModel.findById(ingredient_id);
      if (!ingredient) return res.status(404).json({ success: false, message: "Ingredient not found." });

      const itemId = await PurchaseOrderModel.addItem({
        purchase_order_id: poId,
        ingredient_id,
        quantity,
        unit_price,
      });

      const total = await PurchaseOrderModel.recalculateTotal(poId);

      await AuditService.log(req.user.id, "PURCHASE_ITEM_ADDED", "Purchase_Order", poId, {
        ingredient_id, quantity, unit_price,
      });

      return res.status(201).json({
        success: true,
        message: "Item added to purchase order.",
        data: { itemId, total_amount: total },
      });
    } catch (err) {
      console.error("PurchaseController.addItem:", err);
      return res.status(500).json({ success: false, message: "Failed to add purchase order item." });
    }
  },

  /**
   * PATCH /api/purchase-orders/:id/items/:itemId
   * Body: { quantity, unit_price }
   */
  async updateItem(req, res) {
    try {
      const poId = parseInt(req.params.id);
      const itemId = parseInt(req.params.itemId);
      const { quantity, unit_price } = req.body;

      if (!quantity || unit_price == null) {
        return res.status(400).json({ success: false, message: "quantity and unit_price are required." });
      }

      const po = await PurchaseOrderModel.findById(poId);
      if (!po) return res.status(404).json({ success: false, message: "Purchase order not found." });
      if (req.branchScope && po.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }
      if (po.status !== PO_STATUS.PENDING) {
        return res.status(409).json({
          success: false,
          message: `Cannot edit items on a purchase order with status: ${po.status}.`,
        });
      }

      const updated = await PurchaseOrderModel.updateItem(itemId, poId, { quantity, unit_price });
      if (!updated) return res.status(404).json({ success: false, message: "Purchase order item not found." });

      const total = await PurchaseOrderModel.recalculateTotal(poId);

      await AuditService.log(req.user.id, "PURCHASE_ITEM_UPDATED", "Purchase_Order", poId, {
        itemId, quantity, unit_price,
      });

      return res.status(200).json({
        success: true,
        message: "Purchase order item updated.",
        data: { total_amount: total },
      });
    } catch (err) {
      console.error("PurchaseController.updateItem:", err);
      return res.status(500).json({ success: false, message: "Failed to update purchase order item." });
    }
  },

  /**
   * DELETE /api/purchase-orders/:id/items/:itemId
   */
  async removeItem(req, res) {
    try {
      const poId = parseInt(req.params.id);
      const itemId = parseInt(req.params.itemId);

      const po = await PurchaseOrderModel.findById(poId);
      if (!po) return res.status(404).json({ success: false, message: "Purchase order not found." });
      if (req.branchScope && po.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }
      if (po.status !== PO_STATUS.PENDING) {
        return res.status(409).json({
          success: false,
          message: `Cannot remove items from a purchase order with status: ${po.status}.`,
        });
      }

      const removed = await PurchaseOrderModel.removeItem(itemId, poId);
      if (!removed) return res.status(404).json({ success: false, message: "Purchase order item not found." });

      const total = await PurchaseOrderModel.recalculateTotal(poId);

      await AuditService.log(req.user.id, "PURCHASE_ITEM_REMOVED", "Purchase_Order", poId, { itemId });

      return res.status(200).json({
        success: true,
        message: "Item removed.",
        data: { total_amount: total },
      });
    } catch (err) {
      console.error("PurchaseController.removeItem:", err);
      return res.status(500).json({ success: false, message: "Failed to remove purchase order item." });
    }
  },

  /**
   * POST /api/purchase-orders/:id/receive
   * Validates PO, increases ingredient stock, writes Inventory_Transactions,
   * updates PO status to RECEIVED, writes audit log — all atomically.
   */
  async receive(req, res) {
    try {
      const poId = parseInt(req.params.id);

      const po = await PurchaseOrderModel.findById(poId);
      if (!po) return res.status(404).json({ success: false, message: "Purchase order not found." });
      if (req.branchScope && po.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      const result = await InventoryService.receivePurchaseOrder(poId, req.user.id);

      const updated = await PurchaseOrderModel.findById(poId);
      return res.status(200).json({
        success: true,
        message: `Purchase order received. Stock updated for ${result.items_received} ingredient(s).`,
        data: updated,
      });
    } catch (err) {
      console.error("PurchaseController.receive:", err);
      return res
        .status(err.status || 500)
        .json({ success: false, message: err.message || "Failed to receive purchase order." });
    }
  },
};

module.exports = PurchaseController;
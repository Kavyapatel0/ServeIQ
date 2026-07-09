const { InventoryModel } = require("../models/inventory.model");
const InventoryService = require("../services/inventory.service");

const InventoryController = {
  /**
   * GET /api/inventory/transactions
   * ?date= &ingredient_id= &supplier_id= &transaction_type=
   */
  async getTransactions(req, res) {
    try {
      const { date, ingredient_id, supplier_id, transaction_type } = req.query;
      const branch_id = req.branchScope;

      const transactions = await InventoryModel.findTransactions({
        branch_id,
        date,
        ingredient_id: ingredient_id ? parseInt(ingredient_id) : undefined,
        supplier_id: supplier_id ? parseInt(supplier_id) : undefined,
        transaction_type,
      });

      return res.status(200).json({ success: true, count: transactions.length, data: transactions });
    } catch (err) {
      console.error("InventoryController.getTransactions:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch inventory transactions." });
    }
  },

  /**
   * GET /api/inventory/low-stock
   */
  async getLowStock(req, res) {
    try {
      const branch_id = req.branchScope;
      const items = await InventoryModel.findLowStock({ branch_id });
      return res.status(200).json({ success: true, count: items.length, data: items });
    } catch (err) {
      console.error("InventoryController.getLowStock:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch low-stock ingredients." });
    }
  },

  /**
   * GET /api/inventory/dashboard
   */
  async getDashboard(req, res) {
    try {
      const branch_id = req.branchScope;
      const stats = await InventoryModel.getDashboardStats({ branch_id });
      return res.status(200).json({ success: true, data: stats });
    } catch (err) {
      console.error("InventoryController.getDashboard:", err);
      return res.status(500).json({ success: false, message: "Failed to load inventory dashboard." });
    }
  },

  /**
   * POST /api/inventory/adjust
   * Body: { ingredient_id, new_stock, reason }
   * Manual stock correction — always recorded as an ADJUSTMENT transaction.
   */
  async adjustStock(req, res) {
    try {
      const { ingredient_id, new_stock, reason } = req.body;

      if (!ingredient_id || new_stock == null || new_stock < 0) {
        return res.status(400).json({
          success: false,
          message: "ingredient_id and a non-negative new_stock are required.",
        });
      }

      const branch_id = req.branchScope ?? req.user.branch_id;
      if (!branch_id) {
        return res.status(400).json({
          success: false,
          message: "No branch assigned. Contact your administrator.",
        });
      }

      const result = await InventoryService.adjustStock({
        ingredient_id: parseInt(ingredient_id),
        branch_id,
        new_stock: parseFloat(new_stock),
        reason,
        userId: req.user.id,
      });

      return res.status(200).json({
        success: true,
        message: "Stock adjusted.",
        data: result,
      });
    } catch (err) {
      console.error("InventoryController.adjustStock:", err);
      return res
        .status(err.status || 500)
        .json({ success: false, message: err.message || "Failed to adjust stock." });
    }
  },
};

module.exports = InventoryController;
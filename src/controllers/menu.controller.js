const { MenuModel } = require("../models/menu.model");
const AuditService = require("../services/audit.service");

const MenuController = {
  // ─── Categories ───────────────────────────────────────────────

  async getAllCategories(req, res) {
    try {
      const categories = await MenuModel.findAllCategories();
      return res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (err) {
      console.error("MenuController.getAllCategories:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch categories." });
    }
  },

  async createCategory(req, res) {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Category name is required." });
      }
      const id = await MenuModel.createCategory({ name: name.trim() });
      await AuditService.log(req.user.id, "CATEGORY_CREATED", "Menu_Categories", id, { name });
      const category = await MenuModel.findCategoryById(id);
      return res.status(201).json({ success: true, message: "Category created.", data: category });
    } catch (err) {
      console.error("MenuController.createCategory:", err);
      return res.status(500).json({ success: false, message: "Failed to create category." });
    }
  },

  async updateCategory(req, res) {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Category name is required." });
      }
      const existing = await MenuModel.findCategoryById(id);
      if (!existing) return res.status(404).json({ success: false, message: "Category not found." });

      await MenuModel.updateCategory(id, { name: name.trim() });
      await AuditService.log(req.user.id, "CATEGORY_UPDATED", "Menu_Categories", id, { name });
      return res.status(200).json({ success: true, message: "Category updated.", data: { id, name } });
    } catch (err) {
      console.error("MenuController.updateCategory:", err);
      return res.status(500).json({ success: false, message: "Failed to update category." });
    }
  },

  async deleteCategory(req, res) {
    try {
      const id = parseInt(req.params.id);
      const existing = await MenuModel.findCategoryById(id);
      if (!existing) return res.status(404).json({ success: false, message: "Category not found." });

      await MenuModel.deleteCategory(id);
      await AuditService.log(req.user.id, "CATEGORY_DELETED", "Menu_Categories", id);
      return res.status(200).json({ success: true, message: "Category deleted." });
    } catch (err) {
      console.error("MenuController.deleteCategory:", err);
      if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(409).json({
          success: false,
          message: "Cannot delete category that has menu items. Remove or reassign them first.",
        });
      }
      return res.status(500).json({ success: false, message: "Failed to delete category." });
    }
  },

  // ─── Menu Items ───────────────────────────────────────────────

  /**
   * GET /api/menu-items
   * ?category_id=1 &branch_id=1 &is_available=true
   * Waiter/Cashier pass their own branch_id automatically via branchScope.
   */
  async getAllItems(req, res) {
    try {
      const { category_id, is_available, search } = req.query;
      const branch_id = req.branchScope ?? (req.query.branch_id ? parseInt(req.query.branch_id) : undefined);

      const items = await MenuModel.findAllItems({
        category_id: category_id ? parseInt(category_id) : undefined,
        branch_id,
        is_available: is_available !== undefined ? is_available === "true" : undefined,
        search,
      });

      return res.status(200).json({ success: true, count: items.length, data: items });
    } catch (err) {
      console.error("MenuController.getAllItems:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch menu items." });
    }
  },

  async getItemById(req, res) {
    try {
      const item = await MenuModel.findItemById(parseInt(req.params.id));
      if (!item) return res.status(404).json({ success: false, message: "Menu item not found." });
      return res.status(200).json({ success: true, data: item });
    } catch (err) {
      console.error("MenuController.getItemById:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch menu item." });
    }
  },

  async createItem(req, res) {
    try {
      const { category_id, name, description, selling_price, cost_price, is_available } = req.body;

      if (!category_id || !name || selling_price == null || cost_price == null) {
        return res.status(400).json({
          success: false,
          message: "category_id, name, selling_price, and cost_price are required.",
        });
      }

      const id = await MenuModel.createItem({
        category_id,
        name: name.trim(),
        description,
        selling_price,
        cost_price,
        is_available,
      });

      await AuditService.log(req.user.id, "MENU_ITEM_CREATED", "Menu_Items", id, { name, selling_price });

      const item = await MenuModel.findItemById(id);
      return res.status(201).json({ success: true, message: "Menu item created.", data: item });
    } catch (err) {
      console.error("MenuController.createItem:", err);
      return res.status(500).json({ success: false, message: "Failed to create menu item." });
    }
  },

  async updateItem(req, res) {
    try {
      const id = parseInt(req.params.id);
      const existing = await MenuModel.findItemById(id);
      if (!existing) return res.status(404).json({ success: false, message: "Menu item not found." });

      const { category_id, name, description, selling_price, cost_price, is_available } = req.body;
      const updated = await MenuModel.updateItem(id, {
        category_id, name, description, selling_price, cost_price, is_available,
      });

      if (!updated) return res.status(400).json({ success: false, message: "Nothing to update." });

      await AuditService.log(req.user.id, "MENU_ITEM_UPDATED", "Menu_Items", id, req.body);

      const item = await MenuModel.findItemById(id);
      return res.status(200).json({ success: true, message: "Menu item updated.", data: item });
    } catch (err) {
      console.error("MenuController.updateItem:", err);
      return res.status(500).json({ success: false, message: "Failed to update menu item." });
    }
  },

  /**
   * PATCH /api/menu/items/:id/toggle-availability
   * Flips is_available without touching any other field.
   */
  async toggleAvailability(req, res) {
    try {
      const id = parseInt(req.params.id);
      const newState = await MenuModel.toggleAvailability(id);

      if (newState === null) {
        return res.status(404).json({ success: false, message: "Menu item not found." });
      }

      await AuditService.log(req.user.id, "MENU_ITEM_AVAILABILITY_TOGGLED", "Menu_Items", id, {
        is_available: newState,
      });

      return res.status(200).json({
        success: true,
        message: `Item is now ${newState ? "available" : "unavailable"}.`,
        data: { id, is_available: newState },
      });
    } catch (err) {
      console.error("MenuController.toggleAvailability:", err);
      return res.status(500).json({ success: false, message: "Failed to toggle availability." });
    }
  },

  async deleteItem(req, res) {
    try {
      const id = parseInt(req.params.id);
      const existing = await MenuModel.findItemById(id);
      if (!existing) return res.status(404).json({ success: false, message: "Menu item not found." });

      await MenuModel.deleteItem(id);
      await AuditService.log(req.user.id, "MENU_ITEM_DELETED", "Menu_Items", id);
      return res.status(200).json({ success: true, message: "Menu item deactivated." });
    } catch (err) {
      console.error("MenuController.deleteItem:", err);
      return res.status(500).json({ success: false, message: "Failed to delete menu item." });
    }
  },
};

module.exports = MenuController;
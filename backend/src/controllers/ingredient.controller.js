const { IngredientModel } = require("../models/ingredient.model");
const AuditService = require("../services/audit.service");

const IngredientController = {
  /**
   * GET /api/ingredients
   * ?search=tomato &supplier_id=1 &is_active=true &low_stock=true
   */
  async getAll(req, res) {
    try {
      const { search, supplier_id, is_active, low_stock } = req.query;
      const ingredients = await IngredientModel.findAll({
        search,
        supplier_id: supplier_id ? parseInt(supplier_id) : undefined,
        is_active: is_active !== undefined ? is_active === "true" : undefined,
        low_stock: low_stock === "true",
      });
      return res.status(200).json({ success: true, count: ingredients.length, data: ingredients });
    } catch (err) {
      console.error("IngredientController.getAll:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch ingredients." });
    }
  },

  async getById(req, res) {
    try {
      const ingredient = await IngredientModel.findById(parseInt(req.params.id));
      if (!ingredient) {
        return res.status(404).json({ success: false, message: "Ingredient not found." });
      }
      return res.status(200).json({ success: true, data: ingredient });
    } catch (err) {
      console.error("IngredientController.getById:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch ingredient." });
    }
  },

  async create(req, res) {
    try {
      const { name, unit, current_stock, minimum_stock, cost_price, supplier_id } = req.body;

      if (!name || !unit || minimum_stock == null || cost_price == null) {
        return res.status(400).json({
          success: false,
          message: "name, unit, minimum_stock, and cost_price are required.",
        });
      }

      const id = await IngredientModel.create({
        name: name.trim(),
        unit,
        current_stock: current_stock || 0,
        minimum_stock,
        cost_price,
        supplier_id,
      });

      await AuditService.log(req.user.id, "INGREDIENT_CREATED", "Ingredient", id, {
        name, unit, minimum_stock, cost_price,
      });

      const ingredient = await IngredientModel.findById(id);
      return res.status(201).json({ success: true, message: "Ingredient created.", data: ingredient });
    } catch (err) {
      console.error("IngredientController.create:", err);
      return res.status(500).json({ success: false, message: "Failed to create ingredient." });
    }
  },

  async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      const existing = await IngredientModel.findById(id);
      if (!existing) return res.status(404).json({ success: false, message: "Ingredient not found." });

      const { name, unit, minimum_stock, cost_price, supplier_id } = req.body;
      const updated = await IngredientModel.update(id, { name, unit, minimum_stock, cost_price, supplier_id });

      if (!updated) return res.status(400).json({ success: false, message: "Nothing to update." });

      await AuditService.log(req.user.id, "INGREDIENT_UPDATED", "Ingredient", id, req.body);

      const ingredient = await IngredientModel.findById(id);
      return res.status(200).json({ success: true, message: "Ingredient updated.", data: ingredient });
    } catch (err) {
      console.error("IngredientController.update:", err);
      return res.status(500).json({ success: false, message: "Failed to update ingredient." });
    }
  },

  /**
   * PATCH /api/ingredients/:id/toggle-active
   * Enable / Disable an ingredient.
   */
  async toggleActive(req, res) {
    try {
      const id = parseInt(req.params.id);
      const newState = await IngredientModel.toggleActive(id);

      if (newState === null) {
        return res.status(404).json({ success: false, message: "Ingredient not found." });
      }

      await AuditService.log(req.user.id, "INGREDIENT_UPDATED", "Ingredient", id, {
        is_active: newState,
      });

      return res.status(200).json({
        success: true,
        message: `Ingredient is now ${newState ? "enabled" : "disabled"}.`,
        data: { id, is_active: newState },
      });
    } catch (err) {
      console.error("IngredientController.toggleActive:", err);
      return res.status(500).json({ success: false, message: "Failed to toggle ingredient status." });
    }
  },

  async delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      const existing = await IngredientModel.findById(id);
      if (!existing) return res.status(404).json({ success: false, message: "Ingredient not found." });

      await IngredientModel.delete(id);
      await AuditService.log(req.user.id, "INGREDIENT_DELETED", "Ingredient", id);
      return res.status(200).json({ success: true, message: "Ingredient deactivated." });
    } catch (err) {
      console.error("IngredientController.delete:", err);
      return res.status(500).json({ success: false, message: "Failed to delete ingredient." });
    }
  },
};

module.exports = IngredientController;
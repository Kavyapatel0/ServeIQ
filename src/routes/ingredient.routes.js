/**
 * Ingredient Routes
 *
 * GET    /api/ingredients                       — inventory.view
 *                                                  ?search=tomato ?supplier_id=1
 *                                                  ?is_active=true ?low_stock=true
 * GET    /api/ingredients/:id                   — inventory.view
 * POST   /api/ingredients                       — inventory.manage
 * PUT    /api/ingredients/:id                   — inventory.manage
 * PATCH  /api/ingredients/:id/toggle-active      — inventory.manage
 * DELETE /api/ingredients/:id                   — inventory.manage
 */

const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");

const IngredientController = require("../controllers/ingredient.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize, PERMISSIONS } = require("../middlewares/role.middleware");
const validators = require("../middlewares/validators");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE),
  IngredientController.getAll
);

router.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE),
  IngredientController.getById
);

router.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.INVENTORY_MANAGE),
  validators.createIngredient,
  validate,
  IngredientController.create
);

router.put(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.INVENTORY_MANAGE),
  validators.updateIngredient,
  validate,
  IngredientController.update
);

router.patch(
  "/:id/toggle-active",
  authenticate,
  authorize(PERMISSIONS.INVENTORY_MANAGE),
  IngredientController.toggleActive
);

router.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.INVENTORY_MANAGE),
  IngredientController.delete
);

module.exports = router;
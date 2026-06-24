/**
 * Menu Routes
 *
 * Categories:
 *   GET    /api/menu/categories         — All roles
 *   POST   /api/menu/categories         — menu.manage only
 *   PUT    /api/menu/categories/:id     — menu.manage only
 *   DELETE /api/menu/categories/:id     — menu.manage only
 *
 * Items:
 *   GET    /api/menu/items              — All authenticated users
 *                                         ?search=pizza  ?category_id=1  ?is_available=true
 *   GET    /api/menu/items/:id          — All authenticated users
 *   POST   /api/menu/items              — menu.manage only
 *   PUT    /api/menu/items/:id          — menu.manage only
 *   PATCH  /api/menu/items/:id/toggle-availability — menu.manage only
 *   DELETE /api/menu/items/:id          — menu.manage only
 */

const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");

const MenuController = require("../controllers/menu.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize, PERMISSIONS } = require("../middlewares/role.middleware");
const { enforceBranchScope } = require("../middlewares/Branch-scope.middleware");
const validators = require("../middlewares/validators");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// ─── Categories ──────────────────────────────────────────────────

router.get("/categories", authenticate, MenuController.getAllCategories);

router.post(
  "/categories",
  authenticate,
  authorize(PERMISSIONS.MENU_MANAGE),
  MenuController.createCategory
);

router.put(
  "/categories/:id",
  authenticate,
  authorize(PERMISSIONS.MENU_MANAGE),
  MenuController.updateCategory
);

router.delete(
  "/categories/:id",
  authenticate,
  authorize(PERMISSIONS.MENU_MANAGE),
  MenuController.deleteCategory
);

// ─── Items ───────────────────────────────────────────────────────

router.get(
  "/items",
  authenticate,
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  MenuController.getAllItems
);

router.get(
  "/items/:id",
  authenticate,
  MenuController.getItemById
);

router.post(
  "/items",
  authenticate,
  authorize(PERMISSIONS.MENU_MANAGE),
  validators.createMenuItem,
  validate,
  MenuController.createItem
);

router.put(
  "/items/:id",
  authenticate,
  authorize(PERMISSIONS.MENU_MANAGE),
  validators.updateMenuItem,
  validate,
  MenuController.updateItem
);

// PATCH /api/menu/items/:id/toggle-availability
// Must be declared before /items/:id DELETE to avoid route conflicts
router.patch(
  "/items/:id/toggle-availability",
  authenticate,
  authorize(PERMISSIONS.MENU_MANAGE),
  MenuController.toggleAvailability
);

router.delete(
  "/items/:id",
  authenticate,
  authorize(PERMISSIONS.MENU_MANAGE),
  MenuController.deleteItem
);

module.exports = router;
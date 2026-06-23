/**
 * Table Routes
 *
 * GET    /api/tables          — View all tables (branch-scoped)
 * GET    /api/tables/:id      — View single table
 * POST   /api/tables          — Create table (Manager/Admin)
 * PUT    /api/tables/:id      — Update table (Manager/Admin)
 * DELETE /api/tables/:id      — Delete table (Manager/Admin)
 */

const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");

const TableController = require("../controllers/table.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize, PERMISSIONS } = require("../middlewares/role.middleware");
const { enforceBranchScope } = require("../middlewares/Branch-scope.middleware");
const validators = require("../middlewares/validators");

// Inline validation error handler
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
  authorize(PERMISSIONS.TABLES_VIEW),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  TableController.getAll
);

router.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.TABLES_VIEW),
  enforceBranchScope(PERMISSIONS.BRANCHES_MANAGE),
  TableController.getById
);

router.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.BRANCHES_MANAGE, PERMISSIONS.MENU_MANAGE),
  validators.createTable,
  validate,
  TableController.create
);

router.put(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.BRANCHES_MANAGE, PERMISSIONS.MENU_MANAGE),
  validators.updateTable,
  validate,
  TableController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.BRANCHES_MANAGE),
  TableController.delete
);

module.exports = router;
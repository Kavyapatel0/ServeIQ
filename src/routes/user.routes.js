const express = require("express");
const router = express.Router();

const UserController = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize, ROLES } = require("../middlewares/role.middleware");
const validators = require("../middlewares/validators");

// All user routes require authentication
router.use(authenticate);

// GET /api/users — Super Admin & Branch Manager
router.get(
  "/",
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER),
  UserController.getAll
);

// GET /api/users/:id — Super Admin & Branch Manager
router.get(
  "/:id",
  authorize(ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER),
  UserController.getById
);

// POST /api/users — Super Admin only
router.post(
  "/",
  authorize(ROLES.SUPER_ADMIN),
  validators.createUser,
  UserController.create
);

// PUT /api/users/:id — Super Admin only
router.put(
  "/:id",
  authorize(ROLES.SUPER_ADMIN),
  validators.updateUser,
  UserController.update
);

// DELETE /api/users/:id — Super Admin only
router.delete(
  "/:id",
  authorize(ROLES.SUPER_ADMIN),
  UserController.remove
);

module.exports = router;
const express = require("express");
const router = express.Router();

const UserController = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize, PERMISSIONS } = require("../middlewares/role.middleware");
const { enforceBranchScope } = require("../middlewares/Branch-scope.middleware");
const validators = require("../middlewares/validators");

// All user routes require authentication
router.use(authenticate);

/**
 * GET /api/users/roles
 * Returns all available roles (id + name) so the frontend can populate selects.
 */
router.get(
  "/roles",
  authorize(PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE),
  UserController.getRoles
);

/**
 * GET /api/users/branches
 * Returns all branches (id + name + is_active).
 */
router.get(
  "/branches",
  authorize(PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE),
  UserController.getBranches
);

/**
 * GET /api/users
 */
router.get(
  "/",
  authorize(PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE),
  enforceBranchScope(PERMISSIONS.USERS_MANAGE),
  UserController.getAll
);

/**
 * GET /api/users/:id
 */
router.get(
  "/:id",
  authorize(PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE),
  enforceBranchScope(PERMISSIONS.USERS_MANAGE),
  UserController.getById
);

/**
 * POST /api/users
 */
router.post(
  "/",
  authorize(PERMISSIONS.USERS_MANAGE),
  validators.createUser,
  UserController.create
);

/**
 * PUT /api/users/:id
 */
router.put(
  "/:id",
  authorize(PERMISSIONS.USERS_MANAGE),
  validators.updateUser,
  UserController.update
);

/**
 * DELETE /api/users/:id
 * Soft delete — see UserModel.delete(). The row is preserved for
 * audit history and any FK references elsewhere in the schema.
 */
router.delete(
  "/:id",
  authorize(PERMISSIONS.USERS_MANAGE),
  UserController.remove
);

module.exports = router;
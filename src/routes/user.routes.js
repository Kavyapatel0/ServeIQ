const express = require("express");
const router = express.Router();

const UserController = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize, PERMISSIONS } = require("../middlewares/role.middleware");
const validators = require("../middlewares/validators");

// All user routes require authentication
router.use(authenticate);

// GET /api/users — anyone who can view OR manage users
// (controller further scopes to own branch if they lack users.manage)
router.get(
  "/",
  authorize(PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE),
  UserController.getAll
);

// GET /api/users/:id
router.get(
  "/:id",
  authorize(PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE),
  UserController.getById
);

// POST /api/users — requires full user management rights
router.post(
  "/",
  authorize(PERMISSIONS.USERS_MANAGE),
  validators.createUser,
  UserController.create
);

// PUT /api/users/:id — requires full user management rights
router.put(
  "/:id",
  authorize(PERMISSIONS.USERS_MANAGE),
  validators.updateUser,
  UserController.update
);

// DELETE /api/users/:id — requires full user management rights
router.delete(
  "/:id",
  authorize(PERMISSIONS.USERS_MANAGE),
  UserController.remove
);

module.exports = router;
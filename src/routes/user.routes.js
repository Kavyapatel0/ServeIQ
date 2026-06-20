const express = require("express");
const router = express.Router();

const UserController = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize, PERMISSIONS } = require("../middlewares/role.middleware");
const { enforceBranchScope } = require("../middlewares/branch-scope.middleware");
const validators = require("../middlewares/validators");

// All user routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List users
 *     description: Users with `users.manage` see every branch. Everyone else is locked to their own branch_id.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branch_id
 *         schema: { type: integer }
 *         description: Only honored for callers with users.manage
 *       - in: query
 *         name: role_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: List of users }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get(
  "/",
  authorize(PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE),
  enforceBranchScope(PERMISSIONS.USERS_MANAGE),
  UserController.getAll
);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: User found }
 *       403: { description: Forbidden — different branch }
 *       404: { description: User not found }
 */
router.get(
  "/:id",
  authorize(PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE),
  enforceBranchScope(PERMISSIONS.USERS_MANAGE),
  UserController.getById
);

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role_id]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role_id: { type: integer }
 *               branch_id: { type: integer, nullable: true }
 *     responses:
 *       201: { description: User created }
 *       409: { description: Email already in use }
 *       422: { description: Validation failed }
 */
router.post(
  "/",
  authorize(PERMISSIONS.USERS_MANAGE),
  validators.createUser,
  UserController.create
);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Update an existing user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: User updated }
 *       404: { description: User not found }
 *       409: { description: Email already in use }
 */
router.put(
  "/:id",
  authorize(PERMISSIONS.USERS_MANAGE),
  validators.updateUser,
  UserController.update
);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Soft-delete a user
 *     description: Sets deleted_at + is_active=false. The row is preserved for audit history.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: User soft-deleted }
 *       400: { description: Cannot delete your own account }
 *       404: { description: User not found }
 */
router.delete(
  "/:id",
  authorize(PERMISSIONS.USERS_MANAGE),
  UserController.remove
);

module.exports = router;
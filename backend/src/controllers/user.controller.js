const { validationResult } = require("express-validator");
const UserModel = require("../models/user.model");
const AuthService = require("../services/auth.service");
const AuditService = require("../services/audit.service");
const { pool } = require("../config/db");

// Role name → ID mapping (must match seed data)
const ROLE_NAME_TO_ID = {
  "Super Admin":       1,
  "Branch Manager":    2,
  "Cashier":           3,
  "Chef":              4,
  "Waiter":            5,
  "Inventory Manager": 6,
};

/**
 * Resolve role_id from request body.
 * Accepts either role_id (number) or role (role name string).
 */
function resolveRoleId(body) {
  if (body.role_id) return parseInt(body.role_id);
  if (body.role && ROLE_NAME_TO_ID[body.role]) return ROLE_NAME_TO_ID[body.role];
  return null;
}

const UserController = {
  /**
   * GET /api/users/roles
   * Returns all available roles for UI selects.
   */
  async getRoles(req, res) {
    try {
      const [rows] = await pool.execute("SELECT id, name FROM Roles ORDER BY id");
      return res.status(200).json({ success: true, data: rows });
    } catch (err) {
      console.error("UserController.getRoles:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * GET /api/users/branches
   * Returns all branches for UI selects.
   */
  async getBranches(req, res) {
    try {
      const [rows] = await pool.execute(
        "SELECT id, name, location AS address FROM Branches ORDER BY name"
      );
      // Add is_active: true as a default since the Branches table doesn't have this column
      const branches = rows.map(b => ({ ...b, phone: null, is_active: true }));
      return res.status(200).json({ success: true, data: branches });
    } catch (err) {
      console.error("UserController.getBranches:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * GET /api/users
   * req.branchScope is set by enforceBranchScope middleware:
   *   null  => no restriction (caller has the bypass permission)
   *   <id>  => locked to that branch, regardless of query params
   */
  async getAll(req, res) {
    try {
      const { branch_id, role_id } = req.query;

      const filters = {};
      if (req.branchScope !== null) {
        filters.branch_id = req.branchScope;
      } else {
        if (branch_id) filters.branch_id = branch_id;
        if (role_id) filters.role_id = role_id;
      }

      const users = await UserModel.findAll(filters);
      // Normalize: add role and branch as objects for frontend compatibility
      const normalized = users.map(normalizeUser);
      return res.status(200).json({ success: true, data: normalized });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * GET /api/users/:id
   */
  async getById(req, res) {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (req.branchScope !== null && user.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      return res.status(200).json({ success: true, data: normalizeUser(user) });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * POST /api/users
   * Accepts either role_id (integer) or role (role name string).
   */
  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    try {
      const { name, email, password, branch_id } = req.body;
      const role_id = resolveRoleId(req.body);

      if (!role_id) {
        return res.status(422).json({ success: false, message: "A valid role or role_id is required" });
      }

      const exists = await UserModel.emailExists(email);
      if (exists) {
        return res.status(409).json({ success: false, message: "Email already in use" });
      }

      const hashedPassword = await AuthService.hashPassword(password);
      const newId = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        role_id,
        branch_id: branch_id || null,
      });

      const newUser = await UserModel.findById(newId);

      await AuditService.log(req.user.id, "CREATE", "User", newId, {
        created_email: email,
        role_id,
        branch_id: branch_id || null,
      });

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: normalizeUser(newUser),
      });
    } catch (err) {
      console.error("UserController.create:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * PUT /api/users/:id
   * Accepts either role_id (integer) or role (role name string).
   */
  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    try {
      const userId = req.params.id;
      const existing = await UserModel.findById(userId);
      if (!existing) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const { name, email, password, branch_id } = req.body;
      const role_id = resolveRoleId(req.body) || undefined;

      if (email && email !== existing.email) {
        const taken = await UserModel.emailExists(email, userId);
        if (taken) {
          return res.status(409).json({ success: false, message: "Email already in use" });
        }
      }

      const updateData = { name, email, role_id, branch_id };
      if (password) {
        updateData.password = await AuthService.hashPassword(password);
      }

      await UserModel.update(userId, updateData);
      const updated = await UserModel.findById(userId);

      const changedFields = Object.keys(req.body).filter((k) =>
        ["name", "email", "password", "role_id", "role", "branch_id"].includes(k)
      );
      await AuditService.log(req.user.id, "UPDATE", "User", userId, {
        changed_fields: changedFields,
      });

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: normalizeUser(updated),
      });
    } catch (err) {
      console.error("UserController.update:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * DELETE /api/users/:id
   * Soft delete — see UserModel.delete(). The row is preserved for
   * audit history and any FK references elsewhere in the schema.
   */
  async remove(req, res) {
    try {
      const userId = req.params.id;

      if (Number(userId) === req.user.id) {
        return res.status(400).json({ success: false, message: "Cannot delete your own account" });
      }

      const target = await UserModel.findById(userId);
      if (!target) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const deleted = await UserModel.delete(userId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      await AuditService.log(req.user.id, "DELETE", "User", userId, {
        deleted_email: target.email,
      });

      return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },
};

/**
 * Normalize a DB user row to the shape the frontend expects.
 * Frontend reads: u.role (string), u.branch_name, u.branch?.name
 */
function normalizeUser(user) {
  if (!user) return user;
  return {
    ...user,
    // role_name comes from the JOIN with Roles
    role: user.role_name ?? user.role,
    branch_name: user.branch_name ?? null,
  };
}

module.exports = UserController;
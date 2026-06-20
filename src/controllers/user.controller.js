const { validationResult } = require("express-validator");
const UserModel = require("../models/user.model");
const AuthService = require("../services/auth.service");
const { PERMISSIONS } = require("../middlewares/role.middleware");

const UserController = {
  /**
   * GET /api/users
   * Anyone with users.manage sees everyone; users.view-only sees
   * their own branch (e.g. a Branch Manager).
   */
  async getAll(req, res) {
    try {
      const { branch_id, role_id } = req.query;
      const canManage = req.user.permissions.includes(PERMISSIONS.USERS_MANAGE);

      const filters = {};
      if (!canManage) {
        // users.view without users.manage => branch-scoped only
        filters.branch_id = req.user.branch_id;
      } else {
        if (branch_id) filters.branch_id = branch_id;
        if (role_id) filters.role_id = role_id;
      }

      const users = await UserModel.findAll(filters);
      return res.status(200).json({ success: true, data: users });
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

      const canManage = req.user.permissions.includes(PERMISSIONS.USERS_MANAGE);
      if (!canManage && user.branch_id !== req.user.branch_id) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      return res.status(200).json({ success: true, data: user });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * POST /api/users
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
      const { name, email, password, role_id, branch_id } = req.body;

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
      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * PUT /api/users/:id
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

      const { name, email, password, role_id, branch_id } = req.body;

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

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updated,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  /**
   * DELETE /api/users/:id
   */
  async remove(req, res) {
    try {
      const userId = req.params.id;

      if (Number(userId) === req.user.id) {
        return res.status(400).json({ success: false, message: "Cannot delete your own account" });
      }

      const deleted = await UserModel.delete(userId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },
};

module.exports = UserController;
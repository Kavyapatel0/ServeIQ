const { validationResult } = require("express-validator");
const AuthService = require("../services/auth.service");

const AuthController = {
  /**
   * POST /api/auth/login
   */
  async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (err) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
      });
    }
  },

  /**
   * GET /api/auth/me
   * Returns the currently authenticated user, including their
   * current permission_keys (useful for the frontend to show/hide UI).
   */
  async me(req, res) {
    try {
      return res.status(200).json({
        success: true,
        data: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          branch_id: req.user.branch_id,
          permissions: req.user.permissions,
        },
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  /**
   * POST /api/auth/logout
   * JWT is stateless — client drops the token.
   */
  logout(req, res) {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  },
};

module.exports = AuthController;
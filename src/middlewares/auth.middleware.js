const AuthService = require("../services/auth.service");
const UserModel = require("../models/user.model");

/**
 * authenticate
 * Verifies the Bearer token, then re-fetches the user (and their
 * CURRENT permissions) from the DB — not from the token payload.
 * This means revoking a permission takes effect immediately on the
 * next request, instead of waiting for the token to expire.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = AuthService.verifyToken(token);

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_name,
      role_id: user.role_id,
      branch_id: user.branch_id,
      permissions: user.permissions, // fresh from DB, e.g. ["orders.create", ...]
    };

    next();
  } catch (err) {
    return res.status(err.status || 401).json({
      success: false,
      message: err.message || "Authentication failed.",
    });
  }
};

module.exports = { authenticate };
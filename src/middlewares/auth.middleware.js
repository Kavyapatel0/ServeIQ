const AuthService = require("../services/auth.service");
const UserModel = require("../models/user.model");

/**
 * authenticate
 * Verifies the Bearer token in the Authorization header.
 * On success, attaches the full user object to req.user.
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

    // Fetch fresh user data from DB (catches deleted/modified users)
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    // Attach full user object for use in controllers
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_name,
      role_id: user.role_id,
      branch_id: user.branch_id,
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
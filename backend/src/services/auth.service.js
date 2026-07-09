const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

const AuthService = {
  /**
   * Validate credentials and return a signed JWT.
   * The JWT payload carries the user's permission_keys so that
   * authorize() can check access without a DB round-trip on every request.
   */
  async login(email, password) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw { status: 401, message: "Invalid email or password" };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw { status: 401, message: "Invalid email or password" };
    }

    const payload = {
      id: user.id,
      role: user.role_name,
      role_id: user.role_id,
      branch_id: user.branch_id,
      permissions: user.permissions, // e.g. ["orders.create", "orders.view"]
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
        branch_id: user.branch_id,
        permissions: user.permissions,
      },
    };
  },

  async hashPassword(plainPassword) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(plainPassword, salt);
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw { status: 401, message: "Token has expired, please login again" };
      }
      throw { status: 401, message: "Invalid token" };
    }
  },
};

module.exports = AuthService;
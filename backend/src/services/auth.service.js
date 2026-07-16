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

  /**
   * Verifies a Google ID token (from Google Identity Services on the
   * frontend) and logs the matching Users record in. We do NOT
   * auto-create accounts here — restaurant staff accounts are
   * provisioned by an admin, so Google Sign-In only works for an
   * email that already exists in the Users table.
   */
  async googleLogin(idToken) {
    if (!idToken) {
      throw { status: 400, message: "Missing Google credential." };
    }

    // Verify the token with Google's tokeninfo endpoint (no extra
    // dependency required — works in any Node runtime with fetch).
    let payload;
    try {
      const resp = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      );
      if (!resp.ok) {
        throw new Error("Token verification failed");
      }
      payload = await resp.json();
    } catch (err) {
      throw { status: 401, message: "Invalid Google credential." };
    }

    const expectedAudience = process.env.GOOGLE_CLIENT_ID;
    if (expectedAudience && payload.aud !== expectedAudience) {
      throw { status: 401, message: "Google credential audience mismatch." };
    }
    if (!payload.email || payload.email_verified !== "true" && payload.email_verified !== true) {
      throw { status: 401, message: "Google account email is not verified." };
    }

    const user = await UserModel.findByEmail(payload.email);
    if (!user) {
      throw {
        status: 403,
        message:
          "No ServeIQ account found for this Google email. Ask your Super Admin to create one first.",
      };
    }
    if (user.is_active === 0 || user.is_active === false) {
      throw { status: 403, message: "This account has been deactivated." };
    }

    const tokenPayload = {
      id: user.id,
      role: user.role_name,
      role_id: user.role_id,
      branch_id: user.branch_id,
      permissions: user.permissions,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
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

  /**
   * Verifies a Google ID token by calling Google's tokeninfo endpoint.
   * Avoids adding the google-auth-library dependency — tokeninfo is a
   * simple GET that returns the decoded/verified claims directly.
   * Throws if the token is invalid, expired, or issued for a different
   * client than GOOGLE_CLIENT_ID.
   */
  async verifyGoogleIdToken(idToken) {
    if (!idToken) {
      throw { status: 400, message: "Google ID token is required." };
    }

    let payload;
    try {
      const resp = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      );
      if (!resp.ok) {
        throw new Error(`tokeninfo responded ${resp.status}`);
      }
      payload = await resp.json();
    } catch (err) {
      throw { status: 401, message: "Invalid or expired Google token." };
    }

    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && payload.aud !== expectedClientId) {
      throw { status: 401, message: "Google token was not issued for this app." };
    }

    if (payload.email_verified !== "true" && payload.email_verified !== true) {
      throw { status: 401, message: "Google account email is not verified." };
    }

    return {
      email: payload.email,
      name: payload.name || payload.email,
      picture: payload.picture || null,
    };
  },

  /**
   * Logs a user in via a verified Google identity. The user must already
   * exist in our Users table (matched by email) — Google sign-in does not
   * create new accounts, since roles/branches must be assigned by an admin.
   */
  async loginWithGoogle(idToken) {
    const googleProfile = await this.verifyGoogleIdToken(idToken);

    const user = await UserModel.findByEmail(googleProfile.email);
    if (!user) {
      throw {
        status: 403,
        message:
          "No ServeIQ account found for this Google email. Ask your Super Admin to create one first.",
      };
    }
    if (user.is_active === 0 || user.is_active === false) {
      throw { status: 403, message: "This account has been deactivated." };
    }

    const payload = {
      id: user.id,
      role: user.role_name,
      role_id: user.role_id,
      branch_id: user.branch_id,
      permissions: user.permissions,
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
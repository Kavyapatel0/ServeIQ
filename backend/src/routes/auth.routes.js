const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const validators = require("../middlewares/validators");

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@restaurant.com }
 *               password: { type: string, example: admin123 }
 *     responses:
 *       200: { description: Login successful, returns token + user + permissions }
 *       401: { description: Invalid email or password }
 *       422: { description: Validation failed }
 */
router.post("/login", validators.login, AuthController.login);

/**
 * @openapi
 * /api/auth/google:
 *   post:
 *     summary: Log in using a Google Identity Services ID token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [credential]
 *             properties:
 *               credential: { type: string, description: "Google ID token (JWT) from GIS" }
 *     responses:
 *       200: { description: Login successful, returns token + user + permissions }
 *       400: { description: Missing credential }
 *       401: { description: Invalid/expired Google token }
 *       403: { description: No matching ServeIQ account for this Google email }
 */
router.post("/google", AuthController.googleLogin);

/**
 * @openapi
 * /api/auth/google:
 *   post:
 *     summary: Log in with a Google ID token (Google Identity Services)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [credential]
 *             properties:
 *               credential: { type: string, description: "Google ID token (JWT) from GSI" }
 *     responses:
 *       200: { description: Login successful, returns token + user + permissions }
 *       401: { description: Invalid Google credential }
 *       403: { description: No matching ServeIQ account for this Google email }
 */
router.post("/google", AuthController.googleLogin);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Current user, including permissions array }
 *       401: { description: Unauthorized }
 */
router.get("/me", authenticate, AuthController.me);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Log out (client drops the token — JWT is stateless)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Logged out successfully }
 *       401: { description: Unauthorized }
 */
router.post("/logout", authenticate, AuthController.logout);

module.exports = router;
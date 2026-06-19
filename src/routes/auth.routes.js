const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const validators = require("../middlewares/validators");

// POST /api/auth/login
router.post("/login", validators.login, AuthController.login);

// GET /api/auth/me  — requires valid JWT
router.get("/me", authenticate, AuthController.me);

// POST /api/auth/logout — requires valid JWT (client drops the token)
router.post("/logout", authenticate, AuthController.logout);

module.exports = router;
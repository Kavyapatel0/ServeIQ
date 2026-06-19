const { body, param } = require("express-validator");

const validators = {
  /**
   * POST /api/auth/login
   */
  login: [
    body("email")
      .trim()
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Enter a valid email address"),
    body("password")
      .notEmpty().withMessage("Password is required"),
  ],

  /**
   * POST /api/users
   */
  createUser: [
    body("name")
      .trim()
      .notEmpty().withMessage("Name is required")
      .isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters"),
    body("email")
      .trim()
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Enter a valid email address"),
    body("password")
      .notEmpty().withMessage("Password is required")
      .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role_id")
      .notEmpty().withMessage("Role is required")
      .isInt({ min: 1 }).withMessage("Role must be a valid integer"),
    body("branch_id")
      .optional({ nullable: true })
      .isInt({ min: 1 }).withMessage("Branch must be a valid integer"),
  ],

  /**
   * PUT /api/users/:id
   */
  updateUser: [
    param("id")
      .isInt({ min: 1 }).withMessage("User ID must be a positive integer"),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters"),
    body("email")
      .optional()
      .trim()
      .isEmail().withMessage("Enter a valid email address"),
    body("password")
      .optional()
      .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role_id")
      .optional()
      .isInt({ min: 1 }).withMessage("Role must be a valid integer"),
    body("branch_id")
      .optional({ nullable: true })
      .isInt({ min: 1 }).withMessage("Branch must be a valid integer"),
  ],
};

module.exports = validators;
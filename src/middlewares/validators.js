const { body, param, query } = require("express-validator");

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
  // ─── Table validators ────────────────────────────────────────

  createTable: [
    body("table_number")
      .trim()
      .notEmpty().withMessage("table_number is required")
      .isLength({ max: 20 }).withMessage("table_number must be ≤ 20 characters"),
    body("capacity")
      .notEmpty().withMessage("capacity is required")
      .isInt({ min: 1 }).withMessage("capacity must be a positive integer"),
    body("branch_id")
      .optional()
      .isInt({ min: 1 }).withMessage("branch_id must be a positive integer"),
  ],

  updateTable: [
    param("id").isInt({ min: 1 }).withMessage("Table ID must be a positive integer"),
    body("table_number")
      .optional()
      .trim()
      .isLength({ min: 1, max: 20 }).withMessage("table_number must be 1–20 characters"),
    body("capacity")
      .optional()
      .isInt({ min: 1 }).withMessage("capacity must be a positive integer"),
    body("status")
      .optional()
      .isIn(["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING"])
      .withMessage("status must be AVAILABLE, OCCUPIED, RESERVED, or CLEANING"),
  ],

  // ─── Menu validators ─────────────────────────────────────────

  createMenuItem: [
    body("category_id")
      .notEmpty().withMessage("category_id is required")
      .isInt({ min: 1 }).withMessage("category_id must be a positive integer"),
    body("name")
      .trim()
      .notEmpty().withMessage("name is required")
      .isLength({ min: 2, max: 100 }).withMessage("name must be 2–100 characters"),
    body("selling_price")
      .notEmpty().withMessage("selling_price is required")
      .isFloat({ min: 0.01 }).withMessage("selling_price must be > 0"),
    body("cost_price")
      .notEmpty().withMessage("cost_price is required")
      .isFloat({ min: 0.01 }).withMessage("cost_price must be > 0"),
    body("description").optional().isString(),
    body("is_available").optional().isBoolean(),
  ],

  updateMenuItem: [
    param("id").isInt({ min: 1 }).withMessage("Menu item ID must be a positive integer"),
    body("category_id").optional().isInt({ min: 1 }),
    body("name").optional().trim().isLength({ min: 2, max: 100 }),
    body("selling_price").optional().isFloat({ min: 0.01 }),
    body("cost_price").optional().isFloat({ min: 0.01 }),
    body("description").optional().isString(),
    body("is_available").optional().isBoolean(),
  ],

  // ─── Order validators ─────────────────────────────────────────

  createOrder: [
    body("customer_id")
      .optional({ nullable: true })
      .isInt({ min: 1 }).withMessage("customer_id must be a positive integer"),
    body("table_id")
      .optional({ nullable: true })
      .isInt({ min: 1 }).withMessage("table_id must be a positive integer"),
  ],

  addOrderItem: [
    param("id").isInt({ min: 1 }).withMessage("Order ID must be a positive integer"),
    body("menu_item_id")
      .notEmpty().withMessage("menu_item_id is required")
      .isInt({ min: 1 }).withMessage("menu_item_id must be a positive integer"),
    body("quantity")
      .notEmpty().withMessage("quantity is required")
      .isInt({ min: 1 }).withMessage("quantity must be at least 1"),
  ],

  updateOrderStatus: [
    param("id").isInt({ min: 1 }).withMessage("Order ID must be a positive integer"),
    body("status")
      .notEmpty().withMessage("status is required")
      .isIn(["CREATED", "PREPARING", "READY", "SERVED", "PAID", "COMPLETED", "CANCELLED"])
      .withMessage("Invalid order status"),
  ],

  // ─── Payment validators ───────────────────────────────────────

  processPayment: [
    body("order_id")
      .notEmpty().withMessage("order_id is required")
      .isInt({ min: 1 }).withMessage("order_id must be a positive integer"),
    body("payment_method")
      .notEmpty().withMessage("payment_method is required")
      .isIn(["CASH", "CARD", "UPI", "WALLET"])
      .withMessage("payment_method must be CASH, CARD, UPI, or WALLET"),
  ],
};

module.exports = validators;
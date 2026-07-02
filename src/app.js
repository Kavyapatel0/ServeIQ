const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const authRoutes       = require("./routes/auth.routes");
const userRoutes       = require("./routes/user.routes");
const tableRoutes      = require("./routes/table.routes");
const menuRoutes       = require("./routes/menu.routes");
const orderRoutes      = require("./routes/order.routes");
const paymentRoutes    = require("./routes/payment.routes");
const ingredientRoutes = require("./routes/ingredient.routes");
const supplierRoutes   = require("./routes/supplier.routes");
const purchaseRoutes   = require("./routes/purchase.routes");
const inventoryRoutes  = require("./routes/inventory.routes");
const kitchenRoutes    = require("./routes/kitchen.routes");
const customerRoutes   = require("./routes/customer.routes");
const couponRoutes     = require("./routes/coupon.routes");
const crmRoutes        = require("./routes/crm.routes");
const swaggerSpec      = require("./utils/swagger");

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ─── Request Parsing ────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── HTTP Request Logging ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ─── Health Check ───────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ─── API Documentation (Swagger UI) ─────────────────────────────────────────
// helmet's default CSP blocks Swagger UI's inline assets, so we relax it
// only for this one route rather than disabling it app-wide.
app.use(
  "/api/docs",
  helmet({ contentSecurityPolicy: false }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/users",    userRoutes);

// ─── POS V1 Routes ───────────────────────────────────────────────────────────
app.use("/api/tables",   tableRoutes);
app.use("/api/menu",     menuRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/payments", paymentRoutes);

// ─── Inventory V1 Routes ─────────────────────────────────────────────────────
app.use("/api/ingredients",     ingredientRoutes);
app.use("/api/suppliers",       supplierRoutes);
app.use("/api/purchase-orders", purchaseRoutes);
app.use("/api/inventory",       inventoryRoutes);

// ─── Kitchen Dashboard V1 Routes ─────────────────────────────────────────────
app.use("/api/kitchen", kitchenRoutes);

// ─── CRM V1 Routes ───────────────────────────────────────────────────────────
app.use("/api/customers", customerRoutes);
app.use("/api/coupons",   couponRoutes);
app.use("/api/crm",       crmRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;
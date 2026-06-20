const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Restaurant Business Intelligence Platform API",
      version: "1.0.0",
      description:
        "Auth, RBAC (permission-based), and User Management endpoints. " +
        "Further modules (POS, Inventory, Kitchen, CRM, Analytics) will be added here as they're built.",
    },
    servers: [
      {
        url: "http://localhost:" + (process.env.PORT || 5000),
        description: "Local development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste the token returned from POST /api/auth/login",
        },
      },
    },
    tags: [
      { name: "Auth", description: "Login, current user, logout" },
      { name: "Users", description: "User management (branch-scoped, permission-gated)" },
    ],
  },
  // Scans these files for @openapi JSDoc comment blocks
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
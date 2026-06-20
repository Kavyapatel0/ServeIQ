require("dotenv").config();

const app = require("./app");
const { testConnection } = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Environment : ${process.env.NODE_ENV || "development"}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📖 API docs    : http://localhost:${PORT}/api/docs\n`);
  });
};

startServer();
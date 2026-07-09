require("dotenv").config();

const http = require("http");
const app = require("./app");
const { testConnection } = require("./config/db");
const { initSocket } = require("./sockets/socket");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await testConnection();

  // Create a raw HTTP server so Socket.IO can attach to the same port.
  // Express app remains unchanged — it handles all HTTP routes as before.
  const httpServer = http.createServer(app);

  // Attach Socket.IO to the HTTP server
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Environment : ${process.env.NODE_ENV || "development"}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📖 API docs    : http://localhost:${PORT}/api/docs`);
    console.log(`🔌 Socket.IO   : ws://localhost:${PORT}\n`);
  });
};

startServer();
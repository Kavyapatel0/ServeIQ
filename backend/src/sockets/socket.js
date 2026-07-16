/**
 * Socket.IO Initializer
 *
 * Single module responsible for:
 *   1. Creating and configuring the Socket.IO server
 *   2. Exporting `getIO()` so any service/controller can emit events
 *      without needing to pass `io` through every function call
 *   3. Defining all kitchen real-time event names as constants
 *
 * Kitchen Events (emitted by KitchenService on every status change):
 *
 *   order_sent_to_kitchen   — POS sends order → Kitchen queue updates
 *   order_preparing         — Chef starts cooking
 *   order_ready             — Food is ready → Waiter notified
 *   order_served            — Waiter served food
 *
 * How rooms work:
 *   Every connected client joins a room named after their branch:
 *     `branch_<branch_id>`
 *   This ensures events only reach the right kitchen screen, and
 *   the right waiter screen, without broadcasting to all branches.
 *
 * Usage (in any service or controller):
 *   const { getIO, KITCHEN_EVENTS } = require("../sockets/socket");
 *   getIO().to(`branch_${branch_id}`).emit(KITCHEN_EVENTS.ORDER_READY, payload);
 */

const { Server } = require("socket.io");

let io = null;

/**
 * Call once from server.js after the HTTP server is created.
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(","),
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    /**
     * Client must emit `join_branch` immediately after connecting,
     * sending their branch_id so we can put them in the right room.
     *
     * Frontend example:
     *   socket.emit("join_branch", { branch_id: 1 });
     */
    socket.on("join_branch", ({ branch_id }) => {
      if (!branch_id) return;
      const room = `branch_${branch_id}`;
      socket.join(room);
      console.log(`📌 Socket ${socket.id} joined room: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  console.log("🔌 Socket.IO initialized");
  return io;
};

/**
 * Returns the Socket.IO server instance.
 * Throws if called before initSocket().
 */
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized. Call initSocket() first.");
  }
  return io;
};

/**
 * Standardized event name constants.
 * Both the backend (emit) and frontend (on) must use these same strings.
 */
const KITCHEN_EVENTS = {
  ORDER_SENT_TO_KITCHEN: "order_sent_to_kitchen",
  ORDER_PREPARING:       "order_preparing",
  ORDER_READY:           "order_ready",
  ORDER_SERVED:          "order_served",
};

/**
 * Customer events — fired whenever CRM data changes that should
 * cause the Analytics → Customers tab to auto-refresh.
 */
const CUSTOMER_EVENTS = {
  CUSTOMER_REGISTERED: "customer_registered",
};

module.exports = { initSocket, getIO, KITCHEN_EVENTS, CUSTOMER_EVENTS };
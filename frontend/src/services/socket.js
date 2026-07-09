import { io } from "socket.io-client";
import { tokenStorage } from "./axios";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket = null;

/**
 * Lazily creates (or returns) the single shared Socket.IO client.
 * Actual `connect()` is deferred to the caller (SocketContext) so we
 * never open a socket before the user is authenticated and has a
 * branch_id to join.
 */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
    });
  }
  return socket;
}

export function joinBranchRoom(branchId) {
  if (!branchId) return;
  getSocket().emit("join_branch", { branch_id: branchId });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
}

// Re-exported so callers don't need to import both modules
export { tokenStorage };

import { createContext, useContext, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getSocket, joinBranchRoom, disconnectSocket } from "@/services/socket";

const SocketContext = createContext(null);

/**
 * Provides the shared Socket.IO client to the whole authenticated app.
 * Connection lifecycle is tied to auth state: connects + joins the
 * user's branch room on login, disconnects on logout. Kitchen/POS
 * pages (later phases) consume this via useSocket() and simply attach
 * their own `.on(...)` listeners — they never manage the connection.
 */
export function SocketProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const socket = socketRef.current;

    if (isAuthenticated && user?.branch_id) {
      if (!socket.connected) socket.connect();
      socket.on("connect", () => joinBranchRoom(user.branch_id));
      // Already connected from a previous mount (e.g. HMR) — join immediately
      if (socket.connected) joinBranchRoom(user.branch_id);
    } else {
      disconnectSocket();
    }

    return () => {
      socket.off("connect");
    };
  }, [isAuthenticated, user?.branch_id]);

  return <SocketContext.Provider value={socketRef.current}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
}

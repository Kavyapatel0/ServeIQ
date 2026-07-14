import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { useSocket } from "@/contexts/SocketContext";
import {
  setSocketConnected,
  patchOrderStatus,
  fetchKitchenOrders,
  fetchKitchenDashboard,
} from "@/redux/slices/kitchenSlice";

/**
 * Attaches kitchen-specific listeners to the single shared Socket.IO
 * connection (already connected + joined to the branch room by
 * SocketProvider on login — see contexts/SocketContext.jsx). This hook
 * never opens its own connection and never disconnects the shared
 * socket on unmount; it only adds/removes its own listeners.
 *
 * Event names and payloads must match backend/src/sockets/socket.js
 * (KITCHEN_EVENTS) exactly:
 *   order_sent_to_kitchen → { order_id, branch_id, timestamp }
 *     (no kitchen order row yet — the queue is refetched)
 *   order_preparing / order_ready / order_served →
 *     { kitchen_order_id, order_id, status, branch_id, updated_by, timestamp }
 */
export function useKitchenSocket() {
  const dispatch = useDispatch();
  const socket = useSocket();

  useEffect(() => {
    dispatch(setSocketConnected(socket.connected));

    const handleConnect = () => dispatch(setSocketConnected(true));
    const handleDisconnect = () => dispatch(setSocketConnected(false));

    // A brand-new order has no Kitchen_Orders row info in the payload
    // yet (just the order_id) — refetching the queue + counters is
    // simpler and just as fast as reconstructing a card client-side.
    const handleNewOrder = () => {
      dispatch(fetchKitchenOrders());
      dispatch(fetchKitchenDashboard());
    };

    const handleStatusEvent = ({ kitchen_order_id, status }) => {
      dispatch(patchOrderStatus({ id: kitchen_order_id, status }));
      dispatch(fetchKitchenDashboard());
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("order_sent_to_kitchen", handleNewOrder);
    socket.on("order_preparing", handleStatusEvent);
    socket.on("order_ready", handleStatusEvent);
    socket.on("order_served", handleStatusEvent);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("order_sent_to_kitchen", handleNewOrder);
      socket.off("order_preparing", handleStatusEvent);
      socket.off("order_ready", handleStatusEvent);
      socket.off("order_served", handleStatusEvent);
    };
  }, [socket, dispatch]);
}
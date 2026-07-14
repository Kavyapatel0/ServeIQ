import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import { usePermission } from "@/hooks/usePermission";
import { useDebounce } from "@/hooks/useDebounce";
import { useKitchenSocket } from "@/hooks/useKitchenSocket";
import { PERMISSIONS } from "@/constants/permissions";

import {
  fetchKitchenOrders,
  fetchKitchenDashboard,
  advanceOrderStatus,
  selectKitchenOrders,
  selectKitchenStatus,
  selectKitchenError,
  selectSocketConnected,
  selectUpdatingId,
  selectKitchenDashboard,
} from "@/redux/slices/kitchenSlice";

import { KitchenHeader } from "@/components/kitchen/KitchenHeader";
import { KitchenStats } from "@/components/kitchen/KitchenStats";
import { KitchenFilters } from "@/components/kitchen/KitchenFilters";
import { KitchenBoard } from "@/components/kitchen/KitchenBoard";
import { EmptyKitchen } from "@/components/kitchen/EmptyKitchen";
import { OrderDetailDialog } from "@/components/kitchen/OrderDetailDialog";
import { ErrorState } from "@/components/common/ErrorState";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";

/**
 * The Kanban-style Kitchen Display System. Real-time updates arrive
 * over the shared Socket.IO connection (useKitchenSocket); this page
 * still fetches once on mount and exposes a manual Refresh for the
 * rare case a client missed an event while reconnecting.
 */
export function KitchenPage() {
  const dispatch = useDispatch();
  const { can } = usePermission();

  const canUpdateStatus = can(PERMISSIONS.KITCHEN_UPDATE_STATUS); // Chef/Manager/Admin
  const canServe = can(PERMISSIONS.KITCHEN_VIEW); // Waiter can mark READY → SERVED

  // A given card's next transition depends on ITS current status, not
  // just on role — READY→SERVED is allowed for canServe, everything
  // else needs canUpdateStatus.
  const canAdvance = useCallback(
    (status) => (status === "READY" ? canServe || canUpdateStatus : canUpdateStatus),
    [canServe, canUpdateStatus]
  );

  useKitchenSocket();

  const orders = useSelector(selectKitchenOrders);
  const status = useSelector(selectKitchenStatus);
  const error = useSelector(selectKitchenError);
  const socketConnected = useSelector(selectSocketConnected);
  const updatingId = useSelector(selectUpdatingId);
  const dashboard = useSelector(selectKitchenDashboard);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState("oldest");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const loadOrders = useCallback(() => {
    dispatch(
      fetchKitchenOrders({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: debouncedSearch || undefined,
        sort,
      })
    );
  }, [dispatch, statusFilter, debouncedSearch, sort]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    dispatch(fetchKitchenDashboard());
  }, [dispatch]);

  const handleStatusChange = (order, targetStatus) => {
    dispatch(advanceOrderStatus({ id: order.id, targetStatus }))
      .unwrap()
      .then(() => {
        toast.success(`Order ${order.order_number} → ${targetStatus}`);
        dispatch(fetchKitchenDashboard());
      })
      .catch((err) => {
        toast.error(err?.message || "Couldn't update order status.");
      });
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const hasActiveFilters = statusFilter !== "ALL" || debouncedSearch.length > 0;
  const clearFilters = () => {
    setStatusFilter("ALL");
    setSearch("");
  };

  const isLoading = status === "loading" || status === "idle";
  const isFailed = status === "failed";
  const isEmpty = status === "succeeded" && orders.length === 0;

  return (
    <div className="space-y-6">
      <KitchenHeader socketConnected={socketConnected} onRefresh={loadOrders} refreshing={isLoading} />

      <KitchenStats data={dashboard.data} status={dashboard.status} />

      <KitchenFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sort={sort}
        onSortChange={setSort}
      />

      {isFailed ? (
        <ErrorState message={error || "Couldn't load the kitchen queue."} onRetry={loadOrders} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <WidgetSkeleton key={i} rows={3} className="h-28" />
          ))}
        </div>
      ) : isEmpty ? (
        <EmptyKitchen hasFilters={hasActiveFilters} onClearFilters={clearFilters} />
      ) : (
        <KitchenBoard
          orders={orders}
          onStatusChange={handleStatusChange}
          onOpenDetails={handleOpenDetails}
          updatingId={updatingId}
          canAdvance={canAdvance}
        />
      )}

      <OrderDetailDialog order={selectedOrder} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}
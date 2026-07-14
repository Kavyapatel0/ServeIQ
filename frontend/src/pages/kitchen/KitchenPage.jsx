import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

import { KitchenHeader }      from "@/components/kitchen/KitchenHeader";
import { KitchenStats }       from "@/components/kitchen/KitchenStats";
import { KitchenFilters }     from "@/components/kitchen/KitchenFilters";
import { KitchenBoard }       from "@/components/kitchen/KitchenBoard";
import { EmptyKitchen }       from "@/components/kitchen/EmptyKitchen";
import { OrderDetailDialog }  from "@/components/kitchen/OrderDetailDialog";
import { ErrorState }         from "@/components/common/ErrorState";

export function KitchenPage() {
  const dispatch = useDispatch();
  const { can } = usePermission();

  const canUpdateStatus = can(PERMISSIONS.KITCHEN_UPDATE_STATUS);
  const canServe        = can(PERMISSIONS.KITCHEN_VIEW);

  const canAdvance = useCallback(
    (status) => (status === "READY" ? canServe || canUpdateStatus : canUpdateStatus),
    [canServe, canUpdateStatus]
  );

  useKitchenSocket();

  const orders         = useSelector(selectKitchenOrders);
  const status         = useSelector(selectKitchenStatus);
  const error          = useSelector(selectKitchenError);
  const socketConnected = useSelector(selectSocketConnected);
  const updatingId     = useSelector(selectUpdatingId);
  const dashboard      = useSelector(selectKitchenDashboard);

  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("ALL");
  const [sort,          setSort]          = useState("oldest");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen,    setDetailOpen]    = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const loadOrders = useCallback(() => {
    dispatch(fetchKitchenOrders({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: debouncedSearch || undefined,
      sort,
    }));
  }, [dispatch, statusFilter, debouncedSearch, sort]);

  useEffect(() => { loadOrders(); },              [loadOrders]);
  useEffect(() => { dispatch(fetchKitchenDashboard()); }, [dispatch]);

  const handleStatusChange = (order, targetStatus) => {
    dispatch(advanceOrderStatus({ id: order.id, targetStatus }))
      .unwrap()
      .then(() => {
        toast.success(`Order ${order.order_number} → ${targetStatus}`);
        dispatch(fetchKitchenDashboard());
      })
      .catch((err) => toast.error(err?.message || "Couldn't update order status."));
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const hasActiveFilters = statusFilter !== "ALL" || debouncedSearch.length > 0;
  const isLoading = status === "loading" || status === "idle";
  const isFailed  = status === "failed";
  const isEmpty   = status === "succeeded" && orders.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      {/* Header */}
      <KitchenHeader
        socketConnected={socketConnected}
        onRefresh={loadOrders}
        refreshing={isLoading}
      />

      {/* Stats row */}
      <KitchenStats data={dashboard.data} status={dashboard.status} />

      {/* Filters */}
      <KitchenFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sort={sort}
        onSortChange={setSort}
      />

      {/* Board */}
      {isFailed ? (
        <ErrorState
          message={error || "Couldn't load the kitchen queue."}
          onRetry={loadOrders}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-card bg-warm-200"
              style={{ opacity: 1 - i * 0.1 }}
            />
          ))}
        </div>
      ) : isEmpty ? (
        <EmptyKitchen
          hasFilters={hasActiveFilters}
          onClearFilters={() => { setStatusFilter("ALL"); setSearch(""); }}
        />
      ) : (
        <KitchenBoard
          orders={orders}
          onStatusChange={handleStatusChange}
          onOpenDetails={handleOpenDetails}
          updatingId={updatingId}
          canAdvance={canAdvance}
        />
      )}

      {/* Detail dialog */}
      <OrderDetailDialog
        order={selectedOrder}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </motion.div>
  );
}

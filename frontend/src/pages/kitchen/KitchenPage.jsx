import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { usePermission }    from "@/hooks/usePermission";
import { useDebounce }      from "@/hooks/useDebounce";
import { useKitchenSocket } from "@/hooks/useKitchenSocket";
import { PERMISSIONS }      from "@/constants/permissions";

import {
  fetchKitchenOrders, fetchKitchenDashboard, advanceOrderStatus,
  selectKitchenOrders, selectKitchenStatus, selectKitchenError,
  selectSocketConnected, selectUpdatingId, selectKitchenDashboard,
} from "@/redux/slices/kitchenSlice";

import { KitchenHeader }     from "@/components/kitchen/KitchenHeader";
import { KitchenStats }      from "@/components/kitchen/KitchenStats";
import { KitchenFilters }    from "@/components/kitchen/KitchenFilters";
import { KitchenBoard }      from "@/components/kitchen/KitchenBoard";
import { OrderDetailDialog } from "@/components/kitchen/OrderDetailDialog";
import { ErrorState }        from "@/components/common/ErrorState";
import { cn }                from "@/utils/cn";

const STATUS_TABS = [
  { id: "ALL",       label: "All Orders"    },
  { id: "PENDING",   label: "Pending"       },
  { id: "PREPARING", label: "Preparing"     },
  { id: "READY",     label: "Ready"         },
  { id: "SERVED",    label: "Served"        },
];

export function KitchenPage() {
  const dispatch = useDispatch();
  const { can }  = usePermission();

  const canUpdateStatus = can(PERMISSIONS.KITCHEN_UPDATE_STATUS);
  const canServe        = can(PERMISSIONS.KITCHEN_VIEW);
  const canAdvance      = useCallback(
    (status) => (status === "READY" ? canServe || canUpdateStatus : canUpdateStatus),
    [canServe, canUpdateStatus]
  );

  useKitchenSocket();

  const orders          = useSelector(selectKitchenOrders);
  const status          = useSelector(selectKitchenStatus);
  const error           = useSelector(selectKitchenError);
  const socketConnected = useSelector(selectSocketConnected);
  const updatingId      = useSelector(selectUpdatingId);
  const dashboard       = useSelector(selectKitchenDashboard);

  const [search,       setSearch]       = useState("");
  const [activeTab,    setActiveTab]    = useState("ALL");
  const [sort,         setSort]         = useState("oldest");
  const [selectedOrder,setSelectedOrder]= useState(null);
  const [detailOpen,   setDetailOpen]   = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const loadOrders = useCallback(() => {
    dispatch(fetchKitchenOrders({
      status: activeTab === "ALL" ? undefined : activeTab,
      search: debouncedSearch || undefined,
      sort,
    }));
  }, [dispatch, activeTab, debouncedSearch, sort]);

  useEffect(() => { loadOrders(); },                      [loadOrders]);
  useEffect(() => { dispatch(fetchKitchenDashboard()); }, [dispatch]);

  const handleStatusChange = (order, targetStatus) => {
    dispatch(advanceOrderStatus({ id: order.id, targetStatus }))
      .unwrap()
      .then(() => {
        toast.success(`Order ${order.order_number} → ${targetStatus}`);
        dispatch(fetchKitchenDashboard());
      })
      .catch(err => toast.error(err?.message || "Couldn't update order status."));
  };

  const handleOpenDetails = (order) => { setSelectedOrder(order); setDetailOpen(true); };

  const isLoading = status === "loading" || status === "idle";
  const isFailed  = status === "failed";

  // counts for tab badges
  const counts = STATUS_TABS.reduce((acc, t) => {
    acc[t.id] = t.id === "ALL"
      ? orders.length
      : orders.filter(o => o.status === t.id).length;
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-5"
    >
      {/* Header */}
      <KitchenHeader
        socketConnected={socketConnected}
        onRefresh={loadOrders}
        refreshing={isLoading}
      />

      {/* Stats row */}
      <KitchenStats data={dashboard.data} status={dashboard.status} />

      {/* ── Status tabs + search/sort ──────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tab pills */}
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-warm-200 bg-warm-100 p-1 scrollbar-thin">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all",
                activeTab === tab.id
                  ? "bg-surface text-primary-600 shadow-soft"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface/60"
              )}
            >
              {tab.label}
              {counts[tab.id] > 0 && (
                <span className={cn(
                  "flex h-4.5 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                  activeTab === tab.id ? "bg-primary-500 text-white" : "bg-warm-300 text-warm-700"
                )}
                  style={{ minWidth: "18px", height: "18px" }}
                >
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + sort */}
        <KitchenFilters
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
        />
      </div>

      {/* ── Board ─────────────────────────────────────────── */}
      {isFailed ? (
        <ErrorState message={error || "Couldn't load the kitchen queue."} onRetry={loadOrders} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-card bg-warm-200" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      ) : (
        <KitchenBoard
          orders={orders}
          onStatusChange={handleStatusChange}
          onOpenDetails={handleOpenDetails}
          updatingId={updatingId}
          canAdvance={canAdvance}
          filterStatus={activeTab}
        />
      )}

      <OrderDetailDialog order={selectedOrder} open={detailOpen} onOpenChange={setDetailOpen} />
    </motion.div>
  );
}

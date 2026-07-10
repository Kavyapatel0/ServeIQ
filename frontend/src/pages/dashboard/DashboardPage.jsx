import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DollarSign, ShoppingBag, ChefHat, Armchair } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/constants/permissions";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { formatCurrency, formatNumber } from "@/utils/format";

import {
  fetchRevenue,
  fetchDailySales,
  fetchTopItems,
  fetchKitchenDashboard,
  fetchInventoryDashboard,
  fetchLowStock,
  fetchRecentOrders,
  fetchTables,
  selectRevenue,
  selectDailySales,
  selectTopItems,
  selectKitchen,
  selectInventory,
  selectLowStock,
  selectRecentOrders,
  selectTables,
} from "@/redux/slices/dashboardSlice";

import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { KitchenStatusCard } from "@/components/dashboard/KitchenStatusCard";
import { InventoryAlertCard } from "@/components/dashboard/InventoryAlertCard";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { TopSellingCard } from "@/components/dashboard/TopSellingCard";
import { BranchCard } from "@/components/dashboard/BranchCard";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";

/**
 * Phase 3 dashboard. Every widget below is permission-gated: a role
 * that lacks the relevant permission never dispatches that fetch and
 * never renders that card, so a Chef's dashboard genuinely looks
 * different from a Branch Manager's rather than showing empty/403'd
 * widgets.
 */
export function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { can } = usePermission();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const canAnalytics = can(PERMISSIONS.ANALYTICS_VIEW);
  const canKitchen = can(PERMISSIONS.KITCHEN_VIEW) || can(PERMISSIONS.KITCHEN_UPDATE_STATUS);
  const canInventory = can(PERMISSIONS.INVENTORY_VIEW) || can(PERMISSIONS.INVENTORY_MANAGE);
  const canOrders = can(PERMISSIONS.ORDERS_VIEW);
  const canTables = can(PERMISSIONS.TABLES_VIEW);

  const revenue = useSelector(selectRevenue);
  const dailySales = useSelector(selectDailySales);
  const topItems = useSelector(selectTopItems);
  const kitchen = useSelector(selectKitchen);
  const inventory = useSelector(selectInventory);
  const lowStock = useSelector(selectLowStock);
  const recentOrders = useSelector(selectRecentOrders);
  const tables = useSelector(selectTables);

  useEffect(() => {
    if (canAnalytics) {
      dispatch(fetchRevenue());
      dispatch(fetchDailySales());
      dispatch(fetchTopItems());
    }
    if (canKitchen) dispatch(fetchKitchenDashboard());
    if (canInventory) {
      dispatch(fetchInventoryDashboard());
      dispatch(fetchLowStock());
    }
    if (canOrders) dispatch(fetchRecentOrders());
    if (canTables) dispatch(fetchTables());
    // Permission booleans are stable per session — safe to treat like a mount-only effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, canAnalytics, canKitchen, canInventory, canOrders, canTables]);

  const availableTables = useMemo(
    () => (tables.data || []).filter((t) => t.status === "AVAILABLE").length,
    [tables.data]
  );
  const kitchenQueue = kitchen.data ? kitchen.data.pending + kitchen.data.preparing : null;

  const stats = [
    canAnalytics && {
      label: "Today's Revenue",
      value: revenue.status === "succeeded" ? formatCurrency(revenue.data?.total_revenue) : "—",
      icon: DollarSign,
      accent: "brand",
      trend:
        revenue.data?.revenue_change_pct != null
          ? {
              value: `${Math.abs(revenue.data.revenue_change_pct)}%`,
              direction: revenue.data.revenue_change_pct >= 0 ? "up" : "down",
            }
          : undefined,
    },
    canAnalytics && {
      label: "Today's Orders",
      value: revenue.status === "succeeded" ? formatNumber(revenue.data?.total_orders) : "—",
      icon: ShoppingBag,
      accent: "info",
    },
    canKitchen && {
      label: "Kitchen Queue",
      value: kitchen.status === "succeeded" ? formatNumber(kitchenQueue) : "—",
      icon: ChefHat,
      accent: "warning",
    },
    canTables && {
      label: "Available Tables",
      value: tables.status === "succeeded" ? formatNumber(availableTables) : "—",
      icon: Armchair,
      accent: "success",
    },
  ].filter(Boolean);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's what's happening across your restaurant today."
      />

      {stats.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {canAnalytics && (
          <RevenueChart
            data={dailySales.data}
            status={dailySales.status}
            error={dailySales.error}
            onRetry={() => dispatch(fetchDailySales())}
          />
        )}

        {canKitchen && (
          <KitchenStatusCard
            data={kitchen.data}
            status={kitchen.status}
            error={kitchen.error}
            onRetry={() => dispatch(fetchKitchenDashboard())}
          />
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {canOrders && (
          <RecentOrdersTable
            data={recentOrders.data}
            status={recentOrders.status}
            error={recentOrders.error}
            onRetry={() => dispatch(fetchRecentOrders())}
          />
        )}

        {canAnalytics && (
          <TopSellingCard
            data={topItems.data}
            status={topItems.status}
            error={topItems.error}
            onRetry={() => dispatch(fetchTopItems())}
          />
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {canInventory && (
          <InventoryAlertCard
            data={lowStock.data}
            status={lowStock.status}
            error={lowStock.error}
            onRetry={() => dispatch(fetchLowStock())}
          />
        )}

        {canTables && (
          <BranchCard
            user={user}
            tables={tables.data}
            tablesStatus={tables.status}
            kitchen={kitchen.data}
            inventory={inventory.data}
          />
        )}
      </div>

      <div className="mt-6">
        <QuickActionCard />
      </div>
    </div>
  );
}
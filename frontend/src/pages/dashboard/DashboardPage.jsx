import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  DollarSign, ShoppingBag, ChefHat, Armchair,
  TrendingUp, Package, Users, Clock, BarChart3,
  ArrowRight, RefreshCw, Utensils,
} from "lucide-react";
import { motion } from "framer-motion";

import { useAuth }       from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS, ROLES } from "@/constants/permissions";
import { ROUTES }        from "@/constants/routes";
import { PageHeader }    from "@/components/common/PageHeader";
import { StatCard }      from "@/components/common/StatCard";
import { formatCurrency, formatNumber } from "@/utils/format";
import { cn }            from "@/utils/cn";

import {
  fetchRevenue, fetchDailySales, fetchTopItems,
  fetchKitchenDashboard, fetchInventoryDashboard, fetchLowStock,
  fetchRecentOrders, fetchTables,
  selectRevenue, selectDailySales, selectTopItems, selectKitchen,
  selectInventory, selectLowStock, selectRecentOrders, selectTables,
} from "@/redux/slices/dashboardSlice";

import { RevenueChart }      from "@/components/dashboard/RevenueChart";
import { KitchenStatusCard } from "@/components/dashboard/KitchenStatusCard";
import { InventoryAlertCard }from "@/components/dashboard/InventoryAlertCard";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { TopSellingCard }    from "@/components/dashboard/TopSellingCard";
import { BranchCard }        from "@/components/dashboard/BranchCard";
import { QuickActionCard }   from "@/components/dashboard/QuickActionCard";

export function DashboardPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user, bootstrapped } = useAuth();
  const { can }   = usePermission();

  const firstName    = user?.name?.split(" ")[0] ?? "there";
  const role         = user?.role ?? "";

  const canAnalytics = can(PERMISSIONS.ANALYTICS_VIEW);
  const canKitchen   = can(PERMISSIONS.KITCHEN_VIEW) || can(PERMISSIONS.KITCHEN_UPDATE_STATUS);
  const canInventory = can(PERMISSIONS.INVENTORY_VIEW) || can(PERMISSIONS.INVENTORY_MANAGE);
  const canOrders    = can(PERMISSIONS.ORDERS_VIEW);
  const canTables    = can(PERMISSIONS.TABLES_VIEW);
  const canCRM       = can(PERMISSIONS.CRM_VIEW) || can(PERMISSIONS.CRM_MANAGE);

  const revenue      = useSelector(selectRevenue);
  const dailySales   = useSelector(selectDailySales);
  const topItems     = useSelector(selectTopItems);
  const kitchen      = useSelector(selectKitchen);
  const inventory    = useSelector(selectInventory);
  const lowStock     = useSelector(selectLowStock);
  const recentOrders = useSelector(selectRecentOrders);
  const tables       = useSelector(selectTables);

  // Wait until bootstrap so no 401 flash on initial page load
  useEffect(() => {
    if (!bootstrapped) return;
    if (canAnalytics) {
      dispatch(fetchRevenue());
      dispatch(fetchDailySales());
      dispatch(fetchTopItems());
    }
    if (canKitchen)   dispatch(fetchKitchenDashboard());
    if (canInventory) { dispatch(fetchInventoryDashboard()); dispatch(fetchLowStock()); }
    if (canOrders)    dispatch(fetchRecentOrders());
    if (canTables)    dispatch(fetchTables());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, bootstrapped]);

  const availableTables = useMemo(
    () => (tables.data || []).filter(t => t.status === "AVAILABLE").length,
    [tables.data]
  );
  const kitchenQueue = kitchen.data
    ? kitchen.data.pending + kitchen.data.preparing : null;

  // ── Build stat cards based on what each role can see ─────────────
  const stats = [
    canAnalytics && {
      label:  "Today's Revenue",
      value:  revenue.status === "succeeded" ? formatCurrency(revenue.data?.total_revenue ?? 0) : "—",
      icon:   DollarSign,
      accent: "accent",
      trend:  revenue.data?.revenue_change_pct != null ? {
        value:     `${Math.abs(revenue.data.revenue_change_pct).toFixed(1)}%`,
        direction: revenue.data.revenue_change_pct >= 0 ? "up" : "down",
      } : undefined,
    },
    canAnalytics && {
      label:  "Today's Orders",
      value:  revenue.status === "succeeded" ? formatNumber(revenue.data?.total_orders ?? 0) : "—",
      icon:   ShoppingBag,
      accent: "brand",
    },
    canKitchen && {
      label:  "Kitchen Queue",
      value:  kitchen.status === "succeeded" ? formatNumber(kitchenQueue ?? 0) : "—",
      icon:   ChefHat,
      accent: "warning",
    },
    canTables && {
      label:  "Available Tables",
      value:  tables.status === "succeeded" ? formatNumber(availableTables) : "—",
      icon:   Armchair,
      accent: "success",
    },
  ].filter(Boolean);

  const ROLE_GREETING = {
    [ROLES.SUPER_ADMIN]:        "Good to see you. Here's your platform overview.",
    [ROLES.BRANCH_MANAGER]:     "Here's your branch snapshot for today.",
    [ROLES.CASHIER]:            "Ready to take orders? Here's today's quick summary.",
    [ROLES.CHEF]:               "Kitchen briefing — here's what's on for today.",
    [ROLES.WAITER]:             "Table and order status at a glance.",
    [ROLES.INVENTORY_MANAGER]:  "Stock and supply overview for today.",
  };
  const greeting = ROLE_GREETING[role] ?? "Here's what's happening across your restaurant today.";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={greeting}
        actions={
          <button
            onClick={() => { window.location.reload(); }}
            className="flex items-center gap-1.5 rounded-xl border border-warm-200 bg-surface px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-warm-100 hover:text-text-primary"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        }
      />

      {/* ── Stat strip ─────────────────────────────────────────── */}
      {stats.length > 0 && (
        <div className={cn(
          "grid gap-4",
          stats.length === 4 ? "grid-cols-2 lg:grid-cols-4" :
          stats.length === 3 ? "grid-cols-1 sm:grid-cols-3" :
          stats.length === 2 ? "grid-cols-2" : "grid-cols-1"
        )}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Quick Actions (always shown, permission-filtered) ──── */}
      <QuickActionCard />

      {/* ── Role-tailored main layout ───────────────────────────── */}
      <RoleLayout
        role={role}
        canAnalytics={canAnalytics}
        canKitchen={canKitchen}
        canInventory={canInventory}
        canOrders={canOrders}
        canTables={canTables}
        canCRM={canCRM}
        dispatch={dispatch}
        navigate={navigate}
        dailySales={dailySales}
        kitchen={kitchen}
        lowStock={lowStock}
        recentOrders={recentOrders}
        topItems={topItems}
        inventory={inventory}
        tables={tables}
        user={user}
      />
    </div>
  );
}

// ─── Role-aware layout component ────────────────────────────────────────────
function RoleLayout({
  role, canAnalytics, canKitchen, canInventory, canOrders, canTables, canCRM,
  dispatch, navigate,
  dailySales, kitchen, lowStock, recentOrders, topItems, inventory, tables, user,
}) {
  // Super Admin & Branch Manager: full BI layout
  if (canAnalytics) {
    return (
      <>
        {/* Revenue chart (2/3) + Kitchen status (1/3) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <RevenueChart
            data={dailySales.data} status={dailySales.status} error={dailySales.error}
            onRetry={() => dispatch(fetchDailySales())}
          />
          {canKitchen && (
            <KitchenStatusCard
              data={kitchen.data} status={kitchen.status} error={kitchen.error}
              onRetry={() => dispatch(fetchKitchenDashboard())}
            />
          )}
          {!canKitchen && (
            <TopSellingCard
              data={topItems.data} status={topItems.status} error={topItems.error}
              onRetry={() => dispatch(fetchTopItems())}
            />
          )}
        </div>
        {/* Recent orders + Top selling */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {canOrders && (
            <RecentOrdersTable
              data={recentOrders.data} status={recentOrders.status} error={recentOrders.error}
              onRetry={() => dispatch(fetchRecentOrders())}
            />
          )}
          <TopSellingCard
            data={topItems.data} status={topItems.status} error={topItems.error}
            onRetry={() => dispatch(fetchTopItems())}
          />
        </div>
        {/* Inventory alerts + Branch overview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {canInventory && (
            <InventoryAlertCard
              data={lowStock.data} status={lowStock.status} error={lowStock.error}
              onRetry={() => dispatch(fetchLowStock())}
            />
          )}
          {canTables && (
            <BranchCard
              user={user} tables={tables.data} tablesStatus={tables.status}
              kitchen={kitchen.data} inventory={inventory.data}
            />
          )}
        </div>
      </>
    );
  }

  // Cashier: POS-focused layout
  if (role === ROLES.CASHIER) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {canOrders && (
          <RecentOrdersTable
            data={recentOrders.data} status={recentOrders.status} error={recentOrders.error}
            onRetry={() => dispatch(fetchRecentOrders())}
          />
        )}
        <CashierRightPanel tables={tables} navigate={navigate} />
      </div>
    );
  }

  // Chef: Kitchen-focused layout
  if (role === ROLES.CHEF) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <KitchenStatusCard
          data={kitchen.data} status={kitchen.status} error={kitchen.error}
          onRetry={() => dispatch(fetchKitchenDashboard())}
        />
        <ChefTipsPanel navigate={navigate} />
      </div>
    );
  }

  // Waiter: Table + Orders layout
  if (role === ROLES.WAITER) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {canOrders && (
          <RecentOrdersTable
            data={recentOrders.data} status={recentOrders.status} error={recentOrders.error}
            onRetry={() => dispatch(fetchRecentOrders())}
          />
        )}
        {canTables && (
          <BranchCard
            user={user} tables={tables.data} tablesStatus={tables.status}
            kitchen={kitchen.data} inventory={inventory.data}
          />
        )}
      </div>
    );
  }

  // Inventory Manager: Stock-focused layout
  if (role === ROLES.INVENTORY_MANAGER) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InventoryAlertCard
          data={lowStock.data} status={lowStock.status} error={lowStock.error}
          onRetry={() => dispatch(fetchLowStock())}
        />
        <InventoryStatsPanel inventory={inventory} navigate={navigate} />
      </div>
    );
  }

  // Fallback: show whatever is available
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {canOrders && (
        <RecentOrdersTable
          data={recentOrders.data} status={recentOrders.status} error={recentOrders.error}
          onRetry={() => dispatch(fetchRecentOrders())}
        />
      )}
      {canKitchen && (
        <KitchenStatusCard
          data={kitchen.data} status={kitchen.status} error={kitchen.error}
          onRetry={() => dispatch(fetchKitchenDashboard())}
        />
      )}
    </div>
  );
}

// ─── Cashier right panel ─────────────────────────────────────────────────────
function CashierRightPanel({ tables, navigate }) {
  const available = (tables.data || []).filter(t => t.status === "AVAILABLE");
  const occupied  = (tables.data || []).filter(t => t.status === "OCCUPIED");

  const quick = [
    { label: "New Order",     icon: Utensils,   path: ROUTES.POS,       color: "bg-primary-500 text-white" },
    { label: "View Orders",   icon: ShoppingBag,path: ROUTES.POS,       color: "bg-accent-100 text-accent-700" },
    { label: "Customers",     icon: Users,      path: ROUTES.CRM,       color: "bg-info-bg text-info" },
    { label: "Analytics",     icon: BarChart3,  path: ROUTES.ANALYTICS, color: "bg-success-bg text-success" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Quick actions */}
      <div className="rounded-card border border-warm-200 bg-surface p-5 card-shadow">
        <h3 className="mb-3 text-sm font-semibold text-text-primary">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {quick.map(q => (
            <button
              key={q.label}
              onClick={() => navigate(q.path)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-semibold transition-all hover:opacity-90",
                q.color
              )}
            >
              <q.icon className="h-4 w-4" strokeWidth={1.75} />
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table status mini view */}
      <div className="rounded-card border border-warm-200 bg-surface p-5 card-shadow">
        <h3 className="mb-3 text-sm font-semibold text-text-primary flex items-center justify-between">
          Table Status
          <button onClick={() => navigate(ROUTES.KITCHEN)} className="text-xs font-medium text-primary-600 hover:text-primary-700">
            View Kitchen →
          </button>
        </h3>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1 rounded-xl bg-success-bg px-3 py-2.5 text-center">
            <p className="text-2xl font-bold text-success-text tabular-nums">{available.length}</p>
            <p className="text-[11px] text-success-text/70 font-medium">Available</p>
          </div>
          <div className="flex-1 rounded-xl bg-danger-bg px-3 py-2.5 text-center">
            <p className="text-2xl font-bold text-danger-text tabular-nums">{occupied.length}</p>
            <p className="text-[11px] text-danger-text/70 font-medium">Occupied</p>
          </div>
          <div className="flex-1 rounded-xl bg-warm-100 px-3 py-2.5 text-center">
            <p className="text-2xl font-bold text-text-primary tabular-nums">{(tables.data || []).length}</p>
            <p className="text-[11px] text-text-secondary font-medium">Total</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(tables.data || []).slice(0, 16).map(t => (
            <span
              key={t.id}
              className={cn(
                "rounded-lg px-2 py-1 text-[11px] font-bold",
                t.status === "AVAILABLE"  && "bg-success-bg text-success-text",
                t.status === "OCCUPIED"   && "bg-danger-bg text-danger-text",
                t.status === "CLEANING"   && "bg-info-bg text-info-text",
                t.status === "RESERVED"   && "bg-warning-bg text-warning-text",
              )}
            >
              {t.table_number ?? t.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Chef tips panel ─────────────────────────────────────────────────────────
function ChefTipsPanel({ navigate }) {
  const tips = [
    { label: "Check pending orders regularly", icon: Clock },
    { label: "Update order status promptly",   icon: RefreshCw },
    { label: "Mark items ready as soon as done", icon: ChefHat },
    { label: "Review today's top items",        icon: TrendingUp },
  ];
  return (
    <div className="rounded-card border border-warm-200 bg-surface p-5 card-shadow">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">Kitchen Workflow Tips</h3>
      <div className="space-y-3 mb-5">
        {tips.map(t => (
          <div key={t.label} className="flex items-center gap-3 rounded-xl bg-warm-50 border border-warm-100 px-3 py-2.5">
            <t.icon className="h-4 w-4 shrink-0 text-primary-500" strokeWidth={1.75} />
            <span className="text-sm text-text-secondary">{t.label}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate(ROUTES.KITCHEN)}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-colors"
        style={{ background: "linear-gradient(135deg,#355c4b,#28473a)" }}
      >
        <ChefHat className="h-4 w-4" />
        Open Kitchen Dashboard
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Inventory stats panel ───────────────────────────────────────────────────
function InventoryStatsPanel({ inventory, navigate }) {
  const d = inventory.data;
  const rows = [
    { label: "Total Ingredients",   value: d?.total_ingredients ?? "—",    color: "text-primary-600" },
    { label: "Low Stock Items",     value: d?.low_stock_count ?? "—",       color: "text-warning" },
    { label: "Out of Stock",        value: d?.out_of_stock_count ?? "—",    color: "text-danger" },
    { label: "Today's PO Activity", value: d?.todays_transaction_count ?? "—", color: "text-info" },
  ];
  return (
    <div className="rounded-card border border-warm-200 bg-surface p-5 card-shadow">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">Inventory Overview</h3>
      {inventory.status === "loading" || inventory.status === "idle" ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-10 animate-pulse rounded-xl bg-warm-200" />)}
        </div>
      ) : (
        <div className="space-y-2.5 mb-5">
          {rows.map(r => (
            <div key={r.label} className="flex items-center justify-between rounded-xl bg-warm-50 border border-warm-100 px-4 py-3">
              <span className="text-sm text-text-secondary">{r.label}</span>
              <span className={cn("text-lg font-bold tabular-nums", r.color)}>{r.value}</span>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => navigate(ROUTES.INVENTORY)}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-colors"
        style={{ background: "linear-gradient(135deg,#355c4b,#28473a)" }}
      >
        <Package className="h-4 w-4" />
        Open Inventory Module
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, ShoppingBag, TrendingUp, Users, Clock,
  BarChart3, Utensils, CreditCard,
} from "lucide-react";

import { PageHeader }  from "@/components/common/PageHeader";
import { StatCard }    from "@/components/common/StatCard";
import { EmptyState }  from "@/components/common/EmptyState";
import { formatCurrency, formatNumber } from "@/utils/format";
import { cn }          from "@/utils/cn";
import {
  getAnalyticsOverview, getSalesSummary, getDailySales, getMonthlySales,
  getPeakHours, getTopSellingItems, getPaymentMethodReport,
  getCustomerAnalytics,
} from "@/services/analyticsApi";
import { getCustomers } from "@/services/crmApi";

/* ── Premium coordinated chart palette ──────────────────────────────── */
const CHART_COLORS = [
  "#355c4b",  // primary green  — revenue
  "#c46a2d",  // warm amber     — expenses
  "#7a9e6e",  // muted olive    — orders
  "#8b6b4a",  // earth brown    — inventory
  "#4d7a62",  /* deep green    — customers */
  "#e8c3a9",  // warm beige     — payments
];

const TABS = [
  { id: "overview",  label: "Overview",  icon: BarChart3  },
  { id: "sales",     label: "Sales",     icon: TrendingUp },
  { id: "business",  label: "Business",  icon: Utensils   },
  { id: "customers", label: "Customers", icon: Users      },
];

const DATE_RANGES = [
  { label: "7 Days",  value: "7d"  },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
];

function getDateParams(range) {
  const end   = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (range === "7d" ? 7 : range === "30d" ? 30 : 90));
  return {
    start_date: start.toISOString().split("T")[0],
    end_date:   end.toISOString().split("T")[0],
  };
}

/* ── Custom tooltip shared across charts ────────────────────────────── */
function PremiumTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-warm-200 bg-surface px-4 py-3 shadow-elevated">
      {label && <p className="mb-1 text-xs font-semibold text-text-secondary">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold text-text-primary">
          {formatter ? formatter(p.value, p.name) : `${p.name}: ${p.value}`}
        </p>
      ))}
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────────── */
export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30d");

  return (
    <div>
      <PageHeader
        eyebrow="Business Intelligence"
        title="Analytics"
        description="Revenue, sales trends, peak hours, and top-selling items."
        actions={
          <div className="flex gap-1 rounded-xl border border-warm-200 bg-warm-100 p-1">
            {DATE_RANGES.map(r => (
              <button key={r.value} onClick={() => setDateRange(r.value)}
                className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  dateRange === r.value
                    ? "bg-surface text-primary-600 shadow-soft"
                    : "text-text-secondary hover:text-text-primary"
                )}>
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-warm-200 bg-warm-100 p-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "bg-surface text-primary-600 shadow-soft"
                : "text-text-secondary hover:text-text-primary hover:bg-surface/60"
            )}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab + dateRange} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {activeTab === "overview"  && <OverviewTab  dateRange={dateRange} />}
          {activeTab === "sales"     && <SalesTab     dateRange={dateRange} />}
          {activeTab === "business"  && <BusinessTab  dateRange={dateRange} />}
          {activeTab === "customers" && <CustomerTab  dateRange={dateRange} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Overview Tab ────────────────────────────────────────────────────── */
function OverviewTab({ dateRange }) {
  const [overview, setOverview] = useState(null);
  const [daily,    setDaily]    = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const params = getDateParams(dateRange);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAnalyticsOverview(params).catch(() => null),
      getSalesSummary(params).catch(() => null),
      getDailySales(params).catch(() => ({ sales: [] })),
      getTopSellingItems({ ...params, limit: 5 }).catch(() => ({ items: [] })),
    ]).then(([ov, sales, d, top]) => {
      setOverview(ov ? { ...ov, ...(sales ?? {}) } : sales);
      setDaily(d?.sales ?? []);
      setTopItems(top?.items ?? []);
    }).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  if (loading) return <AnalyticsSkeleton />;

  const stats = overview ? [
    { label: "Total Revenue",    value: formatCurrency(overview.total_revenue ?? 0),    icon: DollarSign,  accent: "accent",
      trend: overview.revenue_change_pct != null ? { value: `${Math.abs(Number(overview.revenue_change_pct)).toFixed(1)}%`, direction: Number(overview.revenue_change_pct) >= 0 ? "up" : "down" } : undefined },
    { label: "Total Orders",     value: formatNumber(overview.total_orders ?? 0),        icon: ShoppingBag, accent: "brand"   },
    { label: "Avg Order Value",  value: formatCurrency(overview.average_order_value ?? overview.avg_order_value ?? overview.average_bill ?? 0), icon: TrendingUp, accent: "success" },
    { label: "Completed Orders", value: formatNumber(overview.completed_orders ?? 0),    icon: Users,       accent: "info"    },
  ] : [];

  return (
    <div className="space-y-8">
      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Daily Revenue" subtitle="Revenue trend over selected period">
          {daily.length === 0 ? <NoData /> : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={daily} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGradOv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#355c4b" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#355c4b" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#d8ccbe" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#72675c" }} tickFormatter={d => d?.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#72675c" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={48} />
                <Tooltip content={({ active, payload, label }) => <PremiumTooltip active={active} payload={payload} label={label?.slice(5)} formatter={(v) => formatCurrency(v)} />} cursor={{ stroke: "#355c4b", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Area type="monotone" dataKey="revenue" stroke="#355c4b" strokeWidth={2.5} fill="url(#revGradOv)" dot={false} activeDot={{ r: 5, fill: "#355c4b", stroke: "#fffdf9", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Top Selling Items" subtitle="By number of orders in period">
          {topItems.length === 0 ? <NoData /> : (
            <div className="space-y-3.5 pt-2">
              {topItems.map((item, i) => {
                const max = Number(topItems[0]?.total_ordered ?? 1);
                const pct = ((Number(item.total_ordered) / max) * 100).toFixed(0);
                return (
                  <div key={item.id ?? i}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
                          style={{ background: i === 0 ? "#fdf5e0" : i === 1 ? "#f0f6f3" : "#f6f1e8", color: i === 0 ? "#8a640f" : i === 1 ? "#2d5c2c" : "#72675c" }}>
                          {i + 1}
                        </span>
                        <span className="max-w-[180px] truncate text-sm font-medium text-text-primary">{item.name ?? item.item_name}</span>
                      </div>
                      <span className="ml-2 shrink-0 text-xs font-bold text-accent-600">{item.total_ordered} orders</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-warm-200">
                      <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.65, delay: i * 0.08, ease: "easeOut" }}
                        style={{ background: i === 0 ? "linear-gradient(90deg,#355c4b,#4d9e84)" : "linear-gradient(90deg,#c46a2d60,#c46a2d)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

/* ── Sales Tab ───────────────────────────────────────────────────────── */
function SalesTab({ dateRange }) {
  const [monthly, setMonthly] = useState([]); const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);
  const params = getDateParams(dateRange);
  useEffect(() => {
    setLoading(true);
    Promise.all([getMonthlySales(params).catch(() => ({ sales: [] })), getDailySales(params).catch(() => ({ sales: [] }))])
      .then(([m, d]) => { setMonthly(m?.sales ?? []); setDaily(d?.sales ?? []); })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);
  if (loading) return <AnalyticsSkeleton />;
  return (
    <div className="space-y-6">
      <ChartCard title="Daily Sales" subtitle="Orders and revenue per day">
        {daily.length === 0 ? <NoData /> : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={daily} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d8ccbe" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#72675c" }} tickFormatter={d => d?.slice(5)} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  tick={{ fontSize: 11, fill: "#72675c" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={48} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#72675c" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #d8ccbe", fontSize: 13, background: "#fffdf9" }} formatter={(v, name) => name === "revenue" ? [formatCurrency(v), "Revenue"] : [v, "Orders"]} />
              <Bar yAxisId="left"  dataKey="revenue" fill="#355c4b" radius={[5, 5, 0, 0]} name="revenue"  />
              <Bar yAxisId="right" dataKey="orders"  fill="#c46a2d" radius={[5, 5, 0, 0]} name="orders" opacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
      {monthly.length > 0 && (
        <ChartCard title="Monthly Trend" subtitle="Revenue aggregated by month">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d8ccbe" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#72675c" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#72675c" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={48} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #d8ccbe", fontSize: 13, background: "#fffdf9" }} formatter={(v) => [formatCurrency(v), "Revenue"]} />
              <Bar dataKey="revenue" fill="#355c4b" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

/* ── Business Tab ────────────────────────────────────────────────────── */
function BusinessTab({ dateRange }) {
  const [peakHours,  setPeakHours]  = useState([]);
  const [topItems,   setTopItems]   = useState([]);
  const [payMethods, setPayMethods] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const params = getDateParams(dateRange);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPeakHours(params).catch(() => ({ peak_hours: [] })),
      getTopSellingItems({ ...params, limit: 10 }).catch(() => ({ items: [] })),
      getPaymentMethodReport(params).catch(() => ({ methods: [] })),
    ]).then(([ph, top, pay]) => {
      setPeakHours(ph?.peak_hours ?? []);
      setTopItems(top?.items ?? []);
      setPayMethods(pay?.methods ?? []);
    }).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  if (loading) return <AnalyticsSkeleton />;

  // Normalize top items — backend returns item_name / total_quantity
  const normalizedItems = topItems.slice(0, 10).map(item => ({
    ...item,
    name:          item.item_name   ?? item.name   ?? "Unknown",
    total_ordered: Number(item.total_quantity ?? item.total_ordered ?? 0),
    revenue:       Number(item.total_revenue  ?? 0),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Peak Hours */}
        <ChartCard title="Peak Hours" subtitle="Order volume by hour of day">
          {peakHours.length === 0 ? <NoData /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={peakHours} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d8ccbe" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#72675c" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#72675c" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #d8ccbe", fontSize: 13, background: "#fffdf9" }}
                  formatter={(v) => [v, "Orders"]}
                  labelFormatter={h => `Hour: ${h}`}
                />
                <Bar dataKey="order_count" radius={[5, 5, 0, 0]} name="Orders">
                  {peakHours.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Payment Methods — donut + legend */}
        <ChartCard title="Payment Methods" subtitle="Revenue & transaction share by method">
          {payMethods.length === 0 ? <NoData /> : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={210}>
                <PieChart>
                  <Pie
                    data={payMethods}
                    cx="50%" cy="50%"
                    innerRadius={52} outerRadius={82}
                    dataKey="count"
                    paddingAngle={3}
                    label={({ pct }) => pct > 5 ? `${pct}%` : ""}
                    labelLine={false}
                  >
                    {payMethods.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #d8ccbe", fontSize: 13, background: "#fffdf9" }}
                    formatter={(v, n) => [`${v} txns`, n]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {payMethods.map((m, i) => (
                  <div key={m.method}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-sm font-semibold text-text-primary">{m.method}</span>
                      </div>
                      <span className="text-xs font-bold text-text-secondary tabular-nums">{m.count} txns</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-warm-200">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${m.pct ?? 0}%`,
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                    </div>
                    <p className="mt-0.5 text-right text-[10px] text-text-disabled">{m.pct ?? 0}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Top Selling Items — full-width horizontal bar chart */}
      <ChartCard title="Top Selling Items" subtitle="Items ranked by total quantity sold">
        {normalizedItems.length === 0 ? <NoData /> : (
          <>
            {/* Legend */}
            <div className="mb-4 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-primary-500" />
                <span className="text-xs text-text-secondary">Orders (qty)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-accent-400" />
                <span className="text-xs text-text-secondary">Revenue (₹)</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(normalizedItems.length * 42, 280)}>
              <BarChart
                data={normalizedItems}
                layout="vertical"
                margin={{ top: 4, right: 60, left: 8, bottom: 4 }}
                barCategoryGap="22%"
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#d8ccbe" strokeOpacity={0.4} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#72675c" }}
                  axisLine={false}
                  tickLine={false}
                  tickCount={5}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#4a4039", fontWeight: 500 }}
                  width={130}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => v.length > 18 ? v.slice(0, 17) + "…" : v}
                />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #d8ccbe", fontSize: 13, background: "#fffdf9", boxShadow: "0 4px 16px rgba(31,27,24,0.10)" }}
                  cursor={{ fill: "rgba(53,92,75,0.05)" }}
                  formatter={(v, name) =>
                    name === "total_ordered"
                      ? [`${v} orders`, "Quantity Sold"]
                      : [formatCurrency(v), "Revenue"]
                  }
                />
                <Bar
                  dataKey="total_ordered"
                  name="total_ordered"
                  radius={[0, 5, 5, 0]}
                  label={{ position: "right", fontSize: 11, fill: "#72675c", formatter: v => v }}
                >
                  {normalizedItems.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        i === 0 ? "#355c4b" :
                        i === 1 ? "#4d7a62" :
                        i === 2 ? "#7a9e6e" :
                        "#a3bfa0"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </ChartCard>
    </div>
  );
}

/* ── Customer Analytics Tab ──────────────────────────────────────────── */
function CustomerTab({ dateRange }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [customers,     setCustomers]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const params = getDateParams(dateRange);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getCustomerAnalytics(params).catch(() => null),
      getCustomers({}).then(r => r.customers ?? []).catch(() => []),
    ]).then(([analytics, cList]) => {
      setAnalyticsData(analytics);
      setCustomers(cList);
    }).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  if (loading) return <AnalyticsSkeleton />;

  // ── Derive everything we need from the customers list so we ALWAYS have data
  const totalCustomers     = analyticsData?.total_customers     ?? customers.length;
  const activeCustomers    = analyticsData?.active_customers    ?? customers.filter(c => c.is_active).length;
  const newCustomers       = analyticsData?.new_customers       ?? analyticsData?.new_this_month
    ?? customers.filter(c => {
         const d = new Date(c.created_at);
         const now = new Date();
         return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
       }).length;
  const returningCustomers = analyticsData?.returning_customers ?? 0;
  const avgFrequency       = analyticsData?.avg_visit_frequency ?? analyticsData?.average_visits ?? 0;
  const growthData         = analyticsData?.growth_data         ?? [];
  const topSpenders        = analyticsData?.top_spenders        ?? [];
  const totalLoyaltyPts    = customers.reduce((s, c) => s + Number(c.loyalty_points ?? 0), 0);

  // If truly no customers at all, show empty state
  if (totalCustomers === 0 && customers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No customers yet"
        description="Customer analytics will appear once customers are added."
      />
    );
  }

  // ── Derived charts from customers list ──────────────────────────────────

  // Gender breakdown
  const genderMap = {};
  customers.forEach(c => {
    const g = c.gender ?? "Not specified";
    genderMap[g] = (genderMap[g] ?? 0) + 1;
  });
  const genderData = Object.entries(genderMap).map(([name, value]) => ({ name, value }));

  // Registration by month (last 6 months)
  const regMap = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
    regMap[key] = 0;
  }
  customers.forEach(c => {
    const d = new Date(c.created_at);
    const key = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
    if (regMap[key] !== undefined) regMap[key]++;
  });
  const regData = Object.entries(regMap).map(([month, count]) => ({ month, count }));

  // Active vs inactive
  const statusData = [
    { name: "Active",   value: activeCustomers },
    { name: "Inactive", value: Math.max(0, totalCustomers - activeCustomers) },
  ].filter(d => d.value > 0);

  // Loyalty points distribution buckets
  const loyaltyBuckets = { "0 pts": 0, "1–100": 0, "101–500": 0, "500+": 0 };
  customers.forEach(c => {
    const pts = Number(c.loyalty_points ?? 0);
    if (pts === 0)        loyaltyBuckets["0 pts"]++;
    else if (pts <= 100)  loyaltyBuckets["1–100"]++;
    else if (pts <= 500)  loyaltyBuckets["101–500"]++;
    else                  loyaltyBuckets["500+"]++;
  });
  const loyaltyData = Object.entries(loyaltyBuckets)
    .map(([range, count]) => ({ range, count }))
    .filter(d => d.count > 0);

  const GENDER_COLORS = ["#355c4b", "#c46a2d", "#7a9e6e", "#8b6b4a"];
  const STATUS_COLORS = ["#355c4b", "#d8ccbe"];

  const stats = [
    { label: "Total Customers",     value: formatNumber(totalCustomers),     icon: Users,      accent: "brand"   },
    { label: "New This Month",      value: formatNumber(newCustomers),       icon: TrendingUp, accent: "success" },
    { label: "Returning Customers", value: formatNumber(returningCustomers), icon: Users,      accent: "info"    },
    { label: "Loyalty Points Pool", value: formatNumber(totalLoyaltyPts),   icon: CreditCard, accent: "accent"  },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Registration trend + Status donut */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Customer Registrations" subtitle="New customers added per month (last 6 months)">
          {regData.every(d => d.count === 0) ? <NoData /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={regData} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d8ccbe" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#72675c" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#72675c" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #d8ccbe", fontSize: 13, background: "#fffdf9" }}
                  formatter={(v) => [v, "New Customers"]}
                />
                <Bar dataKey="count" radius={[5, 5, 0, 0]} name="Registrations">
                  {regData.map((_, i) => (
                    <Cell key={i} fill={i === regData.length - 1 ? "#355c4b" : "#7a9e6e"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Active vs Inactive" subtitle="Current customer status breakdown">
          {statusData.length === 0 ? <NoData /> : (
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="50%" height={210}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={52} outerRadius={82} dataKey="value" paddingAngle={3} labelLine={false}>
                    {statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #d8ccbe", fontSize: 13, background: "#fffdf9" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-4">
                {statusData.map((d, i) => (
                  <div key={d.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ background: STATUS_COLORS[i] }} />
                        <span className="text-sm font-semibold text-text-primary">{d.name}</span>
                      </div>
                      <span className="text-sm font-bold text-text-secondary tabular-nums">{d.value}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-warm-200">
                      <div className="h-full rounded-full" style={{ width: `${totalCustomers > 0 ? (d.value / totalCustomers * 100).toFixed(0) : 0}%`, background: STATUS_COLORS[i] }} />
                    </div>
                    <p className="mt-0.5 text-right text-[10px] text-text-disabled">
                      {totalCustomers > 0 ? (d.value / totalCustomers * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Gender distribution + Loyalty points breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Gender Distribution" subtitle="Customer base by gender">
          {genderData.length === 0 ? <NoData /> : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={48} outerRadius={78} dataKey="value" paddingAngle={3} labelLine={false}>
                    {genderData.map((_, i) => <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #d8ccbe", fontSize: 13, background: "#fffdf9" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {genderData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ background: GENDER_COLORS[i % GENDER_COLORS.length] }} />
                      <span className="text-sm font-medium text-text-primary capitalize">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text-secondary tabular-nums">{d.value}</span>
                      <span className="text-xs text-text-disabled">
                        ({customers.length > 0 ? (d.value / customers.length * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Loyalty Points Distribution" subtitle="Customers grouped by points balance">
          {loyaltyData.length === 0 ? <NoData /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={loyaltyData} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d8ccbe" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#72675c" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#72675c" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #d8ccbe", fontSize: 13, background: "#fffdf9" }}
                  formatter={(v) => [v, "Customers"]}
                />
                <Bar dataKey="count" radius={[5, 5, 0, 0]} name="Customers">
                  {loyaltyData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Customer growth chart (from analytics API) */}
      {growthData.length > 0 && (
        <ChartCard title="Customer Growth Trend" subtitle="Daily new registrations over the last 30 days">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={growthData} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#4d7a62" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#4d7a62" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#d8ccbe" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#72675c" }} tickFormatter={d => d?.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#72675c" }} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #d8ccbe", fontSize: 13, background: "#fffdf9" }}
                formatter={(v) => [v, "New Customers"]}
              />
              <Area type="monotone" dataKey="new_customers" stroke="#4d7a62" strokeWidth={2.5} fill="url(#custGrad)" dot={false} activeDot={{ r: 5, fill: "#4d7a62", stroke: "#fffdf9", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Top Spenders table */}
      {topSpenders.length > 0 && (
        <ChartCard title="Top Spenders" subtitle="Customers ranked by lifetime spend">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-200">
                  <th className="pb-3 text-left text-xs font-semibold text-text-secondary">#</th>
                  <th className="pb-3 text-left text-xs font-semibold text-text-secondary">Customer</th>
                  <th className="pb-3 text-left text-xs font-semibold text-text-secondary">Phone</th>
                  <th className="pb-3 text-right text-xs font-semibold text-text-secondary">Visits</th>
                  <th className="pb-3 text-right text-xs font-semibold text-text-secondary">Total Spent</th>
                  <th className="pb-3 text-right text-xs font-semibold text-text-secondary">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {topSpenders.map((customer, i) => (
                  <tr key={customer.id ?? i} className="border-b border-warm-100 last:border-0 hover:bg-warm-50 transition-colors">
                    <td className="py-3 pr-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold"
                        style={{ background: i === 0 ? "#fdf5e0" : i === 1 ? "#f0f6f3" : "#f6f1e8", color: i === 0 ? "#8a640f" : i === 1 ? "#2d5c2c" : "#72675c" }}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-text-primary">{customer.name ?? "—"}</td>
                    <td className="py-3 text-text-secondary">{customer.phone ?? "—"}</td>
                    <td className="py-3 text-right tabular-nums text-text-secondary">{customer.total_visits ?? 0}</td>
                    <td className="py-3 text-right tabular-nums font-semibold text-primary-600">{formatCurrency(customer.total_spent ?? 0)}</td>
                    <td className="py-3 text-right text-text-secondary">
                      {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}

      {/* Customer directory snapshot — always shown when no top spenders */}
      {topSpenders.length === 0 && customers.length > 0 && (
        <ChartCard title="Recent Customers" subtitle="Latest registered customers">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-200">
                  <th className="pb-3 text-left text-xs font-semibold text-text-secondary">#</th>
                  <th className="pb-3 text-left text-xs font-semibold text-text-secondary">Name</th>
                  <th className="pb-3 text-left text-xs font-semibold text-text-secondary">Phone</th>
                  <th className="pb-3 text-left text-xs font-semibold text-text-secondary">Gender</th>
                  <th className="pb-3 text-right text-xs font-semibold text-text-secondary">Loyalty Pts</th>
                  <th className="pb-3 text-right text-xs font-semibold text-text-secondary">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.slice(0, 10).map((customer, i) => (
                  <tr key={customer.id ?? i} className="border-b border-warm-100 last:border-0 hover:bg-warm-50 transition-colors">
                    <td className="py-3 pr-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold"
                        style={{ background: i === 0 ? "#fdf5e0" : i === 1 ? "#f0f6f3" : "#f6f1e8", color: i === 0 ? "#8a640f" : i === 1 ? "#2d5c2c" : "#72675c" }}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-text-primary">{customer.name ?? "—"}</td>
                    <td className="py-3 text-text-secondary">{customer.phone ?? "—"}</td>
                    <td className="py-3 text-text-secondary capitalize">{customer.gender ?? "—"}</td>
                    <td className="py-3 text-right tabular-nums font-semibold text-accent-600">{formatNumber(customer.loyalty_points ?? 0)}</td>
                    <td className="py-3 text-right text-text-secondary">
                      {customer.created_at ? new Date(customer.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </div>
  );
}

/* ── Shared chart components ─────────────────────────────────────────── */
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-card border border-warm-200 bg-surface p-6 card-shadow transition-shadow hover:card-shadow-elevated">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function NoData() {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warm-100">
        <BarChart3 className="h-5 w-5 text-warm-400" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-text-secondary">No data for this period</p>
      <p className="text-xs text-text-disabled">Try a wider date range or check back later</p>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-card bg-warm-200" style={{ opacity: 1 - i * 0.1 }} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-card bg-warm-200" style={{ opacity: 0.9 - i * 0.1 }} />
        ))}
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Star, Tag, Search, Plus, Edit2, X,
  Award, Calendar, TrendingUp, Gift, ShoppingBag, Clock, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader }  from "@/components/common/PageHeader";
import { StatCard }    from "@/components/common/StatCard";
import { EmptyState }  from "@/components/common/EmptyState";
import { Button }      from "@/components/ui/button";
import { Badge }       from "@/components/ui/badge";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/format";
import { cn }          from "@/utils/cn";
import {
  getCustomers, createCustomer, updateCustomer, getCustomerOrders,
  getLoyaltyTransactions, getLoyaltyDashboard,
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
} from "@/services/crmApi";

/* ── design constants ─────────────────────────────────────────────────── */
const inputCls =
  "h-10 w-full rounded-input border border-warm-200 bg-warm-50 px-3.5 text-sm " +
  "text-text-primary placeholder:text-text-disabled outline-none transition-all " +
  "focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-surface hover:border-warm-400";

const TABS = [
  { id: "customers", label: "Customers", icon: Users },
  { id: "loyalty",   label: "Loyalty",   icon: Star  },
  { id: "coupons",   label: "Coupons",   icon: Tag   },
];

/* ── Main page ────────────────────────────────────────────────────────── */
export function CRMPage() {
  const [activeTab,   setActiveTab]   = useState("customers");
  const [loyaltyDash, setLoyaltyDash] = useState(null);

  useEffect(() => { getLoyaltyDashboard().then(setLoyaltyDash).catch(() => {}); }, []);

  const stats = loyaltyDash ? [
    { label: "Total Customers", value: loyaltyDash.total_customers ?? "—",    icon: Users,      accent: "brand"   },
    { label: "Active Members",  value: loyaltyDash.active_members ?? "—",     icon: Award,      accent: "success" },
    { label: "Points Issued",   value: loyaltyDash.total_points_issued ?? "—", icon: TrendingUp, accent: "info"   },
    { label: "Points Redeemed", value: loyaltyDash.total_points_redeemed ?? "—", icon: Gift,     accent: "accent" },
  ] : [];

  return (
    <div>
      <PageHeader eyebrow="Guest Relations" title="CRM" description="Customer profiles, loyalty points, and coupon campaigns." />

      {stats.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>
      )}

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-warm-200 bg-warm-100 p-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all",
              activeTab === tab.id ? "bg-surface text-primary-600 shadow-soft" : "text-text-secondary hover:text-text-primary hover:bg-surface/60"
            )}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {activeTab === "customers" && <CustomersTab />}
          {activeTab === "loyalty"   && <LoyaltyTab />}
          {activeTab === "coupons"   && <CouponsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Customers Tab ────────────────────────────────────────────────────── */
function CustomersTab() {
  const [customers, setCustomers] = useState([]); const [loading, setLoading] = useState(true);
  const [search,    setSearch]    = useState(""); const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null); const [selected, setSelected] = useState(null);
  const [form,      setForm]      = useState({ name: "", phone: "", email: "" }); const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getCustomers({ search: search || undefined, limit: 50 }).then(d => setCustomers(d?.customers ?? [])).catch(() => setCustomers([])).finally(() => setLoading(false));
  }, [search]);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ name: "", phone: "", email: "" }); setShowModal(true); };
  const openEdit   = (c) => { setEditing(c); setForm({ name: c.name, phone: c.phone ?? "", email: c.email ?? "" }); setShowModal(true); };
  const handleSave = async () => {
    if (!form.name.trim()) return; setSaving(true);
    try { editing ? await updateCustomer(editing.id, form) : await createCustomer(form); toast.success(editing ? "Customer updated." : "Customer created."); setShowModal(false); load(); }
    catch {} finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone…"
            className="h-10 w-full rounded-input border border-warm-200 bg-warm-50 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-disabled outline-none transition-all focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-surface" />
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Customer</Button>
      </div>

      {loading ? <SectionSkeleton rows={5} /> : customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers yet" description="Add walk-in customers to start building loyalty." actionLabel="Add Customer" onAction={openCreate} />
      ) : (
        <div className="overflow-hidden rounded-card border border-warm-200 bg-surface card-shadow">
          <table className="w-full text-sm">
            <thead className="border-b border-warm-200 bg-warm-100 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <tr>{["Customer","Phone","Email","Visits","Loyalty Points","Joined",""].map(h => <th key={h} className="px-5 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {customers.map(c => (
                <tr key={c.id} className="cursor-pointer transition-colors hover:bg-warm-50" onClick={() => setSelected(c)}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">{c.name?.[0]?.toUpperCase()}</div>
                      <span className="font-medium text-text-primary">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">{c.phone ?? "—"}</td>
                  <td className="max-w-[180px] truncate px-5 py-3.5 text-text-secondary">{c.email ?? "—"}</td>
                  <td className="px-5 py-3.5 text-center font-semibold tabular-nums">{c.total_visits ?? 0}</td>
                  <td className="px-5 py-3.5">
                    <div className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5">
                      <Star className="h-3 w-3 text-accent-500" strokeWidth={2} />
                      <span className="text-xs font-bold text-accent-700">{c.loyalty_points ?? 0}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">{formatDate(c.created_at)}</td>
                  <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-600"><Edit2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <FormModal title={editing ? "Edit Customer" : "New Customer"} onClose={() => setShowModal(false)} onSave={handleSave} saving={saving}>
          <FormField label="Full Name" required><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Guest full name" /></FormField>
          <FormField label="Phone"><input className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" /></FormField>
          <FormField label="Email"><input className={inputCls} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></FormField>
        </FormModal>
      )}
      {selected && <CustomerProfileDrawer customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ── Customer Profile Drawer ─────────────────────────────────────────── */
function CustomerProfileDrawer({ customer, onClose }) {
  const [orders,  setOrders]  = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { getCustomerOrders(customer.id, { limit: 10 }).then(d => setOrders(d?.orders ?? [])).catch(() => setOrders([])).finally(() => setLoading(false)); }, [customer.id]);
  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(21,36,25,0.50)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="h-full w-full max-w-md overflow-y-auto bg-surface shadow-modal"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-warm-200 bg-surface px-6 py-4">
          <h2 className="text-lg font-bold text-text-primary">Guest Profile</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-text-secondary transition-colors hover:bg-warm-200"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-6 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-2xl font-bold text-primary-700">{customer.name?.[0]?.toUpperCase()}</div>
            <div>
              <h3 className="text-xl font-bold text-text-primary">{customer.name}</h3>
              <p className="text-sm text-text-secondary">{customer.phone ?? "No phone"}</p>
              {customer.email && <p className="text-sm font-medium text-primary-600">{customer.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{ label: "Visits", value: customer.total_visits ?? 0, icon: Calendar }, { label: "Points", value: customer.loyalty_points ?? 0, icon: Star }, { label: "Spend", value: formatCurrency(customer.total_spend ?? 0), icon: ShoppingBag }].map(s => (
              <div key={s.label} className="rounded-xl border border-warm-200 bg-warm-50 p-3 text-center">
                <s.icon className="mx-auto mb-1 h-4 w-4 text-primary-500" />
                <p className="text-base font-bold text-text-primary">{s.value}</p>
                <p className="text-xs text-text-secondary">{s.label}</p>
              </div>
            ))}
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">Order History</h4>
            {loading ? <SectionSkeleton rows={3} /> : orders.length === 0 ? <p className="py-4 text-center text-sm text-text-secondary">No orders yet.</p> : (
              <div className="space-y-2">
                {orders.map(o => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl border border-warm-200 bg-warm-50 px-4 py-3">
                    <div><p className="text-sm font-semibold text-text-primary">#{o.order_number ?? o.id}</p><p className="text-xs text-text-secondary">{formatDateTime(o.created_at)}</p></div>
                    <div className="text-right"><p className="text-sm font-bold text-accent-600">{formatCurrency(o.final_amount ?? o.total_amount)}</p><Badge variant={o.status === "COMPLETED" ? "success" : "outline"} className="text-[10px]">{o.status}</Badge></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Loyalty Tab ──────────────────────────────────────────────────────── */
function LoyaltyTab() {
  const [txns, setTxns] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { getLoyaltyTransactions({ limit: 50 }).then(d => setTxns(d?.transactions ?? [])).catch(() => setTxns([])).finally(() => setLoading(false)); }, []);
  const TYPE_STYLE = { EARN: "success", REDEEM: "warning", EXPIRE: "danger", ADJUST: "info" };
  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-text-primary">Loyalty Transactions</h2>
      {loading ? <SectionSkeleton rows={5} /> : txns.length === 0 ? (
        <EmptyState icon={Star} title="No loyalty transactions" description="Points are awarded automatically when customers place orders." />
      ) : (
        <div className="overflow-hidden rounded-card border border-warm-200 bg-surface card-shadow">
          <table className="w-full text-sm">
            <thead className="border-b border-warm-200 bg-warm-100 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <tr>{["Date","Customer","Type","Points","Balance","Reference"].map(h => <th key={h} className="px-5 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {txns.map((t, i) => (
                <tr key={t.id ?? i} className="transition-colors hover:bg-warm-50">
                  <td className="whitespace-nowrap px-5 py-3.5 text-text-secondary">{formatDateTime(t.created_at)}</td>
                  <td className="px-5 py-3.5 font-medium text-text-primary">{t.customer?.name ?? "—"}</td>
                  <td className="px-5 py-3.5"><Badge variant={TYPE_STYLE[t.transaction_type] ?? "outline"}>{t.transaction_type}</Badge></td>
                  <td className={cn("px-5 py-3.5 font-semibold tabular-nums", t.points > 0 ? "text-success-text" : "text-danger-text")}>{t.points > 0 ? "+" : ""}{t.points}</td>
                  <td className="px-5 py-3.5 font-semibold tabular-nums">{t.balance_after ?? "—"}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-text-secondary">{t.reference ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Coupons Tab ──────────────────────────────────────────────────────── */
function CouponsTab() {
  const [coupons, setCoupons] = useState([]); const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: "", discount_type: "PERCENTAGE", discount_value: "", minimum_order: "", max_uses: "", expires_at: "" });
  const [saving, setSaving] = useState(false);
  const load = useCallback(() => { setLoading(true); getCoupons().then(d => setCoupons(d?.coupons ?? [])).catch(() => setCoupons([])).finally(() => setLoading(false)); }, []);
  useEffect(() => { load(); }, [load]);
  const openCreate = () => { setEditing(null); setForm({ code: "", discount_type: "PERCENTAGE", discount_value: "", minimum_order: "", max_uses: "", expires_at: "" }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ code: c.code, discount_type: c.discount_type, discount_value: c.discount_value, minimum_order: c.minimum_order ?? "", max_uses: c.max_uses ?? "", expires_at: c.expires_at ? c.expires_at.split("T")[0] : "" }); setShowModal(true); };
  const handleSave = async () => {
    if (!form.code.trim() || !form.discount_value) return; setSaving(true);
    try {
      const payload = { ...form, discount_value: Number(form.discount_value), minimum_order: form.minimum_order ? Number(form.minimum_order) : undefined, max_uses: form.max_uses ? Number(form.max_uses) : undefined };
      editing ? await updateCoupon(editing.id, payload) : await createCoupon(payload);
      toast.success(editing ? "Coupon updated." : "Coupon created."); setShowModal(false); load();
    } catch {} finally { setSaving(false); }
  };
  const handleDelete = async (id) => { if (!confirm("Delete this coupon?")) return; try { await deleteCoupon(id); toast.success("Coupon deleted."); load(); } catch {} };
  const couponStatus = (c) => {
    if (!c.is_active) return { variant: "outline", label: "Inactive" };
    if (c.expires_at && new Date(c.expires_at) < new Date()) return { variant: "danger", label: "Expired" };
    return { variant: "success", label: "Active" };
  };
  return (
    <div>
      <div className="mb-4 flex justify-end"><Button onClick={openCreate}><Plus className="h-4 w-4" /> New Coupon</Button></div>
      {loading ? <SectionSkeleton rows={4} /> : coupons.length === 0 ? (
        <EmptyState icon={Tag} title="No coupons yet" description="Create discount coupons for your customers." actionLabel="New Coupon" onAction={openCreate} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map(c => {
            const { variant, label } = couponStatus(c);
            return (
              <motion.div key={c.id} whileHover={{ y: -2 }} className="space-y-3 rounded-card border border-warm-200 bg-surface p-5 card-shadow transition-shadow hover:card-shadow-elevated">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-lg font-bold text-primary-600">{c.code}</p>
                    <p className="text-sm text-text-secondary">{c.discount_type === "PERCENTAGE" ? `${c.discount_value}% off` : `₹${c.discount_value} off`}{c.minimum_order ? ` · Min ₹${c.minimum_order}` : ""}</p>
                  </div>
                  <Badge variant={variant}>{label}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                  {c.expires_at && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Expires {formatDate(c.expires_at)}</span>}
                  {c.max_uses && <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success" />{c.used_count ?? 0}/{c.max_uses} used</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="flex-1 rounded-input border border-warm-300 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-warm-100">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="flex-1 rounded-input border border-danger/25 bg-danger-bg py-1.5 text-xs font-semibold text-danger-text transition-colors hover:bg-red-100">Delete</button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      {showModal && (
        <FormModal title={editing ? "Edit Coupon" : "New Coupon"} onClose={() => setShowModal(false)} onSave={handleSave} saving={saving}>
          <FormField label="Coupon Code" required><input className={inputCls} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. WELCOME20" /></FormField>
          <FormField label="Discount Type"><select className={inputCls} value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))}><option value="PERCENTAGE">Percentage (%)</option><option value="FIXED">Fixed Amount (₹)</option></select></FormField>
          <FormField label="Discount Value" required><input className={inputCls} type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))} placeholder={form.discount_type === "PERCENTAGE" ? "e.g. 10" : "e.g. 50"} /></FormField>
          <FormField label="Minimum Order (₹)"><input className={inputCls} type="number" value={form.minimum_order} onChange={e => setForm(f => ({ ...f, minimum_order: e.target.value }))} /></FormField>
          <FormField label="Max Uses"><input className={inputCls} type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} /></FormField>
          <FormField label="Expires At"><input className={inputCls} type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} /></FormField>
        </FormModal>
      )}
    </div>
  );
}

/* ── Shared helpers ───────────────────────────────────────────────────── */
function FormField({ label, required, children }) {
  return (
    <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}{required && <span className="ml-0.5 text-danger">*</span>}</label>{children}</div>
  );
}
function FormModal({ title, onClose, onSave, saving, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(21,36,25,0.55)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
        className="relative w-full max-w-md space-y-4 rounded-dialog border border-warm-200 bg-surface p-6 shadow-modal" onClick={e => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">{title}</h2>
          <button onClick={onClose} className="rounded-xl p-1.5 text-text-secondary transition-colors hover:bg-warm-200"><X className="h-4 w-4" /></button>
        </div>
        {children}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="rounded-input border border-warm-300 px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-warm-100">Cancel</button>
          <Button onClick={onSave} loading={saving}>Save</Button>
        </div>
      </motion.div>
    </div>
  );
}
function SectionSkeleton({ rows = 4 }) {
  return <div className="space-y-3">{Array.from({ length: rows }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-warm-200" style={{ opacity: 1 - i * 0.12 }} />)}</div>;
}

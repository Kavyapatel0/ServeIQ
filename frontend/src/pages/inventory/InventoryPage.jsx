import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes, Package, Truck, ShoppingCart, AlertTriangle,
  Plus, Search, X, Edit2, Trash2, CheckCircle2,
  BarChart2, ArrowDownCircle,
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
  getIngredients, createIngredient, updateIngredient, deleteIngredient, getLowStock,
  getSuppliers, createSupplier, updateSupplier,
  getPurchaseOrders, createPurchaseOrder, receivePurchaseOrder, cancelPurchaseOrder,
  getInventoryTransactions, getInventoryDashboard,
} from "@/services/inventoryApi";

/* ── design constants ─────────────────────────────────────────────────── */
const inputCls =
  "h-10 w-full rounded-input border border-warm-200 bg-warm-50 px-3.5 text-sm " +
  "text-text-primary placeholder:text-text-disabled outline-none transition-all " +
  "focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-surface " +
  "hover:border-warm-400";

const searchCls =
  "h-10 w-full rounded-input border border-warm-200 bg-warm-50 pl-9 pr-3 text-sm " +
  "text-text-primary placeholder:text-text-disabled outline-none transition-all " +
  "focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-surface";

/* ── shared tab bar style ──────────────────────────────────────────────── */
const tabBarCls = "mb-6 flex gap-1 overflow-x-auto rounded-xl border border-warm-200 bg-warm-100 p-1";
const tabCls = (active) =>
  cn(
    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all",
    active
      ? "bg-surface text-primary-600 shadow-soft"
      : "text-text-secondary hover:text-text-primary hover:bg-surface/60"
  );

const TABS = [
  { id: "dashboard",       label: "Dashboard",       icon: BarChart2      },
  { id: "ingredients",     label: "Ingredients",     icon: Package        },
  { id: "suppliers",       label: "Suppliers",       icon: Truck          },
  { id: "purchase-orders", label: "Purchase Orders", icon: ShoppingCart   },
  { id: "transactions",    label: "Transactions",    icon: ArrowDownCircle },
];

function stockStatus(current, minimum) {
  const c = Number(current); const m = Number(minimum);
  if (c <= 0)       return "critical";
  if (c <= m)       return "low";
  if (c <= m * 1.5) return "warning";
  return "healthy";
}

const STATUS_BADGE = {
  healthy:  { variant: "success", label: "Healthy"       },
  warning:  { variant: "warning", label: "Low"           },
  low:      { variant: "danger",  label: "Critical"      },
  critical: { variant: "danger",  label: "Out of Stock"  },
};

const PO_STATUS_BADGE = {
  PENDING:   { variant: "warning", label: "Pending"   },
  RECEIVED:  { variant: "success", label: "Received"  },
  CANCELLED: { variant: "outline", label: "Cancelled" },
};

/* ── Main Page ────────────────────────────────────────────────────────── */
export function InventoryPage() {
  const [activeTab,   setActiveTab]   = useState("dashboard");
  const [dashboard,   setDashboard]   = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [lowStock,    setLowStock]    = useState([]);

  useEffect(() => {
    setDashLoading(true);
    Promise.all([
      getInventoryDashboard().catch(() => null),
      getLowStock().catch(() => ({ ingredients: [] })),
    ]).then(([dash, low]) => {
      setDashboard(dash);
      setLowStock(low?.ingredients ?? []);
    }).finally(() => setDashLoading(false));
  }, []);

  const stats = dashboard ? [
    { label: "Total Ingredients", value: dashboard.total_ingredients ?? "—", icon: Package,      accent: "brand"   },
    { label: "Low Stock Items",   value: dashboard.low_stock_count ?? lowStock.length, icon: AlertTriangle, accent: "danger"  },
    { label: "Active Suppliers",  value: dashboard.total_suppliers ?? "—",  icon: Truck,         accent: "info"    },
    { label: "Pending POs",       value: dashboard.pending_purchase_orders ?? "—", icon: ShoppingCart, accent: "warning" },
  ] : [];

  return (
    <div>
      <PageHeader eyebrow="Operations" title="Inventory" description="Ingredients, suppliers, purchase orders, and stock levels." />

      {!dashLoading && stats.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>
      )}

      <div className={tabBarCls}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={tabCls(activeTab === tab.id)}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {activeTab === "dashboard"       && <InventoryDashboardTab lowStock={lowStock} dashboard={dashboard} loading={dashLoading} />}
          {activeTab === "ingredients"     && <IngredientsTab />}
          {activeTab === "suppliers"       && <SuppliersTab />}
          {activeTab === "purchase-orders" && <PurchaseOrdersTab />}
          {activeTab === "transactions"    && <TransactionsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Dashboard Tab ───────────────────────────────────────────────────── */
function InventoryDashboardTab({ lowStock, loading }) {
  if (loading) return <SectionSkeleton rows={4} />;
  return (
    <div className="space-y-6">
      {lowStock.length > 0 ? (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-text-primary">
            <AlertTriangle className="h-4 w-4 text-danger" /> Low Stock Alerts
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lowStock.map((ing) => {
              const status = stockStatus(ing.current_stock, ing.minimum_stock);
              return (
                <div key={ing.id} className={cn(
                  "rounded-card border p-4 transition-shadow hover:card-shadow",
                  status === "critical" ? "border-danger/25 bg-danger-bg" : "border-warning/25 bg-warning-bg"
                )}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-text-primary">{ing.name}</p>
                    <Badge variant={STATUS_BADGE[status].variant}>{STATUS_BADGE[status].label}</Badge>
                  </div>
                  <p className="mt-1.5 text-xs text-text-secondary">
                    <span className="font-semibold">{ing.current_stock} {ing.unit}</span> remaining · min {ing.minimum_stock} {ing.unit}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-card border border-warm-200 bg-surface py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-bg">
            <CheckCircle2 className="h-7 w-7 text-success" strokeWidth={1.75} />
          </div>
          <p className="text-base font-semibold text-text-primary">All stock levels are healthy</p>
          <p className="text-sm text-text-secondary">No low-stock alerts at this time.</p>
        </div>
      )}
    </div>
  );
}

/* ── Ingredients Tab ─────────────────────────────────────────────────── */
function IngredientsTab() {
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState({ name: "", unit: "kg", minimum_stock: "", cost_price: "" });
  const [saving,    setSaving]    = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getIngredients({ search: search || undefined })
      .then((d) => setItems(d?.ingredients ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [search]);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ name: "", unit: "kg", minimum_stock: "", cost_price: "" }); setShowModal(true); };
  const openEdit   = (item) => { setEditing(item); setForm({ name: item.name, unit: item.unit, minimum_stock: item.minimum_stock, cost_price: item.cost_price }); setShowModal(true); };
  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      editing ? await updateIngredient(editing.id, form) : await createIngredient(form);
      toast.success(editing ? "Ingredient updated." : "Ingredient created.");
      setShowModal(false); load();
    } catch {} finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    if (!confirm("Delete this ingredient?")) return;
    try { await deleteIngredient(id); toast.success("Deleted."); load(); } catch {}
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ingredients…" className={searchCls} />
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Ingredient</Button>
      </div>

      {loading ? <SectionSkeleton rows={5} /> : items.length === 0 ? (
        <EmptyState icon={Package} title="No ingredients yet" description="Add your first ingredient to start tracking stock." actionLabel="Add Ingredient" onAction={openCreate} />
      ) : (
        <div className="overflow-hidden rounded-card border border-warm-200 bg-surface card-shadow">
          <table className="w-full text-sm">
            <thead className="border-b border-warm-200 bg-warm-100 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <tr>{["Ingredient","Unit","Stock","Min Stock","Cost/Unit","Status","Actions"].map(h => <th key={h} className="px-5 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {items.map((ing) => {
                const status = stockStatus(ing.current_stock, ing.minimum_stock);
                return (
                  <tr key={ing.id} className="transition-colors hover:bg-warm-50">
                    <td className="px-5 py-3.5 font-medium text-text-primary">{ing.name}</td>
                    <td className="px-5 py-3.5 text-text-secondary">{ing.unit}</td>
                    <td className="px-5 py-3.5 font-bold tabular-nums">{ing.current_stock}</td>
                    <td className="px-5 py-3.5 text-text-secondary tabular-nums">{ing.minimum_stock}</td>
                    <td className="px-5 py-3.5 text-text-secondary">{formatCurrency(ing.cost_price)}</td>
                    <td className="px-5 py-3.5"><Badge variant={STATUS_BADGE[status].variant}>{STATUS_BADGE[status].label}</Badge></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(ing)} className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-600"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(ing.id)} className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger-bg hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <FormModal title={editing ? "Edit Ingredient" : "Add Ingredient"} onClose={() => setShowModal(false)} onSave={handleSave} saving={saving}>
          <FormField label="Name" required><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Tomato" /></FormField>
          <FormField label="Unit">
            <select className={inputCls} value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
              {["kg","g","L","mL","pcs","dozen","bunch","box"].map(u => <option key={u}>{u}</option>)}
            </select>
          </FormField>
          <FormField label="Minimum Stock"><input className={inputCls} type="number" value={form.minimum_stock} onChange={e => setForm(f => ({ ...f, minimum_stock: e.target.value }))} placeholder="0" /></FormField>
          <FormField label="Cost per Unit (₹)"><input className={inputCls} type="number" value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))} placeholder="0.00" /></FormField>
        </FormModal>
      )}
    </div>
  );
}

/* ── Suppliers Tab ───────────────────────────────────────────────────── */
function SuppliersTab() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", contact_person: "", phone: "", email: "", address: "" });
  const [saving, setSaving] = useState(false);
  const load = useCallback(() => { setLoading(true); getSuppliers().then(d => setItems(d?.suppliers ?? [])).catch(() => setItems([])).finally(() => setLoading(false)); }, []);
  useEffect(() => { load(); }, [load]);
  const openCreate = () => { setEditing(null); setForm({ name: "", contact_person: "", phone: "", email: "", address: "" }); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, contact_person: s.contact_person ?? "", phone: s.phone ?? "", email: s.email ?? "", address: s.address ?? "" }); setShowModal(true); };
  const handleSave = async () => {
    if (!form.name.trim()) return; setSaving(true);
    try { editing ? await updateSupplier(editing.id, form) : await createSupplier(form); toast.success(editing ? "Supplier updated." : "Supplier added."); setShowModal(false); load(); }
    catch {} finally { setSaving(false); }
  };
  return (
    <div>
      <div className="mb-4 flex justify-end"><Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Supplier</Button></div>
      {loading ? <SectionSkeleton rows={4} /> : items.length === 0 ? (
        <EmptyState icon={Truck} title="No suppliers yet" description="Add your first supplier to link with purchase orders." actionLabel="Add Supplier" onAction={openCreate} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <motion.div key={s.id} whileHover={{ y: -2 }} className="rounded-card border border-warm-200 bg-surface p-5 card-shadow transition-shadow hover:card-shadow-elevated">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-lg font-bold text-primary-700">{s.name?.[0]?.toUpperCase()}</div>
                <button onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-600"><Edit2 className="h-4 w-4" /></button>
              </div>
              <h3 className="mt-3 font-semibold text-text-primary">{s.name}</h3>
              {s.contact_person && <p className="mt-0.5 text-xs text-text-secondary">Contact: {s.contact_person}</p>}
              {s.phone && <p className="text-xs text-text-secondary">{s.phone}</p>}
              {s.email && <p className="text-xs font-medium text-primary-600 truncate">{s.email}</p>}
            </motion.div>
          ))}
        </div>
      )}
      {showModal && (
        <FormModal title={editing ? "Edit Supplier" : "Add Supplier"} onClose={() => setShowModal(false)} onSave={handleSave} saving={saving}>
          <FormField label="Company Name" required><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Fresh Farms" /></FormField>
          <FormField label="Contact Person"><input className={inputCls} value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} /></FormField>
          <FormField label="Phone"><input className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></FormField>
          <FormField label="Email"><input className={inputCls} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></FormField>
          <FormField label="Address"><input className={inputCls} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></FormField>
        </FormModal>
      )}
    </div>
  );
}

/* ── Purchase Orders Tab ─────────────────────────────────────────────── */
function PurchaseOrdersTab() {
  const [orders, setOrders] = useState([]); const [suppliers, setSuppliers] = useState([]); const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true); const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ supplier_id: "", items: [{ ingredient_id: "", quantity: "", unit_price: "" }] });
  const [saving, setSaving] = useState(false);
  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getPurchaseOrders().catch(() => ({ purchase_orders: [] })), getSuppliers().catch(() => ({ suppliers: [] })), getIngredients().catch(() => ({ ingredients: [] }))])
      .then(([po, sup, ing]) => { setOrders(po?.purchase_orders ?? []); setSuppliers(sup?.suppliers ?? []); setIngredients(ing?.ingredients ?? []); })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);
  const handleReceive = async (id) => { if (!confirm("Mark as received? Stock will be updated.")) return; try { await receivePurchaseOrder(id, {}); toast.success("PO received. Stock updated."); load(); } catch {} };
  const handleCancel  = async (id) => { if (!confirm("Cancel this purchase order?")) return; try { await cancelPurchaseOrder(id); toast.success("PO cancelled."); load(); } catch {} };
  const addItem    = () => setForm(f => ({ ...f, items: [...f.items, { ingredient_id: "", quantity: "", unit_price: "" }] }));
  const updateItem = (i, field, val) => setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [field]: val } : it) }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const handleCreate = async () => {
    if (!form.supplier_id || form.items.some(it => !it.ingredient_id || !it.quantity)) { toast.error("Fill all required fields."); return; }
    setSaving(true);
    try { await createPurchaseOrder({ supplier_id: Number(form.supplier_id), items: form.items.map(it => ({ ingredient_id: Number(it.ingredient_id), quantity: Number(it.quantity), unit_price: Number(it.unit_price) })) }); toast.success("Purchase order created."); setShowModal(false); load(); }
    catch {} finally { setSaving(false); }
  };
  return (
    <div>
      <div className="mb-4 flex justify-end"><Button onClick={() => { setForm({ supplier_id: "", items: [{ ingredient_id: "", quantity: "", unit_price: "" }] }); setShowModal(true); }}><Plus className="h-4 w-4" /> New PO</Button></div>
      {loading ? <SectionSkeleton rows={4} /> : orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No purchase orders" description="Create a purchase order to restock ingredients." actionLabel="New PO" onAction={() => setShowModal(true)} />
      ) : (
        <div className="overflow-hidden rounded-card border border-warm-200 bg-surface card-shadow">
          <table className="w-full text-sm">
            <thead className="border-b border-warm-200 bg-warm-100 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <tr>{["PO #","Supplier","Total","Status","Ordered","Actions"].map(h => <th key={h} className="px-5 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {orders.map(po => {
                const { variant, label } = PO_STATUS_BADGE[po.status] ?? { variant: "outline", label: po.status };
                return (
                  <tr key={po.id} className="transition-colors hover:bg-warm-50">
                    <td className="px-5 py-3.5 font-mono font-bold text-primary-600">PO-{String(po.id).padStart(4, "0")}</td>
                    <td className="px-5 py-3.5 font-medium text-text-primary">{po.supplier?.name ?? "—"}</td>
                    <td className="px-5 py-3.5 font-bold text-accent-600">{formatCurrency(po.total_amount)}</td>
                    <td className="px-5 py-3.5"><Badge variant={variant}>{label}</Badge></td>
                    <td className="px-5 py-3.5 text-text-secondary">{formatDate(po.created_at)}</td>
                    <td className="px-5 py-3.5">
                      {po.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button onClick={() => handleReceive(po.id)} className="rounded-lg border border-success/30 bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text transition-colors hover:bg-green-100">Receive</button>
                          <button onClick={() => handleCancel(po.id)} className="rounded-lg border border-danger/30 bg-danger-bg px-2.5 py-1 text-xs font-semibold text-danger-text transition-colors hover:bg-red-100">Cancel</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <FormModal title="New Purchase Order" onClose={() => setShowModal(false)} onSave={handleCreate} saving={saving} wide>
          <FormField label="Supplier" required>
            <select className={inputCls} value={form.supplier_id} onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))}>
              <option value="">Select supplier…</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FormField>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Items</label>
            {form.items.map((it, i) => (
              <div key={i} className="flex items-center gap-2">
                <select className={cn(inputCls, "flex-1")} value={it.ingredient_id} onChange={e => updateItem(i, "ingredient_id", e.target.value)}><option value="">Ingredient…</option>{ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}</select>
                <input className={cn(inputCls, "w-24")} type="number" placeholder="Qty" value={it.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} />
                <input className={cn(inputCls, "w-24")} type="number" placeholder="₹/unit" value={it.unit_price} onChange={e => updateItem(i, "unit_price", e.target.value)} />
                {form.items.length > 1 && <button onClick={() => removeItem(i)} className="text-danger hover:text-red-700"><X className="h-4 w-4" /></button>}
              </div>
            ))}
            <button onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"><Plus className="h-3 w-3" /> Add Item</button>
          </div>
        </FormModal>
      )}
    </div>
  );
}

/* ── Transactions Tab ────────────────────────────────────────────────── */
function TransactionsTab() {
  const [txns, setTxns] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); getInventoryTransactions().then(d => setTxns(d?.transactions ?? [])).catch(() => setTxns([])).finally(() => setLoading(false)); }, []);
  const TXN_STYLE = { PURCHASE: "success", ADJUSTMENT: "info", USAGE: "warning", WASTAGE: "danger" };
  return (
    <div>
      {loading ? <SectionSkeleton rows={6} /> : txns.length === 0 ? (
        <EmptyState icon={ArrowDownCircle} title="No transactions yet" description="Inventory movements will appear here." />
      ) : (
        <div className="overflow-hidden rounded-card border border-warm-200 bg-surface card-shadow">
          <table className="w-full text-sm">
            <thead className="border-b border-warm-200 bg-warm-100 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <tr>{["Date","Ingredient","Type","Quantity","Reference","Notes"].map(h => <th key={h} className="px-5 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {txns.map((t, i) => (
                <tr key={t.id ?? i} className="transition-colors hover:bg-warm-50">
                  <td className="px-5 py-3.5 whitespace-nowrap text-text-secondary">{formatDateTime(t.created_at)}</td>
                  <td className="px-5 py-3.5 font-medium text-text-primary">{t.ingredient?.name ?? t.ingredient_name ?? "—"}</td>
                  <td className="px-5 py-3.5"><Badge variant={TXN_STYLE[t.transaction_type] ?? "outline"}>{t.transaction_type}</Badge></td>
                  <td className="px-5 py-3.5 font-semibold tabular-nums">{t.quantity > 0 ? "+" : ""}{t.quantity}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-text-secondary">{t.reference ?? "—"}</td>
                  <td className="max-w-[200px] truncate px-5 py-3.5 text-text-secondary">{t.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Shared helpers ───────────────────────────────────────────────────── */
function FormField({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {label}{required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}

function FormModal({ title, onClose, onSave, saving, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(21,36,25,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
        className={cn("relative w-full space-y-4 rounded-dialog border border-warm-200 bg-surface p-6 shadow-modal", wide ? "max-h-[80vh] max-w-2xl overflow-y-auto" : "max-w-md")}
        onClick={e => e.stopPropagation()}
      >
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
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-xl bg-warm-200" style={{ opacity: 1 - i * 0.12 }} />
      ))}
    </div>
  );
}

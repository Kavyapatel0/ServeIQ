import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Building2, ShieldCheck, Plus, Edit2, Trash2,
  Search, X, Eye, EyeOff, User, CheckCircle2, AlertCircle, MapPin,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader }  from "@/components/common/PageHeader";
import { StatCard }    from "@/components/common/StatCard";
import { EmptyState }  from "@/components/common/EmptyState";
import { Pagination }  from "@/components/common/Pagination";
import { Button }      from "@/components/ui/button";
import { Badge }       from "@/components/ui/badge";
import { formatDate }  from "@/utils/format";
import { cn }          from "@/utils/cn";
import { useAuth }     from "@/hooks/useAuth";
import { ROLES }       from "@/constants/permissions";
import {
  getUsers, createUser, updateUser, deleteUser, getBranches,
} from "@/services/settingsApi";

/* ── Design constants ────────────────────────────────────────────────── */
const inputCls =
  "h-10 w-full rounded-input border border-warm-200 bg-warm-50 px-3.5 text-sm " +
  "text-text-primary placeholder:text-text-disabled outline-none transition-all " +
  "focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-surface hover:border-warm-400";

const TABS = [
  { id: "users",    label: "Users",    icon: Users    },
  { id: "branches", label: "Branches", icon: Building2 },
];

const ROLE_BADGE = {
  "Super Admin":       "default",
  "Branch Manager":    "brand",
  "Cashier":           "info",
  "Chef":              "warning",
  "Waiter":            "success",
  "Inventory Manager": "warm",
};

/* ── Main Page ───────────────────────────────────────────────────────── */
export function AdminPage() {
  const [activeTab,    setActiveTab]    = useState("users");
  const [userCount,    setUserCount]    = useState(null);
  const [branchCount,  setBranchCount]  = useState(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    getUsers().then(d    => setUserCount((d?.users    ?? []).length)).catch(() => {});
    getBranches().then(d => setBranchCount((d?.branches ?? []).length)).catch(() => {});
  }, []);

  const stats = [
    { label: "Total Users",    value: userCount    ?? "—", icon: Users,       accent: "brand"   },
    { label: "Total Branches", value: branchCount  ?? "—", icon: Building2,   accent: "info"    },
    { label: "Your Role",      value: currentUser?.role ?? "—", icon: ShieldCheck, accent: "success" },
  ];

  return (
    <div>
      <PageHeader eyebrow="System" title="Administration" description="Users, roles, branches, and access control." />

      <div className="mb-8 grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="mb-6 flex w-fit gap-1 rounded-xl border border-warm-200 bg-warm-100 p-1">
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
          {activeTab === "users"    && <UsersTab currentUserId={currentUser?.id} />}
          {activeTab === "branches" && <BranchesTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Users Tab ───────────────────────────────────────────────────────── */
function UsersTab({ currentUserId }) {
  const [users,     setUsers]     = useState([]); const [branches, setBranches] = useState([]);
  const [loading,   setLoading]   = useState(true); const [search,  setSearch]   = useState("");
  const [showModal, setShowModal] = useState(false); const [editing, setEditing]  = useState(null);
  const [showPw,    setShowPw]    = useState(false); const [saving,  setSaving]   = useState(false);
  const [form,      setForm]      = useState({ name: "", email: "", phone: "", role: "Cashier", branch_id: "", password: "" });
  const [page,      setPage]      = useState(1);
  const PAGE_SIZE = 10;

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      getUsers({ search: search || undefined }).catch(() => ({ users: [] })),
      getBranches().catch(() => ({ branches: [] })),
    ]).then(([u, b]) => {
      setUsers(u?.users ?? []); setBranches(b?.branches ?? []);
    }).finally(() => setLoading(false));
  }, [search]);
  useEffect(() => { load(); setPage(1); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ name: "", email: "", phone: "", role: "Cashier", branch_id: branches[0]?.id ?? "", password: "" }); setShowModal(true); };
  const openEdit   = (u) => { setEditing(u); setForm({ name: u.name, email: u.email, phone: u.phone ?? "", role: u.role, branch_id: u.branch_id ?? "", password: "" }); setShowModal(true); };
  const handleSave = async () => {
    if (!form.name || !form.email || !form.role) { toast.error("Name, email and role are required."); return; }
    if (!editing && !form.password) { toast.error("Password required for new users."); return; }
    setSaving(true);
    try {
      const payload = { ...form, branch_id: form.branch_id ? Number(form.branch_id) : undefined };
      if (!payload.password) delete payload.password;
      editing ? await updateUser(editing.id, payload) : await createUser(payload);
      toast.success(editing ? "User updated." : "User created."); setShowModal(false); load();
    } catch {} finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    if (id === currentUserId) { toast.error("You cannot delete yourself."); return; }
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try { await deleteUser(id); toast.success("User deleted."); load(); } catch {}
  };

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const pageUsers  = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
            className="h-10 w-full rounded-input border border-warm-200 bg-warm-50 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-disabled outline-none transition-all focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-surface" />
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add User</Button>
      </div>

      {loading ? <SectionSkeleton rows={5} /> : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" actionLabel="Add User" onAction={openCreate} />
      ) : (
        <div className="overflow-hidden rounded-card border border-warm-200 bg-surface card-shadow">
          <table className="w-full text-sm">
            <thead className="border-b border-warm-200 bg-warm-100 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <tr>{["User","Email","Role","Branch","Joined",""].map(h => <th key={h} className="px-5 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {pageUsers.map(u => (
                <tr key={u.id} className={cn("transition-colors hover:bg-warm-50", u.id === currentUserId && "bg-primary-50/30")}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">{u.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <p className="font-semibold text-text-primary">{u.name}</p>
                        {u.id === currentUserId && <p className="text-[10px] font-semibold text-primary-600">You</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">{u.email}</td>
                  <td className="px-5 py-3.5"><Badge variant={ROLE_BADGE[u.role] ?? "outline"}>{u.role}</Badge></td>
                  <td className="px-5 py-3.5 text-text-secondary">{u.branch?.name ?? u.branch_name ?? "—"}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{formatDate(u.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(u)} className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-600"><Edit2 className="h-4 w-4" /></button>
                      {u.id !== currentUserId && <button onClick={() => handleDelete(u.id)} className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger-bg hover:text-danger"><Trash2 className="h-4 w-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-warm-100 px-5 py-3">
              <p className="text-xs text-text-secondary">
                {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, users.length)} of {users.length} users
              </p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      {showModal && (
        <FormModal title={editing ? "Edit User" : "New User"} onClose={() => setShowModal(false)} onSave={handleSave} saving={saving}>
          <FormField label="Full Name" required><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></FormField>
          <FormField label="Email" required><input className={inputCls} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@restaurant.com" /></FormField>
          <FormField label="Phone"><input className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" /></FormField>
          <FormField label="Role" required>
            <select className={inputCls} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {Object.values(ROLES).map(r => <option key={r}>{r}</option>)}
            </select>
          </FormField>
          <FormField label="Branch">
            <select className={inputCls} value={form.branch_id} onChange={e => setForm(f => ({ ...f, branch_id: e.target.value }))}>
              <option value="">— No branch —</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </FormField>
          <FormField label={editing ? "New Password (leave blank to keep)" : "Password"} required={!editing}>
            <div className="relative">
              <input className={cn(inputCls, "pr-10")} type={showPw ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={editing ? "Leave blank to keep current" : "Min 8 characters"} />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-text-disabled transition-colors hover:text-text-secondary">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>
        </FormModal>
      )}
    </div>
  );
}

/* ── Branches Tab ────────────────────────────────────────────────────── */
function BranchesTab() {
  const [branches, setBranches] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); getBranches().then(d => setBranches(d?.branches ?? [])).catch(() => setBranches([])).finally(() => setLoading(false)); }, []);
  if (loading) return <SectionSkeleton rows={3} />;
  if (branches.length === 0) return <EmptyState icon={Building2} title="No branches configured" description="Branches are configured at the database level by Super Admin." />;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {branches.map(b => (
        <motion.div key={b.id} whileHover={{ y: -2 }} className="rounded-card border border-warm-200 bg-surface p-6 card-shadow transition-shadow hover:card-shadow-elevated">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
              <Building2 className="h-6 w-6 text-primary-600" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-text-primary">{b.name}</h3>
              {b.address    && <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary"><MapPin className="h-3 w-3 shrink-0" />{b.address}</p>}
              {b.phone      && <p className="mt-0.5 text-xs text-text-secondary">{b.phone}</p>}
              {b.manager_name && (
                <p className="mt-2 flex items-center gap-1 text-xs">
                  <User className="h-3 w-3 text-primary-500" />
                  <span className="font-semibold text-primary-700">{b.manager_name}</span>
                </p>
              )}
            </div>
          </div>
          {b.is_active !== undefined && (
            <div className="mt-4 flex items-center gap-2">
              {b.is_active
                ? <><CheckCircle2 className="h-4 w-4 text-success" strokeWidth={1.75} /><span className="text-xs font-semibold text-success-text">Active</span></>
                : <><AlertCircle  className="h-4 w-4 text-danger"  strokeWidth={1.75} /><span className="text-xs font-semibold text-danger-text">Inactive</span></>}
            </div>
          )}
        </motion.div>
      ))}
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

function FormModal({ title, onClose, onSave, saving, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(21,36,25,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
        className="relative max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-dialog border border-warm-200 bg-surface p-6 shadow-modal scrollbar-thin"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">{title}</h2>
          <button onClick={onClose} className="rounded-xl p-1.5 text-text-secondary transition-colors hover:bg-warm-200"><X className="h-4 w-4" /></button>
        </div>
        {children}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="rounded-input border border-warm-300 px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-warm-100">Cancel</button>
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

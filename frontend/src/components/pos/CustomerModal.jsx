import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Search, Plus, Star } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCustomer } from "@/redux/slices/cartSlice";
import { searchCustomers, createCustomer } from "@/services/posApi";
import { Overlay, ModalHeader } from "./CouponModal";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/utils/cn";

export function CustomerModal({ open, onClose }) {
  const dispatch = useDispatch();
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm]       = useState({ name: "", phone: "", email: "" });
  const [saving, setSaving]   = useState(false);

  const debounced = useDebounce(query, 300);

  useEffect(() => {
    if (!debounced.trim()) { setResults([]); return; }
    setLoading(true);
    searchCustomers(debounced)
      .then((d) => setResults(d?.customers ?? d ?? []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debounced]);

  const handleSelect = (c) => { dispatch(setCustomer(c)); onClose(); };
  const handleWalkIn = () => { dispatch(setCustomer(null)); onClose(); };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    setSaving(true);
    try {
      const nc = await createCustomer(form);
      dispatch(setCustomer(nc?.customer ?? nc));
      onClose();
    } catch {} finally { setSaving(false); }
  };

  if (!open) return null;

  return (
    <Overlay onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative flex max-h-[80vh] w-full max-w-md flex-col rounded-dialog border border-warm-200 bg-surface p-6 shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader title="Select Guest" icon={User} onClose={onClose} />

        {!showNew ? (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or phone…"
                className="w-full rounded-input border border-warm-200 bg-warm-50 py-2.5 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-disabled outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
              />
            </div>

            <div className="scrollbar-thin flex-1 space-y-1.5 overflow-y-auto">
              {loading && (
                <div className="space-y-2 py-2">
                  {[1,2,3].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-warm-100" />)}
                </div>
              )}
              {!loading && results.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className="flex w-full items-center gap-3 rounded-xl border border-warm-200 bg-warm-50 px-3 py-2.5 text-left transition-all hover:border-primary-300 hover:bg-primary-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                    {c.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">{c.name}</p>
                    <p className="text-xs text-text-secondary">{c.phone}</p>
                  </div>
                  {(c.loyalty_points ?? 0) > 0 && (
                    <div className="flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5">
                      <Star className="h-3 w-3 text-accent-500" strokeWidth={2} />
                      <span className="text-[10px] font-bold text-accent-700">{c.loyalty_points}</span>
                    </div>
                  )}
                </button>
              ))}
              {!loading && query && results.length === 0 && (
                <p className="py-4 text-center text-sm text-text-secondary">No guests found</p>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleWalkIn}
                className="flex-1 rounded-input border border-warm-300 bg-warm-100 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-warm-200"
              >
                Walk-in Guest
              </button>
              <button
                onClick={() => setShowNew(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-input py-2.5 text-sm font-bold text-white transition-colors"
                style={{ background: "linear-gradient(135deg,#355c4b,#28473a)" }}
              >
                <Plus className="h-4 w-4" />
                New Guest
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-text-secondary">Create a new guest profile.</p>
            <div className="space-y-3">
              {[
                { key: "name",  label: "Full Name *",   placeholder: "Guest full name",       type: "text" },
                { key: "phone", label: "Mobile *",      placeholder: "+91 98765 43210",        type: "tel" },
                { key: "email", label: "Email (optional)", placeholder: "guest@example.com",  type: "email" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-semibold text-text-secondary">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full rounded-input border border-warm-200 bg-warm-50 px-4 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all placeholder:text-text-disabled"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 rounded-input border border-warm-300 bg-warm-100 py-2.5 text-sm font-semibold text-text-secondary hover:bg-warm-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.name || !form.phone}
                className="flex-1 rounded-input py-2.5 text-sm font-bold text-white disabled:opacity-50 transition-colors"
                style={{ background: "linear-gradient(135deg,#355c4b,#28473a)" }}
              >
                {saving ? "Saving…" : "Create Guest"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </Overlay>
  );
}

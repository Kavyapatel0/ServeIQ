import { motion } from "framer-motion";
import { Armchair, Users } from "lucide-react";
import { Overlay, ModalHeader } from "./CouponModal";
import { cn } from "@/utils/cn";

const STATUS_CONFIG = {
  AVAILABLE: { cls: "border-primary-200 bg-primary-50 text-primary-700 hover:border-primary-400 hover:bg-primary-100",  label: "Available",  dot: "bg-success" },
  OCCUPIED:  { cls: "border-warm-200 bg-warm-100 text-warm-500 cursor-not-allowed opacity-60",                           label: "Occupied",   dot: "bg-danger"  },
  RESERVED:  { cls: "border-accent-200 bg-accent-50 text-accent-700 cursor-not-allowed opacity-60",                     label: "Reserved",   dot: "bg-warning" },
  CLEANING:  { cls: "border-info-bg bg-info-bg text-info cursor-not-allowed opacity-60",                                 label: "Cleaning",   dot: "bg-info"    },
};

export function TableSelector({ open, onClose, tables = [], selectedId, onSelect }) {
  if (!open) return null;

  return (
    <Overlay onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg rounded-dialog border border-warm-200 bg-surface p-6 shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader title="Select Table" icon={Armchair} onClose={onClose} />

        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-3">
          {Object.entries(STATUS_CONFIG).map(([status, { label, dot }]) => (
            <div key={status} className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className={cn("h-2 w-2 rounded-full", dot)} />
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-2.5">
          {tables.map((table) => {
            const cfg         = STATUS_CONFIG[table.status] ?? STATUS_CONFIG.AVAILABLE;
            const isAvailable = table.status === "AVAILABLE";
            const isSelected  = table.id === selectedId;

            return (
              <motion.button
                key={table.id}
                whileTap={isAvailable ? { scale: 0.95 } : {}}
                onClick={() => isAvailable && onSelect(table)}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border-2 p-3 text-center transition-all duration-150",
                  isSelected
                    ? "border-primary-500 bg-primary-100 text-primary-700 shadow-soft"
                    : cfg.cls
                )}
              >
                <Armchair className="h-5 w-5 mb-1" strokeWidth={1.75} />
                <span className="text-sm font-bold leading-none">
                  {table.table_number ?? table.name}
                </span>
                <div className="mt-1 flex items-center gap-1 text-[10px]">
                  <Users className="h-2.5 w-2.5" strokeWidth={2} />
                  <span>{table.capacity}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        <button
          onClick={() => { onSelect({ id: null, name: null }); onClose(); }}
          className="mt-4 w-full rounded-input border border-warm-300 bg-warm-100 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-warm-200"
        >
          Continue without table (Takeaway)
        </button>
      </motion.div>
    </Overlay>
  );
}

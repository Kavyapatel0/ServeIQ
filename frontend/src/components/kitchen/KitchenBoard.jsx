import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { KitchenColumn } from "./KitchenColumn";
import { KitchenCard } from "./KitchenCard";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";

// Active board only shows in-progress statuses — SERVED goes to history section
const ACTIVE_COLUMNS = ["PENDING", "PREPARING", "READY"];

export function KitchenBoard({ orders, onStatusChange, onOpenDetails, updatingId, canAdvance, filterStatus = "ALL" }) {
  const [historyOpen, setHistoryOpen] = useState(false);

  const servedOrders = orders.filter(o => o.status === "SERVED");

  // When filter is SERVED, show history expanded; otherwise show active board
  const showHistoryOnly = filterStatus === "SERVED";
  const columnsToShow = showHistoryOnly ? [] : ACTIVE_COLUMNS;

  const grouped = columnsToShow.reduce((acc, s) => {
    acc[s] = filterStatus === "ALL" || filterStatus === s
      ? orders.filter(o => o.status === s)
      : [];
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {/* ── Active board (3 columns: Pending / Preparing / Ready) ── */}
      {!showHistoryOnly && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" style={{ minHeight: "480px" }}>
          {columnsToShow.map(status => (
            <KitchenColumn
              key={status}
              status={status}
              orders={grouped[status]}
              onStatusChange={onStatusChange}
              onOpenDetails={onOpenDetails}
              updatingId={updatingId}
              canAdvance={canAdvance(status)}
              dimmed={filterStatus !== "ALL" && filterStatus !== status}
            />
          ))}
        </div>
      )}

      {/* ── Served / History section ─────────────────────────── */}
      {(showHistoryOnly || servedOrders.length > 0) && (
        <div className="rounded-card border border-primary-200 bg-primary-50/20 overflow-hidden">
          {/* Collapsible header */}
          <button
            onClick={() => setHistoryOpen(v => !v)}
            className="flex w-full items-center justify-between px-4 py-3 hover:bg-primary-50/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🍽</span>
              <span className="font-bold text-sm text-primary-700">Served Orders</span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-[11px] font-bold text-white">
                {servedOrders.length}
              </span>
            </div>
            {showHistoryOnly || historyOpen
              ? <ChevronUp className="h-4 w-4 text-primary-600" />
              : <ChevronDown className="h-4 w-4 text-primary-600" />
            }
          </button>

          <AnimatePresence initial={false}>
            {(showHistoryOnly || historyOpen) && (
              <motion.div
                key="served-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2 xl:grid-cols-3">
                  {servedOrders.length === 0 ? (
                    <p className="col-span-full py-6 text-center text-sm text-text-disabled">No served orders yet.</p>
                  ) : (
                    servedOrders.map(order => (
                      <KitchenCard
                        key={order.id}
                        order={order}
                        onStatusChange={onStatusChange}
                        onOpenDetails={onOpenDetails}
                        loading={updatingId === order.id}
                        canAdvance={canAdvance("SERVED")}
                      />
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
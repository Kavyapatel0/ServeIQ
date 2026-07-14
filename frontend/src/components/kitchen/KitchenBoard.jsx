import { KitchenColumn } from "./KitchenColumn";

const COLUMNS = ["PENDING", "PREPARING", "READY", "SERVED"];

/**
 * Kanban board: 4 equal-width columns on xl, 2×2 on sm, stacked on mobile.
 * Each column fills the remaining vertical height so cards scroll
 * independently without the page scrolling.
 */
export function KitchenBoard({ orders, onStatusChange, onOpenDetails, updatingId, canAdvance }) {
  const grouped = COLUMNS.reduce((acc, status) => {
    acc[status] = orders.filter((o) => o.status === status);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" style={{ minHeight: "400px" }}>
      {COLUMNS.map((status) => (
        <KitchenColumn
          key={status}
          status={status}
          orders={grouped[status]}
          onStatusChange={onStatusChange}
          onOpenDetails={onOpenDetails}
          updatingId={updatingId}
          canAdvance={canAdvance(status)}
        />
      ))}
    </div>
  );
}

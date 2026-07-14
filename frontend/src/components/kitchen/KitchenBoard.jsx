import { KitchenColumn } from "./KitchenColumn";

const COLUMNS = ["PENDING", "PREPARING", "READY", "SERVED"];

/**
 * Desktop: 4 columns side by side. Tablet: 2x2 grid. Mobile: single
 * column, one status at a time isn't required by the spec beyond
 * "single column" — a vertically stacked, horizontally scrollable
 * board reads fine on a phone without extra tab/swipe machinery.
 */
export function KitchenBoard({ orders, onStatusChange, onOpenDetails, updatingId, canAdvance }) {
  const grouped = COLUMNS.reduce((acc, status) => {
    acc[status] = orders.filter((o) => o.status === status);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:[&>*]:h-[calc(100vh-320px)]">
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
import { KitchenColumn } from "./KitchenColumn";

const ALL_COLUMNS = ["PENDING", "PREPARING", "READY", "SERVED"];

export function KitchenBoard({ orders, onStatusChange, onOpenDetails, updatingId, canAdvance, filterStatus = "ALL" }) {
  // When a specific tab is active, show all 4 columns but highlight/filter
  const columnsToShow = ALL_COLUMNS;

  const grouped = columnsToShow.reduce((acc, s) => {
    // If a status filter is active, only show cards in the matching column;
    // other columns show empty. This way the layout never collapses to blank.
    acc[s] = filterStatus === "ALL" || filterStatus === s
      ? orders.filter(o => o.status === s)
      : [];
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" style={{ minHeight: "480px" }}>
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
  );
}

import { ChefHat } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";

export function EmptyKitchen({ hasFilters, onClearFilters }) {
  return (
    <EmptyState
      icon={ChefHat}
      title={hasFilters ? "No orders match your filters" : "No orders in the kitchen yet"}
      description={
        hasFilters
          ? "Try clearing the search or status filter."
          : "New orders sent from the POS will appear here instantly."
      }
      actionLabel={hasFilters ? "Clear filters" : undefined}
      onAction={hasFilters ? onClearFilters : undefined}
    />
  );
}
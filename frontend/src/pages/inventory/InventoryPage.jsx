import { Boxes } from "lucide-react";
import { ComingSoonPage } from "@/components/common/ComingSoonPage";

export function InventoryPage() {
  return (
    <ComingSoonPage
      title="Inventory"
      description="Ingredients, suppliers, purchase orders, and stock levels."
      icon={Boxes}
      phaseNote="Ingredient tables, low-stock alerts, and purchase order management arrive in Phase 5 of the frontend roadmap."
    />
  );
}

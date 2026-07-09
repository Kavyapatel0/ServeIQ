import { UtensilsCrossed } from "lucide-react";
import { ComingSoonPage } from "@/components/common/ComingSoonPage";

export function POSPage() {
  return (
    <ComingSoonPage
      title="Point of Sale"
      description="Take orders, manage tables, and process payments."
      icon={UtensilsCrossed}
      phaseNote="The full POS experience — menu grid, cart, table selection, and billing — arrives in Phase 3 of the frontend roadmap."
    />
  );
}

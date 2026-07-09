import { ChefHat } from "lucide-react";
import { ComingSoonPage } from "@/components/common/ComingSoonPage";

export function KitchenPage() {
  return (
    <ComingSoonPage
      title="Kitchen Dashboard"
      description="Track every order from pending to served, in real time."
      icon={ChefHat}
      phaseNote="The Kanban-style kitchen queue with live Socket.IO updates arrives in Phase 4 of the frontend roadmap."
    />
  );
}

import { Users } from "lucide-react";
import { ComingSoonPage } from "@/components/common/ComingSoonPage";

export function CRMPage() {
  return (
    <ComingSoonPage
      title="CRM"
      description="Customer profiles, loyalty points, and coupon campaigns."
      icon={Users}
      phaseNote="Customer profiles, visit history, and loyalty management arrive in Phase 6 of the frontend roadmap."
    />
  );
}

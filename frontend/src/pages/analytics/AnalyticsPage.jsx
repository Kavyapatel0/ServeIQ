import { BarChart3 } from "lucide-react";
import { ComingSoonPage } from "@/components/common/ComingSoonPage";

export function AnalyticsPage() {
  return (
    <ComingSoonPage
      title="Analytics"
      description="Revenue, sales trends, peak hours, and top-selling items."
      icon={BarChart3}
      phaseNote="The full analytics suite — revenue charts, payment breakdowns, and customer growth — arrives in Phase 7 of the frontend roadmap."
    />
  );
}

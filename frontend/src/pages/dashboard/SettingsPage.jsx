import { Settings } from "lucide-react";
import { ComingSoonPage } from "@/components/common/ComingSoonPage";

export function SettingsPage() {
  return (
    <ComingSoonPage
      title="Settings"
      description="Theme, notification, and account preferences."
      icon={Settings}
      phaseNote="Account and workspace settings will be added alongside the Administration module in Phase 8."
    />
  );
}

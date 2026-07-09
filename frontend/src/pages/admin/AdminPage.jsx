import { ShieldCheck } from "lucide-react";
import { ComingSoonPage } from "@/components/common/ComingSoonPage";

export function AdminPage() {
  return (
    <ComingSoonPage
      title="Administration"
      description="Users, roles, permissions, branches, and audit logs."
      icon={ShieldCheck}
      phaseNote="User management, RBAC configuration, and the audit log viewer arrive in Phase 8 of the frontend roadmap."
    />
  );
}

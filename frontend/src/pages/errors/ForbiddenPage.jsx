import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-app-bg px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-bg">
        <ShieldAlert className="h-7 w-7 text-red-600" />
      </div>
      <p className="text-sm font-semibold text-red-600">403</p>
      <h1 className="mt-2 text-2xl font-bold text-text-primary">You don't have access to this</h1>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        Your role doesn't include permission for this page. Ask a manager or Super Admin if you need access.
      </p>
      <Button asChild className="mt-8">
        <Link to={ROUTES.DASHBOARD}>Back to Dashboard</Link>
      </Button>
    </div>
  );
}

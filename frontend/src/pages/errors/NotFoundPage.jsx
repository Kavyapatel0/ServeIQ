import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-app-bg px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
        <Compass className="h-7 w-7 text-brand-600" />
      </div>
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-bold text-text-primary">This page doesn't exist</h1>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        The page you're looking for may have been moved, renamed, or never existed.
      </p>
      <Button asChild className="mt-8">
        <Link to={ROUTES.DASHBOARD}>Back to Dashboard</Link>
      </Button>
    </div>
  );
}

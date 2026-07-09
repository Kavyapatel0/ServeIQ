import { Loader2 } from "lucide-react";

export function PageLoader({ label = "Loading ServeIQ…" }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-app-bg">
      <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  );
}

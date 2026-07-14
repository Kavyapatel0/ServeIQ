import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const toLabel = (segment) =>
    segment
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return (
    <nav className="mb-1 flex items-center gap-1 text-xs text-text-secondary" aria-label="Breadcrumb">
      <Link
        to="/"
        className="flex items-center rounded-sm p-0.5 text-text-secondary transition-colors hover:text-primary-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((segment, i) => {
        const path = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-warm-400" />
            {isLast ? (
              <span className="font-semibold text-text-primary">{toLabel(segment)}</span>
            ) : (
              <Link
                to={path}
                className="transition-colors hover:text-primary-600 focus-visible:outline-none"
              >
                {toLabel(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

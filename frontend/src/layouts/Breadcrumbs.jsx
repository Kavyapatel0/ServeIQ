import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

/**
 * Auto-derives breadcrumb segments from the current URL path, e.g.
 * /inventory/purchase-orders -> Home / Inventory / Purchase Orders.
 * Segments are title-cased and hyphens become spaces — good enough
 * for every route in this app without a manual breadcrumb map.
 */
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
    <nav className="mb-1 flex items-center gap-1.5 text-sm text-text-secondary">
      <Link to="/" className="flex items-center hover:text-text-primary">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((segment, i) => {
        const path = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5" />
            {isLast ? (
              <span className="font-medium text-text-primary">{toLabel(segment)}</span>
            ) : (
              <Link to={path} className="hover:text-text-primary">
                {toLabel(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

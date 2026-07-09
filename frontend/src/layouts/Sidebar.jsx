import { NavLink } from "react-router-dom";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Logo } from "@/components/common/Logo";
import { NAV_ITEMS } from "@/constants/navigation";
import { usePermission } from "@/hooks/usePermission";
import { toggleSidebar, selectSidebarCollapsed } from "@/redux/slices/uiSlice";
import { cn } from "@/utils/cn";

/**
 * Dark navy sidebar (#0F172A scale) — the enterprise anchor of the
 * design brief, deliberately not white, so cards read as bright
 * surfaces floating on a calm, serious frame.
 *
 * Nav items self-filter by permission: NAV_ITEMS carries a
 * `permission` key per item, and anything the current role can't
 * access simply never renders — no role-name branching here at all.
 */
export function Sidebar() {
  const dispatch = useDispatch();
  const collapsed = useSelector(selectSidebarCollapsed);
  const { can } = usePermission();

  const visibleItems = NAV_ITEMS.filter((item) => can(item.permission));

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col bg-navy-900 transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center border-b border-white/10 px-4">
        <Logo variant="dark" collapsed={collapsed} />
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-500/10 text-white"
                  : "text-navy-400 hover:bg-white/5 hover:text-white"
              )
            }
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-brand-500" />
                )}
                <item.icon
                  className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-brand-400")}
                  strokeWidth={2}
                />
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-navy-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
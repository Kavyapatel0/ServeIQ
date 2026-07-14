import { NavLink } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";

import { Logo } from "@/components/common/Logo";
import { NAV_ITEMS } from "@/constants/navigation";
import { usePermission } from "@/hooks/usePermission";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  toggleSidebar,
  closeMobileSidebar,
  selectSidebarCollapsed,
  selectMobileSidebarOpen,
} from "@/redux/slices/uiSlice";
import { cn } from "@/utils/cn";

export function Sidebar() {
  const dispatch = useDispatch();
  const collapsed = useSelector(selectSidebarCollapsed);
  const mobileOpen = useSelector(selectMobileSidebarOpen);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { can } = usePermission();

  const visibleItems = NAV_ITEMS.filter((item) => can(item.permission));
  const closeOnMobile = () => {
    if (!isDesktop) dispatch(closeMobileSidebar());
  };

  const navList = (isCollapsed) => (
    <nav className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
      {visibleItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/"}
          onClick={closeOnMobile}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
              isActive
                ? "bg-white/12 text-white shadow-sm"
                : "text-forest-200 hover:bg-white/8 hover:text-white"
            )
          }
          title={isCollapsed ? item.label : undefined}
        >
          {({ isActive }) => (
            <>
              {/* Active left indicator */}
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-full bg-accent-400"
                />
              )}

              {/* Icon */}
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-forest-300 group-hover:text-white"
                )}
                strokeWidth={isActive ? 2.25 : 1.75}
              />

              {/* Label */}
              {!isCollapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}

              {/* Active dot when collapsed */}
              {isCollapsed && isActive && (
                <span className="absolute right-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent-400" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  // ── Mobile drawer ─────────────────────────────────────────────────────
  if (!isDesktop) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-forest-900/60 backdrop-blur-sm"
              onClick={() => dispatch(closeMobileSidebar())}
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col shadow-sidebar"
              style={{ backgroundColor: "#2b4a3c" }}
            >
              <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
                <Logo variant="dark" collapsed={false} />
                <button
                  onClick={() => dispatch(closeMobileSidebar())}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-forest-200 transition-colors hover:bg-white/8 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {navList(false)}
              <SidebarFooterSection collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // ── Desktop rail ──────────────────────────────────────────────────────
  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col shadow-sidebar transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-60"
      )}
      style={{ backgroundColor: "#2b4a3c" }}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-white/10",
        collapsed ? "justify-center px-2" : "px-4"
      )}>
        <Logo variant="dark" collapsed={collapsed} />
      </div>

      {navList(collapsed)}

      <SidebarFooterSection collapsed={collapsed} onToggle={() => dispatch(toggleSidebar())} />
    </aside>
  );
}

function SidebarFooterSection({ collapsed, onToggle }) {
  return (
    <div className="border-t border-white/10 p-3">
      {onToggle && (
        <button
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-2 rounded-xl py-2.5 text-sm font-medium text-forest-200 transition-colors hover:bg-white/8 hover:text-white",
            collapsed ? "justify-center px-0" : "justify-start px-3"
          )}
        >
          {collapsed
            ? <ChevronsRight className="h-4 w-4" />
            : (<><ChevronsLeft className="h-4 w-4" /><span>Collapse</span></>)
          }
        </button>
      )}
      {/* Version tag */}
      {!collapsed && (
        <p className="mt-2 px-3 text-[10px] font-medium text-forest-300/50 uppercase tracking-wider">
          v1.0 · Fine Dining OS
        </p>
      )}
    </div>
  );
}

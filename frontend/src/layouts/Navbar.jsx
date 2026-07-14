import { useNavigate } from "react-router-dom";
import { Bell, Search, LogOut, User, Settings, ChevronDown, Menu, Sparkles } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import { selectNotifications, selectUnreadCount } from "@/redux/slices/notificationSlice";
import { toggleMobileSidebar } from "@/redux/slices/uiSlice";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils/cn";

const ROLE_COLORS = {
  "Super Admin":       "bg-accent-100 text-accent-700 ring-accent-200",
  "Branch Manager":    "bg-primary-100 text-primary-700 ring-primary-200",
  "Cashier":           "bg-info-bg text-info-text ring-blue-200",
  "Chef":              "bg-warning-bg text-warning-text ring-yellow-200",
  "Waiter":            "bg-success-bg text-success-text ring-green-200",
  "Inventory Manager": "bg-warm-100 text-warm-700 ring-warm-300",
};

export function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const unreadCount = useSelector(selectUnreadCount);
  const notifications = useSelector(selectNotifications);

  const roleStyle = ROLE_COLORS[user?.role] ?? "bg-warm-100 text-warm-700 ring-warm-300";

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-md sm:px-6">

      {/* Hamburger — mobile only */}
      <button
        onClick={() => dispatch(toggleMobileSidebar())}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-warm-200 hover:text-text-primary lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search bar */}
      <div className="relative flex-1 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
        <input
          type="search"
          placeholder="Search orders, customers, ingredients…"
          className={cn(
            "h-9 w-full rounded-xl border border-border bg-warm-100/80 pl-8.5 pr-3 text-sm",
            "text-text-primary placeholder:text-text-secondary",
            "transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-surface",
            "hover:border-warm-400"
          )}
          style={{ paddingLeft: "2.125rem" }}
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">

        {/* Notification bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-warm-200 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[9px] font-bold text-white ring-2 ring-surface"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2.5 py-2">
              <DropdownMenuLabel className="p-0 text-sm font-semibold text-text-primary">
                Notifications
              </DropdownMenuLabel>
              {unreadCount > 0 && (
                <span className="text-xs text-primary-600 font-medium">{unreadCount} new</span>
              )}
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <Sparkles className="h-6 w-6 text-warm-300" />
                <p className="text-sm font-medium text-text-secondary">You're all caught up</p>
                <p className="text-xs text-text-disabled">No new notifications</p>
              </div>
            ) : (
              notifications.slice(0, 6).map((n) => (
                <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5 py-2.5">
                  <span className="text-sm font-semibold text-text-primary">{n.title}</span>
                  <span className="text-xs text-text-secondary">{n.message}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="h-6 w-px bg-border mx-0.5" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-warm-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
              <Avatar className="h-8 w-8 ring-2 ring-primary-200">
                <AvatarFallback className="text-xs font-bold">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight sm:block">
                <p className="text-sm font-semibold text-text-primary">{user?.name}</p>
                <span className={cn(
                  "mt-0.5 inline-flex items-center rounded-full px-1.5 py-0 text-[10px] font-semibold ring-1",
                  roleStyle
                )}>
                  {user?.role}
                </span>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-text-secondary sm:block" strokeWidth={2} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2.5 py-2.5">
              <p className="text-sm font-semibold text-text-primary truncate">{user?.name}</p>
              <p className="text-xs text-text-secondary truncate mt-0.5">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate(ROUTES.PROFILE)}>
              <User className="h-4 w-4 text-text-secondary" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate(ROUTES.SETTINGS)}>
              <Settings className="h-4 w-4 text-text-secondary" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleLogout}
              className="text-danger-text focus:bg-danger-bg focus:text-danger-text"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

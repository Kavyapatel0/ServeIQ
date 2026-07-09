import { useNavigate } from "react-router-dom";
import { Bell, Search, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useSelector } from "react-redux";

import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import { selectNotifications, selectUnreadCount } from "@/redux/slices/notificationSlice";

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

/**
 * Top navigation bar: global search (wired module-by-module as each
 * page ships), notification bell (backed by notificationSlice, ready
 * for Socket.IO push once Kitchen/POS phases add listeners), and the
 * user profile menu with logout.
 */
export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const unreadCount = useSelector(selectUnreadCount);
  const notifications = useSelector(selectNotifications);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-6 backdrop-blur-sm">
      {/* Global search */}
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="search"
          placeholder="Search orders, customers, ingredients…"
          className="h-10 w-full rounded-input border border-border bg-app-bg pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-app-bg hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-semibold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <p className="px-2.5 py-6 text-center text-sm text-text-secondary">
                You're all caught up.
              </p>
            ) : (
              notifications.slice(0, 6).map((n) => (
                <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5">
                  <span className="font-medium">{n.title}</span>
                  <span className="text-xs text-text-secondary">{n.message}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg py-1.5 pl-2 pr-2.5 transition-colors hover:bg-app-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight sm:block">
              <p className="text-sm font-medium text-text-primary">{user?.name}</p>
              <Badge variant="brand" className="mt-0.5 px-1.5 py-0 text-[10px]">
                {user?.role}
              </Badge>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-text-secondary sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate(ROUTES.PROFILE)}>
              <User className="h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate(ROUTES.SETTINGS)}>
              <Settings className="h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout} className="text-red-600 focus:bg-danger-bg focus:text-red-700">
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Bell, Palette, Shield, Info, ChevronRight,
  Check, Monitor, Sun, Moon, Volume2,
  Mail, Smartphone, Clock, Database, LogOut,
  UtensilsCrossed, Heart, Building2, MapPin, Phone, ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

/* ─── Sidebar nav items ───────────────────────────────────────── */
const NAV = [
  { id: "profile",        label: "Profile",           icon: User      },
  { id: "appearance",     label: "Appearance",         icon: Palette   },
  { id: "notifications",  label: "Notifications",      icon: Bell      },
  { id: "restaurant",     label: "Restaurant Info",    icon: UtensilsCrossed },
  { id: "branch",         label: "Branch Info",        icon: Building2 },
  { id: "security",       label: "Security",           icon: Shield    },
  { id: "about",          label: "About ServeIQ",      icon: Info      },
];

/* ─── Reusable primitives ─────────────────────────────────────── */
function SettingRow({ label, description, children, borderBottom = true }) {
  return (
    <div className={cn(
      "flex items-center justify-between gap-6 py-4",
      borderBottom && "border-b border-warm-100 last:border-0"
    )}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        {description && <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingSection({ title, description, children }) {
  return (
    <div className="rounded-card border border-warm-200 bg-surface card-shadow overflow-hidden">
      <div className="border-b border-warm-100 px-6 py-4">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-text-secondary">{description}</p>}
      </div>
      <div className="px-6">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
        checked ? "bg-primary-500" : "bg-warm-300",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className={cn(
        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform duration-200",
        checked && "translate-x-5"
      )} />
    </button>
  );
}

function ThemeButton({ label, icon: Icon, value, current, onChange }) {
  const active = current === value;
  return (
    <button
      onClick={() => onChange(value)}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-150 w-24",
        active
          ? "border-primary-500 bg-primary-50"
          : "border-warm-200 bg-warm-50 hover:border-warm-400 hover:bg-warm-100"
      )}
    >
      <Icon className={cn("h-5 w-5", active ? "text-primary-600" : "text-text-secondary")} strokeWidth={1.75} />
      <span className={cn("text-xs font-semibold", active ? "text-primary-700" : "text-text-secondary")}>
        {label}
      </span>
      {active && <Check className="h-3 w-3 text-primary-600" />}
    </button>
  );
}

/* ─── Section panels ──────────────────────────────────────────── */
function ProfileSection({ user }) {
  return (
    <div className="space-y-5">
      <SettingSection title="Personal Information" description="Your account details as registered in the system.">
        {[
          { label: "Full Name",    value: user?.name    ?? "—" },
          { label: "Email",        value: user?.email   ?? "—" },
          { label: "Role",         value: user?.role    ?? "—" },
          { label: "Branch",       value: user?.branch_id ? `Branch #${user.branch_id}` : "All Branches" },
          { label: "Account ID",   value: `#${user?.id}` },
        ].map(({ label, value }) => (
          <SettingRow key={label} label={label}>
            <span className="text-sm text-text-secondary max-w-[220px] truncate text-right">{value}</span>
          </SettingRow>
        ))}
        <div className="py-3">
          <p className="text-xs text-text-disabled">
            To update your name or email, please contact your Branch Manager or Super Admin.
          </p>
        </div>
      </SettingSection>
    </div>
  );
}

function AppearanceSection() {
  const [theme,   setTheme]   = useState("system");
  const [density, setDensity] = useState("comfortable");

  return (
    <div className="space-y-5">
      <SettingSection title="Theme" description="Choose how ServeIQ looks on your device.">
        <div className="py-4 flex gap-3">
          <ThemeButton label="Light"  icon={Sun}     value="light"  current={theme} onChange={setTheme} />
          <ThemeButton label="Dark"   icon={Moon}    value="dark"   current={theme} onChange={setTheme} />
          <ThemeButton label="System" icon={Monitor} value="system" current={theme} onChange={setTheme} />
        </div>
        <div className="pb-2">
          <p className="text-xs text-text-disabled">Dark mode coming in a future update. System follows your OS preference.</p>
        </div>
      </SettingSection>

      <SettingSection title="Display" description="Adjust how dense the interface feels.">
        <SettingRow label="Interface Density" description="Choose how compact the UI feels" borderBottom={false}>
          <div className="flex rounded-input border border-warm-200 overflow-hidden">
            {["comfortable", "compact"].map(v => (
              <button
                key={v}
                onClick={() => setDensity(v)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold transition-colors capitalize",
                  density === v ? "bg-primary-500 text-white" : "bg-surface text-text-secondary hover:bg-warm-100"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </SettingRow>
      </SettingSection>
    </div>
  );
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    new_order:       true,
    kitchen_update:  true,
    low_stock:       true,
    payment_success: true,
    daily_summary:   false,
    marketing:       false,
    sound:           true,
  });

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const groups = [
    {
      title: "Order Alerts",
      description: "Notifications for order and payment activity.",
      items: [
        { key: "new_order",       label: "New Order Placed",      desc: "Get notified when a new order is created" },
        { key: "kitchen_update",  label: "Kitchen Status Updates", desc: "Alerts when orders move through kitchen stages" },
        { key: "payment_success", label: "Payment Completed",      desc: "Confirmation when a payment is processed" },
      ],
    },
    {
      title: "Inventory Alerts",
      description: "Stay on top of stock levels.",
      items: [
        { key: "low_stock", label: "Low Stock Warning", desc: "Alert when ingredients fall below minimum stock" },
      ],
    },
    {
      title: "Reports & Summaries",
      description: "Scheduled reports delivered to your account.",
      items: [
        { key: "daily_summary", label: "Daily Revenue Summary", desc: "End-of-day revenue report for your branch" },
        { key: "marketing",     label: "Product Updates",       desc: "New features and platform announcements" },
      ],
    },
    {
      title: "Sound",
      description: "Audio feedback for kitchen and order events.",
      items: [
        { key: "sound", label: "Enable Sound Alerts", desc: "Play a chime when new orders arrive" },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <SettingSection key={group.title} title={group.title} description={group.description}>
          {group.items.map(({ key, label, desc }) => (
            <SettingRow key={key} label={label} description={desc}>
              <Toggle checked={prefs[key]} onChange={() => toggle(key)} />
            </SettingRow>
          ))}
        </SettingSection>
      ))}
    </div>
  );
}

function SecuritySection({ user, onLogout }) {
  const sessions = [
    { device: "Chrome · Windows 11",   location: "Ahmedabad, India", time: "Active now",        current: true  },
    { device: "Safari · iPhone 15",     location: "Ahmedabad, India", time: "2 days ago",        current: false },
  ];

  return (
    <div className="space-y-5">
      <SettingSection title="Password" description="Manage your account password and authentication.">
        <SettingRow label="Password" description="Last changed: Not available">
          <a
            href={ROUTES.PROFILE}
            className="rounded-input border border-warm-300 bg-warm-50 px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-warm-100 transition-colors"
          >
            Change Password
          </a>
        </SettingRow>
        <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security (coming soon)" borderBottom={false}>
          <span className="rounded-full bg-warm-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-warm-600">
            Coming Soon
          </span>
        </SettingRow>
      </SettingSection>

      <SettingSection title="Active Sessions" description="Devices currently logged into your account.">
        <div className="divide-y divide-warm-100">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-4 last:pb-0">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  s.current ? "bg-primary-100" : "bg-warm-100"
                )}>
                  <Monitor className={cn("h-4 w-4", s.current ? "text-primary-600" : "text-text-secondary")} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                    {s.device}
                    {s.current && (
                      <span className="inline-flex h-4 items-center rounded-full bg-success-bg px-1.5 text-[10px] font-bold text-success-text">
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-text-secondary">{s.location} · {s.time}</p>
                </div>
              </div>
              {!s.current && (
                <button className="text-xs font-semibold text-danger hover:text-red-700 transition-colors">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </SettingSection>

      <SettingSection title="Danger Zone" description="Irreversible account actions.">
        <div className="py-3">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-input border border-danger/30 bg-danger-bg px-4 py-2.5 text-sm font-semibold text-danger-text hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out of ServeIQ
          </button>
        </div>
      </SettingSection>
    </div>
  );
}

function AboutSection() {
  const items = [
    { label: "Platform",     value: "ServeIQ — Restaurant BI Platform" },
    { label: "Version",      value: "v1.0.0 (Production)" },
    { label: "Environment",  value: "Production" },
    { label: "API Base",     value: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api" },
    { label: "Stack",        value: "React · Node.js · MySQL" },
    { label: "Built for",    value: "Fine Dining Restaurants, Ahmedabad" },
  ];

  return (
    <div className="space-y-5">
      <SettingSection title="Platform Information" description="Technical details about this ServeIQ installation.">
        {items.map(({ label, value }) => (
          <SettingRow key={label} label={label}>
            <span className="text-sm text-text-secondary text-right max-w-[220px] truncate font-mono text-xs">{value}</span>
          </SettingRow>
        ))}
      </SettingSection>

      <div className="rounded-card border border-warm-200 bg-surface card-shadow overflow-hidden">
        <div className="flex flex-col items-center gap-4 px-8 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500 shadow-card">
            <UtensilsCrossed className="h-8 w-8 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">ServeIQ</h3>
            <p className="text-sm text-text-secondary mt-1">Fine Dining Operations Platform</p>
            <p className="mt-1 text-xs text-text-disabled">
              Version 1.0.0 · Built with{" "}
              <Heart className="inline h-3 w-3 text-danger" fill="currentColor" /> for fine dining restaurants
            </p>
          </div>
          <div className="mt-2 rounded-full bg-warm-100 px-4 py-1.5 text-xs text-text-secondary">
            © {new Date().getFullYear()} ServeIQ. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

function RestaurantInfoSection() {
  const info = [
    { label: "Restaurant Name",     value: "The Grand Spice Fine Dining" },
    { label: "Cuisine Type",        value: "Multi-Cuisine Fine Dining"   },
    { label: "City",                value: "Ahmedabad, Gujarat, India"   },
    { label: "GST Number",          value: "24AAAAA0000A1Z5"             },
    { label: "Operating Hours",     value: "12:00 PM – 11:00 PM"        },
    { label: "Currency",            value: "Indian Rupee (₹ INR)"        },
    { label: "Tax Rate",            value: "5% GST"                     },
  ];
  return (
    <div className="space-y-5">
      <SettingSection title="Restaurant Information" description="Core details about your restaurant registered in ServeIQ.">
        {info.map(({ label, value }) => (
          <SettingRow key={label} label={label}>
            <span className="text-sm text-text-secondary text-right max-w-[220px] truncate">{value}</span>
          </SettingRow>
        ))}
        <div className="py-3">
          <p className="text-xs text-text-disabled">Restaurant details are managed by Super Admin. Contact support to update.</p>
        </div>
      </SettingSection>
    </div>
  );
}

function BranchInfoSection({ user }) {
  const branchData = [
    { label: "Branch Name",     value: user?.branch_id ? `Branch #${user.branch_id}` : "All Branches (Super Admin)",   icon: Building2 },
    { label: "Branch ID",       value: user?.branch_id ? `#${user.branch_id}` : "N/A",  icon: Database  },
    { label: "Your Role",       value: user?.role ?? "—",        icon: Shield    },
    { label: "Access Level",    value: user?.branch_id ? "Branch-scoped" : "Platform-wide",  icon: Shield },
  ];
  return (
    <div className="space-y-5">
      <SettingSection title="Branch Information" description="Your assigned branch and access scope within ServeIQ.">
        {branchData.map(({ label, value, icon: Icon }) => (
          <SettingRow key={label} label={label}>
            <div className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-text-disabled" strokeWidth={1.75} />
              <span className="text-sm font-medium text-text-secondary">{value}</span>
            </div>
          </SettingRow>
        ))}
        <div className="py-3">
          <p className="text-xs text-text-disabled">Branch assignments are managed by Super Admin from the Administration module.</p>
        </div>
      </SettingSection>

      <SettingSection title="Permissions Summary" description="Key capabilities granted to your role.">
        <div className="py-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            "View Dashboard", "Place Orders", "View Analytics", "Manage Kitchen",
            "View Inventory", "Access CRM", "Manage Users", "View Reports",
          ].map((perm, i) => {
            const granted = i < (user?.role === "Super Admin" ? 8 : user?.role === "Branch Manager" ? 6 : user?.role === "Cashier" ? 3 : user?.role === "Chef" ? 2 : user?.role === "Waiter" ? 2 : 4);
            return (
              <div key={perm} className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
                granted ? "bg-success-bg text-success-text" : "bg-warm-100 text-text-disabled line-through"
              )}>
                <div className={cn("h-2 w-2 rounded-full", granted ? "bg-success" : "bg-warm-300")} />
                {perm}
              </div>
            );
          })}
        </div>
      </SettingSection>
    </div>
  );
}

/* ─── Main SettingsPage ───────────────────────────────────────── */
export function SettingsPage() {
  const [activeNav, setActiveNav] = useState("profile");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully.");
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const PANELS = {
    profile:       <ProfileSection user={user} />,
    appearance:    <AppearanceSection />,
    notifications: <NotificationsSection />,
    restaurant:    <RestaurantInfoSection />,
    branch:        <BranchInfoSection user={user} />,
    security:      <SecuritySection user={user} onLogout={handleLogout} />,
    about:         <AboutSection />,
  };

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your profile, appearance, notifications, and security preferences."
      />

      <div className="flex flex-col gap-6 lg:flex-row">

        {/* ── Left sidebar nav ──────────────────────────────── */}
        <aside className="lg:w-56 shrink-0">
          <nav className="flex flex-row gap-1 overflow-x-auto rounded-card border border-warm-200 bg-surface p-1.5 card-shadow lg:flex-col">
            {NAV.map((item) => {
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-150 text-left w-full",
                    active
                      ? "bg-primary-500 text-white shadow-soft"
                      : "text-text-secondary hover:bg-warm-100 hover:text-text-primary"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-text-disabled")} strokeWidth={active ? 2.25 : 1.75} />
                  {item.label}
                  {!active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-warm-300 hidden lg:block" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Right content panel ───────────────────────────── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {PANELS[activeNav]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  User, Mail, Shield, Building2, Calendar, Clock,
  Lock, Eye, EyeOff, CheckCircle2, Edit3, Award,
  Activity, LogIn, Utensils,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials, formatDate } from "@/utils/format";
import { changePassword } from "@/services/settingsApi";
import { cn } from "@/utils/cn";

const pwSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password:     z.string().min(8, "At least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

const ROLE_COLORS = {
  "Super Admin":       "default",
  "Branch Manager":    "brand",
  "Cashier":           "info",
  "Chef":              "warning",
  "Waiter":            "success",
  "Inventory Manager": "warm",
};

const ROLE_DESCRIPTIONS = {
  "Super Admin":       "Full platform access across all branches",
  "Branch Manager":    "Manages daily operations for assigned branch",
  "Cashier":           "Handles POS, orders and customer billing",
  "Chef":              "Manages kitchen queue and meal preparation",
  "Waiter":            "Takes orders and serves customers at tables",
  "Inventory Manager": "Manages stock, suppliers and purchase orders",
};

function PasswordField({ label, id, register, error, show, onToggle }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
        <input
          id={id}
          type={show ? "text" : "password"}
          className={cn(
            "h-10 w-full rounded-input border bg-warm-50 pl-10 pr-10 text-sm text-text-primary",
            "placeholder:text-text-disabled transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-surface",
            "hover:border-warm-400",
            error ? "border-danger ring-1 ring-danger/20" : "border-warm-200"
          )}
          {...register}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-secondary transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error.message}</p>}
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving,    setPwSaving]    = useState(false);
  const [pwSuccess,   setPwSuccess]   = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(pwSchema) });

  const onChangePassword = async (data) => {
    setPwSaving(true);
    setPwSuccess(false);
    try {
      await changePassword({
        current_password: data.current_password,
        new_password:     data.new_password,
      });
      toast.success("Password updated successfully.");
      setPwSuccess(true);
      reset();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to update password.");
    } finally {
      setPwSaving(false);
    }
  };

  const roleDesc   = ROLE_DESCRIPTIONS[user?.role] ?? "Platform user";
  const roleVariant = ROLE_COLORS[user?.role] ?? "outline";

  const stats = [
    { label: "Member Since", value: user?.created_at ? formatDate(user.created_at) : "Jan 2026", icon: Calendar },
    { label: "Account Status", value: "Active",   icon: CheckCircle2, green: true },
    { label: "Sessions",       value: "Secure",   icon: Shield },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="My Profile"
        description="View and manage your personal account settings."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── Left: Identity card ───────────────────────────────── */}
        <div className="flex flex-col gap-6 lg:col-span-1">

          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-card border border-warm-200 bg-surface card-shadow overflow-hidden"
          >
            {/* Header banner */}
            <div className="h-24 w-full"
              style={{ background: "linear-gradient(135deg, #2b4a3c 0%, #355c4b 50%, #4d7a62 100%)" }}
            />

            <div className="px-6 pb-6">
              {/* Avatar overlapping banner */}
              <div className="-mt-10 mb-4 flex items-end justify-between">
                <div className="ring-4 ring-surface rounded-full">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-xl font-bold bg-primary-500 text-white">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <Badge variant={roleVariant} className="mb-1">{user?.role}</Badge>
              </div>

              <h2 className="text-xl font-bold text-text-primary leading-tight">{user?.name}</h2>
              <p className="mt-0.5 text-sm text-text-secondary">{user?.email}</p>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">{roleDesc}</p>

              <div className="mt-4 space-y-2.5">
                {[
                  { icon: Mail,      label: user?.email },
                  { icon: Shield,    label: user?.role },
                  { icon: Building2, label: user?.branch_id ? `Branch #${user.branch_id}` : "All Branches" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <Icon className="h-4 w-4 shrink-0 text-primary-400" strokeWidth={1.75} />
                    <span className="truncate">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-card border border-warm-200 bg-surface card-shadow p-5"
          >
            <h3 className="mb-4 text-sm font-semibold text-text-primary flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary-500" strokeWidth={1.75} />
              Account Overview
            </h3>
            <div className="space-y-3">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-xl bg-warm-50 border border-warm-100 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <s.icon className={cn("h-4 w-4", s.green ? "text-success" : "text-primary-400")} strokeWidth={1.75} />
                    <span className="text-sm text-text-secondary">{s.label}</span>
                  </div>
                  <span className={cn("text-sm font-semibold", s.green ? "text-success-text" : "text-text-primary")}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Right: Details + Security ─────────────────────────── */}
        <div className="flex flex-col gap-6 lg:col-span-2">

          {/* Account Details */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-card border border-warm-200 bg-surface card-shadow"
          >
            <div className="flex items-center justify-between border-b border-warm-100 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                  <User className="h-4 w-4 text-primary-600" strokeWidth={1.75} />
                </div>
                <h3 className="text-base font-semibold text-text-primary">Account Details</h3>
              </div>
              <span className="text-xs text-text-disabled">Read-only · Contact admin to edit</span>
            </div>

            <div className="divide-y divide-warm-100">
              {[
                { label: "Full Name",      value: user?.name,       icon: User },
                { label: "Email Address",  value: user?.email,      icon: Mail },
                { label: "Role",           value: user?.role,       icon: Shield },
                { label: "Branch Access",  value: user?.branch_id ? `Branch #${user.branch_id}` : "All Branches (Super Admin)", icon: Building2 },
                { label: "User ID",        value: `#${user?.id}`,   icon: Utensils },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between px-6 py-4 hover:bg-warm-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-text-disabled" strokeWidth={1.75} />
                    <span className="text-sm text-text-secondary">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-text-primary max-w-[280px] truncate text-right">
                    {value ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-card border border-warm-200 bg-surface card-shadow"
          >
            <div className="flex items-center gap-2.5 border-b border-warm-100 px-6 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-100">
                <Lock className="h-4 w-4 text-accent-600" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Change Password</h3>
            </div>

            <div className="p-6">
              {pwSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-center gap-3 rounded-xl border border-success/25 bg-success-bg px-4 py-3"
                >
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  <p className="text-sm font-medium text-success-text">Password updated successfully!</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4" noValidate>
                <PasswordField
                  label="Current Password" id="current_password"
                  register={register("current_password")} error={errors.current_password}
                  show={showCurrent} onToggle={() => setShowCurrent(v => !v)}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <PasswordField
                    label="New Password" id="new_password"
                    register={register("new_password")} error={errors.new_password}
                    show={showNew} onToggle={() => setShowNew(v => !v)}
                  />
                  <PasswordField
                    label="Confirm New Password" id="confirm_password"
                    register={register("confirm_password")} error={errors.confirm_password}
                    show={showConfirm} onToggle={() => setShowConfirm(v => !v)}
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-text-disabled">Minimum 8 characters required</p>
                  <Button type="submit" size="sm" loading={pwSaving}>
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Security info */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-card border border-warm-200 bg-surface card-shadow"
          >
            <div className="flex items-center gap-2.5 border-b border-warm-100 px-6 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info-bg">
                <LogIn className="h-4 w-4 text-info" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Session & Security</h3>
            </div>
            <div className="grid grid-cols-1 gap-px bg-warm-100 sm:grid-cols-3">
              {[
                { label: "Authentication", value: "JWT Token",     status: "Secure" },
                { label: "Session Type",   value: "Browser",       status: "Active" },
                { label: "Permissions",    value: user?.role ?? "—", status: "Role-based" },
              ].map((item) => (
                <div key={item.label} className="bg-surface px-5 py-4">
                  <p className="text-xs text-text-secondary mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-text-primary">{item.value}</p>
                  <p className="mt-0.5 text-[11px] text-success-text font-medium">{item.status}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

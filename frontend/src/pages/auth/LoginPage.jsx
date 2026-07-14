import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const schema = z.object({
  email:    z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from?.pathname || ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const onSubmit = async ({ email, password }) => {
    const result = await login(email, password);
    if (result.meta.requestStatus === "rejected") {
      toast.error(result.payload || "Invalid credentials. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
    >
      {/* ── Card ─────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-dialog border border-warm-200 bg-surface"
        style={{ boxShadow: "0 8px 32px -4px rgba(31,27,24,0.12), 0 2px 8px -2px rgba(31,27,24,0.06)" }}
      >
        {/* Top accent strip */}
        <div className="h-1 w-full" style={{
          background: "linear-gradient(90deg, #355c4b 0%, #4d9e84 50%, #c46a2d 100%)"
        }} />

        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 shadow-soft">
              <UtensilsCrossed className="h-5.5 w-5.5 text-white" strokeWidth={2.25}
                style={{ height: "22px", width: "22px" }} />
            </div>
            <h1 className="text-[1.6rem] font-bold tracking-tight text-text-primary">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-text-secondary">
              Sign in to your ServeIQ dashboard to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@restaurant.com"
                  className={cn(
                    "h-11 w-full rounded-input border bg-warm-50 pl-10 pr-4 text-sm text-text-primary",
                    "placeholder:text-text-disabled transition-all duration-150",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:bg-surface",
                    "hover:border-warm-400",
                    errors.email
                      ? "border-danger ring-2 ring-danger/20"
                      : "border-warm-300"
                  )}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1 text-xs font-medium text-danger">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    "h-11 w-full rounded-input border bg-warm-50 pl-10 pr-11 text-sm text-text-primary",
                    "placeholder:text-text-disabled transition-all duration-150",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:bg-surface",
                    "hover:border-warm-400",
                    errors.password
                      ? "border-danger ring-2 ring-danger/20"
                      : "border-warm-300"
                  )}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-text-disabled transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 text-xs font-medium text-danger">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading || isSubmitting}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative mt-2 flex h-11 w-full items-center justify-center gap-2 overflow-hidden",
                "rounded-button text-sm font-semibold text-white shadow-soft",
                "transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-60",
                "hover:shadow-card"
              )}
              style={{ background: "linear-gradient(135deg, #355c4b 0%, #28473a 100%)" }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <>
                  Sign in to ServeIQ
                  <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-5 text-center text-xs leading-relaxed text-text-disabled">
        Having trouble signing in? Contact your branch manager or Super Admin.
      </p>
    </motion.div>
  );
}

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, UtensilsCrossed,
  Chrome, AlertCircle, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

const schema = z.object({
  email:      z.string().min(1, "Email is required").email("Enter a valid email address"),
  password:   z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [showPw,        setShowPw]        = useState(false);
  const [showForgot,    setShowForgot]    = useState(false);
  const [forgotEmail,   setForgotEmail]   = useState("");
  const [forgotSent,    setForgotSent]    = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from?.pathname || ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const onSubmit = async ({ email, password }) => {
    const result = await login(email, password);
    if (result.meta.requestStatus === "rejected") {
      toast.error(result.payload || "Invalid email or password. Please try again.");
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    setForgotLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setForgotLoading(false);
    setForgotSent(true);
  };

  const inputCls = (hasError) => cn(
    "h-11 w-full rounded-input border bg-warm-50 pl-10 pr-4 text-sm text-text-primary",
    "placeholder:text-text-disabled transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:bg-surface",
    "hover:border-warm-400",
    hasError ? "border-danger ring-2 ring-danger/20" : "border-warm-200"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div
        className="overflow-hidden rounded-dialog border border-warm-200 bg-surface"
        style={{ boxShadow: "0 8px 32px -4px rgba(31,27,24,0.12), 0 2px 8px -2px rgba(31,27,24,0.06)" }}
      >
        {/* Top accent strip */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#355c4b 0%,#4d9e84 50%,#c46a2d 100%)" }} />

        <div className="p-8">
          {/* Header */}
          <div className="mb-7">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500 shadow-soft">
              <UtensilsCrossed style={{ height: "20px", width: "20px" }} className="text-white" strokeWidth={2.25} />
            </div>
            <h1 className="text-[1.55rem] font-bold tracking-tight text-text-primary">
              {showForgot ? "Reset password" : "Welcome back"}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {showForgot
                ? "Enter your email and we'll send a reset link."
                : "Sign in to your ServeIQ account to continue."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* ── Forgot Password Flow ─────────────────────── */}
            {showForgot ? (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {forgotSent ? (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-success/25 bg-success-bg px-4 py-6 text-center">
                    <CheckCircle2 className="h-8 w-8 text-success" strokeWidth={1.5} />
                    <div>
                      <p className="font-semibold text-success-text">Reset link sent!</p>
                      <p className="mt-0.5 text-xs text-success-text/80">Check {forgotEmail} for instructions.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
                        <input
                          type="email"
                          autoFocus
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleForgotPassword()}
                          placeholder="you@restaurant.com"
                          className={inputCls(false)}
                        />
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleForgotPassword}
                      disabled={forgotLoading}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-button text-sm font-semibold text-white shadow-soft disabled:opacity-60 hover:shadow-card transition-all"
                      style={{ background: "linear-gradient(135deg,#355c4b 0%,#28473a 100%)" }}
                    >
                      {forgotLoading ? (
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : "Send reset link"}
                    </motion.button>
                  </>
                )}
                <button
                  onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); }}
                  className="w-full text-center text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  ← Back to sign in
                </button>
              </motion.div>
            ) : (
              /* ── Main Login Form ─────────────────────────── */
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
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
                      className={cn(inputCls(!!errors.email), "pr-4")}
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="flex items-center gap-1 text-xs font-medium text-danger">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
                    <input
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={cn(inputCls(!!errors.password), "pr-11")}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-text-disabled transition-colors hover:text-text-secondary"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="flex items-center gap-1 text-xs font-medium text-danger">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2.5">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 rounded border-warm-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                    {...register("rememberMe")}
                  />
                  <label htmlFor="rememberMe" className="text-xs font-medium text-text-secondary cursor-pointer select-none">
                    Remember me for 30 days
                  </label>
                </div>

                {/* Sign in button */}
                <motion.button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  whileTap={{ scale: 0.98 }}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-button text-sm font-semibold text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-60 hover:shadow-card transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  style={{ background: "linear-gradient(135deg,#355c4b 0%,#28473a 100%)" }}
                >
                  {(isLoading || isSubmitting) ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in…
                    </span>
                  ) : (
                    <>Sign in to ServeIQ <ArrowRight className="h-4 w-4" strokeWidth={2.25} /></>
                  )}
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-warm-200" />
                  <span className="text-[11px] text-text-disabled font-medium">or continue with</span>
                  <div className="h-px flex-1 bg-warm-200" />
                </div>

                {/* Google SSO (UI only — wired to toast) */}
                <button
                  type="button"
                  onClick={() => toast.info("Google SSO will be available in a future update.")}
                  className="flex h-11 w-full items-center justify-center gap-2.5 rounded-button border border-warm-200 bg-surface text-sm font-medium text-text-primary transition-all hover:bg-warm-100 hover:border-warm-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-text-disabled">
        Having trouble? Contact your branch manager or Super Admin.
      </p>
    </motion.div>
  );
}

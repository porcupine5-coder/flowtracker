"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("flow", flow);
    
    try {
      await signIn("password", formData);
    } catch (error) {
      let toastTitle = "";
      if (error instanceof Error && error.message.includes("Invalid password")) {
        toastTitle = "Invalid password. Please try again.";
      } else {
        toastTitle =
          flow === "signIn"
            ? "Could not sign in, did you mean to sign up?"
            : "Could not sign up, did you mean to sign in?";
      }
      toast.error(toastTitle);
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-3 bg-[var(--bg)] rounded-xl p-1">
        <button
          onClick={() => setFlow("signIn")}
          className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
            flow === "signIn"
              ? "bg-[var(--primary)] text-white shadow-lg"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setFlow("signUp")}
          className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
            flow === "signUp"
              ? "bg-[var(--primary)] text-white shadow-lg"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text)]">
            {flow === "signIn" ? "Password" : "Create Password"}
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={flow === "signIn" ? "Enter your password" : "Create a secure password"}
              required
              className="w-full pl-11 pr-11 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18M10.585 10.586a2 2 0 002.828 2.828M9.878 5.093A9.953 9.953 0 0112 4.5c4.418 0 8.19 2.865 9.543 7a9.969 9.969 0 01-4.132 5.411M6.228 6.228A9.965 9.965 0 002.458 12c1.353 4.135 5.125 7 9.542 7a9.95 9.95 0 003.273-.546"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {flow === "signUp" && (
            <p className="text-xs text-[var(--text-muted)] mt-1.5">
              Use at least 8 characters with a mix of letters, numbers, and symbols
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[#d97706] hover:shadow-lg text-white font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {flow === "signIn" ? "Signing in..." : "Creating account..."}
            </span>
          ) : (
            <span>{flow === "signIn" ? "Sign in" : "Create account"}</span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-xs text-[var(--text-muted)] font-medium">OR</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      {/* Anonymous Sign In */}
      <button
        onClick={() => void signIn("anonymous")}
        className="w-full py-3 px-4 rounded-xl border-2 border-[var(--border)] bg-transparent text-[var(--text)] font-semibold hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Continue Anonymously
      </button>

      {/* Footer */}
      <p className="text-center text-xs text-[var(--text-muted)]">
        {flow === "signIn" ? (
          <>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => setFlow("signUp")}
              className="text-[var(--primary)] hover:text-[var(--primary)]/80 font-semibold transition-colors"
            >
              Create one
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setFlow("signIn")}
              className="text-[var(--primary)] hover:text-[var(--primary)]/80 font-semibold transition-colors"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}

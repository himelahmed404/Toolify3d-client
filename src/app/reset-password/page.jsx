"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import { useToast } from "@/components/providers/ToastProvider";
import { authClient } from "@/lib/auth-client";
import { loginPath } from "@/lib/auth-redirect";

const inputClassName =
  "w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded-sm font-body text-on-surface transition-all placeholder:text-outline focus:outline-2 focus:outline-brand focus:outline-offset-2";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const token = searchParams.get("token") || "";
  const hasInvalidToken = searchParams.get("error") === "INVALID_TOKEN";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      showToast("Reset link is missing or invalid. Request a new one.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    if (password.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        showToast(error.message || "Could not reset password.", "error");
        return;
      }

      showToast("Password updated. You can sign in now.", "success");
      window.setTimeout(() => router.push(loginPath()), 1500);
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout footerLeft="System Ready: 200 OK" footerRight="Auth_Service_v1.4.2">
      <div className="bg-white text-dark p-10 rounded-sm shadow-2xl border border-border">
        <div className="flex flex-col mb-8">
          <Link
            href="/"
            className="font-display text-2xl font-extrabold tracking-tighter text-on-background hover:text-brand transition-colors w-fit"
          >
            TOOLIFY 3D
          </Link>
          <span className="font-mono text-sm text-brand mt-1 tracking-wide">
            {"// NEW_ACCESS_KEY"}
          </span>
        </div>

        <h1 className="font-display text-[32px] leading-tight font-bold mb-2">
          Reset Password
        </h1>
        <p className="font-body text-secondary mb-8">
          Choose a new password for your account.
        </p>

        {hasInvalidToken || !token ? (
          <div className="space-y-6">
            <p className="font-body text-on-surface">
              This reset link is invalid or has expired. Request a new one to continue.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 text-brand font-bold hover:underline underline-offset-4"
            >
              Request new link
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block font-mono text-sm text-secondary uppercase tracking-widest"
              >
                [ NEW_PASSWORD ]
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClassName} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-brand transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="block font-mono text-sm text-secondary uppercase tracking-widest"
              >
                [ CONFIRM_PASSWORD ]
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClassName} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-brand transition-colors"
                  aria-label={
                    showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                  }
                >
                  <span className="material-symbols-outlined">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand hover:bg-dark text-white py-4 rounded-sm font-display text-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span>UPDATING...</span>
                    <span
                      className="size-5 border-2 border-white/20 border-l-white rounded-full animate-spin"
                      aria-hidden
                    />
                  </>
                ) : (
                  <>
                    <span>UPDATE PASSWORD</span>
                    <span className="material-symbols-outlined">lock_reset</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-10 pt-8 border-t border-border text-center">
          <p className="font-body text-secondary">
            <Link
              href={loginPath()}
              className="text-on-surface font-bold hover:text-brand transition-colors"
            >
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthPageLayout>
  );
}

function ResetPasswordLoading() {
  return (
    <AuthPageLayout footerLeft="System Ready: 200 OK" footerRight="Auth_Service_v1.4.2">
      <div className="bg-white text-dark p-10 rounded-sm shadow-2xl border border-border text-center">
        <p className="font-mono text-sm text-brand tracking-wide">{"// LOADING"}</p>
        <p className="font-body text-secondary mt-2">One moment...</p>
      </div>
    </AuthPageLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import { useToast } from "@/components/providers/ToastProvider";
import { authClient } from "@/lib/auth-client";
import { getSafeNextPath, loginPath } from "@/lib/auth-redirect";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const nextPath = getSafeNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: "/reset-password",
      });

      if (error) {
        showToast(error.message || "Could not send reset link.", "error");
        return;
      }

      setSubmitted(true);
      showToast(
        "If an account exists, a reset link was sent. Check your email (or server console in dev).",
        "success"
      );
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
            {"// RESET_ACCESS"}
          </span>
        </div>

        <h1 className="font-display text-[32px] leading-tight font-bold mb-2">
          Forgot Password
        </h1>
        <p className="font-body text-secondary mb-8">
          Enter your email and we&apos;ll send a link to reset your password.
        </p>

        {submitted ? (
          <div className="space-y-6">
            <p className="font-body text-on-surface">
              If an account exists for that email, a reset link was sent. Check your inbox
              (or the server console while developing).
            </p>
            <Link
              href={loginPath(nextPath)}
              className="inline-flex items-center gap-2 text-brand font-bold hover:underline underline-offset-4"
            >
              Back to Sign In
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block font-mono text-sm text-secondary uppercase tracking-widest"
              >
                [ EMAIL_ADDRESS ]
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@toolify3d.io"
                className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 rounded-sm font-body text-on-surface transition-all placeholder:text-outline focus:outline-2 focus:outline-brand focus:outline-offset-2"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand hover:bg-dark text-white py-4 rounded-sm font-display text-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span>SENDING...</span>
                    <span
                      className="size-5 border-2 border-white/20 border-l-white rounded-full animate-spin"
                      aria-hidden
                    />
                  </>
                ) : (
                  <>
                    <span>SEND RESET LINK</span>
                    <span className="material-symbols-outlined">mail</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-10 pt-8 border-t border-border text-center">
          <p className="font-body text-secondary">
            Remember your password?{" "}
            <Link
              href={loginPath(nextPath)}
              className="text-on-surface font-bold hover:text-brand transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthPageLayout>
  );
}

function ForgotPasswordLoading() {
  return (
    <AuthPageLayout footerLeft="System Ready: 200 OK" footerRight="Auth_Service_v1.4.2">
      <div className="bg-white text-dark p-10 rounded-sm shadow-2xl border border-border text-center">
        <p className="font-mono text-sm text-brand tracking-wide">{"// LOADING"}</p>
        <p className="font-body text-secondary mt-2">One moment...</p>
      </div>
    </AuthPageLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

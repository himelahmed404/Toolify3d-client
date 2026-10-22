"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { useToast } from "@/components/providers/ToastProvider";
import { authClient } from "@/lib/auth-client";
import {
  getSafeNextPath,
  googleCallbackPath,
  registerPath,
  forgotPasswordPath,
} from "@/lib/auth-redirect";
import {
  emailAccountExists,
  isInvalidCredentialsError,
} from "@/lib/auth-errors";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const nextPath = getSafeNextPath(searchParams.get("next"));
  const googleCallback = googleCallbackPath(nextPath);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        if (isInvalidCredentialsError(error)) {
          const exists = await emailAccountExists(email);
          if (exists === false) {
            showToast(
              "No account found with this email. Create one to continue.",
              "error"
            );
            router.push(registerPath(nextPath));
            return;
          }
        }

        showToast(error.message || "Authentication failed.", "error");
        return;
      }

      showToast("Authentication success. Redirecting to Terminal...", "success");
      window.setTimeout(() => router.push(nextPath), 1500);
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
              {"// SIGN_IN"}
            </span>
          </div>

          <h1 className="font-display text-[32px] leading-tight font-bold mb-8">
            Welcome Back
          </h1>

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

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="block font-mono text-sm text-secondary uppercase tracking-widest"
                >
                  [ ACCESS_KEY ]
                </label>
                <Link
                  href={forgotPasswordPath(nextPath)}
                  className="text-xs font-mono text-brand hover:underline"
                >
                  FORGOT?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 pr-12 rounded-sm font-body text-on-surface transition-all placeholder:text-outline focus:outline-2 focus:outline-brand focus:outline-offset-2"
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

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand hover:bg-dark text-white py-4 rounded-sm font-display text-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span>AUTHENTICATING...</span>
                    <span
                      className="size-5 border-2 border-white/20 border-l-white rounded-full animate-spin"
                      aria-hidden
                    />
                  </>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <span className="material-symbols-outlined">login</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-border text-center">
            <p className="font-body text-secondary">
              Don&apos;t have an account?{" "}
              <Link
                href={registerPath(nextPath)}
                className="text-on-surface font-bold hover:text-brand transition-colors group"
              >
                Create Account{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </p>
            <GoogleSignInButton
              callbackURL={googleCallback}
              onError={(message) => showToast(message, "error")}
            />
          </div>
        </div>
    </AuthPageLayout>
  );
}

function LoginLoading() {
  return (
    <AuthPageLayout footerLeft="System Ready: 200 OK" footerRight="Auth_Service_v1.4.2">
      <div className="bg-white text-dark p-10 rounded-sm shadow-2xl border border-border text-center">
        <p className="font-mono text-sm text-brand tracking-wide">{"// LOADING"}</p>
        <p className="font-body text-secondary mt-2">One moment...</p>
      </div>
    </AuthPageLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}

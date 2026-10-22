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
  loginPath,
} from "@/lib/auth-redirect";
import { isUserAlreadyExistsError } from "@/lib/auth-errors";

const inputClassName =
  "w-full bg-white border border-outline-variant px-4 py-3 rounded-sm font-body text-on-surface transition-all placeholder:text-outline focus:outline-2 focus:outline-brand focus:outline-offset-2";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const nextPath = getSafeNextPath(searchParams.get("next"));
  const googleCallback = googleCallbackPath(nextPath);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    if (!/^\+?[0-9\s-]{7,20}$/.test(trimmedPhone)) {
      showToast("Enter a valid phone number for order updates.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name: trimmedName,
        email: trimmedEmail,
        password,
        phone: trimmedPhone,
      });

      if (error) {
        if (isUserAlreadyExistsError(error)) {
          showToast("This account already exists. Please log in.", "error");
          router.push(loginPath(nextPath));
          return;
        }

        showToast(error.message || "Could not create your account.", "error");
        return;
      }

      showToast("Account created. Redirecting to Terminal...", "success");
      window.setTimeout(() => router.push(nextPath), 1500);
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout maxWidth="max-w-[525px]">
        <div className="bg-white text-dark p-8 rounded-sm shadow-2xl border border-border">
          <header className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <Link
                href="/"
                className="font-display text-2xl font-extrabold tracking-tighter text-on-background hover:text-brand transition-colors"
              >
                TOOLIFY 3D
              </Link>
              <span className="font-mono text-sm text-brand tracking-wide">
                {"// CREATE_ACCOUNT"}
              </span>
            </div>
            <h1 className="font-display text-[32px] leading-tight font-bold mb-1">
              Create Account
            </h1>
            <p className="font-body text-secondary">Join to start placing 3D print orders.</p>
          </header>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block font-mono text-sm text-secondary uppercase tracking-widest"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block font-mono text-sm text-secondary uppercase tracking-widest"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block font-mono text-sm text-secondary uppercase tracking-widest"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880XXXXXXXXXX"
                  className={inputClassName}
                />
                <span className="block font-mono text-[10px] text-brand tracking-tight">
                  {"// USED FOR ORDER UPDATES"}
                </span>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block font-mono text-sm text-secondary uppercase tracking-widest"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-display text-xl font-bold py-4 rounded-sm flex items-center justify-center gap-2 group transition-colors hover:bg-brand hover:text-dark active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span>CREATING ACCOUNT...</span>
                  <span
                    className="size-5 border-2 border-white/20 border-l-white rounded-full animate-spin"
                    aria-hidden
                  />
                </>
              ) : (
                <>
                  <span>CREATE ACCOUNT</span>
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="font-body text-secondary text-sm">
              Already have an account?{" "}
              <Link
                href={loginPath(nextPath)}
                className="text-brand font-bold hover:underline underline-offset-4"
              >
                Sign In
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

function RegisterLoading() {
  return (
    <AuthPageLayout maxWidth="max-w-[525px]">
      <div className="bg-white text-dark p-8 rounded-sm shadow-2xl border border-border text-center">
        <p className="font-mono text-sm text-brand tracking-wide">{"// LOADING"}</p>
        <p className="font-body text-secondary mt-2">One moment...</p>
      </div>
    </AuthPageLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterForm />
    </Suspense>
  );
}

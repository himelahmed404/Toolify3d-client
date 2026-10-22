/**
 * Safe same-origin relative return paths for post-auth redirects.
 * Rejects protocol-relative URLs, absolute URLs, and non-path values.
 */
export function getSafeNextPath(value, fallback = "/") {
  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;

  return trimmed;
}

function withNextQuery(basePath, next) {
  const safe = getSafeNextPath(next, "");
  if (!safe || safe === "/") return basePath;
  return `${basePath}?next=${encodeURIComponent(safe)}`;
}

export function loginPath(next) {
  return withNextQuery("/login", next);
}

export function registerPath(next) {
  return withNextQuery("/register", next);
}

export function forgotPasswordPath(next) {
  return withNextQuery("/forgot-password", next);
}

/** Google OAuth lands on complete-profile, then resumes via ?next= */
export function googleCallbackPath(next) {
  const safe = getSafeNextPath(next, "/");
  if (safe === "/") return "/complete-profile";
  return `/complete-profile?next=${encodeURIComponent(safe)}`;
}

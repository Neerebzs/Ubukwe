/**
 * Google OAuth 2.0 — Authorization Code Flow (full-page redirect).
 *
 * Popup + COOP was leaving the main window stuck on "Authenticating..." while
 * the popup (or a mis-classified tab) finished the exchange. Full-page redirect
 * is the reliable path: Google → /auth/google/callback → /auth/signin?google=1.
 */

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export const GOOGLE_OAUTH_CODE_KEY = "google_oauth_code";
export const GOOGLE_OAUTH_ROLE_KEY = "google_oauth_role";
export const GOOGLE_OAUTH_RETURN_KEY = "google_oauth_return";
export const GOOGLE_OAUTH_PENDING_KEY = "google_oauth_pending";

function getRedirectUri(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/auth/google/callback`;
}

function buildAuthUrl(): string {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Add it to your environment variables."
    );
  }
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });
  return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
}

export type StartGoogleOAuthOptions = {
  /** Optional role for signup (event_owner | service_provider). */
  role?: "event_owner" | "service_provider";
  /** Where to land after Google (default: current path or /auth/signin). */
  returnTo?: string;
};

/**
 * Start Google OAuth by navigating this tab to Google.
 * Does not return — the page unloads.
 */
export function startGoogleOAuth(opts: StartGoogleOAuthOptions = {}): void {
  if (typeof window === "undefined") {
    throw new Error("Must be called in a browser.");
  }

  const returnTo =
    opts.returnTo ||
    (window.location.pathname.startsWith("/auth/")
      ? window.location.pathname
      : "/auth/signin");

  sessionStorage.setItem(GOOGLE_OAUTH_PENDING_KEY, "1");
  sessionStorage.setItem(GOOGLE_OAUTH_RETURN_KEY, returnTo);

  if (opts.role) {
    sessionStorage.setItem(GOOGLE_OAUTH_ROLE_KEY, opts.role);
  } else {
    sessionStorage.removeItem(GOOGLE_OAUTH_ROLE_KEY);
  }

  window.location.assign(buildAuthUrl());
}

/**
 * Used by useAuth when no authorization code override is provided.
 * Navigates away; the returned Promise never settles.
 */
export async function initiateGoogleLogin(opts?: {
  role?: "event_owner" | "service_provider";
}): Promise<{ code: string }> {
  startGoogleOAuth({ role: opts?.role });
  // Page is navigating — keep the caller pending until unload.
  await new Promise<never>(() => {});
  throw new Error("Google redirect did not navigate.");
}

/** Read + clear the one-time code stored by the callback page. */
export function consumeGoogleOAuthCode(): string | null {
  if (typeof window === "undefined") return null;
  const code = sessionStorage.getItem(GOOGLE_OAUTH_CODE_KEY);
  if (code) sessionStorage.removeItem(GOOGLE_OAUTH_CODE_KEY);
  sessionStorage.removeItem(GOOGLE_OAUTH_PENDING_KEY);
  return code;
}

export function consumeGoogleOAuthRole():
  | "event_owner"
  | "service_provider"
  | undefined {
  if (typeof window === "undefined") return undefined;
  const role = sessionStorage.getItem(GOOGLE_OAUTH_ROLE_KEY);
  sessionStorage.removeItem(GOOGLE_OAUTH_ROLE_KEY);
  if (role === "event_owner" || role === "service_provider") return role;
  return undefined;
}

export function getGoogleOAuthReturnPath(): string {
  if (typeof window === "undefined") return "/auth/signin";
  const path = sessionStorage.getItem(GOOGLE_OAUTH_RETURN_KEY) || "/auth/signin";
  // Keep return path until callback reads it; callback clears via this helper
  sessionStorage.removeItem(GOOGLE_OAUTH_RETURN_KEY);
  return path.startsWith("/auth/") ? path : "/auth/signin";
}

type FinishHandler = (
  code: string,
  role?: "event_owner" | "service_provider"
) => Promise<void>;

/** Survives React Strict Mode double-mount — only one exchange per return. */
let googleFinishInFlight: Promise<void> | null = null;

/**
 * If the URL has ?google=1, consume the stored code once and run the handler.
 * Safe to call from multiple useEffect mounts.
 */
export function finishGoogleOAuthReturn(handler: FinishHandler): void {
  if (typeof window === "undefined") return;
  if (new URLSearchParams(window.location.search).get("google") !== "1") return;
  if (googleFinishInFlight) return;

  const code = consumeGoogleOAuthCode();
  const role = consumeGoogleOAuthRole();

  // Clean the query string so refresh doesn't re-trigger
  const cleanPath = window.location.pathname || "/auth/signin";
  window.history.replaceState({}, "", cleanPath);

  if (!code) return;

  googleFinishInFlight = handler(code, role).finally(() => {
    googleFinishInFlight = null;
  });
}

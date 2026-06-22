/**
 * Google OAuth 2.0 — Authorization Code Flow
 *
 * Two modes:
 *   1. Popup (desktop) — opens /auth/google/callback in a popup window.
 *      The callback page sends the code back via postMessage then closes.
 *   2. Full-page redirect (mobile — popup blocked) — redirects the current
 *      tab to Google. The callback page stores the code in sessionStorage
 *      and redirects to /auth/signin?google=1 which reads it.
 */

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

// Must exactly match one of the Authorized redirect URIs in Google Cloud Console
function getRedirectUri(): string {
  if (typeof window === "undefined") return "";
  const origin = window.location.origin; // https://www.vownests.com or http://localhost:3000
  return `${origin}/auth/google/callback`;
}

export interface GoogleOAuthResult {
  code: string;
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

/**
 * Try to open a popup. Returns the popup window or null if blocked.
 */
function openPopup(url: string): Window | null {
  const width = 500;
  const height = 620;
  const left = Math.round(window.screenX + (window.innerWidth - width) / 2);
  const top = Math.round(window.screenY + (window.innerHeight - height) / 2);
  return window.open(
    url,
    "google-oauth",
    `width=${width},height=${height},left=${left},top=${top},` +
      "scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no"
  );
}

/**
 * Initiate Google OAuth.
 *
 * - On desktop: opens a popup, waits for postMessage from /auth/google/callback.
 * - On mobile (popup blocked): redirects the whole page.
 *   The caller must handle the `google_oauth_code` from sessionStorage
 *   on the next render (signin page checks `?google=1`).
 *
 * @throws Error if the user cancels or Google returns an error.
 */
export async function initiateGoogleLogin(): Promise<GoogleOAuthResult> {
  if (typeof window === "undefined") throw new Error("Must be called in a browser.");

  const authUrl = buildAuthUrl();

  return new Promise((resolve, reject) => {
    const popup = openPopup(authUrl);

    // Popup blocked → fall back to full-page redirect (common on mobile)
    if (!popup || popup.closed) {
      window.location.href = authUrl;
      // This promise never resolves — the page navigates away.
      // The signin page handles the code on return via sessionStorage.
      return;
    }

    // Listen for the code posted by /auth/google/callback
    const messageHandler = (event: MessageEvent) => {
      // Only accept messages from our own origin
      if (event.origin !== window.location.origin) return;

      const data = event.data;
      if (!data) return;

      if (data.code) {
        cleanup();
        resolve({ code: data.code });
        return;
      }

      if (data.error) {
        cleanup();
        const msg =
          data.error === "access_denied"
            ? "Google sign-in was cancelled."
            : `Google sign-in failed: ${data.error}`;
        reject(new Error(msg));
        return;
      }
    };

    // Poll for popup closure (user closed without completing)
    const pollTimer = setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error("Google sign-in was cancelled."));
      }
    }, 500);

    const cleanup = () => {
      window.removeEventListener("message", messageHandler);
      clearInterval(pollTimer);
      if (!popup.closed) popup.close();
    };

    window.addEventListener("message", messageHandler);
  });
}

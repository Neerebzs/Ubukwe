import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type GoogleAuthResult = {
  needs_role_selection?: boolean;
  google_signup_token?: string;
  access_token?: string;
  refresh_token?: string;
  two_factor_required?: boolean;
  user?: Record<string, unknown>;
};

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:4000")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api\/v1$/, "");
}

function unwrap(payload: any): GoogleAuthResult {
  if (!payload || typeof payload !== "object") return {};
  if (
    payload.needs_role_selection ||
    payload.google_signup_token ||
    payload.access_token ||
    payload.two_factor_required
  ) {
    return payload;
  }
  if (payload.data && typeof payload.data === "object") return payload.data;
  return payload;
}

/** Prevent double-exchange of one-time Google codes in dev remounts. */
const exchangeCache = new Map<string, Promise<GoogleAuthResult>>();

async function exchangeCode(code: string, redirectUri: string): Promise<GoogleAuthResult> {
  const cached = exchangeCache.get(code);
  if (cached) return cached;

  const promise = (async () => {
    console.log("[google-callback] POST", `${apiBase()}/api/v1/auth/google`);
    const res = await fetch(`${apiBase()}/api/v1/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
      cache: "no-store",
    });

    let json: any = null;
    try {
      json = await res.json();
    } catch {
      /* ignore */
    }

    console.log("[google-callback] backend status", res.status);

    if (!res.ok) {
      const msg =
        json?.detail?.message ||
        json?.message ||
        (typeof json?.detail === "string" ? json.detail : null) ||
        `Google sign-in failed (${res.status})`;
      throw new Error(msg);
    }

    return unwrap(json);
  })();

  exchangeCache.set(code, promise);
  // Avoid unhandledRejection if Next remounts before the route awaits
  promise.catch(() => {
    exchangeCache.delete(code);
  });
  promise.finally(() => {
    setTimeout(() => exchangeCache.delete(code), 60_000);
  });

  return promise;
}

function siteOrigin(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

/** Hand off payload via sessionStorage (avoids 4KB cookie limits on JWTs). */
function handoffHtml(targetPath: string, storageKey: string, payload: unknown) {
  const json = JSON.stringify(payload);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Continuing…</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:#0f172a;color:#fff;font-family:system-ui,sans-serif}
    p{font-size:12px;letter-spacing:.2em;text-transform:uppercase;opacity:.7}
  </style>
</head>
<body>
  <p>Continuing sign-in…</p>
  <script>
    try {
      sessionStorage.setItem(${JSON.stringify(storageKey)}, ${JSON.stringify(json)});
    } catch (e) {}
    location.replace(${JSON.stringify(targetPath)});
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function redirectSignin(origin: string, message: string) {
  return NextResponse.redirect(
    `${origin}/auth/signin?google_error=${encodeURIComponent(message)}`
  );
}

/**
 * Google redirects here with ?code=…
 * Exchanges the code with FastAPI on the SERVER (always runs — no client useEffect),
 * then hands off to /auth/google/complete for role selection or session setup.
 */
export async function GET(req: NextRequest) {
  const origin = siteOrigin(req);
  const error = req.nextUrl.searchParams.get("error");
  const code = req.nextUrl.searchParams.get("code");

  if (error) {
    const msg =
      error === "access_denied" ? "Sign-in was cancelled." : `Google error: ${error}`;
    return redirectSignin(origin, msg);
  }

  if (!code) {
    return redirectSignin(origin, "No authorization code received from Google.");
  }

  try {
    const redirectUri = `${origin}/auth/google/callback`;
    const data = await exchangeCode(code, redirectUri);

    if (data.needs_role_selection || data.google_signup_token) {
      const token = data.google_signup_token || "";
      if (!token) {
        return redirectSignin(
          origin,
          "Google verified your account, but role setup could not start."
        );
      }

      return handoffHtml("/auth/google/complete", "vownest_google_signup", {
        token,
        user: data.user ?? null,
      });
    }

    if (data.two_factor_required) {
      return redirectSignin(
        origin,
        "Two-factor authentication is required for this account. Sign in with email to use 2FA."
      );
    }

    if (data.access_token) {
      return handoffHtml("/auth/google/complete?mode=session", "vownest_google_session", {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || data.access_token,
        user: data.user ?? null,
      });
    }

    return redirectSignin(origin, "Unexpected response from server. Please try again.");
  } catch (err: any) {
    console.error("[google-callback] exchange failed:", err?.message || err);
    return redirectSignin(
      origin,
      err?.message || "Google sign-in failed. Please try again."
    );
  }
}

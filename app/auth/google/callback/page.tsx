"use client";

/**
 * /auth/google/callback
 *
 * Google redirects here after the user authenticates.
 * This page extracts the authorization code from the URL,
 * sends it to the backend, and closes itself if opened as a popup —
 * or redirects directly if opened as a full page navigation.
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { Suspense } from "react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "error">("processing");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const code = searchParams?.get("code");
    const error = searchParams?.get("error");

    if (error) {
      setStatus("error");
      setErrorMsg(error === "access_denied" ? "Sign-in was cancelled." : `Google error: ${error}`);
      // If this is a popup, notify the opener and close
      if (window.opener) {
        window.opener.postMessage({ error }, window.location.origin);
        window.close();
      }
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMsg("No authorization code received from Google.");
      if (window.opener) {
        window.opener.postMessage({ error: "no_code" }, window.location.origin);
        window.close();
      }
      return;
    }

    // If opened as a popup — send the code to the opener and close
    if (window.opener) {
      window.opener.postMessage({ code }, window.location.origin);
      window.close();
      return;
    }

    // If opened as a full-page navigation (mobile browsers that block popups)
    // — store the code in sessionStorage and redirect to sign-in
    sessionStorage.setItem("google_oauth_code", code);
    router.replace("/auth/signin?google=1");
  }, [searchParams, router]);

  if (status === "error") {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6 px-6">
        <div className="h-14 w-14 rounded-full bg-red-500/15 flex items-center justify-center">
          <ShieldAlert className="h-6 w-6 text-red-400" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-white font-bold">Sign-in failed</p>
          <p className="text-slate-400 text-sm">{errorMsg}</p>
        </div>
        <button
          onClick={() => router.replace("/auth/signin")}
          className="px-6 py-2.5 rounded-full bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-16 h-16 rounded-full border-[3px] border-white/10" />
        <div className="absolute w-16 h-16 rounded-full border-[3px] border-[#668c65] border-t-transparent animate-spin" />
        <Loader2 className="w-6 h-6 text-[#668c65] animate-spin" />
      </div>
      <p className="text-white text-xs font-bold uppercase tracking-[0.3em] animate-pulse">
        Completing sign-in...
      </p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#668c65] animate-spin" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { tokenManager, userManager, googleSignupPending } from "@/lib/auth";
import GoogleRoleForm from "../callback/role-form";

function dashboardForRole(role?: string | null): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "service_provider") return "/provider/dashboard";
  return "/customer/dashboard";
}

function readHandoff(key: string): any | null {
  try {
    const raw = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function CompleteInner() {
  const searchParams = useSearchParams();
  const mode = searchParams?.get("mode");
  const [error, setError] = useState("");
  const [signup, setSignup] = useState<{ token: string; user: any } | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    try {
      if (mode === "session") {
        const parsed = readHandoff("vownest_google_session");
        if (!parsed?.accessToken) {
          setError("Sign-in session expired. Please try Google again.");
          setBooting(false);
          return;
        }
        tokenManager.setTokens(
          parsed.accessToken,
          parsed.refreshToken || parsed.accessToken
        );
        if (parsed.user) userManager.setUser(parsed.user);
        googleSignupPending.clear();
        window.location.replace(dashboardForRole(parsed.user?.role));
        return;
      }

      const parsed = readHandoff("vownest_google_signup");
      if (!parsed?.token) {
        const pending = googleSignupPending.read();
        if (pending?.googleSignupToken) {
          setSignup({
            token: pending.googleSignupToken,
            user: pending.user ?? null,
          });
          setBooting(false);
          return;
        }
        setError("Signup session expired. Please try Google sign-in again.");
        setBooting(false);
        return;
      }

      googleSignupPending.save({
        googleSignupToken: parsed.token,
        user: parsed.user ?? null,
      });
      setSignup({ token: parsed.token, user: parsed.user ?? null });
      setBooting(false);
    } catch (err: any) {
      setError(err?.message || "Could not continue Google sign-in.");
      setBooting(false);
    }
  }, [mode]);

  if (booting) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#668c65] animate-spin" />
        <p className="text-white text-xs font-bold uppercase tracking-[0.3em]">
          Preparing your account...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6 px-6">
        <div className="h-14 w-14 rounded-full bg-red-500/15 flex items-center justify-center">
          <ShieldAlert className="h-6 w-6 text-red-400" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-white font-bold">Sign-in failed</p>
          <p className="text-slate-400 text-sm max-w-sm">{error}</p>
        </div>
        <Link
          href="/auth/signin"
          className="px-6 py-2.5 rounded-full bg-white/10 text-white text-sm font-bold hover:bg-white/20"
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

  if (signup?.token) {
    return <GoogleRoleForm signupToken={signup.token} profile={signup.user} />;
  }

  return null;
}

export default function GoogleCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#668c65] animate-spin" />
        </div>
      }
    >
      <CompleteInner />
    </Suspense>
  );
}

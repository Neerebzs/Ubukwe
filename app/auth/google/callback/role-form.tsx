"use client";

import { useState } from "react";
import { Loader2, Users, Briefcase } from "lucide-react";
import { tokenManager, userManager, googleSignupPending } from "@/lib/auth";

type Profile = {
  email?: string;
  full_name?: string;
  avatar?: string;
} | null;

const API_BASE = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:4000"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api\/v1$/, "");

function dashboardForRole(role?: string | null): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "service_provider") return "/provider/dashboard";
  return "/customer/dashboard";
}

export default function GoogleRoleForm({
  signupToken,
  profile,
}: {
  signupToken: string;
  profile: Profile;
}) {
  const [selected, setSelected] = useState<"event_owner" | "service_provider" | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const displayName = profile?.full_name?.trim() || profile?.email || "there";

  const onCreate = async () => {
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          google_signup_token: signupToken,
          role: selected,
        }),
      });
      const json = await res.json().catch(() => null);
      const data =
        json?.access_token || json?.needs_role_selection || json?.google_signup_token
          ? json
          : json?.data ?? json;

      if (!res.ok) {
        throw new Error(
          data?.detail?.message ||
            data?.message ||
            (typeof data?.detail === "string" ? data.detail : null) ||
            `Could not create account (${res.status})`
        );
      }

      const accessToken = data?.access_token ?? data?.accessToken;
      const refreshToken =
        data?.refresh_token ?? data?.refreshToken ?? accessToken;
      const user = data?.user;

      if (!accessToken) {
        throw new Error("Account created but no session was returned.");
      }

      googleSignupPending.clear();
      tokenManager.setTokens(accessToken, refreshToken);
      if (user) userManager.setUser(user);
      window.location.replace(dashboardForRole(user?.role || selected));
    } catch (err: any) {
      setError(err?.message || "Failed to create account.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center py-16">
      <div className="w-full max-w-sm mx-auto space-y-8 px-6">
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-full bg-[#608d64]/15 border border-[#608d64]/30 flex items-center justify-center mx-auto overflow-hidden">
            {profile?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <Users className="h-7 w-7 text-[#608d64]" />
            )}
          </div>
          <p className="text-[9px] font-black text-[#608d64] uppercase tracking-[0.4em]">
            Create your account
          </p>
          <h2 className="text-2xl font-serif italic text-white">
            Welcome, {displayName}
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            Choose how you&apos;ll use VowNest to finish creating your account.
          </p>
          {profile?.email && (
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">
              {profile.email}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setSelected("event_owner")}
            className={`p-6 rounded-2xl border-2 transition-all text-left space-y-3 ${
              selected === "event_owner"
                ? "bg-white/10 border-[#608d64]"
                : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
            }`}
          >
            <Users className="h-5 w-5 text-white" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-white">
                Customer
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">Planning a wedding</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelected("service_provider")}
            className={`p-6 rounded-2xl border-2 transition-all text-left space-y-3 ${
              selected === "service_provider"
                ? "bg-white/10 border-[#608d64]"
                : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
            }`}
          >
            <Briefcase className="h-5 w-5 text-white" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-white">
                Artisan
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">Offering services</p>
            </div>
          </button>
        </div>

        {error ? <p className="text-red-400 text-sm text-center">{error}</p> : null}

        <button
          type="button"
          disabled={!selected || loading}
          onClick={onCreate}
          className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-[0.3em] text-[10px] disabled:opacity-40"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create account & continue"
          )}
        </button>
      </div>
    </div>
  );
}

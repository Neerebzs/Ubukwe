"use client";

/**
 * /auth/2fa — standalone 2FA verification page.
 *
 * Reads the pre_auth_token from the URL query string (?token=...) so
 * direct links (e.g. from email notification systems) can land here.
 * Also used when the login flow sets a pre_auth_token in sessionStorage.
 */

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Home } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function TwoFAPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [preAuthToken, setPreAuthToken] = useState("");
  const [error, setError] = useState("");

  const { verifyTwoFactor, isVerifyingTwoFactor } = useAuth();

  // Load pre_auth_token from URL param or sessionStorage
  useEffect(() => {
    const tokenFromUrl = searchParams?.get("token") ?? "";
    if (tokenFromUrl) {
      setPreAuthToken(tokenFromUrl);
      return;
    }
    // Fallback: check sessionStorage (set by signin page for the popup flow)
    const stored = sessionStorage.getItem("pre_auth_token");
    if (stored) {
      setPreAuthToken(stored);
      sessionStorage.removeItem("pre_auth_token");
    } else {
      // No token — redirect back to sign in
      router.replace("/auth/signin");
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter your authentication code.");
      return;
    }
    setError("");
    try {
      await verifyTwoFactor({ preAuthToken, code: code.trim() });
    } catch (err: any) {
      setError(err.message || "Invalid code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 h-96 w-96 bg-[#608d64]/10 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-96 w-96 bg-slate-500/10 blur-[120px] rounded-full -ml-48 -mb-48 pointer-events-none" />

      {/* Home link */}
      <div className="absolute top-8 right-8 z-20">
        <Link
          href="/"
          className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[10px] font-black text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 uppercase tracking-[0.3em] transition-all group"
        >
          <Home className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
          <span>Home</span>
        </Link>
      </div>

      <div className="w-full max-w-sm space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-[#608d64]/15 border border-[#608d64]/30 flex items-center justify-center mx-auto">
            <ShieldCheck className="h-7 w-7 text-[#608d64]" />
          </div>
          <div className="space-y-2">
            <p className="text-[9px] font-black text-[#608d64] uppercase tracking-[0.4em]">Security Verification</p>
            <h1 className="text-4xl font-serif italic text-white leading-tight">Two-Factor Authentication</h1>
          </div>
          <p className="text-slate-400 text-sm font-medium tracking-wide">
            Enter the 6-digit code from your authenticator app, or use one of your backup codes.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <Label htmlFor="otp" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Authentication Code
              </Label>
              {error && (
                <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">{error}</span>
              )}
            </div>
            <Input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\s/g, ""));
                setError("");
              }}
              maxLength={12}
              className={`h-14 bg-white/5 border-white/10 text-white text-center text-xl font-mono tracking-[0.5em] rounded-2xl px-6 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 transition-all ${error ? "border-red-500/50 bg-red-500/5" : ""}`}
              disabled={isVerifyingTwoFactor}
              autoFocus
            />
            <p className="text-[9px] text-slate-600 px-1">
              For backup codes, enter the 12-character code exactly as shown.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isVerifyingTwoFactor || !code.trim()}
            className="w-full h-16 bg-white hover:bg-[#8ca88b] text-slate-900 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-[#608d64]/10 transition-all duration-500 active:scale-[0.98]"
          >
            {isVerifyingTwoFactor ? (
              <span className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-[#608d64]" />
                <span>Verifying</span>
              </span>
            ) : (
              "Verify & Enter"
            )}
          </Button>
        </form>

        <div className="pt-8 border-t border-white/5 text-center space-y-4">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            Lost your device?
          </p>
          <p className="text-slate-600 text-xs">
            Use one of your saved backup codes instead of the 6-digit code.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-8 py-3 rounded-xl border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/5 hover:border-white/20 transition-all"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

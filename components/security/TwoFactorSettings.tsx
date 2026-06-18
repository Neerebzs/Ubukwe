"use client";

/**
 * TwoFactorSettings — reusable 2FA management panel.
 *
 * Handles the full lifecycle:
 *   Setup → QR scan → verify first code → store backup codes
 *   Disable → require password + TOTP
 *   Regenerate backup codes
 *
 * Drop this into any settings/preferences page.
 */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  Eye,
  EyeOff,
  Loader2,
  Copy,
  Download,
  RefreshCw,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/auth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/hooks/useAuth";

// ── Types ────────────────────────────────────────────────────────────────────

interface TwoFAStatus {
  two_factor_enabled: boolean;
  two_factor_enabled_at: string | null;
  last_2fa_verification: string | null;
  backup_codes_remaining: number;
}

// ── Utility ───────────────────────────────────────────────────────────────────

function downloadBackupCodes(codes: string[], email: string) {
  const content = [
    "Vownest — Two-Factor Authentication Backup Codes",
    `Account: ${email}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "Each code can only be used ONCE.",
    "Store these codes in a safe place.",
    "",
    ...codes.map((code, i) => `${i + 1}. ${code}`),
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vownest-backup-codes.txt";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BackupCodesDisplay({
  codes,
  email,
  onClose,
}: {
  codes: string[];
  email: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-800 text-sm font-semibold">
          ⚠ Save these backup codes now. They will not be shown again.
        </p>
        <p className="text-amber-700 text-xs mt-1">
          Each code can only be used once to sign in if you lose access to your authenticator app.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {codes.map((code, i) => (
          <div
            key={i}
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 font-mono text-sm text-slate-800 text-center tracking-widest"
          >
            {code}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={handleCopy}
        >
          {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy All"}
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => downloadBackupCodes(codes, email)}
        >
          <Download className="h-4 w-4" />
          Download TXT
        </Button>
      </div>

      <Button onClick={onClose} className="w-full">
        I've saved my backup codes
      </Button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function TwoFactorSettings({ userEmail }: { userEmail: string }) {
  const { track2FAEnabled, track2FADisabled } = useAnalytics();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<TwoFAStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Setup flow state
  const [setupStep, setSetupStep] = useState<"idle" | "qr" | "verify" | "backup">("idle");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Disable flow state
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [showDisablePassword, setShowDisablePassword] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  // Regenerate backup codes state
  const [showRegenDialog, setShowRegenDialog] = useState(false);
  const [regenCode, setRegenCode] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);

  // Load status on mount
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const response = await authApi.get2FAStatus();
      setStatus(response.data as TwoFAStatus);
    } catch {
      toast.error("Failed to load 2FA status.");
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // ── Setup flow ─────────────────────────────────────────────────────────────

  const handleStartSetup = async () => {
    setIsSettingUp(true);
    try {
      const response = await authApi.setup2FA();
      const data = response.data as any;
      setQrCode(data.qr_code);
      setSecret(data.secret);
      setSetupStep("qr");
    } catch (err: any) {
      toast.error(err.message || "Failed to start 2FA setup.");
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleVerifySetup = async () => {
    if (!setupCode.trim()) {
      toast.error("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setIsSettingUp(true);
    try {
      const response = await authApi.verify2FASetup(setupCode.trim());
      const data = response.data as any;
      setBackupCodes(data.backup_codes);
      setSetupStep("backup");
      setStatus((prev) => prev ? { ...prev, two_factor_enabled: true, backup_codes_remaining: 10 } : null);
      track2FAEnabled();
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      toast.success("2FA has been enabled successfully!");
    } catch (err: any) {
      toast.error(err.message || "Invalid code. Please try again.");
    } finally {
      setIsSettingUp(false);
    }
  };

  // ── Disable flow ───────────────────────────────────────────────────────────

  const handleDisable = async () => {
    if (!disablePassword.trim() || !disableCode.trim()) {
      toast.error("Both password and OTP code are required.");
      return;
    }
    setIsDisabling(true);
    try {
      await authApi.disable2FA(disablePassword, disableCode);
      setStatus((prev) => prev ? { ...prev, two_factor_enabled: false } : null);
      setShowDisableDialog(false);
      setDisablePassword("");
      setDisableCode("");
      track2FADisabled();
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      toast.success("2FA has been disabled.");
    } catch (err: any) {
      toast.error(err.message || "Failed to disable 2FA. Check your password and code.");
    } finally {
      setIsDisabling(false);
    }
  };

  // ── Regenerate backup codes ────────────────────────────────────────────────

  const handleRegenerate = async () => {
    if (!regenCode.trim()) {
      toast.error("Enter your current 6-digit TOTP code.");
      return;
    }
    setIsRegenerating(true);
    try {
      const response = await authApi.regenerateBackupCodes(regenCode);
      const data = response.data as any;
      setNewBackupCodes(data.backup_codes);
      setStatus((prev) => prev ? { ...prev, backup_codes_remaining: 10 } : null);
      setShowRegenDialog(false);
      setRegenCode("");
      toast.success("New backup codes generated.");
    } catch (err: any) {
      toast.error(err.message || "Failed to regenerate backup codes.");
    } finally {
      setIsRegenerating(false);
    }
  };

  // ── Render loading ─────────────────────────────────────────────────────────
  if (isLoadingStatus) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-slate-100 animate-pulse rounded" />
          <div className="h-4 w-72 bg-slate-100 animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-16 w-full bg-slate-100 animate-pulse rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {status?.two_factor_enabled ? (
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-slate-500" />
                </div>
              )}
              <div>
                <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {status?.two_factor_enabled
                    ? "Your account is protected with TOTP 2FA."
                    : "Add an extra layer of security to your account."}
                </CardDescription>
              </div>
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                status?.two_factor_enabled
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {status?.two_factor_enabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Setup steps */}
          {setupStep === "idle" && !status?.two_factor_enabled && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-slate-700">How it works</p>
                <ol className="text-xs text-slate-500 space-y-1 list-decimal list-inside">
                  <li>Install an authenticator app (Google Authenticator, Authy, 1Password)</li>
                  <li>Scan the QR code we generate for your account</li>
                  <li>Enter the 6-digit code to confirm setup</li>
                  <li>Save your 10 backup codes in a secure location</li>
                </ol>
              </div>
              <Button
                onClick={handleStartSetup}
                disabled={isSettingUp}
                className="w-full gap-2"
              >
                {isSettingUp ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Setting up...</>
                ) : (
                  <><ShieldCheck className="h-4 w-4" /> Enable Two-Factor Authentication</>
                )}
              </Button>
            </div>
          )}

          {setupStep === "qr" && (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <p className="text-sm text-slate-600">
                  Scan this QR code with your authenticator app:
                </p>
                {qrCode && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCode}
                    alt="2FA QR Code"
                    className="mx-auto w-48 h-48 rounded-xl border border-slate-200 p-2 bg-white"
                  />
                )}
                <p className="text-xs text-slate-400">Can't scan? Enter this code manually:</p>
                <div className="flex items-center gap-2 justify-center">
                  <code className="bg-slate-100 text-slate-700 text-xs font-mono px-3 py-1.5 rounded-lg tracking-widest break-all">
                    {secret}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(secret);
                      toast.success("Secret copied!");
                    }}
                    className="text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setup-code" className="text-xs font-semibold text-slate-600">
                  Enter the 6-digit code from your app
                </Label>
                <Input
                  id="setup-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-xl font-mono tracking-[0.5em] h-14"
                  disabled={isSettingUp}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSetupStep("idle")}
                  disabled={isSettingUp}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleVerifySetup}
                  disabled={isSettingUp || setupCode.length !== 6}
                >
                  {isSettingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Verify & Enable
                </Button>
              </div>
            </div>
          )}

          {setupStep === "backup" && (
            <BackupCodesDisplay
              codes={backupCodes}
              email={userEmail}
              onClose={() => setSetupStep("idle")}
            />
          )}

          {/* 2FA enabled — management options */}
          {status?.two_factor_enabled && setupStep === "idle" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 rounded-lg p-3 space-y-0.5">
                  <p className="text-slate-400 font-medium">Enabled</p>
                  <p className="text-slate-700 font-semibold">
                    {status.two_factor_enabled_at
                      ? new Date(status.two_factor_enabled_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 space-y-0.5">
                  <p className="text-slate-400 font-medium">Backup Codes</p>
                  <p className={`font-semibold ${status.backup_codes_remaining < 3 ? "text-red-600" : "text-slate-700"}`}>
                    {status.backup_codes_remaining} remaining
                  </p>
                </div>
              </div>

              {status.backup_codes_remaining < 3 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700">
                  You're running low on backup codes. Regenerate them before you run out.
                </div>
              )}

              {/* Show newly regenerated codes */}
              {newBackupCodes.length > 0 && (
                <BackupCodesDisplay
                  codes={newBackupCodes}
                  email={userEmail}
                  onClose={() => setNewBackupCodes([])}
                />
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2 text-xs"
                  onClick={() => setShowRegenDialog(true)}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate Codes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2 text-xs text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  onClick={() => setShowDisableDialog(true)}
                >
                  <ShieldOff className="h-3.5 w-3.5" />
                  Disable 2FA
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Disable 2FA Dialog ── */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldOff className="h-5 w-5 text-red-500" />
              Disable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              This will remove the extra security layer from your account. Confirm your identity to proceed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="disable-pwd" className="text-xs font-semibold text-slate-600">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="disable-pwd"
                  type={showDisablePassword ? "text" : "password"}
                  placeholder="Your account password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowDisablePassword(!showDisablePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showDisablePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disable-otp" className="text-xs font-semibold text-slate-600">
                Authentication Code
              </Label>
              <Input
                id="disable-otp"
                inputMode="numeric"
                placeholder="6-digit code"
                maxLength={6}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                className="text-center font-mono tracking-widest"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDisableDialog(false)} disabled={isDisabling}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={isDisabling || !disablePassword || disableCode.length !== 6}
              className="gap-2"
            >
              {isDisabling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Regenerate Backup Codes Dialog ── */}
      <Dialog open={showRegenDialog} onOpenChange={setShowRegenDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-[#608d64]" />
              Regenerate Backup Codes
            </DialogTitle>
            <DialogDescription>
              Your existing backup codes will be permanently invalidated. Confirm with your authenticator code.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="regen-otp" className="text-xs font-semibold text-slate-600">
                Authentication Code
              </Label>
              <Input
                id="regen-otp"
                inputMode="numeric"
                placeholder="6-digit code"
                maxLength={6}
                value={regenCode}
                onChange={(e) => setRegenCode(e.target.value.replace(/\D/g, ""))}
                className="text-center font-mono tracking-widest"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRegenDialog(false)} disabled={isRegenerating}>
              Cancel
            </Button>
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating || regenCode.length !== 6}
              className="gap-2"
            >
              {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

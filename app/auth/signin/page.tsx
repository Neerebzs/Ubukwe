"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, Home, ShieldCheck, Users, Briefcase } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { LoginRequest } from "@/lib/api"
import { useSystemSettings } from "@/contexts/system-settings-context"
import { trackEvent, AnalyticsEvent } from "@/lib/analytics"
import { apiClient } from "@/lib/api"
import { tokenManager, userManager, googleSignupPending } from "@/lib/auth"
import { finishGoogleOAuthReturn } from "@/lib/googleOAuth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HCaptchaField } from "@/components/public-wedding/hcaptcha-field"

// ── Google SVG icon (official brand colors) ───────────────────────────────────
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

// ── Role selection panel (new Google users creating an account from sign-in) ─
function RoleSelectPanel({
  onSelect,
  isLoading,
  profile,
}: {
  onSelect: (role: "event_owner" | "service_provider") => void
  isLoading: boolean
  profile?: { email?: string; full_name?: string; avatar?: string } | null
}) {
  const [selected, setSelected] = useState<"event_owner" | "service_provider" | null>(null)
  const displayName = profile?.full_name?.trim() || profile?.email || "there"

  return (
    <div className="space-y-8">
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
        <h2 className="text-2xl font-serif italic text-white">Welcome, {displayName}</h2>
        <p className="text-slate-400 text-sm font-medium">
          We didn&apos;t find an existing account for this Google profile.
          Choose how you&apos;ll use VowNest to finish creating yours.
        </p>
        {profile?.email && (
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">{profile.email}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Customer */}
        <button
          type="button"
          onClick={() => setSelected("event_owner")}
          className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left space-y-3 ${
            selected === "event_owner"
              ? "bg-white/10 border-[#608d64] shadow-lg shadow-[#608d64]/20"
              : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected === "event_owner" ? "bg-[#608d64]/30" : "bg-white/10"}`}>
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className={`text-[11px] font-black uppercase tracking-widest ${selected === "event_owner" ? "text-white" : "text-slate-300"}`}>Customer</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Planning a wedding</p>
          </div>
        </button>

        {/* Service Provider */}
        <button
          type="button"
          onClick={() => setSelected("service_provider")}
          className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left space-y-3 ${
            selected === "service_provider"
              ? "bg-white/10 border-[#608d64] shadow-lg shadow-[#608d64]/20"
              : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected === "service_provider" ? "bg-[#608d64]/30" : "bg-white/10"}`}>
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className={`text-[11px] font-black uppercase tracking-widest ${selected === "service_provider" ? "text-white" : "text-slate-300"}`}>Artisan</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Offering services</p>
          </div>
        </button>
      </div>

      <Button
        disabled={!selected || isLoading}
        onClick={() => selected && onSelect(selected)}
        className="w-full h-14 bg-white hover:bg-[#8ca88b] text-slate-900 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-500 active:scale-[0.98]"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-[#608d64]" />
            Creating account...
          </span>
        ) : (
          "Create account & continue"
        )}
      </Button>
    </div>
  )
}


function TwoFAPanel({
  preAuthToken,
  isVerifying,
  onVerify,
  onCancel,
}: {
  preAuthToken: string
  isVerifying: boolean
  onVerify: (code: string) => void
  onCancel: () => void
}) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError("Enter your 6-digit code or a backup code.")
      return
    }
    setError("")
    onVerify(code.trim())
  }

  return (
    <div className="space-y-8">
      {/* Icon */}
      <div className="flex flex-col items-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-[#608d64]/15 border border-[#608d64]/30 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7 text-[#608d64]" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-serif italic text-white">Verify Your Identity</h2>
          <p className="text-slate-400 text-xs font-medium tracking-wide">
            Enter the 6-digit code from your authenticator app, or a backup code.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="totp-code" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">
            Authentication Code
          </Label>
          <Input
            id="totp-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\s/g, ""))
              setError("")
            }}
            maxLength={12}
            className={`h-14 bg-white/5 border-white/10 text-white text-center text-xl font-mono tracking-[0.5em] rounded-2xl px-6 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 transition-all ${error ? "border-red-500/50 bg-red-500/5" : ""}`}
            disabled={isVerifying}
            autoFocus
          />
          {error && (
            <p className="text-[9px] font-black text-red-400 uppercase tracking-wider px-1">{error}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isVerifying || !code.trim()}
          className="w-full h-14 bg-white hover:bg-[#8ca88b] text-slate-900 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-500 active:scale-[0.98]"
        >
          {isVerifying ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#608d64]" />
              Verifying
            </span>
          ) : (
            "Verify & Sign In"
          )}
        </Button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full text-[9px] font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
        >
          ← Back to sign in
        </button>
      </form>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SignInPage() {
  const { settings, isLoading: isLoadingSettings } = useSystemSettings()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [captchaRequired, setCaptchaRequired] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [loginBlocked, setLoginBlocked] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  // 2FA state
  const [twoFARequired, setTwoFARequired] = useState(false)
  const [preAuthToken, setPreAuthToken] = useState("")

  // Google new-user role selection — always start equal on server/client,
  // then open the panel from sessionStorage in useEffect (avoids hydration mismatch).
  const [roleSelectNeeded, setRoleSelectNeeded] = useState(false)
  const [roleSelectLoading, setRoleSelectLoading] = useState(false)
  const [googleSignupToken, setGoogleSignupToken] = useState<string | null>(null)
  const [pendingGoogleUser, setPendingGoogleUser] = useState<any>(null)

  const {
    login,
    isLoggingIn,
    loginWithGoogle,
    isGoogleLoggingIn,
    verifyTwoFactor,
    isVerifyingTwoFactor,
    user,
  } = useAuth()

  // Open role panel only for a pending NEW Google signup (no account yet).
  React.useEffect(() => {
    const syncPendingGoogleSignup = () => {
      const pending = googleSignupPending.read()
      if (!pending?.googleSignupToken) return

      // Never show role picker to someone already signed in with a role
      const existing = userManager.getUser()
      const hasRole =
        existing?.role === "event_owner" ||
        existing?.role === "service_provider" ||
        existing?.role === "admin"
      if (hasRole) {
        googleSignupPending.clear()
        return
      }

      setGoogleSignupToken(pending.googleSignupToken)
      setPendingGoogleUser(pending.user ?? null)
      setRoleSelectNeeded(true)
    }

    const params = new URLSearchParams(window.location.search)
    const googleError = params.get("google_error")
    if (googleError) {
      toast.error(googleError)
      window.history.replaceState({}, "", "/auth/signin")
    }

    if (params.get("google_role") === "1" || params.get("google") === "1") {
      window.history.replaceState({}, "", "/auth/signin")
      syncPendingGoogleSignup()
    } else {
      syncPendingGoogleSignup()
    }

    if (params.get("google_2fa") === "1") {
      try {
        const raw = sessionStorage.getItem("google_2fa_pending")
        sessionStorage.removeItem("google_2fa_pending")
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed?.preAuthToken) {
            setPreAuthToken(parsed.preAuthToken)
            setTwoFARequired(true)
          }
        }
      } catch {
        /* ignore */
      }
      window.history.replaceState({}, "", "/auth/signin")
    }

    window.addEventListener("google-signup-pending", syncPendingGoogleSignup)
    return () => window.removeEventListener("google-signup-pending", syncPendingGoogleSignup)
  }, [])

  // Role picker only for users with no role yet — never for existing Customer/Artisan/Admin logins.
  // (onboarding_completed=false is normal for providers mid-setup; that must not open this panel.)
  React.useEffect(() => {
    if (!user || twoFARequired || googleSignupToken) return

    const hasRole =
      user.role === "event_owner" ||
      user.role === "service_provider" ||
      user.role === "admin"

    if (hasRole) {
      // Stale Google signup draft must not hijack a returning user
      googleSignupPending.clear()
      if (roleSelectNeeded) {
        setRoleSelectNeeded(false)
        setPendingGoogleUser(null)
      }
      return
    }

    if (!roleSelectNeeded) {
      setPendingGoogleUser(user)
      setRoleSelectNeeded(true)
    }
  }, [user, roleSelectNeeded, twoFARequired, googleSignupToken])

  const openGoogleRolePanel = (result: {
    googleSignupToken?: string
    user?: any
  }) => {
    const token =
      result.googleSignupToken ||
      googleSignupPending.read()?.googleSignupToken ||
      null
    if (!token) {
      toast.error("Google verified your account, but role setup could not start. Please try again.")
      return
    }
    setGoogleSignupToken(token)
    setPendingGoogleUser(result.user ?? googleSignupPending.read()?.user ?? null)
    setRoleSelectNeeded(true)
  }

  // Fallback: older ?google=1 handoff that still has a raw code in sessionStorage
  React.useEffect(() => {
    finishGoogleOAuthReturn(async (code, role) => {
      try {
        const result = await loginWithGoogle({
          _codeOverride: code,
          ...(role ? { role } : {}),
        } as any)
        if (result?.requiresTwoFactor) {
          setPreAuthToken(result.preAuthToken ?? "")
          setTwoFARequired(true)
          return
        }
        if (result?.needsRoleSelection) {
          openGoogleRolePanel(result)
          return
        }
      } catch {
        // handled by mutation onError toast
      }
    })
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {}
    if (!email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email address"
    if (!password) newErrors.password = "Password is required"
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const refreshLoginSecurityStatus = React.useCallback(async (forEmail?: string) => {
    try {
      const target = (forEmail ?? email).trim().toLowerCase()
      const qs = target ? `?email=${encodeURIComponent(target)}` : ""
      const res = await apiClient.get<any>(`/api/v1/auth/login/security-status${qs}`)
      const data = (res as any)?.data ?? res
      setCaptchaRequired(Boolean(data?.captcha_required))
      if (data?.blocked) {
        setLoginBlocked(data?.message || "Too many login attempts. Please try again later.")
      } else {
        setLoginBlocked(null)
      }
    } catch {
      // Non-blocking — login still works without preflight
    }
  }, [email])

  React.useEffect(() => {
    const t = setTimeout(() => {
      if (email.includes("@")) refreshLoginSecurityStatus(email)
    }, 400)
    return () => clearTimeout(t)
  }, [email, refreshLoginSecurityStatus])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setAuthError(null)
    if (loginBlocked) {
      setAuthError(loginBlocked)
      toast.error(loginBlocked)
      return
    }
    if (captchaRequired && !captchaToken) {
      const msg = "Please complete the CAPTCHA and try again."
      setAuthError(msg)
      toast.error(msg)
      return
    }

    const loginData: LoginRequest = {
      email: email.trim().toLowerCase(),
      password,
      ...(captchaToken ? { captcha_token: captchaToken } : {}),
    }

    try {
      const result = await login(loginData) as any
      const data = result?.data ?? result
      if (data?.two_factor_required) {
        setPreAuthToken(data.pre_auth_token ?? "")
        setTwoFARequired(true)
      }
      setCaptchaRequired(false)
      setCaptchaToken(null)
      setLoginBlocked(null)
      setAuthError(null)
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Invalid email or password."
      setAuthError(message)
      if (/captcha/i.test(message) || /too many/i.test(message) || /try again later/i.test(message)) {
        setCaptchaRequired(true)
      }
      void refreshLoginSecurityStatus()
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle({})
      if (result?.requiresTwoFactor) {
        setPreAuthToken(result.preAuthToken ?? "")
        setTwoFARequired(true)
        return
      }
      if (result?.needsRoleSelection) {
        openGoogleRolePanel(result)
        return
      }
      // Existing users: useAuth handles redirect
    } catch {
      // handled by mutation onError
    }
  }

  const handleRoleSelect = async (role: "event_owner" | "service_provider") => {
    setRoleSelectLoading(true)
    try {
      const token = googleSignupToken || googleSignupPending.read()?.googleSignupToken
      if (token) {
        // New Google account — create with the selected role (no default)
        await loginWithGoogle({ google_signup_token: token, role })
        googleSignupPending.clear()
        setRoleSelectNeeded(false)
        setGoogleSignupToken(null)
        setPendingGoogleUser(null)
        return
      }

      // Legacy incomplete onboarding: update profile role
      if (!pendingGoogleUser) return
      await apiClient.put(`/api/v1/auth/update-profile`, {
        role,
        onboarding_completed: true,
      })
      const updatedUser = { ...pendingGoogleUser, role, onboarding_completed: true }
      userManager.setUser(updatedUser)
      setRoleSelectNeeded(false)
      setPendingGoogleUser(null)
      if (role === "service_provider") {
        router.push("/provider/dashboard?tab=onboarding")
      } else {
        router.push("/customer/dashboard")
      }
    } catch {
      toast.error("Failed to set role. Please try again.")
    } finally {
      setRoleSelectLoading(false)
    }
  }

  const handleTwoFAVerify = async (code: string) => {
    await verifyTwoFactor({ preAuthToken, code })
  }

  const handleCancelTwoFA = () => {
    setTwoFARequired(false)
    setPreAuthToken("")
  }

  // ── Loading skeleton (skip when we already know we need role / 2FA UI) ──
  if (isLoadingSettings && !roleSelectNeeded && !twoFARequired) {
    return (
      <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-white lg:overflow-hidden">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-100 animate-pulse" />
        <div className="flex-1 flex flex-col bg-slate-900 px-8 lg:px-24 pt-32 pb-20 relative overflow-hidden lg:overflow-y-auto">
          <div className="w-full max-w-sm mx-auto relative z-10 space-y-12">
            <div className="space-y-4">
              <div className="h-4 w-32 bg-white/10 animate-pulse rounded" />
              <div className="h-12 w-full bg-white/10 animate-pulse rounded-lg" />
            </div>
            <div className="space-y-8">
              <div className="h-14 w-full bg-white/10 animate-pulse rounded-2xl" />
              <div className="h-14 w-full bg-white/10 animate-pulse rounded-2xl" />
              <div className="h-16 w-full bg-white/10 animate-pulse rounded-2xl" />
              <div className="h-14 w-full bg-white/10 animate-pulse rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-white lg:overflow-hidden relative">
      {/* Visual narrative side — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-50">
        <img
          src={settings.authBackgroundImageUrl}
          alt="Editorial Wedding Scape"
          className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] hover:scale-105 transition-transform duration-[3s] ease-out"
        />
        <div className="absolute inset-0 bg-slate-900/10" />
        <div className="relative z-10 w-full h-full p-20 flex flex-col justify-between text-white drop-shadow-2xl">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
              <span className="font-serif italic text-2xl">V</span>
            </div>
            <span className="text-3xl font-serif italic tracking-tight">VowNest</span>
          </Link>
          <div className="max-w-md space-y-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-60">The Collective Spirit</p>
            <h2 className="text-6xl font-serif italic leading-[1.1]">Where Artistry Meets Your Eternal Story.</h2>
            <div className="h-[2px] w-24 bg-[#608d64]" />
          </div>
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
            <span>© 2024 Rwanda</span>
            <span>Est. Traditions</span>
          </div>
        </div>
      </div>

      {/* Interaction side */}
      <div className="flex-1 flex flex-col bg-slate-900 px-8 lg:px-24 pt-32 pb-20 relative overflow-hidden lg:overflow-y-auto">
        <div className="absolute top-0 right-0 h-96 w-96 bg-[#608d64]/10 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-96 w-96 bg-slate-500/10 blur-[120px] rounded-full -ml-48 -mb-48 pointer-events-none" />

        <div className="absolute top-8 right-8 lg:right-12 z-20">
          <Link
            href="/"
            className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[10px] font-black text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 uppercase tracking-[0.3em] transition-all group"
          >
            <Home className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
            <span>Return Home</span>
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto relative z-10 space-y-12">
          {twoFARequired ? (
            <TwoFAPanel
              preAuthToken={preAuthToken}
              isVerifying={isVerifyingTwoFactor}
              onVerify={handleTwoFAVerify}
              onCancel={handleCancelTwoFA}
            />
          ) : roleSelectNeeded ? (
            <RoleSelectPanel
              onSelect={handleRoleSelect}
              isLoading={roleSelectLoading}
              profile={pendingGoogleUser}
            />
          ) : (
            <>
              {/* ── Header ── */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-[#608d64] uppercase tracking-[0.4em]">Welcome Back</p>
                  <h1 className="text-5xl font-serif italic text-white leading-tight">Return to the Collective</h1>
                </div>
                <p className="text-slate-400 text-sm font-medium tracking-wide">
                  Continue your journey in curating timeless moments.
                </p>
              </div>

              {/* ── Google sign-in ── */}
              <div className="space-y-4">
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoggingIn || isLoggingIn}
                  className="w-full h-14 bg-white hover:bg-slate-100 text-slate-800 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-black/20 transition-all duration-300 active:scale-[0.98] border border-slate-200"
                >
                  {isGoogleLoggingIn ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                  ) : (
                    <GoogleIcon className="h-5 w-5 flex-shrink-0" />
                  )}
                  <span>{isGoogleLoggingIn ? "Connecting to Google..." : "Continue with Google"}</span>
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">or sign in with email</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
              </div>

              {/* ── Email form ── */}
              <form onSubmit={handleEmailSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Email Address
                      </Label>
                      {errors.email && (
                        <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">{errors.email}</span>
                      )}
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@artistry.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (errors.email) setErrors((p) => ({ ...p, email: undefined }))
                        if (authError) setAuthError(null)
                      }}
                      className={`h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 transition-all placeholder:text-slate-600 font-medium ${errors.email ? "border-red-500/50 bg-red-500/5" : ""}`}
                      disabled={isLoggingIn}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Secure Password
                      </Label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-[9px] font-black text-[#608d64] uppercase tracking-widest hover:text-[#608d64]/80 transition-colors"
                      >
                        Reset Access
                      </Link>
                    </div>
                    <div className="relative group">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (errors.password) setErrors((p) => ({ ...p, password: undefined }))
                          if (authError) setAuthError(null)
                        }}
                        className={`h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 pr-14 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 transition-all placeholder:text-slate-600 font-medium ${errors.password ? "border-red-500/50 bg-red-500/5" : ""}`}
                        disabled={isLoggingIn}
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoggingIn}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[9px] font-black text-red-400 uppercase tracking-wider px-1">{errors.password}</p>
                    )}
                  </div>
                </div>

                {loginBlocked && (
                  <p className="text-sm text-amber-300/90 bg-amber-500/10 border border-amber-400/20 rounded-xl px-4 py-3">
                    {loginBlocked}
                  </p>
                )}

                {authError && !loginBlocked && (
                  <p
                    role="alert"
                    className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-xl px-4 py-3"
                  >
                    {authError}
                  </p>
                )}

                {captchaRequired && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">
                      Security check required
                    </p>
                    <HCaptchaField onToken={setCaptchaToken} />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-16 bg-white hover:bg-[#8ca88b] text-slate-900 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-[#608d64]/10 transition-all duration-500 active:scale-[0.98]"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="h-4 w-4 animate-spin text-[#608d64]" />
                      <span>Authenticating</span>
                    </span>
                  ) : (
                    "Enter Collection"
                  )}
                </Button>
              </form>

              <div className="pt-8 border-t border-white/5 text-center space-y-4">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  New to the Rwanda Collective?
                </p>
                <Link
                  href="/auth/signup"
                  className="inline-block px-10 py-4 rounded-xl border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/5 hover:border-white/20 transition-all"
                >
                  Begin Your Presence
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

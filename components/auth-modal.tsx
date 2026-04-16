"use client"

import React, { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Loader2, Eye, EyeOff, X, Sparkles, ArrowRight,
    Lock, Mail, User, Phone, ChevronRight
} from "lucide-react"
import { authApi, tokenManager, userManager } from "@/lib/auth"
import { useQueryClient } from "@tanstack/react-query"
import { authKeys } from "@/hooks/useAuth"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Link from "next/link"

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface AuthModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** After successful login, navigate here instead of the dashboard */
    callbackUrl: string
    /** Human-readable context shown in the modal header */
    contextMessage?: string
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export function AuthModal({ open, onOpenChange, callbackUrl, contextMessage }: AuthModalProps) {
    const [tab, setTab] = useState<"signin" | "signup">("signin")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="p-0 border-none bg-transparent shadow-none max-w-[92vw] sm:max-w-lg w-full overflow-visible"
                // Hide the default shadcn close "×" button — we render our own
                showCloseButton={false}
            >
                {/* Ambient glow */}
                <div className="absolute -inset-6 bg-[#668c65]/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative z-10 bg-slate-900 rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
                    {/* Top accent stripe */}
                    <div className="h-[3px] w-full bg-gradient-to-r from-[#668c65]/0 via-[#668c65] to-[#668c65]/0" />

                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 relative">
                        {/* Close */}
                        <button
                            onClick={() => onOpenChange(false)}
                            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-[#668c65]/15 flex items-center justify-center border border-[#668c65]/30">
                                <Lock className="h-4 w-4 text-[#668c65]" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-[#668c65] uppercase tracking-[0.4em]">
                                    Authentication Required
                                </p>
                                <h2 className="text-xl font-serif italic text-white leading-tight">
                                    {tab === "signin" ? "Welcome Back" : "Join the Collective"}
                                </h2>
                            </div>
                        </div>

                        {contextMessage && (
                            <p className="text-slate-400 text-[11px] font-medium leading-relaxed border-l-2 border-[#668c65]/40 pl-3">
                                {contextMessage}
                            </p>
                        )}
                    </div>

                    {/* Tab switcher */}
                    <div className="px-8 mb-6">
                        <div className="grid grid-cols-2 bg-white/5 rounded-2xl p-1 gap-1">
                            <button
                                onClick={() => setTab("signin")}
                                className={cn(
                                    "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                    tab === "signin"
                                        ? "bg-[#668c65] text-white shadow-lg"
                                        : "text-slate-400 hover:text-white"
                                )}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setTab("signup")}
                                className={cn(
                                    "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                    tab === "signup"
                                        ? "bg-[#668c65] text-white shadow-lg"
                                        : "text-slate-400 hover:text-white"
                                )}
                            >
                                Register
                            </button>
                        </div>
                    </div>

                    {/* Forms — animated slide */}
                    <div className="px-8 pb-8 overflow-hidden">
                        {tab === "signin" ? (
                            <SignInForm
                                callbackUrl={callbackUrl}
                                onSuccess={() => onOpenChange(false)}
                                onSwitchTab={() => setTab("signup")}
                            />
                        ) : (
                            <RegisterForm
                                callbackUrl={callbackUrl}
                                onSuccess={() => onOpenChange(false)}
                                onSwitchTab={() => setTab("signin")}
                            />
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

/* ------------------------------------------------------------------ */
/*  Sign-In Form                                                        */
/* ------------------------------------------------------------------ */
function SignInForm({
    callbackUrl,
    onSuccess,
    onSwitchTab,
}: {
    callbackUrl: string
    onSuccess: () => void
    onSwitchTab: () => void
}) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

    const validate = () => {
        const e: { email?: string; password?: string } = {}
        if (!email) e.email = "Required"
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email"
        if (!password) e.password = "Required"
        else if (password.length < 6) e.password = "Min 6 chars"
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault()
        if (!validate()) return
        setLoading(true)
        try {
            const data = await authApi.login({ email: email.trim().toLowerCase(), password })
            const { user, accessToken, refreshToken } = data.data

            tokenManager.setTokens(accessToken, refreshToken)

            let finalUser = user
            if (!finalUser) {
                try {
                    const res = await authApi.getMe()
                    finalUser = res.data
                } catch { /* ignore */ }
            }
            if (finalUser) {
                userManager.setUser(finalUser)
                queryClient.setQueryData(authKeys.user(), finalUser)
            }

            toast.success("Welcome back! Continuing to booking…")
            onSuccess()
            // Navigate to callbackUrl using router for SPA feel
            router.push(callbackUrl)
        } catch (err: any) {
            toast.error(err.message || "Login failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Email */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <Mail className="h-3 w-3" /> Email
                    </Label>
                    {errors.email && <span className="text-[9px] font-black text-red-400 uppercase">{errors.email}</span>}
                </div>
                <Input
                    type="email"
                    placeholder="name@artistry.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })) }}
                    className={cn(
                        "h-12 bg-white/5 border-white/10 text-white rounded-2xl px-5 focus:ring-[#668c65]/20 focus:border-[#668c65]/40 placeholder:text-slate-600",
                        errors.email && "border-red-500/50 bg-red-500/5"
                    )}
                    disabled={loading}
                />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <Lock className="h-3 w-3" /> Password
                    </Label>
                    {errors.password && <span className="text-[9px] font-black text-red-400 uppercase">{errors.password}</span>}
                </div>
                <div className="relative">
                    <Input
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })) }}
                        className={cn(
                            "h-12 bg-white/5 border-white/10 text-white rounded-2xl px-5 pr-12 focus:ring-[#668c65]/20 focus:border-[#668c65]/40 placeholder:text-slate-600",
                            errors.password && "border-red-500/50 bg-red-500/5"
                        )}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        disabled={loading}
                    >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                <div className="flex justify-end pt-1">
                    <Link 
                        href="/auth/forgot-password" 
                        className="text-[9px] font-black text-[#668c65] uppercase tracking-widest hover:text-[#668c65]/80 transition-colors"
                    >
                        Forgot Password?
                    </Link>
                </div>
            </div>

            {/* Submit */}
            <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#668c65] hover:bg-[#668c65]/80 text-white rounded-2xl font-black uppercase tracking-[0.25em] text-[10px] transition-all duration-300 mt-2"
            >
                {loading ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Authenticating…</span>
                ) : (
                    <span className="flex items-center gap-2">Enter Collection <ArrowRight className="h-4 w-4" /></span>
                )}
            </Button>

            <p className="text-center text-[10px] text-slate-500 pt-1">
                Don't have an account?{" "}
                <button
                    type="button"
                    onClick={onSwitchTab}
                    className="text-[#668c65] hover:text-[#668c65]/80 font-black uppercase tracking-wider transition-colors"
                >
                    Register
                </button>
            </p>
        </form>
    )
}

/* ------------------------------------------------------------------ */
/*  Register Form                                                       */
/* ------------------------------------------------------------------ */
function RegisterForm({
    callbackUrl,
    onSuccess,
    onSwitchTab,
}: {
    callbackUrl: string
    onSuccess: () => void
    onSwitchTab: () => void
}) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const [form, setForm] = useState({
        fullName: "", email: "", password: "", confirmPassword: "", phone: "",
        role: "event_owner" as "event_owner" | "service_provider",
    })
    const [showPass, setShowPass] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const set = (k: string, v: string) => {
        setForm(p => ({ ...p, [k]: v }))
        setErrors(p => { const n = { ...p }; delete n[k]; return n })
    }

    const validate = () => {
        const e: Record<string, string> = {}
        if (!form.fullName.trim()) e.fullName = "Required"
        else if (form.fullName.trim().split(" ").length < 2) e.fullName = "Full name needed"
        if (!form.email) e.email = "Required"
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email"
        if (!form.password) e.password = "Required"
        else if (form.password.length < 6) e.password = "Min 6 chars"
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) e.password = "Needs upper, lower & number"
        if (!form.confirmPassword) e.confirmPassword = "Required"
        else if (form.password !== form.confirmPassword) e.confirmPassword = "Mismatch"
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault()
        if (!validate()) return
        setLoading(true)
        try {
            const regData = await authApi.register({
                full_name: form.fullName.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                confirmPassword: form.confirmPassword,
                phone: form.phone || undefined,
                role: form.role,
            })

            // Auto-login after registration
            const loginData = await authApi.login({
                email: form.email.trim().toLowerCase(),
                password: form.password,
            })

            const { user, accessToken, refreshToken } = loginData.data
            tokenManager.setTokens(accessToken, refreshToken)

            let finalUser = user
            if (!finalUser) {
                try { const res = await authApi.getMe(); finalUser = res.data } catch { /* ignore */ }
            }
            if (finalUser) {
                userManager.setUser(finalUser)
                queryClient.setQueryData(authKeys.user(), finalUser)
            }

            toast.success("Account created! Continuing to booking…")
            onSuccess()
            router.push(callbackUrl)
        } catch (err: any) {
            toast.error(err.message || "Registration failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const inputCls = (field: string) => cn(
        "h-11 bg-white/5 border-white/10 text-white rounded-xl px-4 focus:ring-[#668c65]/20 focus:border-[#668c65]/40 placeholder:text-slate-600 text-sm",
        errors[field] && "border-red-500/50 bg-red-500/5"
    )

    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 mb-1">
                {(["event_owner", "service_provider"] as const).map(role => (
                    <button
                        key={role}
                        type="button"
                        onClick={() => set("role", role)}
                        className={cn(
                            "p-3 rounded-xl border text-left transition-all duration-200",
                            form.role === role
                                ? "bg-[#668c65]/15 border-[#668c65]/50 text-white"
                                : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/[0.07]"
                        )}
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest">
                            {role === "event_owner" ? "Customer" : "Artisan"}
                        </p>
                        <p className="text-[9px] text-slate-500 mt-0.5">
                            {role === "event_owner" ? "Planning a wedding" : "Offering services"}
                        </p>
                    </button>
                ))}
            </div>

            {/* Full name */}
            <div className="space-y-1">
                <div className="flex justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                        <User className="h-3 w-3" /> Full Name
                    </Label>
                    {errors.fullName && <span className="text-[9px] text-red-400 font-black">{errors.fullName}</span>}
                </div>
                <Input placeholder="First Last" value={form.fullName} onChange={e => set("fullName", e.target.value)} className={inputCls("fullName")} disabled={loading} />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" /> Email
                        </Label>
                        {errors.email && <span className="text-[9px] text-red-400 font-black">{errors.email}</span>}
                    </div>
                    <Input type="email" placeholder="name@artistry.com" value={form.email} onChange={e => set("email", e.target.value)} className={inputCls("email")} disabled={loading} />
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" /> Phone
                        </Label>
                        {errors.phone && <span className="text-[9px] text-red-400 font-black">{errors.phone}</span>}
                    </div>
                    <Input type="tel" placeholder="+250 000 000" value={form.phone} onChange={e => set("phone", e.target.value)} className={inputCls("phone")} disabled={loading} />
                </div>
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Password</Label>
                        {errors.password && <span className="text-[9px] text-red-400 font-black">{errors.password}</span>}
                    </div>
                    <div className="relative">
                        <Input type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)} className={cn(inputCls("password"), "pr-10")} disabled={loading} />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white" disabled={loading}>
                            {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Confirm</Label>
                        {errors.confirmPassword && <span className="text-[9px] text-red-400 font-black">{errors.confirmPassword}</span>}
                    </div>
                    <div className="relative">
                        <Input type={showConfirm ? "text" : "password"} placeholder="••••••••" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} className={cn(inputCls("confirmPassword"), "pr-10")} disabled={loading} />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white" disabled={loading}>
                            {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Submit */}
            <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#668c65] hover:bg-[#668c65]/80 text-white rounded-2xl font-black uppercase tracking-[0.25em] text-[10px] transition-all duration-300 mt-1"
            >
                {loading ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating Account…</span>
                ) : (
                    <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" />Begin the Collection</span>
                )}
            </Button>

            <p className="text-center text-[10px] text-slate-500 pt-1">
                Already a member?{" "}
                <button type="button" onClick={onSwitchTab} className="text-[#668c65] hover:text-[#668c65]/80 font-black uppercase tracking-wider transition-colors">
                    Sign In
                </button>
            </p>
        </form>
    )
}

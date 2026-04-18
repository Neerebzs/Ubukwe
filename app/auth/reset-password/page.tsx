"use client"

import React, { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, CheckCircle2, Home } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

function ResetPasswordForm() {
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({})
    const [isSuccess, setIsSuccess] = useState(false)

    const { resetPassword, isResettingPassword } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    const email = searchParams.get("email")
    const token = searchParams.get("token")

    useEffect(() => {
        if (!email || !token) {
            router.push("/auth/forgot-password")
        }
    }, [email, token, router])

    const validateForm = (): boolean => {
        const newErrors: { password?: string; confirmPassword?: string } = {}

        if (!formData.password) {
            newErrors.password = "Password is required"
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters"
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = "Password must contain uppercase, lowercase, and a number"
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password"
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            await resetPassword({
                token: token || "",
                password: formData.password,
            })

            setIsSuccess(true)
            toast.success("Password reset successfully!")

            // Auto redirect after 3 seconds
            setTimeout(() => {
                router.push("/auth/signin")
            }, 3000)
        } catch (err: any) {
            toast.error(err.message || "Failed to reset password")
        }
    }

    return (
        <div className="w-full max-w-sm mx-auto relative z-10 space-y-12">
            {isSuccess ? (
                <div className="space-y-8">
                    <div className="flex justify-center">
                        <div className="h-20 w-20 bg-[#608d64]/10 rounded-full flex items-center justify-center border border-[#608d64]/30">
                            <CheckCircle2 className="h-10 w-10 text-[#608d64]" />
                        </div>
                    </div>
                    <div className="space-y-4 text-center">
                        <h2 className="text-3xl font-serif italic text-white leading-tight">Password Reset</h2>
                        <p className="text-slate-400 text-sm font-medium tracking-wide">
                            Your secure password has been updated successfully.
                        </p>
                    </div>
                    <Button
                        asChild
                        className="w-full h-16 bg-white hover:bg-[#8ca88b] text-slate-900 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-[#608d64]/10 transition-all duration-500 active:scale-[0.98]"
                    >
                        <Link href="/auth/signin">Sign In Now</Link>
                    </Button>
                    <p className="text-center text-[9px] font-bold uppercase tracking-widest text-slate-500">
                        Redirecting automatically...
                    </p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-[#608d64] uppercase tracking-[0.4em]">Security</p>
                            <h1 className="text-5xl font-serif italic text-white leading-tight">New Password</h1>
                        </div>
                        <p className="text-slate-400 text-sm font-medium tracking-wide">
                            Create a secure password for your account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">New Password</Label>
                                </div>
                                <div className="relative group">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => {
                                            setFormData({ ...formData, password: e.target.value })
                                            if (errors.password) setErrors(prev => ({ ...prev, password: undefined }))
                                        }}
                                        className={`h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 pr-14 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 transition-all placeholder:text-slate-600 font-medium ${errors.password ? 'border-red-500/50 bg-red-500/5' : ''}`}
                                        disabled={isResettingPassword}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isResettingPassword}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-[9px] font-black text-red-400 uppercase tracking-wider px-1">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <Label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Confirm Password</Label>
                                </div>
                                <div className="relative group">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => {
                                            setFormData({ ...formData, confirmPassword: e.target.value })
                                            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }))
                                        }}
                                        className={`h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 pr-14 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 transition-all placeholder:text-slate-600 font-medium ${errors.confirmPassword ? 'border-red-500/50 bg-red-500/5' : ''}`}
                                        disabled={isResettingPassword}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={isResettingPassword}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-[9px] font-black text-red-400 uppercase tracking-wider px-1">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-16 bg-white hover:bg-[#8ca88b] text-slate-900 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-[#608d64]/10 transition-all duration-500 active:scale-[0.98]"
                            disabled={isResettingPassword}
                        >
                            {isResettingPassword ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="h-4 w-4 animate-spin text-[#608d64]" />
                                    <span>Resetting</span>
                                </div>
                            ) : (
                                'Reset Password'
                            )}
                        </Button>
                    </form>
                </div>
            )}
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-white">
            {/* Visual Narrative Side - Desktop only */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-50">
                <img
                    src="/grom.jpg"
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

            <div className="flex-1 flex flex-col bg-slate-900 px-8 lg:px-24 pt-32 pb-20 relative overflow-hidden">
                {/* Subtle background texture */}
                <div className="absolute top-0 right-0 h-96 w-96 bg-[#608d64]/10 blur-[120px] rounded-full -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 h-96 w-96 bg-slate-500/10 blur-[120px] rounded-full -ml-48 -mb-48" />

                {/* Return to Home - Modern Right Alignment */}
                <div className="absolute top-8 right-8 lg:right-12 z-20">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[10px] font-black text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 uppercase tracking-[0.3em] transition-all group"
                    >
                        <Home className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                        <span>Return Home</span>
                    </Link>
                </div>

                <Suspense fallback={<div className="flex justify-center items-center w-full max-w-sm mx-auto min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-[#608d64]" /></div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}

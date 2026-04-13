"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [error, setError] = useState<string | undefined>()
    const { forgotPassword, isSendingResetEmail } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(undefined)

        if (!email) {
            setError("Email is required")
            return
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address")
            return
        }

        try {
            const response = await forgotPassword(email)
            const resetToken = response?.data?.reset_token
            if (resetToken && typeof window !== "undefined") {
                sessionStorage.setItem("resetPasswordToken", resetToken)
            }
            router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`)
        } catch (err: any) {
            setError(err.message || "Failed to send reset email")
        }
    }

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

            {/* Interaction Side */}
            <div className="flex-1 flex flex-col bg-slate-900 justify-center px-8 lg:px-24 py-20 relative overflow-hidden">
                {/* Subtle background texture */}
                <div className="absolute top-0 right-0 h-96 w-96 bg-[#608d64]/10 blur-[120px] rounded-full -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 h-96 w-96 bg-slate-500/10 blur-[120px] rounded-full -ml-48 -mb-48" />

                {/* Return to Home - Mobile/Desktop */}
                <div className="absolute top-8 left-8 lg:left-24 z-20">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-[#608d64] uppercase tracking-[0.3em] transition-all group"
                    >
                        <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#608d64]/30 group-hover:bg-[#608d64]/5 transition-all">
                            <Home className="h-3 w-3" />
                        </div>
                        <span>Return Home</span>
                    </Link>
                </div>

                <div className="w-full max-w-sm mx-auto relative z-10 space-y-12">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-[#608d64] uppercase tracking-[0.4em]">Recovery</p>
                            <h1 className="text-5xl font-serif italic text-white leading-tight">Reset Password</h1>
                        </div>
                        <p className="text-slate-400 text-sm font-medium tracking-wide">
                            We'll send a 6-digit verification code to your email address.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</Label>
                                    {error ? (
                                        <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">{error}</span>
                                    ) : null}
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@artistry.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        if (error) setError(undefined)
                                    }}
                                    className={`h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 transition-all placeholder:text-slate-600 font-medium ${error ? 'border-red-500/50 bg-red-500/5' : ''}`}
                                    disabled={isSendingResetEmail}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-16 bg-white hover:bg-[#8ca88b] text-slate-900 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-[#608d64]/10 transition-all duration-500 active:scale-[0.98]"
                            disabled={isSendingResetEmail}
                        >
                            {isSendingResetEmail ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="h-4 w-4 animate-spin text-[#608d64]" />
                                    <span>Sending Code</span>
                                </div>
                            ) : (
                                'Send Code'
                            )}
                        </Button>

                        <div className="pt-8 border-t border-white/5 text-center">
                            <Link
                                href="/auth/signin"
                                className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Sign In
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

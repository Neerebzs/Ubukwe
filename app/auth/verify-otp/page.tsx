"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft, RefreshCw, Home } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

function VerifyOtpForm() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [isVerifying, setIsVerifying] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [timer, setTimer] = useState(60)
    const [resetToken, setResetToken] = useState("")
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""

    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        if (!email) {
            router.push("/auth/forgot-password")
        }
    }, [email, router])

    useEffect(() => {
        if (typeof window === "undefined") {
            return
        }

        const storedToken = sessionStorage.getItem("resetPasswordToken") || ""
        setResetToken(storedToken)

        if (!storedToken && email) {
            router.push(`/auth/forgot-password?email=${encodeURIComponent(email)}`)
        }
    }, [email, router])

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [timer])

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const pastedData = value.slice(0, 6).split("")
            const newOtp = [...otp]
            pastedData.forEach((char, i) => {
                if (index + i < 6) newOtp[index + i] = char
            })
            setOtp(newOtp)
            // Focus last filled or next empty
            const nextIndex = Math.min(index + pastedData.length, 5)
            inputRefs.current[nextIndex]?.focus()
            return
        }

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleResend = async () => {
        setIsResending(true)
        try {
            const { apiClient } = await import('@/lib/api')
            const response = await apiClient.post(`/api/v1/auth/forgot-password`, { email })
            const newToken = (response.data as any)?.reset_token
            if (newToken && typeof window !== "undefined") {
                sessionStorage.setItem("resetPasswordToken", newToken)
                setResetToken(newToken)
            }
            setTimer(60)
            toast.success("Code resent successfully!")
        } catch (err) {
            toast.error("Failed to resend code")
        } finally {
            setIsResending(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const otpValue = otp.join("")
        if (otpValue.length < 6) {
            toast.error("Please enter the full 6-digit code")
            return
        }

        setIsVerifying(true)
        try {
            if (!resetToken) {
                throw new Error("Verification session expired. Please request a new code.")
            }

            const { apiClient } = await import('@/lib/api')
            await apiClient.post(`/api/v1/auth/verify-otp`, { email, otp: otpValue, reset_token: resetToken })
            toast.success("OTP verified successfully!")
            router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken)}`)
        } catch (err: any) {
            toast.error(err.message || "Invalid or expired code")
        } finally {
            setIsVerifying(false)
        }
    }

    return (
        <div className="w-full max-w-sm mx-auto relative z-10 space-y-12">
            {/* Header */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <p className="text-[9px] font-black text-[#608d64] uppercase tracking-[0.4em]">Authentication</p>
                    <h1 className="text-5xl font-serif italic text-white leading-tight">Verification</h1>
                </div>
                <p className="text-slate-400 text-sm font-medium tracking-wide">
                    We've sent a 6-digit code to <span className="text-white">{email}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    <div className="flex justify-between gap-2">
                        {otp.map((digit, index) => (
                            <Input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el
                                }}
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="h-14 w-12 text-center text-xl font-bold bg-white/5 border-white/10 text-white rounded-xl focus:ring-[#608d64]/20 focus:border-[#608d64]/40 transition-all font-medium"
                                disabled={isVerifying}
                            />
                        ))}
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            Didn't receive the code?{" "}
                            {timer > 0 ? (
                                <span className="text-white/60">Resend in {timer}s</span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="text-[#608d64] hover:text-white transition-colors inline-flex items-center"
                                >
                                    {isResending && <RefreshCw className="mr-1 h-3 w-3 animate-spin" />}
                                    Resend Now
                                </button>
                            )}
                        </p>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-16 bg-white hover:bg-[#8ca88b] text-slate-900 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-[#608d64]/10 transition-all duration-500 active:scale-[0.98]"
                    disabled={isVerifying || otp.join("").length < 6}
                >
                    {isVerifying ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-4 w-4 animate-spin text-[#608d64]" />
                            <span>Verifying</span>
                        </div>
                    ) : (
                        'Verify Code'
                    )}
                </Button>

                <div className="pt-8 border-t border-white/5 text-center">
                    <Link
                        href="/auth/forgot-password"
                        className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Try a different email
                    </Link>
                </div>
            </form>
        </div>
    )
}

export default function VerifyOtpPage() {
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
                    <VerifyOtpForm />
                </Suspense>
            </div>
        </div>
    )
}

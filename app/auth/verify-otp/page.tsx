"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

export default function VerifyOtpPage() {
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
            const newToken = response.data?.reset_token
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
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center space-x-2 mb-4">
                        <div className="h-8 w-8 rounded-full bg-primary"></div>
                        <span className="text-xl font-bold text-foreground">Ubukwe</span>
                        <Badge variant="secondary" className="text-xs">
                            Rwanda
                        </Badge>
                    </Link>
                    <h1 className="text-2xl font-bold mb-2">Verify Account</h1>
                    <p className="text-muted-foreground">
                        We've sent a code to <span className="font-medium text-foreground">{email}</span>
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Enter Code</CardTitle>
                        <CardDescription>
                            Please enter the 6-digit verification code sent to your email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                        className="w-12 h-12 text-center text-xl font-bold"
                                        disabled={isVerifying}
                                    />
                                ))}
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Didn't receive the code?{" "}
                                    {timer > 0 ? (
                                        <span className="font-medium">Resend in {timer}s</span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResend}
                                            disabled={isResending}
                                            className="text-primary hover:underline font-medium inline-flex items-center"
                                        >
                                            {isResending && <RefreshCw className="mr-1 h-3 w-3 animate-spin" />}
                                            Resend Now
                                        </button>
                                    )}
                                </p>
                            </div>

                            <Button type="submit" className="w-full" disabled={isVerifying || otp.join("").length < 6}>
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify Code"
                                )}
                            </Button>

                            <div className="text-center">
                                <Link
                                    href="/auth/forgot-password"
                                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Try a different email
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [error, setError] = useState<string | undefined>()
    const [isSent, setIsSent] = useState(false)
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

    if (isSent) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <Card>
                        <CardHeader>
                            <CardTitle>Check Your Email</CardTitle>
                            <CardDescription>
                                We sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                The link expires in 15 minutes. If you do not see the email, check your spam folder.
                            </p>
                            <Button asChild className="w-full">
                                <Link href="/auth/signin">Back to Sign In</Link>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => setIsSent(false)}
                            >
                                Send to a different email
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
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
                    <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
                    <p className="text-muted-foreground">Enter your email to receive a reset code</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Reset Password</CardTitle>
                        <CardDescription>
                            We'll send a 6-digit verification code to your email address.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        if (error) setError(undefined)
                                    }}
                                    className={error ? "border-red-500" : ""}
                                    disabled={isSendingResetEmail}
                                />
                                {error && <p className="text-sm text-red-500">{error}</p>}
                            </div>

                            <Button type="submit" className="w-full" disabled={isSendingResetEmail}>
                                {isSendingResetEmail ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending Code...
                                    </>
                                ) : (
                                    "Send Code"
                                )}
                            </Button>

                            <div className="text-center mt-4">
                                <Link
                                    href="/auth/signin"
                                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Sign In
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

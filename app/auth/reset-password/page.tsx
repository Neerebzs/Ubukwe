"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function ResetPasswordPage() {
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

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <div className="bg-background p-8 rounded-lg shadow-lg border border-border">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Password Reset Successful</h2>
                        <p className="text-muted-foreground mb-6">
                            Your password has been changed successfully. You can now use your new password to sign in.
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/auth/signin">Sign In Now</Link>
                        </Button>
                        <p className="text-xs text-muted-foreground mt-4">
                            Redirecting you to login in a few seconds...
                        </p>
                    </div>
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
                    <h1 className="text-2xl font-bold mb-2">Set New Password</h1>
                    <p className="text-muted-foreground">Create a secure password for your account</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>New Password</CardTitle>
                        <CardDescription>
                            Please enter and confirm your new password below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={formData.password}
                                        onChange={(e) => {
                                            setFormData({ ...formData, password: e.target.value })
                                            if (errors.password) setErrors(prev => ({ ...prev, password: undefined }))
                                        }}
                                        className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                                        disabled={isResettingPassword}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isResettingPassword}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm new password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => {
                                            setFormData({ ...formData, confirmPassword: e.target.value })
                                            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }))
                                        }}
                                        className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                                        disabled={isResettingPassword}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={isResettingPassword}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isResettingPassword}>
                                {isResettingPassword ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting Password...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

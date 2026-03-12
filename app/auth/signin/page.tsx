"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { LoginRequest } from "@/lib/api"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const { login, isLoggingIn, isAuthenticated } = useAuth()

  // Redirect if already authenticated - let useAuth handle role-based routing
  React.useEffect(() => {
    if (isAuthenticated) {
      // The useAuth hook will handle the redirect based on user role
      // No need to hardcode the redirect here
    }
  }, [isAuthenticated])

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const loginData: LoginRequest = {
      email: email.trim().toLowerCase(),
      password,
    }

    login(loginData)
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

        <div className="w-full max-w-sm mx-auto relative z-10 space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[9px] font-black text-[#608d64] uppercase tracking-[0.4em]">Welcome Back</p>
              <h1 className="text-5xl font-serif italic text-white leading-tight">Return to the Collective</h1>
            </div>
            <p className="text-slate-400 text-sm font-medium tracking-wide">
              Continue your journey in curating timeless moments.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</Label>
                  {errors.email && <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">{errors.email}</span>}
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@artistry.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }))
                  }}
                  className={`h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 transition-all placeholder:text-slate-600 font-medium ${errors.email ? 'border-red-500/50 bg-red-500/5' : ''}`}
                  disabled={isLoggingIn}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Secure Password</Label>
                  <Link href="/auth/forgot-password" className="text-[9px] font-black text-[#608d64] uppercase tracking-widest hover:text-[#608d64]/80 transition-colors">
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
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }))
                    }}
                    className={`h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 pr-14 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 transition-all placeholder:text-slate-600 font-medium ${errors.password ? 'border-red-500/50 bg-red-500/5' : ''}`}
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
                {errors.password && <p className="text-[9px] font-black text-red-400 uppercase tracking-wider px-1">{errors.password}</p>}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-16 bg-white hover:bg-[#8ca88b] text-slate-900 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-[#608d64]/10 transition-all duration-500 active:scale-[0.98]"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-[#608d64]" />
                  <span>Authenticating</span>
                </div>
              ) : (
                'Enter Collection'
              )}
            </Button>
          </form>

          <div className="pt-8 border-t border-white/5 text-center space-y-4">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              New to the Rwanda Collective?
            </p>
            <Link href="/auth/signup" className="inline-block px-10 py-4 rounded-xl border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/5 hover:border-white/20 transition-all">
              Begin Your Presence
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

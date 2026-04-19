"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Eye, EyeOff, Home } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { RegisterRequest } from "@/lib/api"
import { useSystemSettings } from "@/contexts/system-settings-context"

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  phone?: string
}

export default function SignUpPage() {
  const { settings } = useSystemSettings();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "event_owner" as "event_owner" | "service_provider",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const { register, isRegistering, isAuthenticated } = useAuth()

  // Redirect if already authenticated - let useAuth handle role-based routing
  React.useEffect(() => {
    if (isAuthenticated) {
      // The useAuth hook will handle the redirect based on user role
      // No need to hardcode the redirect here
    }
  }, [isAuthenticated])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Please enter your full name (first and last name)'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (formData.phone && !/^07\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must start with 07 followed by 8 digits (e.g. 0781234567)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const registerData: RegisterRequest = {
      full_name: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phone: formData.phone || undefined,
      role: formData.role,
    }

    register(registerData)
  }

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-white lg:overflow-hidden">
      {/* Visual Narrative Side - Desktop only */}
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
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-60">Join the Collective</p>
            <h2 className="text-6xl font-serif italic leading-[1.1]">Architect Your Presence in the Grand Narrative.</h2>
            <div className="h-[2px] w-24 bg-[#608d64]" />
          </div>

          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
            <span>© 2024 Rwanda</span>
            <span>Est. Traditions</span>
          </div>
        </div>
      </div>

      {/* Interaction Side */}
      <div className="flex-1 flex flex-col bg-slate-900 px-6 md:px-8 lg:px-24 pt-32 pb-20 relative overflow-x-hidden lg:overflow-y-auto">
        {/* Subtle background texture */}
        <div className="absolute top-0 right-0 h-96 w-96 bg-[#608d64]/10 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-96 w-96 bg-slate-500/10 blur-[120px] rounded-full -ml-48 -mb-48 pointer-events-none" />

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

        <div className="w-full max-w-xl mx-auto relative z-10 space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[9px] font-black text-[#608d64] uppercase tracking-[0.4em]">New Presence</p>
              <h1 className="text-5xl font-serif italic text-white leading-tight">Join the Rwanda Collective</h1>
            </div>
            <p className="text-slate-400 text-sm font-medium tracking-wide">
              Become part of a curated community of artisans and visionaries.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Define Your Role</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value: "event_owner" | "service_provider") => setFormData({ ...formData, role: value })}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  disabled={isRegistering}
                >
                  <label
                    htmlFor="customer"
                    className={`flex items-center p-6 rounded-2xl border transition-all cursor-pointer ${formData.role === 'event_owner' ? 'bg-white/10 border-[#608d64]/50 shadow-lg shadow-[#608d64]/10' : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'}`}
                  >
                    <RadioGroupItem value="event_owner" id="customer" className="sr-only" />
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${formData.role === 'event_owner' ? 'text-white' : 'text-slate-400'}`}>Customer</span>
                      <span className="text-[9px] text-slate-500 font-medium tracking-wide">Planning a wedding</span>
                    </div>
                  </label>
                  <label
                    htmlFor="provider"
                    className={`flex items-center p-6 rounded-2xl border transition-all cursor-pointer ${formData.role === 'service_provider' ? 'bg-white/10 border-[#608d64]/50 shadow-lg shadow-[#608d64]/10' : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'}`}
                  >
                    <RadioGroupItem value="service_provider" id="provider" className="sr-only" />
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${formData.role === 'service_provider' ? 'text-white' : 'text-slate-400'}`}>Artisan</span>
                      <span className="text-[9px] text-slate-500 font-medium tracking-wide">Offering services</span>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              <div className="h-[1px] w-full bg-white/5" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="fullName" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Full Legal Name</Label>
                    {errors.fullName && <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">{errors.fullName}</span>}
                  </div>
                  <Input
                    id="fullName"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value })
                      if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }))
                    }}
                    className={`h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 transition-all font-medium ${errors.fullName ? 'border-red-500/50 bg-red-500/5' : ''}`}
                    disabled={isRegistering}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</Label>
                    {errors.email && <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">{errors.email}</span>}
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@artistry.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      if (errors.email) setErrors(prev => ({ ...prev, email: undefined }))
                    }}
                    className={`h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 transition-all font-medium ${errors.email ? 'border-red-500/50 bg-red-500/5' : ''}`}
                    disabled={isRegistering}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone (Optional)</Label>
                    {errors.phone && <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">{errors.phone}</span>}
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="07XXXXXXXX"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => {
                      // Strip non-digits
                      let val = e.target.value.replace(/\D/g, '')
                      // Enforce leading "07"
                      if (val.length >= 1 && val[0] !== '0') val = '0' + val
                      if (val.length >= 2 && val[1] !== '7') val = val[0] + '7' + val.slice(2)
                      // Cap at 10 digits
                      val = val.slice(0, 10)
                      setFormData({ ...formData, phone: val })
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }))
                    }}
                    className={`h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 transition-all font-medium ${errors.phone ? 'border-red-500/50 bg-red-500/5' : ''}`}
                    disabled={isRegistering}
                  />
                  <p className="text-[9px] text-slate-600 px-1">Format: 07XXXXXXXX (10 digits)</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Password</Label>
                    {errors.password && <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">{errors.password}</span>}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value })
                        if (errors.password) setErrors(prev => ({ ...prev, password: undefined }))
                      }}
                      className={`h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 pr-14 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 transition-all font-medium ${errors.password ? 'border-red-500/50 bg-red-500/5' : ''}`}
                      disabled={isRegistering}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isRegistering}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Confirm Access</Label>
                    {errors.confirmPassword && <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">{errors.confirmPassword}</span>}
                  </div>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value })
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }))
                      }}
                      className={`h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 pr-14 focus:ring-[#608d64]/20 focus:border-[#608d64]/40 transition-all font-medium ${errors.confirmPassword ? 'border-red-500/50 bg-red-500/5' : ''}`}
                      disabled={isRegistering}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isRegistering}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-16 bg-white hover:bg-[#8ca88b] text-slate-900 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-[#608d64]/10 transition-all duration-500 active:scale-[0.98]"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-[#608d64]" />
                  <span>Creating Presence</span>
                </div>
              ) : (
                'Begin the Collection'
              )}
            </Button>
          </form>

          <div className="pt-8 border-t border-white/5 text-center space-y-4">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              Already a member of the collective?
            </p>
            <Link href="/auth/signin" className="inline-block px-10 py-4 rounded-xl border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/5 hover:border-white/20 transition-all">
              Return to Portals
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

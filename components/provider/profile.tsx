"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Globe, Phone, Mail, Award, CheckCircle, Edit, User, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Placeholder for profile data - in a real app, this would come from props or a data fetch
const profile = {
  businessName: "Jean Mukamana",
  rating: "4.8",
  location: "Kigali, Rwanda",
  email: "jean.mukamana@example.com",
  phone: "+250 788 123 456",
  website: "www.rwandanculture.com",
  categories: ["Traditional Dance", "Cultural Music", "Storytelling", "Craft Workshops"],
};

export function ProviderProfile() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-4xl font-serif italic text-slate-900 tracking-tight">Identity</h2>
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-[#668c65]/60" />
          <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em]">Professional Persona & Credentials</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1 border-slate-100 shadow-none rounded-[2.5rem] overflow-hidden bg-white">
          <div className="h-24 bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#668c65]/5 rounded-full -mr-16 -mt-16" />
          </div>
          <CardHeader className="relative pt-0 px-8 pb-4">
            <div className="absolute -top-12 left-8 p-1 rounded-[2rem] bg-white shadow-xl shadow-slate-200/50">
              <div className="w-24 h-24 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                <User className="w-10 h-10" />
              </div>
            </div>
            <div className="mt-14 space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-serif italic text-slate-900 leading-tight">{profile.businessName}</CardTitle>
                <ShieldCheck className="w-5 h-5 text-[#668c65]" />
              </div>
              <Badge variant="outline" className="bg-[#668c65]/5 border-none text-[#668c65] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Verified Artisan
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 group">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#668c65]/10 group-hover:text-[#668c65] transition-colors">
                  <Star className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Global Merit</span>
                  <span className="text-sm font-bold text-slate-700">{profile.rating} / 5.0</span>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#668c65]/10 group-hover:text-[#668c65] transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Base of Operations</span>
                  <span className="text-sm font-medium text-slate-600">{profile.location}</span>
                </div>
              </div>
            </div>

            <Button className="w-full rounded-2xl bg-[#668c65] hover:bg-[#0b7a6f] text-white shadow-lg shadow-[#668c65]/20 h-12 transition-all group">
              <Edit className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-[10px] uppercase tracking-widest">Refine Identity</span>
            </Button>
          </CardContent>
        </Card>

        {/* Info Tabs */}
        <div className="md:col-span-2 space-y-8">
          <Card className="border-slate-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4 border-b border-slate-50">
              <CardTitle className="text-xl font-serif italic text-slate-900">Communication & Contact</CardTitle>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Foundational access points</p>
            </CardHeader>
            <CardContent className="p-8 grid gap-8 md:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-slate-300" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Digital Mailbox</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{profile.email}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-slate-300" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Voice Line</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{profile.phone}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-slate-300" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Digital Hub</span>
                </div>
                <p className="text-sm font-bold text-[#668c65] hover:underline cursor-pointer">{profile.website}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4 border-b border-slate-50">
              <CardTitle className="text-xl font-serif italic text-slate-900">Artisanal Domains</CardTitle>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Core service specializations</p>
            </CardHeader>
            <CardContent className="p-8 flex flex-wrap gap-3">
              {profile.categories.map((cat, i) => (
                <Badge key={i} variant="outline" className="rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white transition-colors text-slate-600 font-bold text-[10px] uppercase tracking-widest px-4 py-2 flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-[#668c65]" />
                  {cat}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

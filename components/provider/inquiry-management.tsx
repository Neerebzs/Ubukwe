"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Clock, CheckCircle, XCircle, Star, Mail, Phone, Calendar, DollarSign, Search, Filter, TrendingUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { StatCard } from "@/components/admin/stat-card"
import { cn } from "@/lib/utils"

interface Inquiry {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceRequested: string
  weddingDate: string
  location: string
  budget?: string
  message: string
  status: "new" | "responded" | "quoted" | "booked" | "declined"
  receivedAt: string
  responseTime?: number
  matchScore?: number
}

interface InquiryManagementProps {
  onSendQuote?: (inquiryId: string, customerId: string) => void
}

export function InquiryManagement({ onSendQuote }: InquiryManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)

  // Mock data
  const inquiries: Inquiry[] = [
    {
      id: "1",
      customerName: "Marie Uwimana",
      customerEmail: "marie@example.com",
      customerPhone: "+250788123456",
      serviceRequested: "Traditional Dancers",
      weddingDate: "2024-06-15",
      location: "Kigali",
      budget: "150,000 RWF",
      message: "Looking for traditional dancers for our wedding in June. Need 8-10 dancers.",
      status: "new",
      receivedAt: "2024-03-10T08:30:00",
      matchScore: 95,
    },
    {
      id: "2",
      customerName: "Jean Baptiste",
      customerEmail: "jean@example.com",
      customerPhone: "+250788654321",
      serviceRequested: "MC Services",
      weddingDate: "2024-05-20",
      location: "Butare",
      budget: "100,000 RWF",
      message: "Need a bilingual MC for our wedding ceremony.",
      status: "responded",
      receivedAt: "2024-03-08T14:20:00",
      responseTime: 45,
      matchScore: 88,
    },
    {
      id: "3",
      customerName: "Grace Mukamana",
      customerEmail: "grace@example.com",
      customerPhone: "+250788987654",
      serviceRequested: "Traditional Dancers",
      weddingDate: "2024-04-10",
      location: "Kigali",
      message: "Short notice booking for traditional performance.",
      status: "quoted",
      receivedAt: "2024-03-05T10:15:00",
      matchScore: 92,
    },
  ]

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch = inq.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || inq.serviceRequested.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || inq.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Inquiry["status"]) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      new: { variant: "default", label: "New", icon: Clock },
      responded: { variant: "secondary", label: "Responded", icon: MessageSquare },
      quoted: { variant: "outline", label: "Quoted", icon: DollarSign },
      booked: { variant: "default", label: "Booked", icon: CheckCircle },
      declined: { variant: "destructive", label: "Declined", icon: XCircle },
    }
    const config = variants[status]
    const Icon = config.icon
    return (
      <Badge
        variant="outline"
        className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold tracking-tight border-none shadow-none",
          status === "new" ? "bg-emerald-50 text-emerald-600" :
            status === "responded" ? "bg-slate-50 text-slate-600" :
              status === "quoted" ? "bg-indigo-50 text-indigo-600" :
                status === "booked" ? "bg-[#668c65]/10 text-[#668c65]" :
                  "bg-rose-50 text-rose-600"
        )}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-4xl font-serif italic text-slate-900 tracking-tight">Inquiries</h2>
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-[#668c65]/60" />
          <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em]">Customer Engagement Portal</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-2xl border-slate-100 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] rounded-2xl border-slate-100 bg-white">
              <Filter className="w-4 h-4 mr-2 text-[#668c65]" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="New Inquiries"
          value={inquiries.filter((i) => i.status === "new").length}
          icon={Clock}
          color="#668c65"
        />
        <StatCard
          label="Avg. Response"
          value="2h"
          icon={MessageSquare}
          color="#668c65"
          trend="-15min"
          trendType="up"
        />
        <StatCard
          label="Conversion"
          value="85%"
          icon={CheckCircle}
          color="#668c65"
          trend="+5%"
        />
        <StatCard
          label="Total Monthly"
          value={inquiries.length}
          icon={TrendingUp}
          color="#668c65"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {filteredInquiries.length === 0 ? (
            <EmptyState
              title="No inquiries found"
              description="Try adjusting your filters or check back later."
              icon={<MessageSquare className="h-12 w-12 mx-auto text-slate-300" />}
            />
          ) : (
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {filteredInquiries.map((inquiry) => (
                <Card
                  key={inquiry.id}
                  className={cn(
                    "cursor-pointer transition-all duration-300 border-slate-100 rounded-[2rem] overflow-hidden group hover:shadow-lg",
                    selectedInquiry?.id === inquiry.id
                      ? "ring-2 ring-[#668c65] bg-[#668c65]/5"
                      : "bg-white"
                  )}
                  onClick={() => setSelectedInquiry(inquiry)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-[#668c65] font-black text-xs border border-slate-100 group-hover:bg-white transition-colors">
                          {inquiry.customerName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{inquiry.customerName}</p>
                          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">{formatTimeAgo(inquiry.receivedAt)}</p>
                        </div>
                      </div>
                      {getStatusBadge(inquiry.status)}
                    </div>
                    <p className="text-sm font-serif italic text-slate-800 mb-1">{inquiry.serviceRequested}</p>
                    <p className="text-xs text-slate-500 font-light leading-relaxed line-clamp-2">{inquiry.message}</p>
                    {inquiry.matchScore && (
                      <div className="mt-4 flex items-center gap-2">
                        <div className="h-[2px] flex-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#668c65] rounded-full" style={{ width: `${inquiry.matchScore}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-[#668c65] uppercase tracking-tighter">{inquiry.matchScore}% Match</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedInquiry ? (
            <Card className="border-slate-100 shadow-none rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="p-8 pb-6 border-b border-slate-50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-serif italic text-slate-900 tracking-tight">{selectedInquiry.serviceRequested}</CardTitle>
                    <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.2em] mt-1">
                      Inquiry from {selectedInquiry.customerName}
                    </p>
                  </div>
                  {getStatusBadge(selectedInquiry.status)}
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                {/* Customer Info */}
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400">Customer Identity</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center text-[#668c65] font-black text-lg border border-slate-100">
                        {selectedInquiry.customerName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg">{selectedInquiry.customerName}</p>
                        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Verified Client</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400">Contact Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                        <div className="p-2 rounded-xl bg-slate-50 text-[#668c65] border border-slate-100">
                          <Mail className="w-4 h-4" />
                        </div>
                        {selectedInquiry.customerEmail}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                        <div className="p-2 rounded-xl bg-slate-50 text-[#668c65] border border-slate-100">
                          <Phone className="w-4 h-4" />
                        </div>
                        {selectedInquiry.customerPhone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400">Event Overview</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-[1.5rem] bg-slate-50/50 border border-slate-50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-[#668c65]/10 text-[#668c65]">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wedding Date</p>
                      </div>
                      <p className="font-serif italic text-xl text-slate-800">
                        {new Date(selectedInquiry.weddingDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="p-6 rounded-[1.5rem] bg-slate-50/50 border border-slate-50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-[#668c65]/10 text-[#668c65]">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proposed Budget</p>
                      </div>
                      <p className="font-serif italic text-xl text-slate-800">{selectedInquiry.budget || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400">Requirement Narrative</h3>
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#668c65]/20 rounded-full" />
                    <p className="text-sm font-light leading-relaxed text-slate-600 pl-6 italic">
                      "{selectedInquiry.message}"
                    </p>
                  </div>
                </div>

                {/* Messages Thread Overlay */}
                <div className="pt-8 border-t border-slate-50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400">Timeline & Correspondence</h3>
                    <Badge variant="outline" className="text-[8px] font-black tracking-widest uppercase border-[#668c65]/20 text-[#668c65]">Live Exchange</Badge>
                  </div>

                  <div className="space-y-6 max-h-[400px] overflow-y-auto mb-8 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="flex justify-start">
                      <div className="max-w-[85%] space-y-2">
                        <div className="bg-slate-50 p-6 rounded-[1.5rem] rounded-tl-none border border-slate-100">
                          <p className="text-sm text-slate-700 leading-relaxed font-light">{selectedInquiry.message}</p>
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter ml-1">
                          {new Date(selectedInquiry.receivedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {selectedInquiry.status !== "new" && (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] space-y-2">
                          <div className="bg-[#668c65] text-white p-6 rounded-[1.5rem] rounded-tr-none shadow-lg shadow-[#668c65]/10">
                            <p className="text-sm leading-relaxed font-light">Thank you for your inquiry! We're excited to work with you on your special day. Our team is currently reviewing your requirements.</p>
                          </div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter text-right mr-1">
                            {new Date(new Date(selectedInquiry.receivedAt).getTime() + 2 * 60 * 60 * 1000).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reply Input */}
                  <div className="space-y-4 p-2 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <textarea
                      placeholder="Draft your professional response..."
                      className="w-full min-h-[100px] p-6 bg-transparent border-none focus:ring-0 text-sm font-light text-slate-600 placeholder:text-slate-400 resize-none"
                    />
                    <div className="p-2">
                      <Button
                        className="w-full py-6 rounded-[1.25rem] bg-[#668c65] hover:bg-[#0b7a6f] text-white shadow-lg shadow-[#668c65]/20 transition-all duration-300 group"
                        onClick={() => alert("Message sent!")}
                      >
                        <MessageSquare className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        <span className="font-bold tracking-tight uppercase text-xs">Dispatch Response</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Primary Actions Group */}
                <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-slate-50">
                  <Button
                    className="flex-1 py-8 rounded-3xl bg-slate-900 hover:bg-black text-white shadow-xl transition-all duration-500 scale-100 active:scale-[0.98]"
                    onClick={() => {
                      if (selectedInquiry) {
                        if (onSendQuote) onSendQuote(selectedInquiry.id, selectedInquiry.customerEmail)
                        else window.location.href = "/provider/dashboard?tab=quotes&inquiryId=" + selectedInquiry.id
                      }
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="font-black uppercase tracking-widest text-[10px]">Initiate Quote Builder</span>
                  </Button>

                  {selectedInquiry.status === "new" && (
                    <Button
                      variant="outline"
                      className="flex-1 py-8 rounded-3xl border-slate-200 hover:border-[#668c65] hover:bg-[#668c65]/5 hover:text-[#668c65] text-slate-600 transition-all duration-300"
                      onClick={() => alert("Marking as responded...")}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="font-black uppercase tracking-widest text-[10px]">Mark Responded</span>
                    </Button>
                  )}

                  {selectedInquiry.status === "new" && (
                    <button
                      className="px-6 text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors"
                      onClick={() => alert("Marking as declined...")}
                    >
                      Archive Lead
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center p-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-white">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-8 w-8 text-slate-200" />
                </div>
                <h3 className="text-2xl font-serif italic text-slate-900">Select an Engagement</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] max-w-[250px] mx-auto">
                  Choose a lead from the narrative timeline to view deep details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


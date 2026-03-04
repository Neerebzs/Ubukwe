"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, Calendar, DollarSign, CheckCircle, XCircle, Clock, ArrowLeft, MessageSquare, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomerQuoteDetail } from "./quote-detail"
import { useRouter, useSearchParams } from "next/navigation"

interface Quote {
  id: string
  provider: string
  providerId?: string
  service: string
  status: "pending" | "accepted" | "declined" | "expired" | "requested_changes"
  total: number
  currency?: string
  createdAt: string
  validUntil: string
  inquiryId?: string
  lineItems?: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal?: number
  discount?: number
  tax?: number
  taxRate?: number
  notes?: string
  terms?: string
}

export function CustomerQuotes() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quoteId = searchParams.get('quoteId')
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const quotes: Quote[] = [
    {
      id: "Q-001",
      provider: "Jean-Claude Events",
      providerId: "provider-1",
      service: "MC Services",
      status: "pending",
      total: 165200,
      currency: "RWF",
      createdAt: "2024-03-10",
      validUntil: "2024-04-01",
      inquiryId: "inq-1",
      lineItems: [
        { description: "Ceremony MC (4 hours)", quantity: 1, unitPrice: 80000, total: 80000 },
        { description: "Reception MC (3 hours)", quantity: 1, unitPrice: 60000, total: 60000 },
      ],
      subtotal: 140000,
      discount: 0,
      tax: 25200,
      taxRate: 18,
      notes: "Includes bilingual MC services for both ceremony and reception.",
      terms: "50% deposit required to secure booking. Balance due 7 days before event."
    },
    {
      id: "Q-002",
      provider: "Intore Cultural Group",
      providerId: "provider-2",
      service: "Traditional Dancers",
      status: "pending",
      total: 220000,
      currency: "RWF",
      createdAt: "2024-03-12",
      validUntil: "2024-04-12",
      inquiryId: "inq-2",
      lineItems: [
        { description: "8 Dancers Performance", quantity: 1, unitPrice: 150000, total: 150000 },
        { description: "Traditional Costumes", quantity: 8, unitPrice: 5000, total: 40000 },
        { description: "Cultural Music Setup", quantity: 1, unitPrice: 30000, total: 30000 },
      ],
      subtotal: 220000,
      discount: 0,
      tax: 39600,
      taxRate: 18,
      notes: "Performance includes traditional Intore dance with live drumming.",
      terms: "Full payment required 2 weeks before event date."
    },
    {
      id: "Q-003",
      provider: "Kigali Serena Hotel",
      providerId: "provider-3",
      service: "Venue Rental",
      status: "accepted",
      total: 2500000,
      currency: "RWF",
      createdAt: "2024-02-15",
      validUntil: "2024-03-15",
      inquiryId: "inq-3",
    }
  ]

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === "pending").length,
    accepted: quotes.filter(q => q.status === "accepted").length,
    declined: quotes.filter(q => q.status === "declined").length,
    expired: quotes.filter(q => q.status === "expired").length,
  }

  const getStatusBadge = (status: Quote["status"]) => {
    const configs = {
      pending: { bg: "bg-amber-50 text-amber-700 border-amber-100", label: "Awaiting Review", icon: Clock },
      accepted: { bg: "bg-sage-50 text-sage-700 border-sage-100", label: "Strategic Fit", icon: CheckCircle },
      declined: { bg: "bg-rose-50 text-rose-700 border-rose-100", label: "Declined", icon: XCircle },
      expired: { bg: "bg-slate-50 text-slate-400 border-slate-100", label: "Lapsed", icon: Calendar },
      requested_changes: { bg: "bg-sky-50 text-sky-700 border-sky-100", label: "Negotiating", icon: MessageSquare },
    }
    const config = configs[status]
    const Icon = config.icon
    return (
      <Badge className={`${config.bg} border px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm`}>
        <Icon className="w-3 h-3 mr-1.5" />
        {config.label}
      </Badge>
    )
  }

  const handleViewQuote = (quoteId: string) => {
    router.push(`/customer/dashboard?tab=quotes&quoteId=${quoteId}`, { scroll: false })
  }

  // If quoteId is in URL, show detail view
  if (quoteId) {
    const quote = quotes.find(q => q.id === quoteId)
    if (quote) {
      return (
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => router.push('/customer/dashboard?tab=quotes', { scroll: false })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quotes
          </Button>
          <CustomerQuoteDetail quote={quote} />
        </div>
      )
    }
  }

  return (
    <div className="space-y-12">
      {/* Header - Orbital Style */}
      <div className="px-2">
        <h2 className="text-4xl font-serif italic text-slate-800">Financial Insights</h2>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sage-600 mt-3">Portfolio of Curated Service Quotations</p>
      </div>

      {/* Modernized Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-1">
        {[
          { label: "Total Artifacts", value: stats.total, color: "slate" },
          { label: "Awaiting Action", value: stats.pending, color: "amber" },
          { label: "Strategic Fits", value: stats.accepted, color: "teal" },
          { label: "Historical", value: stats.expired + stats.declined, color: "slate" }
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-[0_15px_40px_rgba(0,0,0,0.02)] rounded-[2.5rem] bg-white group hover:shadow-[0_25px_60px_rgba(0,0,0,0.05)] transition-all duration-500 overflow-hidden border border-transparent hover:border-slate-50">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-2 h-2 rounded-full ${stat.color === 'teal' ? 'bg-sage-500' : stat.color === 'amber' ? 'bg-amber-500' : 'bg-slate-200'}`} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</span>
              </div>
              <div className="text-4xl font-serif italic text-slate-800 tracking-tighter group-hover:text-sage-700 transition-colors">
                {stat.value.toString().padStart(2, '0')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Premium Filters Area */}
      <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[3rem] overflow-hidden bg-white">
        <CardContent className="p-10">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            <div className="flex-1 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Archive Search</span>
              <div className="relative group">
                <Search className="absolute left-5 top-4 h-4 w-4 text-slate-300 group-focus-within:text-sage-500 transition-colors" />
                <Input
                  placeholder="Provider signature or service type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-14 h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-sage-500/20 text-sm font-medium placeholder:text-slate-300 shadow-inner"
                />
              </div>
            </div>

            <div className="w-full md:w-64 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Status Phase</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-sage-500/20 text-sm font-bold text-slate-700">
                  <SelectValue placeholder="All Cycles" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="all" className="rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest">All Cycles</SelectItem>
                  <SelectItem value="pending" className="rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest">Awaiting Review</SelectItem>
                  <SelectItem value="accepted" className="rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest">Strategic Fit</SelectItem>
                  <SelectItem value="declined" className="rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest">Declined</SelectItem>
                  <SelectItem value="expired" className="rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest">Lapsed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Showcase */}
      <div className="space-y-8">
        {filteredQuotes.length === 0 ? (
          <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[3rem] bg-white py-24">
            <CardContent className="text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <DollarSign className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-2xl font-serif italic text-slate-800 mb-3">No Artifacts Discovered</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                Quotations from your curated list of service providers will manifest within this strategic registry.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {filteredQuotes.map((quote) => {
              const isExpired = new Date(quote.validUntil) < new Date() && quote.status === "pending"
              const isAccepted = quote.status === "accepted"

              return (
                <Card
                  key={quote.id}
                  className={`border-none shadow-[0_15px_45px_rgba(0,0,0,0.02)] rounded-[3rem] bg-white hover:shadow-[0_25px_70px_rgba(0,0,0,0.07)] transition-all duration-700 group overflow-hidden border-2 ${isAccepted ? 'border-sage-500/10' : 'border-transparent hover:border-slate-50'}`}
                >
                  <CardContent className="p-10">
                    <div className="flex flex-col lg:flex-row justify-between gap-10">
                      <div className="space-y-6 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-sage-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-sage-900/10">
                              {quote.service.includes('MC') ? '🎙️' : quote.service.includes('Dance') ? '💃' : '🏢'}
                            </div>
                            <div>
                              <h3 className="text-2xl font-serif italic text-slate-800 group-hover:text-sage-700 transition-colors leading-tight">
                                {quote.service}
                              </h3>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-[11px] font-bold text-slate-400 capitalize">{quote.provider}</span>
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-sage-600/60">ID: {quote.id}</span>
                              </div>
                            </div>
                          </div>
                          <div className="lg:hidden">
                            {getStatusBadge(quote.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <DollarSign className="w-5 h-5 text-sage-600" />
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Total Investment</p>
                                <p className="text-xl font-serif italic text-slate-800">
                                  {quote.total.toLocaleString()} <span className="text-[10px] font-bold tracking-widest uppercase not-italic ml-1 text-slate-400">{quote.currency || "RWF"}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Clock className="w-5 h-5 text-slate-300" />
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Phase Window</p>
                                <p className="text-xs font-bold text-slate-500">
                                  Valid until {new Date(quote.validUntil).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {quote.inquiryId && (
                              <div className="flex items-center gap-4">
                                <FileText className="w-5 h-5 text-slate-300" />
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Origin Context</p>
                                  <p className="text-xs font-bold text-slate-500">Linked to Inquiry #{quote.inquiryId.toUpperCase()}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-end gap-6 min-w-[200px]">
                        <div className="hidden lg:block">
                          {getStatusBadge(quote.status)}
                        </div>
                        <div className="flex flex-col gap-3 w-full">
                          <Button
                            onClick={() => handleViewQuote(quote.id)}
                            className="h-14 px-8 rounded-2xl bg-[#668c65] hover:bg-sage-700 text-white text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-sage-200 transition-all active:scale-95"
                          >
                            Examine Artifact
                          </Button>
                          <Button
                            variant="outline"
                            className="h-12 px-8 rounded-2xl border-slate-100 hover:border-sage-100 hover:bg-sage-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-all"
                          >
                            Message Provider
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}

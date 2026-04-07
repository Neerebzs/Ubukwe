"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Calendar, DollarSign, CheckCircle, XCircle, Clock, ArrowLeft, MessageSquare, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomerQuoteDetail } from "./quote-detail"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

interface Quote {
  id: string
  provider_id: string
  provider?: string // Added
  service?: string // Added
  customer_id: string
  inquiry_id?: string
  line_items?: any[]
  subtotal: number
  discount: number
  tax: number
  total: number
  status: "draft" | "sent" | "accepted" | "rejected" | "expired"
  notes?: string
  created_at: string
  sent_at?: string
  expires_at?: string
}

export function CustomerQuotes() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quoteId = searchParams.get("quoteId")
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: quotes = [], isLoading } = useQuery<Quote[]>({
    queryKey: ["customer-quotes"],
    queryFn: async () => {
      const res = await axiosInstance.get<Quote[]>("/api/v1/provider/quotes/customer/my-quotes")
      return res.data ?? []
    },
  })

  const respondMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      return axiosInstance.post(`/api/v1/provider/quotes/customer/${id}/respond?action=${action}`)
    },
    onSuccess: (_, { action }) => {
      toast.success(action === "accept" ? "Quote accepted!" : "Quote declined.")
      queryClient.invalidateQueries({ queryKey: ["customer-quotes"] })
    },
    onError: () => toast.error("Failed to respond to quote"),
  })

  const filtered = quotes.filter((q) => {
    const matchSearch = q.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === "all" || q.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === "sent").length,
    accepted: quotes.filter(q => q.status === "accepted").length,
    expired: quotes.filter(q => q.status === "expired" || q.status === "rejected").length,
  }

  const getStatusBadge = (status: Quote["status"]) => {
    const configs = {
      draft: { bg: "bg-slate-50 text-slate-500 border-slate-100", label: "Draft", icon: Clock },
      sent: { bg: "bg-amber-50 text-amber-700 border-amber-100", label: "Awaiting Review", icon: Clock },
      accepted: { bg: "bg-sage-50 text-sage-700 border-sage-100", label: "Accepted", icon: CheckCircle },
      rejected: { bg: "bg-rose-50 text-rose-700 border-rose-100", label: "Declined", icon: XCircle },
      expired: { bg: "bg-slate-50 text-slate-400 border-slate-100", label: "Expired", icon: Calendar },
    }
    const config = configs[status] ?? configs.draft
    const Icon = config.icon
    return (
      <Badge className={`${config.bg} border px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm`}>
        <Icon className="w-3 h-3 mr-1.5" />
        {config.label}
      </Badge>
    )
  }

  if (quoteId) {
    const quote = quotes.find(q => q.id === quoteId)
    if (quote) {
      return (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => router.push("/customer/dashboard?tab=quotes", { scroll: false })}>
            <ArrowLeft className="w-4 h-4 mr-2" />Back to Quotes
          </Button>
          <CustomerQuoteDetail 
            quote={{
              ...quote,
              provider: quote.provider || "Service Provider",
              service: quote.service || "Booking Service",
              createdAt: quote.created_at,
              validUntil: quote.expires_at || quote.sent_at || quote.created_at,
              status: (quote.status === "sent" ? "pending" : 
                       quote.status === "rejected" ? "declined" : 
                       quote.status) as any,
              lineItems: quote.line_items?.map(li => ({
                description: li.description || "",
                quantity: li.quantity || 1,
                unitPrice: li.unit_price || 0,
                total: li.total || 0,
              }))
            }} 
          />
        </div>
      )
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-[2.5rem]" />)}
        </div>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-[3rem]" />)}
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <div className="px-2">
        <h2 className="text-4xl font-serif italic text-slate-800">Quotes</h2>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sage-600 mt-3">Service Quotations from Providers</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-1">
        {[
          { label: "Total", value: stats.total },
          { label: "Pending", value: stats.pending },
          { label: "Accepted", value: stats.accepted },
          { label: "Expired", value: stats.expired },
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-sm rounded-[2.5rem] bg-white">
            <CardContent className="p-8">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">{s.label}</p>
              <div className="text-4xl font-serif italic text-slate-800">{String(s.value).padStart(2, "0")}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm rounded-[3rem] bg-white">
        <CardContent className="p-10">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-4 h-4 w-4 text-slate-300" />
              <Input
                placeholder="Search by quote ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 h-14 rounded-2xl bg-slate-50 border-none text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-14 w-full md:w-56 rounded-2xl bg-slate-50 border-none text-sm font-bold">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sent">Pending Review</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Declined</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {filtered.length === 0 && (
          <Card className="border-none shadow-sm rounded-[3rem] bg-white py-24">
            <CardContent className="text-center">
              <DollarSign className="h-10 w-10 text-slate-200 mx-auto mb-6" />
              <h3 className="text-2xl font-serif italic text-slate-800 mb-3">No Quotes Yet</h3>
              <p className="text-slate-400 text-sm">Quotes from providers will appear here.</p>
            </CardContent>
          </Card>
        )}

        {filtered.map((quote) => (
          <Card key={quote.id} className="border-none shadow-sm rounded-[3rem] bg-white hover:shadow-lg transition-all duration-500 group">
            <CardContent className="p-10">
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-serif italic text-slate-800">Service Quote</h3>
                      <p className="text-[9px] font-black uppercase tracking-widest text-sage-600/60 mt-1">
                        ID: {quote.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <div className="lg:hidden">{getStatusBadge(quote.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-sage-600" />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Total</p>
                        <p className="text-xl font-serif italic text-slate-800">
                          {Number(quote.total).toLocaleString()} RWF
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-slate-300" />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Received</p>
                        <p className="text-xs font-bold text-slate-500">
                          {new Date(quote.sent_at ?? quote.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end gap-4 min-w-[200px]">
                  <div className="hidden lg:block">{getStatusBadge(quote.status)}</div>
                  <div className="flex flex-col gap-3 w-full">
                    <Button
                      onClick={() => router.push(`/customer/dashboard?tab=quotes&quoteId=${quote.id}`, { scroll: false })}
                      className="h-12 rounded-2xl text-white text-[10px] font-bold uppercase tracking-widest"
                    >
                      View Details
                    </Button>
                    {quote.status === "sent" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 h-10 rounded-2xl text-[10px] font-bold uppercase text-green-700 border-green-200 hover:bg-green-50"
                          onClick={() => respondMutation.mutate({ id: quote.id, action: "accept" })}
                          disabled={respondMutation.isPending}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />Accept
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 h-10 rounded-2xl text-[10px] font-bold uppercase text-rose-700 border-rose-200 hover:bg-rose-50"
                          onClick={() => respondMutation.mutate({ id: quote.id, action: "reject" })}
                          disabled={respondMutation.isPending}
                        >
                          <XCircle className="w-3 h-3 mr-1" />Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

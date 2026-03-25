"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Clock, CheckCircle, XCircle, Mail, Phone, Calendar, DollarSign, Search, Filter, TrendingUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { StatCard } from "@/components/admin/stat-card"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Inquiry {
  id: string
  customer_id: string
  provider_id: string
  service_id?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  service_name?: string
  wedding_date?: string
  location?: string
  budget?: string
  message: string
  status: "new" | "responded" | "quoted" | "booked" | "declined"
  created_at: string
  provider_notes?: string
}

interface InquiryManagementProps {
  onSendQuote?: (inquiryId: string, customerId: string) => void
}

export function InquiryManagement({ onSendQuote }: InquiryManagementProps) {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [reply, setReply] = useState("")

  const { data: inquiries = [], isLoading } = useQuery<Inquiry[]>({
    queryKey: ["provider-inquiries"],
    queryFn: async () => {
      const res = await axiosInstance.get<Inquiry[]>("/api/v1/provider/inquiries/")
      return res.data ?? []
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      return axiosInstance.put(`/api/v1/provider/inquiries/${id}`, { status, provider_notes: notes })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-inquiries"] })
      toast.success("Inquiry updated")
    },
    onError: () => toast.error("Failed to update inquiry"),
  })

  const filtered = inquiries.filter((inq) => {
    const text = `${inq.customer_name ?? ""} ${inq.service_name ?? ""} ${inq.message}`.toLowerCase()
    return text.includes(searchTerm.toLowerCase()) && (statusFilter === "all" || inq.status === statusFilter)
  })

  const getStatusBadge = (status: Inquiry["status"]) => {
    const map: Record<string, string> = {
      new: "bg-emerald-50 text-emerald-600",
      responded: "bg-slate-50 text-slate-600",
      quoted: "bg-indigo-50 text-indigo-600",
      booked: "bg-[#668c65]/10 text-[#668c65]",
      declined: "bg-rose-50 text-rose-600",
    }
    return (
      <Badge variant="outline" className={cn("px-3 py-1 rounded-full text-[10px] font-bold tracking-tight border-none", map[status] ?? map.new)}>
        {status}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-[2rem]" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-serif italic text-slate-900">Inquiries</h2>
        <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em] mt-1">Customer Engagement Portal</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input placeholder="Search inquiries..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 rounded-2xl border-slate-100" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] rounded-2xl border-slate-100">
            <Filter className="w-4 h-4 mr-2 text-[#668c65]" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {["all", "new", "responded", "quoted", "booked", "declined"].map(s => (
              <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="New" value={inquiries.filter(i => i.status === "new").length} icon={Clock} color="#668c65" />
        <StatCard label="Responded" value={inquiries.filter(i => i.status === "responded").length} icon={MessageSquare} color="#668c65" />
        <StatCard label="Quoted" value={inquiries.filter(i => i.status === "quoted").length} icon={CheckCircle} color="#668c65" />
        <StatCard label="Total" value={inquiries.length} icon={TrendingUp} color="#668c65" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3 max-h-[700px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <EmptyState title="No inquiries" description="Inquiries from customers will appear here." icon={<MessageSquare className="h-12 w-12 mx-auto text-slate-300" />} />
          ) : (
            filtered.map((inq) => (
              <Card
                key={inq.id}
                onClick={() => setSelectedInquiry(inq)}
                className={cn("cursor-pointer transition-all rounded-[2rem] border-slate-100 hover:shadow-lg", selectedInquiry?.id === inq.id ? "ring-2 ring-[#668c65] bg-[#668c65]/5" : "bg-white")}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-slate-900">{inq.customer_name ?? "Customer"}</p>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400">
                        {new Date(inq.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(inq.status)}
                  </div>
                  <p className="text-sm font-serif italic text-slate-700 mb-1">{inq.service_name ?? "Service inquiry"}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{inq.message}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedInquiry ? (
            <Card className="border-slate-100 shadow-none rounded-[2.5rem] bg-white">
              <CardHeader className="p-8 pb-4 border-b border-slate-50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-serif italic text-slate-900">
                      {selectedInquiry.service_name ?? "Service Inquiry"}
                    </CardTitle>
                    <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.2em] mt-1">
                      From {selectedInquiry.customer_name ?? "Customer"}
                    </p>
                  </div>
                  {getStatusBadge(selectedInquiry.status)}
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  {selectedInquiry.customer_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-[#668c65]" />
                      <span>{selectedInquiry.customer_email}</span>
                    </div>
                  )}
                  {selectedInquiry.customer_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-[#668c65]" />
                      <span>{selectedInquiry.customer_phone}</span>
                    </div>
                  )}
                  {selectedInquiry.wedding_date && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[#668c65]" />
                      <span>{new Date(selectedInquiry.wedding_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedInquiry.budget && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-[#668c65]" />
                      <span>{selectedInquiry.budget}</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                  <p className="text-sm text-slate-600 italic">"{selectedInquiry.message}"</p>
                </div>

                <div className="space-y-3">
                  <Textarea
                    placeholder="Write your response..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="rounded-2xl bg-slate-50 border-none min-h-[100px]"
                  />
                  <Button
                    className="w-full rounded-2xl bg-[#668c65] hover:bg-[#0b7a6f] text-white"
                    onClick={() => {
                      updateMutation.mutate({ id: selectedInquiry.id, status: "responded", notes: reply })
                      setReply("")
                    }}
                    disabled={!reply.trim() || updateMutation.isPending}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />Send Response
                  </Button>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-50">
                  <Button
                    className="flex-1 rounded-2xl bg-slate-900 text-white"
                    onClick={() => onSendQuote ? onSendQuote(selectedInquiry.id, selectedInquiry.customer_id) : undefined}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />Send Quote
                  </Button>
                  {selectedInquiry.status === "new" && (
                    <Button
                      variant="outline"
                      className="rounded-2xl text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => updateMutation.mutate({ id: selectedInquiry.id, status: "declined" })}
                    >
                      <XCircle className="w-4 h-4 mr-2" />Decline
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center p-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-white">
              <div className="text-center">
                <MessageSquare className="h-8 w-8 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-serif italic text-slate-900">Select an Inquiry</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Choose from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

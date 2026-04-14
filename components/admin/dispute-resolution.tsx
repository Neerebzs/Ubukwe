"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertCircle, Clock, CheckCircle, XCircle, Search,
  Filter, MessageSquare, Send, Loader2, Eye, ShieldCheck
} from "lucide-react"
import { StatCard } from "./stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface Dispute {
  id: string
  title?: string
  description?: string
  category?: string
  status: "open" | "investigating" | "resolved" | "rejected"
  priority: "low" | "medium" | "high" | "urgent"
  created_at: string
  resolved_at?: string
  resolution_notes?: string
  resolution_type?: string
  booking_id?: string
  complainant_id?: string
  respondent_id?: string
  customer_name?: string
  provider_name?: string
  booking_amount?: number
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    urgent: "bg-red-100 text-red-700 border-red-200",
    high:   "bg-orange-50 text-orange-700 border-orange-100",
    medium: "bg-amber-50 text-amber-700 border-amber-100",
    low:    "bg-slate-50 text-slate-600 border-slate-100",
  }
  return (
    <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest ${map[priority] ?? map.medium}`}>
      {priority}
    </Badge>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    open:          { cls: "bg-slate-50 text-slate-600 border-slate-100",       label: "Open" },
    investigating: { cls: "bg-blue-50 text-blue-700 border-blue-100",          label: "Investigating" },
    resolved:      { cls: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "Resolved" },
    rejected:      { cls: "bg-rose-50 text-rose-700 border-rose-100",          label: "Rejected" },
  }
  const c = map[status] ?? map.open
  return (
    <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest ${c.cls}`}>
      {c.label}
    </Badge>
  )
}

function DisputeDetailModal({
  dispute,
  onClose,
}: {
  dispute: Dispute
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [action, setAction] = useState<"investigate" | "resolve" | "reject" | null>(null)
  const [notes, setNotes] = useState("")
  const [resolutionType, setResolutionType] = useState("no_action")
  const [adminMsg, setAdminMsg] = useState("")

  // Fetch messages
  const { data: details } = useQuery({
    queryKey: ["admin-dispute-details", dispute.id],
    queryFn: async () => {
      const res = await apiClient.disputes.adminGetDetails(dispute.id)
      return res.data as any
    },
  })

  const messages = details?.messages ?? []

  const investigateMutation = useMutation({
    mutationFn: () => apiClient.disputes.adminInvestigate(dispute.id, notes),
    onSuccess: () => {
      toast.success("Investigation started")
      queryClient.invalidateQueries({ queryKey: ["admin-disputes"] })
      queryClient.invalidateQueries({ queryKey: ["admin-dispute-details", dispute.id] })
      setAction(null)
      setNotes("")
    },
    onError: (err: any) => toast.error(err.message || "Failed"),
  })

  const resolveMutation = useMutation({
    mutationFn: () => apiClient.disputes.adminResolve(dispute.id, resolutionType, notes),
    onSuccess: () => {
      toast.success("Dispute resolved")
      queryClient.invalidateQueries({ queryKey: ["admin-disputes"] })
      onClose()
    },
    onError: (err: any) => toast.error(err.message || "Failed"),
  })

  const rejectMutation = useMutation({
    mutationFn: () => apiClient.disputes.adminReject(dispute.id, notes),
    onSuccess: () => {
      toast.success("Dispute rejected")
      queryClient.invalidateQueries({ queryKey: ["admin-disputes"] })
      onClose()
    },
    onError: (err: any) => toast.error(err.message || "Failed"),
  })

  const sendMsgMutation = useMutation({
    mutationFn: () => apiClient.disputes.adminSendMessage(dispute.id, adminMsg.trim()),
    onSuccess: () => {
      setAdminMsg("")
      queryClient.invalidateQueries({ queryKey: ["admin-dispute-details", dispute.id] })
    },
    onError: (err: any) => toast.error(err.message || "Failed to send"),
  })

  const isPending = investigateMutation.isPending || resolveMutation.isPending || rejectMutation.isPending

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none">
        <DialogHeader className="p-8 pb-4 border-b border-slate-50">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-black tracking-widest">
              #{dispute.id.slice(0, 8).toUpperCase()}
            </span>
            <PriorityBadge priority={dispute.priority} />
            <StatusBadge status={dispute.status} />
          </div>
          <DialogTitle className="text-2xl font-serif italic text-slate-900">
            {dispute.title || dispute.description?.slice(0, 60) || "Dispute Case"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-8 space-y-8">
          {/* Parties */}
          <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Complainant</p>
              <p className="font-bold text-slate-900">{dispute.customer_name || dispute.complainant_id?.slice(0, 8) || "—"}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Respondent</p>
              <p className="font-bold text-slate-900">{dispute.provider_name || dispute.respondent_id?.slice(0, 8) || "—"}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Category</p>
              <p className="font-medium text-slate-700 capitalize">{dispute.category?.replace(/_/g, " ") || "—"}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Filed</p>
              <p className="font-medium text-slate-700">{new Date(dispute.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</p>
            <div className="bg-white border border-slate-100 rounded-2xl p-5">
              <p className="text-slate-700 italic">"{dispute.description}"</p>
            </div>
          </div>

          {/* Messages thread */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Communication Thread</p>
            <div className="max-h-56 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-2xl mb-3">
              {messages.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-4">No messages yet.</p>
              ) : (
                messages.map((m: any) => (
                  <div key={m.id} className={cn("flex gap-3", m.is_admin_message ? "flex-row-reverse" : "")}>
                    <div className={cn(
                      "max-w-[80%] px-4 py-3 rounded-2xl text-sm",
                      m.is_admin_message
                        ? "bg-[#668c65] text-white rounded-tr-sm"
                        : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm"
                    )}>
                      {m.is_admin_message && (
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">Admin</p>
                      )}
                      <p>{m.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={adminMsg}
                onChange={(e) => setAdminMsg(e.target.value)}
                placeholder="Send a message to the parties..."
                className="rounded-full bg-white border-slate-200 h-11"
                onKeyDown={(e) => e.key === "Enter" && adminMsg.trim() && sendMsgMutation.mutate()}
              />
              <Button
                size="icon"
                className="rounded-full bg-[#668c65] hover:bg-slate-900 h-11 w-11 flex-shrink-0"
                disabled={!adminMsg.trim() || sendMsgMutation.isPending}
                onClick={() => sendMsgMutation.mutate()}
              >
                {sendMsgMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Admin Actions */}
          {dispute.status !== "resolved" && dispute.status !== "rejected" && (
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Admin Actions</p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                {dispute.status === "open" && (
                  <Button
                    variant="outline"
                    className="rounded-full border-blue-200 text-blue-700 hover:bg-blue-50 text-[10px] font-black uppercase tracking-widest"
                    onClick={() => setAction(action === "investigate" ? null : "investigate")}
                  >
                    <Search className="w-3.5 h-3.5 mr-2" />
                    Start Investigation
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-[10px] font-black uppercase tracking-widest"
                  onClick={() => setAction(action === "resolve" ? null : "resolve")}
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-2" />
                  Resolve
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50 text-[10px] font-black uppercase tracking-widest"
                  onClick={() => setAction(action === "reject" ? null : "reject")}
                >
                  <XCircle className="w-3.5 h-3.5 mr-2" />
                  Reject
                </Button>
              </div>

              {/* Action form */}
              <AnimatePresence>
                {action && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      {action === "resolve" && (
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Resolution Type
                          </Label>
                          <Select value={resolutionType} onValueChange={setResolutionType}>
                            <SelectTrigger className="h-11 rounded-xl bg-white border-slate-100">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="full_refund">Full Refund</SelectItem>
                              <SelectItem value="partial_refund">Partial Refund</SelectItem>
                              <SelectItem value="credit">Platform Credit</SelectItem>
                              <SelectItem value="no_action">No Action Required</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {action === "investigate" ? "Investigation Notes" : action === "resolve" ? "Resolution Notes" : "Rejection Reason"}
                        </Label>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder={
                            action === "investigate"
                              ? "Describe what will be investigated..."
                              : action === "resolve"
                              ? "Explain the resolution decision..."
                              : "Explain why this dispute is being rejected..."
                          }
                          className="rounded-xl bg-white border-slate-100 resize-none min-h-[80px]"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          className={cn(
                            "rounded-full text-[10px] font-black uppercase tracking-widest h-11 px-8",
                            action === "resolve" ? "bg-emerald-600 hover:bg-emerald-700 text-white" :
                            action === "reject"  ? "bg-rose-600 hover:bg-rose-700 text-white" :
                            "bg-blue-600 hover:bg-blue-700 text-white"
                          )}
                          disabled={!notes.trim() || isPending}
                          onClick={() => {
                            if (action === "investigate") investigateMutation.mutate()
                            else if (action === "resolve") resolveMutation.mutate()
                            else if (action === "reject") rejectMutation.mutate()
                          }}
                        >
                          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            action === "investigate" ? "Start Investigation" :
                            action === "resolve" ? "Confirm Resolution" : "Reject Dispute"
                          )}
                        </Button>
                        <Button variant="ghost" className="rounded-full text-[10px] font-black uppercase tracking-widest h-11" onClick={() => { setAction(null); setNotes("") }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Resolution summary if closed */}
          {(dispute.status === "resolved" || dispute.status === "rejected") && dispute.resolution_notes && (
            <div className={cn(
              "p-5 rounded-2xl border-l-4",
              dispute.status === "resolved" ? "bg-emerald-50 border-emerald-400" : "bg-rose-50 border-rose-400"
            )}>
              <p className={cn("text-[10px] font-black uppercase tracking-widest mb-2",
                dispute.status === "resolved" ? "text-emerald-700" : "text-rose-700"
              )}>
                {dispute.status === "resolved" ? "Resolution" : "Rejection Reason"}
              </p>
              <p className="text-sm text-slate-700 italic">"{dispute.resolution_notes}"</p>
              {dispute.resolution_type && (
                <Badge className="mt-2 bg-white border border-slate-200 text-slate-600 text-[9px] uppercase tracking-widest">
                  {dispute.resolution_type.replace(/_/g, " ")}
                </Badge>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AdminDisputeResolution() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)

  const { data: disputesData, isLoading } = useQuery({
    queryKey: ["admin-disputes", statusFilter, priorityFilter],
    queryFn: async () => {
      const res = await apiClient.disputes.adminGetAll({
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
      })
      const data = res.data as any
      return Array.isArray(data?.data) ? data.data : Array.isArray(data?.disputes) ? data.disputes : Array.isArray(data) ? data : []
    },
    refetchInterval: 30_000,
  })

  const { data: statsData } = useQuery({
    queryKey: ["admin-dispute-stats"],
    queryFn: async () => {
      const res = await apiClient.disputes.adminGetStats()
      return res.data as any
    },
  })

  const disputes: Dispute[] = disputesData ?? []

  const filtered = disputes.filter(d => {
    const text = `${d.customer_name ?? ""} ${d.provider_name ?? ""} ${d.title ?? ""} ${d.description ?? ""}`.toLowerCase()
    return text.includes(searchTerm.toLowerCase())
  })

  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === "open").length,
    investigating: disputes.filter(d => d.status === "investigating").length,
    resolved: disputes.filter(d => d.status === "resolved").length,
    urgent: disputes.filter(d => (d.priority === "high" || d.priority === "urgent") && d.status !== "resolved" && d.status !== "rejected").length,
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-[2.5rem]" />)}
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900 tracking-tight">
            Resolution Sanctuary
          </h2>
          <p className="text-slate-500 mt-2 uppercase tracking-[0.2em] text-xs font-medium">
            Platform Harmony & Dispute Governance
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search disputes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 w-[280px] rounded-full border-slate-200 h-12"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Open" value={stats.open} />
        <StatCard label="Investigating" value={stats.investigating} />
        <StatCard label="Resolved" value={stats.resolved} />
        <StatCard label="Critical" value={stats.urgent} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex bg-white rounded-full p-1 border border-slate-100 shadow-sm">
          {["all", "open", "investigating", "resolved", "rejected"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-5 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all",
                statusFilter === s ? "bg-[#608d64] text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[160px] rounded-full border-slate-100 bg-white h-11">
            <Filter className="w-3 h-3 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Disputes list */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No disputes found"
          description="The resolution sanctuary is clear."
          icon={<CheckCircle className="h-16 w-16 mx-auto text-[#608d64]/20" />}
        />
      ) : (
        <div className="grid gap-6">
          {filtered.map(dispute => (
            <Card
              key={dispute.id}
              className="rounded-[2.5rem] border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 bg-white"
            >
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-black tracking-widest">
                        #{dispute.id.slice(0, 8).toUpperCase()}
                      </span>
                      <PriorityBadge priority={dispute.priority} />
                      <StatusBadge status={dispute.status} />
                    </div>
                    <h3 className="text-xl font-serif italic text-slate-900">
                      {dispute.title || dispute.description?.slice(0, 80) || "Service dispute"}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-sm">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">Customer</p>
                        <p className="font-medium text-slate-700">{dispute.customer_name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">Provider</p>
                        <p className="font-medium text-slate-700">{dispute.provider_name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">Category</p>
                        <p className="font-medium text-slate-700 capitalize">{dispute.category?.replace(/_/g, " ") || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">Filed</p>
                        <p className="font-medium text-slate-700">{new Date(dispute.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white text-[10px] font-black uppercase tracking-widest h-11 px-6 flex-shrink-0 transition-all"
                    onClick={() => setSelectedDispute(dispute)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-2" />
                    Review Case
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedDispute && (
        <DisputeDetailModal
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
        />
      )}
    </div>
  )
}

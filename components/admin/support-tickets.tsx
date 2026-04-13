"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Mail, MessageSquare, Clock, CheckCircle, Loader2, Send, User, RefreshCw } from "lucide-react"

interface Ticket {
  id: string
  subject: string
  message: string
  sender_email: string
  sender_name: string | null
  status: "open" | "in_progress" | "resolved" | "closed"
  admin_reply: string | null
  replied_at: string | null
  created_at: string
}

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
}

export function AdminSupportTickets() {
  const queryClient = useQueryClient()
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [reply, setReply] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: tickets = [], isLoading, refetch } = useQuery<Ticket[]>({
    queryKey: ["support-tickets", statusFilter],
    queryFn: async () => {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : ""
      const res = await axiosInstance.get(`/api/v1/admin/support/tickets${params}`)
      return res.data
    },
    refetchInterval: 30_000,
  })

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, reply }: { ticketId: string; reply: string }) => {
      await axiosInstance.post(`/api/v1/admin/support/tickets/${ticketId}/reply`, { reply })
    },
    onSuccess: () => {
      toast.success("Reply sent to user via email")
      setSelectedTicket(null)
      setReply("")
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] })
    },
    onError: () => toast.error("Failed to send reply"),
  })

  const statusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      await axiosInstance.patch(`/api/v1/admin/support/tickets/${ticketId}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] })
    },
  })

  const openCount = tickets.filter(t => t.status === "open").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Support Tickets</h2>
          <p className="text-slate-500 text-sm mt-1">
            {openCount > 0 ? (
              <span className="text-blue-600 font-medium">{openCount} open ticket{openCount > 1 ? "s" : ""} awaiting response</span>
            ) : (
              "All tickets handled"
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-10 rounded-xl border-slate-200">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tickets</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Open", value: tickets.filter(t => t.status === "open").length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "In Progress", value: tickets.filter(t => t.status === "in_progress").length, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Resolved", value: tickets.filter(t => t.status === "resolved").length, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total", value: tickets.length, color: "text-slate-700", bg: "bg-slate-50" },
        ].map(stat => (
          <Card key={stat.label} className="border-slate-100 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ticket List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No support tickets yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => { setSelectedTicket(ticket); setReply("") }}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-[10px] font-bold uppercase tracking-wider border ${statusColors[ticket.status]}`}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-mono">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 truncate">{ticket.subject}</h3>
                    <p className="text-sm text-slate-500 truncate mt-0.5">{ticket.message}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <User className="h-3 w-3" />
                        {ticket.sender_name || ticket.sender_email}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Mail className="h-3 w-3" />
                        {ticket.sender_email}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {ticket.admin_reply && (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(v) => !v && setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedTicket?.subject}
            </DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              {/* Ticket info */}
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{selectedTicket.sender_name || "Anonymous"}</span>
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{selectedTicket.sender_email}</span>
                <Badge className={`text-[10px] border ${statusColors[selectedTicket.status]}`}>
                  {selectedTicket.status.replace("_", " ")}
                </Badge>
              </div>

              {/* Original message */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">User Message</p>
                <p className="text-slate-700 text-sm leading-relaxed">{selectedTicket.message}</p>
              </div>

              {/* Previous reply */}
              {selectedTicket.admin_reply && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Previous Reply</p>
                  <p className="text-slate-700 text-sm leading-relaxed">{selectedTicket.admin_reply}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Sent {selectedTicket.replied_at ? new Date(selectedTicket.replied_at).toLocaleString() : ""}
                  </p>
                </div>
              )}

              {/* Status change */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status:</span>
                <Select
                  value={selectedTicket.status}
                  onValueChange={(val) => statusMutation.mutate({ ticketId: selectedTicket.id, status: val })}
                >
                  <SelectTrigger className="w-40 h-9 rounded-lg text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reply box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Reply to {selectedTicket.sender_email}
                </label>
                <Textarea
                  placeholder="Type your reply... (will be sent to user's email)"
                  className="min-h-[120px] rounded-xl resize-none border-slate-200"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTicket(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={() => selectedTicket && replyMutation.mutate({ ticketId: selectedTicket.id, reply })}
              disabled={!reply.trim() || replyMutation.isPending}
              className="rounded-xl bg-slate-900 hover:bg-slate-800"
            >
              {replyMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" />Send Reply via Email</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

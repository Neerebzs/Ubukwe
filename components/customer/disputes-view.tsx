"use client"

import { useState, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle, Clock, CheckCircle, Search, ShieldCheck,
  Camera, X, MessageSquare, Send, ChevronDown, ChevronUp, Loader2
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface Dispute {
  id: string
  booking_id: string
  title: string
  description: string
  category: string
  status: "open" | "investigating" | "resolved" | "rejected"
  priority: "low" | "medium" | "high" | "urgent"
  created_at: string
  resolved_at?: string
  resolution_notes?: string
  resolution_type?: string
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string; Icon: any }> = {
    open:         { cls: "bg-slate-50 text-slate-600 border-slate-100",   label: "Awaiting Review",      Icon: Clock },
    investigating:{ cls: "bg-amber-50 text-amber-700 border-amber-100",   label: "Under Investigation",  Icon: Search },
    resolved:     { cls: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "Resolved",          Icon: CheckCircle },
    rejected:     { cls: "bg-rose-50 text-rose-700 border-rose-100",      label: "Rejected",             Icon: AlertCircle },
  }
  const c = map[status] ?? map.open
  const Icon = c.Icon
  return (
    <Badge className={`${c.cls} border px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] gap-1.5`}>
      <Icon className="w-3 h-3" />{c.label}
    </Badge>
  )
}

function DisputeMessages({ disputeId }: { disputeId: string }) {
  const [msg, setMsg] = useState("")
  const queryClient = useQueryClient()

  const { data: details } = useQuery({
    queryKey: ["dispute-details", disputeId],
    queryFn: async () => {
      const res = await apiClient.disputes.getDetails(disputeId)
      return res.data as any
    },
  })

  const sendMutation = useMutation({
    mutationFn: () => apiClient.disputes.sendMessage(disputeId, msg.trim()),
    onSuccess: () => {
      setMsg("")
      queryClient.invalidateQueries({ queryKey: ["dispute-details", disputeId] })
    },
    onError: (err: any) => toast.error(err.message || "Failed to send message"),
  })

  const messages = details?.messages ?? []

  return (
    <div className="space-y-4 mt-4">
      <div className="max-h-64 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-2xl">
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
                <p className={cn("text-[9px] mt-1 opacity-60", m.is_admin_message ? "text-right" : "")}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Add a message to your case..."
          className="rounded-full bg-white border-slate-100 h-11"
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && msg.trim() && sendMutation.mutate()}
        />
        <Button
          size="icon"
          className="rounded-full bg-[#668c65] hover:bg-slate-900 h-11 w-11 flex-shrink-0"
          disabled={!msg.trim() || sendMutation.isPending}
          onClick={() => sendMutation.mutate()}
        >
          {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}

function DisputeCard({ dispute }: { dispute: Dispute }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white hover:shadow-lg transition-all">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#668c65]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-[#668c65]" />
            </div>
            <div>
              <h3 className="text-lg font-serif italic text-slate-800">{dispute.title}</h3>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                Case #{dispute.id.slice(0, 8).toUpperCase()} · {new Date(dispute.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <StatusBadge status={dispute.status} />
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl mb-4">
          <p className="text-sm text-slate-600 italic line-clamp-2">"{dispute.description}"</p>
        </div>

        {dispute.status === "investigating" && (
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Investigation Progress</span><span>In Progress</span>
            </div>
            <Progress value={60} className="h-1.5 rounded-full bg-slate-100" />
          </div>
        )}

        {dispute.status === "resolved" && dispute.resolution_notes && (
          <div className="bg-emerald-50 p-4 rounded-2xl border-l-4 border-emerald-400 mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">Resolution</p>
            <p className="text-sm text-slate-700 italic">"{dispute.resolution_notes}"</p>
            {dispute.resolution_type && (
              <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-none text-[9px] uppercase tracking-widest">
                {dispute.resolution_type.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
        )}

        {/* Messages toggle */}
        {(dispute.status === "open" || dispute.status === "investigating") && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#668c65] hover:text-slate-900 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {expanded ? "Hide Messages" : "View / Send Messages"}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <DisputeMessages disputeId={dispute.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

export function CustomerDisputesView() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    booking_id: "",
    respondent_id: "",
    title: "",
    category: "",
    description: "",
  })
  const [proofImage, setProofImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedBookingName, setSelectedBookingName] = useState("")
  const [triedSubmit, setTriedSubmit] = useState(false)

  const { data: disputes = [], isLoading } = useQuery<Dispute[]>({
    queryKey: ["my-disputes"],
    queryFn: async () => {
      const res = await apiClient.disputes.getMyDisputes()
      const data = res.data as any
      return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    },
  })

  const { data: completedBookings = [] } = useQuery({
    queryKey: ["completed-bookings-for-dispute"],
    queryFn: async () => {
      const res = await apiClient.bookings.getAll({ role: "customer" })
      const data = (res as any).data
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      return list.filter((b: any) => b.status === "completed")
    },
  })

  const handleBookingSelect = (bookingId: string) => {
    const booking = (completedBookings as any[]).find((b: any) => b.id === bookingId)
    if (booking) {
      setForm(prev => ({
        ...prev,
        booking_id: bookingId,
        respondent_id: booking.provider_id || "",
      }))
      setSelectedBookingName(booking.service_name || "Service")
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProofImage(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const submitMutation = useMutation({
    mutationFn: () =>
      apiClient.disputes.create({
        booking_id: form.booking_id,
        respondent_id: form.respondent_id,
        title: form.title || form.category,
        description: form.description,
        category: form.category,
        priority: "medium",
        proof_image: proofImage,
      }),
    onSuccess: () => {
      toast.success("Dispute filed successfully. Our team will review it within 1 business day.")
      queryClient.invalidateQueries({ queryKey: ["my-disputes"] })
      setForm({ booking_id: "", respondent_id: "", title: "", category: "", description: "" })
      setProofImage(null)
      setImagePreview(null)
      setTriedSubmit(false)
      setSelectedBookingName("")
    },
    onError: (err: any) => toast.error(err.message || "Failed to file dispute"),
  })

  const activeDisputes = disputes.filter(d => d.status !== "resolved" && d.status !== "rejected")
  const closedDisputes = disputes.filter(d => d.status === "resolved" || d.status === "rejected")

  const isFormValid = form.booking_id && form.category && form.description.trim().length > 10

  return (
    <div className="max-w-5xl mx-auto space-y-10 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-[1px] w-8 bg-[#668c65]/30" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#668c65]">Resolution Centre</span>
        </div>
        <h1 className="font-serif italic text-4xl md:text-5xl text-slate-900">Strategic Resolution.</h1>
        <p className="text-slate-500 text-sm max-w-lg">
          File a dispute for any service issue. Our integrity team reviews all cases within 1 business day.
        </p>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="bg-slate-100/50 p-1.5 h-14 rounded-2xl border border-slate-100">
          <TabsTrigger value="active" className="rounded-xl px-8 h-full data-[state=active]:bg-white data-[state=active]:text-[#668c65] data-[state=active]:shadow-lg text-[10px] font-black uppercase tracking-widest">
            Active Cases ({activeDisputes.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl px-8 h-full data-[state=active]:bg-white data-[state=active]:text-[#668c65] data-[state=active]:shadow-lg text-[10px] font-black uppercase tracking-widest">
            History ({closedDisputes.length})
          </TabsTrigger>
          <TabsTrigger value="new" className="rounded-xl px-8 h-full data-[state=active]:bg-white data-[state=active]:text-[#668c65] data-[state=active]:shadow-lg text-[10px] font-black uppercase tracking-widest">
            + File Dispute
          </TabsTrigger>
        </TabsList>

        {/* Active Cases */}
        <TabsContent value="active" className="space-y-6 mt-6">
          {isLoading ? (
            [1, 2].map(i => <Skeleton key={i} className="h-40 rounded-[2.5rem]" />)
          ) : activeDisputes.length === 0 ? (
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white py-16">
              <CardContent className="text-center">
                <CheckCircle className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-serif italic text-slate-800">No active disputes</h3>
                <p className="text-slate-400 text-sm mt-2">All your cases are resolved.</p>
              </CardContent>
            </Card>
          ) : (
            activeDisputes.map(d => <DisputeCard key={d.id} dispute={d} />)
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-6 mt-6">
          {closedDisputes.length === 0 ? (
            <p className="text-center text-slate-400 py-12 font-serif italic">No resolved disputes yet.</p>
          ) : (
            closedDisputes.map(d => <DisputeCard key={d.id} dispute={d} />)
          )}
        </TabsContent>

        {/* File New Dispute */}
        <TabsContent value="new" className="mt-6">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-2xl font-serif italic text-slate-800">File a Dispute</CardTitle>
              <CardDescription className="text-slate-400 text-xs uppercase tracking-widest mt-1">
                Describe the issue with your service
              </CardDescription>
            </CardHeader>
            <Separator className="mx-8 mt-6 bg-slate-50" />
            <CardContent className="p-8 space-y-6">

              {/* Booking + Provider */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Select Booking <span className="text-rose-400">*</span>
                  </Label>
                  <Select value={form.booking_id} onValueChange={handleBookingSelect}>
                    <SelectTrigger className={cn(
                      "h-12 rounded-2xl bg-slate-50 border-none",
                      triedSubmit && !form.booking_id && "ring-2 ring-rose-200 bg-rose-50"
                    )}>
                      <SelectValue placeholder="Choose a completed booking" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {(completedBookings as any[]).length === 0 ? (
                        <div className="p-4 text-xs text-slate-400 text-center">No completed bookings found</div>
                      ) : (
                        (completedBookings as any[]).map((b: any) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.service_name || "Service"} · {new Date(b.booking_date).toLocaleDateString()}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Provider</Label>
                  <Input
                    value={selectedBookingName || "Auto-filled from booking"}
                    readOnly
                    className="h-12 rounded-2xl bg-slate-100 border-none opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Issue Category <span className="text-rose-400">*</span>
                </Label>
                <Select value={form.category} onValueChange={(v) => setForm(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger className={cn(
                    "h-12 rounded-2xl bg-slate-50 border-none",
                    triedSubmit && !form.category && "ring-2 ring-rose-200 bg-rose-50"
                  )}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="service_not_received">Service Not Received</SelectItem>
                    <SelectItem value="poor_quality">Poor Quality</SelectItem>
                    <SelectItem value="late_arrival">Late Arrival</SelectItem>
                    <SelectItem value="payment">Payment Issue</SelectItem>
                    <SelectItem value="cancellation">Cancellation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Description <span className="text-rose-400">*</span>
                </Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the issue in detail — what happened, when, and what outcome you expect..."
                  className={cn(
                    "rounded-2xl bg-slate-50 border-none p-5 min-h-[120px] resize-none",
                    triedSubmit && form.description.trim().length < 10 && "ring-2 ring-rose-200 bg-rose-50"
                  )}
                />
              </div>

              {/* Evidence — optional */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  Evidence Photo
                  <span className="text-slate-400 text-[8px] bg-slate-100 px-2 py-0.5 rounded-full">Optional</span>
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="aspect-video rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#668c65]/30 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                      <Camera className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Upload Evidence</p>
                  </label>

                  {imagePreview ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-md group">
                      <img src={imagePreview} alt="Evidence" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setProofImage(null); setImagePreview(null) }}
                        className="absolute top-3 right-3 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 text-xs italic">
                      Preview here
                    </div>
                  )}
                </div>
              </div>

              {/* Info box */}
              <div className="p-5 rounded-2xl bg-[#668c65]/5 border border-[#668c65]/10 flex gap-3">
                <ShieldCheck className="w-5 h-5 text-[#668c65] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600">
                  Our integrity team reviews all disputes within 1 business day. You'll receive updates via the messaging thread.
                </p>
              </div>

              <Button
                onClick={() => {
                  setTriedSubmit(true)
                  if (!isFormValid) {
                    toast.error("Please fill in all required fields.")
                    return
                  }
                  submitMutation.mutate()
                }}
                disabled={submitMutation.isPending}
                className="h-14 px-10 rounded-full bg-[#668c65] hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-50"
              >
                {submitMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Filing Case...
                  </div>
                ) : (
                  "Establish Dispute Case"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

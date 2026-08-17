"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { invalidateDisputes } from "@/lib/cache/invalidation"
import { queryKeys } from "@/lib/cache/query-keys"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertCircle, Clock, CheckCircle, Search, ShieldCheck, Camera, X,
  MessageSquare, Send, Loader2, FileText, Upload, Flag
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  CLOSED_STATUSES,
  DISPUTE_CATEGORIES,
  PRIORITY_CLASSES,
  REQUESTED_RESOLUTIONS,
  STATUS_CLASSES,
  STATUS_LABELS,
  TIMELINE_LABELS,
  categoryLabel,
  disputeRef,
  formatMoney,
} from "@/lib/disputes"

type Role = "customer" | "provider"

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={cn("border px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]", STATUS_CLASSES[status] || STATUS_CLASSES.open)}>
      {STATUS_LABELS[status] || status.replace(/_/g, " ")}
    </Badge>
  )
}

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return null
  return (
    <Badge variant="outline" className={cn("rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest", PRIORITY_CLASSES[priority] || PRIORITY_CLASSES.medium)}>
      {priority}
    </Badge>
  )
}

function DisputeThread({ disputeId, canReply }: { disputeId: string; canReply: boolean }) {
  const [msg, setMsg] = useState("")
  const queryClient = useQueryClient()
  const { data: details } = useQuery({
    queryKey: queryKeys.disputes.detail(disputeId),
    queryFn: async () => (await apiClient.disputes.getDetails(disputeId)).data,
  })
  const sendMutation = useMutation({
    mutationFn: () => apiClient.disputes.sendMessage(disputeId, msg.trim()),
    onSuccess: () => {
      setMsg("")
      invalidateDisputes(queryClient, disputeId)
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || err.message || "Failed to send message"),
  })
  const messages = details?.messages ?? []

  return (
    <div className="space-y-4">
      <div className="max-h-72 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-2xl">
        {messages.length === 0 ? (
          <p className="text-center text-slate-400 text-xs py-4">No messages yet. Updates will appear here.</p>
        ) : messages.map((m: any) => (
          <div key={m.id} className={cn("flex gap-3", m.is_admin_message ? "flex-row-reverse" : "")}>
            <div className={cn(
              "max-w-[80%] px-4 py-3 rounded-2xl text-sm",
              m.is_admin_message ? "bg-[#668c65] text-white rounded-tr-sm" : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm"
            )}>
              {m.is_admin_message && <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">Moderator</p>}
              <p className="whitespace-pre-wrap">{m.message}</p>
              <p className="text-[9px] mt-1 opacity-60">{m.created_at ? new Date(m.created_at).toLocaleString() : ""}</p>
            </div>
          </div>
        ))}
      </div>
      {canReply && (
        <div className="flex gap-2">
          <Input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Reply to this case..."
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
      )}
    </div>
  )
}

function DisputeDetail({
  dispute,
  role,
  onClose,
}: {
  dispute: any
  role: Role
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [appealReason, setAppealReason] = useState("")
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)

  const { data: details, isLoading } = useQuery({
    queryKey: queryKeys.disputes.detail(dispute.id),
    queryFn: async () => (await apiClient.disputes.getDetails(dispute.id)).data,
  })

  const evidenceMutation = useMutation({
    mutationFn: () => apiClient.disputes.addEvidence(dispute.id, evidenceFile as File),
    onSuccess: () => {
      toast.success("Evidence uploaded")
      setEvidenceFile(null)
      invalidateDisputes(queryClient, dispute.id)
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || "Failed to upload evidence"),
  })

  const appealMutation = useMutation({
    mutationFn: () => apiClient.disputes.appeal(dispute.id, appealReason.trim()),
    onSuccess: () => {
      toast.success("Appeal submitted")
      setAppealReason("")
      invalidateDisputes(queryClient, dispute.id)
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || "Failed to submit appeal"),
  })

  const caseData = details?.dispute || dispute
  const closed = CLOSED_STATUSES.has(caseData.status)
  const canAppeal = ["resolved", "rejected"].includes(caseData.status)
  const timeline = details?.timeline || []
  const evidence = details?.evidence || []
  const decisions = details?.decisions || []

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto rounded-[2rem] p-0">
        <DialogHeader className="p-8 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <DialogTitle className="font-serif italic text-2xl text-slate-900">{caseData.title}</DialogTitle>
            <StatusBadge status={caseData.status} />
            <PriorityBadge priority={caseData.priority} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {disputeRef(caseData)} · Filed {caseData.created_at ? new Date(caseData.created_at).toLocaleString() : ""}
          </p>
        </DialogHeader>

        {isLoading ? <Skeleton className="h-64 mx-8 mb-8 rounded-3xl" /> : (
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 px-8 pb-8">
            <div className="space-y-6">
              <section className="bg-slate-50 rounded-3xl p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Issue</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{caseData.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className="rounded-full">{categoryLabel(caseData.category)}</Badge>
                  {caseData.requested_resolution && (
                    <Badge variant="outline" className="rounded-full">{caseData.requested_resolution.replace(/_/g, " ")}</Badge>
                  )}
                </div>
              </section>

              {decisions.length > 0 && (
                <section className="bg-emerald-50 rounded-3xl p-5 border-l-4 border-emerald-400">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-2">Decision</p>
                  {decisions.filter((d: any) => d.is_final !== false).slice(-1).map((d: any) => (
                    <div key={d.id}>
                      <p className="text-sm text-slate-700">{d.decision_details || d.decision_summary}</p>
                      <p className="text-[10px] uppercase tracking-widest text-emerald-700 mt-2">{d.decision_type?.replace(/_/g, " ")}</p>
                    </div>
                  ))}
                </section>
              )}

              <section>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Progress timeline</p>
                <div className="space-y-3">
                  {timeline.length === 0 ? (
                    <p className="text-xs text-slate-400">No events recorded yet.</p>
                  ) : timeline.map((event: any) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full bg-[#668c65] flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-800">{TIMELINE_LABELS[event.action] || event.action.replace(/_/g, " ")}</p>
                        <p className="text-[10px] text-slate-400">
                          {event.created_at ? new Date(event.created_at).toLocaleString() : ""}
                          {event.new_value ? ` · ${String(event.new_value).replace(/_/g, " ")}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Conversation</p>
                <DisputeThread disputeId={dispute.id} canReply={!closed} />
              </section>
            </div>

            <div className="space-y-4">
              <Card className="border-none shadow-sm rounded-3xl">
                <CardContent className="p-5 space-y-3 text-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Related booking</p>
                  <p className="font-medium text-slate-800">{details?.booking?.service_name || "Service booking"}</p>
                  <p className="text-slate-500">{details?.booking?.reference}</p>
                  <p className="text-slate-500">{details?.booking?.booking_date ? new Date(details.booking.booking_date).toLocaleDateString() : ""}</p>
                  <p className="text-slate-500">{formatMoney(details?.financial?.agreed_amount || caseData.amount_in_dispute)}</p>
                  {caseData.sla_deadline && (
                    <p className={cn("text-xs", caseData.sla_breached ? "text-rose-600" : "text-slate-500")}>
                      SLA {new Date(caseData.sla_deadline).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-3xl">
                <CardContent className="p-5 space-y-2 text-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parties</p>
                  <p><span className="text-slate-400">Complainant:</span> {details?.parties?.complainant?.full_name || "—"}</p>
                  <p><span className="text-slate-400">Respondent:</span> {details?.parties?.respondent?.full_name || "—"}</p>
                  {details?.parties?.moderator?.full_name && (
                    <p><span className="text-slate-400">Moderator:</span> {details.parties.moderator.full_name}</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-3xl">
                <CardContent className="p-5 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Evidence</p>
                  <div className="space-y-2">
                    {evidence.length === 0 && <p className="text-xs text-slate-400">No evidence uploaded yet.</p>}
                    {evidence.map((item: any) => (
                      <a key={item.id} href={item.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-[#668c65] hover:underline">
                        <FileText className="w-4 h-4" />
                        {item.file_name || "Evidence file"}
                      </a>
                    ))}
                  </div>
                  {!closed && (
                    <div className="space-y-2 pt-2">
                      <Input type="file" accept="image/*,application/pdf" onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)} />
                      <Button
                        size="sm"
                        className="rounded-full bg-[#668c65] hover:bg-slate-900"
                        disabled={!evidenceFile || evidenceMutation.isPending}
                        onClick={() => evidenceMutation.mutate()}
                      >
                        <Upload className="w-3.5 h-3.5 mr-2" />
                        Upload evidence
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {canAppeal && (
                <Card className="border-none shadow-sm rounded-3xl">
                  <CardContent className="p-5 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Request reconsideration</p>
                    <Textarea value={appealReason} onChange={(e) => setAppealReason(e.target.value)} className="rounded-2xl min-h-[90px]" placeholder="Explain why this decision should be reviewed..." />
                    <Button
                      className="rounded-full bg-slate-900 hover:bg-black"
                      disabled={appealReason.trim().length < 10 || appealMutation.isPending}
                      onClick={() => appealMutation.mutate()}
                    >
                      Submit appeal
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function ParticipantDisputesView({ role }: { role: Role }) {
  const searchParams = useSearchParams()
  const preselectedBooking = searchParams.get("bookingId") || ""
  const disputeIdFromUrl = searchParams.get("disputeId") || ""
  const queryClient = useQueryClient()
  const [tab, setTab] = useState(preselectedBooking ? "new" : "active")
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({
    booking_id: preselectedBooking,
    title: "",
    category: "",
    requested_resolution: "",
    description: "",
  })
  const [proofImage, setProofImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [triedSubmit, setTriedSubmit] = useState(false)

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: queryKeys.disputes.myList(),
    queryFn: async () => {
      const res = await apiClient.disputes.getMyDisputes()
      const data = res.data as any
      return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    },
  })

  const { data: bookings = [] } = useQuery({
    queryKey: [...queryKeys.disputes.all(), "eligible-bookings", role],
    queryFn: async () => {
      const res = await apiClient.disputes.getEligibleBookings()
      const data = res.data as any
      return Array.isArray(data) ? data : []
    },
  })

  useEffect(() => {
    if (preselectedBooking) {
      setForm((prev) => ({ ...prev, booking_id: preselectedBooking }))
      setTab("new")
    }
  }, [preselectedBooking])

  useEffect(() => {
    if (!disputeIdFromUrl || selected) return
    const match = (disputes as any[]).find((item) => item.id === disputeIdFromUrl)
    if (match) {
      setSelected(match)
      setTab(CLOSED_STATUSES.has(match.status) ? "closed" : "active")
    }
  }, [disputeIdFromUrl, disputes, selected])

  const selectedBooking = useMemo(
    () => (bookings as any[]).find((b) => b.id === form.booking_id),
    [bookings, form.booking_id]
  )

  const submitMutation = useMutation({
    mutationFn: () => apiClient.disputes.create({
      booking_id: form.booking_id,
      respondent_id: selectedBooking?.respondent_id,
      title: form.title || categoryLabel(form.category),
      description: form.description,
      category: form.category,
      requested_resolution: form.requested_resolution,
      proof_image: proofImage,
    }),
    onSuccess: () => {
      toast.success("Issue submitted. You can track every update on this page.")
      invalidateDisputes(queryClient)
      setForm({ booking_id: "", title: "", category: "", requested_resolution: "", description: "" })
      setProofImage(null)
      setImagePreview(null)
      setTriedSubmit(false)
      setTab("active")
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || err.message || "Failed to submit issue"),
  })

  const activeDisputes = disputes.filter((d: any) => !CLOSED_STATUSES.has(d.status))
  const closedDisputes = disputes.filter((d: any) => CLOSED_STATUSES.has(d.status))
  const isFormValid = form.booking_id && form.category && form.description.trim().length > 10
  const counterpartLabel = role === "customer" ? "Provider" : "Customer"

  const renderCard = (dispute: any) => (
    <Card key={dispute.id} className="border-none shadow-sm rounded-[2.5rem] bg-white hover:shadow-lg transition-all">
      <CardContent className="p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-serif italic text-slate-800">{dispute.title}</h3>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
              {disputeRef(dispute)} · {dispute.created_at ? new Date(dispute.created_at).toLocaleDateString() : ""}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={dispute.status} />
            {dispute.requires_action && (
              <Badge className="bg-amber-100 text-amber-800 border-none text-[9px] uppercase tracking-widest">Action needed</Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-600 italic line-clamp-2 mb-4">"{dispute.description}"</p>
        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-widest text-slate-400 mb-5">
          <span>{categoryLabel(dispute.category)}</span>
          {dispute.service_name && <span>· {dispute.service_name}</span>}
          {dispute.counterparty?.full_name && <span>· {dispute.counterparty.full_name}</span>}
        </div>
        <Button variant="outline" className="rounded-full" onClick={() => setSelected(dispute)}>
          Track progress
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-10 p-4 md:p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-[1px] w-8 bg-[#668c65]/30" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#668c65]">Resolution Centre</span>
        </div>
        <h1 className="font-serif italic text-4xl md:text-5xl text-slate-900">
          {role === "provider" ? "Service disputes." : "Raise and track an issue."}
        </h1>
        <p className="text-slate-500 text-sm max-w-lg">
          Submit a case against an existing booking, follow every update, and respond when the moderator asks for information.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-slate-100/50 p-1.5 h-14 rounded-2xl border border-slate-100">
          <TabsTrigger value="active" className="rounded-xl px-6 h-full data-[state=active]:bg-white data-[state=active]:text-[#668c65] text-[10px] font-black uppercase tracking-widest">
            Active ({activeDisputes.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl px-6 h-full data-[state=active]:bg-white data-[state=active]:text-[#668c65] text-[10px] font-black uppercase tracking-widest">
            History ({closedDisputes.length})
          </TabsTrigger>
          <TabsTrigger value="new" className="rounded-xl px-6 h-full data-[state=active]:bg-white data-[state=active]:text-[#668c65] text-[10px] font-black uppercase tracking-widest">
            + Submit issue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6 mt-6">
          {isLoading ? [1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-[2.5rem]" />) : activeDisputes.length === 0 ? (
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white py-16">
              <CardContent className="text-center">
                <CheckCircle className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-serif italic text-slate-800">No active issues</h3>
                <p className="text-slate-400 text-sm mt-2">Submitted cases will appear here with live status tracking.</p>
              </CardContent>
            </Card>
          ) : activeDisputes.map(renderCard)}
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          {closedDisputes.length === 0 ? (
            <p className="text-center text-slate-400 py-12 font-serif italic">No closed issues yet.</p>
          ) : closedDisputes.map(renderCard)}
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-2xl font-serif italic text-slate-800">Submit an issue</CardTitle>
              <CardDescription className="text-slate-400 text-xs uppercase tracking-widest mt-1">
                Booking details are filled from the existing record
              </CardDescription>
            </CardHeader>
            <Separator className="mx-8 mt-6 bg-slate-50" />
            <CardContent className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select booking *</Label>
                  <Select value={form.booking_id} onValueChange={(v) => setForm((prev) => ({ ...prev, booking_id: v }))}>
                    <SelectTrigger className={cn("h-12 rounded-2xl bg-slate-50 border-none", triedSubmit && !form.booking_id && "ring-2 ring-rose-200 bg-rose-50")}>
                      <SelectValue placeholder="Choose a booking" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {(bookings as any[]).length === 0 ? (
                        <div className="p-4 text-xs text-slate-400 text-center">No eligible bookings found</div>
                      ) : (bookings as any[]).map((b: any) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.service_name || "Service"} · {b.booking_date ? new Date(b.booking_date).toLocaleDateString() : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{counterpartLabel}</Label>
                  <Input
                    value={role === "customer" ? (selectedBooking?.provider?.full_name || "Auto-filled from booking") : (selectedBooking?.customer?.full_name || "Auto-filled from booking")}
                    readOnly
                    className="h-12 rounded-2xl bg-slate-100 border-none opacity-60"
                  />
                </div>
              </div>

              {selectedBooking && (
                <div className="grid md:grid-cols-3 gap-3 text-xs bg-slate-50 rounded-2xl p-4">
                  <div><span className="text-slate-400 block">Reference</span>{selectedBooking.reference}</div>
                  <div><span className="text-slate-400 block">Status</span>{selectedBooking.status}</div>
                  <div><span className="text-slate-400 block">Amount</span>{formatMoney(selectedBooking.total_amount)}</div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category *</Label>
                  <Select value={form.category} onValueChange={(v) => setForm((prev) => ({ ...prev, category: v }))}>
                    <SelectTrigger className={cn("h-12 rounded-2xl bg-slate-50 border-none", triedSubmit && !form.category && "ring-2 ring-rose-200")}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {DISPUTE_CATEGORIES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Requested resolution</Label>
                  <Select value={form.requested_resolution} onValueChange={(v) => setForm((prev) => ({ ...prev, requested_resolution: v }))}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none">
                      <SelectValue placeholder="What outcome do you want?" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {REQUESTED_RESOLUTIONS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</Label>
                <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Short summary of the issue" className="h-12 rounded-2xl bg-slate-50 border-none" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description *</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what happened, when, and the outcome you expect..."
                  className={cn("rounded-2xl bg-slate-50 border-none p-5 min-h-[120px]", triedSubmit && form.description.trim().length < 10 && "ring-2 ring-rose-200")}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Evidence</Label>
                <label className="aspect-video max-w-sm rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center gap-3">
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setProofImage(file)
                    if (file.type.startsWith("image/")) {
                      const reader = new FileReader()
                      reader.onloadend = () => setImagePreview(reader.result as string)
                      reader.readAsDataURL(file)
                    } else {
                      setImagePreview(null)
                    }
                  }} />
                  {imagePreview ? <img src={imagePreview} alt="Evidence" className="w-full h-full object-cover rounded-2xl" /> : (
                    <>
                      <Camera className="w-5 h-5 text-slate-400" />
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{proofImage?.name || "Upload image or PDF"}</p>
                    </>
                  )}
                </label>
              </div>

              <div className="p-5 rounded-2xl bg-[#668c65]/5 border border-[#668c65]/10 flex gap-3">
                <ShieldCheck className="w-5 h-5 text-[#668c65] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600">A VowNests moderator will review this case. You will see every status change and message on this page.</p>
              </div>

              <Button
                onClick={() => {
                  setTriedSubmit(true)
                  if (!isFormValid) {
                    toast.error("Please fill in the required fields.")
                    return
                  }
                  submitMutation.mutate()
                }}
                disabled={submitMutation.isPending}
                className="h-14 px-10 rounded-full bg-[#668c65] hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]"
              >
                {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit issue"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selected && <DisputeDetail dispute={selected} role={role} onClose={() => setSelected(null)} />}
    </div>
  )
}

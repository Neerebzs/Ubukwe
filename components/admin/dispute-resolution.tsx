"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { invalidateDisputes } from "@/lib/cache/invalidation"
import { queryKeys } from "@/lib/cache/query-keys"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle, Clock, CheckCircle, Search, MessageSquare, Send, Loader2,
  ShieldCheck, ArrowLeft, FileText
} from "lucide-react"
import { StatCard } from "./stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  PRIORITY_CLASSES,
  RESOLUTION_TYPES,
  STATUS_CLASSES,
  STATUS_LABELS,
  TIMELINE_LABELS,
  categoryLabel,
  disputeRef,
  formatMoney,
} from "@/lib/disputes"

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "open", label: "New" },
  { id: "under_review", label: "Under Review" },
  { id: "awaiting_response", label: "Awaiting Response" },
  { id: "evidence_review", label: "Evidence Review" },
  { id: "mediation", label: "Mediation" },
  { id: "decision_pending", label: "Decision Pending" },
  { id: "resolved", label: "Resolved" },
  { id: "closed", label: "Closed" },
  { id: "escalated", label: "Escalated" },
]

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest", STATUS_CLASSES[status] || STATUS_CLASSES.open)}>
      {STATUS_LABELS[status] || status.replace(/_/g, " ")}
    </Badge>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge variant="outline" className={cn("rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest", PRIORITY_CLASSES[priority] || PRIORITY_CLASSES.medium)}>
      {priority}
    </Badge>
  )
}

function Workspace({ disputeId, onBack }: { disputeId: string; onBack: () => void }) {
  const queryClient = useQueryClient()
  const [notes, setNotes] = useState("")
  const [resolutionType, setResolutionType] = useState("no_action")
  const [resolutionAmount, setResolutionAmount] = useState("")
  const [adminMsg, setAdminMsg] = useState("")
  const [internalNote, setInternalNote] = useState("")
  const [infoTarget, setInfoTarget] = useState("respondent")
  const [statusValue, setStatusValue] = useState("")

  const { data: details, isLoading } = useQuery({
    queryKey: queryKeys.disputes.detail(disputeId),
    queryFn: async () => (await apiClient.disputes.adminGetDetails(disputeId)).data,
  })

  const invalidate = () => invalidateDisputes(queryClient, disputeId)
  const run = (fn: () => Promise<any>, success: string) => ({
    mutationFn: fn,
    onSuccess: () => { toast.success(success); invalidate() },
    onError: (err: any) => toast.error(err?.response?.data?.detail || err.message || "Action failed"),
  })

  const investigate = useMutation(run(() => apiClient.disputes.adminInvestigate(disputeId, notes), "Investigation started"))
  const assign = useMutation(run(() => apiClient.disputes.adminAssign(disputeId, undefined, notes), "Case assigned to you"))
  const requestInfo = useMutation(run(() => apiClient.disputes.adminRequestInformation(disputeId, infoTarget, notes || adminMsg || "Please provide additional information."), "Information requested"))
  const mediate = useMutation(run(() => apiClient.disputes.adminStartMediation(disputeId, notes), "Mediation started"))
  const resolve = useMutation(run(() => apiClient.disputes.adminResolve(disputeId, resolutionType, notes, resolutionAmount ? Number(resolutionAmount) : undefined), "Decision issued"))
  const reject = useMutation(run(() => apiClient.disputes.adminReject(disputeId, notes), "Dispute rejected"))
  const escalate = useMutation(run(() => apiClient.disputes.adminEscalate(disputeId, notes || "Escalated for senior review"), "Dispute escalated"))
  const close = useMutation(run(() => apiClient.disputes.adminClose(disputeId, notes), "Dispute closed"))
  const changeStatus = useMutation(run(() => apiClient.disputes.adminChangeStatus(disputeId, statusValue, notes), "Status updated"))
  const sendMsg = useMutation(run(async () => {
    await apiClient.disputes.adminSendMessage(disputeId, adminMsg.trim())
    setAdminMsg("")
  }, "Message sent"))
  const sendInternal = useMutation(run(async () => {
    await apiClient.disputes.adminSendMessage(disputeId, internalNote.trim(), "internal")
    setInternalNote("")
  }, "Internal note saved"))

  if (isLoading || !details) {
    return <Skeleton className="h-[70vh] rounded-[2.5rem]" />
  }

  const dispute = details.dispute || details
  const messages = (details.messages || []).filter((m: any) => m.visibility !== "internal")
  const internal = (details.messages || []).filter((m: any) => m.visibility === "internal")
  const busy = [investigate, resolve, reject, mediate, escalate, close, requestInfo, assign, changeStatus, sendMsg, sendInternal].some((m) => m.isPending)

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700">
        <ArrowLeft className="w-4 h-4" /> Back to queue
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#668c65]">{disputeRef(dispute)}</p>
          <h2 className="font-serif italic text-3xl text-slate-900 mt-1">{dispute.title}</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            <StatusBadge status={dispute.status} />
            <PriorityBadge priority={dispute.priority} />
            {dispute.sla_breached && <Badge className="bg-rose-100 text-rose-700 border-none">SLA breached</Badge>}
          </div>
        </div>
        <p className="text-xs text-slate-400">Created {dispute.created_at ? new Date(dispute.created_at).toLocaleString() : ""}</p>
      </div>

      <div className="grid xl:grid-cols-[1.5fr_1fr] gap-6">
        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-[2rem]">
            <CardContent className="p-6 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issue</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{dispute.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-full">{categoryLabel(dispute.category)}</Badge>
                {dispute.requested_resolution && <Badge variant="outline" className="rounded-full">{dispute.requested_resolution.replace(/_/g, " ")}</Badge>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem]">
            <CardContent className="p-6 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Evidence</p>
              {(details.evidence || []).length === 0 && <p className="text-sm text-slate-400">No evidence uploaded.</p>}
              {(details.evidence || []).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-2xl p-3">
                  <a href={item.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-[#668c65]">
                    <FileText className="w-4 h-4" /> {item.file_name || "Evidence"}
                  </a>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-full h-8" onClick={() => apiClient.disputes.adminReviewEvidence(disputeId, item.id, "accepted").then(invalidate)}>Accept</Button>
                    <Button size="sm" variant="outline" className="rounded-full h-8 text-rose-600" onClick={() => apiClient.disputes.adminReviewEvidence(disputeId, item.id, "rejected").then(invalidate)}>Reject</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem]">
            <CardContent className="p-6 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conversation</p>
              <div className="max-h-72 overflow-y-auto space-y-3">
                {messages.length === 0 && <p className="text-sm text-slate-400">No participant messages yet.</p>}
                {messages.map((m: any) => (
                  <div key={m.id} className={cn("rounded-2xl p-4 text-sm", m.is_admin_message ? "bg-[#668c65] text-white ml-8" : "bg-slate-50 mr-8")}>
                    {m.is_admin_message && <p className="text-[9px] uppercase tracking-widest opacity-70 mb-1">Moderator</p>}
                    <p className="whitespace-pre-wrap">{m.message}</p>
                    <p className="text-[10px] opacity-60 mt-1">{m.created_at ? new Date(m.created_at).toLocaleString() : ""}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={adminMsg} onChange={(e) => setAdminMsg(e.target.value)} placeholder="Message both parties..." className="rounded-full h-11" />
                <Button className="rounded-full bg-[#668c65] hover:bg-slate-900 h-11 w-11" disabled={!adminMsg.trim() || sendMsg.isPending} onClick={() => sendMsg.mutate()}>
                  {sendMsg.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] border-l-4 border-amber-300">
            <CardContent className="p-6 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Internal notes — moderator only</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {internal.length === 0 && <p className="text-xs text-slate-400">No internal notes.</p>}
                {internal.map((m: any) => (
                  <p key={m.id} className="text-sm bg-amber-50 rounded-xl p-3">{m.message}<span className="block text-[10px] text-slate-400 mt-1">{m.created_at ? new Date(m.created_at).toLocaleString() : ""}</span></p>
                ))}
              </div>
              <Textarea value={internalNote} onChange={(e) => setInternalNote(e.target.value)} placeholder="Private note, never shown to participants..." className="rounded-2xl min-h-[80px]" />
              <Button variant="outline" className="rounded-full" disabled={!internalNote.trim() || sendInternal.isPending} onClick={() => sendInternal.mutate()}>Save internal note</Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem]">
            <CardContent className="p-6 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audit timeline</p>
              {(details.timeline || []).map((event: any) => (
                <div key={event.id} className="flex gap-3">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-[#668c65]" />
                  <div>
                    <p className="text-sm">{TIMELINE_LABELS[event.action] || event.action.replace(/_/g, " ")}</p>
                    <p className="text-[10px] text-slate-400">{event.created_at ? new Date(event.created_at).toLocaleString() : ""} {event.new_value ? `· ${String(event.new_value).replace(/_/g, " ")}` : ""}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-none shadow-sm rounded-[2rem]">
            <CardContent className="p-6 space-y-3 text-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parties</p>
              <p><span className="text-slate-400">Complainant:</span> {details.parties?.complainant?.full_name}</p>
              <p><span className="text-slate-400">Respondent:</span> {details.parties?.respondent?.full_name}</p>
              <p><span className="text-slate-400">Moderator:</span> {details.parties?.moderator?.full_name || "Unassigned"}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-[2rem]">
            <CardContent className="p-6 space-y-3 text-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Booking / finance</p>
              <p>{details.booking?.service_name}</p>
              <p className="text-slate-500">{details.booking?.reference} · {details.booking?.status}</p>
              <p>Agreed {formatMoney(details.financial?.agreed_amount)}</p>
              <p>Paid {formatMoney(details.financial?.paid_amount)}</p>
              <p>Outstanding {formatMoney(details.financial?.outstanding_amount)}</p>
              {dispute.sla_deadline && <p className={dispute.sla_breached ? "text-rose-600" : "text-slate-500"}>SLA {new Date(dispute.sla_deadline).toLocaleString()}</p>}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem]">
            <CardContent className="p-6 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Moderator actions</p>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes / decision explanation..." className="rounded-2xl min-h-[90px]" />
              <div className="grid grid-cols-2 gap-2">
                <Button disabled={busy} variant="outline" className="rounded-full" onClick={() => assign.mutate()}>Assign to me</Button>
                <Button disabled={busy} variant="outline" className="rounded-full" onClick={() => investigate.mutate()}>Start review</Button>
                <Select value={infoTarget} onValueChange={setInfoTarget}>
                  <SelectTrigger className="rounded-full h-10 col-span-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="respondent">Request respondent info</SelectItem>
                    <SelectItem value="complainant">Request complainant info</SelectItem>
                  </SelectContent>
                </Select>
                <Button disabled={busy} variant="outline" className="rounded-full col-span-2" onClick={() => requestInfo.mutate()}>Request information</Button>
                <Button disabled={busy} variant="outline" className="rounded-full col-span-2" onClick={() => mediate.mutate()}>Start mediation</Button>
              </div>
              <SeparatorSoft />
              <Select value={resolutionType} onValueChange={setResolutionType}>
                <SelectTrigger className="rounded-full h-10"><SelectValue placeholder="Decision type" /></SelectTrigger>
                <SelectContent>
                  {RESOLUTION_TYPES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {(resolutionType === "full_refund" || resolutionType === "partial_refund") && (
                <Input type="number" value={resolutionAmount} onChange={(e) => setResolutionAmount(e.target.value)} placeholder="Refund amount (RWF)" className="rounded-full h-10" />
              )}
              <Button disabled={busy || notes.trim().length < 5} className="w-full rounded-full bg-[#668c65] hover:bg-slate-900" onClick={() => resolve.mutate()}>Issue decision</Button>
              <Button disabled={busy || notes.trim().length < 5} variant="outline" className="w-full rounded-full text-rose-600" onClick={() => reject.mutate()}>Reject dispute</Button>
              <Button disabled={busy} variant="outline" className="w-full rounded-full" onClick={() => escalate.mutate()}>Escalate</Button>
              <Button disabled={busy} variant="outline" className="w-full rounded-full" onClick={() => close.mutate()}>Close</Button>
              <div className="flex gap-2">
                <Select value={statusValue} onValueChange={setStatusValue}>
                  <SelectTrigger className="rounded-full h-10"><SelectValue placeholder="Set status" /></SelectTrigger>
                  <SelectContent>
                    {["under_review", "awaiting_respondent", "awaiting_complainant", "evidence_review", "mediation", "decision_pending"].map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button disabled={!statusValue || busy} variant="outline" className="rounded-full" onClick={() => changeStatus.mutate()}>Apply</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SeparatorSoft() {
  return <div className="h-px bg-slate-100" />
}

export function AdminDisputeResolution() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const disputeIdFromUrl = searchParams.get("disputeId")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(disputeIdFromUrl)

  useEffect(() => {
    if (disputeIdFromUrl) setSelectedId(disputeIdFromUrl)
  }, [disputeIdFromUrl])

  const { data: disputesData, isLoading } = useQuery({
    queryKey: queryKeys.disputes.adminList({ status: statusFilter, priority: priorityFilter }),
    queryFn: async () => {
      const res = await apiClient.disputes.adminGetAll({
        status: statusFilter === "all" ? undefined : statusFilter,
        priority: priorityFilter === "all" ? undefined : priorityFilter,
        search: search || undefined,
        limit: 100,
      })
      const data = res.data
      return Array.isArray(data?.disputes) ? data.disputes : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    },
    refetchInterval: 30_000,
  })

  const { data: stats } = useQuery({
    queryKey: queryKeys.disputes.adminStats(),
    queryFn: async () => (await apiClient.disputes.adminGetStats()).data,
    refetchInterval: 30_000,
  })

  const disputes = disputesData ?? []
  const filtered = useMemo(() => disputes.filter((d: any) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return [d.title, d.description, d.customer_name, d.provider_name, d.reference_number, d.booking_reference]
      .some((value) => String(value || "").toLowerCase().includes(q))
  }), [disputes, search])

  if (selectedId) {
    return (
      <Workspace
        disputeId={selectedId}
        onBack={() => {
          setSelectedId(null)
          router.replace("/admin/dashboard?tab=disputes", { scroll: false })
        }}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#668c65]">Moderator workspace</p>
        <h1 className="font-serif italic text-4xl text-slate-900 mt-2">Dispute Resolution</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        <StatCard label="Total" value={stats?.total ?? disputes.length} icon={ShieldCheck} />
        <StatCard label="New" value={stats?.open ?? stats?.pending ?? 0} icon={AlertCircle} />
        <StatCard label="Under review" value={stats?.under_review ?? 0} icon={Search} />
        <StatCard label="Awaiting response" value={stats?.awaiting_response ?? 0} icon={Clock} />
        <StatCard label="Resolved" value={stats?.resolved ?? 0} icon={CheckCircle} />
        <StatCard label="Overdue" value={stats?.overdue ?? 0} icon={AlertCircle} />
      </div>
      {stats?.average_resolution_hours != null && (
        <p className="text-xs text-slate-400">Average resolution time: {stats.average_resolution_hours} hours</p>
      )}

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ID, booking, party, subject..." className="pl-11 h-12 rounded-full bg-white" />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full lg:w-40 h-12 rounded-full"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((item) => (
          <Button key={item.id} variant={statusFilter === item.id ? "default" : "outline"} className={cn("rounded-full h-9 text-[10px] uppercase tracking-widest", statusFilter === item.id && "bg-[#668c65] hover:bg-slate-900")} onClick={() => setStatusFilter(item.id)}>
            {item.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-[2rem]" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No disputes found" description="New cases will appear in this queue as soon as a customer or provider files one." />
      ) : (
        <div className="space-y-3">
          {filtered.map((d: any) => (
            <Card key={d.id} className="border-none shadow-sm rounded-[1.8rem] hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedId(d.id)}>
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{disputeRef(d)}</p>
                    <StatusBadge status={d.status} />
                    <PriorityBadge priority={d.priority} />
                  </div>
                  <h3 className="font-serif italic text-xl text-slate-900">{d.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {d.customer_name || d.complainant?.full_name} → {d.provider_name || d.respondent?.full_name} · {d.booking_reference || ""} · {categoryLabel(d.category)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium">{formatMoney(d.amount_in_dispute || d.booking_amount)}</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">{d.created_at ? new Date(d.created_at).toLocaleDateString() : ""}</p>
                  <Button size="sm" className="rounded-full bg-[#668c65] hover:bg-slate-900">Review case</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

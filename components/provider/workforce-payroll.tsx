"use client"

import { useMemo, useState, type ElementType } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Users, UserPlus, Briefcase, Calendar, ClipboardCheck, Wallet,
  Percent, Plane, Star, FileText, BarChart3, Settings, Loader2,
  CheckCircle2, AlertCircle, TrendingUp, Clock, Search, Plus,
} from "lucide-react"
import { workforceApi } from "@/lib/api/workforce"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { TranslatedText } from "@/components/translated-text"

type Section =
  | "dashboard" | "employees" | "freelancers" | "teams"
  | "assignments" | "schedules" | "attendance" | "payroll"
  | "commissions" | "leave" | "performance" | "documents"
  | "reports" | "settings"

const SECTIONS: { id: Section; label: string; icon: ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: TrendingUp },
  { id: "employees", label: "Employees", icon: Users },
  { id: "freelancers", label: "Freelancers", icon: UserPlus },
  { id: "teams", label: "Teams", icon: Briefcase },
  { id: "assignments", label: "Event Assignments", icon: Calendar },
  { id: "schedules", label: "Schedules", icon: Clock },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "payroll", label: "Payroll", icon: Wallet },
  { id: "commissions", label: "Commissions", icon: Percent },
  { id: "leave", label: "Leave", icon: Plane },
  { id: "performance", label: "Performance", icon: Star },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
]

const EMPLOYMENT_EMPLOYEE = ["permanent", "intern", "seasonal"]
const EMPLOYMENT_FREELANCE = ["freelancer", "contractor", "volunteer"]

function money(n?: number | null, currency = "RWF") {
  if (n == null) return "—"
  return `${Number(n).toLocaleString()} ${currency}`
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    available: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    assigned: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
    busy: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    on_leave: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
    suspended: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
    unavailable: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    present: "bg-emerald-100 text-emerald-800",
    absent: "bg-red-100 text-red-800",
    late: "bg-amber-100 text-amber-800",
    draft: "bg-slate-100 text-slate-700",
    under_review: "bg-amber-100 text-amber-800",
    recommended: "bg-sky-100 text-sky-800",
    approved: "bg-emerald-100 text-emerald-800",
    paid: "bg-teal-100 text-teal-800",
    awaiting_team_leader: "bg-amber-100 text-amber-800",
    staffing: "bg-sky-100 text-sky-800",
    ready: "bg-emerald-100 text-emerald-800",
    attendance_submitted: "bg-violet-100 text-violet-800",
    completed: "bg-teal-100 text-teal-800",
    pending: "bg-slate-100 text-slate-700",
  }
  return (
    <Badge className={cn("capitalize border-0 font-medium", map[status] || "bg-muted text-foreground")}>
      {status.replace(/_/g, " ")}
    </Badge>
  )
}

export function WorkforcePayroll() {
  const [section, setSection] = useState<Section>("dashboard")
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-slate-900 dark:text-slate-50">
            <TranslatedText text="Workforce & Payroll" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            <TranslatedText text="Event-driven staffing and payroll — only assigned, attended workers get paid." />
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" role="tablist" aria-label="Workforce sections">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={section === id}
            onClick={() => setSection(id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-sm transition-colors border",
              section === id
                ? "bg-[#0d182b] text-white border-[#0d182b]"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#668c65]"
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <TranslatedText text={label} />
          </button>
        ))}
      </div>

      {section === "dashboard" && <DashboardSection onOpenEvent={(id) => { setSelectedEventId(id); setSection("assignments") }} />}
      {(section === "employees" || section === "freelancers") && (
        <WorkersSection mode={section === "employees" ? "employees" : "freelancers"} />
      )}
      {section === "teams" && <TeamsSection />}
      {(section === "assignments" || section === "schedules" || section === "attendance") && (
        <EventsSection
          mode={section}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
        />
      )}
      {section === "payroll" && <PayrollSection />}
      {section === "commissions" && <CommissionsSection />}
      {section === "leave" && <LeaveSection />}
      {section === "performance" && <PerformanceSection />}
      {section === "documents" && <DocumentsSection />}
      {section === "reports" && <ReportsSection />}
      {section === "settings" && <SettingsSection />}
    </div>
  )
}

function DashboardSection({ onOpenEvent }: { onOpenEvent: (id: string) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["workforce-dashboard"],
    queryFn: async () => (await workforceApi.dashboard()).data,
  })

  if (isLoading) {
    return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
  }

  const kpis = [
    { label: "Total Workforce", value: data?.total_workforce, icon: Users },
    { label: "Active Workers", value: data?.active_workers, icon: CheckCircle2 },
    { label: "Available", value: data?.available_workers, icon: UserPlus },
    { label: "Upcoming Events", value: data?.upcoming_weddings, icon: Calendar },
    { label: "Confirmed Events", value: data?.confirmed_events, icon: Briefcase },
    { label: "Today's Schedule", value: data?.todays_schedule, icon: Clock },
    { label: "Today's Attendance", value: data?.todays_attendance, icon: ClipboardCheck },
    { label: "Payroll Pending", value: data?.payroll_pending_approval, icon: AlertCircle },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardContent className="p-5 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{label}</p>
                <p className="text-3xl font-semibold mt-2 tabular-nums">{value ?? 0}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-[#668c65]/15 text-[#668c65] flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Revenue vs Payroll</CardTitle>
            <CardDescription>Contract revenue compared to workforce payroll cost</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Revenue</p>
              <p className="text-2xl font-semibold mt-1">{money(data?.total_revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Payroll</p>
              <p className="text-2xl font-semibold mt-1">{money(data?.total_payroll_cost)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Difference</p>
              <p className="text-2xl font-semibold mt-1">{money(data?.revenue_vs_payroll?.difference)}</p>
            </div>
            <div className="sm:col-span-3">
              <p className="text-sm text-muted-foreground">
                Staff utilization: <span className="font-semibold text-foreground">{data?.staff_utilization_percent ?? 0}%</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.recent_activities || []).length === 0 && (
              <p className="text-sm text-muted-foreground">No recent workforce events yet.</p>
            )}
            {(data?.recent_activities || []).map((a: any) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onOpenEvent(a.id)}
                className="w-full text-left rounded-xl border border-slate-100 dark:border-slate-800 p-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <StatusBadge status={a.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{a.event_date}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function WorkersSection({ mode }: { mode: "employees" | "freelancers" }) {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", position: "", employment_type: mode === "employees" ? "permanent" : "freelancer",
    event_rate: "", hourly_rate: "", department: "",
  })

  const types = mode === "employees" ? EMPLOYMENT_EMPLOYEE : EMPLOYMENT_FREELANCE

  const { data, isLoading } = useQuery({
    queryKey: ["workforce-workers", mode, search],
    queryFn: async () => {
      const res = await workforceApi.listWorkers({ search: search || undefined, page_size: 50 })
      const items = res.data?.items || []
      return items.filter((w: any) => types.includes(w.employment_type))
    },
  })

  const createMut = useMutation({
    mutationFn: () => workforceApi.createWorker({
      ...form,
      event_rate: form.event_rate ? Number(form.event_rate) : undefined,
      hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : undefined,
    }),
    onSuccess: () => {
      toast.success("Worker added")
      setOpen(false)
      setForm({ full_name: "", phone: "", email: "", position: "", employment_type: types[0], event_rate: "", hourly_rate: "", department: "" })
      qc.invalidateQueries({ queryKey: ["workforce-workers"] })
      qc.invalidateQueries({ queryKey: ["workforce-dashboard"] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed to add worker"),
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name, phone, code…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => setOpen(true)} className="bg-[#668c65] hover:bg-[#557554]">
          <Plus className="h-4 w-4 mr-2" /> Add {mode === "employees" ? "Employee" : "Freelancer"}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Worker</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Rates</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data || []).length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No {mode} yet. Add your first worker.</td></tr>
                )}
                {(data || []).map((w: any) => (
                  <tr key={w.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">
                      <div className="font-medium">{w.full_name}</div>
                      <div className="text-xs text-muted-foreground">{w.employee_code} · {w.phone || w.email || "—"}</div>
                    </td>
                    <td className="px-4 py-3 capitalize">{w.employment_type}</td>
                    <td className="px-4 py-3">{w.position || "—"}</td>
                    <td className="px-4 py-3 text-xs">
                      <div>Event: {money(w.event_rate, w.currency)}</div>
                      <div>Hourly: {money(w.hourly_rate, w.currency)}</div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={w.availability_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add {mode === "employees" ? "Employee" : "Freelancer"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Full name</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Employment type</Label>
              <Select value={form.employment_type} onValueChange={(v) => setForm({ ...form, employment_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {types.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Position / role</Label>
              <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="e.g. Lead Dancer" />
            </div>
            <div className="space-y-1.5">
              <Label>Event rate (RWF)</Label>
              <Input type="number" value={form.event_rate} onChange={(e) => setForm({ ...form, event_rate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Hourly rate (RWF)</Label>
              <Input type="number" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.full_name || createMut.isPending} onClick={() => createMut.mutate()} className="bg-[#668c65] hover:bg-[#557554]">
              {createMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TeamsSection() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [teamType, setTeamType] = useState("custom")
  const [leaderId, setLeaderId] = useState("")

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["workforce-teams"],
    queryFn: async () => (await workforceApi.listTeams()).data || [],
  })
  const { data: workersData } = useQuery({
    queryKey: ["workforce-workers-all"],
    queryFn: async () => (await workforceApi.listWorkers({ page_size: 100, is_active: true })).data?.items || [],
  })

  const createMut = useMutation({
    mutationFn: () => workforceApi.createTeam({
      name, team_type: teamType, team_leader_id: leaderId || undefined,
    }),
    onSuccess: () => {
      toast.success("Team created")
      setOpen(false); setName(""); setLeaderId("")
      qc.invalidateQueries({ queryKey: ["workforce-teams"] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed to create team"),
  })

  const presets = [
    "photography", "traditional_dance", "decoration", "catering",
    "entertainment", "security", "cleaning", "transport", "custom",
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} className="bg-[#668c65] hover:bg-[#557554]">
          <Plus className="h-4 w-4 mr-2" /> New Team
        </Button>
      </div>
      {isLoading ? <Skeleton className="h-40 rounded-2xl" /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.length === 0 && (
            <Card className="rounded-2xl sm:col-span-2 lg:col-span-3">
              <CardContent className="p-8 text-center text-muted-foreground">
                Create teams (dance, photo, catering…) then assign leaders per event.
              </CardContent>
            </Card>
          )}
          {teams.map((t: any) => (
            <Card key={t.id} className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t.name}</CardTitle>
                <CardDescription className="capitalize">{(t.team_type || "custom").replace(/_/g, " ")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t.member_count || 0} members</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(t.skills || []).slice(0, 4).map((s: string) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Team</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={teamType} onValueChange={setTeamType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {presets.map((p) => <SelectItem key={p} value={p} className="capitalize">{p.replace(/_/g, " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Team leader (optional)</Label>
              <Select value={leaderId || "none"} onValueChange={(v) => setLeaderId(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Select leader" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None yet</SelectItem>
                  {(workersData || []).map((w: any) => (
                    <SelectItem key={w.id} value={w.id}>{w.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!name || createMut.isPending} onClick={() => createMut.mutate()} className="bg-[#668c65] hover:bg-[#557554]">
              {createMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EventsSection({
  mode, selectedEventId, onSelectEvent,
}: {
  mode: "assignments" | "schedules" | "attendance"
  selectedEventId: string | null
  onSelectEvent: (id: string | null) => void
}) {
  const qc = useQueryClient()
  const [leaderId, setLeaderId] = useState("")
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([])
  const [roleLabel, setRoleLabel] = useState("")

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["workforce-events"],
    queryFn: async () => (await workforceApi.listEvents({ page_size: 50 })).data,
  })
  const events = eventsData?.items || []

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["workforce-event", selectedEventId],
    queryFn: async () => selectedEventId ? (await workforceApi.getEvent(selectedEventId)).data : null,
    enabled: !!selectedEventId,
  })

  const { data: workers = [] } = useQuery({
    queryKey: ["workforce-workers-all"],
    queryFn: async () => (await workforceApi.listWorkers({ page_size: 100, is_active: true })).data?.items || [],
  })

  const assignLeaderMut = useMutation({
    mutationFn: () => workforceApi.assignLeader(selectedEventId!, { team_leader_id: leaderId }),
    onSuccess: () => {
      toast.success("Team leader assigned")
      qc.invalidateQueries({ queryKey: ["workforce-event", selectedEventId] })
      qc.invalidateQueries({ queryKey: ["workforce-events"] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed"),
  })

  const assignWorkersMut = useMutation({
    mutationFn: () => workforceApi.assignWorkers(selectedEventId!, {
      workers: selectedWorkers.map((id) => ({ worker_id: id, role_label: roleLabel || undefined })),
    }),
    onSuccess: (res) => {
      const conflicts = res.data?.conflicts || []
      if (conflicts.length) toast.warning(`${conflicts.length} conflict(s) — check availability`)
      else toast.success("Workers assigned")
      setSelectedWorkers([])
      qc.invalidateQueries({ queryKey: ["workforce-event", selectedEventId] })
      qc.invalidateQueries({ queryKey: ["workforce-dashboard"] })
    },
    onError: (e: any) => {
      const detail = e?.response?.data?.detail
      toast.error(typeof detail === "object" ? detail.message || "Assignment conflict" : detail || "Failed")
    },
  })

  const attendanceMut = useMutation({
    mutationFn: (records: any[]) => workforceApi.recordAttendance(selectedEventId!, records),
    onSuccess: () => {
      toast.success("Attendance saved")
      qc.invalidateQueries({ queryKey: ["workforce-event", selectedEventId] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed"),
  })

  const submitAttMut = useMutation({
    mutationFn: () => workforceApi.submitAttendance(selectedEventId!),
    onSuccess: () => {
      toast.success("Attendance submitted for owner review")
      qc.invalidateQueries({ queryKey: ["workforce-event", selectedEventId] })
      qc.invalidateQueries({ queryKey: ["workforce-events"] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed"),
  })

  const generatePayMut = useMutation({
    mutationFn: () => workforceApi.generatePayroll(selectedEventId!),
    onSuccess: () => {
      toast.success("Payroll generated")
      qc.invalidateQueries({ queryKey: ["workforce-event", selectedEventId] })
      qc.invalidateQueries({ queryKey: ["workforce-payroll"] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed to generate payroll"),
  })

  const scheduleEvents = useMemo(() => {
    if (mode !== "schedules") return events
    const today = new Date().toISOString().slice(0, 10)
    return events.filter((e: any) => e.event_date >= today)
  }, [events, mode])

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="rounded-2xl lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">
            {mode === "schedules" ? "Upcoming Schedule" : "Confirmed Events"}
          </CardTitle>
          <CardDescription>Created automatically when bookings are paid & confirmed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[560px] overflow-y-auto">
          {isLoading && <Skeleton className="h-20 rounded-xl" />}
          {!isLoading && scheduleEvents.length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No workforce events yet. Confirm a booking payment to create one.
            </p>
          )}
          {scheduleEvents.map((e: any) => (
            <button
              key={e.id}
              type="button"
              onClick={() => onSelectEvent(e.id)}
              className={cn(
                "w-full text-left rounded-xl border p-3 transition",
                selectedEventId === e.id
                  ? "border-[#668c65] bg-[#668c65]/10"
                  : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{e.event_date} · {e.location || "No location"}</p>
                </div>
                <StatusBadge status={e.status} />
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg">
            {mode === "attendance" ? "Attendance" : "Event Operations"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedEventId && (
            <p className="text-sm text-muted-foreground py-10 text-center">Select an event to manage staffing and attendance.</p>
          )}
          {selectedEventId && detailLoading && <Skeleton className="h-40 rounded-xl" />}
          {selectedEventId && detail && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-lg">{detail.title}</h3>
                  <p className="text-sm text-muted-foreground">{detail.event_date} · Revenue {money(detail.contract_revenue, detail.currency)}</p>
                </div>
                <StatusBadge status={detail.status} />
              </div>

              {(mode === "assignments" || mode === "schedules") && (
                <>
                  <div className="rounded-xl border p-4 space-y-3">
                    <p className="text-sm font-medium">1. Assign Team Leader</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select value={leaderId || detail.team_leader_id || "none"} onValueChange={(v) => setLeaderId(v === "none" ? "" : v)}>
                        <SelectTrigger className="sm:flex-1"><SelectValue placeholder="Select leader" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select…</SelectItem>
                          {workers.map((w: any) => (
                            <SelectItem key={w.id} value={w.id}>{w.full_name} ({w.position || w.employment_type})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        disabled={!leaderId || assignLeaderMut.isPending}
                        onClick={() => assignLeaderMut.mutate()}
                        className="bg-[#668c65] hover:bg-[#557554]"
                      >
                        Assign Leader
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border p-4 space-y-3">
                    <p className="text-sm font-medium">2. Team Leader selects workers</p>
                    <Input placeholder="Role for selected (e.g. Lead Dancer)" value={roleLabel} onChange={(e) => setRoleLabel(e.target.value)} />
                    <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
                      {workers.map((w: any) => {
                        const checked = selectedWorkers.includes(w.id)
                        return (
                          <label key={w.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => setSelectedWorkers((prev) =>
                                checked ? prev.filter((x) => x !== w.id) : [...prev, w.id]
                              )}
                            />
                            <span className="text-sm flex-1">{w.full_name}</span>
                            <StatusBadge status={w.availability_status} />
                          </label>
                        )
                      })}
                    </div>
                    <Button
                      disabled={!selectedWorkers.length || assignWorkersMut.isPending}
                      onClick={() => assignWorkersMut.mutate()}
                      className="bg-[#0d182b] hover:bg-[#15233a]"
                    >
                      Assign {selectedWorkers.length || ""} Worker(s)
                    </Button>
                  </div>
                </>
              )}

              <div className="rounded-xl border p-4">
                <p className="text-sm font-medium mb-3">Assigned crew ({(detail.assignments || []).length})</p>
                <div className="space-y-2">
                  {(detail.assignments || []).map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <p className="font-medium">{a.worker_name}</p>
                        <p className="text-xs text-muted-foreground">{a.role_label || "—"}</p>
                      </div>
                      <StatusBadge status={a.availability_status} />
                    </div>
                  ))}
                  {(detail.assignments || []).length === 0 && (
                    <p className="text-sm text-muted-foreground">No workers assigned yet.</p>
                  )}
                </div>
              </div>

              {(mode === "attendance" || mode === "assignments") && (detail.assignments || []).length > 0 && (
                <div className="rounded-xl border p-4 space-y-3">
                  <p className="text-sm font-medium">Attendance</p>
                  {(detail.assignments || []).map((a: any) => {
                    const att = (detail.attendance || []).find((x: any) => x.worker_id === a.worker_id)
                    return (
                      <div key={a.id} className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                        <span className="text-sm">{a.worker_name}</span>
                        <Select
                          value={att?.status || "pending"}
                          onValueChange={(status) => attendanceMut.mutate([{ worker_id: a.worker_id, status, hours_worked: 8 }])}
                        >
                          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["pending", "present", "late", "absent", "left_early", "overtime", "excused"].map((s) => (
                              <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  })}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" disabled={submitAttMut.isPending} onClick={() => submitAttMut.mutate()}>
                      Submit Attendance
                    </Button>
                    <Button
                      className="bg-[#668c65] hover:bg-[#557554]"
                      disabled={generatePayMut.isPending}
                      onClick={() => generatePayMut.mutate()}
                    >
                      Generate Payroll
                    </Button>
                  </div>
                </div>
              )}

              {detail.payroll_run && (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-4 text-sm">
                  <p className="font-medium">Payroll: <StatusBadge status={detail.payroll_run.status} /></p>
                  <p className="text-muted-foreground mt-1">
                    Net {money(detail.payroll_run.net_total, detail.payroll_run.currency)} · {detail.payroll_run.worker_count} workers
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function PayrollSection() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["workforce-payroll"],
    queryFn: async () => (await workforceApi.listPayroll({ page_size: 50 })).data,
  })

  const { data: detail } = useQuery({
    queryKey: ["workforce-payroll-detail", selected],
    queryFn: async () => selected ? (await workforceApi.getPayroll(selected)).data : null,
    enabled: !!selected,
  })

  const action = async (fn: () => Promise<any>, ok: string) => {
    try {
      await fn()
      toast.success(ok)
      qc.invalidateQueries({ queryKey: ["workforce-payroll"] })
      qc.invalidateQueries({ queryKey: ["workforce-payroll-detail", selected] })
      qc.invalidateQueries({ queryKey: ["workforce-dashboard"] })
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Action failed")
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="rounded-2xl lg:col-span-2">
        <CardHeader><CardTitle className="text-lg">Payroll Runs</CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-[560px] overflow-y-auto">
          {isLoading && <Skeleton className="h-16 rounded-xl" />}
          {(data?.items || []).map((p: any) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p.id)}
              className={cn(
                "w-full text-left rounded-xl border p-3",
                selected === p.id ? "border-[#668c65] bg-[#668c65]/10" : "border-slate-100 dark:border-slate-800"
              )}
            >
              <div className="flex justify-between gap-2">
                <span className="text-sm font-medium">{money(p.net_total, p.currency)}</span>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{p.worker_count} workers · {p.created_at?.slice(0, 10)}</p>
            </button>
          ))}
          {!isLoading && !(data?.items || []).length && (
            <p className="text-sm text-muted-foreground text-center py-8">No payroll runs yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl lg:col-span-3">
        <CardHeader><CardTitle className="text-lg">Payroll Detail & Approval</CardTitle></CardHeader>
        <CardContent>
          {!detail && <p className="text-sm text-muted-foreground text-center py-10">Select a payroll run.</p>}
          {detail && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => action(() => workforceApi.recommendPayroll(detail.id), "Recommended")}>
                  Recommend
                </Button>
                <Button size="sm" className="bg-[#668c65] hover:bg-[#557554]" onClick={() => action(() => workforceApi.approvePayroll(detail.id), "Approved")}>
                  Approve
                </Button>
                <Button size="sm" className="bg-[#0d182b]" onClick={() => action(() => workforceApi.markPayrollPaid(detail.id), "Marked paid")}>
                  Mark Paid
                </Button>
              </div>
              <p className="text-sm">Event: <strong>{detail.event?.title}</strong> · <StatusBadge status={detail.status} /></p>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Worker</th>
                      <th className="px-3 py-2 text-left">Role</th>
                      <th className="px-3 py-2 text-right">Gross</th>
                      <th className="px-3 py-2 text-right">Tax</th>
                      <th className="px-3 py-2 text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.items || []).map((i: any) => (
                      <tr key={i.id} className="border-t">
                        <td className="px-3 py-2">{i.worker_name}</td>
                        <td className="px-3 py-2">{i.role_label || "—"}</td>
                        <td className="px-3 py-2 text-right">{money(i.gross_pay, detail.currency)}</td>
                        <td className="px-3 py-2 text-right">{money(i.taxes, detail.currency)}</td>
                        <td className="px-3 py-2 text-right font-medium">{money(i.net_pay, detail.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(detail.audit_trail || []).length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Audit trail</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {detail.audit_trail.map((a: any) => (
                      <li key={a.id}>{a.created_at?.slice(0, 19)} — {a.action} ({a.from_status} → {a.to_status})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CommissionsSection() {
  const qc = useQueryClient()
  const [roleName, setRoleName] = useState("")
  const [amount, setAmount] = useState("")
  const [planName, setPlanName] = useState("")
  const [share, setShare] = useState("20")

  const { data: rates = [] } = useQuery({
    queryKey: ["workforce-role-rates"],
    queryFn: async () => (await workforceApi.listRoleRates()).data || [],
  })
  const { data: plans = [] } = useQuery({
    queryKey: ["workforce-commission-plans"],
    queryFn: async () => (await workforceApi.listCommissionPlans()).data || [],
  })

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Role Rates</CardTitle>
          <CardDescription>e.g. Lead Dancer 35,000 · Drummer 30,000 RWF</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Role name" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
            <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-32" />
            <Button
              className="bg-[#668c65] hover:bg-[#557554]"
              onClick={async () => {
                try {
                  await workforceApi.upsertRoleRate({ role_name: roleName, amount: Number(amount) })
                  toast.success("Rate saved")
                  setRoleName(""); setAmount("")
                  qc.invalidateQueries({ queryKey: ["workforce-role-rates"] })
                } catch (e: any) {
                  toast.error(e?.response?.data?.detail || "Failed")
                }
              }}
            >Save</Button>
          </div>
          <ul className="space-y-2">
            {rates.map((r: any) => (
              <li key={r.id} className="flex justify-between text-sm border-b pb-2">
                <span>{r.role_name}</span>
                <span className="font-medium">{money(r.amount, r.currency)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Commission Plans</CardTitle>
          <CardDescription>Team share of contract revenue, split among assigned workers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Plan name" value={planName} onChange={(e) => setPlanName(e.target.value)} />
            <Input type="number" placeholder="% share" value={share} onChange={(e) => setShare(e.target.value)} className="w-28" />
            <Button
              className="bg-[#0d182b]"
              onClick={async () => {
                try {
                  await workforceApi.createCommissionPlan({
                    name: planName,
                    team_share_percent: Number(share),
                    distribution_rule: "equal",
                  })
                  toast.success("Plan created")
                  setPlanName("")
                  qc.invalidateQueries({ queryKey: ["workforce-commission-plans"] })
                } catch (e: any) {
                  toast.error(e?.response?.data?.detail || "Failed")
                }
              }}
            >Add</Button>
          </div>
          <ul className="space-y-2">
            {plans.map((p: any) => (
              <li key={p.id} className="flex justify-between text-sm border-b pb-2">
                <span>{p.name}</span>
                <span>{p.team_share_percent}% · {p.distribution_rule}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function LeaveSection() {
  const qc = useQueryClient()
  const { data: leave = [] } = useQuery({
    queryKey: ["workforce-leave"],
    queryFn: async () => (await workforceApi.listLeave()).data || [],
  })
  const { data: workers = [] } = useQuery({
    queryKey: ["workforce-workers-all"],
    queryFn: async () => (await workforceApi.listWorkers({ page_size: 100 })).data?.items || [],
  })
  const [workerId, setWorkerId] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [reason, setReason] = useState("")

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-lg">Request Leave</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Select value={workerId || "none"} onValueChange={(v) => setWorkerId(v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Worker" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select worker</SelectItem>
              {workers.map((w: any) => <SelectItem key={w.id} value={w.id}>{w.full_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          <Input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button
            className="bg-[#668c65] hover:bg-[#557554]"
            onClick={async () => {
              try {
                await workforceApi.createLeave({ worker_id: workerId, start_date: start, end_date: end, reason })
                toast.success("Leave submitted")
                qc.invalidateQueries({ queryKey: ["workforce-leave"] })
              } catch (e: any) {
                toast.error(e?.response?.data?.detail || "Failed")
              }
            }}
          >Submit</Button>
        </CardContent>
      </Card>
      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Worker</th>
              <th className="px-4 py-3 text-left">Dates</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leave.map((l: any) => (
              <tr key={l.id} className="border-t">
                <td className="px-4 py-3">{l.worker_name}</td>
                <td className="px-4 py-3">{l.start_date} → {l.end_date}</td>
                <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                <td className="px-4 py-3 text-right space-x-2">
                  {l.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" onClick={async () => {
                        await workforceApi.reviewLeave(l.id, true)
                        toast.success("Approved"); qc.invalidateQueries({ queryKey: ["workforce-leave"] })
                      }}>Approve</Button>
                      <Button size="sm" variant="ghost" onClick={async () => {
                        await workforceApi.reviewLeave(l.id, false)
                        toast.success("Rejected"); qc.invalidateQueries({ queryKey: ["workforce-leave"] })
                      }}>Reject</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PerformanceSection() {
  const { data = [] } = useQuery({
    queryKey: ["workforce-performance"],
    queryFn: async () => (await workforceApi.listPerformance()).data || [],
  })
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Performance Reviews</CardTitle>
        <CardDescription>Scores roll up into each worker profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
        {data.map((r: any) => (
          <div key={r.id} className="flex justify-between border-b pb-2 text-sm">
            <div>
              <p className="font-medium">{r.worker_name}</p>
              <p className="text-xs text-muted-foreground">{r.comments || "—"}</p>
            </div>
            <Badge>{r.score}/100</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function DocumentsSection() {
  const qc = useQueryClient()
  const { data = [] } = useQuery({
    queryKey: ["workforce-documents"],
    queryFn: async () => (await workforceApi.listDocuments()).data || [],
  })
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-lg">Upload Document Link</CardTitle></CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="File URL (from storage upload)" value={url} onChange={(e) => setUrl(e.target.value)} />
          <Button
            className="bg-[#668c65] hover:bg-[#557554]"
            onClick={async () => {
              try {
                await workforceApi.createDocument({ title, file_url: url })
                toast.success("Document saved")
                setTitle(""); setUrl("")
                qc.invalidateQueries({ queryKey: ["workforce-documents"] })
              } catch (e: any) {
                toast.error(e?.response?.data?.detail || "Failed")
              }
            }}
          >Save</Button>
        </CardContent>
      </Card>
      <ul className="space-y-2">
        {data.map((d: any) => (
          <li key={d.id} className="rounded-xl border p-3 flex justify-between text-sm">
            <span>{d.title} <span className="text-muted-foreground">({d.doc_type})</span></span>
            <a href={d.file_url} target="_blank" rel="noreferrer" className="text-[#668c65] underline">Open</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ReportsSection() {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const types = [
    "payroll_summary", "attendance", "workforce_utilization",
    "event_profitability", "worker_performance",
  ]

  const run = async (type: string, format = "json") => {
    setLoading(true)
    try {
      const res = await workforceApi.getReport(type, format)
      setReport(res.data)
      if (format === "csv" && res.data?.csv) {
        const blob = new Blob([res.data.csv], { type: "text/csv" })
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = `${type}.csv`
        a.click()
        toast.success("CSV downloaded")
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Report failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {types.map((t) => (
          <Card key={t} className="rounded-2xl">
            <CardContent className="p-4 space-y-3">
              <p className="font-medium capitalize">{t.replace(/_/g, " ")}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={loading} onClick={() => run(t)}>View</Button>
                <Button size="sm" className="bg-[#0d182b]" disabled={loading} onClick={() => run(t, "csv")}>CSV</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {report && (
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-lg capitalize">{report.report_type?.replace(/_/g, " ")}</CardTitle></CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-96 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
              {JSON.stringify(report.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SettingsSection() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["workforce-settings"],
    queryFn: async () => (await workforceApi.getSettings()).data,
  })
  const [form, setForm] = useState<any>(null)

  const current = form || data

  if (isLoading || !current) return <Skeleton className="h-48 rounded-2xl" />

  return (
    <Card className="rounded-2xl max-w-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Workforce Settings</CardTitle>
        <CardDescription>Currency, overtime, tax, and payroll rules</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Default currency</Label>
            <Input
              value={current.default_currency}
              onChange={(e) => setForm({ ...current, default_currency: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Timezone</Label>
            <Input
              value={current.default_timezone}
              onChange={(e) => setForm({ ...current, default_timezone: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Overtime multiplier</Label>
            <Input
              type="number"
              step="0.1"
              value={current.overtime_multiplier}
              onChange={(e) => setForm({ ...current, overtime_multiplier: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tax rate %</Label>
            <Input
              type="number"
              value={current.tax_rate_percent}
              onChange={(e) => setForm({ ...current, tax_rate_percent: Number(e.target.value) })}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!current.auto_create_event_on_booking_confirm}
            onChange={(e) => setForm({ ...current, auto_create_event_on_booking_confirm: e.target.checked })}
          />
          Auto-create workforce event when booking is confirmed
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!current.require_attendance_for_payroll}
            onChange={(e) => setForm({ ...current, require_attendance_for_payroll: e.target.checked })}
          />
          Require approved attendance for payroll eligibility
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!current.allow_double_booking_override}
            onChange={(e) => setForm({ ...current, allow_double_booking_override: e.target.checked })}
          />
          Allow managers to override double-booking conflicts
        </label>
        <Button
          className="bg-[#668c65] hover:bg-[#557554]"
          onClick={async () => {
            try {
              await workforceApi.updateSettings(form || current)
              toast.success("Settings saved")
              qc.invalidateQueries({ queryKey: ["workforce-settings"] })
            } catch (e: any) {
              toast.error(e?.response?.data?.detail || "Failed")
            }
          }}
        >
          Save Settings
        </Button>
      </CardContent>
    </Card>
  )
}

"use client"

import { useMemo, useRef, useState, type ElementType } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Users, UserPlus, Briefcase, Calendar, ClipboardCheck, Wallet,
  Percent, Plane, Star, FileText, BarChart3, Settings, Loader2,
  CheckCircle2, AlertCircle, TrendingUp, Clock, Search, Plus,
  Download, Upload, Trash2, FileSpreadsheet, Pencil, CreditCard, Link2,
} from "lucide-react"
import { workforceApi } from "@/lib/api/workforce"
import {
  createEmptyWorkerDraft,
  downloadWorkerTemplate,
  draftToWorkerPayload,
  parseWorkerExcel,
  type WorkerDraftRow,
} from "@/lib/workforce-excel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { TranslatedText } from "@/components/translated-text"

type Section =
  | "dashboard" | "employees" | "teams"
  | "assignments" | "schedules" | "attendance" | "payroll"
  | "commissions" | "leave" | "performance" | "documents"
  | "reports" | "settings"

const SECTIONS: { id: Section; label: string; icon: ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: TrendingUp },
  { id: "employees", label: "Workforce", icon: Users },
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
const ALL_EMPLOYMENT_TYPES = [...EMPLOYMENT_EMPLOYEE, ...EMPLOYMENT_FREELANCE]

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
  const activeMeta = SECTIONS.find((s) => s.id === section)
  const ActiveIcon = activeMeta?.icon

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#0d182b] text-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-semibold mb-1.5">
              <TranslatedText text="Business Setup" />
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              <TranslatedText text="Workforce & Payroll" />
            </h1>
            <p className="text-sm text-white/70 mt-1.5 max-w-2xl leading-relaxed">
              <TranslatedText text="Event-driven staffing and payroll — only assigned, attended workers get paid." />
            </p>
          </div>
          {activeMeta && ActiveIcon && (
            <div className="inline-flex items-center gap-2 self-start rounded-xl bg-white/10 px-3 py-2 text-sm border border-white/10">
              <ActiveIcon className="h-4 w-4 text-[#a8c9a7]" />
              <span className="text-white/90"><TranslatedText text={activeMeta.label} /></span>
            </div>
          )}
        </div>
      </div>

      <div
        className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-1.5"
        role="tablist"
        aria-label="Workforce sections"
      >
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={section === id}
            onClick={() => setSection(id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-all",
              section === id
                ? "bg-white dark:bg-slate-800 text-[#0d182b] dark:text-white font-medium"
                : "text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/70"
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", section === id ? "text-[#668c65]" : "opacity-70")} aria-hidden />
            <TranslatedText text={label} />
          </button>
        ))}
      </div>

      {section === "dashboard" && <DashboardSection onOpenEvent={(id) => { setSelectedEventId(id); setSection("assignments") }} />}
      {section === "employees" && <WorkersSection />}
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
    { label: "Pending Payment", value: data?.pending_payment_events, icon: CreditCard },
    { label: "Today's Schedule", value: data?.todays_schedule, icon: Clock },
    { label: "Today's Attendance", value: data?.todays_attendance, icon: ClipboardCheck },
    { label: "Payroll Pending", value: data?.payroll_pending_approval, icon: AlertCircle },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="rounded-2xl border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-5 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{label}</p>
                <p className="text-3xl font-semibold mt-2 tabular-nums tracking-tight">{value ?? 0}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-[#668c65]/15 text-[#668c65] flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Confirmed Events</CardTitle>
            <CardDescription>Paid bookings ready for workforce staffing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[360px] overflow-y-auto">
            {(data?.confirmed_event_bookings || []).length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No confirmed bookings yet. Events appear here after customer payment.
              </p>
            )}
            {(data?.confirmed_event_bookings || []).map((b: any) => (
              <button
                key={b.booking_id}
                type="button"
                disabled={!b.workforce_event_id}
                onClick={() => b.workforce_event_id && onOpenEvent(b.workforce_event_id)}
                className={cn(
                  "w-full text-left rounded-xl border p-3 transition",
                  b.workforce_event_id
                    ? "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                    : "border-slate-100 dark:border-slate-800 opacity-80 cursor-default"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{b.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {b.customer_name} · {b.event_date}
                    </p>
                    {b.location && (
                      <p className="text-xs text-muted-foreground truncate">{b.location}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 border-0">
                      Paid
                    </Badge>
                    {b.workforce_status && <StatusBadge status={b.workforce_status} />}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{money(b.total_amount)}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Pending Events</CardTitle>
            <CardDescription>Accepted bookings awaiting customer payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[360px] overflow-y-auto">
            {(data?.pending_event_bookings || []).length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No bookings waiting for payment.
              </p>
            )}
            {(data?.pending_event_bookings || []).map((b: any) => (
              <div
                key={b.booking_id}
                className="rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{b.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {b.customer_name} · {b.event_date}
                    </p>
                    {b.location && (
                      <p className="text-xs text-muted-foreground truncate">{b.location}</p>
                    )}
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border-0 shrink-0">
                    Payment pending
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{money(b.total_amount)} due</p>
              </div>
            ))}
          </CardContent>
        </Card>
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

function WorkersSection() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [open, setOpen] = useState(false)
  const [addMode, setAddMode] = useState<"single" | "import">("single")
  const [parsing, setParsing] = useState(false)
  const [importFileName, setImportFileName] = useState<string | null>(null)
  const [draftRows, setDraftRows] = useState<WorkerDraftRow[]>([])
  const [bulkSaving, setBulkSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", position: "", employment_type: "permanent",
    event_rate: "", hourly_rate: "", department: "", gender: "", mobile_money: "",
  })

  const resetForm = () => setForm({
    full_name: "", phone: "", email: "", position: "", employment_type: "permanent",
    event_rate: "", hourly_rate: "", department: "", gender: "", mobile_money: "",
  })

  const closeDialog = () => {
    setOpen(false)
    setAddMode("single")
    setDraftRows([])
    setImportFileName(null)
    resetForm()
  }

  const { data, isLoading } = useQuery({
    queryKey: ["workforce-workers", typeFilter, search],
    queryFn: async () => {
      const res = await workforceApi.listWorkers({
        search: search || undefined,
        page_size: 100,
        ...(typeFilter !== "all" ? { employment_type: typeFilter } : {}),
      })
      return res.data?.items || []
    },
  })

  const createMut = useMutation({
    mutationFn: () => workforceApi.createWorker({
      ...form,
      event_rate: form.event_rate ? Number(form.event_rate) : undefined,
      hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : undefined,
      gender: form.gender || undefined,
      mobile_money: form.mobile_money || undefined,
      department: form.department || undefined,
    }),
    onSuccess: () => {
      toast.success("Worker added")
      closeDialog()
      qc.invalidateQueries({ queryKey: ["workforce-workers"] })
      qc.invalidateQueries({ queryKey: ["workforce-dashboard"] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed to add worker"),
  })

  const handleDownloadTemplate = () => {
    try {
      downloadWorkerTemplate()
      toast.success("Template downloaded")
    } catch {
      toast.error("Could not download template")
    }
  }

  const handleFileSelected = async (file?: File | null) => {
    if (!file) return
    setParsing(true)
    try {
      const rows = await parseWorkerExcel(file, "permanent")
      setDraftRows(rows.map((r) => ({
        ...r,
        employment_type: ALL_EMPLOYMENT_TYPES.includes(r.employment_type) ? r.employment_type : "permanent",
      })))
      setImportFileName(file.name)
      setAddMode("import")
      toast.success(`Loaded ${rows.length} row${rows.length === 1 ? "" : "s"} — review before saving`)
    } catch (err: any) {
      toast.error(err?.message || "Failed to read Excel file")
    } finally {
      setParsing(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const updateDraft = (key: string, field: keyof WorkerDraftRow, value: string) => {
    setDraftRows((prev) => prev.map((r) => (r._key === key ? { ...r, [field]: value } : r)))
  }

  const removeDraft = (key: string) => {
    setDraftRows((prev) => prev.filter((r) => r._key !== key))
  }

  const addBlankDraft = () => {
    setDraftRows((prev) => [...prev, createEmptyWorkerDraft({ employment_type: "permanent" })])
  }

  const saveBulk = async () => {
    const valid = draftRows.filter((r) => r.full_name.trim())
    if (!valid.length) {
      toast.error("Add at least one worker with a full name")
      return
    }
    setBulkSaving(true)
    let ok = 0
    const failures: string[] = []
    for (const row of valid) {
      try {
        await workforceApi.createWorker(draftToWorkerPayload(row))
        ok += 1
      } catch (e: any) {
        const detail = e?.response?.data?.detail
        failures.push(`${row.full_name}: ${typeof detail === "string" ? detail : "failed"}`)
      }
    }
    setBulkSaving(false)
    qc.invalidateQueries({ queryKey: ["workforce-workers"] })
    qc.invalidateQueries({ queryKey: ["workforce-dashboard"] })
    if (ok) toast.success(`Saved ${ok} worker${ok === 1 ? "" : "s"}`)
    if (failures.length) {
      toast.error(`${failures.length} failed. ${failures.slice(0, 2).join(" · ")}`)
    } else {
      closeDialog()
    }
    if (failures.length && ok) {
      // Keep failed rows so user can fix and retry
      const failedNames = new Set(failures.map((f) => f.split(":")[0]))
      setDraftRows((prev) => prev.filter((r) => failedNames.has(r.full_name) || !r.full_name.trim()))
    }
  }

  const workers = data || []

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            <TranslatedText text="Workforce" />
          </h2>
          <p className="text-sm text-muted-foreground">
            {workers.length} worker{workers.length === 1 ? "" : "s"} in your roster
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-44 rounded-xl bg-white dark:bg-slate-950">
              <SelectValue placeholder="Employment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {ALL_EMPLOYMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 rounded-xl bg-white dark:bg-slate-950"
              placeholder="Search by name, phone, code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" /> Template
            </Button>
            <Button
              onClick={() => { setOpen(true); setAddMode("single") }}
              className="rounded-xl bg-[#668c65] hover:bg-[#557554]"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Worker
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
      ) : workers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-950/40 px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#668c65]/15 text-[#668c65]">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="text-base font-semibold">No workers yet</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
            Add people one by one, or download the Excel template and import your full list.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline" className="rounded-xl" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" /> Download template
            </Button>
            <Button
              className="rounded-xl bg-[#668c65] hover:bg-[#557554]"
              onClick={() => { setOpen(true); setAddMode("import") }}
            >
              <Upload className="h-4 w-4 mr-2" /> Import Excel
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/90 dark:bg-slate-900/80 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Worker</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Position</th>
                  <th className="px-4 py-3 font-semibold">Rates</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w: any) => {
                  const initials = String(w.full_name || "?")
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((p: string) => p[0]?.toUpperCase() || "")
                    .join("")
                  return (
                    <tr key={w.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 shrink-0 rounded-full bg-[#668c65] text-white text-xs font-semibold flex items-center justify-center">
                            {initials || "?"}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-50">{w.full_name}</div>
                            <div className="text-xs text-muted-foreground">{w.employee_code} · {w.phone || w.email || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-300">{w.employment_type}</td>
                      <td className="px-4 py-3">{w.position || "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                        <div>Event: {money(w.event_rate, w.currency)}</div>
                        <div>Hourly: {money(w.hourly_rate, w.currency)}</div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={w.availability_status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : closeDialog())}>
        <DialogContent className={cn(
          "gap-0 p-0 overflow-hidden",
          addMode === "import" && draftRows.length > 0 ? "sm:max-w-5xl" : "sm:max-w-xl"
        )}>
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle>Add Worker</DialogTitle>
            <DialogDescription>
              Add permanent staff, freelancers, contractors, or volunteers — set employment type per person.
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 pt-4">
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 gap-1">
              <button
                type="button"
                onClick={() => setAddMode("single")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  addMode === "single" ? "bg-white dark:bg-slate-800 font-medium" : "text-muted-foreground"
                )}
              >
                Single entry
              </button>
              <button
                type="button"
                onClick={() => setAddMode("import")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors inline-flex items-center gap-1.5",
                  addMode === "import" ? "bg-white dark:bg-slate-800 font-medium" : "text-muted-foreground"
                )}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" /> Excel import
              </button>
            </div>
          </div>

          {addMode === "single" ? (
            <>
              <div className="px-5 py-4 grid gap-3 sm:grid-cols-2 max-h-[60vh] overflow-y-auto">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Full name *</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="e.g. Jane Uwase" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Employment type</Label>
                  <Select value={form.employment_type} onValueChange={(v) => setForm({ ...form, employment_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ALL_EMPLOYMENT_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <Select value={form.gender || "__none"} onValueChange={(v) => setForm({ ...form, gender: v === "__none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Not set</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Position / role</Label>
                  <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="e.g. Lead Dancer" />
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Event rate (RWF)</Label>
                  <Input type="number" value={form.event_rate} onChange={(e) => setForm({ ...form, event_rate: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Hourly rate (RWF)</Label>
                  <Input type="number" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Mobile money</Label>
                  <Input value={form.mobile_money} onChange={(e) => setForm({ ...form, mobile_money: e.target.value })} placeholder="Payment number" />
                </div>
              </div>
              <DialogFooter className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button disabled={!form.full_name || createMut.isPending} onClick={() => createMut.mutate()} className="bg-[#668c65] hover:bg-[#557554]">
                  {createMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#668c65]/15 text-[#668c65] flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Upload Excel list (.xlsx / .xls)</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Download the template, fill every column you need, then upload and edit before saving.
                        </p>
                        {importFileName && (
                          <p className="text-xs text-[#668c65] mt-1 font-medium">{importFileName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={handleDownloadTemplate}>
                        <Download className="h-3.5 w-3.5 mr-1.5" /> Template
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-lg bg-[#0d182b] hover:bg-[#16233a]"
                        disabled={parsing}
                        onClick={() => fileRef.current?.click()}
                      >
                        {parsing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                        {draftRows.length ? "Replace file" : "Upload file"}
                      </Button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        className="hidden"
                        onChange={(e) => handleFileSelected(e.target.files?.[0])}
                      />
                    </div>
                  </div>
                </div>

                {draftRows.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Pencil className="h-4 w-4 text-[#668c65]" />
                        <span className="font-medium">Review & edit list</span>
                        <Badge variant="secondary" className="rounded-md">{draftRows.length} rows</Badge>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={addBlankDraft}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add row
                      </Button>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs min-w-[1500px]">
                          <thead className="bg-slate-50 dark:bg-slate-900 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                            <tr>
                              <th className="px-2 py-2">Full name *</th>
                              <th className="px-2 py-2">Code</th>
                              <th className="px-2 py-2">Gender</th>
                              <th className="px-2 py-2">Phone</th>
                              <th className="px-2 py-2">Email</th>
                              <th className="px-2 py-2">Type</th>
                              <th className="px-2 py-2">Department</th>
                              <th className="px-2 py-2">Position</th>
                              <th className="px-2 py-2">Skills</th>
                              <th className="px-2 py-2">Event rate</th>
                              <th className="px-2 py-2">Hourly</th>
                              <th className="px-2 py-2">MoMo</th>
                              <th className="px-2 py-2">National ID</th>
                              <th className="px-2 py-2 w-10" />
                            </tr>
                          </thead>
                          <tbody>
                            {draftRows.map((row) => (
                              <tr key={row._key} className="border-t border-slate-100 dark:border-slate-800 align-top">
                                <td className="p-1.5">
                                  <Input className="h-8 text-xs" value={row.full_name} onChange={(e) => updateDraft(row._key, "full_name", e.target.value)} />
                                </td>
                                <td className="p-1.5">
                                  <Input className="h-8 text-xs" value={row.employee_code} onChange={(e) => updateDraft(row._key, "employee_code", e.target.value)} />
                                </td>
                                <td className="p-1.5">
                                  <Input className="h-8 text-xs" value={row.gender} onChange={(e) => updateDraft(row._key, "gender", e.target.value)} />
                                </td>
                                <td className="p-1.5">
                                  <Input className="h-8 text-xs" value={row.phone} onChange={(e) => updateDraft(row._key, "phone", e.target.value)} />
                                </td>
                                <td className="p-1.5">
                                  <Input className="h-8 text-xs" value={row.email} onChange={(e) => updateDraft(row._key, "email", e.target.value)} />
                                </td>
                                <td className="p-1.5">
                                  <Select
                                    value={ALL_EMPLOYMENT_TYPES.includes(row.employment_type) ? row.employment_type : "permanent"}
                                    onValueChange={(v) => updateDraft(row._key, "employment_type", v)}
                                  >
                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      {ALL_EMPLOYMENT_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize text-xs">{t.replace(/_/g, " ")}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="p-1.5">
                                  <Input className="h-8 text-xs" value={row.department} onChange={(e) => updateDraft(row._key, "department", e.target.value)} />
                                </td>
                                <td className="p-1.5">
                                  <Input className="h-8 text-xs" value={row.position} onChange={(e) => updateDraft(row._key, "position", e.target.value)} />
                                </td>
                                <td className="p-1.5">
                                  <Input className="h-8 text-xs" value={row.skills} onChange={(e) => updateDraft(row._key, "skills", e.target.value)} placeholder="comma separated" />
                                </td>
                                <td className="p-1.5">
                                  <Input className="h-8 text-xs" type="number" value={row.event_rate} onChange={(e) => updateDraft(row._key, "event_rate", e.target.value)} />
                                </td>
                                <td className="p-1.5">
                                  <Input className="h-8 text-xs" type="number" value={row.hourly_rate} onChange={(e) => updateDraft(row._key, "hourly_rate", e.target.value)} />
                                </td>
                                <td className="p-1.5">
                                  <Input className="h-8 text-xs" value={row.mobile_money} onChange={(e) => updateDraft(row._key, "mobile_money", e.target.value)} />
                                </td>
                                <td className="p-1.5">
                                  <Input className="h-8 text-xs" value={row.national_id} onChange={(e) => updateDraft(row._key, "national_id", e.target.value)} />
                                </td>
                                <td className="p-1.5">
                                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => removeDraft(row._key)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Address, emergency contacts, hire date, bank details, and notes from the Excel file are preserved and saved with each row.
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 gap-2">
                <Button variant="outline" onClick={closeDialog} disabled={bulkSaving}>Cancel</Button>
                <Button
                  disabled={!draftRows.some((r) => r.full_name.trim()) || bulkSaving}
                  onClick={saveBulk}
                  className="bg-[#668c65] hover:bg-[#557554]"
                >
                  {bulkSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save {draftRows.filter((r) => r.full_name.trim()).length || ""} to system
                </Button>
              </DialogFooter>
            </>
          )}
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
  const [leaderToAdd, setLeaderToAdd] = useState("")
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([])
  const [roleLabel, setRoleLabel] = useState("")
  const [workerSearch, setWorkerSearch] = useState("")

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["workforce-events"],
    queryFn: async () => (await workforceApi.listEvents({ page_size: 50 })).data,
  })
  const events = eventsData?.items || []

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["workforce-dashboard"],
    queryFn: async () => (await workforceApi.dashboard()).data,
    enabled: mode === "assignments",
  })
  const pendingBookings = dashboardData?.pending_event_bookings || []

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["workforce-event", selectedEventId],
    queryFn: async () => selectedEventId ? (await workforceApi.getEvent(selectedEventId)).data : null,
    enabled: !!selectedEventId,
  })

  const { data: workers = [] } = useQuery({
    queryKey: ["workforce-workers-all"],
    queryFn: async () => (await workforceApi.listWorkers({ page_size: 100, is_active: true })).data?.items || [],
  })

  const { data: searchableWorkers = [] } = useQuery({
    queryKey: ["workforce-workers-assign", workerSearch],
    queryFn: async () => (await workforceApi.listWorkers({
      page_size: 100,
      is_active: true,
      search: workerSearch.trim() || undefined,
    })).data?.items || [],
  })

  const assignLeaderMut = useMutation({
    mutationFn: () => workforceApi.assignLeader(selectedEventId!, { team_leader_id: leaderToAdd }),
    onSuccess: (res) => {
      toast.success("Team leader added")
      setLeaderToAdd("")
      qc.invalidateQueries({ queryKey: ["workforce-event", selectedEventId] })
      qc.invalidateQueries({ queryKey: ["workforce-events"] })
      const leaders = res.data?.team_leaders || []
      const added = leaders.find((l: any) => l.share_url)
      if (added?.share_url) {
        navigator.clipboard.writeText(added.share_url).catch(() => {})
        toast.message("Share link copied", {
          description: `Send this link to ${added.worker_name} so they can assign the crew.`,
        })
      }
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed"),
  })

  const removeLeaderMut = useMutation({
    mutationFn: (workerId: string) => workforceApi.removeLeader(selectedEventId!, workerId),
    onSuccess: () => {
      toast.success("Team leader removed")
      qc.invalidateQueries({ queryKey: ["workforce-event", selectedEventId] })
      qc.invalidateQueries({ queryKey: ["workforce-events"] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed to remove leader"),
  })

  const shareLinkMut = useMutation({
    mutationFn: (workerId: string) => workforceApi.getLeaderShareLink(selectedEventId!, workerId),
    onSuccess: async (res) => {
      const url = res.data?.share_url
      if (!url) {
        toast.error("Could not generate link")
        return
      }
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Leader link copied — share it so they can assign workers")
      } catch {
        toast.success("Link ready", { description: url })
      }
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed to generate link"),
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

  const confirmedEvents = useMemo(() => {
    if (mode !== "assignments") return scheduleEvents
    return events.filter((e: any) => e.payment_status !== "pending")
  }, [events, mode, scheduleEvents])

  const renderEventItem = (e: any) => (
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
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{e.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {e.customer_name ? `${e.customer_name} · ` : ""}{e.event_date} · {e.location || "No location"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {e.payment_status === "paid" && (
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 border-0">
              Paid
            </Badge>
          )}
          <StatusBadge status={e.status} />
        </div>
      </div>
    </button>
  )

  const renderPendingBookingItem = (b: any) => (
    <div
      key={b.booking_id}
      className="rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{b.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {b.customer_name} · {b.event_date} · {b.location || "No location"}
          </p>
        </div>
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border-0 shrink-0">
          Payment pending
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{money(b.total_amount)} due</p>
    </div>
  )

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="rounded-2xl lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">
            {mode === "schedules" ? "Upcoming Schedule" : mode === "assignments" ? "Event Assignments" : "Confirmed Events"}
          </CardTitle>
          <CardDescription>
            {mode === "assignments"
              ? "Assign teams to paid bookings. Pending payment bookings cannot be staffed yet."
              : "Created automatically when bookings are paid & confirmed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[560px] overflow-y-auto">
          {mode === "assignments" ? (
            <>
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Confirmed Events
                </p>
                {(isLoading || dashboardLoading) && <Skeleton className="h-20 rounded-xl" />}
                {!isLoading && !dashboardLoading && confirmedEvents.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No confirmed bookings yet. Events appear here after customer payment.
                  </p>
                )}
                {confirmedEvents.map(renderEventItem)}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Pending Events
                </p>
                {!dashboardLoading && pendingBookings.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No bookings waiting for payment.
                  </p>
                )}
                {pendingBookings.map(renderPendingBookingItem)}
              </div>
            </>
          ) : (
            <>
              {isLoading && <Skeleton className="h-20 rounded-xl" />}
              {!isLoading && scheduleEvents.length === 0 && (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No workforce events yet. Confirm a booking payment to create one.
                </p>
              )}
              {scheduleEvents.map(renderEventItem)}
            </>
          )}
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
                    <p className="text-sm font-medium">1. Assign Team Leaders</p>
                    <p className="text-xs text-muted-foreground">
                      Add one or more leaders to this event. The same leader can lead multiple events.
                    </p>

                    {(detail.team_leaders || []).length > 0 && (
                      <div className="space-y-2">
                        {(detail.team_leaders || []).map((leader: any) => (
                          <div
                            key={leader.worker_id}
                            className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {leader.worker_name}
                                {leader.is_primary && (
                                  <Badge variant="secondary" className="ml-2 text-[10px] rounded-md">Primary</Badge>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {leader.position || leader.employment_type}
                                {leader.worker_phone ? ` · ${leader.worker_phone}` : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-lg h-8 text-xs"
                                disabled={shareLinkMut.isPending}
                                onClick={() => shareLinkMut.mutate(leader.worker_id)}
                              >
                                <Link2 className="h-3.5 w-3.5 mr-1" />
                                Copy link
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="shrink-0 text-muted-foreground hover:text-red-600"
                                disabled={removeLeaderMut.isPending}
                                onClick={() => removeLeaderMut.mutate(leader.worker_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select value={leaderToAdd || "none"} onValueChange={(v) => setLeaderToAdd(v === "none" ? "" : v)}>
                        <SelectTrigger className="sm:flex-1"><SelectValue placeholder="Select leader to add" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select leader…</SelectItem>
                          {workers
                            .filter((w: any) => !(detail.team_leaders || []).some((l: any) => l.worker_id === w.id))
                            .map((w: any) => (
                              <SelectItem key={w.id} value={w.id}>{w.full_name} ({w.position || w.employment_type})</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        disabled={!leaderToAdd || assignLeaderMut.isPending}
                        onClick={() => assignLeaderMut.mutate()}
                        className="bg-[#668c65] hover:bg-[#557554]"
                      >
                        Add Leader
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border p-4 space-y-3">
                    <p className="text-sm font-medium">2. Team Leader selects workers</p>
                    <Input placeholder="Role for selected (e.g. Lead Dancer)" value={roleLabel} onChange={(e) => setRoleLabel(e.target.value)} />
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9 rounded-lg"
                        placeholder="Search by name, role, phone, or employee code…"
                        value={workerSearch}
                        onChange={(e) => setWorkerSearch(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
                      <span>
                        {searchableWorkers.length} worker{searchableWorkers.length === 1 ? "" : "s"}
                        {workerSearch.trim() ? ` matching “${workerSearch.trim()}”` : " available"}
                      </span>
                      {selectedWorkers.length > 0 && (
                        <span className="font-medium text-[#668c65]">{selectedWorkers.length} selected</span>
                      )}
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
                      {searchableWorkers.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-6">
                          {workerSearch.trim()
                            ? `No workers found for “${workerSearch.trim()}”.`
                            : "No active workers in your roster yet."}
                        </p>
                      )}
                      {searchableWorkers.map((w: any) => {
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
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium block truncate">{w.full_name}</span>
                              <span className="text-xs text-muted-foreground truncate block">
                                {[w.position, w.employee_code, w.phone].filter(Boolean).join(" · ") || w.employment_type}
                              </span>
                            </div>
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

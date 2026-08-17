"use client"

import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Loader2, Search, Plus,
  Download, Upload, Trash2, FileSpreadsheet, Pencil,
} from "lucide-react"
import { workforceApi } from "@/lib/api/workforce"
import { PayrollSection } from "@/components/provider/workforce-payroll-section"
import { EventsSection } from "@/components/provider/workforce-events-section"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { TranslatedText } from "@/components/translated-text"
import { DataTable, EmptyRow, PageCanvas, QuietStatus, SectionHead, TBody, THead, TablePager, Td, Th, useDebounced } from "@/components/provider/workforce-ui"

type Section =
  | "dashboard" | "employees" | "teams"
  | "assignments" | "schedules" | "attendance" | "payroll"
  | "commissions" | "leave" | "performance" | "documents"
  | "reports" | "settings"

type Group = "overview" | "people" | "events" | "pay" | "records"

const GROUPS: { id: Group; label: string; sections: { id: Section; label: string }[] }[] = [
  { id: "overview", label: "Overview", sections: [{ id: "dashboard", label: "Overview" }] },
  {
    id: "people",
    label: "People",
    sections: [
      { id: "employees", label: "Roster" },
      { id: "teams", label: "Teams" },
    ],
  },
  {
    id: "events",
    label: "Events",
    sections: [
      { id: "assignments", label: "Staff" },
      { id: "schedules", label: "Schedule" },
      { id: "attendance", label: "Attendance" },
    ],
  },
  {
    id: "pay",
    label: "Pay",
    sections: [
      { id: "payroll", label: "Payroll" },
      { id: "commissions", label: "Rates" },
    ],
  },
  {
    id: "records",
    label: "Records",
    sections: [
      { id: "leave", label: "Leave" },
      { id: "performance", label: "Performance" },
      { id: "documents", label: "Documents" },
      { id: "reports", label: "Reports" },
      { id: "settings", label: "Settings" },
    ],
  },
]

const EMPLOYMENT_EMPLOYEE = ["permanent", "intern", "seasonal"]
const EMPLOYMENT_FREELANCE = ["freelancer", "contractor", "volunteer"]
const ALL_EMPLOYMENT_TYPES = [...EMPLOYMENT_EMPLOYEE, ...EMPLOYMENT_FREELANCE]

function money(n?: number | null, currency = "RWF") {
  if (n == null) return "—"
  return `${Number(n).toLocaleString()} ${currency}`
}

export function WorkforcePayroll() {
  const [section, setSection] = useState<Section>("dashboard")
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const activeGroup = GROUPS.find((g) => g.sections.some((s) => s.id === section)) || GROUPS[0]
  const showSubnav = activeGroup.sections.length > 1

  const openGroup = (group: (typeof GROUPS)[number]) => {
    setSection(group.sections[0].id)
    if (group.id !== "events") setSelectedEventId(null)
  }

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl bg-[#fcfbf9] dark:bg-background px-4 py-5 sm:px-6 sm:py-6">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#668c65] font-medium mb-1.5">
          <TranslatedText text="Business Setup" />
        </p>
        <h1 className="font-serif text-3xl sm:text-[2.15rem] font-medium tracking-tight text-[#0d182b] dark:text-white leading-none">
          <TranslatedText text="Workforce & Payroll" />
        </h1>
        <p className="text-sm text-[#6b7368] dark:text-slate-400 mt-2.5 max-w-xl leading-relaxed">
          <TranslatedText text="Staff events as they happen. Pay workers later by summing all unpaid attendance into one list you can edit before approval." />
        </p>
      </div>

      <div
        className="mt-6 flex gap-0 overflow-x-auto scrollbar-hide scroll-smooth border-b border-[#e6e1d6] dark:border-border"
        role="tablist"
        aria-label="Workforce areas"
      >
        {GROUPS.map((group) => (
          <button
            key={group.id}
            type="button"
            role="tab"
            aria-selected={activeGroup.id === group.id}
            onClick={() => openGroup(group)}
            className={cn(
              "whitespace-nowrap px-4 py-2.5 text-sm min-h-10 flex-shrink-0 border-b-2 -mb-px",
              activeGroup.id === group.id
                ? "border-[#668c65] text-[#0d182b] dark:text-white font-medium"
                : "border-transparent text-[#7a8474] dark:text-slate-400 hover:text-[#0d182b] dark:hover:text-white"
            )}
          >
            <TranslatedText text={group.label} />
          </button>
        ))}
      </div>

      {showSubnav && (
        <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label={activeGroup.label}>
          {activeGroup.sections.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={section === item.id}
              onClick={() => setSection(item.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm",
                section === item.id
                  ? "bg-[#0d182b] text-white"
                  : "bg-[#f0ece3] text-[#5c6558] hover:bg-[#e6e1d6] dark:bg-slate-800 dark:text-slate-300"
              )}
            >
              <TranslatedText text={item.label} />
            </button>
          ))}
        </div>
      )}

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
    return <PageCanvas><div className="h-36 rounded-xl bg-white dark:bg-slate-950" /></PageCanvas>
  }

  const statusRows = [
    {
      area: "People",
      now: `${data?.total_workforce ?? 0} in roster · ${data?.available_workers ?? 0} available`,
    },
    {
      area: "Events",
      now: `${data?.confirmed_events ?? 0} confirmed · ${data?.todays_schedule ?? 0} today · ${data?.pending_payment_events ?? 0} waiting for payment`,
    },
    {
      area: "Pay",
      now: `${data?.unpaid_payroll_workers ?? 0} unpaid workers · ${data?.payroll_pending_approval ?? 0} lists pending`,
    },
    {
      area: "Money",
      now: `${money(data?.total_revenue)} revenue · ${money(data?.total_payroll_cost)} payroll`,
    },
  ]

  return (
    <PageCanvas className="space-y-8">
      <div>
        <SectionHead title="Where things stand" hint="Open People, Events, or Pay to work on a row." />
        <DataTable minWidth="520px">
          <THead>
            <Th>Area</Th>
            <Th>Now</Th>
          </THead>
          <TBody>
            {statusRows.map((row) => (
              <tr key={row.area}>
                <Td className="font-medium">{row.area}</Td>
                <Td className="text-[#6b7368]">{row.now}</Td>
              </tr>
            ))}
          </TBody>
        </DataTable>
      </div>

      <div>
        <SectionHead title="Events to staff" hint="Open a paid booking to assign a leader and crew." />
        <DataTable minWidth="640px">
          <THead>
            <Th>Event</Th>
            <Th>Client</Th>
            <Th>Date</Th>
            <Th>Location</Th>
            <Th align="right">Amount</Th>
            <Th>Status</Th>
          </THead>
          <TBody>
            {(data?.confirmed_event_bookings || []).length === 0 && (
              <EmptyRow cols={6} text="No confirmed bookings yet." />
            )}
            {(data?.confirmed_event_bookings || []).slice(0, 12).map((b: any) => (
              <tr
                key={b.booking_id}
                className={b.workforce_event_id ? "cursor-pointer" : ""}
                onClick={() => b.workforce_event_id && onOpenEvent(b.workforce_event_id)}
              >
                <Td className="font-medium">{b.title}</Td>
                <Td className="text-[#6b7368]">{b.customer_name || "—"}</Td>
                <Td className="whitespace-nowrap text-[#6b7368]">{b.event_date}</Td>
                <Td className="text-[#6b7368]">{b.location || "—"}</Td>
                <Td align="right" className="tabular-nums">{money(b.total_amount)}</Td>
                <Td><QuietStatus status={b.workforce_status || "paid"} /></Td>
              </tr>
            ))}
          </TBody>
        </DataTable>
      </div>
    </PageCanvas>
  )
}


function WorkersSection() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
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

  const debouncedSearch = useDebounced(search)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, typeFilter])

  const { data, isLoading } = useQuery({
    queryKey: ["workforce-workers", typeFilter, debouncedSearch, page],
    queryFn: async () => (await workforceApi.listWorkers({
      search: debouncedSearch.trim() || undefined,
      page,
      page_size: 12,
      ...(typeFilter !== "all" ? { employment_type: typeFilter } : {}),
    })).data,
  })
  const workers = data?.items || []
  const workersTotal = data?.total || 0

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

  return (
    <PageCanvas>
      <SectionHead
        title="Workforce"
        hint={`${workersTotal} worker${workersTotal === 1 ? "" : "s"} in your roster`}
        actions={
          <>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-44 h-9 rounded-xl bg-white dark:bg-slate-950 border-0">
                <SelectValue placeholder="Employment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {ALL_EMPLOYMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9 h-9 rounded-xl bg-white dark:bg-slate-950 border-0"
                placeholder="Search name, phone, code"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="rounded-xl border-0 bg-white dark:bg-slate-950" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" /> Template
            </Button>
            <Button
              onClick={() => { setOpen(true); setAddMode("single") }}
              className="rounded-xl bg-[#668c65] hover:bg-[#557554]"
            >
              <Plus className="h-4 w-4 mr-2" /> Add worker
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="h-36 rounded-xl bg-white dark:bg-slate-950" />
      ) : (
        <>
          <DataTable minWidth="720px" maxHeight="480px">
            <THead>
              <Th>Worker</Th>
              <Th>Type</Th>
              <Th>Position</Th>
              <Th>Event rate</Th>
              <Th>Hourly</Th>
              <Th>Status</Th>
            </THead>
            <TBody>
              {workers.length === 0 && (
                <EmptyRow cols={6} text={debouncedSearch ? "No workers match that search." : "No workers yet. Add one person or import Excel."} />
              )}
              {workers.map((w: any) => (
                <tr key={w.id}>
                  <Td>
                    <div className="font-medium">{w.full_name}</div>
                    <div className="text-xs text-slate-500">{w.employee_code}{w.phone ? ` · ${w.phone}` : ""}</div>
                  </Td>
                  <Td className="capitalize text-slate-500">{(w.employment_type || "").replace(/_/g, " ")}</Td>
                  <Td>{w.position || "—"}</Td>
                  <Td className="tabular-nums whitespace-nowrap">{money(w.event_rate, w.currency)}</Td>
                  <Td className="tabular-nums whitespace-nowrap">{money(w.hourly_rate, w.currency)}</Td>
                  <Td><QuietStatus status={w.availability_status} /></Td>
                </tr>
              ))}
            </TBody>
          </DataTable>
          <TablePager page={page} pageSize={12} total={workersTotal} onPage={setPage} />
        </>
      )}

      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : closeDialog())}>
        <DialogContent className={cn(
          "gap-0 p-0 overflow-hidden max-h-[90vh] w-[95vw] max-w-none rounded-2xl shadow-none sm:max-w-xl",
          addMode === "import" && draftRows.length > 0 ? "sm:max-w-6xl sm:w-[90vw]" : "sm:max-w-xl sm:w-full"
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
                  "rounded-xl px-3 py-1.5 text-sm transition-colors",
                  addMode === "single" ? "bg-white dark:bg-slate-800 font-medium" : "text-muted-foreground"
                )}
              >
                Single entry
              </button>
              <button
                type="button"
                onClick={() => setAddMode("import")}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-sm transition-colors inline-flex items-center gap-1.5",
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
                      <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={handleDownloadTemplate}>
                        <Download className="h-3.5 w-3.5 mr-1.5" /> Template
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-xl bg-[#0d182b] hover:bg-[#16233a]"
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
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-900 text-left text-[11px] uppercase tracking-wider text-slate-400">
                            <tr>
                              <th className="px-2 py-2 min-w-[120px]">Full name *</th>
                              <th className="px-2 py-2 min-w-[80px]">Code</th>
                              <th className="px-2 py-2 min-w-[70px]">Gender</th>
                              <th className="px-2 py-2 min-w-[100px]">Phone</th>
                              <th className="px-2 py-2 min-w-[120px]">Email</th>
                              <th className="px-2 py-2 min-w-[100px]">Type</th>
                              <th className="px-2 py-2 min-w-[100px]">Department</th>
                              <th className="px-2 py-2 min-w-[100px]">Position</th>
                              <th className="px-2 py-2 min-w-[100px]">Skills</th>
                              <th className="px-2 py-2 min-w-[80px]">Event rate</th>
                              <th className="px-2 py-2 min-w-[80px]">Hourly</th>
                              <th className="px-2 py-2 min-w-[80px]">MoMo</th>
                              <th className="px-2 py-2 min-w-[100px]">National ID</th>
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
    </PageCanvas>
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
    <PageCanvas>
      <SectionHead
        title="Teams"
        hint="Group people by craft, then assign a leader per event."
        actions={
          <Button onClick={() => setOpen(true)} className="bg-[#668c65] hover:bg-[#557554] rounded-xl">
            <Plus className="h-4 w-4 mr-2" /> New team
          </Button>
        }
      />
      {isLoading ? (
        <div className="h-36 rounded-xl bg-white dark:bg-slate-950" />
      ) : (
        <DataTable minWidth="560px">
          <THead>
            <Th>Team</Th>
            <Th>Type</Th>
            <Th>Members</Th>
            <Th>Skills</Th>
          </THead>
          <TBody>
            {teams.length === 0 && <EmptyRow cols={4} text="No teams yet." />}
            {teams.map((t: any) => (
              <tr key={t.id}>
                <Td className="font-medium">{t.name}</Td>
                <Td className="capitalize text-slate-500">{(t.team_type || "custom").replace(/_/g, " ")}</Td>
                <Td className="tabular-nums">{t.member_count || 0}</Td>
                <Td className="text-slate-500">{(t.skills || []).slice(0, 4).join(", ") || "—"}</Td>
              </tr>
            ))}
          </TBody>
        </DataTable>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl shadow-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 rounded-xl" /></div>
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
            <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!name || createMut.isPending} onClick={() => createMut.mutate()} className="bg-[#668c65] hover:bg-[#557554] rounded-xl">
              {createMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageCanvas>
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
    <PageCanvas className="space-y-6">
      <div>
        <SectionHead
          title="Role rates"
          hint="Default pay by role, e.g. Lead dancer 35,000 RWF."
          actions={
            <>
              <Input placeholder="Role name" value={roleName} onChange={(e) => setRoleName(e.target.value)} className="w-40 h-9 rounded-xl border-0 bg-white dark:bg-slate-950" />
              <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-28 h-9 rounded-xl border-0 bg-white dark:bg-slate-950" />
              <Button
                className="bg-[#668c65] hover:bg-[#557554] rounded-xl"
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
            </>
          }
        />
        <DataTable minWidth="420px">
          <THead>
            <Th>Role</Th>
            <Th align="right">Amount</Th>
          </THead>
          <TBody>
            {rates.length === 0 && <EmptyRow cols={2} text="No role rates yet." />}
            {rates.map((r: any) => (
              <tr key={r.id}>
                <Td className="font-medium">{r.role_name}</Td>
                <Td align="right" className="tabular-nums">{money(r.amount, r.currency)}</Td>
              </tr>
            ))}
          </TBody>
        </DataTable>
      </div>

      <div>
        <SectionHead
          title="Commission plans"
          hint="Team share of contract revenue, split among assigned workers."
          actions={
            <>
              <Input placeholder="Plan name" value={planName} onChange={(e) => setPlanName(e.target.value)} className="w-40 h-9 rounded-xl border-0 bg-white dark:bg-slate-950" />
              <Input type="number" placeholder="% share" value={share} onChange={(e) => setShare(e.target.value)} className="w-24 h-9 rounded-xl border-0 bg-white dark:bg-slate-950" />
              <Button
                className="bg-[#0d182b] rounded-xl"
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
            </>
          }
        />
        <DataTable minWidth="420px">
          <THead>
            <Th>Plan</Th>
            <Th>Share</Th>
            <Th>Split</Th>
          </THead>
          <TBody>
            {plans.length === 0 && <EmptyRow cols={3} text="No commission plans yet." />}
            {plans.map((p: any) => (
              <tr key={p.id}>
                <Td className="font-medium">{p.name}</Td>
                <Td className="tabular-nums">{p.team_share_percent}%</Td>
                <Td className="capitalize text-slate-500">{p.distribution_rule}</Td>
              </tr>
            ))}
          </TBody>
        </DataTable>
      </div>
    </PageCanvas>
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
    <PageCanvas className="space-y-6">
      <SectionHead title="Leave" hint="Request time off, then approve or reject from the list." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select value={workerId || "none"} onValueChange={(v) => setWorkerId(v === "none" ? "" : v)}>
          <SelectTrigger className="h-9 rounded-xl border-0 bg-white dark:bg-slate-950"><SelectValue placeholder="Worker" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select worker</SelectItem>
            {workers.map((w: any) => <SelectItem key={w.id} value={w.id}>{w.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="h-9 rounded-xl border-0 bg-white dark:bg-slate-950" />
        <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="h-9 rounded-xl border-0 bg-white dark:bg-slate-950" />
        <Input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} className="h-9 rounded-xl border-0 bg-white dark:bg-slate-950" />
        <Button
          className="bg-[#668c65] hover:bg-[#557554] rounded-xl"
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
      </div>
      <DataTable minWidth="640px">
        <THead>
          <Th>Worker</Th>
          <Th>Dates</Th>
          <Th>Reason</Th>
          <Th>Status</Th>
          <Th align="right">Actions</Th>
        </THead>
        <TBody>
          {leave.length === 0 && <EmptyRow cols={5} text="No leave requests." />}
          {leave.map((l: any) => (
            <tr key={l.id}>
              <Td className="font-medium">{l.worker_name}</Td>
              <Td className="whitespace-nowrap text-slate-500">{l.start_date} → {l.end_date}</Td>
              <Td className="text-slate-500">{l.reason || "—"}</Td>
              <Td><QuietStatus status={l.status} /></Td>
              <Td align="right">
                {l.status === "pending" && (
                  <div className="inline-flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-xl border-0 bg-white dark:bg-slate-900" onClick={async () => {
                      await workforceApi.reviewLeave(l.id, true)
                      toast.success("Approved"); qc.invalidateQueries({ queryKey: ["workforce-leave"] })
                    }}>Approve</Button>
                    <Button size="sm" variant="ghost" onClick={async () => {
                      await workforceApi.reviewLeave(l.id, false)
                      toast.success("Rejected"); qc.invalidateQueries({ queryKey: ["workforce-leave"] })
                    }}>Reject</Button>
                  </div>
                )}
              </Td>
            </tr>
          ))}
        </TBody>
      </DataTable>
    </PageCanvas>
  )
}

function PerformanceSection() {
  const { data = [] } = useQuery({
    queryKey: ["workforce-performance"],
    queryFn: async () => (await workforceApi.listPerformance()).data || [],
  })
  return (
    <PageCanvas>
      <SectionHead title="Performance" hint="Scores roll up into each worker profile." />
      <DataTable minWidth="520px">
        <THead>
          <Th>Worker</Th>
          <Th>Comments</Th>
          <Th align="right">Score</Th>
        </THead>
        <TBody>
          {data.length === 0 && <EmptyRow cols={3} text="No reviews yet." />}
          {data.map((r: any) => (
            <tr key={r.id}>
              <Td className="font-medium">{r.worker_name}</Td>
              <Td className="text-slate-500">{r.comments || "—"}</Td>
              <Td align="right" className="tabular-nums">{r.score}/100</Td>
            </tr>
          ))}
        </TBody>
      </DataTable>
    </PageCanvas>
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
    <PageCanvas className="space-y-6">
      <SectionHead
        title="Documents"
        hint="Store a file URL from your existing upload storage."
        actions={
          <>
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-40 h-9 rounded-xl border-0 bg-white dark:bg-slate-950" />
            <Input placeholder="File URL" value={url} onChange={(e) => setUrl(e.target.value)} className="w-56 h-9 rounded-xl border-0 bg-white dark:bg-slate-950" />
            <Button
              className="bg-[#668c65] hover:bg-[#557554] rounded-xl"
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
          </>
        }
      />
      <DataTable minWidth="480px">
        <THead>
          <Th>Title</Th>
          <Th>Type</Th>
          <Th align="right">File</Th>
        </THead>
        <TBody>
          {data.length === 0 && <EmptyRow cols={3} text="No documents yet." />}
          {data.map((d: any) => (
            <tr key={d.id}>
              <Td className="font-medium">{d.title}</Td>
              <Td className="text-slate-500">{d.doc_type}</Td>
              <Td align="right">
                <a href={d.file_url} target="_blank" rel="noreferrer" className="text-[#668c65]">Open</a>
              </Td>
            </tr>
          ))}
        </TBody>
      </DataTable>
    </PageCanvas>
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
    <PageCanvas className="space-y-6">
      <SectionHead title="Reports" hint="Open a report in the table below, or download CSV." />
      <DataTable minWidth="480px">
        <THead>
          <Th>Report</Th>
          <Th align="right">Actions</Th>
        </THead>
        <TBody>
          {types.map((t) => (
            <tr key={t}>
              <Td className="font-medium capitalize">{t.replace(/_/g, " ")}</Td>
              <Td align="right">
                <div className="inline-flex gap-2">
                  <Button size="sm" variant="outline" disabled={loading} onClick={() => run(t)} className="rounded-xl border-0 bg-white dark:bg-slate-900">
                    {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} View
                  </Button>
                  <Button size="sm" className="bg-[#0d182b] hover:bg-[#15233a] rounded-xl" disabled={loading} onClick={() => run(t, "csv")}>CSV</Button>
                </div>
              </Td>
            </tr>
          ))}
        </TBody>
      </DataTable>
      {report && (
        <pre className="text-xs overflow-auto max-h-96 bg-white dark:bg-slate-950 p-4 rounded-xl">
          {JSON.stringify(report.data, null, 2)}
        </pre>
      )}
    </PageCanvas>
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

  if (isLoading || !current) return <PageCanvas><div className="h-36 rounded-xl bg-white dark:bg-slate-950" /></PageCanvas>

  return (
    <PageCanvas>
      <SectionHead title="Settings" hint="Currency, overtime, tax, and payroll rules." />
      <DataTable minWidth="520px">
        <THead>
          <Th>Setting</Th>
          <Th>Value</Th>
        </THead>
        <TBody>
          <tr>
            <Td>Default currency</Td>
            <Td>
              <Input
                className="max-w-xs h-9 rounded-xl border-0 bg-white dark:bg-slate-900"
                value={current.default_currency}
                onChange={(e) => setForm({ ...current, default_currency: e.target.value })}
              />
            </Td>
          </tr>
          <tr>
            <Td>Timezone</Td>
            <Td>
              <Input
                className="max-w-xs h-9 rounded-xl border-0 bg-white dark:bg-slate-900"
                value={current.default_timezone}
                onChange={(e) => setForm({ ...current, default_timezone: e.target.value })}
              />
            </Td>
          </tr>
          <tr>
            <Td>Overtime multiplier</Td>
            <Td>
              <Input
                type="number"
                step="0.1"
                className="max-w-xs h-9 rounded-xl border-0 bg-white dark:bg-slate-900"
                value={current.overtime_multiplier}
                onChange={(e) => setForm({ ...current, overtime_multiplier: Number(e.target.value) })}
              />
            </Td>
          </tr>
          <tr>
            <Td>Tax rate %</Td>
            <Td>
              <Input
                type="number"
                className="max-w-xs h-9 rounded-xl border-0 bg-white dark:bg-slate-900"
                value={current.tax_rate_percent}
                onChange={(e) => setForm({ ...current, tax_rate_percent: Number(e.target.value) })}
              />
            </Td>
          </tr>
          <tr>
            <Td>Auto-create event on booking confirm</Td>
            <Td>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#668c65]"
                checked={!!current.auto_create_event_on_booking_confirm}
                onChange={(e) => setForm({ ...current, auto_create_event_on_booking_confirm: e.target.checked })}
              />
            </Td>
          </tr>
          <tr>
            <Td>Require approved attendance for payroll</Td>
            <Td>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#668c65]"
                checked={!!current.require_attendance_for_payroll}
                onChange={(e) => setForm({ ...current, require_attendance_for_payroll: e.target.checked })}
              />
            </Td>
          </tr>
          <tr>
            <Td>Allow double-booking override</Td>
            <Td>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#668c65]"
                checked={!!current.allow_double_booking_override}
                onChange={(e) => setForm({ ...current, allow_double_booking_override: e.target.checked })}
              />
            </Td>
          </tr>
        </TBody>
      </DataTable>
      <div className="mt-5">
        <Button
          className="bg-[#668c65] hover:bg-[#557554] rounded-xl"
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
          Save settings
        </Button>
      </div>
    </PageCanvas>
  )
}

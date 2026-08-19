"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  ChevronDown, Pencil, Check, X,
  Loader2, Ban, Search, Smartphone,
} from "lucide-react"
import { workforceApi } from "@/lib/api/workforce"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { TranslatedText } from "@/components/translated-text"
import { DataTable, EmptyRow, PageCanvas, QuietStatus, SectionHead, TBody, THead, TablePager, Td, Th } from "@/components/provider/workforce-ui"

const LIST_PAGE_SIZE = 12

type PayrollTab = "ready" | "runs"

function money(n?: number | null, currency = "RWF") {
  if (n == null) return "—"
  return `${Number(n).toLocaleString()} ${currency}`
}

function workerEvents(item: any): any[] {
  return Array.isArray(item?.events) ? item.events : []
}

function workerEventCount(item: any): number {
  return Number(item?.event_count || workerEvents(item).length || 0)
}

function workerPhone(item: any): string {
  return item?.worker_phone || item?.payout_msisdn_masked || "—"
}

function formatEventName(ev: any): string {
  const title = ev?.event_title || "Event"
  return ev?.event_date ? `${title} · ${ev.event_date}` : title
}

function isPreApproval(status?: string) {
  return ["draft", "under_review", "recommended"].includes(status || "")
}

function eventPayForNet(item: any, nextNet: number) {
  const currentNet = Number(item?.net_pay || 0)
  const currentEventPay = Number(item?.event_pay ?? 0)
  return Math.max(0, currentEventPay + (Number(nextNet) - currentNet))
}

function EditableAmount({
  value,
  currency,
  disabled,
  onSave,
}: {
  value?: number | null
  currency: string
  disabled?: boolean
  onSave: (n: number) => Promise<void>
}) {
  const [draft, setDraft] = useState(String(value ?? 0))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(String(value ?? 0))
  }, [value])

  if (disabled) {
    return <span className="tabular-nums font-semibold">{money(value, currency)}</span>
  }

  const commit = async () => {
    const n = Number(draft)
    if (!Number.isFinite(n) || n < 0) {
      setDraft(String(value ?? 0))
      return
    }
    if (n === Number(value || 0)) return
    setSaving(true)
    try {
      await onSave(n)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not save amount")
      setDraft(String(value ?? 0))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="inline-flex items-center justify-end gap-1">
      <Input
        type="number"
        min="0"
        step="1"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur() }}
        className="h-8 w-[7.5rem] rounded-lg border-0 bg-white dark:bg-slate-950 text-right tabular-nums font-semibold"
        aria-label="Amount to pay"
      />
      <span className="text-xs text-slate-500">{currency}</span>
      {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
    </div>
  )
}

function EditablePhone({
  value,
  disabled,
  onSave,
}: {
  value?: string | null
  disabled?: boolean
  onSave: (phone: string) => Promise<void>
}) {
  const [draft, setDraft] = useState(value || "")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(value || "")
  }, [value])

  if (disabled) {
    return <span className="tabular-nums text-slate-600">{value || "—"}</span>
  }

  const commit = async () => {
    const next = draft.trim()
    if (next === (value || "").trim()) return
    setSaving(true)
    try {
      await onSave(next)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not save phone")
      setDraft(value || "")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="inline-flex items-center gap-1">
      <Input
        type="tel"
        inputMode="tel"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur() }}
        placeholder="078xxxxxxx"
        className="h-8 w-[9.5rem] rounded-lg border-0 bg-white dark:bg-slate-950 tabular-nums"
        aria-label="Worker phone"
      />
      {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
    </div>
  )
}

export function PayrollSection() {
  const [tab, setTab] = useState<PayrollTab>("ready")
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  return (
    <PageCanvas className="space-y-6">
      <div className="flex gap-2">
        {([
          { id: "ready" as const, label: "Ready to pay" },
          { id: "runs" as const, label: "Payroll lists" },
        ]).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm",
              tab === id
                ? "bg-[#0d182b] text-white"
                : "bg-[#f0ece3] text-[#5c6558] hover:bg-[#e6e1d6] dark:bg-slate-800 dark:text-slate-300"
            )}
          >
            <TranslatedText text={label} />
          </button>
        ))}
      </div>

      {tab === "ready" && (
        <ReadyToPayPanel
          onGenerated={(id) => {
            setSelectedRunId(id)
            setTab("runs")
          }}
        />
      )}
      {tab === "runs" && (
        <PayrollRunsPanel selectedId={selectedRunId} onSelect={setSelectedRunId} />
      )}
    </PageCanvas>
  )
}

function ReadyToPayPanel({ onGenerated }: { onGenerated: (id: string) => void }) {
  const qc = useQueryClient()
  const [periodStart, setPeriodStart] = useState("")
  const [periodEnd, setPeriodEnd] = useState("")
  const [selectedWorkers, setSelectedWorkers] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [workerQuery, setWorkerQuery] = useState("")
  const [workerPage, setWorkerPage] = useState(1)

  const params = useMemo(() => ({
    period_start: periodStart || undefined,
    period_end: periodEnd || undefined,
  }), [periodStart, periodEnd])

  const { data, isLoading } = useQuery({
    queryKey: ["workforce-payroll-unpaid", params],
    queryFn: async () => (await workforceApi.previewUnpaidPayroll(params)).data,
  })

  const workers = data?.workers || []
  const filteredWorkers = workerQuery.trim()
    ? workers.filter((w: any) => `${w.worker_name} ${w.employee_code} ${w.position || ""}`.toLowerCase().includes(workerQuery.trim().toLowerCase()))
    : workers
  const pagedWorkers = filteredWorkers.slice((workerPage - 1) * LIST_PAGE_SIZE, workerPage * LIST_PAGE_SIZE)
  const selectedSet = selectedWorkers.size ? selectedWorkers : new Set(workers.map((w: any) => w.worker_id))
  const selectedAttendanceIds = workers
    .filter((w: any) => selectedSet.has(w.worker_id))
    .flatMap((w: any) => w.attendance_ids || [])

  const generateMut = useMutation({
    mutationFn: () => workforceApi.generatePeriodPayroll({
      period_start: periodStart || undefined,
      period_end: periodEnd || undefined,
      attendance_ids: selectedAttendanceIds,
      notes: notes || undefined,
    }),
    onSuccess: (res) => {
      toast.success("Payroll list created — review and edit until you pay")
      qc.invalidateQueries({ queryKey: ["workforce-payroll-unpaid"] })
      qc.invalidateQueries({ queryKey: ["workforce-payroll"] })
      qc.invalidateQueries({ queryKey: ["workforce-dashboard"] })
      setConfirmOpen(false)
      setNotes("")
      if (res.data?.id) onGenerated(res.data.id)
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Could not generate payroll"),
  })

  const toggleWorker = (id: string) => {
    const next = new Set(selectedSet)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedWorkers(next)
  }

  const toggleExpand = (id: string) => {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpanded(next)
  }

  useEffect(() => {
    setWorkerPage(1)
  }, [workerQuery])

  return (
    <div className="space-y-6">
      <div>
        <SectionHead
          title="Unpaid attendance"
          hint="Workers can complete several events before they are paid. This list sums every unpaid, eligible attendance into one payroll to confirm."
          actions={
            <>
              <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="h-9 rounded-xl border-0 bg-white dark:bg-slate-950" />
              <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="h-9 rounded-xl border-0 bg-white dark:bg-slate-950" />
            </>
          }
        />
        <DataTable minWidth="560px">
          <THead>
            <Th>Workers</Th>
            <Th>Events</Th>
            <Th>Attendances</Th>
            <Th align="right">Estimated net</Th>
          </THead>
          <TBody>
            <tr>
              <Td className="text-lg font-semibold tabular-nums">{isLoading ? "…" : (data?.worker_count ?? 0)}</Td>
              <Td className="text-lg font-semibold tabular-nums">{isLoading ? "…" : (data?.event_count ?? 0)}</Td>
              <Td className="text-lg font-semibold tabular-nums">{isLoading ? "…" : (data?.attendance_count ?? 0)}</Td>
              <Td align="right" className="text-lg font-semibold tabular-nums">{isLoading ? "…" : money(data?.estimated_net, data?.currency)}</Td>
            </tr>
          </TBody>
        </DataTable>
      </div>

      <div>
        <SectionHead
          title="Workers to include"
          hint="Search, then expand a row for unpaid events. Uncheck anyone who should wait for the next list."
          actions={
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9 h-9 rounded-xl border-0 bg-white dark:bg-slate-950"
                placeholder="Search worker or code"
                value={workerQuery}
                onChange={(e) => setWorkerQuery(e.target.value)}
              />
            </div>
          }
        />
        <DataTable minWidth="720px" maxHeight="420px">
          <THead>
            <Th> </Th>
            <Th>Worker</Th>
            <Th>Code</Th>
            <Th>Events</Th>
            <Th align="right">Net</Th>
            <Th> </Th>
          </THead>
          <TBody>
            {isLoading && <EmptyRow cols={6} text="Loading unpaid work…" />}
            {!isLoading && workers.length === 0 && (
              <EmptyRow cols={6} text="No unpaid attendance. After events are staffed and attendance is submitted, unpaid work appears here." />
            )}
            {!isLoading && workers.length > 0 && filteredWorkers.length === 0 && (
              <EmptyRow cols={6} text="No workers match that search." />
            )}
            {pagedWorkers.map((w: any) => {
              const checked = selectedSet.has(w.worker_id)
              const open = expanded.has(w.worker_id)
              return (
                <Fragment key={w.worker_id}>
                  <tr className={cn(!checked && "opacity-50")}>
                    <Td>
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[#668c65]"
                        checked={checked}
                        onChange={() => toggleWorker(w.worker_id)}
                        aria-label={`Include ${w.worker_name}`}
                      />
                    </Td>
                    <Td className="font-medium">{w.worker_name}</Td>
                    <Td className="text-slate-500">{w.employee_code}{w.position ? ` · ${w.position}` : ""}</Td>
                    <Td className="tabular-nums">{w.event_count}</Td>
                    <Td align="right" className="tabular-nums font-semibold">{money(w.net_pay, data?.currency)}</Td>
                    <Td align="right">
                      <button type="button" className="inline-flex items-center text-xs text-slate-500" onClick={() => toggleExpand(w.worker_id)}>
                        {open ? "Hide" : "Events"}
                        <ChevronDown className={cn("h-4 w-4 ml-1 transition-transform", open && "rotate-180")} />
                      </button>
                    </Td>
                  </tr>
                  {open && (w.events || []).map((ev: any) => (
                    <tr key={ev.attendance_id} className="bg-white/60 dark:bg-slate-950/40">
                      <Td />
                      <Td className="text-slate-500 pl-8" colSpan={2}>{ev.event_title}</Td>
                      <Td className="text-slate-500 whitespace-nowrap">{ev.event_date} · {ev.role_label} · {ev.status}</Td>
                      <Td align="right" className="tabular-nums text-slate-500">{money(ev.net, data?.currency)}</Td>
                      <Td />
                    </tr>
                  ))}
                </Fragment>
              )
            })}
          </TBody>
        </DataTable>
        <TablePager page={workerPage} pageSize={LIST_PAGE_SIZE} total={filteredWorkers.length} onPage={setWorkerPage} />
      </div>

      {workers.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm text-slate-500 flex-1">
            {selectedSet.size} worker{selectedSet.size === 1 ? "" : "s"} · {selectedAttendanceIds.length} attendance. Create one payroll list, then edit amounts until you pay.
          </p>
          <Button
            className="bg-[#668c65] hover:bg-[#557554] text-white rounded-xl w-full sm:w-auto"
            disabled={!selectedAttendanceIds.length || generateMut.isPending}
            onClick={() => setConfirmOpen(true)}
          >
            Generate payroll list
          </Button>
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md shadow-none">
          <DialogHeader>
            <DialogTitle>Confirm payroll list</DialogTitle>
            <DialogDescription>
              This locks the selected unpaid attendance into one list. You can still edit amounts, remove workers, or drop events until payment is done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <textarea
              className="w-full min-h-[88px] rounded-xl border-0 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
              placeholder="e.g. March events, transport already paid in cash…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              className="bg-[#668c65] hover:bg-[#557554] rounded-xl"
              disabled={generateMut.isPending}
              onClick={() => generateMut.mutate()}
            >
              {generateMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create list
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PayrollRunsPanel({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string | null) => void }) {
  const qc = useQueryClient()
  const { user } = useAuth()
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [payOpen, setPayOpen] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [runPage, setRunPage] = useState(1)
  const [runQuery, setRunQuery] = useState("")
  const [lineQuery, setLineQuery] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["workforce-payroll", runPage],
    queryFn: async () => (await workforceApi.listPayroll({ page: runPage, page_size: LIST_PAGE_SIZE })).data,
  })

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["workforce-payroll-detail", selectedId],
    queryFn: async () => selectedId ? (await workforceApi.getPayroll(selectedId)).data : null,
    enabled: !!selectedId,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["workforce-payroll"] })
    qc.invalidateQueries({ queryKey: ["workforce-payroll-detail", selectedId] })
    qc.invalidateQueries({ queryKey: ["workforce-payroll-unpaid"] })
    qc.invalidateQueries({ queryKey: ["workforce-dashboard"] })
    qc.invalidateQueries({ queryKey: ["workforce-workers"] })
  }

  const action = async (fn: () => Promise<any>, ok: string) => {
    try {
      await fn()
      toast.success(ok)
      invalidate()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Action failed")
    }
  }

  const runs = data?.items || []
  const runsTotal = data?.total || 0
  const visibleRuns = runQuery.trim()
    ? runs.filter((p: any) => `${p.title || ""} ${p.status || ""}`.toLowerCase().includes(runQuery.trim().toLowerCase()))
    : runs

  return (
    <div className="space-y-6">
      {!selectedId && (
      <div>
        <SectionHead
          title="Payroll runs"
          hint="Open one list to confirm, edit amounts, then approve and pay workers."
          actions={
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a9184]" />
              <Input
                className="pl-9 h-9 rounded-xl border-0 bg-[#f4f1ea] dark:bg-slate-900"
                placeholder="Filter this page"
                value={runQuery}
                onChange={(e) => setRunQuery(e.target.value)}
              />
            </div>
          }
        />
        <DataTable minWidth="720px">
          <THead>
            <Th>List</Th>
            <Th>Period</Th>
            <Th>Workers</Th>
            <Th>Events</Th>
            <Th align="right">Net</Th>
            <Th>Status</Th>
          </THead>
          <TBody>
            {isLoading && <EmptyRow cols={6} text="Loading payroll runs…" />}
            {!isLoading && !runs.length && (
              <EmptyRow cols={6} text="No payroll runs yet. Generate a list from Ready to pay." />
            )}
            {!isLoading && runs.length > 0 && visibleRuns.length === 0 && (
              <EmptyRow cols={6} text="No runs match that filter." />
            )}
            {visibleRuns.map((p: any) => (
              <tr
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="cursor-pointer"
              >
                <Td className="font-medium">{p.title || money(p.net_total, p.currency)}</Td>
                <Td className="text-[#6b7368] whitespace-nowrap">
                  {p.period_start && p.period_end ? `${p.period_start} – ${p.period_end}` : p.created_at?.slice(0, 10)}
                </Td>
                <Td className="tabular-nums">{p.worker_count}</Td>
                <Td className="tabular-nums">{p.event_count || "—"}</Td>
                <Td align="right" className="tabular-nums font-semibold">{money(p.net_total, p.currency)}</Td>
                <Td><QuietStatus status={p.status} /></Td>
              </tr>
            ))}
          </TBody>
        </DataTable>
        <TablePager page={runPage} pageSize={LIST_PAGE_SIZE} total={runsTotal} onPage={setRunPage} />
      </div>
      )}

      {selectedId && detailLoading && (
        <div className="h-36 rounded-xl bg-[#f4f1ea] dark:bg-slate-950" />
      )}

      {detail && (
        <div className="space-y-6">
          <button type="button" onClick={() => onSelect(null)} className="text-sm text-[#668c65]">
            ← All payroll lists
          </button>
          <div>
            <SectionHead
              title={detail.title || "Payroll"}
              hint={`${detail.period_start && detail.period_end ? `${detail.period_start} – ${detail.period_end}` : detail.created_at?.slice(0, 10)} · ${detail.worker_count} workers${detail.event_count ? ` · ${detail.event_count} events` : ""}`}
              actions={<QuietStatus status={detail.status} />}
            />
            <DataTable minWidth="480px">
              <THead>
                <Th>Gross</Th>
                <Th>Deductions</Th>
                <Th align="right">Net</Th>
              </THead>
              <TBody>
                <tr>
                  <Td className="tabular-nums font-semibold">{money(detail.gross_total, detail.currency)}</Td>
                  <Td className="tabular-nums">{money(detail.deductions_total, detail.currency)}</Td>
                  <Td align="right" className="tabular-nums font-semibold">{money(detail.net_total, detail.currency)}</Td>
                </tr>
              </TBody>
            </DataTable>
            <div className="mt-4 flex flex-wrap gap-2">
              {isPreApproval(detail.status) && (
                <>
                  <Button size="sm" variant="outline" className="rounded-xl border-0 bg-white dark:bg-slate-950" onClick={() => action(() => workforceApi.recommendPayroll(detail.id), "Recommended")}>
                    Recommend
                  </Button>
                  <Button size="sm" className="bg-[#668c65] hover:bg-[#557554] rounded-xl" onClick={() => setPayOpen(true)}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl border-0 bg-white dark:bg-slate-950 text-red-700" onClick={() => action(() => workforceApi.cancelPayroll(detail.id), "Cancelled — attendance returned to unpaid")}>
                    Cancel list
                  </Button>
                </>
              )}
              {(detail.status === "approved" || detail.status === "processing") && (
                <Button size="sm" className="bg-[#668c65] hover:bg-[#557554] rounded-xl" onClick={() => setPayOpen(true)}>
                  {detail.status === "processing" ? "Continue payment" : "Pay workers"}
                </Button>
              )}
              {detail.status === "approved" && (
                <Button size="sm" variant="outline" className="rounded-xl border-0 bg-white dark:bg-slate-950" onClick={() => action(() => workforceApi.markPayrollPaid(detail.id), "Marked paid in cash")}>
                  Paid in cash
                </Button>
              )}
            </div>
            {detail.editable && (
              <p className="text-xs text-slate-500 mt-3">
                This list is unpaid — change phones, amounts, or drop events here. Edits lock only after Mobile Money is collected or the list is marked paid in cash.
              </p>
            )}
            {detail.status === "processing" && (
              <p className="text-xs text-slate-500 mt-3">
                Waiting for Mobile Money. Check your phone for the PIN prompt, then continue payment if this page was closed.
              </p>
            )}
            {detail.payment_error && detail.status === "approved" && (
              <p className="text-xs text-red-600 mt-3">{detail.payment_error}</p>
            )}
          </div>

          <div>
            <SectionHead
              title="Payroll lines"
              hint={detail.editable
                ? "Unpaid list — edit phone or amount in the row, expand a worker to change or drop events, or open Edit for bonuses and deductions."
                : "Each worker shows their phone, how many events they attended, the unpaid event names, and the amount to pay."}
              actions={
                (detail.items || []).length > 8 ? (
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      className="pl-9 h-9 rounded-xl border-0 bg-white dark:bg-slate-950"
                      placeholder="Search a worker on this list"
                      value={lineQuery}
                      onChange={(e) => setLineQuery(e.target.value)}
                    />
                  </div>
                ) : undefined
              }
            />
            <DataTable minWidth="860px" maxHeight="420px">
              <THead>
                <Th>Worker</Th>
                <Th>Phone</Th>
                <Th>Events attended</Th>
                <Th>Unpaid events</Th>
                <Th align="right">Amount</Th>
                <Th align="right"> </Th>
              </THead>
              <TBody>
                {(detail.items || []).length === 0 && <EmptyRow cols={6} text="No lines on this payroll." />}
                {(detail.items || [])
                  .filter((i: any) => !lineQuery.trim() || `${i.worker_name} ${i.employee_code} ${i.worker_phone || ""} ${i.role_label || ""}`.toLowerCase().includes(lineQuery.trim().toLowerCase()))
                  .map((i: any) => {
                  const open = expanded.has(i.id)
                  const events = workerEvents(i)
                  const canEdit = Boolean(detail.editable && !i.is_excluded)
                  return (
                    <Fragment key={i.id}>
                      <tr className={cn(i.is_excluded && "opacity-50")}>
                        <Td className="font-medium">
                          {i.worker_name}
                          {i.employee_code ? <span className="block text-xs font-normal text-slate-500">{i.employee_code}{i.role_label ? ` · ${i.role_label}` : ""}</span> : null}
                          {i.is_excluded ? <span className="ml-2 text-xs font-normal text-red-600">Excluded</span> : null}
                          {i.payout_status === "paid" ? <span className="ml-2 text-xs font-normal text-[#668c65]">Paid</span> : null}
                          {i.payout_status === "failed" ? <span className="ml-2 text-xs font-normal text-red-600">Payout failed</span> : null}
                          {i.payout_status === "processing" ? <span className="ml-2 text-xs font-normal text-slate-500">Sending…</span> : null}
                        </Td>
                        <Td className={cn(i.payout_issue && "text-red-600")}>
                          <EditablePhone
                            value={i.worker_phone || i.payout_msisdn || ""}
                            disabled={!canEdit}
                            onSave={async (phone) => {
                              await workforceApi.updatePayrollItem(detail.id, i.id, { phone })
                              toast.success("Phone updated")
                              invalidate()
                            }}
                          />
                          {i.payout_issue ? <p className="text-[11px] text-red-600 mt-1 max-w-[10rem]">{i.payout_issue}</p> : null}
                        </Td>
                        <Td className="tabular-nums">{workerEventCount(i)}</Td>
                        <Td className="text-slate-600">
                          {events.length ? (
                            <ul className="space-y-0.5">
                              {events.map((ev: any) => (
                                <li key={ev.attendance_id || ev.event_id}>{formatEventName(ev)}</li>
                              ))}
                            </ul>
                          ) : "—"}
                        </Td>
                        <Td align="right">
                          <EditableAmount
                            value={i.net_pay}
                            currency={detail.currency}
                            disabled={!canEdit}
                            onSave={async (n) => {
                              await workforceApi.updatePayrollItem(detail.id, i.id, {
                                event_pay: eventPayForNet(i, n),
                                adjustment_reason: i.adjustment_reason || "Amount adjusted before payment",
                              })
                              toast.success("Amount updated")
                              invalidate()
                            }}
                          />
                        </Td>
                        <Td align="right">
                          <div className="inline-flex items-center gap-2">
                            <button type="button" className="inline-flex items-center text-xs text-slate-500" onClick={() => {
                              const next = new Set(expanded)
                              if (next.has(i.id)) next.delete(i.id)
                              else next.add(i.id)
                              setExpanded(next)
                            }}>
                              {open ? "Hide" : "Details"}
                              <ChevronDown className={cn("h-4 w-4 ml-1 transition-transform", open && "rotate-180")} />
                            </button>
                            {canEdit && (
                              <button type="button" className="inline-flex items-center text-xs text-[#668c65]" onClick={() => setEditingItem(i)}>
                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                Edit
                              </button>
                            )}
                          </div>
                        </Td>
                      </tr>
                      {open && events.map((ev: any) => (
                        <tr key={ev.attendance_id || ev.event_id} className="bg-white/60 dark:bg-slate-950/40">
                          <Td className="text-slate-500 pl-8" colSpan={2}>{formatEventName(ev)}</Td>
                          <Td className="text-slate-500 whitespace-nowrap">{ev.role_label || "Worker"}{ev.status ? ` · ${ev.status}` : ""}</Td>
                          <Td className="text-slate-500">{ev.hours_worked ? `${ev.hours_worked} hrs` : ""}</Td>
                          <Td align="right">
                            <EditableAmount
                              value={ev.net ?? ev.gross ?? ev.event_pay}
                              currency={detail.currency}
                              disabled={!canEdit}
                              onSave={async (n) => {
                                await workforceApi.updatePayrollItem(detail.id, i.id, {
                                  event_amounts: [{ attendance_id: ev.attendance_id, net: n }],
                                  adjustment_reason: i.adjustment_reason || "Event amount adjusted before payment",
                                })
                                toast.success("Event amount updated")
                                invalidate()
                              }}
                            />
                          </Td>
                          <Td align="right">
                            {canEdit && events.length > 1 && (
                              <button
                                type="button"
                                className="text-xs text-red-600"
                                onClick={() => action(
                                  () => workforceApi.updatePayrollItem(detail.id, i.id, { remove_attendance_ids: [ev.attendance_id] }),
                                  "Event removed from this payroll"
                                )}
                              >
                                Remove
                              </button>
                            )}
                          </Td>
                        </tr>
                      ))}
                      {open && i.adjustment_reason && (
                        <tr>
                          <Td colSpan={6} className="text-xs text-slate-500">Edit reason: {i.adjustment_reason}</Td>
                        </tr>
                      )}
                      {open && detail.editable && i.is_excluded && (
                        <tr>
                          <Td colSpan={6}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl border-0 bg-white dark:bg-slate-950"
                              onClick={() => action(
                                () => workforceApi.updatePayrollItem(detail.id, i.id, { exclude: false }),
                                "Worker included again"
                              )}
                            >
                              Include again
                            </Button>
                          </Td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </TBody>
            </DataTable>
          </div>

          {(detail.audit_trail || []).length > 0 && (
            <div>
              <SectionHead title="Audit trail" />
              <DataTable minWidth="480px">
                <THead>
                  <Th>When</Th>
                  <Th>Action</Th>
                </THead>
                <TBody>
                  {detail.audit_trail.map((a: any) => (
                    <tr key={a.id}>
                      <Td className="whitespace-nowrap text-slate-500">{a.created_at?.slice(0, 19).replace("T", " ")}</Td>
                      <Td className="capitalize">{a.action.replace(/_/g, " ")}</Td>
                    </tr>
                  ))}
                </TBody>
              </DataTable>
            </div>
          )}
        </div>
      )}

      {editingItem && detail && (
        <EditPayrollItemDialog
          currency={detail.currency}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={async (payload) => {
            await workforceApi.updatePayrollItem(detail.id, editingItem.id, payload)
            toast.success("Payroll line updated")
            setEditingItem(null)
            invalidate()
          }}
        />
      )}

      {detail && (
        <PayPayrollDialog
          open={payOpen}
          detail={detail}
          defaultPhone={user?.phone_number || ""}
          onOpenChange={setPayOpen}
          onSettled={() => {
            invalidate()
          }}
        />
      )}
    </div>
  )
}

function EditPayrollItemDialog({
  item, currency, onClose, onSave,
}: {
  item: any
  currency: string
  onClose: () => void
  onSave: (payload: Record<string, unknown>) => Promise<void>
}) {
  const [form, setForm] = useState({
    phone: item.worker_phone || item.payout_msisdn || "",
    event_pay: String(item.event_pay ?? 0),
    overtime_pay: String(item.overtime_pay ?? 0),
    bonus: String(item.bonus ?? 0),
    allowances: String(item.allowances ?? 0),
    transport: String(item.transport ?? 0),
    meals: String(item.meals ?? 0),
    taxes: String(item.taxes ?? 0),
    advances: String(item.advances ?? 0),
    other_deductions: String(item.other_deductions ?? 0),
    adjustment_reason: item.adjustment_reason || "",
    exclude_reason: "",
  })
  const [saving, setSaving] = useState(false)
  const [excludeMode, setExcludeMode] = useState(false)

  const num = (v: string) => Number(v || 0)
  const gross = num(form.event_pay) + num(form.overtime_pay) + num(form.bonus) + num(form.allowances) + num(form.transport) + num(form.meals)
  const net = gross - num(form.taxes) - num(form.advances) - num(form.other_deductions)

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const submit = async (exclude = false) => {
    setSaving(true)
    try {
      if (exclude) {
        await onSave({ exclude: true, exclude_reason: form.exclude_reason || form.adjustment_reason || "Removed before approval" })
      } else {
        await onSave({
          phone: form.phone.trim(),
          event_pay: num(form.event_pay),
          overtime_pay: num(form.overtime_pay),
          bonus: num(form.bonus),
          allowances: num(form.allowances),
          transport: num(form.transport),
          meals: num(form.meals),
          taxes: num(form.taxes),
          advances: num(form.advances),
          other_deductions: num(form.other_deductions),
          adjustment_reason: form.adjustment_reason || undefined,
        })
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not save")
    } finally {
      setSaving(false)
    }
  }

  const fields: { key: string; label: string }[] = [
    { key: "event_pay", label: "Event pay" },
    { key: "overtime_pay", label: "Overtime" },
    { key: "bonus", label: "Bonus" },
    { key: "allowances", label: "Allowances" },
    { key: "transport", label: "Transport" },
    { key: "meals", label: "Meals" },
    { key: "taxes", label: "Tax" },
    { key: "advances", label: "Advances" },
    { key: "other_deductions", label: "Other deductions" },
  ]

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="rounded-2xl sm:max-w-lg shadow-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {item.worker_name}</DialogTitle>
          <DialogDescription>
            Adjust this worker until payment is done. Use exclude if they should not be paid in this cycle — their unpaid events return to Ready to pay.
          </DialogDescription>
        </DialogHeader>

        {!excludeMode ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Worker phone</Label>
              <Input
                type="tel"
                inputMode="tel"
                placeholder="078xxxxxxx or 072xxxxxxx"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="rounded-xl border-0 bg-slate-50 dark:bg-slate-900"
              />
              <p className={cn("text-xs", item.payout_issue ? "text-red-600" : "text-slate-500")}>
                {item.payout_issue
                  ? item.payout_issue
                  : "Used for Mobile Money payout. MTN 078/079 or Airtel 072/073."}
              </p>
            </div>
            <DataTable minWidth="360px">
              <THead>
                <Th>Line</Th>
                <Th align="right">Amount</Th>
              </THead>
              <TBody>
                {fields.map(({ key, label }) => (
                  <tr key={key}>
                    <Td>{label}</Td>
                    <Td align="right">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={(form as any)[key]}
                        onChange={(e) => set(key, e.target.value)}
                        className="ml-auto max-w-[140px] rounded-xl border-0 bg-slate-50 dark:bg-slate-900 text-right"
                      />
                    </Td>
                  </tr>
                ))}
                <tr>
                  <Td className="font-medium">New net</Td>
                  <Td align="right" className="font-semibold tabular-nums">{money(net, currency)}</Td>
                </tr>
              </TBody>
            </DataTable>
            <div className="space-y-1.5">
              <Label className="text-xs">Reason for edit</Label>
              <textarea
                className="w-full min-h-[72px] rounded-xl border-0 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
                placeholder="e.g. Transport already paid, rate correction, advance deducted…"
                value={form.adjustment_reason}
                onChange={(e) => set("adjustment_reason", e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Why exclude this worker?</Label>
            <textarea
              className="w-full min-h-[88px] rounded-xl border-0 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
              placeholder="e.g. Dispute on hours, paid outside the system, wrong worker…"
              value={form.exclude_reason}
              onChange={(e) => set("exclude_reason", e.target.value)}
            />
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!excludeMode && (
            <Button type="button" variant="outline" className="rounded-xl text-red-700 sm:mr-auto" onClick={() => setExcludeMode(true)}>
              <Ban className="h-4 w-4" /> Exclude worker
            </Button>
          )}
          <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
            <X className="h-4 w-4" /> Close
          </Button>
          <Button
            type="button"
            className="bg-[#668c65] hover:bg-[#557554] rounded-xl"
            disabled={saving}
            onClick={() => submit(excludeMode)}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {excludeMode ? "Exclude" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function PayrollPaymentReport({
  items,
  currency,
  total,
}: {
  items: any[]
  currency: string
  total: number
}) {
  const eventTotal = items.reduce((sum, item) => sum + workerEventCount(item), 0)
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-slate-500">
          {items.length} worker{items.length === 1 ? "" : "s"} · {eventTotal} unpaid event{eventTotal === 1 ? "" : "s"}
        </p>
        <p className="font-semibold tabular-nums">{money(total, currency)}</p>
      </div>
      <DataTable
        minWidth="640px"
        className="min-h-[7.5rem] flex-1 overflow-y-auto overscroll-contain rounded-xl border border-[#e6e1d6] dark:border-border"
      >
        <THead className="bg-background">
          <Th>Worker</Th>
          <Th>Phone</Th>
          <Th>Events attended</Th>
          <Th>Unpaid events</Th>
          <Th align="right">Amount</Th>
        </THead>
        <TBody>
          {items.length === 0 && <EmptyRow cols={5} text="No payable workers on this list." />}
          {items.map((item: any) => {
            const events = workerEvents(item)
            return (
              <tr key={item.id}>
                <Td className="font-medium align-top">
                  {item.worker_name}
                  {item.employee_code ? <span className="block text-xs font-normal text-slate-500">{item.employee_code}</span> : null}
                </Td>
                <Td className={cn("tabular-nums align-top", item.payout_issue && "text-red-600")}>
                  {workerPhone(item)}
                </Td>
                <Td className="tabular-nums align-top">{workerEventCount(item)}</Td>
                <Td className="text-slate-600 align-top">
                  {events.length ? (
                    <ul className="space-y-0.5">
                      {events.map((ev: any) => (
                        <li key={ev.attendance_id || ev.event_id}>{formatEventName(ev)}</li>
                      ))}
                    </ul>
                  ) : "—"}
                </Td>
                <Td align="right" className="tabular-nums font-semibold align-top">{money(item.net_pay, currency)}</Td>
              </tr>
            )
          })}
        </TBody>
      </DataTable>
    </div>
  )
}

function PayPayrollDialog({
  open,
  detail,
  defaultPhone,
  onOpenChange,
  onSettled,
}: {
  open: boolean
  detail: any
  defaultPhone: string
  onOpenChange: (open: boolean) => void
  onSettled: () => void
}) {
  const payable = (detail.items || []).filter((item: any) => !item.is_excluded && Number(item.net_pay || 0) > 0)
  const blockers = payable.filter((item: any) => item.has_payout_number === false)
  const [phone, setPhone] = useState(defaultPhone)
  const [phase, setPhase] = useState<"review" | "waiting" | "success" | "failed">(
    detail.status === "processing" ? "waiting" : "review"
  )
  const [message, setMessage] = useState(detail.payment_error || "")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setPhone(defaultPhone)
    setMessage(detail.payment_error || "")
    setPhase(detail.status === "processing" ? "waiting" : detail.status === "paid" ? "success" : "review")
  }, [open, detail.id]) // reset only when the dialog opens or the list changes

  useEffect(() => {
    if (!open || phase !== "waiting") return
    let cancelled = false
    const started = Date.now()
    const poll = async () => {
      while (!cancelled && Date.now() - started < 180_000) {
        try {
          const res = await workforceApi.verifyPayrollPayment(detail.id)
          const data = res.data || {}
          if (cancelled) return
          if (data.payment_status === "paid" || data.status === "paid") {
            setPhase("success")
            setMessage(data.message || "All workers have been paid.")
            onSettled()
            toast.success("Payroll paid — Mobile Money sent to workers")
            return
          }
          if (data.payment_status === "failed" || data.payment_status === "payout_failed") {
            setPhase("failed")
            setMessage(data.message || data.payment_error || "Payment was not completed.")
            onSettled()
            return
          }
          setMessage(data.message || "Waiting for Mobile Money approval on your phone.")
        } catch (e: any) {
          if (cancelled) return
          setMessage(e?.response?.data?.detail || "Still confirming the payment…")
        }
        await sleep(3000)
      }
      if (!cancelled) {
        setPhase("failed")
        setMessage("Timed out waiting for Mobile Money approval. Open Continue payment after you approve on your phone.")
        onSettled()
      }
    }
    poll()
    return () => {
      cancelled = true
    }
  }, [open, phase, detail.id])

  const startPay = async () => {
    if (!phone.trim()) {
      toast.error("Enter the MTN or Airtel number that will pay this payroll.")
      return
    }
    if (!payable.length) {
      toast.error("There are no payable workers on this list.")
      return
    }
    if (blockers.length) {
      blockers.forEach((item: any) => {
        toast.error(`${item.worker_name}: ${item.payout_issue || "Add a valid MTN (078/079) or Airtel (072/073) number on People."}`)
      })
      return
    }
    setBusy(true)
    try {
      const res = await workforceApi.payPayroll(detail.id, phone.trim())
      const data = res.data || {}
      if (data.payment_status === "paid" || data.status === "paid") {
        setPhase("success")
        setMessage(data.message || "All workers have been paid.")
        onSettled()
        toast.success("Payroll paid")
        return
      }
      if (data.payment_status === "failed" || data.payment_status === "payout_failed") {
        setPhase("failed")
        setMessage(data.message || "Could not start the payment")
        onSettled()
        return
      }
      setMessage(data.message || "Check your phone and enter your Mobile Money PIN.")
      setPhase("waiting")
      onSettled()
      toast.success("Approve the Mobile Money prompt on your phone")
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not start payroll payment")
    } finally {
      setBusy(false)
    }
  }

  const payCash = async () => {
    setBusy(true)
    try {
      if (detail.editable) {
        await workforceApi.approvePayroll(detail.id)
      }
      await workforceApi.markPayrollPaid(detail.id)
      setPhase("success")
      setMessage("Recorded as paid in cash.")
      onSettled()
      toast.success("Marked paid in cash")
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not mark payroll paid")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next) }}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden rounded-2xl shadow-none sm:max-w-3xl">
        <DialogHeader className="shrink-0 pr-8">
          <DialogTitle>Pay this payroll</DialogTitle>
          <DialogDescription>
            {phase === "waiting"
              ? "Check your phone and enter your Mobile Money PIN. Do not close this window."
              : "Review who is being paid, for which unpaid events, then collect the total from your Mobile Money."}
          </DialogDescription>
        </DialogHeader>

        {(phase === "review" || phase === "waiting" || phase === "success" || phase === "failed") && (
          <PayrollPaymentReport items={payable} currency={detail.currency} total={detail.net_total} />
        )}

        {phase === "review" && (
          <div className="shrink-0 space-y-4">
            {blockers.length > 0 && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/30 px-3 py-2 space-y-1">
                {blockers.map((item: any) => (
                  <p key={item.id} className="text-xs text-red-700 dark:text-red-400">
                    {item.worker_name}: {item.payout_issue || "Add a valid MTN (078/079) or Airtel (072/073) number on People."}
                  </p>
                ))}
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Your Mobile Money number</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-9 h-10 rounded-xl border-0 bg-slate-50 dark:bg-slate-900"
                  placeholder="078xxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                />
              </div>
              <p className="text-xs text-slate-500">You will get a USSD PIN prompt for {money(detail.net_total, detail.currency)}.</p>
            </div>
          </div>
        )}

        {phase === "waiting" && (
          <div className="shrink-0 py-4 text-center space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#668c65] mx-auto" />
            <p className="text-sm text-slate-600">{message || "Waiting for Mobile Money approval on your phone."}</p>
          </div>
        )}

        {phase === "success" && (
          <div className="shrink-0 py-4 text-center space-y-2">
            <Check className="h-10 w-10 text-[#668c65] mx-auto" />
            <p className="text-sm text-slate-600">{message || "Payroll paid."}</p>
          </div>
        )}

        {phase === "failed" && (
          <div className="shrink-0 py-2 space-y-3">
            <p className="text-sm text-red-600">{message || "Payment failed."}</p>
            <p className="text-xs text-slate-500">You can retry Mobile Money, or record this list as paid in cash if you already paid outside the app.</p>
          </div>
        )}

        <DialogFooter className="shrink-0 flex-col sm:flex-row gap-2">
          {phase === "review" && (
            <Button type="button" variant="outline" className="rounded-xl sm:mr-auto" disabled={busy} onClick={payCash}>
              Paid in cash
            </Button>
          )}
          {phase === "failed" && (
            <Button type="button" variant="outline" className="rounded-xl sm:mr-auto" disabled={busy} onClick={payCash}>
              Paid in cash
            </Button>
          )}
          <Button type="button" variant="outline" className="rounded-xl" disabled={busy && phase === "waiting"} onClick={() => onOpenChange(false)}>
            {phase === "waiting" ? "Hide" : "Close"}
          </Button>
          {phase === "review" && (
            <Button
              type="button"
              className="bg-[#668c65] hover:bg-[#557554] rounded-xl"
              disabled={busy}
              onClick={startPay}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
              Approve & pay
            </Button>
          )}
          {phase === "failed" && (
            <Button
              type="button"
              className="bg-[#668c65] hover:bg-[#557554] rounded-xl"
              disabled={busy}
              onClick={() => {
                if (detail.payment_collected_at) setPhase("waiting")
                else setPhase("review")
              }}
            >
              Try again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

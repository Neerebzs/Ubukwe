"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Search, Link2, Trash2, Loader2, CheckCircle2,
} from "lucide-react"
import { workforceApi } from "@/lib/api/workforce"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { DataTable, EmptyRow, PageCanvas, QuietStatus, SectionHead, TBody, THead, TablePager, Td, Th, useDebounced } from "@/components/provider/workforce-ui"

const LIST_PAGE_SIZE = 12
const SEARCH_PAGE_SIZE = 15

type Mode = "assignments" | "schedules" | "attendance"

const ATTENDANCE_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
  { value: "left_early", label: "Left early" },
  { value: "overtime", label: "Overtime" },
  { value: "excused", label: "Excused" },
  { value: "pending", label: "Pending" },
] as const

function money(n?: number | null, currency = "RWF") {
  if (n == null) return "—"
  return `${Number(n).toLocaleString()} ${currency}`
}

function prettyTitle(value?: string) {
  if (!value) return "Untitled event"
  const trimmed = value.trim()
  if (trimmed.length > 3 && trimmed === trimmed.toUpperCase()) {
    return trimmed.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
  }
  return trimmed
}

function formatDate(iso?: string | null) {
  if (!iso) return "Date TBD"
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function attendanceTone(status?: string) {
  if (status === "present" || status === "overtime") return "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40"
  if (status === "late" || status === "left_early") return "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40"
  if (status === "absent") return "text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950/40"
  if (status === "excused") return "text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-950/40"
  return "text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800"
}

export function EventsSection({
  mode, selectedEventId, onSelectEvent,
}: {
  mode: Mode
  selectedEventId: string | null
  onSelectEvent: (id: string | null) => void
}) {
  const qc = useQueryClient()
  const [leaderSearch, setLeaderSearch] = useState("")
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([])
  const [roleLabel, setRoleLabel] = useState("")
  const [workerSearch, setWorkerSearch] = useState("")
  const [eventSearch, setEventSearch] = useState("")
  const [eventPage, setEventPage] = useState(1)
  const [crewSearch, setCrewSearch] = useState("")
  const [staffPanel, setStaffPanel] = useState<"leaders" | "crew">("crew")

  const debouncedEventSearch = useDebounced(eventSearch)
  const debouncedWorkerSearch = useDebounced(workerSearch)
  const debouncedLeaderSearch = useDebounced(leaderSearch)

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["workforce-events", mode, debouncedEventSearch, eventPage],
    queryFn: async () => (await workforceApi.listEvents({
      page: eventPage,
      page_size: LIST_PAGE_SIZE,
      search: debouncedEventSearch.trim() || undefined,
      paid_only: mode === "assignments" ? true : undefined,
      upcoming_only: mode === "schedules" ? true : undefined,
    })).data,
  })
  const events = eventsData?.items || []
  const eventsTotal = eventsData?.total || 0

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["workforce-dashboard"],
    queryFn: async () => (await workforceApi.dashboard()).data,
    enabled: mode === "assignments",
  })
  const pendingBookings = dashboardData?.pending_event_bookings || []
  const pendingPreview = pendingBookings.slice(0, 8)

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["workforce-event", selectedEventId],
    queryFn: async () => selectedEventId ? (await workforceApi.getEvent(selectedEventId)).data : null,
    enabled: !!selectedEventId,
  })

  const canSearchLeaders = debouncedLeaderSearch.trim().length >= 2
  const { data: leaderMatches = [] } = useQuery({
    queryKey: ["workforce-workers-leader", debouncedLeaderSearch],
    queryFn: async () => (await workforceApi.listWorkers({
      page_size: SEARCH_PAGE_SIZE,
      is_active: true,
      search: debouncedLeaderSearch.trim(),
    })).data?.items || [],
    enabled: canSearchLeaders,
  })

  const canSearchCrew = debouncedWorkerSearch.trim().length >= 2
  const { data: searchableWorkers = [] } = useQuery({
    queryKey: ["workforce-workers-assign", debouncedWorkerSearch],
    queryFn: async () => (await workforceApi.listWorkers({
      page_size: SEARCH_PAGE_SIZE,
      is_active: true,
      search: debouncedWorkerSearch.trim(),
    })).data?.items || [],
    enabled: canSearchCrew,
  })

  const assignLeaderMut = useMutation({
    mutationFn: (workerId: string) => workforceApi.assignLeader(selectedEventId!, { team_leader_id: workerId }),
    onSuccess: (res) => {
      toast.success("Team leader added")
      setLeaderSearch("")
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
      const detailMsg = e?.response?.data?.detail
      toast.error(typeof detailMsg === "object" ? detailMsg.message || "Assignment conflict" : detailMsg || "Failed")
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
      toast.success("Attendance submitted. Unpaid work will appear in Payroll.")
      qc.invalidateQueries({ queryKey: ["workforce-event", selectedEventId] })
      qc.invalidateQueries({ queryKey: ["workforce-events"] })
      qc.invalidateQueries({ queryKey: ["workforce-payroll-unpaid"] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed"),
  })

  const listEvents = events
  const crew = detail?.assignments || []
  const visibleCrew = crewSearch.trim()
    ? crew.filter((a: any) => {
        const q = crewSearch.trim().toLowerCase()
        return `${a.worker_name} ${a.role_label || ""}`.toLowerCase().includes(q)
      })
    : crew
  const attendanceRows = detail?.attendance || []
  const presentCount = attendanceRows.filter((a: any) => ["present", "late", "overtime", "left_early"].includes(a.status)).length

  const copy = {
    assignments: {
      rail: "Events to staff",
      hint: "Open one event. Waiting-for-payment bookings cannot be staffed yet.",
    },
    schedules: {
      rail: "Upcoming events",
      hint: "Open one event to see who is assigned.",
    },
    attendance: {
      rail: "Events to mark",
      hint: "Open one event and mark who worked. Pay later from Pay → Payroll.",
    },
  }[mode]

  useEffect(() => {
    setEventPage(1)
  }, [debouncedEventSearch, mode])

  if (!selectedEventId) {
    return (
      <PageCanvas className="space-y-8">
        <div>
          <SectionHead
            title={copy.rail}
            hint={copy.hint}
            actions={
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a9184]" />
                <Input
                  className="pl-9 h-9 rounded-xl border-0 bg-[#f4f1ea] dark:bg-slate-900"
                  placeholder="Search event, client, or place"
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                />
              </div>
            }
          />
          <DataTable minWidth="640px">
            <THead>
              <Th>Event</Th>
              <Th>Client</Th>
              <Th>Date</Th>
              <Th>Location</Th>
              <Th>Status</Th>
            </THead>
            <TBody>
              {(isLoading || (mode === "assignments" && dashboardLoading)) && (
                <EmptyRow cols={5} text="Loading events…" />
              )}
              {!isLoading && listEvents.length === 0 && (
                <EmptyRow cols={5} text={eventSearch.trim() ? "No events match that search." : "No events yet. They appear after a booking is paid."} />
              )}
              {listEvents.map((e: any) => (
                <tr key={e.id} onClick={() => onSelectEvent(e.id)} className="cursor-pointer">
                  <Td className="font-medium">{prettyTitle(e.title)}</Td>
                  <Td className="text-[#6b7368]">{e.customer_name || "—"}</Td>
                  <Td className="whitespace-nowrap text-[#6b7368]">{formatDate(e.event_date)}</Td>
                  <Td className="text-[#6b7368]">{e.location || "—"}</Td>
                  <Td><QuietStatus status={e.status} /></Td>
                </tr>
              ))}
            </TBody>
          </DataTable>
          <TablePager page={eventPage} pageSize={LIST_PAGE_SIZE} total={eventsTotal} onPage={setEventPage} />
        </div>

        {mode === "assignments" && pendingBookings.length > 0 && (
          <div>
            <SectionHead title="Waiting for payment" hint={`${pendingBookings.length} booking${pendingBookings.length === 1 ? "" : "s"} cannot be staffed until paid.`} />
            <DataTable minWidth="520px" maxHeight="240px">
              <THead>
                <Th>Event</Th>
                <Th>Client</Th>
                <Th>Date</Th>
                <Th align="right">Due</Th>
              </THead>
              <TBody>
                {pendingPreview.map((b: any) => (
                  <tr key={b.booking_id}>
                    <Td className="font-medium">{prettyTitle(b.title)}</Td>
                    <Td className="text-[#6b7368]">{b.customer_name || "—"}</Td>
                    <Td className="whitespace-nowrap text-[#6b7368]">{formatDate(b.event_date)}</Td>
                    <Td align="right" className="tabular-nums">{money(b.total_amount)}</Td>
                  </tr>
                ))}
              </TBody>
            </DataTable>
          </div>
        )}
      </PageCanvas>
    )
  }

  return (
    <PageCanvas className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onSelectEvent(null)}
            className="text-sm text-[#668c65] mb-2"
          >
            ← All events
          </button>
          {detail && (
            <>
              <h2 className="font-serif text-xl font-medium tracking-tight text-[#0d182b] dark:text-white">
                {prettyTitle(detail.title)}
              </h2>
              <p className="text-sm text-[#6b7368] mt-1">
                {formatDate(detail.event_date)}
                {detail.location ? ` · ${detail.location}` : ""}
                {detail.customer_name ? ` · ${detail.customer_name}` : ""}
                {` · ${crew.length} crew`}
                {mode === "attendance" ? ` · ${presentCount} present` : ""}
              </p>
            </>
          )}
        </div>
        {mode === "assignments" && detail && (
          <div className="flex gap-2">
            {(["crew", "leaders"] as const).map((panel) => (
              <button
                key={panel}
                type="button"
                onClick={() => setStaffPanel(panel)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm capitalize",
                  staffPanel === panel ? "bg-[#0d182b] text-white" : "bg-[#f0ece3] text-[#5c6558]"
                )}
              >
                {panel}
              </button>
            ))}
          </div>
        )}
      </div>

      {detailLoading && <div className="h-36 rounded-xl bg-[#f4f1ea] dark:bg-slate-950" />}

      {detail && mode === "assignments" && staffPanel === "leaders" && (
        <div>
          <SectionHead title="Leaders" hint="They staff the crew. One person can lead more than one event." />
          <DataTable minWidth="560px">
            <THead>
              <Th>Leader</Th>
              <Th>Role</Th>
              <Th align="right">Actions</Th>
            </THead>
            <TBody>
              {(detail.team_leaders || []).length === 0 && <EmptyRow cols={3} text="No leader assigned yet." />}
              {(detail.team_leaders || []).map((leader: any) => (
                <tr key={leader.worker_id}>
                  <Td className="font-medium">{leader.worker_name}</Td>
                  <Td className="text-[#6b7368]">{leader.position || leader.employment_type || "—"}</Td>
                  <Td align="right">
                    <div className="inline-flex gap-1">
                      <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" disabled={shareLinkMut.isPending} onClick={() => shareLinkMut.mutate(leader.worker_id)}>
                        <Link2 className="h-3.5 w-3.5" /> Link
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-[#8a9184] hover:text-red-600" disabled={removeLeaderMut.isPending} onClick={() => removeLeaderMut.mutate(leader.worker_id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </TBody>
          </DataTable>
          <div className="mt-4 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a9184]" />
              <Input
                className="pl-9 h-9 rounded-xl border-0 bg-[#f4f1ea] dark:bg-slate-900"
                placeholder="Search a worker to add as leader"
                value={leaderSearch}
                onChange={(e) => setLeaderSearch(e.target.value)}
              />
            </div>
            {canSearchLeaders && (
              <DataTable minWidth="480px" maxHeight="220px">
                <THead>
                  <Th>Worker</Th>
                  <Th>Position</Th>
                  <Th align="right"> </Th>
                </THead>
                <TBody>
                  {leaderMatches.filter((w: any) => !(detail.team_leaders || []).some((l: any) => l.worker_id === w.id)).length === 0 && (
                    <EmptyRow cols={3} text="No matching workers." />
                  )}
                  {leaderMatches
                    .filter((w: any) => !(detail.team_leaders || []).some((l: any) => l.worker_id === w.id))
                    .map((w: any) => (
                      <tr key={w.id}>
                        <Td className="font-medium">{w.full_name}</Td>
                        <Td className="text-[#6b7368]">{w.position || w.employment_type}</Td>
                        <Td align="right">
                          <Button size="sm" className="rounded-xl bg-[#668c65] hover:bg-[#557554]" disabled={assignLeaderMut.isPending} onClick={() => assignLeaderMut.mutate(w.id)}>
                            Add
                          </Button>
                        </Td>
                      </tr>
                    ))}
                </TBody>
              </DataTable>
            )}
          </div>
        </div>
      )}

      {detail && ((mode === "assignments" && staffPanel === "crew") || mode === "schedules") && (
        <div>
          <SectionHead
            title="Crew"
            hint={`${crew.length} assigned. Search to add people. Only those who work this event can be paid.`}
            actions={
              crew.length > 8 ? (
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a9184]" />
                  <Input
                    className="pl-9 h-9 rounded-xl border-0 bg-[#f4f1ea] dark:bg-slate-900"
                    placeholder="Filter crew"
                    value={crewSearch}
                    onChange={(e) => setCrewSearch(e.target.value)}
                  />
                </div>
              ) : undefined
            }
          />
          <DataTable minWidth="560px" maxHeight="360px">
            <THead>
              <Th>Worker</Th>
              <Th>Role</Th>
              <Th>{mode === "schedules" ? "Availability" : "Attendance"}</Th>
            </THead>
            <TBody>
              {crew.length === 0 && <EmptyRow cols={3} text="No crew on this event yet." />}
              {crew.length > 0 && visibleCrew.length === 0 && <EmptyRow cols={3} text="No crew match that filter." />}
              {visibleCrew.map((a: any) => {
                const att = attendanceRows.find((x: any) => x.worker_id === a.worker_id)
                const status = att?.status || "pending"
                return (
                  <tr key={a.id}>
                    <Td className="font-medium">{a.worker_name}</Td>
                    <Td className="text-[#6b7368]">{a.role_label || "—"}</Td>
                    <Td>
                      {mode === "assignments" ? (
                        <Select value={status} onValueChange={(next) => attendanceMut.mutate([{ worker_id: a.worker_id, status: next, hours_worked: 8 }])}>
                          <SelectTrigger className={cn("w-full sm:w-40 h-9 rounded-xl border-0 text-sm font-medium", attendanceTone(status))}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ATTENDANCE_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <QuietStatus status={a.availability_status} />
                      )}
                    </Td>
                  </tr>
                )
              })}
            </TBody>
          </DataTable>

          {mode === "assignments" && (
            <div className="mt-6">
              <p className="text-sm font-medium text-[#0d182b] dark:text-white mb-2">Add people</p>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <Input
                  placeholder="Role for selected, e.g. Lead dancer"
                  value={roleLabel}
                  onChange={(e) => setRoleLabel(e.target.value)}
                  className="h-9 rounded-xl border-0 bg-[#f4f1ea] dark:bg-slate-900 sm:max-w-xs"
                />
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a9184]" />
                  <Input
                    className="pl-9 h-9 rounded-xl border-0 bg-[#f4f1ea] dark:bg-slate-900"
                    placeholder="Type at least 2 letters to find workers"
                    value={workerSearch}
                    onChange={(e) => setWorkerSearch(e.target.value)}
                  />
                </div>
              </div>
              {canSearchCrew && (
                <>
                  <DataTable minWidth="560px" maxHeight="240px">
                    <THead>
                      <Th> </Th>
                      <Th>Worker</Th>
                      <Th>Position</Th>
                      <Th>Code</Th>
                    </THead>
                    <TBody>
                      {searchableWorkers.length === 0 && <EmptyRow cols={4} text="No workers match that search." />}
                      {searchableWorkers.map((w: any) => {
                        const checked = selectedWorkers.includes(w.id)
                        return (
                          <tr key={w.id} className="cursor-pointer" onClick={() => setSelectedWorkers((prev) =>
                            checked ? prev.filter((x) => x !== w.id) : [...prev, w.id]
                          )}>
                            <Td>
                              <input type="checkbox" className="h-4 w-4 accent-[#668c65]" checked={checked} readOnly />
                            </Td>
                            <Td className="font-medium">{w.full_name}</Td>
                            <Td className="text-[#6b7368]">{w.position || w.employment_type}</Td>
                            <Td className="text-[#6b7368]">{w.employee_code}</Td>
                          </tr>
                        )
                      })}
                    </TBody>
                  </DataTable>
                  <Button
                    className="mt-3 bg-[#0d182b] hover:bg-[#15233a] rounded-xl"
                    disabled={!selectedWorkers.length || assignWorkersMut.isPending}
                    onClick={() => assignWorkersMut.mutate()}
                  >
                    Assign {selectedWorkers.length || ""} to event
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {detail && mode === "attendance" && (
        <div>
          <SectionHead
            title="Who worked"
            hint={`${presentCount} present · ${crew.length} assigned. Submit does not pay anyone.`}
            actions={
              crew.length > 8 ? (
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a9184]" />
                  <Input
                    className="pl-9 h-9 rounded-xl border-0 bg-[#f4f1ea] dark:bg-slate-900"
                    placeholder="Filter crew"
                    value={crewSearch}
                    onChange={(e) => setCrewSearch(e.target.value)}
                  />
                </div>
              ) : undefined
            }
          />
          <DataTable minWidth="560px" maxHeight="420px">
            <THead>
              <Th>Worker</Th>
              <Th>Role</Th>
              <Th>Attendance</Th>
            </THead>
            <TBody>
              {crew.length === 0 && <EmptyRow cols={3} text="No crew on this event yet." />}
              {crew.length > 0 && visibleCrew.length === 0 && <EmptyRow cols={3} text="No crew match that filter." />}
              {visibleCrew.map((a: any) => {
                const att = attendanceRows.find((x: any) => x.worker_id === a.worker_id)
                const status = att?.status || "pending"
                return (
                  <tr key={a.id}>
                    <Td className="font-medium">{a.worker_name}</Td>
                    <Td className="text-[#6b7368]">{a.role_label || "—"}</Td>
                    <Td>
                      <Select value={status} onValueChange={(next) => attendanceMut.mutate([{ worker_id: a.worker_id, status: next, hours_worked: 8 }])}>
                        <SelectTrigger className={cn("w-full sm:w-40 h-9 rounded-xl border-0 text-sm font-medium", attendanceTone(status))}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ATTENDANCE_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Td>
                  </tr>
                )
              })}
            </TBody>
          </DataTable>
          {crew.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <Button
                className="bg-[#668c65] hover:bg-[#557554] rounded-xl w-full sm:w-auto"
                disabled={submitAttMut.isPending}
                onClick={() => submitAttMut.mutate()}
              >
                {submitAttMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Submit attendance
              </Button>
              {(detail.payroll_run || detail.unpaid_eligible_count > 0) && (
                <p className="text-sm text-[#6b7368]">
                  {detail.payroll_run
                    ? `Included in ${detail.payroll_run.title || "payroll"} · ${money(detail.payroll_run.net_total, detail.payroll_run.currency)}`
                    : `${detail.unpaid_eligible_count} unpaid on this event. Open Pay → Payroll to sum with other events.`}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </PageCanvas>
  )
}


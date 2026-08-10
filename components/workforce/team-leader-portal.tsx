"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Calendar, Loader2, MapPin, Search, Users, CheckCircle2,
  ClipboardCheck, Send, UserPlus,
} from "lucide-react"
import { workforceLeaderPublicApi } from "@/lib/api/workforce-leader-public"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type PortalTab = "assign" | "attendance"

const ATTENDANCE_STATUSES = [
  "pending", "present", "late", "absent", "left_early", "overtime", "excused",
]

function statusLabel(status: string) {
  return status.replace(/_/g, " ")
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    present: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    absent: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
    late: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    pending: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    overtime: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
    excused: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
    left_early: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
    attendance_submitted: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
    staffing: "bg-sky-100 text-sky-800",
    ready: "bg-emerald-100 text-emerald-800",
  }
  return (
    <Badge className={cn("capitalize border-0 font-medium", map[status] || "bg-muted text-foreground")}>
      {statusLabel(status)}
    </Badge>
  )
}

const TABS: { id: PortalTab; label: string; icon: typeof Users }[] = [
  { id: "assign", label: "Assign Workers", icon: UserPlus },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
]

export function TeamLeaderPortal({ token }: { token: string }) {
  const qc = useQueryClient()
  const [tab, setTab] = useState<PortalTab>("assign")
  const [search, setSearch] = useState("")
  const [roleLabel, setRoleLabel] = useState("")
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([])

  const { data: eventData, isLoading, error } = useQuery({
    queryKey: ["leader-event", token],
    queryFn: async () => (await workforceLeaderPublicApi.getEvent(token)).data,
    retry: false,
  })

  const { data: workersData, isLoading: workersLoading } = useQuery({
    queryKey: ["leader-workers", token, search],
    queryFn: async () => (await workforceLeaderPublicApi.listWorkers(token, search.trim() || undefined)).data,
    enabled: !!token && tab === "assign",
  })

  const workers = workersData?.items || []
  const assignments = eventData?.assignments || []
  const attendance = eventData?.attendance || []
  const assignedIds = useMemo(
    () => new Set(assignments.map((a: any) => a.worker_id)),
    [assignments]
  )

  const attendanceSubmitted = eventData?.event?.status === "attendance_submitted"
    || !!eventData?.event?.attendance_submitted_at

  const pendingCount = attendance.filter((a: any) => a.status === "pending").length

  const assignMut = useMutation({
    mutationFn: () => workforceLeaderPublicApi.assignWorkers(
      token,
      selectedWorkers.map((id) => ({ worker_id: id, role_label: roleLabel || undefined }))
    ),
    onSuccess: (res) => {
      const conflicts = res.data?.conflicts || []
      if (conflicts.length) toast.warning(`${conflicts.length} worker(s) could not be assigned`)
      else toast.success("Workers assigned successfully")
      setSelectedWorkers([])
      qc.invalidateQueries({ queryKey: ["leader-event", token] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed to assign workers"),
  })

  const attendanceMut = useMutation({
    mutationFn: (records: { worker_id: string; status: string; hours_worked?: number }[]) =>
      workforceLeaderPublicApi.recordAttendance(token, records),
    onSuccess: () => {
      toast.success("Attendance saved")
      qc.invalidateQueries({ queryKey: ["leader-event", token] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed to save attendance"),
  })

  const submitAttendanceMut = useMutation({
    mutationFn: () => workforceLeaderPublicApi.submitAttendance(token),
    onSuccess: () => {
      toast.success("Attendance submitted to the owner for payroll review")
      qc.invalidateQueries({ queryKey: ["leader-event", token] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed to submit attendance"),
  })

  const updateAttendance = (workerId: string, status: string) => {
    if (attendanceSubmitted) return
    attendanceMut.mutate([{ worker_id: workerId, status, hours_worked: 8 }])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 space-y-4 max-w-lg mx-auto">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-12 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    )
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <Card className="max-w-md w-full rounded-2xl">
          <CardContent className="p-8 text-center">
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">Link unavailable</p>
            <p className="text-sm text-muted-foreground mt-2">
              This team leader link is invalid, expired, or has been revoked. Ask the provider for a new link.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const event = eventData.event

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d182b] via-[#0d182b] to-slate-100 dark:to-slate-950 pb-8">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        {/* Header */}
        <div className="text-white space-y-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-semibold">
            Team Leader Portal
          </p>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight leading-tight">{event.title}</h1>
            <p className="text-sm text-white/70 mt-1">Hello, {eventData.leader_name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/75">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {event.event_date}
            </span>
            {event.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {event.location}
              </span>
            )}
            <StatusBadge status={event.status} />
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 rounded-2xl border border-white/10 bg-white/10 p-1 backdrop-blur-sm"
          role="tablist"
          aria-label="Team leader sections"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const count = id === "assign" ? assignments.length : pendingCount
            const showBadge = id === "assign" ? assignments.length > 0 : pendingCount > 0 && !attendanceSubmitted
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  tab === id
                    ? "bg-white text-[#0d182b] shadow-sm"
                    : "text-white/80 hover:bg-white/10"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", tab === id ? "text-[#668c65]" : "opacity-80")} />
                <span className="truncate">{label}</span>
                {showBadge && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-5 min-w-5 px-1.5 text-[10px] rounded-md",
                      tab === id ? "bg-[#668c65]/15 text-[#668c65]" : "bg-white/20 text-white"
                    )}
                  >
                    {count}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab panels */}
        <Card className="rounded-2xl border-0 shadow-xl">
          {tab === "assign" && (
            <CardContent className="p-5 space-y-5">
              <div>
                <CardTitle className="text-base">Assign workers</CardTitle>
                <CardDescription className="mt-1">
                  Search and add dancers or participants to this event.
                </CardDescription>
              </div>

              {assignments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Assigned crew ({assignments.length})
                  </p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {assignments.map((a: any) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{a.worker_name}</p>
                          <p className="text-xs text-muted-foreground">{a.role_label || "Crew member"}</p>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-[#668c65] shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                <Input
                  placeholder="Role for selected (e.g. Lead Dancer, Drummer)"
                  value={roleLabel}
                  onChange={(e) => setRoleLabel(e.target.value)}
                  className="rounded-xl"
                />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 rounded-xl"
                    placeholder="Search by name, role, phone, or code…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {workers.length} available · {selectedWorkers.length} selected
                </p>
                <div className="max-h-52 overflow-y-auto space-y-1 border rounded-xl p-2">
                  {workersLoading && <Skeleton className="h-12 rounded-lg" />}
                  {!workersLoading && workers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No workers found.</p>
                  )}
                  {workers.map((w: any) => {
                    const checked = selectedWorkers.includes(w.id)
                    const alreadyAssigned = assignedIds.has(w.id)
                    return (
                      <label
                        key={w.id}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition",
                          alreadyAssigned
                            ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900"
                            : "hover:bg-slate-50 dark:hover:bg-slate-900"
                        )}
                      >
                        <input
                          type="checkbox"
                          disabled={alreadyAssigned}
                          checked={checked}
                          onChange={() => setSelectedWorkers((prev) =>
                            checked ? prev.filter((x) => x !== w.id) : [...prev, w.id]
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{w.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {w.position || w.employment_type}
                            {w.phone ? ` · ${w.phone}` : ""}
                          </p>
                        </div>
                        {alreadyAssigned && (
                          <Badge variant="secondary" className="text-[10px] shrink-0">Assigned</Badge>
                        )}
                      </label>
                    )
                  })}
                </div>
                <Button
                  className="w-full rounded-xl bg-[#668c65] hover:bg-[#557554]"
                  disabled={!selectedWorkers.length || assignMut.isPending}
                  onClick={() => assignMut.mutate()}
                >
                  {assignMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Assign {selectedWorkers.length || ""} worker{selectedWorkers.length === 1 ? "" : "s"}
                </Button>

                {assignments.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => setTab("attendance")}
                  >
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Go to attendance
                  </Button>
                )}
              </div>
            </CardContent>
          )}

          {tab === "attendance" && (
            <CardContent className="p-5 space-y-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-[#668c65]" />
                  Record attendance
                </CardTitle>
                <CardDescription className="mt-1">
                  Mark who attended, then submit to the owner for payroll.
                </CardDescription>
              </div>

              {attendanceSubmitted && (
                <div className="rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 px-4 py-3 text-sm">
                  <p className="font-medium text-violet-900 dark:text-violet-100">Attendance submitted</p>
                  <p className="text-violet-700 dark:text-violet-300 text-xs mt-1">
                    The owner has been notified and can review attendance and generate payroll.
                    {event.attendance_submitted_at && (
                      <> Submitted {String(event.attendance_submitted_at).slice(0, 16).replace("T", " ")}.</>
                    )}
                  </p>
                </div>
              )}

              {assignments.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No workers assigned yet. Add your crew first.
                  </p>
                  <Button variant="outline" className="rounded-xl" onClick={() => setTab("assign")}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign workers
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {assignments.map((a: any) => {
                      const att = attendance.find((x: any) => x.worker_id === a.worker_id)
                      const currentStatus = att?.status || "pending"
                      return (
                        <div
                          key={a.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between rounded-xl border border-slate-100 dark:border-slate-800 px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{a.worker_name}</p>
                            <p className="text-xs text-muted-foreground">{a.role_label || "Crew member"}</p>
                          </div>
                          <Select
                            value={currentStatus}
                            disabled={attendanceSubmitted || attendanceMut.isPending}
                            onValueChange={(status) => updateAttendance(a.worker_id, status)}
                          >
                            <SelectTrigger className="w-full sm:w-44 rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ATTENDANCE_STATUSES.map((s) => (
                                <SelectItem key={s} value={s} className="capitalize">
                                  {statusLabel(s)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )
                    })}
                  </div>

                  {!attendanceSubmitted && (
                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {pendingCount > 0 && (
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          {pendingCount} worker{pendingCount === 1 ? "" : "s"} still pending — update before submitting if possible.
                        </p>
                      )}
                      <Button
                        className="w-full rounded-xl bg-[#0d182b] hover:bg-[#15233a]"
                        disabled={submitAttendanceMut.isPending || attendanceMut.isPending}
                        onClick={() => submitAttendanceMut.mutate()}
                      >
                        {submitAttendanceMut.isPending
                          ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          : <Send className="h-4 w-4 mr-2" />}
                        Submit attendance to owner
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          )}
        </Card>

        <p className="text-center text-[11px] text-slate-500">
          Powered by VowNests · Team leader access only
        </p>
      </div>
    </div>
  )
}

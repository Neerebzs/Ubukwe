"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import {
  Wallet, ArrowUpRight, Clock, CheckCircle2, XCircle,
  Search, Filter, MoreHorizontal, DollarSign, TrendingUp,
  AlertCircle, Ticket, BookOpen, Sparkles, ChevronDown,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const PERIOD_LABELS: Record<string, string> = {
  today: "Today",
  week: "Last 7 Days",
  month: "This Month",
  all: "All Time",
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:    "bg-amber-50 text-amber-700 border-amber-200",
    approved:   "bg-blue-50 text-blue-700 border-blue-200",
    processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
    completed:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected:   "bg-rose-50 text-rose-700 border-rose-200",
    confirmed:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  }
  return (
    <Badge variant="outline" className={cn("uppercase text-[9px] font-black tracking-widest px-3 rounded-full border", map[status] ?? "bg-slate-50 text-slate-600 border-slate-200")}>
      {status}
    </Badge>
  )
}

// ── Platform Earnings Tab ──────────────────────────────────────────────────────
function PlatformEarnings() {
  const [period, setPeriod] = useState("all")
  const [typeFilter, setTypeFilter] = useState<"all" | "booking" | "ticket">("all")

  const { data: earningsData, isLoading } = useQuery({
    queryKey: ["platform-earnings", period],
    queryFn: async () => {
      const res = await apiClient.admin.payments.getPlatformEarnings(period)
      return res.data as any
    },
    refetchInterval: 60_000,
  })

  const summary = earningsData?.summary ?? {}
  const bookings: any[] = earningsData?.bookings ?? []
  const tickets: any[] = earningsData?.tickets ?? []

  const allRows = [
    ...bookings.map(b => ({ ...b, type: "booking" })),
    ...tickets.map(t => ({ ...t, type: "ticket" })),
  ].sort((a, b) => new Date(b.paid_at ?? 0).getTime() - new Date(a.paid_at ?? 0).getTime())

  const filtered = typeFilter === "all" ? allRows : allRows.filter(r => r.type === typeFilter)

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-[2rem] border-none shadow-sm bg-[#608d64] text-white overflow-hidden">
          <CardContent className="p-8">
            <div className="p-3 bg-white/20 rounded-2xl w-fit mb-4">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Total Commission</p>
            <h3 className="text-2xl font-bold tracking-tight">
              {isLoading ? "—" : `RWF ${(summary.total_commission ?? 0).toLocaleString()}`}
            </h3>
            <p className="text-[9px] opacity-60 mt-1 uppercase tracking-widest">
              {PERIOD_LABELS[period]} · {((summary.commission_rate ?? 0.10) * 100).toFixed(0)}% rate
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-8">
            <div className="p-3 bg-blue-50 rounded-2xl w-fit mb-4">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Booking Commission</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isLoading ? "—" : `RWF ${(summary.booking_commission ?? 0).toLocaleString()}`}
            </h3>
            <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-8">
            <div className="p-3 bg-purple-50 rounded-2xl w-fit mb-4">
              <Ticket className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket Commission</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isLoading ? "—" : `RWF ${(summary.ticket_commission ?? 0).toLocaleString()}`}
            </h3>
            <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest">
              {tickets.length} event{tickets.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-8">
            <div className="p-3 bg-emerald-50 rounded-2xl w-fit mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Gross Revenue</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isLoading ? "—" : `RWF ${(
                [...bookings, ...tickets].reduce((s, r) => s + (r.gross_amount ?? 0), 0)
              ).toLocaleString()}`}
            </h3>
            <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest">
              Platform keeps 10%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-44 rounded-2xl border-slate-100 bg-white h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {Object.entries(PERIOD_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex bg-white rounded-full p-1 border border-slate-100 shadow-sm">
          {(["all", "booking", "ticket"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-5 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all",
                typeFilter === t ? "bg-[#608d64] text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {t === "all" ? "All" : t === "booking" ? "Bookings" : "Tickets"}
            </button>
          ))}
        </div>
      </div>

      {/* Earnings table */}
      <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <CardTitle className="text-xl font-bold text-slate-900">Commission Ledger</CardTitle>
          <CardDescription className="text-slate-400">
            Every transaction where the platform collected its 10% commission.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Sparkles className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-serif italic">No earnings recorded for this period.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-none">
                  <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Source</TableHead>
                  <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Provider</TableHead>
                  <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gross</TableHead>
                  <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-[#608d64]">Commission (10%)</TableHead>
                  <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Provider Payout (90%)</TableHead>
                  <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</TableHead>
                  <TableHead className="pr-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <TableCell className="pl-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                          row.type === "booking" ? "bg-blue-50" : "bg-purple-50"
                        )}>
                          {row.type === "booking"
                            ? <BookOpen className="w-4 h-4 text-blue-600" />
                            : <Ticket className="w-4 h-4 text-purple-600" />
                          }
                        </div>
                        <span className="text-sm font-medium text-slate-700 max-w-[160px] truncate">
                          {row.source}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{row.provider_name}</p>
                        <p className="text-[10px] text-slate-400">{row.provider_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-sm font-medium text-slate-700">
                      RWF {(row.gross_amount ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="py-5">
                      <span className="text-sm font-black text-[#608d64]">
                        RWF {(row.platform_commission ?? 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="py-5 text-sm text-slate-600">
                      RWF {(row.provider_payout ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="py-5 text-sm text-slate-500">
                      {row.paid_at ? format(new Date(row.paid_at), "MMM d, yyyy") : "—"}
                    </TableCell>
                    <TableCell className="pr-8 py-5">
                      <Badge variant="outline" className={cn(
                        "rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest border",
                        row.type === "booking"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : "bg-purple-50 text-purple-700 border-purple-100"
                      )}>
                        {row.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Withdrawals Tab ────────────────────────────────────────────────────────────
function WithdrawalsTab() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["admin-payment-stats"],
    queryFn: async () => {
      const res = await apiClient.admin.payments.getStats()
      return res.data as any
    },
  })

  const { data: withdrawalsRaw = [], isLoading: isWithdrawalsLoading } = useQuery({
    queryKey: ["admin-withdrawals", statusFilter],
    queryFn: async () => {
      const res = await apiClient.admin.payments.getWithdrawals(statusFilter)
      const data = res.data as any
      return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.admin.payments.updateWithdrawalStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] })
      queryClient.invalidateQueries({ queryKey: ["admin-payment-stats"] })
      toast.success("Withdrawal status updated")
    },
    onError: (err: any) => toast.error(err.message || "Failed to update status"),
  })

  const withdrawals = (withdrawalsRaw as any[]).filter((w: any) => {
    const text = `${w.provider_name ?? ""} ${w.provider_email ?? ""}`.toLowerCase()
    return text.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: stats?.totalRevenue, icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
          { label: "Platform Commission", value: stats?.platformCommission, icon: Sparkles, color: "bg-[#608d64]/10 text-[#608d64]" },
          { label: "Total Payouts", value: stats?.totalPayouts, icon: ArrowUpRight, color: "bg-blue-50 text-blue-600" },
          { label: "Pending Withdrawals", value: stats?.pendingWithdrawals, icon: Clock, color: "bg-amber-50 text-amber-600" },
        ].map((s, i) => (
          <Card key={i} className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-500">
            <CardContent className="p-8">
              <div className={cn("p-3 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform duration-500", s.color)}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {isStatsLoading ? <Skeleton className="h-7 w-28 rounded-xl" /> : `RWF ${(s.value ?? 0).toLocaleString()}`}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Withdrawal Requests</CardTitle>
              <CardDescription className="text-slate-400">Manage and approve provider payout requests.</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 rounded-2xl bg-slate-50 border-none h-12 text-sm"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-2xl h-12 gap-2 border-slate-200 font-bold uppercase text-[10px] tracking-widest">
                    <Filter className="w-4 h-4" />
                    {statusFilter === "all" ? "All" : statusFilter}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[180px]">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Filter By Status</DropdownMenuLabel>
                  {["all", "pending", "approved", "completed", "rejected"].map(s => (
                    <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)} className="rounded-xl py-3 capitalize font-medium">
                      {s === "all" ? "All Requests" : s}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none">
                <TableHead className="pl-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Provider</TableHead>
                <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Amount</TableHead>
                <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Requested</TableHead>
                <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</TableHead>
                <TableHead className="pr-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isWithdrawalsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12">
                    <div className="space-y-3 px-8">
                      {[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-2xl" />)}
                    </div>
                  </TableCell>
                </TableRow>
              ) : withdrawals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No withdrawal requests found</p>
                  </TableCell>
                </TableRow>
              ) : (
                withdrawals.map((w: any) => (
                  <TableRow key={w.id} className="group border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <TableCell className="pl-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                          {w.provider_name?.[0]?.toUpperCase() || "P"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{w.provider_name}</p>
                          <p className="text-xs text-slate-400">{w.provider_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 font-bold text-slate-900">
                      RWF {(w.amount ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="py-6 text-sm text-slate-500">
                      {w.requested_at ? format(new Date(w.requested_at), "MMM d, yyyy · HH:mm") : "—"}
                    </TableCell>
                    <TableCell className="py-6">
                      <StatusBadge status={w.status} />
                    </TableCell>
                    <TableCell className="pr-8 py-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-white">
                            <MoreHorizontal className="w-4 h-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px]">
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Manage</DropdownMenuLabel>
                          {w.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: w.id, status: "approved" })} className="rounded-xl py-3 text-emerald-600 font-bold focus:bg-emerald-50">
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: w.id, status: "rejected" })} className="rounded-xl py-3 text-rose-600 font-bold focus:bg-rose-50">
                                <XCircle className="w-4 h-4 mr-2" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {w.status === "approved" && (
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: w.id, status: "completed" })} className="rounded-xl py-3 text-emerald-600 font-bold focus:bg-emerald-50">
                              <Wallet className="w-4 h-4 mr-2" /> Mark Completed
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function AdminPayments() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif italic text-slate-900 tracking-tight">Financial Hub</h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-[1px] w-8 bg-[#608d64]/60" />
          <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">
            Platform Revenue & Provider Payouts
          </p>
        </div>
      </div>

      <Tabs defaultValue="earnings">
        <TabsList className="bg-white border border-slate-100 p-1.5 rounded-[1.8rem] h-auto w-fit shadow-sm">
          <TabsTrigger
            value="earnings"
            className="h-11 px-8 rounded-full text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-[#608d64] data-[state=active]:text-white data-[state=active]:shadow-xl text-slate-600"
          >
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            Platform Earnings
          </TabsTrigger>
          <TabsTrigger
            value="withdrawals"
            className="h-11 px-8 rounded-full text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-xl text-slate-600"
          >
            <Wallet className="w-3.5 h-3.5 mr-2" />
            Withdrawal Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="mt-8 focus-visible:outline-none">
          <PlatformEarnings />
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-8 focus-visible:outline-none">
          <WithdrawalsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

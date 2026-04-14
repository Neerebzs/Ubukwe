"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter,
  MoreHorizontal,
  ExternalLink,
  DollarSign,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function AdminPayments() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Fetch Payment Stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["admin-payment-stats"],
    queryFn: () => apiClient.admin.payments.getStats(),
  })

  // Fetch Withdrawal Requests
  const { data: withdrawals = [], isLoading: isWithdrawalsLoading } = useQuery({
    queryKey: ["admin-withdrawals", statusFilter],
    queryFn: () => apiClient.admin.payments.getWithdrawals(statusFilter),
  })

  // Mutation for updating status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiClient.admin.payments.updateWithdrawalStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] })
      queryClient.invalidateQueries({ queryKey: ["admin-payment-stats"] })
      toast.success("Withdrawal status updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status")
    }
  })

  const filteredWithdrawals = withdrawals.filter((w: any) => {
    const matchesSearch = 
      w.provider_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.provider_email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 uppercase text-[10px] font-black tracking-widest px-3 rounded-full">Pending</Badge>
      case "approved":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px] font-black tracking-widest px-3 rounded-full">Approved</Badge>
      case "processing":
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 uppercase text-[10px] font-black tracking-widest px-3 rounded-full">Processing</Badge>
      case "completed":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase text-[10px] font-black tracking-widest px-3 rounded-full">Completed</Badge>
      case "rejected":
        return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 uppercase text-[10px] font-black tracking-widest px-3 rounded-full">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isStatsLoading && isWithdrawalsLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[2rem] bg-white border-none shadow-sm" />
          ))}
        </div>
        <Skeleton className="h-[500px] rounded-[2rem] bg-white border-none shadow-sm" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-500">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none font-bold">+12%</Badge>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">RWF {stats?.totalRevenue?.toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-500">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <ArrowUpRight className="w-5 h-5 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-blue-400 opacity-50" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payouts</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">RWF {stats?.totalPayouts?.toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-500">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex -space-x-2">
                 <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white" />
                 <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white" />
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Withdrawals</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">RWF {stats?.pendingWithdrawals?.toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-500">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-100 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <Wallet className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active</p>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Platform Reserve</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">RWF {( (stats?.totalRevenue ?? 0) - (stats?.totalPayouts ?? 0) ).toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Area */}
      <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Withdrawal Requests</CardTitle>
              <CardDescription className="text-slate-400 font-medium">Manage and approve provider payout requests.</CardDescription>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search providers..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 rounded-2xl bg-slate-50 border-none h-12 text-sm focus-visible:ring-sage-500/20"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-2xl h-12 gap-2 border-slate-200 font-bold uppercase text-[10px] tracking-widest">
                    <Filter className="w-4 h-4" />
                    {statusFilter === "all" ? "All Status" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[180px]">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Filter By Status</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")} className="rounded-xl py-3">All Requests</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")} className="rounded-xl py-3 text-amber-600 font-medium">Pending Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("approved")} className="rounded-xl py-3 text-blue-600 font-medium">Approved Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("completed")} className="rounded-xl py-3 text-emerald-600 font-medium">Completed Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("rejected")} className="rounded-xl py-3 text-rose-600 font-medium">Rejected Only</DropdownMenuItem>
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
                <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Requested At</TableHead>
                <TableHead className="py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</TableHead>
                <TableHead className="pr-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWithdrawals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <div className="p-4 bg-slate-50 rounded-full mb-2">
                         <AlertCircle className="w-6 h-6 text-slate-300" />
                       </div>
                       <p className="text-sm font-bold text-slate-500">No withdrawal requests found</p>
                       <p className="text-xs text-slate-400">Change your filters or search term.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredWithdrawals.map((withdrawal: any) => (
                  <TableRow key={withdrawal.id} className="group border-b border-slate-50 hover:bg-slate-50/30 transition-colors duration-300">
                    <TableCell className="pl-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-white transition-colors">
                          {withdrawal.provider_name?.[0]?.toUpperCase() || "P"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 tracking-tight">{withdrawal.provider_name}</span>
                          <span className="text-xs text-slate-400">{withdrawal.provider_email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 font-bold text-slate-900 tracking-tight">
                      RWF {withdrawal.amount?.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-6 text-sm text-slate-500 font-medium">
                      {format(new Date(withdrawal.requested_at), "MMM d, yyyy · HH:mm")}
                    </TableCell>
                    <TableCell className="py-6">
                      {getStatusBadge(withdrawal.status)}
                    </TableCell>
                    <TableCell className="pr-8 py-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-white border-transparent hover:border-slate-100 group">
                            <MoreHorizontal className="w-4 h-4 text-slate-400 group-hover:text-slate-900" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px]">
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Manage Request</DropdownMenuLabel>
                          {withdrawal.status === "pending" && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => updateStatusMutation.mutate({ id: withdrawal.id, status: "approved" })}
                                className="rounded-xl py-3 text-emerald-600 font-bold focus:bg-emerald-50"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Request
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => updateStatusMutation.mutate({ id: withdrawal.id, status: "rejected" })}
                                className="rounded-xl py-3 text-rose-600 font-bold focus:bg-rose-50"
                              >
                                <XCircle className="w-4 h-4 mr-2" /> Reject Request
                              </DropdownMenuItem>
                            </>
                          )}
                          {withdrawal.status === "approved" && (
                            <DropdownMenuItem 
                              onClick={() => updateStatusMutation.mutate({ id: withdrawal.id, status: "completed" })}
                              className="rounded-xl py-3 text-emerald-600 font-bold focus:bg-emerald-50"
                            >
                              <Wallet className="w-4 h-4 mr-2" /> Mark Completed
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-xl py-3 text-slate-600">
                             <ExternalLink className="w-4 h-4 mr-2" /> View Provider Info
                          </DropdownMenuItem>
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

"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, AlertCircle, Clock, CheckCircle, XCircle, Search, Filter, MessageSquare, DollarSign } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { StatCard } from "./stat-card"
import Link from "next/link"

interface Dispute {
  id: string
  customer_name?: string
  provider_name?: string
  service_name?: string
  booking_id?: string
  issue?: string
  description?: string
  priority: "high" | "medium" | "low"
  status: "pending" | "investigating" | "resolved" | "rejected"
  created_at: string
  deadline?: string
  requested_resolution?: string
  booking_amount?: number
}

export function AdminDisputeResolution() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const { data: disputes = [], isLoading } = useQuery<Dispute[]>({
    queryKey: ["admin-disputes"],
    queryFn: async () => {
      const res = await axiosInstance.get<any>("/api/v1/admin/disputes")
      return res.data?.data ?? res.data ?? []
    },
    refetchInterval: 30_000,
  })

  const filtered = disputes.filter((d) => {
    const name = `${d.customer_name ?? ""} ${d.provider_name ?? ""} ${d.issue ?? d.description ?? ""}`.toLowerCase()
    return (
      name.includes(searchTerm.toLowerCase()) &&
      (statusFilter === "all" || d.status === statusFilter) &&
      (priorityFilter === "all" || d.priority === priorityFilter)
    )
  })

  const stats = {
    total: disputes.length,
    pending: disputes.filter(d => d.status === "pending").length,
    investigating: disputes.filter(d => d.status === "investigating").length,
    resolved: disputes.filter(d => d.status === "resolved").length,
    highPriority: disputes.filter(d => d.priority === "high" && d.status !== "resolved").length,
  }

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, string> = {
      high: "bg-red-50 text-red-700 border-red-100",
      medium: "bg-amber-50 text-amber-700 border-amber-100",
      low: "bg-slate-50 text-slate-700 border-slate-100",
    }
    return (
      <Badge variant="outline" className={`rounded-full px-4 py-1 uppercase tracking-[0.1em] text-[10px] font-bold ${map[priority] ?? map.medium}`}>
        {priority} priority
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-[#608d64]/10 text-[#608d64] border-[#608d64]/20",
      investigating: "bg-blue-50 text-blue-700 border-blue-100",
      resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
      rejected: "bg-rose-50 text-rose-700 border-rose-100",
    }
    return (
      <Badge variant="outline" className={`rounded-full px-4 py-1 uppercase tracking-[0.1em] text-[10px] font-bold ${map[status] ?? map.pending}`}>
        {status}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-[2.5rem]" />)}
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900 tracking-tight">Resolution Sanctuary</h2>
          <p className="text-slate-700 mt-2 uppercase tracking-[0.2em] text-xs font-medium">Platform Harmony & Dispute Governance</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search disputes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 w-[280px] rounded-full border-slate-200 h-12"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Active Disputes" value={stats.total} />
        <StatCard label="Awaiting Review" value={stats.pending} />
        <StatCard label="Under Analysis" value={stats.investigating} />
        <StatCard label="Resolved" value={stats.resolved} />
        <StatCard label="Critical" value={stats.highPriority} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex bg-white rounded-full p-1 border border-slate-100 shadow-sm">
          {["all", "pending", "investigating", "resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${statusFilter === s ? "bg-[#608d64] text-white shadow-md" : "text-slate-700 hover:bg-slate-50"}`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[160px] rounded-full border-slate-100 bg-white h-11">
            <Filter className="w-3 h-3 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No disputes found"
          description="The resolution sanctuary is clear."
          icon={<CheckCircle className="h-16 w-16 mx-auto text-[#608d64]/20" />}
        />
      ) : (
        <div className="grid gap-8">
          {filtered.map((dispute) => (
            <Card key={dispute.id} className="rounded-[2.5rem] border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 bg-white">
              <CardHeader className="p-10 pb-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold tracking-widest">
                        {dispute.id.slice(0, 8).toUpperCase()}
                      </span>
                      {getPriorityBadge(dispute.priority)}
                      {getStatusBadge(dispute.status)}
                    </div>
                    <h3 className="text-2xl font-serif italic text-slate-900">
                      "{dispute.issue ?? dispute.description ?? "Service dispute"}"
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground shrink-0">
                    {new Date(dispute.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-0">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-t border-slate-50 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Customer</p>
                    <p className="font-serif italic text-[#608d64]">{dispute.customer_name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Provider</p>
                    <p className="font-serif italic text-slate-900">{dispute.provider_name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Amount</p>
                    <p className="font-medium">{dispute.booking_amount ? `${dispute.booking_amount.toLocaleString()} RWF` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Resolution</p>
                    <p className="font-medium capitalize">{dispute.requested_resolution?.replace(/-/g, " ") ?? "—"}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-slate-50">
                  <Button variant="ghost" className="rounded-full text-[10px] uppercase tracking-widest font-black" asChild>
                    <Link href={`/admin/disputes/resolve/${dispute.id}`}>
                      <Eye className="w-4 h-4 mr-2" />Enter Resolver
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

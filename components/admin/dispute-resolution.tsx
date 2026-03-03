"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, AlertCircle, Clock, CheckCircle, XCircle, Search, Filter, MessageSquare, DollarSign } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import Link from "next/link"

interface Dispute {
  id: string
  customer: string
  provider: string
  serviceName: string
  bookingId: string
  issue: string
  priority: "high" | "medium" | "low"
  status: "pending" | "investigating" | "resolved" | "rejected"
  createdAt: string
  deadline: string
  requestedResolution: string
  bookingAmount: number
}

import { StatCard } from "./stat-card"

export function AdminDisputeResolution() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

  const disputes: Dispute[] = [
    {
      id: "DSP-001",
      customer: "Grace Mukamana",
      provider: "Intore Cultural Group",
      serviceName: "Traditional Dancers",
      bookingId: "BK-2024-001",
      issue: "Dancers arrived 2 hours late",
      priority: "high",
      status: "investigating",
      createdAt: "2024-03-10",
      deadline: "2024-03-17",
      requestedResolution: "partial-refund",
      bookingAmount: 120000,
    },
    {
      id: "DSP-002",
      customer: "Jean Baptiste",
      provider: "Kigali Catering Co.",
      serviceName: "Catering Services",
      bookingId: "BK-2024-002",
      issue: "Food quality concerns",
      priority: "medium",
      status: "pending",
      createdAt: "2024-03-12",
      deadline: "2024-03-19",
      requestedResolution: "full-refund",
      bookingAmount: 500000,
    },
    {
      id: "DSP-003",
      customer: "Marie Uwimana",
      provider: "Heritage Decorations",
      serviceName: "Wedding Decorations",
      bookingId: "BK-2024-003",
      issue: "Late delivery",
      priority: "low",
      status: "resolved",
      createdAt: "2024-03-05",
      deadline: "2024-03-12",
      requestedResolution: "re-service",
      bookingAmount: 200000,
    },
  ]

  const filteredDisputes = disputes.filter((d) => {
    const matchesSearch =
      d.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.issue.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || d.status === statusFilter
    const matchesPriority = priorityFilter === "all" || d.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { className: string; label: string }> = {
      high: { className: "bg-red-50 text-red-700 border-red-100", label: "Urgent Priority" },
      medium: { className: "bg-amber-50 text-amber-700 border-amber-100", label: "Standard Priority" },
      low: { className: "bg-slate-50 text-slate-700 border-slate-100", label: "Low Priority" },
    }
    const c = config[priority] || config.medium
    return (
      <Badge variant="outline" className={`rounded-full px-4 py-1 uppercase tracking-[0.1em] text-[10px] font-bold ${c.className}`}>
        {c.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string }> = {
      pending: { className: "bg-[#608d64]/10 text-[#608d64] border-[#608d64]/20", label: "Awaiting Review" },
      investigating: { className: "bg-blue-50 text-blue-700 border-blue-100", label: "Under Analysis" },
      resolved: { className: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "Resolved" },
      rejected: { className: "bg-rose-50 text-rose-700 border-rose-100", label: "Dismissed" },
    }
    const c = config[status] || config.pending
    return (
      <Badge variant="outline" className={`rounded-full px-4 py-1 uppercase tracking-[0.1em] text-[10px] font-bold ${c.className}`}>
        {c.label}
      </Badge>
    )
  }

  const stats = {
    total: disputes.length,
    pending: disputes.filter((d) => d.status === "pending").length,
    investigating: disputes.filter((d) => d.status === "investigating").length,
    resolved: disputes.filter((d) => d.status === "resolved").length,
    highPriority: disputes.filter((d) => d.priority === "high" && d.status !== "resolved").length,
  }

  return (
    <div className="space-y-12 pb-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900 tracking-tight">Resolution Sanctuary</h2>
          <p className="text-slate-700 mt-2 uppercase tracking-[0.2em] text-xs font-medium">Platform Harmony & Dispute Governance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#608d64] transition-colors w-4 h-4" />
            <Input
              placeholder="SEARCH RESOLUTIONS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 w-[280px] rounded-full border-slate-200 focus:border-[#608d64] focus:ring-[#608d64]/10 bg-white/50 backdrop-blur-sm uppercase tracking-widest text-[10px] h-12 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Stats - Platform Intel */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Active Disputes" value={stats.total} />
        <StatCard label="Awaiting Review" value={stats.pending} />
        <StatCard label="Under Analysis" value={stats.investigating} />
        <StatCard label="Harmony Restored" value={stats.resolved} />
        <StatCard label="Critical Priority" value={stats.highPriority} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 pt-4">
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600">Refine Registry:</div>
        <div className="flex bg-white rounded-full p-1 border border-slate-100 shadow-sm">
          {["all", "pending", "investigating", "resolved"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${statusFilter === status
                ? "bg-[#608d64] text-white shadow-md shadow-[#608d64]/20"
                : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              {status === "all" ? "Whole Registry" : status}
            </button>
          ))}
        </div>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[200px] rounded-full border-slate-100 bg-white uppercase tracking-widest text-[10px] h-11 shadow-sm">
            <Filter className="w-3 h-3 mr-2 text-slate-600" />
            <SelectValue placeholder="PRIORITY" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-100">
            <SelectItem value="all" className="uppercase tracking-widest text-[10px]">ALL PRIORITIES</SelectItem>
            <SelectItem value="high" className="uppercase tracking-widest text-[10px]">CRITICAL</SelectItem>
            <SelectItem value="medium" className="uppercase tracking-widest text-[10px]">STANDARD</SelectItem>
            <SelectItem value="low" className="uppercase tracking-widest text-[10px]">LOW</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Disputes Registry */}
      {filteredDisputes.length === 0 ? (
        <EmptyState
          title="Registry Clear"
          description="The resolution sanctuary reflects perfect platform harmony."
          icon={<CheckCircle className="h-16 w-16 mx-auto text-[#608d64]/20" />}
        />
      ) : (
        <div className="grid gap-8">
          {filteredDisputes.map((dispute) => (
            <Card key={dispute.id} className="rounded-[2.5rem] border-slate-100 shadow-sm hover:shadow-xl transition-all duration-700 overflow-hidden bg-white group border-l-0 border-r-0 md:border-l md:border-r">
              <CardHeader className="p-10 pb-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold tracking-widest">
                        {dispute.id}
                      </span>
                      {getPriorityBadge(dispute.priority)}
                      {getStatusBadge(dispute.status)}
                    </div>
                    <h3 className="text-3xl font-serif italic text-slate-900 leading-tight pr-12">
                      “{dispute.issue}”
                    </h3>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <div className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-600 mb-1">Filing Date</div>
                    <div className="text-sm font-medium text-slate-900">{new Date(dispute.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-0">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-t border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-600">Customer Identity</p>
                    <p className="text-lg font-serif italic text-[#608d64]">{dispute.customer}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-600">Provider Entity</p>
                    <p className="text-lg font-serif italic text-slate-900">{dispute.provider}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-600">Economic Volume</p>
                    <p className="text-lg font-medium text-slate-900">{dispute.bookingAmount.toLocaleString()} RWF</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-600">Proposed Finality</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-[#608d64]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {dispute.requestedResolution.replace(/-/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">
                        Deadline: {new Date(dispute.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full">
                      <DollarSign className="w-3 h-3 text-slate-600" />
                      <span className="text-[10px] uppercase tracking-widest font-black text-slate-700">
                        Booking: {dispute.bookingId}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="ghost" className="flex-1 md:flex-none h-12 rounded-full text-[10px] uppercase tracking-[0.2em] font-black text-slate-700 hover:text-slate-900 hover:bg-slate-50" asChild>
                      <Link href={`/admin/disputes/resolve/${dispute.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Enter Resolver
                      </Link>
                    </Button>
                    <Button className="flex-1 md:flex-none h-12 px-8 rounded-full bg-slate-900 text-white text-[10px] uppercase tracking-[0.2em] font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Open Dialogue
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


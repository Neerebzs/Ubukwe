"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, AlertCircle, Clock, CheckCircle, MessageSquare, FileText, Search, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

interface Dispute {
  id: string
  booking_id: string
  title: string
  description: string
  category: string
  status: "open" | "investigating" | "resolved" | "rejected"
  priority: "low" | "medium" | "high" | "urgent"
  created_at: string
  resolved_at?: string
  resolution_notes?: string
}

export default function DisputesPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    booking_id: "",
    respondent_id: "",
    title: "",
    category: "",
    description: "",
    resolution_request: "",
  })

  const { data: disputes = [], isLoading } = useQuery<Dispute[]>({
    queryKey: ["my-disputes"],
    queryFn: async () => {
      const res = await axiosInstance.get<Dispute[]>("/api/v1/disputes/my")
      return res.data ?? []
    },
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      return axiosInstance.post("/api/v1/disputes", {
        booking_id: form.booking_id,
        respondent_id: form.respondent_id,
        title: form.title || form.category,
        description: form.description,
        category: form.category,
        priority: "medium",
      })
    },
    onSuccess: () => {
      toast.success("Dispute filed successfully. Our team will review it within 1 business day.")
      queryClient.invalidateQueries({ queryKey: ["my-disputes"] })
      setForm({ booking_id: "", respondent_id: "", title: "", category: "", description: "", resolution_request: "" })
    },
    onError: (err: any) => toast.error(err.message || "Failed to file dispute"),
  })

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; label: string; icon: any }> = {
      open: { bg: "bg-slate-50 text-slate-500 border-slate-100", label: "Awaiting Review", icon: Clock },
      investigating: { bg: "bg-amber-50 text-amber-700 border-amber-100", label: "Under Investigation", icon: Search },
      resolved: { bg: "bg-sage-50 text-sage-700 border-sage-100", label: "Resolved", icon: CheckCircle },
      rejected: { bg: "bg-rose-50 text-rose-700 border-rose-100", label: "Rejected", icon: AlertCircle },
    }
    const c = map[status] ?? map.open
    const Icon = c.icon
    return (
      <Badge className={`${c.bg} border px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]`}>
        <Icon className="w-3 h-3 mr-1.5" />{c.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto space-y-12 p-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-4xl font-serif italic text-slate-800">Strategic Resolution</h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sage-600 mt-3">
              Registry of Service Integrity & Conflict Mitigation
            </p>
          </div>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="bg-slate-100/50 p-1.5 h-16 rounded-[1.5rem] border border-slate-50">
            <TabsTrigger value="active" className="rounded-xl px-10 h-full data-[state=active]:bg-white data-[state=active]:text-sage-600 data-[state=active]:shadow-xl text-[10px] font-black uppercase tracking-widest">
              Active Cases
            </TabsTrigger>
            <TabsTrigger value="resolved" className="rounded-xl px-10 h-full data-[state=active]:bg-white data-[state=active]:text-sage-600 data-[state=active]:shadow-xl text-[10px] font-black uppercase tracking-widest">
              History
            </TabsTrigger>
            <TabsTrigger value="new" className="rounded-xl px-10 h-full data-[state=active]:bg-white data-[state=active]:text-sage-600 data-[state=active]:shadow-xl text-[10px] font-black uppercase tracking-widest">
              File Dispute
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6 mt-6">
            {isLoading && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-[3rem]" />)}
            {!isLoading && disputes.filter(d => d.status !== "resolved" && d.status !== "rejected").length === 0 && (
              <Card className="border-none shadow-sm rounded-[3rem] bg-white py-20">
                <CardContent className="text-center">
                  <CheckCircle className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-serif italic text-slate-800">No active disputes</h3>
                </CardContent>
              </Card>
            )}
            {disputes.filter(d => d.status !== "resolved" && d.status !== "rejected").map((d) => (
              <Card key={d.id} className="border-none shadow-sm rounded-[3rem] bg-white hover:shadow-lg transition-all">
                <CardContent className="p-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-sage-600 rounded-2xl flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-serif italic text-slate-800">{d.title}</h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
                          Booking: {d.booking_id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(d.status)}
                  </div>
                  <div className="bg-slate-50 p-5 rounded-[1.5rem] mb-4">
                    <p className="text-sm text-slate-600 italic">"{d.description}"</p>
                  </div>
                  {d.status === "investigating" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Investigation Progress</span><span>60%</span>
                      </div>
                      <Progress value={60} className="h-2 rounded-full bg-slate-100" />
                    </div>
                  )}
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">
                    Filed: {new Date(d.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-6 mt-6">
            {disputes.filter(d => d.status === "resolved" || d.status === "rejected").map((d) => (
              <Card key={d.id} className="border-none shadow-sm rounded-[3rem] bg-white opacity-90">
                <CardContent className="p-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-sage-600 rounded-2xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-serif italic text-slate-800">{d.title}</h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
                          Closed: {d.resolved_at ? new Date(d.resolved_at).toLocaleDateString() : "—"}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(d.status)}
                  </div>
                  {d.resolution_notes && (
                    <div className="bg-slate-50 p-5 rounded-[1.5rem] border-l-4 border-l-sage-500">
                      <p className="text-[10px] font-black uppercase tracking-widest text-sage-600 mb-2">Resolution</p>
                      <p className="text-sm font-bold text-slate-700 italic">"{d.resolution_notes}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {disputes.filter(d => d.status === "resolved" || d.status === "rejected").length === 0 && (
              <p className="text-center text-slate-400 py-12">No resolved disputes yet.</p>
            )}
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <Card className="border-none shadow-sm rounded-[3rem] bg-white">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="text-3xl font-serif italic text-slate-800">File a Dispute</CardTitle>
                <CardDescription className="text-slate-400 text-xs uppercase tracking-widest mt-2">
                  Describe the issue with your service
                </CardDescription>
              </CardHeader>
              <Separator className="mx-10 mt-6 bg-slate-50" />
              <CardContent className="p-10 space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Booking ID</Label>
                    <Input
                      value={form.booking_id}
                      onChange={(e) => setForm({ ...form, booking_id: e.target.value })}
                      placeholder="Booking UUID"
                      className="h-14 rounded-2xl bg-slate-50 border-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Provider ID</Label>
                    <Input
                      value={form.respondent_id}
                      onChange={(e) => setForm({ ...form, respondent_id: e.target.value })}
                      placeholder="Provider UUID"
                      className="h-14 rounded-2xl bg-slate-50 border-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issue Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="service_not_received">Service Not Received</SelectItem>
                      <SelectItem value="poor_quality">Poor Quality</SelectItem>
                      <SelectItem value="late_arrival">Late Arrival</SelectItem>
                      <SelectItem value="payment">Payment Issue</SelectItem>
                      <SelectItem value="cancellation">Cancellation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the issue in detail..."
                    className="rounded-3xl bg-slate-50 border-none p-6 min-h-[140px]"
                  />
                </div>

                <div className="p-6 rounded-[2rem] bg-sage-500/5 border border-sage-500/10">
                  <div className="flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700">
                      Our team reviews disputes within 1 business day and aims for resolution within 7 days.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => submitMutation.mutate()}
                  disabled={!form.booking_id || !form.category || !form.description || submitMutation.isPending}
                  className="h-16 px-12 rounded-2xl bg-[#668c65] hover:bg-sage-700 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl"
                >
                  {submitMutation.isPending ? "Filing..." : "File Dispute"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

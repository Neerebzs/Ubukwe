"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosInstance, apiClient } from "@/lib/api-client"
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
import { Upload, AlertCircle, Clock, CheckCircle, MessageSquare, FileText, Search, ShieldCheck, Camera, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { queryKeys, dynamicQueryOptions, invalidateDisputes } from "@/lib/cache"

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
  })
  const [proofImage, setProofImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [triedToSubmit, setTriedToSubmit] = useState(false)
  const [selectedBookingName, setSelectedBookingName] = useState<string>("")

  const { data: disputes = [], isLoading } = useQuery<Dispute[]>({
    queryKey: queryKeys.disputes.myList(),
    queryFn: async () => {
      const res = await axiosInstance.get<Dispute[]>("/api/v1/disputes/my")
      return res.data ?? []
    },
    // Disputes are transactional — always fetch fresh
    ...dynamicQueryOptions,
  })

  const { data: completedBookings = [] } = useQuery({
    queryKey: queryKeys.bookings.list({ role: 'customer', status: 'completed' }),
    queryFn: async () => {
      const res = await apiClient.bookings.getAll({ role: "customer", status: "completed" })
      const bookings = Array.isArray((res as any).data) ? (res as any).data : (Array.isArray(res) ? res : [])
      return bookings
    },
    ...dynamicQueryOptions,
  })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBookingSelect = (bookingId: string) => {
    const booking = completedBookings.find((b: any) => b.id === bookingId)
    if (booking) {
      setForm({
        ...form,
        booking_id: bookingId,
        respondent_id: booking.provider_id || booking.service?.provider_id || "",
      })
      setSelectedBookingName(booking.service_name || booking.service?.name || "Premium Service")
    }
  }

  const submitMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append("booking_id", form.booking_id)
      formData.append("respondent_id", form.respondent_id)
      formData.append("title", form.title || form.category)
      formData.append("description", form.description)
      formData.append("category", form.category)
      formData.append("priority", "medium")
      if (proofImage) {
        formData.append("proof_image", proofImage)
      }

      return axiosInstance.post("/api/v1/disputes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    },
    onSuccess: () => {
      toast.success("Dispute filed successfully. Our team will review it within 1 business day.")
      invalidateDisputes(queryClient)
      setForm({ booking_id: "", respondent_id: "", title: "", category: "", description: "" })
      setProofImage(null)
      setImagePreview(null)
      setTriedToSubmit(false)
      setSelectedBookingName("")
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to file dispute"
      toast.error(msg)
    },
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
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Booking</Label>
                    <Select value={form.booking_id} onValueChange={handleBookingSelect}>
                      <SelectTrigger className={cn(
                        "h-14 rounded-2xl bg-slate-50 border-none transition-all",
                        triedToSubmit && !form.booking_id && "bg-rose-50 ring-2 ring-rose-200"
                      )}>
                        <SelectValue placeholder="Chose a completed booking" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {completedBookings.length === 0 && (
                          <div className="p-4 text-xs text-slate-400 text-center">No completed bookings found</div>
                        )}
                        {completedBookings.map((b: any) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.service_name || b.service?.name || "Service"} ({new Date(b.booking_date).toLocaleDateString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Provider</Label>
                    <Input
                      value={selectedBookingName || form.respondent_id}
                      readOnly
                      placeholder="Provider will be auto-filled"
                      className="h-14 rounded-2xl bg-slate-100 border-none opacity-70 cursor-not-allowed"
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

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    Evidence Proof <span className="text-rose-500 text-[8px] font-bold bg-rose-50 px-2 py-0.5 rounded-full">Required</span>
                  </Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className={cn(
                      "aspect-video rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-slate-50",
                      triedToSubmit && !proofImage ? "border-rose-300 bg-rose-50" : "border-slate-100 bg-slate-50/50"
                    )}>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:bg-[#668c65] transition-all">
                        <Camera className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Upload Visual Proof</p>
                        <p className="text-[8px] text-slate-400 mt-1 uppercase tracking-widest leading-relaxed">Required for investigation</p>
                      </div>
                    </label>

                    {imagePreview ? (
                      <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-lg group">
                        <img src={imagePreview} alt="Evidence Preview" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => { setProofImage(null); setImagePreview(null); }}
                          className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-video rounded-[2rem] bg-slate-50/30 border border-slate-100 flex items-center justify-center italic text-slate-300 text-xs">
                        Preview will appear here
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-sage-500/5 border border-sage-500/10">
                  <div className="flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700">
                      Our integrity team reviews disputes within 1 business day. We require visual proof to effectively mitigate conflicts.
                    </p>
                  </div>
                </div>

                 <Button
                  onClick={() => {
                    setTriedToSubmit(true)
                    if (form.booking_id && form.category && form.description && proofImage) {
                      submitMutation.mutate()
                    } else {
                      toast.error("Please fill in all required fields and upload evidence.")
                    }
                  }}
                  disabled={submitMutation.isPending}
                  className="h-16 px-12 rounded-full bg-[#668c65] hover:bg-sage-700 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl disabled:opacity-50"
                >
                  {submitMutation.isPending ? "Filing Case..." : "Establish Dispute Case"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

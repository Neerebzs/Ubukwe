"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, FileText, DollarSign, User, Building, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { axiosInstance } from "@/lib/api-client"
import { toast } from "sonner"

export default function AdminDisputeResolutionPage({ params }: { params: { disputeId: string } }) {
  const router = useRouter()
  const [dispute, setDispute] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    axiosInstance
      .get(`/api/v1/admin/disputes/${params.disputeId}`)
      .then((res) => setDispute(res.data?.data ?? res.data))
      .catch(() => toast.error("Failed to load dispute"))
      .finally(() => setLoading(false))
  }, [params.disputeId])

  const handleResolve = async (resolutionType: string) => {
    if (!resolutionNotes.trim()) {
      toast.error("Please add resolution notes before finalizing")
      return
    }
    setSubmitting(true)
    try {
      await axiosInstance.put(`/api/v1/admin/disputes/${params.disputeId}/resolve`, {
        resolution_type: resolutionType,
        resolution_notes: resolutionNotes,
      })
      toast.success("Dispute resolved — both parties will be notified.")
      setTimeout(() => router.push("/admin/dashboard?tab=disputes"), 1500)
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve dispute")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!resolutionNotes.trim()) {
      toast.error("Please add a rejection reason")
      return
    }
    setSubmitting(true)
    try {
      await axiosInstance.put(`/api/v1/admin/disputes/${params.disputeId}/reject`, {
        reason: resolutionNotes,
      })
      toast.success("Dispute rejected.")
      setTimeout(() => router.push("/admin/dashboard?tab=disputes"), 1500)
    } catch (err: any) {
      toast.error(err.message || "Failed to reject dispute")
    } finally {
      setSubmitting(false)
    }
  }

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { variant: any; label: string }> = {
      high: { variant: "destructive", label: "High Priority" },
      medium: { variant: "secondary", label: "Medium Priority" },
      low: { variant: "outline", label: "Low Priority" },
    }
    const c = config[priority] || config.medium
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: "outline", label: "Pending", icon: Clock },
      investigating: { variant: "secondary", label: "Investigating", icon: AlertCircle },
      resolved: { variant: "default", label: "Resolved", icon: CheckCircle },
      rejected: { variant: "destructive", label: "Rejected", icon: XCircle },
    }
    const c = config[status] || config.pending
    const Icon = c.icon
    return <Badge variant={c.variant}><Icon className="w-3 h-3 mr-1" />{c.label}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafc] p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!dispute) {
    return (
      <div className="min-h-screen bg-[#f9fafc] p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Dispute not found.</p>
          <Link href="/admin/dashboard?tab=disputes"><Button variant="outline">Back to Disputes</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9fafc] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard?tab=disputes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Disputes
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Dispute Resolution</h1>
              <p className="text-muted-foreground">Dispute ID: {dispute.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getPriorityBadge(dispute.priority)}
            {getStatusBadge(dispute.status)}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dispute Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Dispute Details</CardTitle>
                <CardDescription>Service: {dispute.serviceName} | Booking: {dispute.bookingId}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Issue Description</Label>
                  <p className="text-sm mt-1 bg-muted/50 p-3 rounded-lg">{dispute.issue}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Requested Resolution</Label>
                  <Badge variant="outline" className="mt-1">
                    {dispute.requestedResolution === "partial-refund" && "Partial Refund"}
                    {dispute.requestedResolution === "full-refund" && "Full Refund"}
                    {dispute.requestedResolution === "re-service" && "Re-service"}
                    {dispute.requestedResolution === "credit" && "Service Credit"}
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <span className="text-sm text-muted-foreground">Booking Amount</span>
                    <p className="text-lg font-semibold">{dispute.bookingAmount.toLocaleString()} RWF</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Escrow Amount</span>
                    <p className="text-lg font-semibold text-green-600">{dispute.escrowAmount.toLocaleString()} RWF</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence */}
            <Card>
              <CardHeader>
                <CardTitle>Evidence</CardTitle>
                <CardDescription>Evidence provided by customer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dispute.evidence.map((ev, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{ev.type === "photo" ? "Photo Evidence" : "Message Screenshot"}</p>
                        {ev.description && <p className="text-sm text-muted-foreground">{ev.description}</p>}
                        {ev.content && <p className="text-sm mt-1">{ev.content}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Conversation History */}
            <Card>
              <CardHeader>
                <CardTitle>Conversation History</CardTitle>
                <CardDescription>Messages between customer and provider</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dispute.conversationHistory.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.from === "customer" ? "justify-start" : "justify-end"}`}>
                    {msg.from === "customer" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{dispute.customer.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`rounded-lg p-3 max-w-[70%] ${msg.from === "customer" ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.from === "customer" ? "text-muted-foreground" : "text-primary-foreground/80"}`}>
                        {new Date(msg.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {msg.from === "provider" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{dispute.provider.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Parties Information */}
            <Card>
              <CardHeader>
                <CardTitle>Parties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm font-semibold">Customer</Label>
                  </div>
                  <div className="pl-6 space-y-1">
                    <p className="font-medium">{dispute.customer.name}</p>
                    <p className="text-sm text-muted-foreground">{dispute.customer.email}</p>
                    <p className="text-sm text-muted-foreground">{dispute.customer.phone}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm font-semibold">Provider</Label>
                  </div>
                  <div className="pl-6 space-y-1">
                    <p className="font-medium">{dispute.provider.name}</p>
                    <p className="text-sm text-muted-foreground">{dispute.provider.email}</p>
                    <p className="text-sm text-muted-foreground">{dispute.provider.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resolution Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Resolution Actions</CardTitle>
                <CardDescription>Select a resolution for this dispute</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleResolve("full-refund")} disabled={submitting}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Full Refund ({(dispute.booking_amount ?? dispute.bookingAmount ?? 0).toLocaleString()} RWF)
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleResolve("partial-refund")} disabled={submitting}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Partial Refund (30%)
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleResolve("credit")} disabled={submitting}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Service Credit
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => handleResolve("re-service")} disabled={submitting}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Re-service / Replacement
                  </Button>
                  <Button variant="destructive" className="w-full justify-start" onClick={handleReject} disabled={submitting}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Dispute
                  </Button>
                </div>
                <div className="pt-3 border-t space-y-2">
                  <Label>Resolution Notes (required)</Label>
                  <Textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Explain the resolution decision..."
                    rows={4}
                  />
                  {submitting && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing…
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Dispute Filed</p>
                  <p className="font-medium">{new Date(dispute.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Resolution Deadline</p>
                  <p className="font-medium text-red-600">{new Date(dispute.deadline).toLocaleString()}</p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground">Time Remaining</p>
                  <p className="font-medium">3 days</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


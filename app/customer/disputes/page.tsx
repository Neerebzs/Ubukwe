"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, AlertCircle, Clock, CheckCircle, MessageSquare, FileText, Search, ShieldCheck } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function DisputesPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [disputeForm, setDisputeForm] = useState({
    bookingId: "",
    disputeType: "",
    description: "",
    resolutionRequest: "",
    evidence: [] as File[],
  })

  const disputes = [
    {
      id: "1",
      bookingId: "BK-2024-001",
      serviceName: "Traditional Dancers",
      provider: "Intore Cultural Group",
      status: "investigating",
      createdAt: "2024-03-10",
      resolutionDeadline: "2024-03-17",
      description: "Dancers arrived 2 hours late and missed key moments",
    },
    {
      id: "2",
      bookingId: "BK-2024-002",
      serviceName: "MC Services",
      provider: "Emmanuel MC Services",
      status: "resolved",
      createdAt: "2024-03-05",
      resolvedAt: "2024-03-08",
      resolution: "Partial refund of 30%",
    },
  ]

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    setDisputeForm({ ...disputeForm, evidence: [...disputeForm.evidence, ...Array.from(files)] })
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; label: string; icon: any }> = {
      pending: { bg: "bg-slate-50 text-slate-500 border-slate-100", label: "Awaiting Review", icon: Clock },
      investigating: { bg: "bg-amber-50 text-amber-700 border-amber-100", label: "Under Investigation", icon: Search },
      resolved: { bg: "bg-sage-50 text-sage-700 border-sage-100", label: "Resolution Achieved", icon: CheckCircle },
      appeal: { bg: "bg-rose-50 text-rose-700 border-rose-100", label: "Strategic Appeal", icon: AlertCircle },
    }
    const c = config[status] || config.pending
    const Icon = c.icon
    return (
      <Badge className={`${c.bg} border px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm`}>
        <Icon className="w-3 h-3 mr-1.5" />
        {c.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header - Editorial Style */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
          <div>
            <h1 className="text-4xl font-serif italic text-slate-800 leading-tight">Strategic Resolution</h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sage-600 mt-3">Registry of Service Integrity & Conflict Mitigation</p>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            className="h-14 px-8 rounded-2xl bg-[#668c65] hover:bg-sage-700 text-white text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-sage-200 transition-all active:scale-95"
          >
            File New Case
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <div className="px-2 mb-10 overflow-x-auto">
            <TabsList className="bg-slate-100/50 p-1.5 h-16 rounded-[1.5rem] border border-slate-50">
              <TabsTrigger value="active" className="rounded-xl px-10 h-full data-[state=active]:bg-white data-[state=active]:text-sage-600 data-[state=active]:shadow-xl shadow-slate-200/50 text-[10px] font-black uppercase tracking-widest transition-all">
                Active Cases
              </TabsTrigger>
              <TabsTrigger value="resolved" className="rounded-xl px-10 h-full data-[state=active]:bg-white data-[state=active]:text-sage-600 data-[state=active]:shadow-xl shadow-slate-200/50 text-[10px] font-black uppercase tracking-widest transition-all">
                Registry History
              </TabsTrigger>
              <TabsTrigger value="new" className="rounded-xl px-10 h-full data-[state=active]:bg-white data-[state=active]:text-sage-600 data-[state=active]:shadow-xl shadow-slate-200/50 text-[10px] font-black uppercase tracking-widest transition-all">
                Initiate Dispute
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="space-y-8 mt-0 focus-visible:outline-none">
            {disputes
              .filter((d) => d.status !== "resolved")
              .map((dispute) => (
                <Card key={dispute.id} className="border-none shadow-[0_15px_45px_rgba(0,0,0,0.02)] rounded-[3rem] bg-white group hover:shadow-[0_25px_70px_rgba(0,0,0,0.07)] transition-all duration-700 overflow-hidden border border-transparent hover:border-slate-50">
                  <CardContent className="p-10">
                    <div className="flex flex-col lg:flex-row justify-between gap-10">
                      <div className="flex-1 space-y-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-sage-600 rounded-2xl flex items-center justify-center shadow-2xl">
                              <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-serif italic text-slate-800 group-hover:text-sage-700 transition-colors leading-tight">
                                {dispute.serviceName} Artifact Issue
                              </h3>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-[11px] font-bold text-slate-400 capitalize">{dispute.provider}</span>
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-sage-600/60 font-sans">BK REF: {dispute.bookingId}</span>
                              </div>
                            </div>
                          </div>
                          <div className="lg:hidden">
                            {getStatusBadge(dispute.status)}
                          </div>
                        </div>

                        <div className="bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-100">
                          <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                            "{dispute.description}"
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <Clock className="w-4 h-4 text-slate-300" />
                            Filed: <span className="text-slate-600 ml-1">{new Date(dispute.createdAt).toLocaleDateString()}</span>
                          </div>
                          {dispute.resolutionDeadline && (
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                              Resolution Target: <span className="text-slate-600 ml-1">{new Date(dispute.resolutionDeadline).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {dispute.status === "investigating" && (
                          <div className="space-y-4 bg-sage-50/20 p-6 rounded-[2rem]">
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-sage-600/60 mb-1">Analytical Phase</p>
                                <p className="text-xs font-bold text-slate-700">Investigation Progress</p>
                              </div>
                              <span className="text-xs font-black text-sage-600">60% Complete</span>
                            </div>
                            <Progress value={60} className="h-2 rounded-full bg-slate-100" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-between items-end gap-6 min-w-[220px]">
                        <div className="hidden lg:block">
                          {getStatusBadge(dispute.status)}
                        </div>
                        <div className="flex flex-col gap-3 w-full">
                          <Button className="h-14 px-8 rounded-2xl bg-[#668c65] text-white hover:bg-sage-700 text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-sage-200 transition-all active:scale-95">
                            Examine Investigation
                          </Button>
                          <Button variant="outline" className="h-12 px-8 rounded-2xl border-slate-100 hover:border-sage-100 hover:bg-sage-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-all">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Append Evidence
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-8 mt-0 focus-visible:outline-none">
            {disputes
              .filter((d) => d.status === "resolved")
              .map((dispute) => (
                <Card key={dispute.id} className="border-none shadow-[0_15px_45px_rgba(0,0,0,0.02)] rounded-[3rem] bg-white group opacity-90 hover:opacity-100 transition-all duration-700 overflow-hidden border border-transparent">
                  <CardContent className="p-10">
                    <div className="flex flex-col lg:flex-row justify-between gap-10">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-sage-600 rounded-2xl flex items-center justify-center shadow-2xl">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-serif italic text-slate-800 leading-tight">
                              Resolved: {dispute.serviceName}
                            </h3>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2 font-sans">REFERENCE #{dispute.bookingId}</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 border-l-4 border-l-sage-500">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sage-600 mb-2">Final Settlement</p>
                          <p className="text-sm font-bold text-slate-700 italic">"{dispute.resolution}"</p>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-end gap-6 min-w-[200px]">
                        {getStatusBadge(dispute.status)}
                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Closed On</p>
                          <p className="text-xs font-bold text-slate-500">{new Date(dispute.resolvedAt!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="new" className="mt-0 focus-visible:outline-none">
            <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[3rem] bg-white overflow-hidden">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="text-3xl font-serif italic text-slate-800">Initiate Resolution Workflow</CardTitle>
                <CardDescription className="text-slate-400 font-medium text-xs uppercase tracking-widest mt-2">Delineate the anomalies discovered within your service artifact</CardDescription>
              </CardHeader>
              <Separator className="mx-10 mt-6 bg-slate-50" />
              <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Booking Reference</Label>
                    <Input
                      value={disputeForm.bookingId}
                      onChange={(e) => setDisputeForm({ ...disputeForm, bookingId: e.target.value })}
                      placeholder="BK-2024-XXX"
                      className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-sage-500/20 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dispute Categorization</Label>
                    <Select
                      value={disputeForm.disputeType}
                      onValueChange={(value) => setDisputeForm({ ...disputeForm, disputeType: value })}
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-sage-500/20 text-sm font-bold">
                        <SelectValue placeholder="Identify Issue Type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="service-not-received" className="py-3 text-[10px] font-bold uppercase tracking-widest">Service Non-Receipt</SelectItem>
                        <SelectItem value="poor-quality" className="py-3 text-[10px] font-bold uppercase tracking-widest">Aesthetic Variance</SelectItem>
                        <SelectItem value="late-arrival" className="py-3 text-[10px] font-bold uppercase tracking-widest">Temporal Infraction</SelectItem>
                        <SelectItem value="billing-issue" className="py-3 text-[10px] font-bold uppercase tracking-widest">Financial Discrepancy</SelectItem>
                        <SelectItem value="other" className="py-3 text-[10px] font-bold uppercase tracking-widest">Other Strategic Deviation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contextual Description</Label>
                  <Textarea
                    value={disputeForm.description}
                    onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}
                    placeholder="Provide a comprehensive narrative of the deviation..."
                    className="rounded-3xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-sage-500/20 text-sm font-medium p-6"
                    rows={6}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Strategic Objective (Desired Resolution)</Label>
                  <Select
                    value={disputeForm.resolutionRequest}
                    onValueChange={(value) => setDisputeForm({ ...disputeForm, resolutionRequest: value })}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-sage-500/20 text-sm font-bold">
                      <SelectValue placeholder="Define Targeted Outcome" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="full-refund" className="py-3 text-[10px] font-bold uppercase tracking-widest">Absolute Reallocation</SelectItem>
                      <SelectItem value="partial-refund" className="py-3 text-[10px] font-bold uppercase tracking-widest">Fractional Mitigation</SelectItem>
                      <SelectItem value="re-service" className="py-3 text-[10px] font-bold uppercase tracking-widest">Artifact Correction</SelectItem>
                      <SelectItem value="credit" className="py-3 text-[10px] font-bold uppercase tracking-widest">Registry Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Evidentiary Documentation</Label>
                  <div className="border-2 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center hover:border-sage-100 transition-colors bg-slate-50/30 group">
                    <input
                      type="file"
                      id="evidence"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                    <label htmlFor="evidence" className="cursor-pointer block">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:shadow-xl transition-all">
                        <Upload className="w-6 h-6 text-slate-300 group-hover:text-sage-500 transition-colors" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">Strategic Data Upload</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">PDF, JPEG or HEIC (Maximum 10MB)</p>
                    </label>
                    {disputeForm.evidence.length > 0 && (
                      <div className="mt-8 flex flex-wrap justify-center gap-3">
                        {disputeForm.evidence.map((file, idx) => (
                          <Badge key={idx} className="bg-white text-[9px] font-bold border-slate-100 text-slate-500 px-4 py-2 rounded-xl shadow-sm">
                            <FileText className="w-3 h-3 mr-2 text-sage-600" />
                            {file.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-sage-500/5 border border-sage-500/10 mb-6">
                  <div className="flex gap-4">
                    <ShieldCheck className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-sage-600 mb-2">Protocol Assurance</p>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">
                        Upon submission, your portfolio will be analyzed within one business cycle. Our mitigation team
                        aims for absolute resolution within 7 strategic days through bidirectional negotiation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => alert("Protocol initiated.")}
                    className="h-16 px-12 rounded-2xl bg-[#668c65] hover:bg-sage-700 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-sage-200 transition-all active:scale-95"
                  >
                    Authorize Dispute Artifact
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsCreating(false)}
                    className="h-16 px-10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Abort Workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


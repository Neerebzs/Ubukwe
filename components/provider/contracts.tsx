"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, CheckCircle, Clock, XCircle, Eye, Download, Send, Edit, Plus } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"

export function ProviderContracts() {
  const contracts = [
    {
      id: "CT-2024-001",
      customerName: "Marie Uwimana",
      serviceName: "Traditional Dancers",
      bookingId: "BK-2024-001",
      status: "draft",
      createdAt: "2024-03-10",
      lastModified: "2024-03-10",
    },
    {
      id: "CT-2024-002",
      customerName: "Jean Baptiste",
      serviceName: "MC Services",
      bookingId: "BK-2024-002",
      status: "sent",
      createdAt: "2024-03-08",
      sentAt: "2024-03-09",
    },
    {
      id: "CT-2024-003",
      customerName: "Grace Mukamana",
      serviceName: "Traditional Dancers",
      bookingId: "BK-2024-003",
      status: "signed",
      createdAt: "2024-03-05",
      signedAt: "2024-03-07",
    },
  ]

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string; icon: any }> = {
      draft: { variant: "outline", label: "Draft", icon: Edit },
      sent: { variant: "secondary", label: "Sent", icon: Send },
      signed: { variant: "default", label: "Signed", icon: CheckCircle },
      expired: { variant: "destructive", label: "Expired", icon: XCircle },
    }
    const c = config[status] || config.draft
    const Icon = c.icon
    return (
      <Badge
        variant="outline"
        className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border-none shadow-none",
          status === "draft" ? "bg-slate-50 text-slate-500" :
            status === "sent" ? "bg-indigo-50 text-indigo-600" :
              status === "signed" ? "bg-[#668c65]/10 text-[#668c65]" :
                "bg-rose-50 text-rose-600"
        )}
      >
        <Icon className="w-3 h-3 mr-1" />
        {c.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-4xl font-serif italic text-slate-900 tracking-tight">Contracts</h2>
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-[#668c65]/60" />
          <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em]">Agreement Repository & Management</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div />
        <Button className="rounded-2xl bg-[#668c65] hover:bg-[#0b7a6f] text-white shadow-lg shadow-[#668c65]/20 px-8 h-12 transition-all duration-300 group">
          <FileText className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
          <span className="font-bold tracking-tight uppercase text-[10px]">Generate New Agreement</span>
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-transparent border-b border-slate-100 w-full justify-start rounded-none h-auto p-0 mb-8 space-x-8">
          {[
            { value: "all", label: "All Repository" },
            { value: "draft", label: "Drafts" },
            { value: "sent", label: "Pending" },
            { value: "signed", label: "Executed" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#668c65] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 data-[state=active]:text-[#668c65] transition-all"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {contracts.map((contract) => (
            <Card key={contract.id} className="border-slate-100 shadow-none rounded-[2rem] overflow-hidden bg-white group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-serif italic text-slate-900 tracking-tight">{contract.serviceName}</CardTitle>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      Ref: {contract.id} | Booking: {contract.bookingId}
                    </p>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-8">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Client Identity</p>
                      <p className="text-sm font-bold text-slate-700">{contract.customerName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Initialization</p>
                      <p className="text-sm font-medium text-slate-600">{new Date(contract.createdAt).toLocaleDateString()}</p>
                    </div>
                    {contract.signedAt && (
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-[#668c65] uppercase tracking-widest">Execution Date</p>
                        <p className="text-sm font-bold text-[#668c65]">{new Date(contract.signedAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="rounded-xl hover:bg-slate-50 text-slate-500 font-bold text-[10px] uppercase px-4 h-10">
                      <Eye className="w-4 h-4 mr-2" />
                      Inspect
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-xl hover:bg-slate-50 text-slate-500 font-bold text-[10px] uppercase px-4 h-10">
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    {contract.status === "draft" && (
                      <Button className="rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-[10px] uppercase px-4 h-10 transition-all">
                        <Edit className="w-4 h-4 mr-2" />
                        Modify
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="draft">
          {contracts.filter((c) => c.status === "draft").length === 0 ? (
            <div className="py-20 bg-white rounded-[2rem] border border-dashed border-slate-100 flex items-center justify-center">
              <EmptyState
                title="Workspace Vacant"
                description="No draft agreements currently under composition."
                icon={<FileText className="h-12 w-12 mx-auto text-slate-200" />}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {contracts
                .filter((c) => c.status === "draft")
                .map((contract) => (
                  <Card key={contract.id} className="border-slate-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
                    <CardHeader className="p-8">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-serif italic text-slate-900">{contract.serviceName}</CardTitle>
                        <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0 hover:bg-slate-50">
                          <Edit className="w-4 h-4 text-slate-400" />
                        </Button>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Composition for {contract.customerName}</p>
                    </CardHeader>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent">
          {contracts.filter((c) => c.status === "sent").length === 0 ? (
            <div className="py-20 bg-white rounded-[2rem] border border-dashed border-slate-100 flex items-center justify-center">
              <EmptyState
                title="Transit Clear"
                description="All dispatched agreements have been acknowledged and executed."
                icon={<Send className="h-12 w-12 mx-auto text-slate-200" />}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {contracts
                .filter((c) => c.status === "sent")
                .map((contract) => (
                  <Card key={contract.id} className="border-slate-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
                    <CardHeader className="p-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl font-serif italic text-slate-900">{contract.serviceName}</CardTitle>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            Dispatched to {contract.customerName}
                          </p>
                        </div>
                        {getStatusBadge(contract.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Awaiting Signature Since: {contract.sentAt ? new Date(contract.sentAt).toLocaleDateString() : "N/A"}</span>
                        <Button variant="ghost" size="sm" className="rounded-xl hover:bg-slate-50 text-slate-500 h-9 px-4">
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="signed">
          {contracts.filter((c) => c.status === "signed").length === 0 ? (
            <div className="py-20 bg-white rounded-[2rem] border border-dashed border-slate-100 flex items-center justify-center">
              <EmptyState
                title="Archive Empty"
                description="Executed agreements will be meticulously stored here."
                icon={<CheckCircle className="h-12 w-12 mx-auto text-slate-200" />}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {contracts
                .filter((c) => c.status === "signed")
                .map((contract) => (
                  <Card key={contract.id} className="border-slate-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
                    <CardHeader className="p-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl font-serif italic text-slate-900">{contract.serviceName}</CardTitle>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            Finalized with {contract.customerName}
                          </p>
                        </div>
                        {getStatusBadge(contract.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#668c65]">
                          Executed: {contract.signedAt ? new Date(contract.signedAt).toLocaleDateString() : "N/A"}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="rounded-xl hover:bg-slate-50 text-slate-500 h-9 px-4">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm" className="rounded-xl hover:bg-slate-50 text-slate-500 h-9 px-4">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}


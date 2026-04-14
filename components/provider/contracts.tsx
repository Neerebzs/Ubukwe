"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, CheckCircle, XCircle, Eye, Download, Send, Edit, Plus } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"

interface Contract {
  id: string
  provider_id: string
  customer_id: string
  booking_id?: string
  title?: string
  content: string
  status: "pending" | "sent" | "signed" | "rejected" | "cancelled"
  created_at: string
  sent_at?: string
  signed_at?: string
}

export function ProviderContracts() {
  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ["provider-contracts"],
    queryFn: async () => {
      const res = await apiClient.provider.contracts.getAll()
      const data = res.data as any
      return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    },
  })

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string; icon: any }> = {
      pending: { className: "bg-slate-50 text-slate-500", label: "Draft", icon: Edit },
      sent: { className: "bg-indigo-50 text-indigo-600", label: "Sent", icon: Send },
      signed: { className: "bg-[#668c65]/10 text-[#668c65]", label: "Signed", icon: CheckCircle },
      rejected: { className: "bg-rose-50 text-rose-600", label: "Rejected", icon: XCircle },
      cancelled: { className: "bg-slate-50 text-slate-400", label: "Cancelled", icon: XCircle },
    }
    const c = config[status] || config.pending
    const Icon = c.icon
    return (
      <Badge variant="outline" className={cn("px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border-none", c.className)}>
        <Icon className="w-3 h-3 mr-1" />
        {c.label}
      </Badge>
    )
  }

  const tabs = [
    { value: "all", label: "All" },
    { value: "pending", label: "Drafts" },
    { value: "sent", label: "Pending" },
    { value: "signed", label: "Signed Agreements" },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />)}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-serif italic text-slate-900 tracking-tight">Agreements</h2>
          <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em] mt-1">All your signed and pending agreements</p>
        </div>
        <Button className="rounded-2xl bg-[#668c65] hover:bg-[#0b7a6f] text-white px-8 h-12">
          <Plus className="w-4 h-4 mr-2" />
          <span className="font-bold uppercase text-[10px]">New Agreement</span>
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="bg-transparent border-b border-slate-100 w-full justify-start rounded-none h-auto p-0 mb-8 space-x-8">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#668c65] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 data-[state=active]:text-[#668c65]"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => {
          const filtered = tab.value === "all" ? contracts : contracts.filter(c => c.status === tab.value)
          return (
            <TabsContent key={tab.value} value={tab.value} className="space-y-6">
              {filtered.length === 0 ? (
                <div className="py-20 bg-white rounded-[2rem] border border-dashed border-slate-100 flex items-center justify-center">
                  <EmptyState
                    title="No agreements"
                    description="Agreements will appear here once created."
                    icon={<FileText className="h-12 w-12 mx-auto text-slate-200" />}
                  />
                </div>
              ) : (
                filtered.map((contract) => (
                  <Card key={contract.id} className="border-slate-100 shadow-none rounded-[2rem] overflow-hidden bg-white group hover:shadow-xl transition-all duration-500">
                    <CardHeader className="p-8 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl font-serif italic text-slate-900">
                            {contract.title || "Service Agreement"}
                          </CardTitle>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            Ref: {contract.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                        {getStatusBadge(contract.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-8 text-sm">
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Created</p>
                            <p className="font-bold text-slate-700">{new Date(contract.created_at).toLocaleDateString()}</p>
                          </div>
                          {contract.signed_at && (
                            <div>
                              <p className="text-[8px] font-black text-[#668c65] uppercase tracking-widest">Signed</p>
                              <p className="font-bold text-[#668c65]">{new Date(contract.signed_at).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="rounded-xl hover:bg-slate-50 text-slate-500 font-bold text-[10px] uppercase px-4 h-10">
                            <Eye className="w-4 h-4 mr-2" />See Details
                          </Button>
                          <Button variant="ghost" size="sm" className="rounded-xl hover:bg-slate-50 text-slate-500 font-bold text-[10px] uppercase px-4 h-10">
                            <Download className="w-4 h-4 mr-2" />Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

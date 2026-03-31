"use client"

import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { ShieldCheck, FileText, Download, Clock, ChevronRight } from "lucide-react"

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

export function CustomerContractsView() {
  const router = useRouter()

  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ["customer-contracts"],
    queryFn: async () => {
      const res = await axiosInstance.get<Contract[]>("/api/v1/contracts/customer")
      return res.data ?? []
    },
  })

  const handleViewSign = (contractId: string) => {
    router.push(`/customer/contracts/sign/${contractId}`)
  }

  const getStatusBadge = (status: string) => {
    if (status === "signed") {
      return (
        <Badge className="bg-sage-50 text-sage-700 border-sage-100 border px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
          <ShieldCheck className="w-3 h-3 mr-1.5" />
          Secured
        </Badge>
      )
    }
    return (
      <Badge className="bg-amber-50 text-amber-700 border-amber-100 border px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
        <Clock className="w-3 h-3 mr-1.5" />
        Awaiting Signature
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="px-2">
          <Skeleton className="h-10 w-64 mb-3" />
          <Skeleton className="h-4 w-48" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-[3rem]" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="px-2">
        <h2 className="text-4xl font-serif italic text-slate-800">Legal Artifacts</h2>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sage-600 mt-3">
          Portfolio of Executed and Pending Agreements
        </p>
      </div>

      <div className="space-y-8">
        {contracts.map((c) => (
          <Card
            key={c.id}
            className="border-none shadow-[0_15px_45px_rgba(0,0,0,0.02)] rounded-[3rem] bg-white group hover:shadow-[0_25px_70px_rgba(0,0,0,0.07)] transition-all duration-700 overflow-hidden"
          >
            <CardContent className="p-10">
              <div className="flex flex-col lg:flex-row justify-between gap-10">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-sage-600 rounded-2xl flex items-center justify-center shadow-2xl">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-serif italic text-slate-800 group-hover:text-sage-700 transition-colors leading-tight">
                          {c.title || "Service Agreement"}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-sage-600/60">
                            REF: {c.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="lg:hidden">{getStatusBadge(c.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1.5">
                        Effective Date
                      </p>
                      <p className="text-sm font-bold text-slate-500">
                        {new Date(c.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {c.signed_at && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1.5">
                          Signed On
                        </p>
                        <p className="text-sm font-bold text-sage-600">
                          {new Date(c.signed_at).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end gap-6 min-w-[220px]">
                  <div className="hidden lg:block">{getStatusBadge(c.status)}</div>
                  <div className="flex flex-col gap-3 w-full">
                    {c.status !== "signed" && (
                      <Button
                        onClick={() => handleViewSign(c.id)}
                        className="h-14 px-8 rounded-2xl text-white text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-xl"
                      >
                        Authorize Agreement
                        <ChevronRight className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    )}
                    {c.status === "signed" && (
                      <Button
                        onClick={() => handleViewSign(c.id)}
                        className="h-14 px-8 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-bold uppercase tracking-widest transition-all"
                      >
                        Examine Document
                        <ChevronRight className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="h-12 px-8 rounded-2xl text-slate-400 hover:text-sage-600 hover:bg-sage-50 text-[10px] font-bold uppercase tracking-widest"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Offline Archive
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && contracts.length === 0 && (
        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[3rem] bg-white py-24">
          <CardContent className="text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <ShieldCheck className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-serif italic text-slate-800 mb-3">No Agreements Active</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">
              Your authorized and pending service contracts will appear here once a provider sends one.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

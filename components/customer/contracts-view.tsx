"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { ShieldCheck, FileText, Download, Clock, ChevronRight } from "lucide-react"

export function CustomerContractsView() {
  const router = useRouter()
  const contracts = [
    {
      id: "CT-2024-003",
      provider: "Amahoro Dance Troupe",
      service: "Traditional Dancers",
      status: "signed",
      date: "2024-03-15",
      value: "250,000 RWF"
    },
    {
      id: "CT-2024-004",
      provider: "Jean-Claude Events",
      service: "MC Services",
      status: "pending",
      date: "2024-03-18",
      value: "165,200 RWF"
    },
  ]

  const handleViewSign = (contractId: string) => {
    router.push(`/customer/dashboard?tab=contract-sign&contractId=${contractId}`, { scroll: false })
  }

  const getStatusBadge = (status: string) => {
    if (status === 'signed') {
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

  return (
    <div className="space-y-12 pb-20">
      {/* Header - Orbital Style */}
      <div className="px-2">
        <h2 className="text-4xl font-serif italic text-slate-800">Legal Artifacts</h2>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sage-600 mt-3">Portfolio of Executed and Pending Agreements</p>
      </div>

      <div className="space-y-8">
        {contracts.map((c) => (
          <Card key={c.id} className="border-none shadow-[0_15px_45px_rgba(0,0,0,0.02)] rounded-[3rem] bg-white group hover:shadow-[0_25px_70px_rgba(0,0,0,0.07)] transition-all duration-700 overflow-hidden border border-transparent hover:border-slate-50">
            <CardContent className="p-10">
              <div className="flex flex-col lg:flex-row justify-between gap-10">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-sage-600 rounded-2xl flex items-center justify-center shadow-2xl`}>
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-serif italic text-slate-800 group-hover:text-sage-700 transition-colors leading-tight">
                          {c.service} Agreement
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[11px] font-bold text-slate-400 capitalize">{c.provider}</span>
                          <div className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-sage-600/60">REF: {c.id}</span>
                        </div>
                      </div>
                    </div>
                    <div className="lg:hidden">
                      {getStatusBadge(c.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1.5">Strategic Value</p>
                      <p className="text-sm font-bold text-slate-700 font-serif italic">{c.value}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1.5">Effective Date</p>
                      <p className="text-sm font-bold text-slate-500">{new Date(c.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end gap-6 min-w-[220px]">
                  <div className="hidden lg:block">
                    {getStatusBadge(c.status)}
                  </div>
                  <div className="flex flex-col gap-3 w-full">
                    <Button
                      onClick={() => handleViewSign(c.id)}
                      className={`h-14 px-8 rounded-2xl ${c.status === 'signed' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#668c65] text-white hover:bg-sage-700'} text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-sage-200`}
                    >
                      {c.status === 'signed' ? 'Examine Document' : 'Authorize Agreement'}
                      <ChevronRight className="w-3.5 h-3.5 ml-2" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-12 px-8 rounded-2xl text-slate-400 hover:text-sage-600 hover:bg-sage-50 text-[10px] font-bold uppercase tracking-widest transition-all"
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

      {contracts.length === 0 && (
        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[3rem] bg-white py-24">
          <CardContent className="text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <ShieldCheck className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-serif italic text-slate-800 mb-3">No Agreements Active</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">
              Your authorized and pending service contracts will be archived within this digital vault once initiated.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

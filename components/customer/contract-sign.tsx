"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShieldCheck, FileText, Download, ChevronLeft, Calendar } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function CustomerContractSign() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const contractId = searchParams.get("contractId") || ""

  // Mock contract data
  const contract = contractId ? {
    id: contractId,
    provider: "Amahoro Dance Troupe",
    service: "Traditional Dancers",
    date: "2024-03-15",
    content: `UBUKWE HUB SERVICE AGREEMENT

PARTIES:
- CUSTOMER: Strategic Wedding Archive
- PROVIDER: Amahoro Dance Troupe

SCOPE OF SERVICES:
The Provider agrees to deliver traditional performance services including:
- 8 Professional Intore Dancers
- Live Drumming Ensemble
- Traditional Performance Attire
- 2 x 45-minute thematic sequences

TERMS AND CONDITIONS:
1. Performance Window: Services will manifest within the agreed temporal slot.
2. Aesthetic Standards: All performances will adhere to the premium boutique standards of Ubukwe Hub.
3. Financial Reallocation: 50% deposit required for artifact reservation.
4. Cancellation Protocol: Deviation from schedule requires 14-day formal notice.

By authorizing this digital artifact, you initiate a binding strategic agreement.`,
  } : null

  const handleBackToContracts = () => {
    router.push("/customer/dashboard?tab=contracts", { scroll: false })
  }

  if (!contract) {
    return (
      <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[3rem] bg-white py-24">
        <CardContent className="text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <ShieldCheck className="h-10 w-10 text-slate-200" />
          </div>
          <h3 className="text-2xl font-serif italic text-slate-800 mb-3">No Artifact Selected</h3>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto mb-8">
            Please select a legal document from your portfolio to initiate the authorization workflow.
          </p>
          <Button
            onClick={handleBackToContracts}
            className="h-14 px-8 rounded-2xl bg-slate-900 text-white hover:bg-black text-[10px] font-bold uppercase tracking-widest shadow-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Portfolio
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToContracts}
            className="text-slate-400 hover:text-sage-600 hover:bg-sage-50 -ml-2 text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Agreements
          </Button>
          <h2 className="text-4xl font-serif italic text-slate-800">Document Authorization</h2>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sage-600">Executing Strategic Service Agreement #{contract.id}</p>
        </div>
      </div>

      <Card className="border-none shadow-[0_30px_90px_rgba(0,0,0,0.04)] rounded-[3rem] bg-white overflow-hidden border border-slate-50">
        <CardHeader className="p-10 pb-0">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-serif italic text-slate-800">{contract.service} Agreement</CardTitle>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-bold text-slate-400 font-sans">{contract.provider}</span>
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-sage-600/70">
                  <Calendar className="w-3 h-3" />
                  Issuance: {new Date(contract.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <Separator className="mx-10 bg-slate-50" />
        <CardContent className="p-10 space-y-8">
          <div className="bg-slate-50/50 border border-slate-100/50 rounded-[2rem] p-10 h-[500px] overflow-auto shadow-inner">
            <pre className="whitespace-pre-wrap text-sm font-medium text-slate-600 leading-relaxed font-sans italic">
              {contract.content}
            </pre>
          </div>

          <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/10">
            <div className="flex gap-4">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Legal Implications</p>
                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                  By authorizing this artifact, you acknowledge that you have reviewed the service parameters and
                  agreed to the financial allocations delineated above. This signature manifests as a binding protocol.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={() => alert("Protocol Authorized.")}
              className="h-16 px-12 rounded-2xl bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all active:scale-95 flex-1 sm:flex-none"
            >
              Sign Strategic Artifact
            </Button>
            <Button
              variant="outline"
              className="h-16 px-10 rounded-2xl border-slate-100 hover:border-sage-100 hover:bg-sage-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-all flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4 mr-2 text-sage-600" />
              Offline Archive
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

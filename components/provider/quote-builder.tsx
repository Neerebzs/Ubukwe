"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Save, Send, Calculator } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export function QuoteBuilder({ customerId, inquiryId }: { customerId?: string; inquiryId?: string }) {
  // Set validUntil to 30 days from now by default
  const defaultValidUntil = new Date()
  defaultValidUntil.setDate(defaultValidUntil.getDate() + 30)

  const [quoteData, setQuoteData] = useState({
    customerId: customerId || "",
    inquiryId: inquiryId || "",
    quoteTitle: inquiryId ? `Quote for Inquiry ${inquiryId}` : "",
    validUntil: defaultValidUntil.toISOString().split('T')[0],
    notes: "",
    terms: "Payment: 50% deposit required to secure booking. Balance due 7 days before event.\nCancellation: Full refund if cancelled 30+ days before event. 50% refund 15-30 days before.",
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: "1",
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    },
  ])

  const [taxRate, setTaxRate] = useState(18) // VAT in Rwanda
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ])
  }

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id))
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updated.total = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return item
      })
    )
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = discountType === "percentage" ? (subtotal * discount) / 100 : discount
  const taxableAmount = subtotal - discountAmount
  const taxAmount = (taxableAmount * taxRate) / 100
  const total = taxableAmount + taxAmount

  const handleSave = () => {
    const quote = {
      ...quoteData,
      lineItems,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      createdAt: new Date().toISOString(),
    }
    alert("Quote saved! (Integration pending)")
    console.log("Quote:", quote)
  }

  const handleSend = () => {
    handleSave()
    alert("Quote sent to customer! (Integration pending)")
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-4xl font-serif italic text-slate-900 tracking-tight">Create Quote</h2>
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-[#668c65]/60" />
          <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em]">Drafting Professional Service Agreements</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div />
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleSave}
            className="rounded-2xl border-slate-200 hover:border-[#668c65] hover:bg-[#668c65]/5 text-slate-600 px-6 h-12 transition-all duration-300"
          >
            <Save className="w-4 h-4 mr-2" />
            <span className="font-bold tracking-tight uppercase text-[10px]">Store Draft</span>
          </Button>
          <Button
            onClick={handleSend}
            className="rounded-2xl bg-[#668c65] hover:bg-[#0b7a6f] text-white shadow-lg shadow-[#668c65]/20 px-8 h-12 transition-all duration-300 group"
          >
            <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            <span className="font-bold tracking-tight uppercase text-[10px]">Dispatch Quote</span>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Quote Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4 border-b border-slate-50">
              <CardTitle className="text-xl font-serif italic text-slate-900">Quote Context</CardTitle>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Core details for this engagement</p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="quoteTitle" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quote Title</Label>
                <Input
                  id="quoteTitle"
                  value={quoteData.quoteTitle}
                  onChange={(e) => setQuoteData({ ...quoteData, quoteTitle: e.target.value })}
                  placeholder="e.g., Wedding MC Services - June 2024"
                  className="rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-colors h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Expiration Date</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={quoteData.validUntil}
                  onChange={(e) => setQuoteData({ ...quoteData, validUntil: e.target.value })}
                  className="rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-colors h-12"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-serif italic text-slate-900">Service Lineage</CardTitle>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Detailed breakdown of offerings</p>
                </div>
                <Button
                  size="sm"
                  onClick={addLineItem}
                  className="rounded-xl bg-slate-900 hover:bg-black text-white px-4 h-10 transition-all"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="font-bold text-[10px] uppercase">Add Entry</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-b-slate-100 hover:bg-transparent">
                      <TableHead className="w-[45%] pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Qty</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Price</TableHead>
                      <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Line Total</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id} className="border-b-slate-50 hover:bg-slate-50/30 transition-colors">
                        <TableCell className="pl-8 py-6">
                          <Input
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                            placeholder="Enter service details..."
                            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-300 p-0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                            className="w-20 bg-slate-50 border-slate-100 rounded-lg h-9 text-center font-bold text-slate-900"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">RWF</span>
                            <Input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                              className="w-32 bg-slate-50 border-slate-100 rounded-lg h-9 pl-10 font-bold text-slate-900"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-8 font-serif italic text-lg text-slate-800">
                          {item.total.toLocaleString()}
                        </TableCell>
                        <TableCell className="pr-8">
                          <Button variant="ghost" size="sm" onClick={() => removeLineItem(item.id)} className="h-9 w-9 p-0 hover:bg-rose-50 hover:text-rose-500 rounded-lg text-slate-300 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4 border-b border-slate-50">
              <CardTitle className="text-xl font-serif italic text-slate-900">Addendum & Terms</CardTitle>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Foundational rules for this proposal</p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notes to Client</Label>
                <Textarea
                  id="notes"
                  value={quoteData.notes}
                  onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                  placeholder="Articulate additional nuances for your client..."
                  className="rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-colors min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contractual Terms</Label>
                <Textarea
                  id="terms"
                  value={quoteData.terms}
                  onChange={(e) => setQuoteData({ ...quoteData, terms: e.target.value })}
                  className="rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-colors min-h-[100px] text-xs leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-slate-100 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-6 border-b border-slate-50 bg-[#668c65]/5">
              <CardTitle className="text-2xl font-serif italic text-slate-900 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#668c65] text-white">
                  <Calculator className="w-5 h-5" />
                </div>
                Fiscal Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Subtotal</span>
                  <span className="font-bold text-slate-900">{subtotal.toLocaleString()} RWF</span>
                </div>

                {/* Discount Overlay */}
                <div className="p-6 rounded-[1.5rem] bg-slate-50/50 border border-slate-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Discount</Label>
                    <Select value={discountType} onValueChange={(val: "percentage" | "fixed") => setDiscountType(val)}>
                      <SelectTrigger className="w-20 h-8 border-none bg-white rounded-lg text-[10px] font-black uppercase">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100">
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="fixed">RWF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="rounded-xl border-slate-100 bg-white h-12 pl-4 text-sm font-bold text-slate-800"
                      placeholder="Enter value..."
                    />
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] font-black text-emerald-600 uppercase">Saving Applied</span>
                      <span className="text-sm font-bold text-emerald-600">-{discountAmount.toLocaleString()} RWF</span>
                    </div>
                  )}
                </div>

                {/* VAT Analysis */}
                <div className="p-6 rounded-[1.5rem] bg-slate-50/50 border border-slate-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">VAT Exposure</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={taxRate}
                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                        className="w-16 h-8 border-none bg-white rounded-lg text-center text-xs font-bold"
                      />
                      <span className="text-[10px] font-black text-slate-400">%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Tax Amount</span>
                    <span className="text-sm font-bold text-slate-900">{taxAmount.toLocaleString()} RWF</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <div className="flex justify-between items-end mb-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Grand Total</p>
                    <p className="text-xs font-bold text-[#608d64] uppercase tracking-widest">Rwandan Francs</p>
                  </div>
                  <span className="text-4xl font-serif italic text-slate-900 leading-none">
                    {total.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full py-8 rounded-2xl bg-[#668c65] hover:bg-[#0b7a6f] text-white shadow-lg shadow-[#668c65]/20 group transition-all duration-500"
                    onClick={handleSend}
                  >
                    <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    <span className="font-bold tracking-widest uppercase text-xs">Dispatch Proposal</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full py-6 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all font-bold tracking-widest uppercase text-[10px]"
                    onClick={handleSave}
                  >
                    Archive for Later
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


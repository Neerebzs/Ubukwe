"use client"

import { CustomerContractsView } from "@/components/customer/contracts-view"

export default function CustomerContractsPage() {
  return (
    <div className="min-h-screen bg-[#f9fafc] p-6">
      <div className="max-w-4xl mx-auto">
        <CustomerContractsView />
      </div>
    </div>
  )
}

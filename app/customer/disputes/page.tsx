"use client"

import { Suspense } from "react"
import { CustomerDisputesView } from "@/components/customer/disputes-view"

export default function CustomerDisputesPage() {
  return (
    <div className="min-h-screen bg-[#f9fafc]">
      <Suspense fallback={null}>
        <CustomerDisputesView />
      </Suspense>
    </div>
  )
}

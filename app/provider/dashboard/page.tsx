import { Suspense } from "react"
import { ProviderDashboardContent } from "./dashboard-content"

export default function ProviderDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9fafc] flex items-center justify-center">Loading...</div>}>
      <ProviderDashboardContent />
    </Suspense>
  )
}

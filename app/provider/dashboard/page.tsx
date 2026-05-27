import { Suspense } from "react"
import { ProviderDashboardContent } from "./dashboard-content"
import ProviderDashboardLoading from "./loading"

export default function ProviderDashboard() {
  return (
    <Suspense fallback={<ProviderDashboardLoading />}>
      <ProviderDashboardContent />
    </Suspense>
  )
}

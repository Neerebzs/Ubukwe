"use client"

import { Suspense } from "react"
import { AdminDashboardContent } from "./admin-dashboard-content"

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9fafc] flex items-center justify-center">Loading...</div>}>
      <AdminDashboardContent />
    </Suspense>
  )
}

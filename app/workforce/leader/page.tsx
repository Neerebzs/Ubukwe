"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { TeamLeaderPortal } from "@/components/workforce/team-leader-portal"
import { Skeleton } from "@/components/ui/skeleton"

function LeaderPortalContent() {
  const params = useSearchParams()
  const token = params.get("token") || ""

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Missing access link. Open the link shared by your provider to assign workers to the event.
        </p>
      </div>
    )
  }

  return <TeamLeaderPortal token={token} />
}

export default function TeamLeaderPage() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <LeaderPortalContent />
    </Suspense>
  )
}

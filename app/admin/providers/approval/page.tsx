"use client"

import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, XCircle, FileText, Eye } from "lucide-react"
import Link from "next/link"

interface Application {
  id: string
  provider_id?: string
  full_name?: string
  business_name?: string
  email?: string
  status: string
  created_at: string
}

export default function ProviderApprovalPage() {
  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["admin-onboarding-pending"],
    queryFn: async () => {
      const res = await axiosInstance.get<any>("/api/v1/admin/onboarding?status=pending")
      return res.data?.data ?? res.data ?? []
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9fafc] p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-10 w-64" />
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9fafc] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Provider Approvals</h1>
          <Badge variant="secondary">Pending: {applications.length}</Badge>
        </div>

        {applications.length === 0 && (
          <p className="text-muted-foreground text-center py-12">No pending applications.</p>
        )}

        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{app.business_name || app.full_name || "Provider"}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Application {app.id.slice(0, 8)} • {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge>Pending</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{app.email}</p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/providers/approval/${app.id}`}>
                  <Eye className="w-4 h-4 mr-2" />Review
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

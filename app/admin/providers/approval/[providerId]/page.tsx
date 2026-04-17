"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckCircle, XCircle, FileText, Eye, User, Building, Mail, Phone, MapPin, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { axiosInstance } from "@/lib/api-client"
import { toast } from "sonner"

export default function ProviderApprovalDetailPage({ params }: { params: { providerId: string } }) {
  const router = useRouter()
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [approvalDecision, setApprovalDecision] = useState<string>("")
  const [adminNotes, setAdminNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    axiosInstance
      .get(`/api/v1/admin/onboarding/${params.providerId}`)
      .then((res) => setApplication(res.data?.data ?? res.data))
      .catch(() => toast.error("Failed to load application"))
      .finally(() => setLoading(false))
  }, [params.providerId])

  const handleApprove = async () => {
    setSubmitting(true)
    try {
      await axiosInstance.post(`/api/v1/admin/onboarding/${params.providerId}/approve`, {
        admin_notes: adminNotes,
      })
      setApprovalDecision("approved")
      toast.success("Provider approved — they will be notified by email.")
      setTimeout(() => router.push("/admin/dashboard?tab=onboarding"), 1500)
    } catch (err: any) {
      toast.error(err.message || "Failed to approve provider")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }
    setSubmitting(true)
    try {
      await axiosInstance.post(`/api/v1/admin/onboarding/${params.providerId}/reject`, {
        rejection_reason: adminNotes,
      })
      setApprovalDecision("rejected")
      toast.success("Application rejected — provider will be notified.")
      setTimeout(() => router.push("/admin/dashboard?tab=onboarding"), 1500)
    } catch (err: any) {
      toast.error(err.message || "Failed to reject application")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafc] p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-[#f9fafc] p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Application not found.</p>
          <Link href="/admin/dashboard?tab=onboarding">
            <Button variant="outline">Back to Providers</Button>
          </Link>
        </div>
      </div>
    )
  }

  const requiredDocKeys = Object.keys(application.documents).filter((k: string) => k !== "portfolio");
  const allDocumentsVerified = requiredDocKeys.length > 0 && requiredDocKeys.every(k => application.documents[k]?.verified === true);

  return (
    <div className="min-h-screen bg-[#f9fafc] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard?tab=onboarding">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Providers
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Provider Application Review</h1>
              <p className="text-muted-foreground">Application ID: {application.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={allDocumentsVerified ? "default" : "secondary"}>
              {allDocumentsVerified ? "Documents Complete" : "Pending Documents"}
            </Badge>
            <Badge variant="outline">
              Submitted: {new Date(application.submittedAt).toLocaleDateString()}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Business Name</p>
                    <p className="font-semibold">{application.businessName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Business Type</p>
                    <p className="font-semibold capitalize">{application.businessType.replace("-", " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Years of Experience</p>
                    <p className="font-semibold">{application.yearsExperience} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Service Categories</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {application.serviceCategories.map((cat: string) => (
                        <Badge key={cat} variant="outline">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Business Description</p>
                  <p className="bg-muted/50 p-3 rounded-lg">{application.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Person</p>
                      <p className="font-semibold">
                        {application.fullName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold">{application.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-semibold">{application.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-semibold">
                        {application.address}, {application.city}, {application.country}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Documents & Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="documents" className="w-full">
                  <TabsList>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                    <TabsTrigger value="references">References</TabsTrigger>
                  </TabsList>

                  <TabsContent value="documents" className="space-y-3 mt-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">ID Document</p>
                          <p className="text-sm text-muted-foreground">{application.documents.idDocument.name}</p>
                        </div>
                      </div>
                      {application.documents.idDocument.verified ? (
                        <Badge variant="default">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Business License</p>
                          <p className="text-sm text-muted-foreground">
                            {application.documents.businessLicense.name}
                          </p>
                        </div>
                      </div>
                      {application.documents.businessLicense.verified ? (
                        <Badge variant="default">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Tax Registration</p>
                          <p className="text-sm text-muted-foreground">
                            {application.documents.taxDocument.name}
                          </p>
                        </div>
                      </div>
                      {application.documents.taxDocument.verified ? (
                        <Badge variant="default">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pending Verification</Badge>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="portfolio" className="space-y-2 mt-4">
                    {application.documents.portfolio.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <p className="flex-1 font-medium">{item.name}</p>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="references" className="space-y-3 mt-4">
                    {application.references.map((ref: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <p className="font-medium">{ref.name}</p>
                        <p className="text-sm text-muted-foreground">{ref.relationship}</p>
                        <p className="text-sm text-muted-foreground">{ref.phone}</p>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Approval Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Approval Decision</CardTitle>
                <CardDescription>Review all documents before making a decision</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button className="w-full" onClick={handleApprove} disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Approve Provider
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={handleReject} disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                    Reject Application
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-medium">Notes / Reason</label>
                  <Textarea
                    className="mt-1"
                    placeholder="Add approval notes or rejection reason..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="font-medium">{new Date(application.submittedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Days Pending</p>
                  <p className="font-medium">
                    {Math.floor(
                      (new Date().getTime() - new Date(application.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground">Document Status</p>
                  <p className="font-medium">
                    {application.documents.portfolio.length} portfolio items
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Object.values(application.documents)
                      .filter((doc: any) => doc.verified === true).length} of{" "}
                    {Object.keys(application.documents).filter(
                      (k: string) => k !== "portfolio"
                    ).length} required documents verified
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


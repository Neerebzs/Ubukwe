"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, DollarSign, CheckCircle, XCircle, MessageSquare, FileText, Clock, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Quote {
  id: string
  provider: string
  providerId?: string
  service: string
  status: "pending" | "accepted" | "declined" | "expired" | "requested_changes"
  total: number
  currency?: string
  createdAt: string
  validUntil: string
  inquiryId?: string
  lineItems?: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal?: number
  discount?: number
  tax?: number
  taxRate?: number
  notes?: string
  terms?: string
}

interface CustomerQuoteDetailProps {
  quote: Quote
}

export function CustomerQuoteDetail({ quote }: CustomerQuoteDetailProps) {
  const router = useRouter()
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false)
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false)
  const [isRequestChangesDialogOpen, setIsRequestChangesDialogOpen] = useState(false)
  const [changeRequest, setChangeRequest] = useState("")
  const [declineReason, setDeclineReason] = useState("")

  const isExpired = new Date(quote.validUntil) < new Date() && quote.status === "pending"
  const daysUntilExpiry = Math.ceil((new Date(quote.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const handleAccept = async () => {
    try {
      const { axiosInstance } = await import("@/lib/api-client")
      await axiosInstance.post(`/api/v1/provider/quotes/customer/${quote.id}/respond?action=accept`)
      const { toast } = await import("sonner")
      toast.success("Quote accepted!")
      setIsAcceptDialogOpen(false)
      router.push(`/customer/dashboard?tab=quotes`, { scroll: false })
    } catch (err: any) {
      const { toast } = await import("sonner")
      toast.error(err.message || "Failed to accept quote")
    }
  }

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      const { toast } = await import("sonner")
      toast.error("Please provide a reason for declining")
      return
    }
    try {
      const { axiosInstance } = await import("@/lib/api-client")
      await axiosInstance.post(`/api/v1/provider/quotes/customer/${quote.id}/respond?action=reject`)
      const { toast } = await import("sonner")
      toast.success("Quote declined.")
      setIsDeclineDialogOpen(false)
      router.push(`/customer/dashboard?tab=quotes`, { scroll: false })
    } catch (err: any) {
      const { toast } = await import("sonner")
      toast.error(err.message || "Failed to decline quote")
    }
  }

  const handleRequestChanges = async () => {
    if (!changeRequest.trim()) {
      const { toast } = await import("sonner")
      toast.error("Please describe the changes you'd like")
      return
    }
    // Send as a message to the provider via messaging
    try {
      const { axiosInstance } = await import("@/lib/api-client")
      if (quote.providerId) {
        await axiosInstance.post("/api/v1/messages/send", {
          recipient_id: quote.providerId,
          message: `Change request for Quote ${quote.id}: ${changeRequest}`,
          message_type: "quote",
        })
      }
      const { toast } = await import("sonner")
      toast.success("Change request sent to provider.")
      setIsRequestChangesDialogOpen(false)
      router.push(`/customer/dashboard?tab=quotes`, { scroll: false })
    } catch (err: any) {
      const { toast } = await import("sonner")
      toast.error(err.message || "Failed to send change request")
    }
  }

  return (
    <div className="space-y-6">
      {/* Quote Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Quote {quote.id}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {quote.provider} • {quote.service}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isExpired && (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Expired
                </Badge>
              )}
              {!isExpired && daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                  <Clock className="w-3 h-3 mr-1" />
                  Expires in {daysUntilExpiry} day{daysUntilExpiry > 1 ? "s" : ""}
                </Badge>
              )}
              <Badge variant={quote.status === "pending" ? "secondary" : quote.status === "accepted" ? "default" : "destructive"}>
                {quote.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                {quote.status === "accepted" && <CheckCircle className="w-3 h-3 mr-1" />}
                {quote.status === "declined" && <XCircle className="w-3 h-3 mr-1" />}
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1).replace("_", " ")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(quote.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Valid Until</p>
                <p className="font-medium">{new Date(quote.validUntil).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Total Amount</p>
                <p className="font-bold text-lg">{quote.total.toLocaleString()} {quote.currency || "RWF"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      {quote.lineItems && quote.lineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quote Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.unitPrice.toLocaleString()} {quote.currency || "RWF"}</TableCell>
                      <TableCell className="text-right font-medium">{item.total.toLocaleString()} {quote.currency || "RWF"}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                    <TableCell className="text-right font-medium">{quote.subtotal?.toLocaleString() || quote.lineItems.reduce((sum, item) => sum + item.total, 0).toLocaleString()} {quote.currency || "RWF"}</TableCell>
                  </TableRow>
                  {quote.discount && quote.discount > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-right text-green-600">Discount</TableCell>
                      <TableCell className="text-right text-green-600">-{quote.discount.toLocaleString()} {quote.currency || "RWF"}</TableCell>
                    </TableRow>
                  )}
                  {quote.tax && quote.tax > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-right">VAT ({quote.taxRate || 18}%)</TableCell>
                      <TableCell className="text-right">{quote.tax.toLocaleString()} {quote.currency || "RWF"}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold text-lg">Total</TableCell>
                    <TableCell className="text-right font-bold text-lg text-primary">{quote.total.toLocaleString()} {quote.currency || "RWF"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes and Terms */}
      {(quote.notes || quote.terms) && (
        <div className="grid md:grid-cols-2 gap-4">
          {quote.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.notes}</p>
              </CardContent>
            </Card>
          )}
          {quote.terms && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.terms}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Actions */}
      {quote.status === "pending" && !isExpired && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="flex-1" 
                onClick={() => setIsAcceptDialogOpen(true)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept Quote
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsRequestChangesDialogOpen(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Request Changes
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={() => setIsDeclineDialogOpen(true)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {quote.status === "accepted" && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">This quote has been accepted</span>
            </div>
          </CardContent>
        </Card>
      )}

      {quote.status === "declined" && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              <span className="font-semibold">This quote has been declined</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accept Dialog */}
      <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Quote</DialogTitle>
            <DialogDescription>
              By accepting this quote, you agree to proceed with booking and payment according to the terms and conditions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Total Amount:</p>
              <p className="text-2xl font-bold">{quote.total.toLocaleString()} {quote.currency || "RWF"}</p>
            </div>
            <Button className="w-full" onClick={handleAccept}>
              Confirm Acceptance
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setIsAcceptDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Quote</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this quote. The provider will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="declineReason">Reason for Declining</Label>
              <Textarea
                id="declineReason"
                placeholder="e.g., Price is too high, service doesn't match requirements..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" className="flex-1" onClick={handleDecline}>
                Decline Quote
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setIsDeclineDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Changes Dialog */}
      <Dialog open={isRequestChangesDialogOpen} onOpenChange={setIsRequestChangesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Describe the changes you'd like the provider to make to this quote.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="changeRequest">Requested Changes</Label>
              <Textarea
                id="changeRequest"
                placeholder="e.g., Can you reduce the price by 10%? Could we add an additional service..."
                value={changeRequest}
                onChange={(e) => setChangeRequest(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleRequestChanges}>
                Send Request
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setIsRequestChangesDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


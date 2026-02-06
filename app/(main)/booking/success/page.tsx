"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, MapPin, Users, Phone, Mail, Download } from "lucide-react"

export default function BookingSuccessPage() {
  const bookingDetails = {
    reference: "UBK-789123",
    service: "Traditional Rwandan Wedding Dancers",
    provider: "Intore Cultural Group",
    date: "2024-06-15",
    time: "14:00",
    location: "Kigali Serena Hotel",
    guests: 150,
    amount: 126000,
    customerName: "Marie & Jean Baptiste",
    customerPhone: "+250 788 123 456",
    customerEmail: "marie.jean@example.com",
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Your Rwandan wedding service has been successfully booked. Get ready to celebrate!
            </p>
          </div>

          {/* Booking Details */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Booking Details</h2>
                <Badge variant="secondary">Confirmed</Badge>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Booking Reference</label>
                    <p className="font-mono text-lg">{bookingDetails.reference}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Amount Paid</label>
                    <p className="font-semibold text-lg">{bookingDetails.amount.toLocaleString()} RWF</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Service</label>
                  <p className="font-medium">{bookingDetails.service}</p>
                  <p className="text-sm text-muted-foreground">{bookingDetails.provider}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{bookingDetails.date}</p>
                      <p className="text-xs text-muted-foreground">{bookingDetails.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{bookingDetails.guests} guests</p>
                      <p className="text-xs text-muted-foreground">Expected attendance</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{bookingDetails.location}</p>
                    <p className="text-xs text-muted-foreground">Event venue</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">What Happens Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Confirmation Email</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive a detailed confirmation email within 5 minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Provider Contact</p>
                    <p className="text-sm text-muted-foreground">
                      {bookingDetails.provider} will contact you within 24 hours to finalize details
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Final Preparation</p>
                    <p className="text-sm text-muted-foreground">
                      Coordinate final details 1 week before your wedding date
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Your Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{bookingDetails.customerPhone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{bookingDetails.customerEmail}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download Booking Confirmation
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline">View My Bookings</Button>
              <Button variant="outline">Book Another Service</Button>
            </div>
            <Button variant="ghost" className="w-full">
              Return to Homepage
            </Button>
          </div>

          {/* Support */}
          <div className="text-center mt-8 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Need help with your booking?</p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <span>📞 +250 788 123 456</span>
              <span>✉️ support@ubukwe.rw</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

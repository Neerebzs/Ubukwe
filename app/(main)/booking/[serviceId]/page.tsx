"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MapPin, Star, CreditCard, Shield, CheckCircle, ArrowLeft, Phone, Mail, Heart } from "lucide-react"

export default function BookingPage({ params }: { params: { serviceId: string } }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    location: "",
    guestCount: "",
    specialRequests: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    acceptedContract: false,
  })

  // Mock service data - in real app this would be fetched based on serviceId
  const service = {
    id: params.serviceId,
    provider: "Intore Cultural Group",
    title: "Traditional Rwandan Wedding Dancers",
    description: "Authentic Intore dance performance with traditional costumes and live drumming",
    price: 120000,
    rating: 4.9,
    reviews: 45,
    location: "Kigali, Rwanda",
    experience: "8 years",
    image: "/rwandan-traditional-dancer.jpg",
    features: [
      "Professional choreography",
      "Traditional costumes included",
      "Live drumming accompaniment",
      "Cultural storytelling",
      "Photo opportunities",
    ],
    availability: ["2024-03-20", "2024-03-22", "2024-03-25", "2024-03-28"],
  }

  const handleInputChange = (field: string, value: string) => {
    setBookingData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleBookingSubmit = () => {
    // In real app, this would process the booking and payment
    console.log("Booking submitted:", bookingData)
    setCurrentStep(4) // Go to confirmation
  }

  const availableTimeslots = ["09:00", "11:00", "13:00", "15:00", "17:00"]

  const isDateAvailable = (date: string) => service.availability.includes(date)

  return (
    <div className="min-h-screen bg-[#f9fafc]">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-semibold">Book Your Wedding Service</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
                  </div>
                  {step < 4 && <div className={`w-12 h-0.5 mx-2 ${step < currentStep ? "bg-primary" : "bg-muted"}`} />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Service Details */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Service Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={service.image || "/placeholder.svg"} />
                        <AvatarFallback>IC</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">{service.title}</h3>
                        <p className="text-muted-foreground">{service.provider}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="text-sm">{service.rating}</span>
                            <span className="text-xs text-muted-foreground ml-1">({service.reviews} reviews)</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            {service.location}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">What's Included:</h4>
                      <ul className="space-y-1">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="date">Wedding Date (Available only)</Label>
                          <select
                            id="date"
                            value={bookingData.date}
                            onChange={(e) => handleInputChange("date", e.target.value)}
                            className="w-full h-10 px-3 rounded-md border bg-white text-sm"
                          >
                            <option value="" disabled>Select available date</option>
                            {service.availability.map((d) => (
                              <option key={d} value={d}>{new Date(d).toLocaleDateString()}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="time">Preferred Time</Label>
                          <select
                            id="time"
                            value={bookingData.time}
                            onChange={(e) => handleInputChange("time", e.target.value)}
                            className="w-full h-10 px-3 rounded-md border bg-white text-sm"
                            disabled={!bookingData.date}
                          >
                            <option value="" disabled>Select time</option>
                            {availableTimeslots.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="location">Event Location</Label>
                        <Input
                          id="location"
                          placeholder="Enter venue address or location"
                          value={bookingData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="guestCount">Number of Guests</Label>
                        <Input
                          id="guestCount"
                          type="number"
                          placeholder="Expected number of guests"
                          value={bookingData.guestCount}
                          onChange={(e) => handleInputChange("guestCount", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="specialRequests">Special Requests</Label>
                        <Textarea
                          id="specialRequests"
                          placeholder="Any special requirements or requests for your performance..."
                          value={bookingData.specialRequests}
                          onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                        />
                      </div>
                    </div>

                    <Button onClick={handleNextStep} className="w-full" disabled={!bookingData.date || !isDateAvailable(bookingData.date) || !bookingData.time}>
                      Continue to Contact Details
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Contact Information */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="contactName">Full Name</Label>
                      <Input
                        id="contactName"
                        placeholder="Your full name"
                        value={bookingData.contactName}
                        onChange={(e) => handleInputChange("contactName", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactPhone">Phone Number</Label>
                      <Input
                        id="contactPhone"
                        placeholder="+250 XXX XXX XXX"
                        value={bookingData.contactPhone}
                        onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactEmail">Email Address</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="your.email@example.com"
                        value={bookingData.contactEmail}
                        onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                      />
                    </div>

                    <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-lg">
                      <Shield className="h-5 w-5 text-primary" />
                      <div className="text-sm">
                        <p className="font-medium">Your information is secure</p>
                        <p className="text-muted-foreground">
                          We only share your contact details with your chosen service provider.
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button variant="outline" onClick={handlePrevStep} className="flex-1 bg-transparent">
                        Back
                      </Button>
                      <Button onClick={handleNextStep} className="flex-1">
                        Continue to Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Payment + Contract Confirmation */}
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment & Contract</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="font-medium">Secure Payment</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your payment is protected by industry-standard encryption and security measures.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Payment Method</Label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <Button variant="outline" className="h-12 justify-start bg-transparent">
                            <CreditCard className="h-5 w-5 mr-2" />
                            Credit Card
                          </Button>
                          <Button variant="outline" className="h-12 justify-start bg-transparent">
                            <Phone className="h-5 w-5 mr-2" />
                            Mobile Money
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input id="expiry" placeholder="MM/YY" />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" placeholder="123" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="cardName">Cardholder Name</Label>
                          <Input id="cardName" placeholder="Name on card" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <Label>Booking Contract</Label>
                      <div className="text-sm text-muted-foreground">
                        Review and accept the booking contract terms before completing your booking.
                      </div>
                      <div className="flex items-start gap-2 p-3 border rounded-md bg-white">
                        <input
                          id="acceptContract"
                          type="checkbox"
                          className="mt-1"
                          checked={bookingData.acceptedContract}
                          onChange={(e) => handleInputChange("acceptedContract", e.target.checked as any)}
                        />
                        <label htmlFor="acceptContract" className="text-sm">
                          I agree to the booking contract and payment schedule.
                          <button type="button" className="ml-2 underline" onClick={() => alert("Show contract preview (pending)")}>View contract</button>
                        </label>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button variant="outline" onClick={handlePrevStep} className="flex-1 bg-transparent">
                        Back
                      </Button>
                      <Button onClick={handleBookingSubmit} className="flex-1" disabled={!bookingData.acceptedContract}>
                        Complete Booking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                    <p className="text-muted-foreground mb-6">
                      Your wedding service has been successfully booked. You will receive a confirmation email shortly.
                    </p>

                    <div className="bg-muted/30 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold mb-2">Booking Reference</h3>
                      <p className="text-lg font-mono">UBK-{Date.now().toString().slice(-6)}</p>
                    </div>

                    <div className="space-y-3">
                      <Button className="w-full">View My Bookings</Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        Book Another Service
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={service.image || "/placeholder.svg"} />
                      <AvatarFallback>IC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{service.provider}</h4>
                      <p className="text-xs text-muted-foreground">{service.title}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    {bookingData.date && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{new Date(bookingData.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    )}
                    {bookingData.time && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span>{bookingData.time}</span>
                      </div>
                    )}
                    {bookingData.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="text-right text-xs">{bookingData.location}</span>
                      </div>
                    )}
                    {bookingData.guestCount && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Guests:</span>
                        <span>{bookingData.guestCount}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Service Fee:</span>
                      <span>{service.price.toLocaleString()} RWF</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Platform Fee:</span>
                      <span>{(service.price * 0.05).toLocaleString()} RWF</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total:</span>
                      <span>{(service.price * 1.05).toLocaleString()} RWF</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p>By proceeding, you agree to our Terms of Service and acknowledge our Privacy Policy.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Provider Contact */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>+250 788 123 456</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>support@ubukwe.rw</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

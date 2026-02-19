"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  MapPin, Star, CreditCard, Shield, CheckCircle,
  ArrowLeft, Phone, Mail, Heart, Calendar as CalendarIcon,
  ChevronRight, Loader2, Info
} from "lucide-react"
import { apiClient, ProviderService, API_ENDPOINTS, Wedding } from "@/lib/api"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

export default function BookingPage({ params }: { params: { serviceId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const packageId = searchParams.get('packageId')
  const packageName = searchParams.get('packageName')

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast.error('Authentication required', {
        description: 'Please login to access the booking page.'
      });
      router.push('/auth/signin');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    date: undefined as Date | undefined,
    time: "",
    location: "",
    guestCount: "",
    specialRequests: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    acceptedContract: false,
    paymentMethod: "momo" as "card" | "momo",
    momoProvider: "" as "mtn" | "airtel" | "mpesa" | "",
    cardHolder: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  })

  // Fetch actual service data
  const { data: service, isLoading: isServiceLoading, error } = useQuery({
    queryKey: ["service", params.serviceId],
    queryFn: async () => {
      try {
        console.log(`🔍 BookingPage: Fetching service ${params.serviceId}`);
        const response = await apiClient.get<ProviderService>(API_ENDPOINTS.SERVICES.DETAILS(params.serviceId));
        return (response as any).data || response;
      } catch (err) {
        console.error(`❌ BookingPage: Fetch error:`, err);
        throw err;
      }
    }
  })

  // Fetch user's wedding details
  const { data: wedding, isLoading: isWeddingLoading } = useQuery({
    queryKey: ["wedding-me"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<Wedding>(API_ENDPOINTS.WEDDING.ME);
        return (response as any).data || response;
      } catch (err: any) {
        if (err.message?.includes("404")) return null;
        throw err;
      }
    },
    enabled: isAuthenticated
  })

  // Auto-fill effects
  useEffect(() => {
    if (user) {
      setBookingData(prev => ({
        ...prev,
        contactName: prev.contactName || user.full_name || user.username || "",
        contactEmail: prev.contactEmail || user.email || "",
        contactPhone: prev.contactPhone || user.phone_number || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (wedding && wedding.wedding_date) {
      setBookingData(prev => ({
        ...prev,
        date: prev.date || new Date(wedding.wedding_date)
      }));
    }
  }, [wedding]);

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingPayload: any) => {
      const response = await apiClient.post('/api/v1/bookings/bookings', bookingPayload);
      return response;
    },
    onSuccess: (data) => {
      console.log('✅ Booking created:', data);
      toast.success('Booking request sent successfully!');
      setCurrentStep(4); // Go to confirmation
      // Navigate to customer dashboard bookings tab after 3 seconds
      setTimeout(() => {
        router.push('/customer/dashboard?tab=bookings');
      }, 3000);
    },
    onError: (error: any) => {
      console.error('❌ Booking error:', error);
      toast.error(error.response?.data?.detail || 'Failed to create booking request');
    }
  })

  const handleInputChange = (field: string, value: any) => {
    setBookingData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleBookingSubmit = () => {
    if (!service || !bookingData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Prepare booking payload
    const bookingPayload = {
      service_id: params.serviceId,
      wedding_id: wedding?.id || null,
      booking_date: bookingData.date.toISOString().split('T')[0], // Format: YYYY-MM-DD
      package_id: packageId || null,
      package_name: packageName || null,
      booking_amount: pricing.basePrice,
      total_amount: pricing.total,
      deposit_amount: pricing.platformFee,
      customer_name: bookingData.contactName,
      customer_email: bookingData.contactEmail,
      customer_phone: bookingData.contactPhone,
      event_location: bookingData.location,
      guest_count: bookingData.guestCount ? parseInt(bookingData.guestCount) : null,
      special_requests: bookingData.specialRequests || null
    };

    console.log('📤 Sending booking request:', bookingPayload);
    createBookingMutation.mutate(bookingPayload);
  }

  const availableTimeslots = ["09:00", "11:00", "13:00", "15:00", "17:00"]

  // Calculating pricing
  const pricing = useMemo(() => {
    const basePrice = service?.price_range_min || 0
    const platformFee = basePrice * 0.05
    const vat = basePrice * 0.18 // 18% VAT in Rwanda
    const total = basePrice + platformFee + vat
    return { basePrice, platformFee, vat, total }
  }, [service])

  if (isAuthLoading || (isAuthLoading && !user)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafc]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Authenticating...</p>
      </div>
    )
  }

  if (isServiceLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafc]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading service detail...</p>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafc]">
        <p className="text-destructive font-medium mb-4">
          {error ? `Error: ${(error as any).message}` : "Service not found or an error occurred."}
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    )
  }

  const getServiceImage = () => {
    const item = service?.gallery?.[0]
    if (!item) return "/placeholder.svg"
    return typeof item === "string" ? item : item.url
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold">{service.name}</h1>
              <p className="text-xs text-muted-foreground">Booking with {service.business_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-8">
            <span className={cn(currentStep >= 1 ? "text-primary" : "")}>Details</span>
            <ChevronRight className="h-4 w-4" />
            <span className={cn(currentStep >= 2 ? "text-primary" : "")}>Contact</span>
            <ChevronRight className="h-4 w-4" />
            <span className={cn(currentStep >= 4 ? "text-primary" : "")}>Request Sent</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto grid grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-3">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {currentStep === 1 && (
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="h-2 bg-primary" />
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Event Details</CardTitle>
                <p className="text-muted-foreground">When and where is your big day?</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Wedding Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal h-12 border-gray-200",
                            !bookingData.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {bookingData.date ? (
                            new Intl.DateTimeFormat("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }).format(bookingData.date)
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={bookingData.date}
                          onSelect={(date) => handleInputChange("date", date)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Preferred Time</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={bookingData.time}
                        onChange={(e) => handleInputChange("time", e.target.value)}
                        className="col-span-2 w-full h-12 px-3 rounded-md border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        <option value="" disabled>Select time</option>
                        {availableTimeslots.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold">Events Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Enter venue address or city"
                      className="pl-10 h-12 border-gray-200"
                      value={bookingData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Guest Count</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 200"
                      className="h-12 border-gray-200"
                      value={bookingData.guestCount}
                      onChange={(e) => handleInputChange("guestCount", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold">Any Special Requests?</Label>
                  <Textarea
                    placeholder="Tell the provider about any specific needs or vision for the service..."
                    className="min-h-[120px] border-gray-200 focus:ring-primary"
                    value={bookingData.specialRequests}
                    onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleNextStep}
                  className="w-full h-12 text-lg font-medium shadow-md shadow-primary/20"
                  disabled={!bookingData.date || !bookingData.time || !bookingData.location}
                >
                  Confirm & Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="h-2 bg-primary" />
              <CardHeader>
                <CardTitle className="text-2xl">Contact Information</CardTitle>
                <p className="text-muted-foreground">How can the provider reach you?</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Full Name</Label>
                  <Input
                    placeholder="Enter your full name"
                    className="h-12 border-gray-200"
                    value={bookingData.contactName}
                    onChange={(e) => handleInputChange("contactName", e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 h-12 border-gray-200"
                        value={bookingData.contactEmail}
                        onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="+250 78x xxx xxx"
                        className="pl-10 h-12 border-gray-200"
                        value={bookingData.contactPhone}
                        onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex gap-3 text-sm text-blue-900">
                  <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Secure Booking.</strong> Your contact details are only shared with <b>{service.business_name}</b> once the booking is confirmed.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={handlePrevStep} className="h-12 px-8">
                    Back
                  </Button>
                  <Button
                    onClick={handleBookingSubmit}
                    className="flex-1 h-12 text-lg font-bold shadow-md shadow-primary/20"
                    disabled={!bookingData.contactName || !bookingData.contactEmail || !bookingData.contactPhone || createBookingMutation.isPending}
                  >
                    {createBookingMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Request...
                      </>
                    ) : (
                      'Send Booking Request'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="h-2 bg-primary" />
              <CardHeader>
                <CardTitle className="text-2xl">Payment & Confirmation</CardTitle>
                <p className="text-muted-foreground">Select your preferred payment method.</p>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Payment Method</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleInputChange("paymentMethod", "card")}
                      className={cn(
                        "h-20 flex-col items-center gap-2 border-2 transition-all text-sm font-semibold",
                        bookingData.paymentMethod === "card" ? "border-primary bg-primary/5 shadow-sm" : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <CreditCard className={cn("h-6 w-6", bookingData.paymentMethod === "card" ? "text-primary" : "text-gray-400")} />
                      Credit / Debit Card
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleInputChange("paymentMethod", "momo")}
                      className={cn(
                        "h-20 flex-col items-center gap-2 border-2 transition-all text-sm font-semibold",
                        bookingData.paymentMethod === "momo" ? "border-primary bg-primary/5 shadow-sm" : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <Phone className={cn("h-6 w-6", bookingData.paymentMethod === "momo" ? "text-primary" : "text-gray-400")} />
                      Mobile Money
                    </Button>
                  </div>
                </div>

                {bookingData.paymentMethod === "momo" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Provider</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "mtn", name: "MTN MoMo", color: "bg-[#FFCC00] text-black" },
                        { id: "airtel", name: "Airtel Money", color: "bg-[#FF0000] text-white" },
                        { id: "mpesa", name: "M-Pesa", color: "bg-[#4B9123] text-white" },
                      ].map((provider) => (
                        <button
                          key={provider.id}
                          onClick={() => handleInputChange("momoProvider", provider.id)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all text-[10px] font-bold h-20",
                            bookingData.momoProvider === provider.id
                              ? "border-primary bg-white shadow-md scale-105"
                              : "border-gray-100 bg-gray-50/50 hover:border-gray-200 opacity-70"
                          )}
                        >
                          <div className={cn("h-8 w-8 rounded-full mb-2 flex items-center justify-center text-[8px]", provider.color)}>
                            {provider.id.toUpperCase()}
                          </div>
                          {provider.name}
                        </button>
                      ))}
                    </div>

                    {bookingData.momoProvider && (
                      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="078xxxxxxx"
                              className="h-11 pl-10 bg-gray-50 border-transparent focus:bg-white focus:border-primary transition-colors"
                              value={bookingData.contactPhone}
                              onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground">A prompt will be sent to this number to authorize the payment.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {bookingData.paymentMethod === "card" && (
                  <div className="rounded-xl border border-gray-200 p-6 space-y-4 bg-white shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 text-primary">
                      <CreditCard className="h-5 w-5" />
                      <span className="font-bold">Card Details</span>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase">Card Holder Name</Label>
                        <Input
                          placeholder="John Doe"
                          className="h-11 bg-gray-50 border-transparent focus:bg-white focus:border-primary transition-colors"
                          value={bookingData.cardHolder}
                          onChange={(e) => handleInputChange("cardHolder", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase">Card Number</Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="xxxx xxxx xxxx xxxx"
                            className="h-11 pl-10 bg-gray-50 border-transparent focus:bg-white focus:border-primary transition-colors"
                            value={bookingData.cardNumber}
                            onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase">Expiry Date</Label>
                          <Input
                            placeholder="MM/YY"
                            className="h-11 bg-gray-50 border-transparent focus:bg-white focus:border-primary transition-colors"
                            value={bookingData.cardExpiry}
                            onChange={(e) => handleInputChange("cardExpiry", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase">CVV</Label>
                          <Input
                            placeholder="xxx"
                            type="password"
                            maxLength={3}
                            className="h-11 bg-gray-50 border-transparent focus:bg-white focus:border-primary transition-colors"
                            value={bookingData.cardCvv}
                            onChange={(e) => handleInputChange("cardCvv", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="relative flex h-5 w-5 items-center justify-center">
                    <input
                      id="acceptContract"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={bookingData.acceptedContract}
                      onChange={(e) => handleInputChange("acceptedContract", e.target.checked)}
                    />
                  </div>
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="acceptContract"
                      className="text-sm font-medium leading-normal cursor-pointer"
                    >
                      I agree to the <button type="button" className="text-primary hover:underline" onClick={() => alert("Show contract")}>Booking Terms & Conditions</button> and cancellation policy.
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={handlePrevStep} className="h-12 px-8">
                    Back
                  </Button>
                  <Button onClick={handleBookingSubmit} className="flex-1 h-12 text-lg font-bold" disabled={
                    !bookingData.acceptedContract ||
                    (bookingData.paymentMethod === "momo" && (!bookingData.momoProvider || !bookingData.contactPhone)) ||
                    (bookingData.paymentMethod === "card" && (!bookingData.cardHolder || !bookingData.cardNumber || !bookingData.cardExpiry || !bookingData.cardCvv))
                  }>
                    Confirm Booking • {pricing.total.toLocaleString()} RWF
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="border-none shadow-sm text-center py-12 px-8">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6 animate-bounce">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Booking Requested!</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                We've sent your request to <strong>{service.business_name}</strong>. They will respond within 24 hours.
              </p>

              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 mb-8 inline-block min-w-[300px]">
                <p className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-2">Reference Code</p>
                <p className="text-2xl font-mono font-bold tracking-wider text-primary">UBK-{Date.now().toString().slice(-6)}</p>
              </div>

              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <Button className="h-12" onClick={() => router.push('/customer/dashboard?tab=bookings')}>
                  View My Bookings
                </Button>
                <Button variant="outline" className="h-12" onClick={() => router.push('/')}>
                  Back to Home
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Sticky Summary Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="relative h-32 w-full overflow-hidden">
                <img
                  src={getServiceImage()}
                  alt={service.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-sm font-bold text-white line-clamp-1">{service.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-white/90">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{service.rating || "NEW"}</span>
                    <span className="mx-1 opacity-50">•</span>
                    <MapPin className="h-2.5 w-2.5" />
                    <span>{service.location}</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Booking for:</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">{service.business_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-xs">{service.business_name}</span>
                    </div>
                  </div>
                  {bookingData.date && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(bookingData.date)}</span>
                    </div>
                  )}
                  {bookingData.time && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{bookingData.time}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Price</span>
                    <span>{pricing.basePrice.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Service Fee (5%)</span>
                      <Popover>
                        <PopoverTrigger><Info className="h-3 w-3 text-muted-foreground cursor-help" /></PopoverTrigger>
                        <PopoverContent className="text-xs p-2">This helps us run the platform and provide support.</PopoverContent>
                      </Popover>
                    </div>
                    <span>{pricing.platformFee.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT (18%)</span>
                    <span>{pricing.vat.toLocaleString()} RWF</span>
                  </div>
                </div>

                <div className="bg-gray-50 -mx-5 px-5 py-3 mt-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-lg text-gray-900">Total</span>
                    <span className="font-extrabold text-xl text-primary">{pricing.total.toLocaleString()} RWF</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-primary/5 border border-primary/10">
              <CardContent className="p-4 flex gap-3 text-xs leading-relaxed text-gray-600">
                <Shield className="h-4 w-4 text-primary shrink-0" />
                <p><strong>Cancellation Policy:</strong> Free cancellation for 48 hours. After that, cancel up to 7 days before for a 50% refund.</p>
              </CardContent>
            </Card>

            <div className="text-[10px] text-center text-muted-foreground px-4">
              Protected by <strong>Ubukwe Secure Booking</strong>. Our 100% money-back guarantee policy applies if the service is not delivered.
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Share2,
  Heart,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PublicEvent } from "@/lib/api/customer-events";
import { TicketPurchaseForm } from "./ticket-purchase-form";
import { PaymentUI } from "./payment-ui";
import { TicketDownload } from "./ticket-download";
import { usePurchaseTicket } from "@/hooks/useCustomerEvents";
import QRCode from "qrcode.react";
import JsBarcode from "jsbarcode";
import { useEffect, useRef } from "react";

interface EventDetailsProps {
  event: PublicEvent;
}

type Step = "details" | "purchase" | "payment" | "success";

export function EventDetails({ event }: EventDetailsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentStep, setCurrentStep] = useState<Step>("details");
  const [isFavorite, setIsFavorite] = useState(false);
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [purchasedTicket, setPurchasedTicket] = useState<any>(null);
  const barcodeRef = useRef<HTMLDivElement>(null);

  const purchaseTicketMutation = usePurchaseTicket();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate occupancy percentage
  const occupancyPercentage = Math.round(
    (event.tickets_sold / event.capacity) * 100
  );

  // Handle ticket purchase form submission
  const handlePurchaseSubmit = (data: any) => {
    setPurchaseData(data);
    setCurrentStep("payment");
  };

  // Handle payment submission
  const handlePaymentSubmit = async (paymentData: any) => {
    setPaymentData(paymentData);

    if (!purchaseData) return;

    try {
      const response = await purchaseTicketMutation.mutateAsync({
        eventId: event.id,
        ticketTypeId: purchaseData.ticketTypeId,
        ticketData: {
          holder_name: purchaseData.holderName,
          holder_email: purchaseData.holderEmail,
          holder_phone: purchaseData.holderPhone,
          quantity: purchaseData.quantity,
        },
      });

      // Generate QR code and barcode
      const qrCodeUrl = await generateQRCode(response.ticket_number);
      const barcodeUrl = await generateBarcode(response.ticket_number);

      setPurchasedTicket({
        ...response,
        qrCode: qrCodeUrl,
        barcode: barcodeUrl,
      });

      setCurrentStep("success");
      toast.success("Ticket purchased successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to purchase ticket");
    }
  };

  // Generate QR code
  const generateQRCode = async (data: string): Promise<string> => {
    try {
      const canvas = document.createElement("canvas");
      const qr = QRCode.render(data, { canvas });
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error generating QR code:", error);
      return "";
    }
  };

  // Generate barcode
  const generateBarcode = async (data: string): Promise<string> => {
    try {
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, data, {
        format: "CODE128",
        width: 2,
        height: 50,
        displayValue: true,
      });
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error generating barcode:", error);
      return "";
    }
  };

  // Get ticket type details
  const selectedTicketType = purchaseData
    ? event.ticket_types.find((t) => t.id === purchaseData.ticketTypeId)
    : null;

  const totalPrice = selectedTicketType
    ? selectedTicketType.price * purchaseData.quantity
    : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-4 py-4 max-w-6xl flex items-center justify-between">
          <Link href="/events">
            <Button
              variant="ghost"
              className="hover:bg-slate-50 rounded-full font-bold text-slate-600 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white border-slate-100 hover:border-rose-100 group transition-all duration-300"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isFavorite
                    ? "fill-rose-500 text-rose-500"
                    : "text-slate-400 group-hover:text-rose-400"
                }`}
              />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-white border-slate-100 hover:border-slate-300 group transition-all duration-300"
            >
              <Share2 className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 h-96">
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                  <span className="text-slate-500 text-lg font-semibold">
                    No image available
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Event Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {event.category}
                    </Badge>
                    {event.status === "published" && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        Active
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900">{event.title}</h1>
                </div>
              </div>

              {/* Event Meta Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-slate-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Date</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatDate(event.event_date)}
                    </p>
                  </div>
                </div>

                {event.event_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Time</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {event.event_time}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Location</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {event.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Capacity</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {event.capacity} seats
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start bg-transparent border-b border-slate-100 rounded-none h-auto p-0 gap-8">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 pb-4 text-slate-400 font-bold uppercase tracking-widest text-xs"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="tickets"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 pb-4 text-slate-400 font-bold uppercase tracking-widest text-xs"
                >
                  Tickets
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {event.description && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900">About This Event</h3>
                    <p className="text-slate-600 leading-relaxed">{event.description}</p>
                  </div>
                )}

                {/* Occupancy */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900">Availability</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tickets Sold</span>
                      <span className="font-semibold text-slate-900">
                        {event.tickets_sold} / {event.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${occupancyPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      {occupancyPercentage}% capacity filled
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Tickets Tab */}
              <TabsContent value="tickets" className="space-y-6 mt-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900">Available Tickets</h3>
                  <div className="grid gap-4">
                    {event.ticket_types.map((ticketType) => {
                      const available = ticketType.quantity - ticketType.sold;
                      return (
                        <Card key={ticketType.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900">
                                  {ticketType.name}
                                </h4>
                                {ticketType.description && (
                                  <p className="text-sm text-slate-600 mt-1">
                                    {ticketType.description}
                                  </p>
                                )}
                                <p className="text-xs text-slate-500 mt-2">
                                  {available} of {ticketType.quantity} available
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                  {ticketType.price.toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-500">RWF</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Purchase Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg">
              <CardHeader>
                <CardTitle>
                  {currentStep === "details" && "Get Your Ticket"}
                  {currentStep === "purchase" && "Select Ticket"}
                  {currentStep === "payment" && "Payment"}
                  {currentStep === "success" && "Success!"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStep === "details" && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-600 mb-3">
                        Secure your spot at this amazing event
                      </p>
                      <Button
                        onClick={() => setCurrentStep("purchase")}
                        className="w-full"
                      >
                        Buy Tickets
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === "purchase" && (
                  <div className="space-y-4">
                    <TicketPurchaseForm
                      event={event}
                      onSubmit={handlePurchaseSubmit}
                      isLoading={purchaseTicketMutation.isPending}
                      error={
                        purchaseTicketMutation.error
                          ? (purchaseTicketMutation.error as any).message
                          : undefined
                      }
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setCurrentStep("details")}
                    >
                      Back
                    </Button>
                  </div>
                )}

                {currentStep === "payment" && (
                  <div className="space-y-4">
                    <PaymentUI
                      amount={totalPrice}
                      eventTitle={event.title}
                      ticketCount={purchaseData?.quantity || 1}
                      onPaymentSubmit={handlePaymentSubmit}
                      isLoading={purchaseTicketMutation.isPending}
                      error={
                        purchaseTicketMutation.error
                          ? (purchaseTicketMutation.error as any).message
                          : undefined
                      }
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setCurrentStep("purchase")}
                      disabled={purchaseTicketMutation.isPending}
                    >
                      Back
                    </Button>
                  </div>
                )}

                {currentStep === "success" && purchasedTicket && (
                  <div className="space-y-4">
                    <TicketDownload
                      ticketNumber={purchasedTicket.ticket_number}
                      eventTitle={event.title}
                      eventDate={formatDate(event.event_date)}
                      eventTime={event.event_time}
                      eventLocation={event.location}
                      eventImage={event.image_url}
                      ticketType={selectedTicketType?.name || "Standard"}
                      holderName={purchaseData.holderName}
                      holderEmail={purchaseData.holderEmail}
                      price={totalPrice}
                      qrCode={purchasedTicket.qrCode}
                      barcode={purchasedTicket.barcode}
                      status="confirmed"
                    />
                    <Button
                      onClick={() => router.push("/events")}
                      className="w-full"
                    >
                      Browse More Events
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TranslatedText } from "@/components/translated-text";
import { ArrowLeft, ArrowRight, Calendar, MapPin, Heart, Share2, ExternalLink, Minus, Plus, Loader2, AlertCircle, Mail, Ticket, Phone, Shield, XCircle } from "lucide-react";
import { usePublicEvent } from "@/hooks/useCustomerEvents";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TicketGraphic } from "@/components/customer/ticket-graphic";
import { startTicketFdiPayment, pollTicketOrderUntilSettled } from "@/lib/api/payments";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { toast } from "sonner";

type Step = "selection" | "information" | "payment" | "verifying" | "failed" | "success";

// Generate QR code (module scope so the verification effect can use it)
const generateQRCode = async (data: string): Promise<string> => {
  try {
    return await (QRCode.toDataURL(data, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 1,
      width: 300,
    }) as unknown as Promise<string>);
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

export default function EventTicketingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;

  // Present when we send the customer to the waiting page after starting FDI
  const returnedOrderId = searchParams.get("order_id");

  const { data: event, isLoading, error } = usePublicEvent(eventId);

  const [currentStep, setCurrentStep] = useState<Step>(returnedOrderId ? "verifying" : "selection");
  const [tickets, setTickets] = useState<Record<string, number>>({});
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [userInfo, setUserInfo] = useState({
    holderEmail: "",
    holderPhone: "",
  });
  const [userInfoErrors, setUserInfoErrors] = useState<Record<string, string>>({});
  const [purchasedTickets, setPurchasedTickets] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);
  const [failureMessage, setFailureMessage] = useState("");
  const verifyStartedRef = useRef(false);

  // Waiting page: poll FDI until the customer approves (or the pull fails)
  useEffect(() => {
    if (!returnedOrderId || verifyStartedRef.current) return;
    verifyStartedRef.current = true;

    (async () => {
      try {
        const result = await pollTicketOrderUntilSettled(returnedOrderId);

        if (result.status === "completed" && result.tickets?.length) {
          const generated = [];
          for (const ticket of result.tickets) {
            const qrCodeUrl = await generateQRCode(ticket.ticket_number);
            const barcodeUrl = await generateBarcode(ticket.ticket_number);
            generated.push({
              id: ticket.ticket_id,
              ticket_number: ticket.ticket_number,
              holder_name: ticket.holder_name,
              holder_email: ticket.holder_email,
              qrCode: qrCodeUrl,
              barcode: barcodeUrl,
              totalPrice: ticket.price,
              ticketTypeName: ticket.ticket_type,
            });
          }
          setPurchaseData({ holderEmail: result.customer_email, holderName: "Guest" });
          setPurchasedTickets(generated);
          setCurrentStep("success");
          toast.success(`Successfully purchased ${generated.length} ticket${generated.length > 1 ? "s" : ""}!`);
        } else if (result.status === "pending") {
          setFailureMessage("Still waiting for you to approve the payment on your phone. You can try again below.");
          setCurrentStep("failed");
        } else {
          setFailureMessage(result.reason || "The payment failed. No money was taken for unconfirmed payments.");
          setCurrentStep("failed");
        }
      } catch (err: any) {
        setFailureMessage(err?.response?.data?.detail || err?.message || "We could not verify your payment.");
        setCurrentStep("failed");
      }
    })();
  }, [returnedOrderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-6">
        <div className="relative flex items-center justify-center">
           <div className="absolute w-20 h-20 rounded-full border-[3px] border-slate-100" />
           <div className="absolute w-20 h-20 rounded-full border-[3px] border-[#608d64] border-t-transparent animate-spin" />
           <Calendar className="w-8 h-8 text-[#608d64] animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-serif italic text-2xl text-slate-900">
            <TranslatedText text="Loading Event..." />
          </h3>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Event Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This event is not available or has been removed.
            </p>
            <Button onClick={() => router.push("/events")} className="w-full">
              Browse All Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const updateTicketCount = (ticketId: string, change: number) => {
    setTickets(prev => {
      const current = prev[ticketId] || 0;
      const newCount = Math.max(0, current + change);
      return { ...prev, [ticketId]: newCount };
    });
  };

  const totalTickets = Object.values(tickets).reduce((sum, count) => sum + count, 0);

  // Determine if the event date is in the past
  const isPastEvent = event ? new Date(event.event_date) < new Date(new Date().toDateString()) : false;

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

  const handleContinueToInformation = () => {
    const selectedTickets = Object.keys(tickets)
      .filter(id => tickets[id] > 0)
      .map(id => {
        const type = event.ticket_types?.find(t => t.id === id);
        return {
          ticketTypeId: id,
          quantity: tickets[id],
          price: type?.price || 0,
          name: type?.name || "Ticket"
        };
      });

    if (selectedTickets.length === 0) return;

    const totalAmount = selectedTickets.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    setPurchaseData({
      selectedTickets,
      totalAmount,
    });
    setCurrentStep("information");
  };

  const validateUserInfo = () => {
    const errors: Record<string, string> = {};
    
    if (!userInfo.holderEmail.trim()) {
      errors.holderEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.holderEmail)) {
      errors.holderEmail = "Invalid email format";
    }
    if (!userInfo.holderPhone.trim()) {
      errors.holderPhone = "Mobile money number is required";
    }
    
    setUserInfoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToPayment = () => {
    if (!validateUserInfo()) return;
    
    setPurchaseData((prev: any) => ({
      ...prev,
      holderEmail: userInfo.holderEmail,
      holderName: "Guest", // Default name
      holderPhone: userInfo.holderPhone,
    }));
    setCurrentStep("payment");
  };

  // Create the order and start an FDI MoMo pull. The waiting URL comes back
  // with ?order_id=... and the effect below polls until the PIN is approved.
  const handlePayWithFdi = async () => {
    if (!purchaseData) return;
    const phone = (purchaseData.holderPhone || userInfo.holderPhone || "").trim();
    if (!phone) {
      toast.error("Enter the MTN or Airtel number that will pay");
      return;
    }

    setIsRedirectingToPayment(true);
    try {
      const items = purchaseData.selectedTickets.map((item: any) => ({
        ticket_type_id: item.ticketTypeId,
        tickets: Array(item.quantity).fill(null).map(() => ({
          holder_email: purchaseData.holderEmail,
          holder_name: purchaseData.holderName || "Guest",
          holder_phone: phone,
        })),
      }));

      await startTicketFdiPayment({
        eventId,
        customerEmail: purchaseData.holderEmail,
        phoneNumber: phone,
        paymentMethod: "mobile_money",
        items,
      });
    } catch (error: any) {
      setIsRedirectingToPayment(false);
      toast.error(error?.response?.data?.detail || error?.message || "Failed to start the payment");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Editorial Header */}
      <div className="pt-24 pb-12 border-b border-slate-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <Button
                variant="ghost"
                className="group -ml-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-all"
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Events
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-12 bg-[#608d64]/30" />
                <span className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">Ticketing Sanctuary</span>
              </div>
              <h1 className="font-serif italic text-5xl md:text-7xl text-slate-900 leading-tight">
                {event.title}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full border-slate-200 text-slate-400 hover:text-[#608d64] transition-all"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-[#608d64]" : ""}`} />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-slate-200 text-slate-400 hover:text-[#608d64] transition-all">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Side: Visual & Story */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-12">
            <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl border-8 border-[#fdfcf9]">
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                  <span className="text-slate-500">No image available</span>
                </div>
              )}
              <div className="absolute top-8 left-8">
                <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                  {event.ticket_types?.length || 0} Ticket Types
                </Badge>
              </div>
            </div>

            <div className="space-y-8 p-12 bg-[#fdfcf9] rounded-[40px] border border-slate-100">
              <h3 className="font-serif italic text-3xl text-slate-900">About the Gathering</h3>
              <p className="text-slate-500 font-light leading-relaxed text-lg">
                {event.description || "Experience an unforgettable event with amazing performances and great vibes."}
              </p>
            </div>

            </div>

          {/* Right Side: Ticketing */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-16">
            {/* ── Past event — hide all ticketing UI ── */}
            {isPastEvent ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                  <Calendar className="h-9 w-9 text-slate-300" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif italic text-3xl text-slate-400">This event has passed</h3>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    Tickets are no longer available for past events
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push("/events")}
                  className="rounded-full border-slate-200 text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest px-8 h-12"
                >
                  Browse Upcoming Events
                </Button>
              </div>
            ) : (
              <>
            {currentStep === "selection" && (
              <>
                {/* Event Highlights Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 animate-in fade-in slide-in-from-bottom duration-700">
                  <div className="p-8 rounded-[32px] bg-slate-50/50 border border-slate-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white text-[#608d64] shadow-sm">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Origin</p>
                    </div>
                    <div>
                      <p className="font-serif italic text-2xl text-slate-900 leading-tight">
                        {formatDate(event.event_date)}
                      </p>
                      {event.event_time && (
                        <p className="text-xs font-bold text-[#608d64] uppercase tracking-widest mt-2">
                          {event.event_time}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-8 rounded-[32px] bg-slate-50/50 border border-slate-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white text-[#608d64] shadow-sm">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Ritual Domain</p>
                    </div>
                    <div>
                      <p className="font-serif italic text-2xl text-slate-900 leading-tight truncate">
                        {event.location}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                        Validated Sanctuary
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ticket Passage Selection */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between pb-8 border-b border-slate-100">
                    <h2 className="font-serif italic text-4xl text-slate-900 text-center md:text-left">Secure Passage</h2>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Selection Window Open
                    </div>
                  </div>

                  <div className="space-y-6">
                    {event.ticket_types?.map((type) => {
                      const available = type.quantity - type.sold;
                      const isSoldOut = available <= 0;
                      
                      return (
                        <div
                          key={type.id}
                          className={`p-8 rounded-[40px] border transition-all duration-500 group ${
                            isSoldOut
                              ? "opacity-50 grayscale bg-slate-50 border-slate-100"
                              : "bg-white border-slate-100 hover:border-[#608d64]/30 hover:shadow-2xl hover:shadow-[#608d64]/5"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-3">
                              <div className="flex items-center gap-4">
                                <h3 className="font-serif italic text-2xl text-slate-900">{type.name}</h3>
                                {isSoldOut && (
                                  <Badge variant="destructive" className="bg-slate-200 text-slate-500 border-none rounded-full px-4 text-[8px] font-black tracking-widest">
                                    SOLD OUT
                                  </Badge>
                                )}
                              </div>
                              {type.description && (
                                <p className="text-slate-400 font-light text-sm italic">
                                  {type.description}
                                </p>
                              )}
                              <div className="text-xl font-light text-[#608d64] tracking-tight">
                                {type.price.toLocaleString()} <span className="text-[10px] font-black uppercase tracking-widest ml-1">RWF</span>
                              </div>
                              <p className="text-xs text-slate-500">{available} of {type.quantity} available</p>
                            </div>

                            {!isSoldOut && (
                              <div className="flex items-center gap-6 bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100 group-hover:bg-white group-hover:border-[#608d64]/20 transition-all">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-full border border-slate-200 text-slate-400 hover:text-[#608d64] hover:bg-white transition-all"
                                  onClick={() => updateTicketCount(type.id, -1)}
                                  disabled={!tickets[type.id]}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <div className="w-10 text-center font-serif italic text-3xl text-slate-900">
                                  {tickets[type.id] || 0}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-full bg-slate-900 text-white hover:bg-[#608d64] transition-all"
                                  onClick={() => updateTicketCount(type.id, 1)}
                                  disabled={tickets[type.id] >= available}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-12">
                    <Button
                      onClick={handleContinueToInformation}
                      className={`w-full h-20 rounded-full text-lg font-black uppercase tracking-[0.3em] transition-all duration-700 shadow-2xl ${
                        totalTickets > 0
                          ? "bg-[#608d64] text-white shadow-[#608d64]/20 hover:bg-slate-900 hover:shadow-black/20"
                          : "bg-slate-100 text-slate-300 pointer-events-none"
                      }`}
                      disabled={totalTickets === 0}
                    >
                      <TranslatedText text="Continue" />
                      <ArrowRight className="ml-4 h-6 w-6" />
                    </Button>
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8">
                      Security Provided by Ubukwe Collective • Encrypted Process
                    </p>
                  </div>
                </div>
              </>
            )}

            {currentStep === "information" && purchaseData && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom duration-700">
                <div className="flex items-center gap-3 pb-8 border-b border-slate-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentStep("selection")}
                    className="h-10 w-10 rounded-full"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h2 className="font-serif italic text-4xl text-slate-900">Your Email</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                      We'll send your tickets to this email address
                    </p>
                  </div>
                </div>

                <div className="space-y-8 p-12 bg-[#fdfcf9] rounded-[40px] border border-slate-100">
                  {/* Order Summary */}
                  <div className="space-y-4 pb-6 border-b border-slate-200">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Summary</h3>
                    <div className="space-y-3">
                      {purchaseData.selectedTickets.map((item: any) => (
                        <div key={item.ticketTypeId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#608d64]/10 flex items-center justify-center">
                              <Ticket className="h-5 w-5 text-[#608d64]" />
                            </div>
                            <div>
                              <p className="font-serif italic text-lg text-slate-900">{item.name}</p>
                              <p className="text-xs text-slate-500">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-serif italic text-lg text-slate-900">
                              {(item.price * item.quantity).toLocaleString()} RWF
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.price.toLocaleString()} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          type="email"
                          value={userInfo.holderEmail}
                          onChange={(e) => {
                            setUserInfo((prev) => ({ ...prev, holderEmail: e.target.value }));
                            setUserInfoErrors({});
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleContinueToPayment();
                          }}
                          placeholder="your.email@example.com"
                          className="h-16 pl-16 pr-6 rounded-2xl border-slate-200 bg-white focus:ring-0 focus:border-[#608d64]/30 transition-all font-serif italic text-lg"
                        />
                      </div>
                      {userInfoErrors.holderEmail && (
                        <p className="text-xs text-red-500 ml-1">{userInfoErrors.holderEmail}</p>
                      )}
                      <p className="text-xs text-slate-400 ml-1">
                        Your tickets and confirmation will be sent to this email
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Money Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          type="tel"
                          value={userInfo.holderPhone}
                          onChange={(e) => {
                            setUserInfo((prev) => ({ ...prev, holderPhone: e.target.value }));
                            setUserInfoErrors({});
                          }}
                          placeholder="078xxxxxxx"
                          className="h-16 pl-16 pr-6 rounded-2xl border-slate-200 bg-white focus:ring-0 focus:border-[#608d64]/30 transition-all font-serif italic text-lg"
                        />
                      </div>
                      {userInfoErrors.holderPhone && (
                        <p className="text-xs text-red-500 ml-1">{userInfoErrors.holderPhone}</p>
                      )}
                      <p className="text-xs text-slate-400 ml-1">
                        MTN (078/079) or Airtel (072/073) — you will approve the payment on this phone
                      </p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                      <span className="font-serif italic text-3xl text-[#608d64]">
                        {purchaseData.totalAmount.toLocaleString()} <span className="text-sm">RWF</span>
                      </span>
                    </div>
                    <Button
                      onClick={handleContinueToPayment}
                      className="w-full h-20 rounded-full bg-[#608d64] text-white hover:bg-slate-900 text-lg font-black uppercase tracking-[0.3em] transition-all duration-700 shadow-2xl shadow-[#608d64]/20"
                    >
                      <TranslatedText text="Continue to Payment" />
                      <ArrowRight className="ml-4 h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </div>
            )}


            {currentStep === "payment" && purchaseData && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentStep("information")}
                    className="h-10 w-10"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="font-serif italic text-3xl text-slate-900">Payment</h2>
                </div>

                <div className="space-y-8 p-12 bg-[#fdfcf9] rounded-[40px] border border-slate-100">
                  {/* Order summary */}
                  <div className="space-y-4 pb-6 border-b border-slate-200">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Summary</h3>
                    <div className="space-y-3">
                      {purchaseData.selectedTickets.map((item: any) => (
                        <div key={item.ticketTypeId} className="flex items-center justify-between">
                          <p className="font-serif italic text-lg text-slate-900">
                            {item.name} <span className="text-xs text-slate-500 not-italic font-sans">× {item.quantity}</span>
                          </p>
                          <p className="font-serif italic text-lg text-slate-900">
                            {(item.price * item.quantity).toLocaleString()} RWF
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                      <span className="font-serif italic text-3xl text-[#608d64]">
                        {purchaseData.totalAmount.toLocaleString()} <span className="text-sm">RWF</span>
                      </span>
                    </div>
                  </div>

                  {/* Payment method */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</Label>
                    <div className="h-24 flex items-center gap-4 rounded-3xl border-2 border-[#608d64] bg-[#608d64]/5 px-6">
                      <Phone className="h-6 w-6 text-[#608d64]" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">MTN MoMo &amp; Airtel Money</p>
                        <p className="text-xs text-slate-500">PIN prompt will be sent to {purchaseData.holderPhone || userInfo.holderPhone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-500">
                    <Shield className="h-5 w-5 text-[#608d64] shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-slate-700">Secure payment via FDI Payments.</strong>{" "}
                      Approve the charge on your phone with your Mobile Money PIN. We never see or store your PIN.
                    </p>
                  </div>

                  <Button
                    onClick={handlePayWithFdi}
                    disabled={isRedirectingToPayment}
                    className="w-full h-20 rounded-full bg-[#608d64] text-white hover:bg-slate-900 text-lg font-black uppercase tracking-[0.3em] transition-all duration-700 shadow-2xl shadow-[#608d64]/20"
                  >
                    {isRedirectingToPayment ? (
                      <>
                        <Loader2 className="mr-4 h-6 w-6 animate-spin" />
                        Sending request…
                      </>
                    ) : (
                      <>
                        Pay {purchaseData.totalAmount.toLocaleString()} RWF
                        <ArrowRight className="ml-4 h-6 w-6" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === "verifying" && (
              <div className="flex flex-col items-center justify-center py-24 space-y-6 animate-in fade-in duration-700">
                <Loader2 className="h-14 w-14 text-[#608d64] animate-spin" />
                <h2 className="font-serif italic text-4xl text-slate-900">Waiting for your PIN…</h2>
                <p className="text-slate-500 text-sm max-w-md text-center">
                  Check your phone and approve the Mobile Money request. Keep this page open until your tickets appear.
                </p>
              </div>
            )}

            {currentStep === "failed" && (
              <div className="flex flex-col items-center justify-center py-24 space-y-6 animate-in fade-in duration-700">
                <XCircle className="h-14 w-14 text-red-500" />
                <h2 className="font-serif italic text-4xl text-slate-900">Payment not completed</h2>
                <p className="text-slate-500 text-sm max-w-md text-center">{failureMessage}</p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    onClick={() => {
                      verifyStartedRef.current = false;
                      router.replace(`/events/${eventId}/tickets`);
                      setCurrentStep("selection");
                    }}
                    className="h-14 px-8 bg-[#608d64] text-white hover:bg-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#608d64]/20"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/contact")}
                    className="h-14 px-8 rounded-full border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50"
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            )}

            {currentStep === "success" && purchasedTickets.length > 0 && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom duration-700">
                {/* Success header */}
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-[#608d64]/10 flex items-center justify-center mx-auto">
                    <Ticket className="h-10 w-10 text-[#608d64]" />
                  </div>
                  <h2 className="font-serif italic text-5xl text-slate-900">Purchase Complete!</h2>
                  <p className="text-[10px] font-bold text-[#608d64] uppercase tracking-[0.4em]">
                    {purchasedTickets.length} Ticket{purchasedTickets.length > 1 ? 's' : ''} Confirmed
                  </p>
                  <p className="text-slate-500 text-sm max-w-md mx-auto">
                    Your tickets have been sent to{" "}
                    <span className="font-semibold text-slate-900">{purchaseData.holderEmail}</span>.
                    You can retrieve them anytime on the My Tickets page.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => router.push("/my-tickets")}
                    className="h-14 px-8 bg-[#608d64] text-white hover:bg-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#608d64]/20"
                  >
                    <Ticket className="mr-2 h-4 w-4" />
                    View My Tickets
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/events")}
                    className="h-14 px-8 rounded-full border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50"
                  >
                    Browse More Events
                  </Button>
                </div>

                {/* Tickets — same TicketGraphic as /my-tickets */}
                <div className="flex flex-col items-center gap-4 pt-4">
                  {purchasedTickets.map((ticket, index) => (
                    <div
                      key={ticket.id}
                      className="w-full animate-in fade-in slide-in-from-bottom duration-700"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      {index > 0 && (
                        <div className="flex items-center gap-4 mb-4">
                          <div className="h-px flex-1 bg-slate-100" />
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            Ticket {index + 1}
                          </span>
                          <div className="h-px flex-1 bg-slate-100" />
                        </div>
                      )}
                      <TicketGraphic
                        ticketNumber={ticket.ticket_number}
                        ticketType={ticket.ticketTypeName}
                        holderName={purchaseData.holderName || "Guest"}
                        eventTitle={event.title}
                        eventLocation={event.location}
                        eventDate={event.event_date}
                        eventImage={event.image_url}
                        price={ticket.totalPrice}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

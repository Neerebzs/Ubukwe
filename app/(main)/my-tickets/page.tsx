"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TranslatedText } from "@/components/translated-text";
import { Mail, Ticket, Calendar, MapPin, Loader2, AlertCircle, Download, QrCode } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";
import { toast } from "sonner";
import { TicketGraphic } from "@/components/customer/ticket-graphic";

interface TicketData {
  ticket_id: string;
  ticket_number: string;
  event_title: string;
  event_date: string;
  event_location: string;
  ticket_type: string;
  holder_name: string;
  holder_email: string;
  status: string;
  is_checked_in: boolean;
  checked_in_at?: string;
  purchased_at: string;
}

export default function MyTicketsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Invalid email format");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSearch = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    setHasSearched(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/tickets/my-tickets?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to retrieve tickets");
      }

      const data = await response.json();
      setTickets(data);
      setHasSearched(true);

      if (data.length === 0) {
        toast.info("No tickets found for this email address");
      } else {
        toast.success(`Found ${data.length} ticket(s)`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to retrieve tickets");
      setTickets([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="pt-24 pb-12 border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-12 bg-[#608d64]/30" />
              <span className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">
                Ticket Registry
              </span>
              <div className="h-[1px] w-12 bg-[#608d64]/30" />
            </div>
            <h1 className="font-serif italic text-5xl md:text-7xl text-slate-900 leading-tight">
              My Tickets
            </h1>
            <p className="text-slate-500 font-light text-lg max-w-xl mx-auto">
              Enter your email address to retrieve all tickets purchased under your name
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-12">
          {/* Search Form */}
          <Card className="border-none shadow-none bg-[#fdfcf9] rounded-[40px] border border-slate-100">
            <CardContent className="p-12 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    placeholder="your.email@example.com"
                    className="h-16 pl-16 pr-6 rounded-2xl border-slate-200 bg-white focus:ring-0 focus:border-[#608d64]/30 transition-all font-serif italic text-lg"
                  />
                </div>
                {emailError && (
                  <p className="text-xs text-red-500 ml-1">{emailError}</p>
                )}
              </div>

              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full h-16 rounded-full bg-[#608d64] text-white hover:bg-slate-900 text-sm font-black uppercase tracking-[0.3em] transition-all duration-700 shadow-xl shadow-[#608d64]/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    <TranslatedText text="Searching..." />
                  </>
                ) : (
                  <>
                    <Ticket className="mr-3 h-5 w-5" />
                    <TranslatedText text="Retrieve My Tickets" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {hasSearched && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
              {tickets.length === 0 ? (
                <Card className="border-none shadow-none bg-slate-50/50 rounded-[40px] border border-slate-100">
                  <CardContent className="p-16 text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                      <AlertCircle className="h-10 w-10 text-slate-300" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-serif italic text-2xl text-slate-900">
                        No Tickets Found
                      </h3>
                      <p className="text-slate-400 text-sm">
                        We couldn't find any tickets associated with this email address
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/events")}
                      className="h-12 px-8 rounded-full border-slate-200 text-[10px] font-black uppercase tracking-widest"
                    >
                      Browse Events
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif italic text-3xl text-slate-900">
                      Your Tickets ({tickets.length})
                    </h2>
                  </div>

                  <div className="space-y-12 pb-24">
                    <div className="flex flex-col items-center">
                      {tickets.map((ticket) => (
                        <div key={ticket.ticket_id} className="w-full">
                          <TicketGraphic
                            ticketNumber={ticket.ticket_number}
                            ticketType={ticket.ticket_type}
                            holderName={ticket.holder_name}
                            eventTitle={ticket.event_title}
                            eventLocation={ticket.event_location || "Location TBD"}
                            eventDate={ticket.event_date || ""}
                            price={undefined}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

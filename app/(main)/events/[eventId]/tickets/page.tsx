"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TranslatedText } from "@/components/translated-text";
import { ArrowLeft, ArrowRight, Calendar, MapPin, Heart, Share2, ExternalLink, Minus, Plus } from "lucide-react";

export default function EventTicketingPage() {
  const params = useParams();
  const router = useRouter();
  const [tickets, setTickets] = useState<Record<string, number>>({});

  const event = {
    id: params.eventId,
    title: "KIGALI SHADES NIGHT",
    description: "KIGALI SHADES NIGHT is a high-energy experience bringing together top artists and DJs for an unforgettable night of live performances and nonstop music. Hosted at Crystal Lounge, KABC Building, the event blends great vibes, stylish crowds, and premium sounds in one electric atmosphere. Everyone is required to wear the shades provided at the entrance, making the night even more fun, stylish, and unified. Expect powerful performances, smooth DJ sets, and an unforgettable party vibe.",
    date: "Friday, 6th → Saturday, 7th",
    time: "18:00 PM - 02:00 AM",
    venue: "Crystal Lounge",
    location: "View →",
    organizer: "KIGALI SHADES NIGHT",
    organizerLogo: "/placeholder-org.jpg",
    image: "/grom.jpg",
    performances: 5,
    ticketTypes: [
      {
        id: "pre-regular",
        name: "Pre Regular",
        price: 7000,
        available: 0,
        soldOut: true,
        description: "View Description"
      },
      {
        id: "regular",
        name: "Regular",
        price: 10000,
        available: 100,
        soldOut: false,
        description: "View Description"
      },
      {
        id: "vip-table",
        name: "VIP TABLE",
        price: 150000,
        available: 5,
        soldOut: false,
        description: "View Description"
      }
    ]
  };

  const updateTicketCount = (ticketId: string, change: number) => {
    setTickets(prev => {
      const current = prev[ticketId] || 0;
      const newCount = Math.max(0, current + change);
      return { ...prev, [ticketId]: newCount };
    });
  };

  const totalTickets = Object.values(tickets).reduce((sum, count) => sum + count, 0);

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
                Back to Calendar
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
              <Button variant="outline" size="icon" className="rounded-full border-slate-200 text-slate-400 hover:text-[#608d64] transition-all">
                <Heart className="h-4 w-4" />
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
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-8 left-8">
                <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                  {event.performances} Performances
                </Badge>
              </div>
            </div>

            <div className="space-y-8 p-12 bg-[#fdfcf9] rounded-[40px] border border-slate-100">
              <h3 className="font-serif italic text-3xl text-slate-900">About the Gathering</h3>
              <p className="text-slate-500 font-light leading-relaxed text-lg">
                {event.description}
              </p>
            </div>

            {/* Organizer Card */}
            <div className="p-8 rounded-[40px] border border-slate-100 flex items-center justify-between group hover:border-[#608d64]/20 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-[#608d64]/10 flex items-center justify-center text-[#608d64] font-serif italic text-2xl">
                  {event.organizer.charAt(0)}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.3em]">Presented By</p>
                  <p className="font-serif italic text-2xl text-slate-900">{event.organizer}</p>
                </div>
              </div>
              <Button variant="ghost" className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#608d64] hover:bg-[#608d64]/5">
                View Profile
              </Button>
            </div>
          </div>

          {/* Right Side: Ticketing */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-16">
            {/* Essential Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-10 rounded-[40px] bg-slate-50 border border-slate-100 space-y-6">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-[#608d64] shadow-sm">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Detail</p>
                  <p className="font-serif italic text-2xl text-slate-900 leading-tight">{event.date}</p>
                  <p className="text-slate-400 font-light">{event.time}</p>
                </div>
              </div>

              <div className="p-10 rounded-[40px] bg-slate-50 border border-slate-100 space-y-6">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-[#608d64] shadow-sm">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">The Sanctuary</p>
                  <p className="font-serif italic text-2xl text-slate-900 leading-tight">{event.venue}</p>
                  <button className="text-[10px] font-black text-[#608d64] uppercase tracking-widest hover:underline mt-2 flex items-center gap-2">
                    Open Coordinates <ExternalLink className="h-3 w-3" />
                  </button>
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
                {event.ticketTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`p-8 rounded-[40px] border transition-all duration-500 group ${type.soldOut
                      ? "opacity-50 grayscale bg-slate-50 border-slate-100"
                      : "bg-white border-slate-100 hover:border-[#608d64]/30 hover:shadow-2xl hover:shadow-[#608d64]/5"
                      }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <h3 className="font-serif italic text-2xl text-slate-900">{type.name}</h3>
                          {type.soldOut && (
                            <Badge variant="destructive" className="bg-slate-200 text-slate-500 border-none rounded-full px-4 text-[8px] font-black tracking-widest">
                              EXPIRED
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-400 font-light text-sm italic">
                          Passage grants exclusive access to the {type.name.toLowerCase()} sanctuary and related honors.
                        </p>
                        <div className="text-xl font-light text-[#608d64] tracking-tight">
                          {type.price.toLocaleString()} <span className="text-[10px] font-black uppercase tracking-widest ml-1">RWF</span>
                        </div>
                      </div>

                      {!type.soldOut && (
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
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-12">
                <Button
                  className={`w-full h-20 rounded-full text-lg font-black uppercase tracking-[0.3em] transition-all duration-700 shadow-2xl ${totalTickets > 0
                    ? "bg-[#608d64] text-white shadow-[#608d64]/20 hover:bg-slate-900 hover:shadow-black/20"
                    : "bg-slate-100 text-slate-300 pointer-events-none"
                    }`}
                  disabled={totalTickets === 0}
                >
                  <TranslatedText text="Continue to Sanctuary" />
                  <ArrowRight className="ml-4 h-6 w-6" />
                </Button>
                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-8">
                  Security Provided by Ubukwe Collective • Encrypted Process
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

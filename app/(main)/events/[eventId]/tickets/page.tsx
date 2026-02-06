"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Heart, Share2, ExternalLink, Minus, Plus } from "lucide-react";

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
    image: "/Intore new.jpeg",
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
   <div className="min-h-screen bg-white flex items-center justify-center mx-4">
  {/* Main Container */}
  <div className="flex flex-col md:flex-row">
        {/* Left Side - Event Image & Info */}
        <div className="relative py-6 flex flex-col md:w-[500px] lg:w-[600px] md:min-h-screen md:sticky md:top-0 bg-white">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-0 h-10 w-10 rounded-full bg-black/10 hover:bg-black/20 text-teal-600 z-10"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Event Image */}
            <div className="mb-6 mt-16 h-[400px]">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover rounded-lg shadow-2xl"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-600"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-600"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-600"
              >
                <ExternalLink className="h-5 w-5" />
              </Button>
            </div>

            {/* Performance Badge */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-0">
                🎭 {event.performances} performance
              </Badge>
            </div>

            {/* Organizer Info */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-teal-700">KS</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Organizer</p>
                    <p className="font-semibold text-gray-900">{event.organizer}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 border-gray-300 hover:bg-gray-100 text-gray-700">
                    Visit Profile
                  </Button>
                  <Button size="sm" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
                    Follow
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Event Details & Tickets */}
          <div className="py-6 pl-4 flex-1 overflow-y-auto max-w-2xl">
            {/* Event Title & Info */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-6 text-gray-900">{event.title}</h1>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{event.date}</p>
                    <p className="text-sm text-gray-600">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{event.venue}</p>
                    <button className="text-sm text-teal-600 hover:underline flex items-center gap-1">
                      {event.location}
                    </button>
                  </div>
                </div>
              </div>

             
            </div>

            {/* Ticket Selection */}
            <div className="mb-8 bg-gray-50">
               <h1 className="w-full bg-gray-100  rounded-md h-12 text-base p-4 font-semibold mb-6 text-black">
                Get Tickets
              </h1>
             <div className="m-2">
               <h2 className="text-xl font-bold mb-2 text-gray-900">Choose your ticket type to continue</h2>
              <p className="text-sm text-gray-600 mb-6">
                Questions about tickets?{" "}
                <button className="text-teal-600 hover:underline">Contact the organizer.</button>
              </p>

              <div className="space-y-3">
                {event.ticketTypes.map((type) => (
                  <Card key={type.id} className="bg-white border-gray-200 hover:border-teal-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-lg text-gray-900">{type.name}</h3>
                            {type.soldOut && (
                              <Badge variant="destructive" className="bg-red-600 text-white">
                                SOLD OUT
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{type.price.toLocaleString()} RWF</p>
                          <button className="text-xs text-teal-600 hover:underline">
                            {type.description}
                          </button>
                        </div>

                        {!type.soldOut && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                              onClick={() => updateTicketCount(type.id, -1)}
                              disabled={!tickets[type.id]}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <div className="w-12 text-center font-bold text-lg text-gray-900">
                              {tickets[type.id] || 0}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-teal-600 hover:bg-teal-700 text-white"
                              onClick={() => updateTicketCount(type.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button 
                className="w-full mt-6 bg-gray-200 hover:bg-gray-300 h-12 text-base font-semibold text-gray-700"
                disabled={totalTickets === 0}
              >
                Continue
              </Button>
             </div>
            </div>

            {/* About Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">About</h2>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>

            {/* Location Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Location</h2>
              <div className="bg-white rounded-lg h-64 flex items-center justify-center border border-gray-200">
                <p className="text-gray-500">Map placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

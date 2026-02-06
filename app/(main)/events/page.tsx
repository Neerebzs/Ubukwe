"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Calendar, MapPin, Search, Music, Palette, UtensilsCrossed, 
  Dumbbell, Mic2, Film, MoreHorizontal, Bookmark
} from "lucide-react"
import Link from "next/link"
import { PublicBottomNav } from "@/components/ui/public-bottom-nav"
import { TranslatedText } from "@/components/translated-text"
import { EventCard } from "@/components/ui/event-card"

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("happening-now")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { id: "all", name: "All", icon: null },
    { id: "music", name: "Music", icon: <Music className="h-4 w-4" /> },
    { id: "arts", name: "Arts & Culture", icon: <Palette className="h-4 w-4" /> },
    { id: "food", name: "Food & Drinks", icon: <UtensilsCrossed className="h-4 w-4" /> },
    { id: "sports", name: "Sports & wellness", icon: <Dumbbell className="h-4 w-4" /> },
    { id: "concert", name: "concert", icon: <Mic2 className="h-4 w-4" /> },
    { id: "cinema", name: "Cinema", icon: <Film className="h-4 w-4" /> },
    { id: "more", name: "More", icon: <MoreHorizontal className="h-4 w-4" /> }
  ]

  // Mock data - replace with API call
  const allEvents = [
    {
      id: 1,
      title: "ATELIER DU VIBE With DEMZA",
      image: "/beautiful-garden-wedding-venue-rwanda.jpg",
      time: "Today, 18:00 PM",
      location: "Atelier du Vin",
      organizer: "RM Entertainment",
      price: "From Rwf 10K"
    },
    {
      id: 2,
      title: "KIGALI SHADES NIGHT",
      image: "/Intore new.jpeg",
      time: "Today, 18:00 PM",
      location: "Crystal Lounge",
      organizer: "KIGALI SHADES",
      price: "From Rwf 7K"
    },
    {
      id: 3,
      title: "KOMPA NIGHT @ LEMON 🍋",
      image: "/grom.jpg",
      time: "Today, 19:00 PM",
      location: "Lemon Kigali",
      organizer: "@atmosferakigali",
      price: "From Rwf 5K"
    },
    {
      id: 4,
      title: "Fomo Friday at lanoche 🔥",
      image: "/beautiful-garden-wedding-venue-rwanda.jpg",
      time: "Today, 20:36 PM",
      location: "La Noche",
      organizer: "La Noche club",
      price: "From Rwf 10K"
    },
    {
      id: 5,
      title: "Wedding Cake Decoration Workshop",
      image: "/grom.jpg",
      time: "Tomorrow, 11:00 AM",
      location: "Culinary Arts Center",
      organizer: "Culinary Institute",
      price: "From Rwf 20K"
    },
    {
      id: 6,
      title: "Traditional Music Showcase",
      image: "/Intore new.jpeg",
      time: "Tomorrow, 17:00 PM",
      location: "Kigali Arena",
      organizer: "Rwanda Arts",
      price: "From Rwf 8K"
    }
  ]

  return (
    <div className="min-h-screen bg-white text-black pb-16 md:pb-0">
    

      {/* Categories */}
      <div className=" backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`rounded-full flex-shrink-0 ${
                    selectedCategory === category.id 
                      ? "bg-zinc-800 text-white" 
                      : "text-gray-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  {category.icon}
                  <span className="ml-2">{category.name}</span>
                </Button>
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-zinc-800 rounded-full flex-shrink-0"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Date
            </Button>
          </div>
        </div>
      </div>

      {/* Time Tabs */}
      <div className="">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("happening-now")}
              className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "happening-now"
                  ? "border-white text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <TranslatedText text="Happening Now" />
            </button>
            <button
              onClick={() => setActiveTab("today")}
              className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "today"
                  ? "border-white text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <TranslatedText text="Today" />
            </button>
            <button
              onClick={() => setActiveTab("tomorrow")}
              className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "tomorrow"
                  ? "border-white text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <TranslatedText text="Tomorrow" />
            </button>
            <button
              onClick={() => setActiveTab("weekend")}
              className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "weekend"
                  ? "border-white text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <TranslatedText text="Weekend" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Active Events Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <h2 className="text-xl font-semibold text-black">
              <TranslatedText text="Active Events" />
            </h2>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeTab === "happening-now" && allEvents.slice(0, 4).map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                image={event.image}
                time={event.time}
                location={event.location}
                organizer={event.organizer}
                price={event.price}
                href={`/events/${event.id}/tickets`}
              />
            ))}
            {activeTab === "today" && allEvents.slice(0, 4).map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                image={event.image}
                time={event.time}
                location={event.location}
                organizer={event.organizer}
                price={event.price}
                href={`/events/${event.id}/tickets`}
              />
            ))}
            {activeTab === "tomorrow" && allEvents.slice(4, 6).map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                image={event.image}
                time={event.time}
                location={event.location}
                organizer={event.organizer}
                price={event.price}
                href={`/events/${event.id}/tickets`}
              />
            ))}
            {activeTab === "weekend" && allEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                image={event.image}
                time={event.time}
                location={event.location}
                organizer={event.organizer}
                price={event.price}
                href={`/events/${event.id}/tickets`}
              />
            ))}
          </div>
        </div>
      </div>

      <PublicBottomNav />
    </div>
  )
}

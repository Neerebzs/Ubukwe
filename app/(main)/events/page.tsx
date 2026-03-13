"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Calendar, MapPin, Search, Music, Palette, UtensilsCrossed,
  Dumbbell, Mic2, Film, MoreHorizontal, Bookmark, Loader2
} from "lucide-react"
import Link from "next/link"
import { PublicBottomNav } from "@/components/ui/public-bottom-nav"
import { TranslatedText } from "@/components/translated-text"
import { EventCard } from "@/components/ui/event-card"
import { usePublicEvents } from "@/hooks/useCustomerEvents"

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const { data: events = [], isLoading, error } = usePublicEvents(
    selectedCategory !== "all" ? selectedCategory : undefined
  )

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

  // Filter events based on active tab
  const getFilteredEvents = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const weekendStart = new Date(today)
    const daysUntilWeekend = (5 - today.getDay() + 7) % 7 || 7
    weekendStart.setDate(weekendStart.getDate() + daysUntilWeekend)

    return events.filter((event: any) => {
      const eventDate = new Date(event.event_date)
      const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())

      switch (activeTab) {
        case "happening-now":
          return eventDay.getTime() === today.getTime()
        case "today":
          return eventDay.getTime() === today.getTime()
        case "tomorrow":
          return eventDay.getTime() === tomorrow.getTime()
        case "weekend":
          return eventDay >= weekendStart
        default:
          return true
      }
    })
  }

  const filteredEvents = getFilteredEvents()

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-16 md:pb-0 pt-24">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12 md:py-20">
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-12 bg-[#608d64]/30" />
            <span className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">
              <TranslatedText text="The Collective Calendar" />
            </span>
          </div>
          <h1 className="font-serif italic text-6xl md:text-8xl text-slate-900 leading-[0.9] tracking-tight">
            Curated <span className="text-slate-400 not-italic font-light">Gatherings.</span>
          </h1>
          <p className="font-sans text-slate-500 text-lg md:text-xl max-w-2xl leading-relaxed font-light mt-8">
            <TranslatedText text="Discover exclusive events, workshops, and traditional showcases curated to inspire your wedding journey in Rwanda." />
          </p>
        </div>
      </div>

      {/* Categories & Filter Bar */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-xl border-y border-slate-100/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`h-11 px-6 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap ${selectedCategory === category.id
                      ? "bg-[#608d64] text-white shadow-lg shadow-[#608d64]/20"
                      : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  {category.icon && <span className="mr-3 scale-110">{category.icon}</span>}
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-6 md:border-l md:border-slate-100 md:pl-8 overflow-hidden">
              <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                {["all", "happening-now", "today", "tomorrow", "weekend"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative py-2 whitespace-nowrap ${activeTab === tab
                        ? "text-slate-900"
                        : "text-slate-300 hover:text-slate-500"
                      }`}
                  >
                    <TranslatedText text={tab === "all" ? "all gatherings" : tab.replace('-', ' ')} />
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#608d64] animate-in slide-in-from-left duration-500" />
                    )}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-slate-200 text-slate-400 hover:text-slate-900 transition-all flex-shrink-0"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="space-y-12">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 bg-[#608d64] rounded-full animate-pulse" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em]">
                <TranslatedText text={`${activeTab.replace('-', ' ')} Collection`} />
              </h2>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {filteredEvents.length} Gatherings Found
            </div>
          </div>

          {/* Grid Cards */}
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-24">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Loading events...</p>
              </div>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-24">
              <p className="text-destructive font-medium">Failed to load events</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredEvents.map((event: any) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  image={event.image_url}
                  time={`${new Date(event.event_date).toLocaleDateString()}, ${event.event_time || "TBA"}`}
                  location={event.location}
                  organizer={event.category}
                  price={`From Rwf ${event.ticket_types?.[0]?.price?.toLocaleString() || "TBA"}`}
                  href={`/events/${event.id}/tickets`}
                />
              ))}
            </div>
          ) : (
            <div className="col-span-full py-24 text-center space-y-4">
              <p className="font-serif italic text-3xl text-slate-300">Quiet for a moment.</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No events found for this filter</p>
            </div>
          )}
        </div>
      </div>

      <PublicBottomNav />
    </div>
  )
}

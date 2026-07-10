"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Calendar, MapPin, Search, Music, Palette, UtensilsCrossed,
  Dumbbell, Mic2, Film, MoreHorizontal, Bookmark, Loader2, X, CalendarDays,
  Heart, Briefcase, Users, PartyPopper, Trophy, Laugh,
  GlassWater, Drama, Handshake, Gift, Star
} from "lucide-react"
import Link from "next/link"
import { PublicBottomNav } from "@/components/ui/public-bottom-nav"
import { TranslatedText } from "@/components/translated-text"
import { EventCard } from "@/components/ui/event-card"
import { usePublicEvents } from "@/hooks/useCustomerEvents"
import { format, isSameDay, startOfDay } from "date-fns"

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const { data: events = [], isLoading, error } = usePublicEvents(
    selectedCategory !== "all" ? selectedCategory : undefined
  )

  const categories = [
    // Meta
    { id: "all",                  name: "All",               icon: null,                                          group: null },
    // Wedding Events
    { id: "wedding",              name: "Wedding",            icon: <Heart className="h-4 w-4" />,                group: "Wedding" },
    { id: "reception",            name: "Reception",          icon: <Heart className="h-4 w-4" />,                group: "Wedding" },
    { id: "ceremony",             name: "Ceremony",           icon: <Heart className="h-4 w-4" />,                group: "Wedding" },
    { id: "rehearsal",            name: "Rehearsal",          icon: <Heart className="h-4 w-4" />,                group: "Wedding" },
    { id: "engagement",           name: "Engagement",         icon: <Heart className="h-4 w-4" />,                group: "Wedding" },
    // Entertainment
    { id: "concert",              name: "Concert",            icon: <Music className="h-4 w-4" />,                group: "Entertainment" },
    { id: "festival",             name: "Festival",           icon: <Mic2 className="h-4 w-4" />,                 group: "Entertainment" },
    { id: "comedy_show",          name: "Comedy Show",        icon: <Laugh className="h-4 w-4" />,                group: "Entertainment" },
    { id: "theater",              name: "Theater",            icon: <Drama className="h-4 w-4" />,                group: "Entertainment" },
    { id: "movie_screening",      name: "Cinema",             icon: <Film className="h-4 w-4" />,                 group: "Entertainment" },
    // Sports
    { id: "sports_event",         name: "Sports",             icon: <Dumbbell className="h-4 w-4" />,             group: "Sports" },
    { id: "tournament",           name: "Tournament",         icon: <Trophy className="h-4 w-4" />,               group: "Sports" },
    // Business
    { id: "conference",           name: "Conference",         icon: <Briefcase className="h-4 w-4" />,            group: "Business" },
    { id: "seminar",              name: "Seminar",            icon: <Briefcase className="h-4 w-4" />,            group: "Business" },
    { id: "workshop",             name: "Workshop",           icon: <Briefcase className="h-4 w-4" />,            group: "Business" },
    { id: "networking",           name: "Networking",         icon: <Handshake className="h-4 w-4" />,            group: "Business" },
    { id: "trade_show",           name: "Trade Show",         icon: <Briefcase className="h-4 w-4" />,            group: "Business" },
    // Social & Community
    { id: "party",                name: "Party",              icon: <PartyPopper className="h-4 w-4" />,          group: "Social" },
    { id: "fundraiser",           name: "Fundraiser",         icon: <Gift className="h-4 w-4" />,                 group: "Social" },
    { id: "charity_event",        name: "Charity",            icon: <Gift className="h-4 w-4" />,                 group: "Social" },
    { id: "community_gathering",  name: "Community",          icon: <Users className="h-4 w-4" />,                group: "Social" },
    // Cultural & Arts
    { id: "exhibition",           name: "Exhibition",         icon: <Palette className="h-4 w-4" />,              group: "Cultural" },
    { id: "art_show",             name: "Art Show",           icon: <Palette className="h-4 w-4" />,              group: "Cultural" },
    { id: "cultural_event",       name: "Cultural",           icon: <Star className="h-4 w-4" />,                 group: "Cultural" },
    // Food & Drink
    { id: "wine_tasting",         name: "Wine Tasting",       icon: <GlassWater className="h-4 w-4" />,           group: "Food & Drink" },
    // Other
    { id: "other",                name: "Other",              icon: <MoreHorizontal className="h-4 w-4" />,       group: null },
  ]

  // Filter events based on active tab — past events are always excluded
  const getFilteredEvents = () => {
    const now = new Date()
    const today = startOfDay(now)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const weekendStart = new Date(today)
    const daysUntilWeekend = (5 - today.getDay() + 7) % 7 || 7
    weekendStart.setDate(weekendStart.getDate() + daysUntilWeekend)

    return events.filter((event: any) => {
      const eventDay = startOfDay(new Date(event.event_date))

      // Always exclude events that have already passed
      if (eventDay < today) return false

      // Date picker filter takes priority over tab filters
      if (selectedDate) {
        return isSameDay(eventDay, selectedDate)
      }

      switch (activeTab) {
        case "happening-now":
          return isSameDay(eventDay, today)
        case "today":
          return isSameDay(eventDay, today)
        case "tomorrow":
          return isSameDay(eventDay, tomorrow)
        case "weekend":
          return eventDay >= weekendStart
        default:
          return true // "all" — only upcoming events (past already excluded above)
      }
    })
  }

  const filteredEvents = getFilteredEvents()

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
            <TranslatedText text="Evaluating Events..." />
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-16 md:pb-0 pt-4 md:pt-8">
      {/* Categories & Filter Bar */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-xl border-y border-slate-100/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
              {(() => {
                const rendered: JSX.Element[] = []
                let lastGroup: string | null = undefined as any
                categories.forEach((category) => {
                  // Insert a thin divider when group changes (skip for "all" and null groups)
                  if (category.group !== lastGroup && lastGroup !== undefined && category.group !== null && lastGroup !== null) {
                    rendered.push(
                      <div key={`sep-${category.id}`} className="h-6 w-[1px] bg-slate-100 flex-shrink-0" />
                    )
                  }
                  lastGroup = category.group
                  rendered.push(
                    <Button
                      key={category.id}
                      variant="ghost"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`h-9 px-4 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                        selectedCategory === category.id
                          ? "bg-[#608d64] text-white shadow-lg shadow-[#608d64]/20"
                          : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {category.icon && <span className="mr-2">{category.icon}</span>}
                      <span>{category.name}</span>
                    </Button>
                  )
                })
                return rendered
              })()}
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
                onClick={() => setDatePickerOpen(true)}
                className={`rounded-xl border-slate-200 transition-all flex-shrink-0 ${
                  selectedDate
                    ? "bg-[#608d64] text-white border-[#608d64] hover:bg-[#4e7252] hover:border-[#4e7252]"
                    : "text-slate-400 hover:text-slate-900"
                }`}
                title={selectedDate ? `Filtered: ${format(selectedDate, "MMM d, yyyy")}` : "Filter by date"}
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-12">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 bg-[#608d64] rounded-full animate-pulse" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em]">
                {selectedDate
                  ? <span>{format(selectedDate, "MMMM d, yyyy")}</span>
                  : <TranslatedText text={`${activeTab.replace('-', ' ')} Collection`} />
                }
              </h2>
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(undefined)}
                  className="flex items-center gap-1.5 bg-[#608d64]/10 text-[#608d64] rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest hover:bg-[#608d64]/20 transition-colors"
                >
                  <X className="h-3 w-3" />
                  Clear Date
                </button>
              )}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {filteredEvents.length} Gathering{filteredEvents.length !== 1 ? "s" : ""} Found
            </div>
          </div>

          {/* Grid Cards */}
          {error ? (
            <div className="col-span-full text-center py-24">
              <p className="text-destructive font-medium">Failed to load events</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
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

      {/* Date Picker Modal */}
      <Dialog open={datePickerOpen} onOpenChange={setDatePickerOpen}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
          {/* Header */}
          <div className="bg-[#608d64] px-6 pt-6 pb-5">
            <DialogTitle className="text-white font-serif italic text-2xl leading-tight">
              Pick a Date
            </DialogTitle>
            <DialogDescription className="text-white/70 text-[11px] font-bold uppercase tracking-[0.2em] mt-1">
              Browse events on a specific day
            </DialogDescription>
            {selectedDate && (
              <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                <CalendarDays className="h-3.5 w-3.5 text-white" />
                <span className="text-white text-xs font-bold">{format(selectedDate, "EEEE, MMMM d")}</span>
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="px-4 py-4 flex justify-center">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date)
                setDatePickerOpen(false)
              }}
              disabled={{ before: startOfDay(new Date()) }}
              className="rounded-xl"
              classNames={{
                day: "relative w-full h-full p-0 text-center group/day aspect-square select-none",
              }}
            />
          </div>

          {/* Footer actions */}
          <div className="px-6 pb-6 flex items-center gap-3">
            {selectedDate && (
              <Button
                variant="outline"
                className="flex-1 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm"
                onClick={() => {
                  setSelectedDate(undefined)
                  setDatePickerOpen(false)
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filter
              </Button>
            )}
            <Button
              variant="ghost"
              className="flex-1 rounded-full text-slate-400 hover:text-slate-600 font-bold text-sm"
              onClick={() => setDatePickerOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


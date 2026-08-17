"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "@/lib/api-client"
import { TranslatedText } from "@/components/translated-text"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface PublishedTestimonial {
  id: string
  author_name: string
  message: string
  author_role: string | null
  wedding_date: string | null
  rating: number | null
}

const FALLBACK: PublishedTestimonial[] = [
  {
    id: "fallback",
    author_name: "Jenifer Marvella",
    message:
      "This is not only a wedding planning agency but also a dreamy friend. I am very glad to work with them. They make my dream come true. In my wedding I found them as my best friends.",
    author_role: null,
    wedding_date: "2024-12-12",
    rating: 5,
  },
]

function formatSubtitle(item: PublishedTestimonial) {
  const parts: string[] = []
  if (item.author_role) parts.push(item.author_role)
  if (item.wedding_date) {
    const parsed = new Date(item.wedding_date)
    if (!Number.isNaN(parsed.getTime())) {
      parts.push(
        `Wedding ${parsed.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" })}`
      )
    }
  }
  return parts.join(" · ") || "Ubukwe couple"
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function HomeTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  const { data } = useQuery<PublishedTestimonial[]>({
    queryKey: ["published-testimonials"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/v1/admin/testimonials/published")
      const payload = res.data as any
      return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
    },
    staleTime: 60_000,
    retry: 1,
  })

  const testimonials = data && data.length > 0 ? data : FALLBACK
  const current = testimonials[activeIndex] ?? testimonials[0]

  useEffect(() => {
    if (testimonials.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  useEffect(() => {
    if (activeIndex >= testimonials.length) setActiveIndex(0)
  }, [activeIndex, testimonials.length])

  if (!current) return null

  return (
    <section className="py-14 md:py-20 relative bg-[#f7f9fa] overflow-hidden">
      <div className="leaf-bg opacity-20" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="relative flex justify-center lg:justify-end animate-in fade-in slide-in-from-left duration-1000">
            <div className="wreath-container w-[350px] h-[350px] md:w-[450px] md:h-[450px]">
              <div className="wreath-border" />
              <div className="absolute inset-8 rounded-full overflow-hidden shadow-2xl">
                <img
                  src="/beautiful-garden-wedding-venue-rwanda.jpg"
                  className="w-full h-full object-cover"
                  alt="Success Story Couple"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-32 h-32 animate-float">
                <img src="/leaf-motif.png" className="w-full h-full object-contain -rotate-45" alt="Leaf Decor" />
              </div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 animate-float" style={{ animationDelay: "1s" }}>
                <img src="/leaf-motif.png" className="w-full h-full object-contain rotate-12" alt="Leaf Decor" />
              </div>
            </div>
          </div>

          <div className="space-y-8 animate-in fade-in slide-in-from-right duration-1000">
            <div className="space-y-4">
              <h2 className="text-primary font-outfit font-medium tracking-[0.2em] uppercase text-sm">
                <TranslatedText text="What Our Client Say" />
              </h2>

              <div className="flex items-center gap-6">
                <div className="text-primary/20">
                  <svg width="60" height="40" viewBox="0 0 60 40" fill="currentColor">
                    <path d="M0 40h20l10-20V0H0v20h10L0 40zM30 40h20l10-20V0H30v20h10L30 40z" />
                  </svg>
                </div>
                <div className="h-[1px] w-24 bg-primary/20" />
              </div>

              {current.rating ? (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-4 w-4",
                        star <= current.rating!
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      )}
                    />
                  ))}
                </div>
              ) : null}

              <p
                key={current.id}
                className="font-outfit text-slate-800 text-2xl md:text-3xl leading-relaxed font-light italic animate-in fade-in duration-500"
              >
                “{current.message}”
              </p>
            </div>

            <div className="flex items-center gap-4 py-6">
              {current.id === "fallback" ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md">
                  <img src="/grom.jpg" className="w-full h-full object-cover" alt={current.author_name} />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full border-4 border-white shadow-md bg-[#608d64] text-white flex items-center justify-center font-serif italic text-xl">
                  {initials(current.author_name)}
                </div>
              )}
              <div>
                <h4 className="font-serif italic text-2xl text-slate-900">{current.author_name}</h4>
                <p className="text-slate-400 text-sm font-outfit uppercase tracking-wider">
                  {formatSubtitle(current)}
                </p>
              </div>
            </div>

            {testimonials.length > 1 && (
              <div className="flex gap-3 pt-4">
                {testimonials.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Show testimonial ${index + 1}`}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-colors",
                      index === activeIndex ? "bg-primary/40" : "bg-primary/10 hover:bg-primary/20"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

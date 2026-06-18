"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  Heart,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePopularServices } from "@/hooks/usePopularServices";
import { TranslatedText } from "@/components/translated-text";

// ── Category filter tabs ───────────────────────────────────────────────────────

const CATEGORY_TABS = [
  { label: "All", value: undefined },
  { label: "Dance", value: "dance" },
  { label: "Music", value: "music" },
  { label: "Catering", value: "catering" },
  { label: "Decoration", value: "decoration" },
  { label: "Venues", value: "venue" },
  { label: "Photography", value: "photography" },
];

// ── Gallery image extraction ───────────────────────────────────────────────────

function getServiceImage(service: any): string {
  // Try the first gallery image
  if (service.gallery && service.gallery.length > 0) {
    const first = service.gallery[0];
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
    if (first?.thumbnail) return first.thumbnail;
  }
  // Provider logo as fallback
  if (service.provider_logo) return service.provider_logo;
  // Category-based placeholder
  const cat = (service.category || "").toLowerCase();
  if (cat.includes("dance")) return "/beautiful-garden-wedding-venue-rwanda.jpg";
  if (cat.includes("music")) return "/grom.jpg";
  return "/beautiful-garden-wedding-venue-rwanda.jpg";
}

// ── Star rating renderer ───────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "h-3 w-3",
            s <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          )}
        />
      ))}
      <span className="text-[10px] font-bold text-slate-500 ml-1">
        {rating > 0 ? rating.toFixed(1) : "New"}
      </span>
    </div>
  );
}

// ── Price formatter ────────────────────────────────────────────────────────────

function formatPrice(min?: number | null, max?: number | null): string {
  if (!min && !max) return "Contact for price";
  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(0)}K RWF` : `${n} RWF`;
  if (min && max && min !== max) return `${fmt(min)} – ${fmt(max)}`;
  return `From ${fmt(min || max!)}`;
}

// ── Individual service card ────────────────────────────────────────────────────

function ServiceCard({ service, index }: { service: any; index: number }) {
  const [imgError, setImgError] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  const image = imgError ? "/beautiful-garden-wedding-venue-rwanda.jpg" : getServiceImage(service);
  const isTopPick = index < 3;

  return (
    <Link href={`/services/${service.id}`} className="block group">
      <div className="relative bg-white rounded-[28px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#668c65]/20 transition-all duration-500 hover:-translate-y-1">

        {/* Image container */}
        <div className="relative h-56 overflow-hidden bg-slate-100">
          <img
            src={image}
            alt={service.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {isTopPick && (
              <Badge className="bg-[#668c65] text-white border-0 text-[9px] font-black uppercase tracking-widest px-3 py-1 shadow-lg">
                <TrendingUp className="w-2.5 h-2.5 mr-1" />
                Top Pick
              </Badge>
            )}
            {service.bookings_count > 0 && (
              <Badge className="bg-white/90 backdrop-blur-sm text-slate-700 border-0 text-[9px] font-bold px-3 py-1">
                <Users className="w-2.5 h-2.5 mr-1 text-[#668c65]" />
                {service.bookings_count} bookings
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setWishlist((w) => !w);
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200"
            aria-label="Save to wishlist"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors duration-200",
                wishlist ? "fill-rose-500 text-rose-500" : "text-slate-400"
              )}
            />
          </button>

          {/* Quick view hover overlay */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 p-4">
            <div className="flex items-center justify-center gap-2 bg-white/95 backdrop-blur-sm rounded-2xl py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-lg">
              <Eye className="w-3.5 h-3.5" />
              <TranslatedText text="View Details" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Category chip */}
          <span className="inline-block text-[9px] font-black uppercase tracking-[0.2em] text-[#668c65] bg-[#668c65]/8 px-2.5 py-1 rounded-full">
            {service.category}
          </span>

          {/* Name */}
          <h3 className="font-black text-slate-900 text-lg leading-snug tracking-tight line-clamp-1 group-hover:text-[#668c65] transition-colors duration-300">
            {service.name}
          </h3>

          {/* Provider */}
          {service.business_name && (
            <p className="text-xs text-slate-400 font-medium truncate flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                {service.provider_logo ? (
                  <img src={service.provider_logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#668c65]/20 flex items-center justify-center text-[8px] font-black text-[#668c65]">
                    {(service.business_name || "P").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {service.business_name}
            </p>
          )}

          {/* Star rating */}
          <StarRating rating={service.rating || 0} />

          {/* Location + Price row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[100px]">
                {service.city || service.location || "Rwanda"}
              </span>
            </div>
            <span className="text-[11px] font-black text-slate-700">
              {formatPrice(service.price_range_min, service.price_range_max)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────

function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-[28px] overflow-hidden border border-slate-100">
      <div className="h-56 bg-slate-100 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-16 bg-slate-100 animate-pulse rounded-full" />
        <div className="h-5 w-3/4 bg-slate-100 animate-pulse rounded" />
        <div className="h-3 w-1/2 bg-slate-100 animate-pulse rounded" />
        <div className="h-3 w-24 bg-slate-100 animate-pulse rounded" />
        <div className="flex justify-between pt-1">
          <div className="h-3 w-20 bg-slate-100 animate-pulse rounded" />
          <div className="h-3 w-24 bg-slate-100 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

// ── Main section component ─────────────────────────────────────────────────────

export function PopularServicesSection() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const { data: services, isLoading, isError } = usePopularServices(8, activeCategory);

  // Don't render the section at all if there's an error and no data
  if (isError && !services?.length) return null;

  return (
    <section className="py-24 md:py-32 relative bg-white overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #668c65 1px, transparent 0)`, backgroundSize: "40px 40px" }}
      />

      <div className="container mx-auto max-w-7xl px-4 relative z-10">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-[#668c65]/50" />
              <div className="flex items-center gap-2 text-[#668c65]">
                <Sparkles className="h-4 w-4" />
                <span className="font-outfit font-black tracking-[0.4em] uppercase text-[10px]">
                  <TranslatedText text="Most Booked" />
                </span>
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-serif italic text-slate-900 leading-tight">
              <TranslatedText text="Popular Services." />
            </h2>
            <p className="text-slate-500 text-lg font-medium max-w-md leading-relaxed">
              <TranslatedText text="Handpicked by couples — the most loved providers for your celebration." />
            </p>
          </div>

          <Link href="/services">
            <Button
              variant="outline"
              className="h-14 px-8 rounded-full border-slate-200 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-500 group"
            >
              <TranslatedText text="View All Services" />
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-2 flex-wrap mb-10">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveCategory(tab.value)}
              className={cn(
                "px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                activeCategory === tab.value
                  ? "bg-slate-900 text-white shadow-lg"
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700 border border-slate-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Service grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : services && services.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 text-center">
              <div className="inline-flex flex-col items-center gap-4">
                <p className="text-slate-400 text-sm font-medium">
                  <TranslatedText text="Discover 500+ verified wedding providers across Rwanda" />
                </p>
                <Link href="/services">
                  <Button className="h-14 px-12 rounded-full bg-[#668c65] hover:bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all duration-500">
                    <TranslatedText text="Explore All Providers" />
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          /* Empty state — only shown when category filter returns nothing */
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-slate-200" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-serif italic text-slate-700">
                <TranslatedText text="No services yet" />
              </h3>
              <p className="text-slate-400 text-sm max-w-xs font-medium">
                <TranslatedText text="Be the first to offer this service — providers are joining every day." />
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setActiveCategory(undefined)}
              className="rounded-full px-6 h-11 text-xs font-bold uppercase tracking-widest"
            >
              <TranslatedText text="View All Categories" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

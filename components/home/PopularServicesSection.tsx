"use client";

import React, { useState, useRef, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePopularServices } from "@/hooks/usePopularServices";
import { TranslatedText } from "@/components/translated-text";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
  if (service.gallery && service.gallery.length > 0) {
    const first = service.gallery[0];
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
    if (first?.thumbnail) return first.thumbnail;
  }
  if (service.provider_logo) return service.provider_logo;
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
      <div className="relative bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#668c65]/20 transition-all duration-500 hover:-translate-y-1">

        {/* Image */}
        <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100">
          <img
            src={image}
            alt={service.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {isTopPick && (
              <Badge className="bg-[#668c65] text-white border-0 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 shadow-lg">
                <TrendingUp className="w-2.5 h-2.5 mr-1" />
                Top Pick
              </Badge>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); setWishlist((w) => !w); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md active:scale-95 transition-transform duration-150"
            aria-label="Save to wishlist"
          >
            <Heart className={cn("w-3.5 h-3.5 transition-colors duration-200", wishlist ? "fill-rose-500 text-rose-500" : "text-slate-400")} />
          </button>

          {/* Quick view — desktop hover only */}
          <div className="hidden md:flex absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 p-3">
            <div className="flex items-center justify-center gap-2 w-full bg-white/95 backdrop-blur-sm rounded-xl py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-lg">
              <Eye className="w-3 h-3" />
              <TranslatedText text="View Details" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5">
          <span className="inline-block text-[9px] font-black uppercase tracking-[0.2em] text-[#668c65] bg-[#668c65]/8 px-2 py-0.5 rounded-full">
            {service.category}
          </span>

          <h3 className="font-black text-slate-900 text-base leading-snug tracking-tight line-clamp-1 group-hover:text-[#668c65] transition-colors duration-300">
            {service.name}
          </h3>

          {service.business_name && (
            <div className="text-xs text-slate-400 font-medium truncate flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                {service.provider_logo ? (
                  <img src={service.provider_logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#668c65]/20 flex items-center justify-center text-[7px] font-black text-[#668c65]">
                    {(service.business_name || "P").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="truncate">{service.business_name}</span>
            </div>
          )}

          <StarRating rating={service.rating || 0} />

          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium min-w-0">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{service.city || service.location || "Rwanda"}</span>
            </div>
            <span className="text-[10px] font-black text-slate-700 flex-shrink-0 ml-2">
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
    <div className="bg-white rounded-[24px] overflow-hidden border border-slate-100">
      <div className="h-44 bg-slate-100 animate-pulse" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 w-16 bg-slate-100 animate-pulse rounded-full" />
        <div className="h-4 w-3/4 bg-slate-100 animate-pulse rounded" />
        <div className="h-3 w-1/2 bg-slate-100 animate-pulse rounded" />
        <div className="h-3 w-24 bg-slate-100 animate-pulse rounded" />
        <div className="flex justify-between pt-1">
          <div className="h-3 w-16 bg-slate-100 animate-pulse rounded" />
          <div className="h-3 w-20 bg-slate-100 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

// ── Main section component ─────────────────────────────────────────────────────

export function PopularServicesSection() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const tabsRef = useRef<HTMLDivElement>(null);
  const { data: services, isLoading, isError } = usePopularServices(8, activeCategory);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="py-12 md:py-20 relative bg-white overflow-hidden animate-pulse">
        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="space-y-3 mb-8">
            <div className="h-4 w-24 bg-slate-100 rounded" />
            <div className="h-8 w-64 bg-slate-100 rounded" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[24px] overflow-hidden border border-slate-100 p-4 space-y-4">
                <div className="h-40 bg-slate-100 rounded-2xl" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError && !services?.length) return null;

  return (
    <section className="py-12 md:py-20 relative bg-white overflow-hidden">
      {/* Subtle dot texture — desktop only */}
      <div className="hidden md:block absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #668c65 1px, transparent 0)`, backgroundSize: "40px 40px" }}
      />

      <div className="container mx-auto max-w-7xl px-4 relative z-10">

        {/* Section header — stacks on mobile, row on desktop */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between md:gap-8 md:mb-8">
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2 text-[#668c65]">
              <div className="h-[1px] w-6 bg-[#668c65]/50" />
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-outfit font-black tracking-[0.35em] uppercase text-[9px]">
                <TranslatedText text="Most Booked" />
              </span>
            </div>
            {/* Smaller heading on mobile */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif italic text-slate-900 leading-tight">
              <TranslatedText text="Popular Services." />
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-medium max-w-sm md:max-w-md leading-relaxed">
              <TranslatedText text="Handpicked by couples — the most loved providers for your celebration." />
            </p>
          </div>

          {/* Custom navigation controls & View All button on top right */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end flex-shrink-0">
            {/* Swiper Arrow navigation controls */}
            <div className="flex items-center gap-2">
              <button className="popular-prev w-10 h-10 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white active:scale-95 transition-all flex items-center justify-center border border-slate-100 shadow-sm cursor-pointer disabled:opacity-40 disabled:hover:bg-slate-50 disabled:hover:text-slate-500">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="popular-next w-10 h-10 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white active:scale-95 transition-all flex items-center justify-center border border-slate-100 shadow-sm cursor-pointer disabled:opacity-40 disabled:hover:bg-slate-50 disabled:hover:text-slate-500">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* View All Button */}
            <Link href="/services" className="hidden sm:block">
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-5 rounded-full border-slate-200 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-500 group"
              >
                <TranslatedText text="View All" />
                <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Category tabs — horizontal scroll on mobile, wrap on desktop */}
        <div
          ref={tabsRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5 md:flex-wrap md:overflow-visible md:pb-0 md:mb-7 -mx-4 px-4 md:mx-0 md:px-0"
        >
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveCategory(tab.value)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300",
                activeCategory === tab.value
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700 border border-slate-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Service grid — 2 cols on mobile, 2 on sm, 4 on lg */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : services && services.length > 0 ? (
          <>
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={{
                prevEl: ".popular-prev",
                nextEl: ".popular-next",
              }}
              pagination={{ clickable: true }}
              spaceBetween={16}
              slidesPerView={1.2}
              breakpoints={{
                640: {
                  slidesPerView: 2.2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2.5,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 24,
                },
              }}
              className="popular-services-swiper pb-12"
            >
              {services.map((service, index) => (
                <SwiperSlide key={service.id} className="h-auto">
                  <ServiceCard service={service} index={index} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Bottom CTA */}
            <div className="mt-8 md:mt-10 text-center">
              <div className="inline-flex flex-col items-center gap-3">
                <p className="text-slate-400 text-xs md:text-sm font-medium">
                  <TranslatedText text="Discover 500+ verified wedding providers across Rwanda" />
                </p>
                <Link href="/services">
                  <Button className="h-12 md:h-14 px-8 md:px-12 rounded-full bg-[#668c65] hover:bg-slate-900 text-white font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-lg hover:shadow-2xl transition-all duration-500">
                    <TranslatedText text="Explore All Providers" />
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 space-y-5">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-slate-200" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-xl font-serif italic text-slate-700">
                <TranslatedText text="No services yet" />
              </h3>
              <p className="text-slate-400 text-sm max-w-xs font-medium">
                <TranslatedText text="Be the first to offer this service — providers are joining every day." />
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setActiveCategory(undefined)}
              className="rounded-full px-6 h-10 text-xs font-bold uppercase tracking-widest"
            >
              <TranslatedText text="View All Categories" />
            </Button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .popular-services-swiper .swiper-pagination-bullet {
          background: #cbd5e1;
          opacity: 0.6;
          width: 8px;
          height: 8px;
          margin: 0 4px !important;
        }
        .popular-services-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #668c65;
          width: 18px;
          border-radius: 4px;
        }
        .popular-services-swiper .swiper-button-next,
        .popular-services-swiper .swiper-button-prev {
          display: none !important;
        }
      `}</style>
    </section>
  );
}

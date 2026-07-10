"use client";

import { useState, useEffect } from "react";
import { MapPin, Heart, ChevronLeft, ChevronRight, Star } from "lucide-react";
import Link from "next/link";

interface ServiceCardProps {
  id: number | string;
  title: string;
  image: string;
  images?: string[];
  category: string;
  location: string;
  provider: string;
  price: string;
  rating: number;
  bookings: number;
}

export function ServiceCard({
  id,
  title,
  image,
  images,
  category,
  location,
  provider,
  price,
  rating,
  bookings,
}: ServiceCardProps) {
  const allImages = images && images.length > 0 ? images : [image];
  const [current, setCurrent] = useState(0);
  const [saved, setSaved] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Auto-advance slideshow
  useEffect(() => {
    if (allImages.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % allImages.length), 4000);
    return () => clearInterval(t);
  }, [allImages.length]);

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent(c => (c - 1 + allImages.length) % allImages.length);
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent(c => (c + 1) % allImages.length);
  };

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(v => !v);
  };

  return (
    <Link href={`/services/${id}`} className="group block">
      {/* ── Image area ── */}
      <div
        className="relative w-full aspect-square overflow-hidden rounded-2xl"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Sliding images */}
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {allImages.map((src, i) => (
            <img
              key={i}
              src={src || "/placeholder.jpg"}
              alt={`${title} — photo ${i + 1}`}
              className="flex-none w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ))}
        </div>

        {/* Gradient overlay — very subtle, bottom only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* Heart / save button */}
        <button
          onClick={toggleSave}
          className="absolute top-3 right-3 z-10 flex items-center justify-center transition-transform active:scale-90"
          aria-label={saved ? "Remove from saved" : "Save"}
        >
          <Heart
            className={`h-6 w-6 drop-shadow-md transition-all duration-200
              ${saved ? "fill-rose-500 text-rose-500" : "fill-white/30 text-white stroke-[1.5]"}`}
          />
        </button>

        {/* Category pill — top left */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-slate-800 shadow-sm leading-none">
            {category}
          </span>
        </div>

        {/* Prev / Next arrows — appear on hover */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className={`absolute left-2.5 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-200
                ${hovered ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
            >
              <ChevronLeft className="h-4 w-4 text-slate-800" strokeWidth={2.5} />
            </button>
            <button
              onClick={next}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-200
                ${hovered ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
            >
              <ChevronRight className="h-4 w-4 text-slate-800" strokeWidth={2.5} />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {allImages.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? "w-4 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Text content — Airbnb style ── */}
      <div className="mt-2.5 px-0.5 space-y-0.5">

        {/* Row 1: location (left) + rating (right) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <span className="text-[12px] font-semibold text-slate-500 truncate uppercase tracking-wide">
              {location}
            </span>
          </div>

          {rating > 0 ? (
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <Star className="h-3 w-3 fill-slate-900 text-slate-900" />
              <span className="text-[13px] font-semibold text-slate-900">{rating.toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-[12px] text-slate-400 flex-shrink-0 ml-2">New</span>
          )}
        </div>

        {/* Row 2: title */}
        <p className="text-[14px] font-semibold text-slate-800 line-clamp-1 leading-snug">
          {title}
        </p>

        {/* Row 3: provider */}
        <p className="text-[13px] text-slate-400 truncate leading-snug">{provider}</p>

        {/* Row 4: price */}
        <p className="text-[14px] font-semibold text-slate-900 pt-0.5">
          {price} <span className="font-normal text-slate-500">/ session</span>
        </p>

      </div>
    </Link>
  );
}

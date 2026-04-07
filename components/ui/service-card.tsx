"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bookmark, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ServiceCardProps {
  id: number | string;
  title: string;
  image: string;
  images?: string[];   // all gallery images for sliding
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
  bookings
}: ServiceCardProps) {
  const allImages = images && images.length > 0 ? images : [image];
  const [current, setCurrent] = useState(0);

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrent((c) => (c - 1 + allImages.length) % allImages.length);
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrent((c) => (c + 1) % allImages.length);
  };

  return (
    <Link href={`/services/${id}`}>
      <Card className="group overflow-hidden border border-slate-100 bg-white hover:shadow-2xl hover:border-sage-100 transition-all duration-500 rounded-[32px]">
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Sliding images */}
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {allImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${title} ${i + 1}`}
                className="flex-none w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ))}
          </div>

          {/* Prev / Next — only when multiple images */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronLeft className="h-4 w-4 text-slate-700" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronRight className="h-4 w-4 text-slate-700" />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {allImages.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none shadow-sm py-1.5 px-4 rounded-full font-bold text-[10px] uppercase tracking-wider">
              {category}
            </Badge>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 h-10 w-10 bg-white/90 hover:bg-white backdrop-blur-md text-slate-400 hover:text-rose-500 rounded-full shadow-sm transition-colors z-10"
            onClick={(e) => e.preventDefault()}
          >
            <Bookmark className="h-5 w-5" />
          </Button>

          <div className="absolute bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-2xl font-bold text-sm shadow-xl z-10">
            {price}
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-widest">{location}</span>
            </div>
            <h3 className="font-serif italic text-2xl text-slate-900 line-clamp-1 group-hover:text-sage-600 transition-colors">
              {title}
            </h3>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                {provider.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Provider</span>
                <span className="text-xs font-bold text-slate-600 line-clamp-1">{provider}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-sm font-black text-slate-900">{rating.toFixed(1)}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{bookings} bookings</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bookmark } from "lucide-react";
import Link from "next/link";

interface EventCardProps {
  id: number | string;
  title: string;
  image: string;
  time: string;
  location: string;
  organizer: string;
  price: string;
  href: string;
}

export function EventCard({ id, title, image, time, location, organizer, price, href }: EventCardProps) {
  return (
    <Link href={href}>
      <Card className="group overflow-hidden border border-slate-100 bg-white hover:border-[#668c65]/20 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] transition-all duration-700 rounded-[32px]">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors duration-500" />

          <div className="absolute top-6 left-6">
            <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-sm">
              {time}
            </Badge>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="absolute top-6 right-6 h-10 w-10 bg-white/90 hover:bg-[#668c65] hover:text-white backdrop-blur-md rounded-full shadow-sm transition-all duration-500 group/bookmark"
            onClick={(e) => {
              e.preventDefault();
              // Handle bookmark logic
            }}
          >
            <Bookmark className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">View Detail</p>
          </div>
        </div>

        <CardContent className="p-3 pt-2 space-y-1.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <div className="h-[1px] w-3 bg-[#668c65]/30 flex-shrink-0" />
              <span className="text-[7px] font-black text-[#668c65] uppercase tracking-[0.25em] truncate">{location}</span>
            </div>
            <h3 className="font-serif italic text-sm leading-tight line-clamp-2 text-slate-900">
              {title}
            </h3>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-slate-50 gap-2">
            {/* Presenter */}
            <div className="flex items-center gap-1 min-w-0">
              <div className="w-4 h-4 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[7px] font-black text-slate-400 flex-shrink-0">
                {organizer.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-[6px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Presenter</span>
                <span className="text-[8px] font-black text-slate-600 truncate block">{organizer}</span>
              </div>
            </div>
            {/* Price */}
            <div className="text-right flex-shrink-0">
              <span className="text-[6px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Access</span>
              <span className="text-[8px] font-black text-[#668c65]">{price}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

"use client";

import { Card, CardContent } from "@/components/ui/card";
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
      <Card className="group overflow-hidden border-0 bg-zinc-900 hover:bg-zinc-800 transition-all duration-300">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
            {time}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 h-9 w-9 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white"
            onClick={(e) => {
              e.preventDefault();
              // Handle bookmark logic
            }}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-400">{location}</span>
          </div>
          <h3 className="font-bold text-white text-lg line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white">
                {organizer.charAt(0)}
              </div>
              <span className="text-sm text-gray-400">{organizer}</span>
            </div>
            <span className="text-sm text-gray-400">{price}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Bookmark, Star } from "lucide-react";
import Link from "next/link";

interface ServiceCardProps {
  id: number | string;
  title: string;
  image: string;
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
  category, 
  location, 
  provider, 
  price, 
  rating, 
  bookings 
}: ServiceCardProps) {
  return (
    <Link href={`/services/${id}`}>
      <Card className="group overflow-hidden border-0 bg-zinc-900 hover:bg-zinc-800 transition-all duration-300">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs">
            {category}
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
                {provider.charAt(0)}
              </div>
              <span className="text-sm text-gray-400">{category}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-400">{rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <span className="text-xs text-gray-500">{bookings} bookings</span>
            <span className="text-sm font-bold text-white">{price}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

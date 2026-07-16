"use client";

import Link from "next/link";
import { MapPin, ArrowLeft, ExternalLink, Navigation } from "lucide-react";
import { PublicWeddingSite } from "@/lib/api";

export function PublicVenue({ site }: { site: PublicWeddingSite }) {
  const accent = (site.theme_config?.accent_color as string) || "#668c65";
  const venueSection = site.sections.find(
    (s) => s.section_type === "venue" || s.section_type === "venue_map",
  );
  const content = venueSection?.content || {};

  const venueName = (content.venue_name as string) || site.wedding.venue || "Venue TBA";
  const address = (content.address as string) || (content.venue_address as string) || "";
  const notes = (content.notes as string) || (content.directions as string) || "";
  const parking = (content.parking as string) || "";
  const hotels = (content.hotels as string) || "";
  const mapQuery = encodeURIComponent([venueName, address].filter(Boolean).join(", "));
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const wazeUrl = `https://waze.com/ul?q=${mapQuery}&navigate=yes`;

  return (
    <div className="min-h-screen bg-[#f9fafc]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link
          href={`/w/${site.slug}`}
          className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> {site.wedding.couple_name}
        </Link>

        <div className="text-center mb-10">
          <MapPin className="h-8 w-8 mx-auto mb-3" style={{ color: accent }} />
          <h1 className="font-serif text-4xl text-[#0d182a]">Venue</h1>
          <p className="text-slate-500 mt-2">Where we celebrate</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl text-[#0d182a]">{venueName}</h2>
            {address && <p className="text-slate-600">{address}</p>}
            {site.wedding.wedding_date && (
              <p className="text-sm text-slate-400">
                {new Date(site.wedding.wedding_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {(venueName !== "Venue TBA" || address) && (
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium"
                style={{ backgroundColor: accent }}
              >
                <ExternalLink className="h-4 w-4" /> Google Maps
              </a>
              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium"
                style={{ borderColor: accent, color: accent }}
              >
                <Navigation className="h-4 w-4" /> Waze
              </a>
            </div>
          )}

          {notes && (
            <div className="border-t pt-6 space-y-2">
              <h3 className="font-medium text-[#0d182a]">Directions & Notes</h3>
              <p className="text-slate-600 whitespace-pre-line text-sm leading-relaxed">{notes}</p>
            </div>
          )}
          {parking && (
            <div className="space-y-2">
              <h3 className="font-medium text-[#0d182a]">Parking</h3>
              <p className="text-slate-600 whitespace-pre-line text-sm">{parking}</p>
            </div>
          )}
          {hotels && (
            <div className="space-y-2">
              <h3 className="font-medium text-[#0d182a]">Nearby Hotels</h3>
              <p className="text-slate-600 whitespace-pre-line text-sm">{hotels}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

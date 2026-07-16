"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Clock, ArrowLeft, ExternalLink, Shirt } from "lucide-react";
import { apiClient, PublicWeddingSite, WeddingEventItem } from "@/lib/api";

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

const TYPE_LABELS: Record<string, string> = {
  engagement: "Engagement",
  traditional_ceremony: "Traditional Ceremony",
  church_wedding: "Church Wedding",
  civil_marriage: "Civil Marriage",
  reception: "Reception",
  after_party: "After Party",
  brunch: "Brunch",
  other: "Event",
};

export function PublicEvents({ site }: { site: PublicWeddingSite }) {
  const accent = (site.theme_config?.accent_color as string) || "#668c65";

  const { data: events = [] } = useQuery({
    queryKey: ["public-events", site.slug],
    queryFn: async () => unwrap(await apiClient.events.listPublic<WeddingEventItem[]>(site.slug)),
  });

  return (
    <div className="min-h-screen bg-[#f9fafc]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href={`/w/${site.slug}`} className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 mb-8">
          <ArrowLeft className="h-4 w-4" /> {site.wedding.couple_name}
        </Link>

        <div className="text-center mb-10">
          <Calendar className="h-8 w-8 mx-auto mb-3" style={{ color: accent }} />
          <h1 className="font-serif text-4xl text-[#0d182a]">Wedding Events</h1>
          <p className="text-slate-500 mt-2">All the celebrations for {site.wedding.couple_name}</p>
        </div>

        {events.length === 0 ? (
          <p className="text-center text-slate-400">Event details coming soon.</p>
        ) : (
          <div className="space-y-6">
            {events.map((evt) => (
              <div key={evt.id} className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    {TYPE_LABELS[evt.event_type] || evt.event_type}
                  </p>
                  <h2 className="font-serif text-2xl text-[#0d182a] mt-1">{evt.title}</h2>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" style={{ color: accent }} />
                    {new Date(evt.event_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </span>
                  {evt.start_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" style={{ color: accent }} />
                      {evt.start_time.slice(0, 5)}
                      {evt.end_time && ` – ${evt.end_time.slice(0, 5)}`}
                    </span>
                  )}
                </div>
                {evt.venue_name && (
                  <div className="text-sm">
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4" style={{ color: accent }} /> {evt.venue_name}
                    </p>
                    {evt.venue_address && <p className="text-slate-500 mt-1 ml-5">{evt.venue_address}</p>}
                  </div>
                )}
                {evt.dress_code && (
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    <Shirt className="h-4 w-4" /> Dress code: {evt.dress_code}
                  </p>
                )}
                {evt.parking_info && <p className="text-sm text-slate-500">{evt.parking_info}</p>}
                {evt.notes && <p className="text-sm text-slate-600 border-t pt-3">{evt.notes}</p>}
                {evt.google_maps_url && (
                  <a
                    href={evt.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium"
                    style={{ color: accent }}
                  >
                    <ExternalLink className="h-4 w-4" /> Get Directions
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

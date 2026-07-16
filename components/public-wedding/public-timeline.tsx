"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Heart, ArrowLeft } from "lucide-react";
import { apiClient, PublicWeddingSite, WeddingTimelineItem } from "@/lib/api";

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

export function PublicTimeline({ site }: { site: PublicWeddingSite }) {
  const accent = (site.theme_config?.accent_color as string) || "#668c65";

  const { data: items = [] } = useQuery({
    queryKey: ["public-timeline", site.slug],
    queryFn: async () => unwrap(await apiClient.timeline.listPublic<WeddingTimelineItem[]>(site.slug)),
  });

  return (
    <div className="min-h-screen bg-[#f9fafc]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href={`/w/${site.slug}`} className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 mb-8">
          <ArrowLeft className="h-4 w-4" /> {site.wedding.couple_name}
        </Link>

        <div className="text-center mb-12">
          <Heart className="h-8 w-8 mx-auto mb-3" style={{ color: accent }} />
          <h1 className="font-serif text-4xl text-[#0d182a]">Our Story</h1>
          <p className="text-slate-500 mt-2">The journey that brought us here</p>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-slate-400">Our love story is being written...</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#668c65]/40 to-transparent md:-translate-x-px" />
            <div className="space-y-12">
              {items.map((item, i) => (
                <div key={item.id} className={`relative flex ${i % 2 === 0 ? "md:justify-start" : "md:justify-end"}`}>
                  <div className={`md:w-[calc(50%-2rem)] pl-12 md:pl-0 ${i % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"}`}>
                    <div className="absolute left-2.5 md:left-1/2 md:-translate-x-1/2 top-2 h-4 w-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: accent }} />
                    <div className="bg-white rounded-2xl shadow-md p-5">
                      {item.event_date && (
                        <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">
                          {new Date(item.event_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </p>
                      )}
                      <h3 className="font-serif text-xl text-[#0d182a]">{item.title}</h3>
                      {item.description && <p className="text-slate-600 text-sm mt-2 leading-relaxed">{item.description}</p>}
                      {item.location && <p className="text-xs text-slate-400 mt-2">{item.location}</p>}
                      {(item.images?.length ?? 0) > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {item.images!.slice(0, 2).map((url) => (
                            <img key={url} src={url} alt="" className="rounded-lg aspect-video object-cover" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

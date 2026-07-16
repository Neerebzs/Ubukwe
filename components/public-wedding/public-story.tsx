"use client";

import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { PublicWeddingSite } from "@/lib/api";

export function PublicStory({ site }: { site: PublicWeddingSite }) {
  const accent = (site.theme_config?.accent_color as string) || "#668c65";
  const profile = site.couple_profile || {};
  const storySection = site.sections.find(
    (s) => s.section_type === "love_story" || s.section_type === "couple_profile",
  );
  const content = storySection?.content || {};

  const loveStory =
    (profile.love_story as string) ||
    (content.story as string) ||
    (content.intro as string) ||
    (profile.biography as string) ||
    "";
  const proposal = (profile.proposal_story as string) || "";
  const bride = (profile.bride_name as string) || "";
  const groom = (profile.groom_name as string) || "";

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
          <Heart className="h-8 w-8 mx-auto mb-3" style={{ color: accent }} />
          <h1 className="font-serif text-4xl text-[#0d182a]">Our Story</h1>
          {(bride || groom) && (
            <p className="text-slate-500 mt-2">
              {[bride, groom].filter(Boolean).join(" & ")}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {loveStory ? (
            <div className="space-y-3">
              <h2 className="font-serif text-2xl text-[#0d182a]">How We Met</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{loveStory}</p>
            </div>
          ) : (
            <p className="text-slate-500 text-center italic">
              Every love story is beautiful, but ours is our favorite.
            </p>
          )}

          {proposal && (
            <div className="space-y-3 border-t pt-8">
              <h2 className="font-serif text-2xl text-[#0d182a]">The Proposal</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{proposal}</p>
            </div>
          )}

          <div className="text-center pt-4">
            <Link
              href={`/w/${site.slug}/timeline`}
              className="inline-block px-6 py-2.5 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: accent }}
            >
              View Our Timeline
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

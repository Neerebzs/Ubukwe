"use client";

import { PublicWeddingSite, WeddingWebsite } from "@/lib/api";
import { PublicWeddingSiteView } from "@/components/public-wedding/public-wedding-site";

interface WebsiteLivePreviewProps {
  website: WeddingWebsite;
  coupleName?: string;
  weddingDate?: string;
  venue?: string;
}

export function WebsiteLivePreview({ website, coupleName, weddingDate, venue }: WebsiteLivePreviewProps) {
  const site: PublicWeddingSite = {
    slug: website.slug,
    status: website.status,
    theme_id: website.theme_id,
    theme_config: website.theme_config || {},
    couple_profile: website.couple_profile || {},
    seo_config: website.seo_config || {},
    privacy_mode: website.privacy_mode,
    sections: (website.sections || []).filter((s) => s.is_visible && !s.deleted_at),
    wedding: {
      couple_name: coupleName || (website.couple_profile?.display_names as string) || "Couple",
      wedding_date: weddingDate,
      venue: venue,
    },
  };

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-inner bg-white">
      <div className="bg-slate-100 px-3 py-2 text-xs text-slate-500 border-b flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-400" />
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <span className="w-2 h-2 rounded-full bg-green-400" />
        <span className="ml-2">Live Preview — /w/{website.slug}</span>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        <PublicWeddingSiteView site={site} />
      </div>
    </div>
  );
}

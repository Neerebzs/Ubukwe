"use client";

import { PublicWeddingSite } from "@/lib/api";
import { PublicWeddingSiteView } from "@/components/public-wedding/public-wedding-site";
import { PublicAccessGate } from "@/components/public-wedding/public-access-gate";
import { buildWeddingJsonLd } from "@/lib/wedding-seo";

interface PublicWeddingWrapperProps {
  slug: string;
  initialSite: PublicWeddingSite;
}

export function PublicWeddingWrapper({ slug, initialSite }: PublicWeddingWrapperProps) {
  return (
    <PublicAccessGate slug={slug} initialSite={initialSite}>
      {(site) => (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(
                buildWeddingJsonLd(
                  site,
                  typeof window !== "undefined" ? window.location.origin : "https://vownests.com",
                ),
              ),
            }}
          />
          <PublicWeddingSiteView site={site} />
        </>
      )}
    </PublicAccessGate>
  );
}

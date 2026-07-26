"use client";

import { PublicWeddingSite } from "@/lib/api";
import { PublicAccessGate } from "@/components/public-wedding/public-access-gate";
import { GatedPublicHome } from "@/components/public-wedding/gated-views";

interface PublicWeddingWrapperProps {
  slug: string;
  initialSite: PublicWeddingSite;
}

export function PublicWeddingWrapper({ slug, initialSite }: PublicWeddingWrapperProps) {
  return (
    <PublicAccessGate slug={slug} initialSite={initialSite}>
      <GatedPublicHome />
    </PublicAccessGate>
  );
}

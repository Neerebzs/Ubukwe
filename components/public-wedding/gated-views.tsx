"use client";

import { usePublicWeddingSite } from "@/components/public-wedding/public-access-gate";
import { PublicContact } from "@/components/public-wedding/public-contact";
import { PublicEvents } from "@/components/public-wedding/public-events";
import { PublicGallery } from "@/components/public-wedding/public-gallery";
import { PublicGiftForm } from "@/components/public-wedding/public-gift-form";
import { PublicGuestbook } from "@/components/public-wedding/public-guestbook";
import { PublicRsvpForm } from "@/components/public-wedding/public-rsvp-form";
import { PublicStory } from "@/components/public-wedding/public-story";
import { PublicTimeline } from "@/components/public-wedding/public-timeline";
import { PublicVenue } from "@/components/public-wedding/public-venue";
import { PublicWeddingSiteView } from "@/components/public-wedding/public-wedding-site";
import { buildWeddingJsonLd } from "@/lib/wedding-seo";

const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://vownests.com"
).replace(/\/$/, "");

export function GatedPublicHome() {
  const site = usePublicWeddingSite();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildWeddingJsonLd(site, SITE_ORIGIN)),
        }}
      />
      <PublicWeddingSiteView site={site} />
    </>
  );
}

export function GatedPublicStory() {
  const site = usePublicWeddingSite();
  return <PublicStory site={site} />;
}

export function GatedPublicRsvp() {
  const site = usePublicWeddingSite();
  return <PublicRsvpForm site={site} />;
}

export function GatedPublicGifts() {
  const site = usePublicWeddingSite();
  return <PublicGiftForm site={site} />;
}

export function GatedPublicGallery() {
  const site = usePublicWeddingSite();
  return <PublicGallery site={site} />;
}

export function GatedPublicEvents() {
  const site = usePublicWeddingSite();
  return <PublicEvents site={site} />;
}

export function GatedPublicContact() {
  const site = usePublicWeddingSite();
  return <PublicContact site={site} />;
}

export function GatedPublicGuestbook() {
  const site = usePublicWeddingSite();
  return <PublicGuestbook site={site} />;
}

export function GatedPublicVenue() {
  const site = usePublicWeddingSite();
  return <PublicVenue site={site} />;
}

export function GatedPublicTimeline() {
  const site = usePublicWeddingSite();
  return <PublicTimeline site={site} />;
}

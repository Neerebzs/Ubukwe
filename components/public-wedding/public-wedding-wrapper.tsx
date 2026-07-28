"use client";

import { PublicWeddingSite } from "@/lib/api";
import { PublicAccessGate } from "@/components/public-wedding/public-access-gate";
import {
  GatedPublicContact,
  GatedPublicEvents,
  GatedPublicGallery,
  GatedPublicGifts,
  GatedPublicGuestbook,
  GatedPublicHome,
  GatedPublicRsvp,
  GatedPublicStory,
  GatedPublicTimeline,
  GatedPublicVenue,
} from "@/components/public-wedding/gated-views";

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

export function PublicStoryWrapper({ slug, initialSite }: PublicWeddingWrapperProps) {
  return (
    <PublicAccessGate slug={slug} initialSite={initialSite}>
      <GatedPublicStory />
    </PublicAccessGate>
  );
}

export function PublicRsvpWrapper({ slug, initialSite }: PublicWeddingWrapperProps) {
  return (
    <PublicAccessGate slug={slug} initialSite={initialSite}>
      <GatedPublicRsvp />
    </PublicAccessGate>
  );
}

export function PublicGiftsWrapper({ slug, initialSite }: PublicWeddingWrapperProps) {
  return (
    <PublicAccessGate slug={slug} initialSite={initialSite}>
      <GatedPublicGifts />
    </PublicAccessGate>
  );
}

export function PublicGalleryWrapper({ slug, initialSite }: PublicWeddingWrapperProps) {
  return (
    <PublicAccessGate slug={slug} initialSite={initialSite}>
      <GatedPublicGallery />
    </PublicAccessGate>
  );
}

export function PublicEventsWrapper({ slug, initialSite }: PublicWeddingWrapperProps) {
  return (
    <PublicAccessGate slug={slug} initialSite={initialSite}>
      <GatedPublicEvents />
    </PublicAccessGate>
  );
}

export function PublicContactWrapper({ slug, initialSite }: PublicWeddingWrapperProps) {
  return (
    <PublicAccessGate slug={slug} initialSite={initialSite}>
      <GatedPublicContact />
    </PublicAccessGate>
  );
}

export function PublicGuestbookWrapper({ slug, initialSite }: PublicWeddingWrapperProps) {
  return (
    <PublicAccessGate slug={slug} initialSite={initialSite}>
      <GatedPublicGuestbook />
    </PublicAccessGate>
  );
}

export function PublicVenueWrapper({ slug, initialSite }: PublicWeddingWrapperProps) {
  return (
    <PublicAccessGate slug={slug} initialSite={initialSite}>
      <GatedPublicVenue />
    </PublicAccessGate>
  );
}

export function PublicTimelineWrapper({ slug, initialSite }: PublicWeddingWrapperProps) {
  return (
    <PublicAccessGate slug={slug} initialSite={initialSite}>
      <GatedPublicTimeline />
    </PublicAccessGate>
  );
}

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PublicAccessGate } from "@/components/public-wedding/public-access-gate";
import { PublicRsvpForm } from "@/components/public-wedding/public-rsvp-form";
import { fetchPublicWeddingSite } from "@/lib/public-wedding";

interface PageProps {
  params: { slug: string };
  searchParams: { preview?: string };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const site = await fetchPublicWeddingSite(params.slug, searchParams.preview);
  if (!site) return { title: "RSVP" };
  return {
    title: `RSVP — ${site.wedding.couple_name}`,
    description: `Respond to ${site.wedding.couple_name}'s wedding invitation`,
  };
}

export default async function PublicRsvpPage({ params, searchParams }: PageProps) {
  const site = await fetchPublicWeddingSite(params.slug, searchParams.preview);
  if (!site) notFound();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading RSVP...</div>}>
      <PublicAccessGate slug={params.slug} initialSite={site}>
        {(unlocked) => <PublicRsvpForm site={unlocked} />}
      </PublicAccessGate>
    </Suspense>
  );
}

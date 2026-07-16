import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PublicAccessGate } from "@/components/public-wedding/public-access-gate";
import { PublicTimeline } from "@/components/public-wedding/public-timeline";
import { fetchPublicWeddingSite } from "@/lib/public-wedding";

interface PageProps {
  params: { slug: string };
  searchParams: { preview?: string };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const site = await fetchPublicWeddingSite(params.slug, searchParams.preview);
  if (!site) return { title: "Timeline" };
  return { title: `Timeline — ${site.wedding.couple_name}` };
}

export default async function TimelinePage({ params, searchParams }: PageProps) {
  const site = await fetchPublicWeddingSite(params.slug, searchParams.preview);
  if (!site) notFound();
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PublicAccessGate slug={params.slug} initialSite={site}>
        {(unlocked) => <PublicTimeline site={unlocked} />}
      </PublicAccessGate>
    </Suspense>
  );
}

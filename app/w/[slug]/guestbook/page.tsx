import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicAccessGate } from "@/components/public-wedding/public-access-gate";
import { PublicGuestbook } from "@/components/public-wedding/public-guestbook";
import { fetchPublicWeddingSite } from "@/lib/public-wedding";

interface PageProps {
  params: { slug: string };
  searchParams: { preview?: string };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const site = await fetchPublicWeddingSite(params.slug, searchParams.preview);
  return { title: site ? `Guestbook — ${site.wedding.couple_name}` : "Guestbook" };
}

export default async function GuestbookPage({ params, searchParams }: PageProps) {
  const site = await fetchPublicWeddingSite(params.slug, searchParams.preview);
  if (!site) notFound();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PublicAccessGate slug={params.slug} initialSite={site}>
        {(unlocked) => <PublicGuestbook site={unlocked} />}
      </PublicAccessGate>
    </Suspense>
  );
}

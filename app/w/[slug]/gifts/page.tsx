import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicAccessGate } from "@/components/public-wedding/public-access-gate";
import { PublicGiftForm } from "@/components/public-wedding/public-gift-form";
import { fetchPublicWeddingSite } from "@/lib/public-wedding";

interface PageProps {
  params: { slug: string };
  searchParams: { preview?: string };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const site = await fetchPublicWeddingSite(params.slug, searchParams.preview);
  return { title: site ? `Gifts — ${site.wedding.couple_name}` : "Gift Registration" };
}

export default async function PublicGiftsPage({ params, searchParams }: PageProps) {
  const site = await fetchPublicWeddingSite(params.slug, searchParams.preview);
  if (!site) notFound();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PublicAccessGate slug={params.slug} initialSite={site}>
        {(unlocked) => <PublicGiftForm site={unlocked} />}
      </PublicAccessGate>
    </Suspense>
  );
}

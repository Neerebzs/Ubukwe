import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicGiftsWrapper } from "@/components/public-wedding/public-wedding-wrapper";
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
      <PublicGiftsWrapper slug={params.slug} initialSite={site} />
    </Suspense>
  );
}

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PublicAccessGate } from "@/components/public-wedding/public-access-gate";
import { PublicGallery } from "@/components/public-wedding/public-gallery";
import { fetchPublicWeddingSite } from "@/lib/public-wedding";

interface PageProps {
  params: { slug: string };
  searchParams: { preview?: string };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const site = await fetchPublicWeddingSite(params.slug, searchParams.preview);
  if (!site) return { title: "Gallery" };
  return {
    title: `Gallery — ${site.wedding.couple_name}`,
    description: `Photo gallery for ${site.wedding.couple_name}'s wedding`,
  };
}

export default async function GalleryPage({ params, searchParams }: PageProps) {
  const site = await fetchPublicWeddingSite(params.slug, searchParams.preview);
  if (!site) notFound();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading gallery...</div>}>
      <PublicAccessGate slug={params.slug} initialSite={site}>
        {(unlocked) => <PublicGallery site={unlocked} />}
      </PublicAccessGate>
    </Suspense>
  );
}

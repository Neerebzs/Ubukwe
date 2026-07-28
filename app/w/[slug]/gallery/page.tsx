import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PublicGalleryWrapper } from "@/components/public-wedding/public-wedding-wrapper";
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
      <PublicGalleryWrapper slug={params.slug} initialSite={site} />
    </Suspense>
  );
}

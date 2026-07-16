import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PublicWeddingWrapper } from "@/components/public-wedding/public-wedding-wrapper";
import { fetchPublicWeddingSite } from "@/lib/public-wedding";

const APP_BASE = (process.env.NEXT_PUBLIC_APP_URL || "https://vownests.com").replace(/\/+$/, "");

interface PageProps {
  params: { slug: string };
  searchParams: { preview?: string };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const site = await fetchPublicWeddingSite(params.slug, searchParams.preview);
  if (!site) return { title: "Wedding Website" };

  const seo = site.seo_config || {};
  const title = (seo.meta_title as string) || `${site.wedding.couple_name} — Wedding`;
  const description = (seo.meta_description as string) || `Join ${site.wedding.couple_name} in celebrating their wedding.`;
  const ogImage = (seo.og_image as string) || undefined;
  const canonical = `${APP_BASE}/w/${params.slug}`;
  const isHidden = site.privacy_mode === "hidden";

  return {
    title,
    description,
    keywords: (seo.meta_keywords as string) || undefined,
    alternates: { canonical },
    robots: isHidden ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function PublicWeddingPage({ params, searchParams }: PageProps) {
  const site = await fetchPublicWeddingSite(params.slug, searchParams.preview);
  if (!site) notFound();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PublicWeddingWrapper slug={params.slug} initialSite={site} />
    </Suspense>
  );
}

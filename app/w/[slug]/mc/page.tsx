import { Suspense } from "react";
import { Metadata } from "next";
import { PublicMcPortal } from "@/components/public-wedding/public-mc-portal";

export const metadata: Metadata = { title: "MC Portal" };

export default function McPortalPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d182a] flex items-center justify-center text-white">Loading...</div>}>
      <PublicMcPortal slug={params.slug} />
    </Suspense>
  );
}

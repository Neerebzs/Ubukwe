import { NextRequest, NextResponse } from "next/server";

const BASE = (process.env.NEXT_PUBLIC_APP_URL || "https://vownests.com").replace(/\/+$/, "");

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } },
) {
  const slug = params.slug;
  const body = `User-agent: *
Allow: /w/${slug}/
Disallow: /w/${slug}/mc

Sitemap: ${BASE}/w/${slug}/sitemap.xml
`;

  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

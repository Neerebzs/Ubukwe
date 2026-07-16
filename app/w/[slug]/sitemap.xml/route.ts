import { NextRequest, NextResponse } from "next/server";

const BASE = (process.env.NEXT_PUBLIC_APP_URL || "https://vownests.com").replace(/\/+$/, "");

const PUBLIC_PATHS = [
  "",
  "/story",
  "/events",
  "/timeline",
  "/venue",
  "/rsvp",
  "/gifts",
  "/gallery",
  "/guestbook",
  "/contact",
  "/mc",
];

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } },
) {
  const slug = params.slug;
  const urls = PUBLIC_PATHS.map((path) => {
    const loc = `${BASE}/w/${slug}${path}`;
    return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${path === "" ? "1.0" : "0.8"}</priority>\n  </url>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

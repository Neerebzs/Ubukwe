import { PublicWeddingSite } from "@/lib/api";

const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:4000")
  .replace(/\/+$/, "")
  .replace(/\/api\/v1$/, "");

export async function fetchPublicWeddingSite(
  slug: string,
  preview?: string,
): Promise<PublicWeddingSite | null> {
  try {
    const qs = preview ? `?preview=${encodeURIComponent(preview)}` : "";
    const res = await fetch(`${API_BASE}/api/v1/public/w/${slug}${qs}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

import { PublicWeddingSite } from "@/lib/api";
import type { Invitation } from "@/components/invitations/types";

export type PublicInvitationPayload = {
  invitation: Invitation;
  website_url?: string | null;
};

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

export async function fetchPublicInvitation(id: string): Promise<PublicInvitationPayload | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/public/invitations/${id}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

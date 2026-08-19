import { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationRenderer } from "@/components/invitations/InvitationRenderer";
import { resolveTemplateId } from "@/components/invitations/content";
import { fetchPublicInvitation } from "@/lib/public-wedding";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await fetchPublicInvitation(params.id);
  if (!data?.invitation) return { title: "Wedding Invitation" };
  const couple = data.invitation.couple_names || "Wedding";
  const date = data.invitation.wedding_date ? ` on ${data.invitation.wedding_date}` : "";
  return {
    title: `You're invited — ${couple}`,
    description: `Wedding invitation for ${couple}${date}.`,
    robots: { index: false, follow: false },
  };
}

export default async function PublicInvitationPage({ params }: PageProps) {
  const data = await fetchPublicInvitation(params.id);
  if (!data?.invitation) notFound();

  const inv = data.invitation;
  const templateId = resolveTemplateId(inv.color_theme);

  return (
    <main className="min-h-screen py-8 px-4 md:py-12" style={{ background: "#f4f4f4" }}>
      <div className="mx-auto max-w-5xl">
        <InvitationRenderer source={inv} templateId={templateId} websiteUrl={data.website_url || ""} size="desktop" />
        {data.website_url && (
          <p className="text-center mt-8">
            <a href={data.website_url} className="text-sm text-slate-600 underline underline-offset-4 hover:text-slate-900">
              View wedding website
            </a>
          </p>
        )}
      </div>
    </main>
  );
}

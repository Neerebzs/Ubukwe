"use client";

import Link from "next/link";
import { Mail, Phone, ArrowLeft, MessageCircle } from "lucide-react";
import { PublicWeddingSite } from "@/lib/api";

export function PublicContact({ site }: { site: PublicWeddingSite }) {
  const accent = (site.theme_config?.accent_color as string) || "#668c65";
  const profile = site.couple_profile || {};
  const contactSection = site.sections.find((s) => s.section_type === "contact");
  const content = contactSection?.content || {};

  const email = (content.email as string) || (profile.contact_email as string) || "";
  const phone = (content.phone as string) || (profile.contact_phone as string) || "";
  const whatsapp = (content.whatsapp as string) || "";
  const message =
    (content.message as string) ||
    `Questions about ${site.wedding.couple_name}'s wedding? Reach out using the details below.`;

  const contacts = Array.isArray(content.contacts)
    ? (content.contacts as { name?: string; role?: string; email?: string; phone?: string }[])
    : [];

  return (
    <div className="min-h-screen bg-[#f9fafc]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link
          href={`/w/${site.slug}`}
          className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> {site.wedding.couple_name}
        </Link>

        <div className="text-center mb-10">
          <Mail className="h-8 w-8 mx-auto mb-3" style={{ color: accent }} />
          <h1 className="font-serif text-4xl text-[#0d182a]">Contact</h1>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">{message}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {(email || phone || whatsapp) && (
            <div className="space-y-4">
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-3 text-slate-700 hover:opacity-80">
                  <Mail className="h-5 w-5" style={{ color: accent }} />
                  <span>{email}</span>
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-3 text-slate-700 hover:opacity-80">
                  <Phone className="h-5 w-5" style={{ color: accent }} />
                  <span>{phone}</span>
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-slate-700 hover:opacity-80"
                >
                  <MessageCircle className="h-5 w-5" style={{ color: accent }} />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          )}

          {contacts.length > 0 && (
            <div className="border-t pt-6 space-y-4">
              <h2 className="font-serif text-xl text-[#0d182a]">Wedding Contacts</h2>
              {contacts.map((c, i) => (
                <div key={i} className="rounded-xl border p-4 space-y-1">
                  <p className="font-medium text-[#0d182a]">{c.name || "Contact"}</p>
                  {c.role && <p className="text-xs uppercase tracking-wider text-slate-400">{c.role}</p>}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="block text-sm text-slate-600 hover:underline">
                      {c.email}
                    </a>
                  )}
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="block text-sm text-slate-600 hover:underline">
                      {c.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {!email && !phone && !whatsapp && contacts.length === 0 && (
            <p className="text-center text-slate-500 italic">
              Contact details will appear here once the couple adds them.
            </p>
          )}

          <div className="text-center pt-2">
            <Link
              href={`/w/${site.slug}/rsvp`}
              className="inline-block px-6 py-2.5 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: accent }}
            >
              RSVP Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

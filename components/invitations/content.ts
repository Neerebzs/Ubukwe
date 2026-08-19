import type { Invitation, InvitationContent, InvitationFormState, InvitationTemplateId, ProgramEvent } from "./types";

export const EMPTY_PROGRAM_EVENT: ProgramEvent = { time: "", event: "", location: "" };

export const EMPTY_INV: InvitationFormState = {
  title: "Wedding Invitation",
  couple_names: "",
  couple_names_en: "",
  wedding_date: "",
  wedding_date_en: "",
  wedding_time: "",
  venue: "",
  message: "",
  rsvp_details: "",
  dress_code: "",
  theme: "",
  tone: "formal",
  template_style: "traditional",
  bible_verse: "",
  bible_verse_rw: "",
  bible_verse_en: "",
  description: "",
  description_rw: "",
  program_events: [{ ...EMPTY_PROGRAM_EVENT }, { ...EMPTY_PROGRAM_EVENT }, { ...EMPTY_PROGRAM_EVENT }],
  invitation_note: "",
  invitation_note_en: "",
  couple_contact: "",
  color_theme: "rose_triptych",
  groom_family_name: "",
  bride_family_name: "",
  represented_by: "",
  groom_represented_by: "",
  bride_represented_by: "",
  bride_contacts: [],
  groom_contacts: [],
};

export function isTemplateId(value?: string | null): value is InvitationTemplateId {
  return value === "rose_triptych" || value === "bilingual_gold" || value === "sage_botanical" || value === "linen_rings" || value === "olive_terrace";
}

export function resolveTemplateId(value?: string | null): InvitationTemplateId {
  return isTemplateId(value) ? value : "rose_triptych";
}

export function splitCoupleNames(names: string): { left: string; right: string } {
  const trimmed = (names || "").trim();
  if (!trimmed) return { left: "", right: "" };
  const parts = trimmed.split(/\s*(?:&+|AND|and|na|❤️|♥)\s*/i).filter(Boolean);
  if (parts.length >= 2) return { left: parts[0].trim(), right: parts.slice(1).join(" ").trim() };
  return { left: trimmed, right: "" };
}

export function splitFirstLast(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length < 2) return { first: full.trim(), last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

export function joinCoupleNames(left: string, right: string): string {
  const a = left.trim();
  const b = right.trim();
  if (a && b) return `${a} & ${b}`;
  return a || b;
}

export function eventInLang(ev: ProgramEvent, lang: "rw" | "en"): ProgramEvent {
  if (lang === "en") {
    return {
      time: (ev.time_en || ev.time || "").trim(),
      event: (ev.event_en || ev.event || "").trim(),
      location: (ev.location_en || ev.location || "").trim(),
    };
  }
  return {
    time: (ev.time || "").trim(),
    event: (ev.event || "").trim(),
    location: (ev.location || "").trim(),
  };
}

export function buildInvitationContent(
  inv: Partial<Invitation> | InvitationFormState,
  websiteUrl = "",
): InvitationContent {
  const coupleRw = (inv.couple_names || "").trim();
  const coupleEn = ("couple_names_en" in inv ? inv.couple_names_en : "")?.trim() || "";
  const rw = splitCoupleNames(coupleRw);
  const en = splitCoupleNames(coupleEn);
  const leftParts = splitFirstLast(en.left || rw.left);
  const rightParts = splitFirstLast(en.right || rw.right);
  const familyRw = ("description_rw" in inv ? inv.description_rw : "")?.trim() || "";
  const familyEn = (inv.description || "").trim();
  return {
    coupleNames: coupleRw,
    leftName: rw.left,
    rightName: rw.right,
    leftNameRw: rw.left,
    rightNameRw: rw.right,
    leftNameEn: en.left,
    rightNameEn: en.right,
    leftFirst: leftParts.first,
    leftLast: leftParts.last,
    rightFirst: rightParts.first,
    rightLast: rightParts.last,
    weddingDate: (inv.wedding_date || "").trim(),
    weddingDateEn: ("wedding_date_en" in inv ? inv.wedding_date_en : "")?.trim() || "",
    weddingTime: (inv.wedding_time || "").trim(),
    venue: (inv.venue || "").trim(),
    description: (inv.description || "").trim(),
    message: (inv.message || "").trim(),
    bibleVerseRw: (inv.bible_verse_rw || inv.bible_verse || "").trim(),
    bibleVerseEn: (inv.bible_verse_en || inv.bible_verse || "").trim(),
    familyIntroRw: familyRw,
    familyIntroEn: familyEn,
    events: (inv.program_events || []).filter((e) => e.event || e.time || e.location || e.event_en || e.time_en || e.location_en),
    invitationNote: (inv.invitation_note || "").trim(),
    invitationNoteEn: ("invitation_note_en" in inv ? inv.invitation_note_en : "")?.trim() || "",
    closingRw: (inv.message || "").trim(),
    closingEn: (inv.rsvp_details || "").trim(),
    dressCode: (inv.dress_code || "").trim(),
    rsvpDetails: (inv.rsvp_details || "").trim(),
    websiteUrl,
    qrUrl: websiteUrl,
    brideContacts: inv.bride_contacts || [],
    groomContacts: inv.groom_contacts || [],
  };
}

export function invitationToForm(inv: Invitation): InvitationFormState {
  return {
    ...EMPTY_INV,
    title: inv.title || "Wedding Invitation",
    couple_names: inv.couple_names || "",
    couple_names_en: inv.couple_names_en || "",
    wedding_date: inv.wedding_date || "",
    wedding_date_en: inv.wedding_date_en || "",
    wedding_time: inv.wedding_time || "",
    venue: inv.venue || "",
    message: inv.message || "",
    rsvp_details: inv.rsvp_details || "",
    dress_code: inv.dress_code || "",
    theme: inv.theme || "",
    tone: inv.tone || "formal",
    template_style: inv.template_style || "traditional",
    bible_verse: inv.bible_verse || "",
    bible_verse_rw: inv.bible_verse_rw || "",
    bible_verse_en: inv.bible_verse_en || "",
    description: inv.description || "",
    description_rw: inv.description_rw || "",
    program_events: inv.program_events?.length ? inv.program_events : [{ ...EMPTY_PROGRAM_EVENT }, { ...EMPTY_PROGRAM_EVENT }, { ...EMPTY_PROGRAM_EVENT }],
    invitation_note: inv.invitation_note || "",
    invitation_note_en: inv.invitation_note_en || "",
    couple_contact: inv.couple_contact || "",
    color_theme: resolveTemplateId(inv.color_theme),
    groom_family_name: inv.groom_family_name || "",
    bride_family_name: inv.bride_family_name || "",
    represented_by: inv.represented_by || "",
    groom_represented_by: inv.groom_represented_by || "",
    bride_represented_by: inv.bride_represented_by || "",
    bride_contacts: inv.bride_contacts || [],
    groom_contacts: inv.groom_contacts || [],
  };
}

export function prefillFromWedding(wedding?: { couple_name?: string; wedding_date?: string; venue?: string } | null): Partial<InvitationFormState> {
  if (!wedding) return {};
  let date = wedding.wedding_date || "";
  if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
    try {
      date = new Date(date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    } catch { /* keep */ }
  }
  return {
    couple_names: wedding.couple_name || "",
    couple_names_en: wedding.couple_name || "",
    wedding_date: date,
    wedding_date_en: date,
    venue: wedding.venue || "",
  };
}

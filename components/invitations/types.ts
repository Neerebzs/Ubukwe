export type InvitationTemplateId = "rose_triptych" | "bilingual_gold" | "sage_botanical" | "linen_rings" | "olive_terrace";

export interface ProgramEvent {
  time: string;
  event: string;
  location: string;
  time_en?: string;
  event_en?: string;
  location_en?: string;
}

export interface ContactPerson {
  name: string;
  phones: string[];
}

export interface Invitation {
  id: string;
  title: string;
  couple_names: string;
  couple_names_en?: string;
  wedding_date: string;
  wedding_date_en?: string;
  wedding_time?: string;
  venue?: string;
  message?: string;
  rsvp_details?: string;
  dress_code?: string;
  theme?: string;
  tone?: string;
  template_style?: string;
  bible_verse?: string;
  bible_verse_rw?: string;
  bible_verse_en?: string;
  description?: string;
  description_rw?: string;
  program_events?: ProgramEvent[];
  invitation_note?: string;
  invitation_note_en?: string;
  couple_contact?: string;
  color_theme?: string;
  groom_family_name?: string;
  bride_family_name?: string;
  represented_by?: string;
  groom_represented_by?: string;
  bride_represented_by?: string;
  bride_contacts?: ContactPerson[];
  groom_contacts?: ContactPerson[];
  is_ai_generated: boolean;
  is_selected?: boolean;
}

export interface InvitationFormState {
  title: string;
  couple_names: string;
  couple_names_en: string;
  wedding_date: string;
  wedding_date_en: string;
  wedding_time: string;
  venue: string;
  message: string;
  rsvp_details: string;
  dress_code: string;
  theme: string;
  tone: string;
  template_style: string;
  bible_verse: string;
  bible_verse_rw: string;
  bible_verse_en: string;
  description: string;
  description_rw: string;
  program_events: ProgramEvent[];
  invitation_note: string;
  invitation_note_en: string;
  couple_contact: string;
  color_theme: InvitationTemplateId;
  groom_family_name: string;
  bride_family_name: string;
  represented_by: string;
  groom_represented_by: string;
  bride_represented_by: string;
  bride_contacts: ContactPerson[];
  groom_contacts: ContactPerson[];
}

export interface InvitationContent {
  coupleNames: string;
  leftName: string;
  rightName: string;
  leftNameRw: string;
  rightNameRw: string;
  leftNameEn: string;
  rightNameEn: string;
  leftFirst: string;
  leftLast: string;
  rightFirst: string;
  rightLast: string;
  weddingDate: string;
  weddingDateEn: string;
  weddingTime: string;
  venue: string;
  description: string;
  message: string;
  bibleVerseRw: string;
  bibleVerseEn: string;
  familyIntroRw: string;
  familyIntroEn: string;
  events: ProgramEvent[];
  invitationNote: string;
  invitationNoteEn: string;
  closingRw: string;
  closingEn: string;
  dressCode: string;
  rsvpDetails: string;
  websiteUrl: string;
  qrUrl: string;
  brideContacts: ContactPerson[];
  groomContacts: ContactPerson[];
}

export interface InvitationTemplateMeta {
  id: InvitationTemplateId;
  name: string;
  category: string;
  description: string;
}

export type PreviewSize = "desktop" | "mobile";

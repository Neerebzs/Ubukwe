"use client";

import type { InvitationContent, ProgramEvent } from "../types";
import { eventInLang } from "../content";
import { InvitationQr, LinenFloral, WeddingRings } from "../ornaments";
import { LINEN } from "../palettes";

function Events({ events, lang }: { events: ProgramEvent[]; lang: "rw" | "en" }) {
  const shown = events.map((ev) => eventInLang(ev, lang)).filter((ev) => ev.time || ev.event || ev.location);
  if (!shown.length) return null;
  return (
    <div className="space-y-3 pt-1">
      {shown.map((ev, i) => (
        <div key={i} className="space-y-0.5">
          {ev.time && <p className="inv-serif text-[12px] font-bold inv-wrap">{ev.time}</p>}
          {ev.event && <p className="inv-body text-[11px] leading-relaxed whitespace-pre-line inv-wrap">{ev.event}</p>}
          {ev.location && <p className="inv-serif text-[11px] font-bold uppercase tracking-wide whitespace-pre-line inv-wrap">{ev.location}</p>}
        </div>
      ))}
    </div>
  );
}

function Card({
  heading,
  subject,
  description,
  leftName,
  rightName,
  date,
  events,
  eventsLang,
  conclusion,
  note,
}: {
  heading: string;
  subject: string;
  description: string;
  leftName: string;
  rightName: string;
  date: string;
  events: ProgramEvent[];
  eventsLang: "rw" | "en";
  conclusion: string;
  note: string;
}) {
  return (
    <article
      className="relative bg-white px-6 py-7 text-center space-y-3 min-w-0"
      style={{
        border: `1px solid ${LINEN.ink}99`,
        boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
        color: LINEN.ink,
      }}
    >
      <p className="inv-serif font-bold tracking-[0.18em] uppercase text-[13px]">{heading}</p>
      {subject && <p className="inv-body italic text-[10px] leading-relaxed whitespace-pre-line inv-wrap">{subject}</p>}
      {description && <p className="inv-body text-[11px] leading-relaxed whitespace-pre-line inv-wrap">{description}</p>}
      <p className="inv-serif font-bold text-[15px] tracking-wide inv-wrap">{leftName}</p>
      {(leftName || rightName) && <WeddingRings className="mx-auto h-5 w-10" />}
      <p className="inv-serif font-bold text-[15px] tracking-wide inv-wrap">{rightName}</p>
      {date && <p className="inv-serif text-[12px] font-bold whitespace-pre-line inv-wrap">{date}</p>}
      <Events events={events} lang={eventsLang} />
      {conclusion && <p className="inv-body text-[11px] leading-relaxed whitespace-pre-line inv-wrap">{conclusion}</p>}
      {note && <p className="inv-body italic text-[11px] whitespace-pre-line inv-wrap">{note}</p>}
    </article>
  );
}

export function LinenRingsTemplate({ content }: { content: InvitationContent }) {
  return (
    <div className="relative overflow-hidden px-5 py-8 md:px-8 md:py-10" style={{ background: LINEN.bg }}>
      <LinenFloral className="absolute top-0 right-0 w-36 h-36 opacity-80 pointer-events-none" />
      <LinenFloral className="absolute bottom-0 left-0 w-36 h-36 opacity-80 pointer-events-none scale-[-1]" />
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <Card
          heading="Ubutumire"
          subject={content.bibleVerseRw}
          description={content.familyIntroRw}
          leftName={content.leftNameRw}
          rightName={content.rightNameRw}
          date={content.weddingDate}
          events={content.events}
          eventsLang="rw"
          conclusion={content.invitationNote}
          note={content.closingRw}
        />
        <Card
          heading="Invitation"
          subject={content.bibleVerseEn}
          description={content.familyIntroEn}
          leftName={content.leftNameEn}
          rightName={content.rightNameEn}
          date={content.weddingDateEn}
          events={content.events}
          eventsLang="en"
          conclusion={content.invitationNoteEn}
          note={content.closingEn}
        />
      </div>
      <div className="relative flex justify-center pt-6">
        <InvitationQr value={content.qrUrl} color={LINEN.ink} size={88} />
      </div>
    </div>
  );
}

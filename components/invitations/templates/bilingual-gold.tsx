"use client";

import type { InvitationContent, ProgramEvent } from "../types";
import { eventInLang } from "../content";
import { GoldFlourish, GoldHeartRule, InvitationQr, LineArtCorner, NameFlourish } from "../ornaments";
import { BILINGUAL } from "../palettes";

const GREEN = BILINGUAL.green;
const INK = BILINGUAL.ink;

function NamedCouple({
  first,
  last,
}: {
  first: string;
  last: string;
}) {
  return (
    <div className="py-1">
      <p className="inv-script inv-wrap text-[34px] leading-none" style={{ color: GREEN }}>{first}</p>
      {last && (
        <p className="inv-serif font-bold tracking-[0.12em] uppercase text-[13px] mt-1 inv-wrap" style={{ color: GREEN }}>
          {last}
        </p>
      )}
    </div>
  );
}

function Events({ events, lang }: { events: ProgramEvent[]; lang: "rw" | "en" }) {
  const shown = events.map((ev) => eventInLang(ev, lang)).filter((ev) => ev.time || ev.event || ev.location);
  if (!shown.length) return null;
  return (
    <div className="space-y-3 pt-1">
      {shown.map((ev, i) => (
        <div key={i} className="space-y-0.5">
          {ev.time && <p className="inv-serif font-bold text-[12px]" style={{ color: INK }}>{ev.time}</p>}
          {ev.event && <p className="inv-body text-[11px] whitespace-pre-line inv-wrap" style={{ color: INK }}>{ev.event}</p>}
          {ev.location && (
            <p className="inv-serif font-bold uppercase tracking-[0.08em] text-[11px] inv-wrap" style={{ color: INK }}>
              {ev.location}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function Column({
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
  const left = leftName.trim().split(/\s+/);
  const right = rightName.trim().split(/\s+/);
  const leftFirst = left.slice(0, -1).join(" ") || leftName;
  const leftLast = left.length > 1 ? left[left.length - 1] : "";
  const rightFirst = right.slice(0, -1).join(" ") || rightName;
  const rightLast = right.length > 1 ? right[right.length - 1] : "";
  return (
    <div className="px-6 py-8 text-center space-y-3">
      <p className="inv-script text-[36px] leading-none" style={{ color: GREEN }}>{heading}</p>
      {subject && (
        <p className="inv-body italic text-[10px] leading-relaxed whitespace-pre-line inv-wrap" style={{ color: INK }}>
          {subject}
        </p>
      )}
      {description && <p className="inv-body text-[11px] leading-relaxed whitespace-pre-line inv-wrap" style={{ color: INK }}>{description}</p>}
      <NamedCouple first={leftFirst} last={leftLast} />
      <NameFlourish color={BILINGUAL.gold} />
      <NamedCouple first={rightFirst} last={rightLast} />
      {date && <p className="inv-serif font-bold text-[13px] tracking-wide whitespace-pre-line" style={{ color: INK }}>{date}</p>}
      <Events events={events} lang={eventsLang} />
      {conclusion && (
        <p className="inv-body text-[11px] whitespace-pre-line inv-wrap" style={{ color: INK }}>{conclusion}</p>
      )}
      {note && <p className="inv-body italic text-[11px] whitespace-pre-line inv-wrap" style={{ color: INK }}>{note}</p>}
    </div>
  );
}

export function BilingualGoldTemplate({ content }: { content: InvitationContent }) {
  return (
    <div className="relative overflow-hidden" style={{ background: BILINGUAL.bg }}>
      <LineArtCorner className="absolute top-0 left-0 w-28 h-28 opacity-70" />
      <LineArtCorner className="absolute top-0 right-0 w-28 h-28 opacity-70 scale-x-[-1]" />
      <LineArtCorner className="absolute bottom-0 left-0 w-28 h-28 opacity-70 scale-y-[-1]" />
      <LineArtCorner className="absolute bottom-0 right-0 w-28 h-28 opacity-70 scale-[-1]" />

      <div className="relative grid grid-cols-1 md:grid-cols-2">
        <div className="hidden md:flex absolute inset-y-10 left-1/2 -translate-x-1/2 flex-col items-center pointer-events-none">
          <GoldFlourish className="h-full w-10" />
        </div>
        <Column
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
        <Column
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

      <div className="relative pb-8 pt-2">
        <GoldHeartRule />
        <InvitationQr value={content.qrUrl} size={92} />
      </div>
    </div>
  );
}

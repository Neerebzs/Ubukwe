"use client";

import type { InvitationContent, ProgramEvent } from "../types";
import { eventInLang } from "../content";
import { InvitationQr, SageSpray } from "../ornaments";
import { SAGE } from "../palettes";

function Events({ events, lang }: { events: ProgramEvent[]; lang: "rw" | "en" }) {
  const shown = events.map((ev) => eventInLang(ev, lang)).filter((ev) => ev.time || ev.event || ev.location);
  if (!shown.length) return null;
  return (
    <div className="space-y-3 pt-1">
      {shown.map((ev, i) => (
        <div key={i} className="space-y-0.5">
          {ev.time && <p className="inv-sans text-[12px] font-bold" style={{ color: SAGE.ink }}>{ev.time}</p>}
          {ev.event && <p className="inv-sans text-[11px] whitespace-pre-line inv-wrap" style={{ color: SAGE.ink }}>{ev.event}</p>}
          {ev.location && (
            <p className="inv-sans font-bold uppercase tracking-[0.06em] text-[11px] whitespace-pre-line inv-wrap" style={{ color: SAGE.ink }}>{ev.location}</p>
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
  return (
    <div className="px-8 py-12 text-center space-y-3 min-w-0">
      <p className="inv-serif font-bold text-[28px] tracking-tight inv-wrap" style={{ color: SAGE.green }}>{heading}</p>
      {subject && (
        <p className="inv-body italic text-[10px] leading-relaxed whitespace-pre-line inv-wrap" style={{ color: SAGE.ink }}>{subject}</p>
      )}
      {description && <p className="inv-sans text-[11px] leading-relaxed whitespace-pre-line inv-wrap" style={{ color: SAGE.ink }}>{description}</p>}
      <div className="py-2 space-y-1">
        <p className="inv-sans font-bold uppercase tracking-[0.08em] text-[18px] leading-tight inv-wrap" style={{ color: SAGE.green }}>
          {leftName}
        </p>
        {(leftName || rightName) && (
          <p className="inv-serif text-[28px] leading-none" style={{ color: SAGE.green }}>&amp;</p>
        )}
        <p className="inv-sans font-bold uppercase tracking-[0.08em] text-[18px] leading-tight inv-wrap" style={{ color: SAGE.green }}>
          {rightName}
        </p>
      </div>
      {date && <p className="inv-sans text-[12px] font-bold whitespace-pre-line inv-wrap" style={{ color: SAGE.ink }}>{date}</p>}
      <Events events={events} lang={eventsLang} />
      {conclusion && (
        <p className="inv-sans text-[11px] leading-relaxed whitespace-pre-line inv-wrap pt-1" style={{ color: SAGE.ink }}>{conclusion}</p>
      )}
      {note && (
        <p className="inv-sans italic font-semibold text-[11px] whitespace-pre-line inv-wrap" style={{ color: SAGE.ink }}>{note}</p>
      )}
    </div>
  );
}

export function SageBotanicalTemplate({ content }: { content: InvitationContent }) {
  return (
    <div className="relative overflow-hidden" style={{ background: SAGE.bg, color: SAGE.ink }}>
      <SageSpray className="absolute top-0 left-0 w-[42%] max-w-[280px] pointer-events-none" />
      <SageSpray className="absolute top-0 right-0 w-[42%] max-w-[280px] pointer-events-none scale-x-[-1]" />
      <SageSpray className="absolute bottom-0 left-0 w-[46%] max-w-[300px] pointer-events-none scale-y-[-1]" />
      <SageSpray className="absolute bottom-0 right-0 w-[46%] max-w-[300px] pointer-events-none scale-[-1]" />

      <div className="relative grid grid-cols-1 md:grid-cols-2">
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

      <div className="relative flex justify-center px-8 pb-8 pt-2">
        <InvitationQr value={content.qrUrl} color={SAGE.leafDark} size={88} />
      </div>
    </div>
  );
}

"use client";

import type { ContactPerson, InvitationContent, ProgramEvent } from "../types";
import { eventInLang } from "../content";
import { OliveChurchIcon, OliveDancerIcon, OliveFern, OliveFlower, OliveGlassesIcon } from "../ornaments";
import { OLIVE } from "../palettes";

const ICONS = [OliveDancerIcon, OliveChurchIcon, OliveGlassesIcon];

function splitVenue(venue: string): { script: string; line: string } {
  const parts = (venue || "").split(/\n+/).map((s) => s.trim()).filter(Boolean);
  return { script: parts[0] || "", line: parts.slice(1).join(" ") };
}

function Schedule({ events }: { events: ProgramEvent[] }) {
  const shown = events
    .map((ev) => {
      const rw = eventInLang(ev, "rw");
      return rw.time || rw.event || rw.location ? rw : eventInLang(ev, "en");
    })
    .filter((ev) => ev.time || ev.event || ev.location);
  if (!shown.length) return null;
  return (
    <div className="grid gap-2 px-2" style={{ gridTemplateColumns: `repeat(${Math.min(shown.length, 3)}, minmax(0, 1fr))` }}>
      {shown.slice(0, 3).map((ev, i) => {
        const Icon = ICONS[i] || OliveDancerIcon;
        const lines = [ev.event, ev.location].filter(Boolean);
        return (
          <div key={i} className="text-center space-y-1 min-w-0">
            <Icon />
            {ev.time && <p className="inv-sans text-[10px] tracking-wide inv-wrap">{ev.time}</p>}
            {lines.map((line, li) => (
              <p key={li} className="inv-serif text-[10px] leading-snug whitespace-pre-line inv-wrap">{line}</p>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ContactCol({ people }: { people: ContactPerson[] }) {
  const list = people.filter((p) => p.name || (p.phones || []).some(Boolean));
  if (!list.length) return <div />;
  return (
    <div className="space-y-1 min-w-0">
      {list.map((p, i) => (
        <p key={i} className="inv-sans text-[9px] leading-relaxed inv-wrap">
          {[p.name, ...(p.phones || []).filter(Boolean)].join(" ")}
        </p>
      ))}
    </div>
  );
}

export function OliveTerraceTemplate({ content }: { content: InvitationContent }) {
  const verse = content.bibleVerseRw || content.bibleVerseEn;
  const intro = content.familyIntroRw || content.familyIntroEn;
  const left = content.leftNameRw || content.leftNameEn;
  const right = content.rightNameRw || content.rightNameEn;
  const date = content.weddingDate || content.weddingDateEn;
  const venue = splitVenue(content.venue);
  const leftContacts = content.brideContacts || [];
  const rightContacts = content.groomContacts || [];
  const hasContacts = leftContacts.some((p) => p.name || (p.phones || []).some(Boolean))
    || rightContacts.some((p) => p.name || (p.phones || []).some(Boolean));

  return (
    <div className="relative flex min-h-[720px]" style={{ color: OLIVE.ink, background: OLIVE.bg }}>
      <aside className="relative w-[28%] min-w-[108px] overflow-hidden">
        <img src="/invitations/olive-hills.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        {date && (
          <p
            className="absolute right-1 top-1/2 inv-script text-[22px] leading-none whitespace-nowrap"
            style={{
              writingMode: "vertical-rl",
              transform: "translateY(-50%) rotate(180deg)",
              textShadow: "0 1px 8px rgba(0,0,0,0.35)",
            }}
          >
            {date}
          </p>
        )}
      </aside>

      <div className="relative flex-1 px-5 py-7 text-center" style={{ background: OLIVE.bg }}>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 0.6px, transparent 0.6px)",
            backgroundSize: "3px 3px",
          }}
        />
        <OliveFern className="absolute top-2 right-1 w-24 h-16 opacity-80 pointer-events-none" />
        <OliveFlower className="absolute bottom-3 right-2 w-10 h-14 opacity-90 pointer-events-none" />

        <div className="relative space-y-4">
          {verse && (
            <p className="inv-sans text-[9px] leading-relaxed whitespace-pre-line inv-wrap px-2">{verse}</p>
          )}
          {intro && (
            <p className="inv-serif text-[11px] leading-relaxed whitespace-pre-line inv-wrap px-1">{intro}</p>
          )}
          <div className="space-y-1 py-1">
            <p className="inv-serif font-semibold uppercase tracking-[0.06em] text-[22px] leading-tight inv-wrap">{left}</p>
            {(left || right) && (
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-white/80" />
                <span className="inv-script text-[26px] leading-none">Na</span>
                <span className="h-px w-10 bg-white/80" />
              </div>
            )}
            <p className="inv-serif font-semibold uppercase tracking-[0.06em] text-[22px] leading-tight inv-wrap">{right}</p>
          </div>

          <Schedule events={content.events} />

          {(venue.script || venue.line) && (
            <div className="pt-1">
              {venue.script && <p className="inv-script text-[42px] leading-none inv-wrap">{venue.script}</p>}
              {venue.line && (
                <p className="inv-sans uppercase tracking-[0.22em] text-[11px] mt-1 inv-wrap">{venue.line}</p>
              )}
            </div>
          )}

          {hasContacts && (
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 pt-3 px-1 text-left">
              <ContactCol people={leftContacts} />
              <div className="w-px self-stretch bg-white/70" />
              <ContactCol people={rightContacts} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

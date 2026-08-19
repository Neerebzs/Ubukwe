"use client";

import type { ReactNode } from "react";
import type { InvitationContent } from "../types";
import { FloralDivider, InvitationQr, RoseCorner } from "../ornaments";
import { ROSE } from "../palettes";

function PinkTitle({ children }: { children: string }) {
  return (
    <h3 className="inv-script text-[32px] leading-none inv-wrap" style={{ color: ROSE.pink }}>
      {children}
    </h3>
  );
}

function Body({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`inv-body text-[11px] leading-relaxed inv-wrap ${className}`} style={{ color: ROSE.ink }}>
      {children}
    </p>
  );
}

export function RoseTriptychTemplate({ content }: { content: InvitationContent }) {

  return (
    <div className="relative overflow-hidden" style={{ background: ROSE.bg, color: ROSE.ink }}>
      <RoseCorner className="absolute top-0 left-0 w-[42%] max-w-[260px] pointer-events-none" />
      <RoseCorner className="absolute bottom-0 right-0 w-[42%] max-w-[260px] pointer-events-none rotate-180" />

      <div className="relative grid grid-cols-1 md:grid-cols-3 min-h-[520px]">
        <section className="px-8 py-14 text-center flex flex-col items-center">
          <PinkTitle>The Details</PinkTitle>
          <FloralDivider />
          <PinkTitle>Ceremony and Reception</PinkTitle>
          <div className="mt-3 space-y-1">
            {content.events.slice(0, 2).map((raw, i) => {
              const ev = { time: raw.time_en || raw.time, event: raw.event_en || raw.event, location: raw.location_en || raw.location };
              if (!ev.time && !ev.event && !ev.location) return null;
              return (
                <div key={i} className="space-y-0.5">
                  {ev.event && <Body>{ev.event}</Body>}
                  {ev.time && <Body>{ev.time}</Body>}
                  {ev.location && <Body className="font-semibold">{ev.location}</Body>}
                </div>
              );
            })}
          </div>
          <FloralDivider />
          <PinkTitle>Reception</PinkTitle>
          {(content.invitationNoteEn || content.invitationNote) && (
            <Body className="mt-3 max-w-[220px]">{content.invitationNoteEn || content.invitationNote}</Body>
          )}
        </section>

        <section className="px-6 py-14 text-center flex flex-col items-center justify-center">
          {content.familyIntroEn && <Body className="tracking-[0.04em] whitespace-pre-line">{content.familyIntroEn}</Body>}
          <p className="inv-script inv-wrap text-[42px] md:text-[48px] mt-4 leading-[0.95]" style={{ color: ROSE.green }}>
            {content.leftNameEn || content.leftName}
          </p>
          {(content.leftNameEn || content.leftName) && (content.rightNameEn || content.rightName) && (
            <p className="inv-body text-[11px] tracking-[0.28em] my-2" style={{ color: ROSE.green }}>AND</p>
          )}
          <p className="inv-script inv-wrap text-[42px] md:text-[48px] leading-[0.95]" style={{ color: ROSE.green }}>
            {content.rightNameEn || content.rightName}
          </p>
          {(content.weddingDateEn || content.weddingDate) && <Body className="whitespace-pre-line">{content.weddingDateEn || content.weddingDate}</Body>}
          <FloralDivider />
          {(content.closingEn || content.closingRw) && <Body>{content.closingEn || content.closingRw}</Body>}
        </section>

        <section className="px-8 py-14 text-center flex flex-col items-center">
          <PinkTitle>More Information</PinkTitle>
          <div className="mt-5">
            <InvitationQr value={content.qrUrl} color={ROSE.green} size={108} />
          </div>
        </section>
      </div>
    </div>
  );
}

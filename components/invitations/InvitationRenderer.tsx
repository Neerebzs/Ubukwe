"use client";

import { cn } from "@/lib/utils";
import "./fonts.css";
import { buildInvitationContent } from "./content";
import { renderInvitationTemplate } from "./registry";
import type { Invitation, InvitationFormState, InvitationTemplateId, PreviewSize } from "./types";

export function InvitationRenderer({
  source,
  templateId,
  websiteUrl,
  size = "desktop",
  className,
}: {
  source: Partial<Invitation> | InvitationFormState;
  templateId: InvitationTemplateId;
  websiteUrl?: string;
  size?: PreviewSize | "thumb";
  className?: string;
}) {
  const content = buildInvitationContent(source, websiteUrl || "");
  const isThumb = size === "thumb";
  const isMobile = size === "mobile";
  const wide = (templateId === "rose_triptych" || templateId === "sage_botanical" || templateId === "linen_rings") && !isMobile;

  return (
    <div className={cn("inv-root mx-auto", isThumb ? "w-[920px]" : wide ? "w-full max-w-[980px]" : "w-full max-w-[640px]", className)}>
      <div className="shadow-[0_16px_40px_rgba(40,30,10,0.14)] overflow-hidden bg-white">
        {renderInvitationTemplate(templateId, content)}
      </div>
    </div>
  );
}

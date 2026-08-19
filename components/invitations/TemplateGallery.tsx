"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { INVITATION_TEMPLATES } from "./registry";
import { InvitationRenderer } from "./InvitationRenderer";
import type { InvitationFormState, InvitationTemplateId } from "./types";

export function TemplateGallery({
  selectedId,
  onSelect,
  previewSource,
  websiteUrl,
}: {
  selectedId: InvitationTemplateId;
  onSelect: (id: InvitationTemplateId) => void;
  previewSource: InvitationFormState;
  websiteUrl?: string;
}) {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {INVITATION_TEMPLATES.map((tpl) => {
        const selected = tpl.id === selectedId;
        return (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onSelect(tpl.id)}
            className={cn(
              "text-left rounded-2xl overflow-hidden border bg-white shadow-sm transition-all",
                selected ? "border-slate-800 ring-2 ring-slate-800/15" : "border-slate-100 hover:border-slate-300 hover:shadow-md",
            )}
          >
            <div className="relative h-52 bg-[#f7f4ee] overflow-hidden">
              <div className="absolute inset-x-0 top-3 origin-top scale-[0.34] pointer-events-none">
                <InvitationRenderer source={previewSource} templateId={tpl.id} websiteUrl={websiteUrl} size="thumb" />
              </div>
              {selected && (
                <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1">
                  <Check className="h-3 w-3" /> Selected
                </span>
              )}
            </div>
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{tpl.category}</p>
              <h4 className="font-serif italic text-xl text-slate-800 mt-0.5">{tpl.name}</h4>
              <p className="text-sm text-slate-500 mt-1">{tpl.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

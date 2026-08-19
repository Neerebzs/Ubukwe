import { createElement, type ReactNode } from "react";
import type { InvitationContent, InvitationTemplateId, InvitationTemplateMeta } from "./types";
import { RoseTriptychTemplate } from "./templates/rose-triptych";
import { BilingualGoldTemplate } from "./templates/bilingual-gold";
import { SageBotanicalTemplate } from "./templates/sage-botanical";
import { LinenRingsTemplate } from "./templates/linen-rings";
import { OliveTerraceTemplate } from "./templates/olive-terrace";

export const INVITATION_TEMPLATES: InvitationTemplateMeta[] = [
  {
    id: "rose_triptych",
    name: "Rose Garden",
    category: "Floral",
    description: "Three-panel watercolor roses with dusty pink script",
  },
  {
    id: "bilingual_gold",
    name: "Ubutumire Gold",
    category: "Traditional",
    description: "Kinyarwanda and English columns with gold ornament",
  },
  {
    id: "sage_botanical",
    name: "Sage Botanical",
    category: "Floral",
    description: "Landscape bilingual card with eucalyptus corners",
  },
  {
    id: "linen_rings",
    name: "Linen & Rings",
    category: "Classic",
    description: "Two white cards on linen with gold line-art lilies",
  },
  {
    id: "olive_terrace",
    name: "Olive Terrace",
    category: "Landscape",
    description: "Olive panel with terraced hills and ceremony icons",
  },
];

const RENDERERS: Record<InvitationTemplateId, (content: InvitationContent) => ReactNode> = {
  rose_triptych: (c) => createElement(RoseTriptychTemplate, { content: c }),
  bilingual_gold: (c) => createElement(BilingualGoldTemplate, { content: c }),
  sage_botanical: (c) => createElement(SageBotanicalTemplate, { content: c }),
  linen_rings: (c) => createElement(LinenRingsTemplate, { content: c }),
  olive_terrace: (c) => createElement(OliveTerraceTemplate, { content: c }),
};

export function getTemplateMeta(id: InvitationTemplateId): InvitationTemplateMeta {
  return INVITATION_TEMPLATES.find((t) => t.id === id) || INVITATION_TEMPLATES[0];
}

export function renderInvitationTemplate(id: InvitationTemplateId, content: InvitationContent) {
  return RENDERERS[id](content);
}

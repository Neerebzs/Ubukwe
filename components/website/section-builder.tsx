"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GripVertical, Eye, EyeOff, Copy, Trash2, RotateCcw,
  ChevronUp, ChevronDown, Loader2, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiClient, WeddingWebsite, WeddingWebsiteSection } from "@/lib/api";
import { queryKeys } from "@/lib/cache";
import { toast } from "sonner";

const ADDABLE_SECTIONS = [
  { type: "hero", label: "Hero Banner" },
  { type: "couple_profile", label: "Bride & Groom" },
  { type: "love_story", label: "Love Story" },
  { type: "proposal_story", label: "Proposal Story" },
  { type: "countdown", label: "Countdown" },
  { type: "event_schedule", label: "Event Schedule" },
  { type: "venue", label: "Venue" },
  { type: "venue_map", label: "Venue Map" },
  { type: "accommodation", label: "Accommodation" },
  { type: "dress_code", label: "Dress Code" },
  { type: "registry", label: "Gift Registry" },
  { type: "gallery", label: "Gallery" },
  { type: "wedding_party", label: "Wedding Party" },
  { type: "faq", label: "FAQ" },
  { type: "rsvp", label: "RSVP" },
  { type: "guestbook", label: "Guestbook" },
  { type: "contact", label: "Contact" },
  { type: "footer", label: "Footer" },
];

function unwrapData<T>(response: { data?: T } | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

function SectionContentEditor({
  section,
  onChange,
}: {
  section: WeddingWebsiteSection;
  onChange: (content: Record<string, unknown>) => void;
}) {
  const content = section.content || {};

  if (section.section_type === "hero") {
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Headline</Label>
          <Input
            value={(content.headline as string) || ""}
            onChange={(e) => onChange({ ...content, headline: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">Subheadline</Label>
          <Input
            value={(content.subheadline as string) || ""}
            onChange={(e) => onChange({ ...content, subheadline: e.target.value })}
          />
        </div>
      </div>
    );
  }

  if (section.section_type === "venue") {
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Venue Name</Label>
          <Input
            value={(content.venue_name as string) || ""}
            onChange={(e) => onChange({ ...content, venue_name: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">Address</Label>
          <Textarea
            value={(content.address as string) || ""}
            onChange={(e) => onChange({ ...content, address: e.target.value })}
            rows={2}
          />
        </div>
        <div>
          <Label className="text-xs">Directions / Notes</Label>
          <Textarea
            value={(content.notes as string) || ""}
            onChange={(e) => onChange({ ...content, notes: e.target.value })}
            rows={2}
          />
        </div>
        <div>
          <Label className="text-xs">Parking</Label>
          <Input
            value={(content.parking as string) || ""}
            onChange={(e) => onChange({ ...content, parking: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">Nearby Hotels</Label>
          <Textarea
            value={(content.hotels as string) || ""}
            onChange={(e) => onChange({ ...content, hotels: e.target.value })}
            rows={2}
          />
        </div>
      </div>
    );
  }

  if (section.section_type === "rsvp") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs">RSVP Enabled</Label>
          <Switch
            checked={content.enabled !== false}
            onCheckedChange={(v) => onChange({ ...content, enabled: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Allow Plus One</Label>
          <Switch
            checked={content.allow_plus_one !== false}
            onCheckedChange={(v) => onChange({ ...content, allow_plus_one: v })}
          />
        </div>
      </div>
    );
  }

  if (section.section_type === "love_story" || section.section_type === "couple_profile") {
    return (
      <div>
        <Label className="text-xs">Story Text</Label>
        <Textarea
          value={(content.story as string) || (content.text as string) || ""}
          onChange={(e) => onChange({ ...content, story: e.target.value })}
          rows={4}
        />
      </div>
    );
  }

  if (section.section_type === "contact") {
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Intro Message</Label>
          <Input
            value={(content.message as string) || ""}
            onChange={(e) => onChange({ ...content, message: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">Email</Label>
          <Input
            value={(content.email as string) || ""}
            onChange={(e) => onChange({ ...content, email: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">Phone</Label>
          <Input
            value={(content.phone as string) || ""}
            onChange={(e) => onChange({ ...content, phone: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">WhatsApp</Label>
          <Input
            value={(content.whatsapp as string) || ""}
            onChange={(e) => onChange({ ...content, whatsapp: e.target.value })}
            placeholder="+250..."
          />
        </div>
      </div>
    );
  }

  return (
    <p className="text-xs text-slate-400 italic">
      Content editor for &ldquo;{section.section_type}&rdquo; — customize via couple profile or advanced editor in a later phase.
    </p>
  );
}

interface SectionBuilderProps {
  weddingId: string;
  website: WeddingWebsite;
  onWebsiteChange?: (website: WeddingWebsite) => void;
}

export function SectionBuilder({ weddingId, website, onWebsiteChange }: SectionBuilderProps) {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState<WeddingWebsiteSection[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const active = (website.sections || [])
      .filter((s) => !s.deleted_at)
      .sort((a, b) => a.sort_order - b.sort_order);
    setSections(active);
  }, [website.sections]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.website(weddingId) });

  const { data: trashData } = useQuery({
    queryKey: [...queryKeys.wedding.website(weddingId), "trash"],
    queryFn: async () => {
      const res = await apiClient.website.listTrash<WeddingWebsiteSection[]>(weddingId);
      return unwrapData(res) || [];
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => apiClient.website.reorderSections(weddingId, ids),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Failed to reorder sections"),
  });

  const toggleVisibility = useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) =>
      apiClient.website.updateSection(weddingId, id, { is_visible: visible }),
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.website.deleteSection(weddingId, id),
    onSuccess: () => {
      toast.success("Section removed");
      invalidate();
      queryClient.invalidateQueries({ queryKey: [...queryKeys.wedding.website(weddingId), "trash"] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => apiClient.website.duplicateSection(weddingId, id),
    onSuccess: () => {
      toast.success("Section duplicated");
      invalidate();
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => apiClient.website.restoreSection(weddingId, id),
    onSuccess: () => {
      toast.success("Section restored");
      invalidate();
      queryClient.invalidateQueries({ queryKey: [...queryKeys.wedding.website(weddingId), "trash"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (sectionType: string) =>
      apiClient.website.createSection<WeddingWebsiteSection>(weddingId, { section_type: sectionType }),
    onSuccess: () => {
      toast.success("Section added");
      invalidate();
    },
  });

  const debouncedSaveContent = useCallback(
    (sectionId: string, updates: Record<string, unknown>) => {
      if (saveTimers.current[sectionId]) clearTimeout(saveTimers.current[sectionId]);
      saveTimers.current[sectionId] = setTimeout(async () => {
        try {
          await apiClient.website.updateSection(weddingId, sectionId, updates);
          invalidate();
        } catch {
          toast.error("Auto-save failed");
        }
      }, 2000);
    },
    [weddingId, queryClient]
  );

  const moveSection = (index: number, direction: -1 | 1) => {
    const newSections = [...sections];
    const target = index + direction;
    if (target < 0 || target >= newSections.length) return;
    [newSections[index], newSections[target]] = [newSections[target], newSections[index]];
    setSections(newSections);
    reorderMutation.mutate(newSections.map((s) => s.id));
  };

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    const fromIdx = sections.findIndex((s) => s.id === dragId);
    const toIdx = sections.findIndex((s) => s.id === overId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = [...sections];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setSections(next);
  };
  const handleDragEnd = () => {
    if (dragId) reorderMutation.mutate(sections.map((s) => s.id));
    setDragId(null);
  };

  const trash = trashData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Drag to reorder. Changes auto-save after 2 seconds.
        </p>
        <Select onValueChange={(v) => createMutation.mutate(v)}>
          <SelectTrigger className="w-44">
            <Plus className="h-4 w-4 mr-1" />
            <SelectValue placeholder="Add section" />
          </SelectTrigger>
          <SelectContent>
            {ADDABLE_SECTIONS.map((s) => (
              <SelectItem key={s.type} value={s.type}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {sections.map((section, index) => (
          <div
            key={section.id}
            draggable
            onDragStart={() => handleDragStart(section.id)}
            onDragOver={(e) => handleDragOver(e, section.id)}
            onDragEnd={handleDragEnd}
            className={`rounded-xl border bg-white transition-shadow ${
              dragId === section.id ? "shadow-lg border-[#668c65]/40" : "border-slate-200"
            } ${!section.is_visible ? "opacity-60" : ""}`}
          >
            <div className="flex items-center gap-2 p-3">
              <GripVertical className="h-4 w-4 text-slate-300 cursor-grab flex-shrink-0" aria-hidden />
              <button
                type="button"
                className="flex-1 text-left min-w-0"
                onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}
              >
                <span className="font-medium text-sm capitalize truncate block">
                  {section.title || section.section_type.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-slate-400">{section.section_type}</span>
              </button>
              <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                #{index + 1}
              </Badge>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveSection(index, -1)} disabled={index === 0}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleVisibility.mutate({ id: section.id, visible: !section.is_visible })}
                >
                  {section.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateMutation.mutate(section.id)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteMutation.mutate(section.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {expandedId === section.id && (
              <div className="px-4 pb-4 border-t border-slate-100 pt-4 space-y-3">
                <div>
                  <Label className="text-xs">Section Title</Label>
                  <Input
                    defaultValue={section.title || ""}
                    onChange={(e) => debouncedSaveContent(section.id, { title: e.target.value })}
                  />
                </div>
                <SectionContentEditor
                  section={section}
                  onChange={(content) => debouncedSaveContent(section.id, { content })}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {reorderMutation.isPending && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Saving order...
        </div>
      )}

      {trash.length > 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-4 space-y-2">
          <p className="text-sm font-medium text-slate-600">Removed Sections</p>
          {trash.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <span className="capitalize">{s.title || s.section_type.replace(/_/g, " ")}</span>
              <Button variant="outline" size="sm" onClick={() => restoreMutation.mutate(s.id)}>
                <RotateCcw className="h-3 w-3 mr-1" /> Restore
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

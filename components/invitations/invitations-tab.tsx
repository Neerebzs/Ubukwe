"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Download, Edit, Eye, Heart, Loader2, Monitor, Save, Share2, Smartphone, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EMPTY_INV, invitationToForm, prefillFromWedding, resolveTemplateId } from "./content";
import { InvitationForm } from "./InvitationForm";
import { InvitationRenderer } from "./InvitationRenderer";
import { getTemplateMeta, INVITATION_TEMPLATES } from "./registry";
import { TemplateGallery } from "./TemplateGallery";
import type { Invitation, InvitationFormState, InvitationTemplateId, PreviewSize } from "./types";

export function InvitationsTab({
  weddingId,
  wedding,
  onGoToGuests,
  onShareInvitation,
}: {
  weddingId?: string;
  wedding?: { couple_name?: string; wedding_date?: string; venue?: string } | null;
  onGoToGuests?: () => void;
  onShareInvitation?: (inv: Invitation) => void;
}) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"home" | "editor" | "preview">("home");
  const [form, setForm] = useState<InvitationFormState>({ ...EMPTY_INV, ...prefillFromWedding(wedding) });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<PreviewSize>("desktop");
  const [fullOpen, setFullOpen] = useState(false);
  const [previewInv, setPreviewInv] = useState<Partial<Invitation> | null>(null);

  const templateId = resolveTemplateId(form.color_theme);

  const { data: website } = useQuery<{ slug?: string } | null>({
    queryKey: ["wedding-website", weddingId],
    queryFn: async () => { const res = await apiClient.website.get<{ slug?: string }>(weddingId!); return (res as { data?: { slug?: string } }).data ?? null; },
    enabled: !!weddingId,
  });
  const publicBase = typeof window !== "undefined" ? window.location.origin : "";
  const websiteUrl = website?.slug ? `${publicBase}/w/${website.slug}` : "";

  const { data: invitations = [], isLoading } = useQuery<Invitation[]>({
    queryKey: ["wedding-invitations", weddingId],
    queryFn: async () => { const res = await apiClient.invitations.list<Invitation[]>(weddingId!); return (res as { data?: Invitation[] }).data || []; },
    enabled: !!weddingId,
  });

  const selected = invitations.find((i) => i.is_selected);

  const saveMutation = useMutation({
    mutationFn: (data: InvitationFormState) =>
      editingId ? apiClient.invitations.update(weddingId!, editingId, data) : apiClient.invitations.create(weddingId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding-invitations", weddingId] });
      toast.success(editingId ? "Invitation updated" : "Invitation saved");
      setMode("home");
      setEditingId(null);
    },
    onError: (e: Error) => toast.error(e.message || "Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.invitations.delete(weddingId!, id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wedding-invitations", weddingId] }); toast.success("Deleted"); },
    onError: (e: Error) => toast.error(e.message || "Failed to delete"),
  });

  const selectMutation = useMutation({
    mutationFn: (id: string) => apiClient.invitations.select(weddingId!, id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wedding-invitations", weddingId] }); toast.success("Set as your wedding invitation"); },
    onError: (e: Error) => toast.error(e.message || "Failed to select"),
  });

  const startCreate = (id?: InvitationTemplateId) => {
    setEditingId(null);
    setForm({ ...EMPTY_INV, ...prefillFromWedding(wedding), color_theme: id || templateId });
    setMode("editor");
  };

  const startEdit = (inv: Invitation) => {
    setEditingId(inv.id);
    setForm(invitationToForm(inv));
    setMode("editor");
  };

  const previewSource = useMemo(
    () => (mode === "preview" && previewInv ? { ...EMPTY_INV, ...previewInv } : form),
    [mode, previewInv, form],
  );
  const activeTemplate = mode === "preview" && previewInv ? resolveTemplateId(previewInv.color_theme) : templateId;

  if (!weddingId) {
    return (
      <div className="text-center py-20 rounded-[2.5rem] border-2 border-dashed border-slate-100">
        <Heart className="h-14 w-14 text-slate-200 mx-auto mb-4" />
        <p className="text-slate-600 font-serif italic text-xl">Set up your wedding details first</p>
      </div>
    );
  }

  const previewControls = (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => setPreviewSize("desktop")} className={`rounded-full p-2 border ${previewSize === "desktop" ? "border-slate-800 text-slate-800" : "border-slate-200 text-slate-400"}`} aria-label="Desktop preview"><Monitor className="h-4 w-4" /></button>
      <button type="button" onClick={() => setPreviewSize("mobile")} className={`rounded-full p-2 border ${previewSize === "mobile" ? "border-slate-800 text-slate-800" : "border-slate-200 text-slate-400"}`} aria-label="Mobile preview"><Smartphone className="h-4 w-4" /></button>
      <Button type="button" variant="outline" className="rounded-full h-9 px-3 text-xs gap-1" onClick={() => setFullOpen(true)}><Eye className="h-3.5 w-3.5" /> Full</Button>
    </div>
  );

  if (mode === "editor") {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => { setMode("home"); setEditingId(null); }} className="rounded-full gap-2 text-slate-500"><X className="h-4 w-4" />Cancel</Button>
            <div>
              <h3 className="text-xl font-serif italic text-slate-800">{editingId ? "Edit invitation" : "Create invitation"}</h3>
              <p className="text-xs text-slate-500">{getTemplateMeta(templateId).name}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {previewControls}
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.couple_names || !form.wedding_date} className="rounded-full px-6 text-white gap-2 bg-slate-800 hover:bg-slate-900">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save
            </Button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {INVITATION_TEMPLATES.map((tpl) => (
            <button key={tpl.id} type="button" onClick={() => setForm((f) => ({ ...f, color_theme: tpl.id }))} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border ${tpl.id === templateId ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200"}`}>
              {tpl.name}
            </button>
          ))}
        </div>
        <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-6 items-start">
          <InvitationForm form={form} setForm={(updater) => setForm(updater)} />
          <div className="lg:sticky lg:top-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Live preview</p>
            <div className="rounded-2xl border border-slate-100 p-4 overflow-auto max-h-[80vh]" style={{ background: "#f4f4f4" }}>
              <InvitationRenderer source={form} templateId={templateId} websiteUrl={websiteUrl} size={previewSize} />
            </div>
          </div>
        </div>
        <Dialog open={fullOpen} onOpenChange={setFullOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-serif italic">Invitation preview</DialogTitle></DialogHeader>
            <InvitationRenderer source={form} templateId={templateId} websiteUrl={websiteUrl} size={previewSize} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (mode === "preview" && previewInv) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setMode("home")} className="rounded-full gap-2 text-slate-500"><X className="h-4 w-4" />Back</Button>
            <h3 className="text-xl font-serif italic text-slate-800">Preview invitation</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {previewControls}
            {(previewInv as Invitation).id ? (
              <Button onClick={() => onShareInvitation ? onShareInvitation(previewInv as Invitation) : onGoToGuests?.()} className="rounded-full px-5 gap-2 text-white bg-slate-800"><Share2 className="h-4 w-4" />Share with guests</Button>
            ) : null}
            {(previewInv as Invitation).id && !(previewInv as Invitation).is_selected ? (
              <Button onClick={() => selectMutation.mutate((previewInv as Invitation).id)} disabled={selectMutation.isPending} variant="outline" className="rounded-full px-5 gap-2">
                {selectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}Use as wedding invitation
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => startEdit(previewInv as Invitation)} className="rounded-full px-5 gap-2"><Edit className="h-4 w-4" />Edit</Button>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 p-4 md:p-8 overflow-auto" style={{ background: "#f4f4f4" }}>
          <InvitationRenderer source={previewSource} templateId={activeTemplate} websiteUrl={websiteUrl} size={previewSize} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-2xl font-serif italic text-slate-800">Wedding Invitation</h3>
        <p className="text-sm text-slate-500 mt-1">Choose a design from your uploaded invitations, then fill in your details.</p>
      </div>

      {selected && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Selected for guests</p>
            <p className="font-serif italic text-lg text-slate-800">{selected.couple_names}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => { setPreviewInv(selected); setMode("preview"); }}>Preview</Button>
            <Button className="rounded-full bg-slate-800 text-white gap-2" onClick={() => onShareInvitation ? onShareInvitation(selected) : onGoToGuests?.()}><Share2 className="h-4 w-4" />Share with guests</Button>
          </div>
        </div>
      )}

      <TemplateGallery
        selectedId={templateId}
        previewSource={form.couple_names ? form : { ...EMPTY_INV, ...prefillFromWedding(wedding) }}
        websiteUrl={websiteUrl}
        onSelect={(id) => startCreate(id)}
      />

      <div className="space-y-4">
        <h4 className="text-lg font-serif italic text-slate-800">Saved invitations</h4>
        {isLoading ? <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" /> : invitations.length === 0 ? (
          <p className="text-sm text-slate-400">Pick a template above to start.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {invitations.map((inv) => {
              const tid = resolveTemplateId(inv.color_theme);
              return (
                <div key={inv.id} className="rounded-2xl overflow-hidden border border-slate-100 bg-white">
                  <button type="button" className="relative h-44 w-full overflow-hidden" style={{ background: "#f4f4f4" }} onClick={() => { setPreviewInv(inv); setMode("preview"); }}>
                    <div className="absolute inset-x-0 top-2 origin-top scale-[0.3] pointer-events-none">
                      <InvitationRenderer source={inv} templateId={tid} websiteUrl={websiteUrl} size="thumb" />
                    </div>
                  </button>
                  <div className="p-4 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{getTemplateMeta(tid).name}</p>
                      <p className="font-serif italic truncate">{inv.couple_names}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-8" title="Share with guests" onClick={() => onShareInvitation ? onShareInvitation(inv) : onGoToGuests?.()}><Share2 className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => startEdit(inv)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => {
                        const blob = new Blob([`${inv.couple_names}\n${inv.wedding_date}`], { type: "text/plain" });
                        const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "invitation.txt"; a.click();
                      }}><Download className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-8 text-rose-400" onClick={() => deleteMutation.mutate(inv.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

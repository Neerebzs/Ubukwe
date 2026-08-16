"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Loader2, Sparkles, Heart } from "lucide-react";

interface InvitationTemplate {
  id: string;
  name: string | null;
  language: string | null;
  layout: string | null;
  section_order: string[];
  file_url: string | null;
  usage_count: number;
  created_at: string | null;
}

export function AdminInvitationTemplates() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: templatesRaw, isLoading } = useQuery<InvitationTemplate[]>({
    queryKey: ["invitation-templates"],
    queryFn: async () => {
      const res = await apiClient.invitations.listTemplates();
      return (res as any).data || [];
    },
  });
  const templates = Array.isArray(templatesRaw) ? templatesRaw : [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.invitations.deleteTemplate(id),
    onSuccess: () => {
      toast.success("Template removed");
      queryClient.invalidateQueries({ queryKey: ["invitation-templates"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete template"),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await apiClient.invitations.uploadTemplate(file);
      if (res?.status === "success") {
        toast.success(res.message || "Template added to the curated pool");
        queryClient.invalidateQueries({ queryKey: ["invitation-templates"] });
      } else {
        toast.error(res?.detail || "Could not process this file");
      }
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-serif italic text-slate-800">Invitation Templates</h2>
          <p className="text-sm text-slate-500 mt-1">
            Curate the invitation styles every customer can pick from — customers can only select, not upload.
          </p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-full gap-2 text-white bg-[#668c65] hover:bg-[#527451] px-5"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Analysing…" : "Upload New Template"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50/50 h-40 animate-pulse" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#668c65]/40 bg-[#FCFBF9] py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#668c65]/10 border-2 border-[#668c65]/40 flex items-center justify-center mx-auto mb-4">
            <Heart className="h-7 w-7 text-[#668c65]" />
          </div>
          <p className="text-lg font-serif italic text-slate-600 mb-1">No templates yet</p>
          <p className="text-[12px] text-slate-400 mb-6">
            Upload a sample invitation (image or PDF) — the AI will learn its layout and it becomes selectable for every customer.
          </p>
          <Button onClick={() => fileInputRef.current?.click()} className="rounded-full px-8 gap-2 text-white bg-[#668c65] hover:bg-[#527451]">
            <Upload className="h-4 w-4" />Upload Invitation File
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className="relative rounded-2xl overflow-hidden border-2 border-[#668c65]/20 bg-white hover:shadow-lg transition-shadow">
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#668c65] to-transparent" />
              <div className="p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#668c65]/10">
                    <FileText className="h-3.5 w-3.5 text-[#668c65]" />
                  </div>
                  <div className="space-y-1 flex-1">
                    {(tpl.section_order || ["verse", "names", "date", "schedule"]).slice(0, 4).map((s, i) => (
                      <div key={i} className="h-1 rounded bg-[#668c65]/20" style={{ width: `${72 - i * 14}%` }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-5 pb-4 space-y-0.5">
                <p className="text-[13px] font-serif italic font-semibold text-[#2C2010]">{tpl.name || "Uploaded Template"}</p>
                <p className="text-[10px] text-slate-400">Used {tpl.usage_count || 0} times · {(tpl.section_order || []).length} sections detected</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold border border-[#668c65]/40 text-[#668c65] bg-[#668c65]/10">
                    {(tpl.layout || "single_column") === "two_column" ? "2-Column" : "1-Column"}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold border border-slate-200 text-slate-500 bg-slate-50">{tpl.language || "english"}</span>
                </div>
              </div>
              <div className="flex justify-end px-5 pb-4">
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xl gap-1 text-[11px] px-2 py-1 h-auto text-rose-500 hover:bg-rose-50"
                  onClick={() => deleteMutation.mutate(tpl.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3 w-3" />Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-[#668c65]/20 bg-[#668c65]/5 px-4 py-3 flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-[#668c65] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#668c65]">
          Every file uploaded here is analysed for language, layout and sections, then made available to every customer's
          AI-generated invitations. Customers can only choose from this curated pool — they cannot upload their own.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Trash2, Loader2, Link2, Copy, Check, Mic2, Pencil, X, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiClient, MCProgramItem } from "@/lib/api";
import { queryKeys } from "@/lib/cache";
import { toast } from "sonner";

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

/** API client may double-wrap `{ data: items }` → always return a list. */
function normalizeProgramList(raw: unknown): MCProgramItem[] {
  let cur = raw;
  while (cur && typeof cur === "object" && !Array.isArray(cur) && "data" in cur) {
    cur = (cur as { data: unknown }).data;
  }
  return Array.isArray(cur) ? (cur as MCProgramItem[]) : [];
}

function toTimeInput(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 5);
}

type EditDraft = {
  start_time: string;
  end_time: string;
  title: string;
  responsible_person: string;
  couple_notes: string;
};

function draftFromItem(item: MCProgramItem): EditDraft {
  return {
    start_time: toTimeInput(item.start_time) || "09:00",
    end_time: toTimeInput(item.end_time),
    title: item.title || "",
    responsible_person: item.responsible_person || "",
    couple_notes: item.couple_notes || "",
  };
}

export function McProgramEditor({ weddingId, slug }: { weddingId: string; slug: string }) {
  const queryClient = useQueryClient();
  const [mcUrl, setMcUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [accessMode, setAccessMode] = useState("public");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [newItem, setNewItem] = useState({
    start_time: "09:00",
    end_time: "",
    title: "",
    responsible_person: "MC",
    couple_notes: "",
  });

  const { data: program = [], isLoading } = useQuery({
    queryKey: queryKeys.wedding.mcProgram(weddingId),
    queryFn: async () =>
      normalizeProgramList(unwrap(await apiClient.mcPortal.listProgram(weddingId))),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.mcProgram(weddingId) });

  const createMutation = useMutation({
    mutationFn: () =>
      apiClient.mcPortal.createItem(weddingId, {
        start_time: newItem.start_time,
        end_time: newItem.end_time || null,
        title: newItem.title.trim(),
        responsible_person: newItem.responsible_person.trim() || null,
        couple_notes: newItem.couple_notes.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Activity added");
      setNewItem({
        start_time: "09:00",
        end_time: "",
        title: "",
        responsible_person: "MC",
        couple_notes: "",
      });
      invalidate();
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : "Failed to add activity"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient.mcPortal.updateItem(weddingId, id, data),
    onSuccess: () => {
      toast.success("Activity updated");
      setEditingId(null);
      setDraft(null);
      invalidate();
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : "Failed to update activity"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.mcPortal.deleteItem(weddingId, id),
    onSuccess: () => {
      toast.success("Activity removed");
      if (editingId) {
        setEditingId(null);
        setDraft(null);
      }
      invalidate();
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : "Failed to delete activity"),
  });

  const linkMutation = useMutation({
    mutationFn: () =>
      apiClient.mcPortal.generateAccessLink<{ mc_url: string; access_mode?: string }>(weddingId),
    onSuccess: (res) => {
      const data = unwrap(res);
      setMcUrl(data.mc_url);
      if (data.access_mode) setAccessMode(data.access_mode);
      toast.success(
        data.access_mode === "public"
          ? "Public MC link ready (no token needed)"
          : "Protected MC link generated",
      );
    },
  });

  const accessMutation = useMutation({
    mutationFn: (mode: string) => apiClient.mcPortal.updateAccess(weddingId, mode),
    onSuccess: (_res, mode) => {
      setAccessMode(mode);
      if (mode === "public") {
        setMcUrl(`${window.location.origin}/w/${slug}/mc`);
      }
      toast.success(
        mode === "public"
          ? "MC portal is now public — no token required"
          : "MC portal is now token-protected",
      );
    },
  });

  const startEdit = (item: MCProgramItem) => {
    setEditingId(item.id);
    setDraft(draftFromItem(item));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = () => {
    if (!editingId || !draft) return;
    if (!draft.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!draft.start_time) {
      toast.error("Start time is required");
      return;
    }
    updateMutation.mutate({
      id: editingId,
      data: {
        start_time: draft.start_time,
        end_time: draft.end_time || null,
        title: draft.title.trim(),
        responsible_person: draft.responsible_person.trim(),
        couple_notes: draft.couple_notes.trim(),
      },
    });
  };

  const handleDelete = (item: MCProgramItem) => {
    if (!window.confirm(`Remove “${item.title}” from the program?`)) return;
    deleteMutation.mutate(item.id);
  };

  const copyLink = async () => {
    const url = mcUrl || `${window.location.origin}/w/${slug}/mc`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Mic2 className="h-5 w-5 text-[#668c65]" /> MC Portal Access
          </CardTitle>
          <CardDescription>Share the official wedding program with your MC</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            The MC portal is public — anyone with the link can open it (no access token).
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <Button onClick={() => linkMutation.mutate()} disabled={linkMutation.isPending}>
              <Link2 className="h-4 w-4 mr-2" /> Copy MC Link
            </Button>
            <Button variant="outline" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          {(mcUrl || slug) && (
            <p className="text-sm text-slate-500 break-all font-mono bg-slate-50 p-2 rounded">
              {mcUrl || `${typeof window !== "undefined" ? window.location.origin : ""}/w/${slug}/mc`}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Wedding Program</CardTitle>
          <CardDescription>
            Add, edit, or remove activities — changes sync to the MC portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {program.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-6">
              No activities yet. Add your first program item below.
            </p>
          )}

          {program.map((item) => {
            const isEditing = editingId === item.id;

            if (isEditing && draft) {
              return (
                <div
                  key={item.id}
                  className="space-y-3 rounded-xl border border-[#668c65]/40 bg-[#668c65]/5 p-4"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">Start time</Label>
                      <Input
                        type="time"
                        value={draft.start_time}
                        onChange={(e) => setDraft({ ...draft, start_time: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End time (optional)</Label>
                      <Input
                        type="time"
                        value={draft.end_time}
                        onChange={(e) => setDraft({ ...draft, end_time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Activity title</Label>
                    <Input
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      placeholder="e.g. Guest Arrival"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Responsible person</Label>
                    <Input
                      value={draft.responsible_person}
                      onChange={(e) => setDraft({ ...draft, responsible_person: e.target.value })}
                      placeholder="e.g. MC"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Notes for couple / MC</Label>
                    <Textarea
                      rows={2}
                      value={draft.couple_notes}
                      onChange={(e) => setDraft({ ...draft, couple_notes: e.target.value })}
                      placeholder="Optional notes"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={saveEdit}
                      disabled={updateMutation.isPending || !draft.title.trim()}
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                      disabled={updateMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-4 rounded-xl border ${
                  item.is_completed
                    ? "bg-emerald-50 border-emerald-100"
                    : "bg-white border-slate-100"
                }`}
              >
                <div className="text-center min-w-[60px] pt-0.5">
                  <p className="font-mono font-bold text-sm">{toTimeInput(item.start_time)}</p>
                  {item.end_time && (
                    <p className="text-xs text-slate-400">{toTimeInput(item.end_time)}</p>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium ${
                      item.is_completed ? "line-through text-slate-400" : ""
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.responsible_person && (
                    <p className="text-xs text-slate-400">Responsible: {item.responsible_person}</p>
                  )}
                  {item.couple_notes && (
                    <p className="text-xs text-slate-500 mt-1 whitespace-pre-line">{item.couple_notes}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 hover:text-[#668c65]"
                    onClick={() => startEdit(item)}
                    disabled={!!editingId || deleteMutation.isPending}
                    aria-label={`Edit ${item.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-600"
                    onClick={() => handleDelete(item)}
                    disabled={deleteMutation.isPending || updateMutation.isPending}
                    aria-label={`Delete ${item.title}`}
                  >
                    {deleteMutation.isPending && deleteMutation.variables === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}

          <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 pt-4 mt-2">
            <p className="text-sm font-medium text-slate-700">Add activity</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input
                type="time"
                value={newItem.start_time}
                onChange={(e) => setNewItem({ ...newItem, start_time: e.target.value })}
                aria-label="Start time"
              />
              <Input
                type="time"
                value={newItem.end_time}
                onChange={(e) => setNewItem({ ...newItem, end_time: e.target.value })}
                aria-label="End time (optional)"
                placeholder="End time"
              />
            </div>
            <Input
              placeholder="Activity title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            />
            <Input
              placeholder="Responsible person"
              value={newItem.responsible_person}
              onChange={(e) => setNewItem({ ...newItem, responsible_person: e.target.value })}
            />
            <Textarea
              rows={2}
              placeholder="Notes (optional)"
              value={newItem.couple_notes}
              onChange={(e) => setNewItem({ ...newItem, couple_notes: e.target.value })}
            />
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!newItem.title.trim() || !newItem.start_time || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Add activity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

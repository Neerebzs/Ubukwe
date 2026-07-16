"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Plus, Loader2, Trash2, Sparkles, Upload, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { apiClient, WeddingTimelineItem } from "@/lib/api";
import { queryKeys } from "@/lib/cache";
import { toast } from "sonner";

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

const emptyForm = {
  title: "",
  description: "",
  event_date: "",
  location: "",
  is_public: true,
  images: [] as string[],
};

export function TimelineManager({ weddingId }: { weddingId: string }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const itemFileRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: queryKeys.wedding.timeline(weddingId),
    queryFn: async () => unwrap(await apiClient.timeline.list<WeddingTimelineItem[]>(weddingId)),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.timeline(weddingId) });

  const uploadImage = async (file: File): Promise<string> => {
    const res = await apiClient.upload.general<{ url?: string; secure_url?: string }>(
      file,
      `weddings/${weddingId}/timeline`,
      "image",
    );
    const data = unwrap(res);
    const url = data.url || data.secure_url;
    if (!url) throw new Error("Upload failed");
    return url;
  };

  const createMutation = useMutation({
    mutationFn: () => apiClient.timeline.create(weddingId, form),
    onSuccess: () => {
      toast.success("Milestone added");
      invalidate();
      setForm(emptyForm);
      setShowForm(false);
    },
    onError: () => toast.error("Failed to save milestone"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient.timeline.update(weddingId, id, data),
    onSuccess: () => {
      invalidate();
      toast.success("Updated");
    },
    onError: () => toast.error("Failed to update"),
  });

  const seedMutation = useMutation({
    mutationFn: () => apiClient.timeline.seed(weddingId),
    onSuccess: () => { toast.success("Love story timeline seeded"); invalidate(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.timeline.delete(weddingId, id),
    onSuccess: () => { toast.success("Removed"); invalidate(); },
  });

  const handleFormUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const url = await uploadImage(files[0]);
      setForm((prev) => ({ ...prev, images: [...prev.images, url].slice(0, 6) }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleItemUpload = async (item: WeddingTimelineItem, files: FileList | null) => {
    if (!files?.length) return;
    setUploadingItemId(item.id);
    try {
      const url = await uploadImage(files[0]);
      const images = [...(item.images || []), url].slice(0, 6);
      updateMutation.mutate({ id: item.id, data: { images } });
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingItemId(null);
      if (itemFileRef.current) itemFileRef.current.value = "";
    }
  };

  const removeFormImage = (url: string) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((u) => u !== url) }));
  };

  const removeItemImage = (item: WeddingTimelineItem, url: string) => {
    const images = (item.images || []).filter((u) => u !== url);
    updateMutation.mutate({ id: item.id, data: { images } });
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Love Story Timeline
            </CardTitle>
            <CardDescription>Share milestones with photos for guests</CardDescription>
          </div>
          <div className="flex gap-2">
            {items.length === 0 && (
              <Button variant="outline" size="sm" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                <Sparkles className="h-4 w-4 mr-1" /> Seed Story
              </Button>
            )}
            <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-[#668c65] hover:bg-[#668c65]/90">
              <Plus className="h-4 w-4 mr-1" /> Add Milestone
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-4 rounded-xl border bg-slate-50 space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Our First Date" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Photos</Label>
              <div className="flex flex-wrap gap-2">
                {form.images.map((url) => (
                  <div key={url} className="relative h-20 w-20 rounded-lg overflow-hidden border">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFormImage(url)}
                      className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFormUpload(e.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading || form.images.length >= 6}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload Photo
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.is_public} onCheckedChange={(v) => setForm({ ...form, is_public: v })} />
              <Label className="font-normal">Show on public timeline</Label>
            </div>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!form.title.trim() || createMutation.isPending}
              className="bg-[#668c65] hover:bg-[#668c65]/90"
            >
              Save Milestone
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : items.length === 0 ? (
          <p className="text-center text-slate-400 py-6">No milestones yet</p>
        ) : (
          <div className="relative pl-6 border-l-2 border-[#668c65]/30 space-y-6">
            <input
              ref={itemFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const id = itemFileRef.current?.dataset.itemId;
                const item = items.find((i) => i.id === id);
                if (item) handleItemUpload(item, e.target.files);
              }}
            />
            {items.map((item) => (
              <div key={item.id} className="relative">
                <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-[#668c65]" />
                <div className="flex justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="font-medium">{item.title}</p>
                    {item.event_date && (
                      <p className="text-xs text-slate-400">
                        {new Date(item.event_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </p>
                    )}
                    {item.description && <p className="text-sm text-slate-600">{item.description}</p>}
                    {item.location && <p className="text-xs text-slate-400">{item.location}</p>}
                    {(item.images?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {item.images!.map((url) => (
                          <div key={url} className="relative h-16 w-16 rounded-lg overflow-hidden border">
                            <img src={url} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeItemImage(item, url)}
                              className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingItemId === item.id || (item.images?.length ?? 0) >= 6}
                      onClick={() => {
                        if (itemFileRef.current) {
                          itemFileRef.current.dataset.itemId = item.id;
                          itemFileRef.current.click();
                        }
                      }}
                    >
                      {uploadingItemId === item.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        : <ImagePlus className="h-3.5 w-3.5 mr-1" />}
                      Add Photo
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 shrink-0" onClick={() => deleteMutation.mutate(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

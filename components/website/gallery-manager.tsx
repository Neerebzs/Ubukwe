"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Upload, Loader2, CheckCircle, XCircle, Trash2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, WeddingGalleryItem } from "@/lib/api";
import { queryKeys } from "@/lib/cache";
import { toast } from "sonner";

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

export function GalleryManager({ weddingId, slug }: { weddingId: string; slug: string }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: queryKeys.wedding.gallery(weddingId),
    queryFn: async () => unwrap(await apiClient.gallery.list<WeddingGalleryItem[]>(weddingId)),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.gallery(weddingId) });

  const addMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.gallery.add(weddingId, data),
    onSuccess: () => { toast.success("Photo added"); invalidate(); setImageUrl(""); setCaption(""); },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed"),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.gallery.moderate(weddingId, id, status),
    onSuccess: () => { invalidate(); toast.success("Updated"); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.gallery.delete(weddingId, id),
    onSuccess: () => { invalidate(); toast.success("Removed"); },
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const res = await apiClient.upload.general<{ url?: string; secure_url?: string }>(
        files[0],
        `weddings/${slug}/gallery`,
        "image",
      );
      const data = unwrap(res);
      const url = data.url || data.secure_url;
      if (!url) throw new Error("Upload failed");
      addMutation.mutate({ image_url: url, caption: caption || undefined });
    } catch {
      toast.error("Upload failed — try pasting an image URL instead");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const pending = items.filter((i) => i.status === "pending");

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Photo Gallery
        </CardTitle>
        <CardDescription>
          Upload photos or moderate guest submissions
          {pending.length > 0 && (
            <Badge className="ml-2 bg-amber-100 text-amber-800">{pending.length} pending</Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-xl border bg-slate-50 space-y-3">
          <div className="flex gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={uploading || addMutation.isPending}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Upload Photo
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Or paste image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => imageUrl && addMutation.mutate({ image_url: imageUrl, caption: caption || undefined })}
              disabled={!imageUrl.trim() || addMutation.isPending}
              className="bg-[#668c65] hover:bg-[#668c65]/90"
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : items.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No photos yet</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="relative group rounded-xl overflow-hidden border bg-white">
                <img
                  src={item.thumbnail_url || item.image_url}
                  alt={item.caption || "Wedding photo"}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  {item.uploader_name && (
                    <p className="text-white text-xs mb-1">{item.uploader_name}</p>
                  )}
                  {item.caption && (
                    <p className="text-white/80 text-xs truncate">{item.caption}</p>
                  )}
                  <div className="flex gap-1 mt-2">
                    {item.status === "pending" && (
                      <>
                        <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => moderateMutation.mutate({ id: item.id, status: "approved" })}>
                          <CheckCircle className="h-3 w-3 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => moderateMutation.mutate({ id: item.id, status: "rejected" })}>
                          <XCircle className="h-3 w-3 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="destructive" className="h-7 text-xs ml-auto" onClick={() => deleteMutation.mutate(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {item.status === "pending" && (
                  <Badge className="absolute top-2 left-2 bg-amber-500 text-white text-xs">Pending</Badge>
                )}
                {item.source === "guest" && (
                  <Badge className="absolute top-2 right-2 bg-blue-500/80 text-white text-xs">Guest</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

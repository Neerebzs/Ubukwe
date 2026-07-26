"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, Save, Trash2, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, WeddingWebsite } from "@/lib/api";
import { queryKeys } from "@/lib/cache";
import { toast } from "sonner";

interface CouplePhotos {
  bride: string | null;
  groom: string | null;
  couple: string | null;
}

type PhotoSlot = keyof CouplePhotos;

interface CoupleProfileEditorProps {
  weddingId: string;
  website: WeddingWebsite;
}

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

function readPhotos(profile: Record<string, unknown>): CouplePhotos {
  const raw = (profile.photos as Record<string, unknown>) || {};
  return {
    bride: (raw.bride as string) || null,
    groom: (raw.groom as string) || null,
    couple: (raw.couple as string) || null,
  };
}

const PHOTO_LABELS: Record<PhotoSlot, string> = {
  couple: "Couple Photo",
  bride: "Bride Photo",
  groom: "Groom Photo",
};

export function CoupleProfileEditor({ weddingId, website }: CoupleProfileEditorProps) {
  const queryClient = useQueryClient();
  const profile = website.couple_profile || {};
  const [form, setForm] = useState({
    bride_name: (profile.bride_name as string) || "",
    groom_name: (profile.groom_name as string) || "",
    display_names: (profile.display_names as string) || "",
    biography: (profile.biography as string) || "",
    love_story: (profile.love_story as string) || "",
    proposal_story: (profile.proposal_story as string) || "",
  });
  const [photos, setPhotos] = useState<CouplePhotos>(() => readPhotos(profile));
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<PhotoSlot | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const photosRef = useRef(photos);
  const formRef = useRef(form);
  const fileRefs = useRef<Record<PhotoSlot, HTMLInputElement | null>>({
    couple: null,
    bride: null,
    groom: null,
  });

  photosRef.current = photos;
  formRef.current = form;

  useEffect(() => {
    setForm({
      bride_name: (profile.bride_name as string) || "",
      groom_name: (profile.groom_name as string) || "",
      display_names: (profile.display_names as string) || "",
      biography: (profile.biography as string) || "",
      love_story: (profile.love_story as string) || "",
      proposal_story: (profile.proposal_story as string) || "",
    });
    setPhotos(readPhotos(profile));
  }, [website.couple_profile]);

  const saveMutation = useMutation({
    mutationFn: (couple_profile: Record<string, unknown>) =>
      apiClient.website.update(weddingId, { couple_profile }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wedding.website(weddingId) });
      setSaving(false);
    },
    onError: () => {
      toast.error("Failed to save profile");
      setSaving(false);
    },
  });

  const buildPayload = (nextForm: typeof form, nextPhotos: CouplePhotos) => ({
    ...profile,
    ...nextForm,
    display_names: nextForm.display_names || `${nextForm.bride_name} & ${nextForm.groom_name}`,
    photos: nextPhotos,
  });

  const scheduleSave = (next: typeof form) => {
    setForm(next);
    setSaving(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveMutation.mutate(buildPayload(next, photosRef.current));
    }, 2000);
  };

  const savePhotos = (nextPhotos: CouplePhotos) => {
    setPhotos(nextPhotos);
    photosRef.current = nextPhotos;
    setSaving(true);
    if (timer.current) clearTimeout(timer.current);
    saveMutation.mutate(buildPayload(formRef.current, nextPhotos));
  };

  const saveNow = () => {
    if (timer.current) clearTimeout(timer.current);
    setSaving(true);
    saveMutation.mutate(buildPayload(form, photos));
    toast.success("Profile saved");
  };

  const handlePhotoUpload = async (slot: PhotoSlot, files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setUploadingSlot(slot);
    try {
      const folder = `weddings/${website.slug || weddingId}/couple`;
      const res = await apiClient.upload.general<{ url?: string; secure_url?: string }>(
        file,
        folder,
        "image",
      );
      const data = unwrap(res);
      const url = data.url || data.secure_url;
      if (!url) throw new Error("Upload failed");
      savePhotos({ ...photosRef.current, [slot]: url });
      toast.success(`${PHOTO_LABELS[slot]} uploaded`);
    } catch {
      toast.error("Upload failed — please try again");
    } finally {
      setUploadingSlot(null);
      const input = fileRefs.current[slot];
      if (input) input.value = "";
    }
  };

  const removePhoto = (slot: PhotoSlot) => {
    savePhotos({ ...photosRef.current, [slot]: null });
    toast.success(`${PHOTO_LABELS[slot]} removed`);
  };

  const openPicker = (slot: PhotoSlot) => fileRefs.current[slot]?.click();

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="font-serif text-lg">Couple Profile</CardTitle>
        <CardDescription>
          Edit photos, names and story — auto-saves after 2 seconds
          {saving && (
            <span className="ml-2 inline-flex items-center gap-1 text-amber-600">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div>
            <Label className="text-base">Profile Pictures</Label>
            <p className="text-xs text-slate-500 mt-0.5">
              These photos appear on your wedding website to make it more personal
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(
              [
                {
                  slot: "couple" as const,
                  label: "Couple Photo",
                  subtitle: "Main photo shown on your story section",
                  large: true,
                },
                {
                  slot: "bride" as const,
                  label: "Bride Photo",
                  subtitle: form.bride_name
                    ? `Photo of ${form.bride_name}`
                    : "Individual bride portrait",
                },
                {
                  slot: "groom" as const,
                  label: "Groom Photo",
                  subtitle: form.groom_name
                    ? `Photo of ${form.groom_name}`
                    : "Individual groom portrait",
                },
              ] as const
            ).map((item) => (
              <div
                key={item.slot}
                className={`rounded-xl border bg-slate-50/80 p-4 ${item.large ? "sm:col-span-2" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => openPicker(item.slot)}
                    disabled={!!uploadingSlot}
                    className={`relative shrink-0 overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-white transition hover:border-[#668c65] hover:bg-slate-50 disabled:opacity-60 ${
                      item.large ? "h-28 w-28" : "h-20 w-20"
                    }`}
                    aria-label={`Upload ${item.label}`}
                  >
                    {photos[item.slot] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photos[item.slot]!}
                        alt={item.label}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400">
                        <User className={item.large ? "h-8 w-8" : "h-6 w-6"} />
                        <Camera className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {uploadingSlot === item.slot && (
                      <span className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <Loader2 className="h-5 w-5 animate-spin text-[#668c65]" />
                      </span>
                    )}
                  </button>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <p className="font-medium text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.subtitle}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input
                        ref={(el) => {
                          fileRefs.current[item.slot] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(item.slot, e.target.files)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openPicker(item.slot)}
                        disabled={!!uploadingSlot}
                      >
                        {uploadingSlot === item.slot ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {photos[item.slot] ? "Change" : "Upload"}
                      </Button>
                      {photos[item.slot] && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => removePhoto(item.slot)}
                          disabled={!!uploadingSlot || saveMutation.isPending}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Bride Name</Label>
            <Input
              value={form.bride_name}
              onChange={(e) => scheduleSave({ ...form, bride_name: e.target.value })}
            />
          </div>
          <div>
            <Label>Groom Name</Label>
            <Input
              value={form.groom_name}
              onChange={(e) => scheduleSave({ ...form, groom_name: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label>Display Names (shown on site)</Label>
          <Input
            value={form.display_names}
            placeholder="Emma & John"
            onChange={(e) => scheduleSave({ ...form, display_names: e.target.value })}
          />
        </div>
        <div>
          <Label>Biography</Label>
          <Textarea
            rows={3}
            value={form.biography}
            onChange={(e) => scheduleSave({ ...form, biography: e.target.value })}
          />
        </div>
        <div>
          <Label>Love Story</Label>
          <Textarea
            rows={4}
            value={form.love_story}
            onChange={(e) => scheduleSave({ ...form, love_story: e.target.value })}
          />
        </div>
        <div>
          <Label>Proposal Story</Label>
          <Textarea
            rows={3}
            value={form.proposal_story}
            onChange={(e) => scheduleSave({ ...form, proposal_story: e.target.value })}
          />
        </div>
        <Button variant="outline" onClick={saveNow} disabled={saveMutation.isPending}>
          <Save className="mr-2 h-4 w-4" /> Save Now
        </Button>
      </CardContent>
    </Card>
  );
}

"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Camera, Upload, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, PublicWeddingSite, WeddingGalleryItem } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { HCaptchaField, useCaptchaEnabled } from "@/components/public-wedding/hcaptcha-field";

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

export function PublicGallery({ site }: { site: PublicWeddingSite }) {
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") || undefined;
  const accent = (site.theme_config?.accent_color as string) || "#668c65";
  const gallerySection = site.sections.find((s) => s.section_type === "gallery");
  const allowGuestUpload = gallerySection?.content?.allow_guest_upload !== false;

  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ uploader_name: "", caption: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const captchaEnabled = useCaptchaEnabled();

  const { data: photos = [] } = useQuery({
    queryKey: ["public-gallery", site.slug],
    queryFn: async () => unwrap(await apiClient.gallery.listPublic<WeddingGalleryItem[]>(site.slug)),
  });

  const submitPhoto = async (imageUrl: string, thumbnailUrl?: string) => {
    if (!form.uploader_name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (captchaEnabled && !captchaToken) {
      toast.error("Please complete the CAPTCHA");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.gallery.submitPublic(site.slug, {
        uploader_name: form.uploader_name,
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl,
        caption: form.caption || undefined,
        captcha_token: captchaToken || undefined,
        website_honeypot: honeypot || undefined,
      }, preview);
      setSubmitted(true);
      setForm({ uploader_name: "", caption: "" });
    } catch {
      toast.error("Failed to submit photo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setSubmitting(true);
    try {
      const res = await apiClient.upload.general<{ url?: string; secure_url?: string }>(
        files[0],
        `weddings/${site.slug}/gallery-guest`,
        "image",
      );
      const data = unwrap(res);
      const url = data.url || data.secure_url;
      if (!url) throw new Error("Upload failed");
      await submitPhoto(url);
    } catch {
      toast.error("Upload failed");
      setSubmitting(false);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#f9fafc]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href={`/w/${site.slug}`} className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 mb-8">
          <ArrowLeft className="h-4 w-4" /> {site.wedding.couple_name}
        </Link>

        <div className="text-center mb-10">
          <Camera className="h-8 w-8 mx-auto mb-3" style={{ color: accent }} />
          <h1 className="font-serif text-4xl text-[#0d182a]">Gallery</h1>
          <p className="text-slate-500 mt-2">Moments from {site.wedding.couple_name}&apos;s celebration</p>
        </div>

        {photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
            {photos.map((photo) => (
              <div key={photo.id} className="rounded-xl overflow-hidden shadow-sm group relative">
                <img
                  src={photo.thumbnail_url || photo.image_url}
                  alt={photo.caption || "Wedding photo"}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {photo.caption && (
                  <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                    {photo.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-400 mb-10">Photos coming soon!</p>
        )}

        {allowGuestUpload && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <h2 className="font-serif text-xl">Share a Photo</h2>
            {submitted && (
              <div className="flex items-center gap-2 text-emerald-700 text-sm bg-emerald-50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4" /> Thank you! Your photo is pending approval.
              </div>
            )}
            <div>
              <Label>Your Name</Label>
              <Input required value={form.uploader_name} onChange={(e) => setForm({ ...form, uploader_name: e.target.value })} />
            </div>
            <div>
              <Label>Caption (optional)</Label>
              <Input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
            </div>
            <input
              type="text"
              name="website_honeypot"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute opacity-0 h-0 w-0 pointer-events-none"
            />
            <HCaptchaField onToken={setCaptchaToken} />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files)} />
            <Button
              type="button"
              className="w-full"
              disabled={submitting || !form.uploader_name.trim()}
              style={{ backgroundColor: accent }}
              onClick={() => fileRef.current?.click()}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Upload Photo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MessageSquare, Send, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient, PublicWeddingSite } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { HCaptchaField, useCaptchaEnabled } from "@/components/public-wedding/hcaptcha-field";

interface GuestbookEntry {
  id: string;
  author_name: string;
  message?: string;
  created_at: string;
}

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

export function PublicGuestbook({ site }: { site: PublicWeddingSite }) {
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") || undefined;
  const accent = (site.theme_config?.accent_color as string) || "#668c65";

  const [form, setForm] = useState({ author_name: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const captchaEnabled = useCaptchaEnabled();

  const { data: entries = [] } = useQuery({
    queryKey: ["public-guestbook", site.slug],
    queryFn: async () => unwrap(await apiClient.guestbook.listPublic<GuestbookEntry[]>(site.slug)),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author_name.trim() || !form.message.trim()) {
      toast.error("Name and message required");
      return;
    }
    if (captchaEnabled && !captchaToken) {
      toast.error("Please complete the CAPTCHA");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.guestbook.submit(site.slug, {
        ...form,
        captcha_token: captchaToken || undefined,
        website_honeypot: honeypot || undefined,
      }, preview);
      setSubmitted(true);
      setForm({ author_name: "", message: "" });
    } catch {
      toast.error("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafc]">
      <div className="max-w-lg mx-auto px-6 py-12">
        <Link href={`/w/${site.slug}`} className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 mb-8">
          <ArrowLeft className="h-4 w-4" /> {site.wedding.couple_name}
        </Link>

        <div className="text-center mb-8">
          <MessageSquare className="h-8 w-8 mx-auto mb-3" style={{ color: accent }} />
          <h1 className="font-serif text-4xl text-[#0d182a]">Guestbook</h1>
          <p className="text-slate-500 mt-2">Leave a message for the happy couple</p>
        </div>

        {submitted && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-emerald-800 text-sm">
            <CheckCircle className="h-4 w-4" /> Thank you! Your message is pending approval.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4 mb-8">
          <div>
            <Label>Your Name</Label>
            <Input required value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Wishing you a lifetime of happiness..." />
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
          <Button type="submit" className="w-full" disabled={submitting} style={{ backgroundColor: accent }}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Leave Message
          </Button>
        </form>

        <div className="space-y-4">
          <h2 className="font-serif text-xl text-center">Messages</h2>
          {entries.length === 0 ? (
            <p className="text-center text-slate-400 text-sm">Be the first to leave a message!</p>
          ) : entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <p className="font-medium text-[#0d182a]">{entry.author_name}</p>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed">{entry.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

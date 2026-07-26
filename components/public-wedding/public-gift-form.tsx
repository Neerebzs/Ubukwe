"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Gift, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiClient, PublicWeddingSite } from "@/lib/api";
import { toast } from "sonner";
import { HCaptchaField, useCaptchaEnabled } from "@/components/public-wedding/hcaptcha-field";

const RELATIONSHIPS = ["family", "friend", "colleague", "organization", "church", "community", "other"];

interface GiftResult {
  id?: string;
  reference_number: string;
  contributor_name: string;
  message: string;
}

function unwrapData<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

export function PublicGiftForm({ site }: { site: PublicWeddingSite }) {
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") || undefined;
  const accent = (site.theme_config?.accent_color as string) || "#668c65";

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GiftResult | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const captchaEnabled = useCaptchaEnabled();
  const [form, setForm] = useState({
    contributor_name: "",
    contributor_phone: "",
    contributor_email: "",
    relationship: "friend",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contributor_name.trim() || !form.contributor_phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    if (captchaEnabled && !captchaToken) {
      toast.error("Please complete the CAPTCHA");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.gifts.registerPublic<GiftResult>(site.slug, {
        contributor_name: form.contributor_name,
        contributor_phone: form.contributor_phone,
        contributor_email: form.contributor_email || undefined,
        relationship: form.relationship,
        gift_type: "other",
        privacy: "public",
        gift_details: {},
        captcha_token: captchaToken || undefined,
        website_honeypot: honeypot || undefined,
      }, preview);
      setResult(unwrapData(res));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f9fafc]">
        <div className="max-w-md w-full text-center space-y-6 bg-white rounded-2xl shadow-xl p-8">
          <CheckCircle className="h-16 w-16 mx-auto" style={{ color: accent }} />
          <h1 className="font-serif text-3xl">Thank You!</h1>
          <p className="text-slate-600">{result.message}</p>
          <div className="p-4 rounded-xl bg-slate-50 border">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Gift Registration ID</p>
            <p className="font-mono font-bold text-lg mt-1">{result.reference_number}</p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/w/${site.slug}`}><ArrowLeft className="h-4 w-4 mr-2" /> Back to Wedding Site</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafc]">
      <div className="max-w-lg mx-auto px-6 py-12">
        <Link href={`/w/${site.slug}`} className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to {site.wedding.couple_name}
        </Link>

        <div className="text-center mb-8">
          <Gift className="h-8 w-8 mx-auto mb-3" style={{ color: accent }} />
          <h1 className="font-serif text-4xl text-[#0d182a]">Gift Registration</h1>
          <p className="text-slate-500 mt-2">Register your gift for {site.wedding.couple_name}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-5">
          <div>
            <Label>Full Name *</Label>
            <Input required value={form.contributor_name} onChange={(e) => setForm({ ...form, contributor_name: e.target.value })} />
          </div>
          <div>
            <Label>Phone Number *</Label>
            <Input required value={form.contributor_phone} onChange={(e) => setForm({ ...form, contributor_phone: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.contributor_email} onChange={(e) => setForm({ ...form, contributor_email: e.target.value })} />
          </div>
          <div>
            <Label>Relationship</Label>
            <Select value={form.relationship} onValueChange={(v) => setForm({ ...form, relationship: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map((r) => (
                  <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Register Gift
          </Button>
        </form>
      </div>
    </div>
  );
}

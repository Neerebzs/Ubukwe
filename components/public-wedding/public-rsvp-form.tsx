"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { Heart, CheckCircle, Loader2, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiClient, PublicWeddingSite } from "@/lib/api";
import { toast } from "sonner";
import { HCaptchaField, useCaptchaEnabled } from "@/components/public-wedding/hcaptcha-field";

interface PublicRsvpFormProps {
  site: PublicWeddingSite;
}

interface RsvpResult {
  reference: string;
  name: string;
  rsvp_status: string;
  message: string;
  email_sent?: boolean;
}

function unwrapData<T>(response: { data?: T } | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

function RsvpConfirmationQr({
  reference,
  coupleName,
  accent,
}: {
  reference: string;
  coupleName: string;
  accent: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !reference) return;
    QRCode.toCanvas(canvasRef.current, reference, {
      width: 168,
      margin: 2,
      color: { dark: "#0d182a", light: "#ffffff" },
    })
      .then(() => setReady(true))
      .catch(() => setReady(false));
  }, [reference]);

  const downloadQr = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `rsvp-${reference.toLowerCase()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-3">
      <div
        className="inline-flex flex-col items-center gap-2 rounded-xl border bg-white p-4"
        style={{ borderColor: `${accent}40` }}
      >
        <canvas ref={canvasRef} className="rounded-md" aria-label={`QR code for ${reference}`} />
        <p className="text-xs text-slate-500 max-w-[11rem] leading-snug">
          Show this QR at check-in for {coupleName}
        </p>
      </div>
      <div>
        <Button type="button" variant="outline" size="sm" onClick={downloadQr} disabled={!ready}>
          <Download className="h-4 w-4 mr-2" />
          Download QR
        </Button>
      </div>
    </div>
  );
}

export function PublicRsvpForm({ site }: PublicRsvpFormProps) {
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") || undefined;

  const rsvpSection = site.sections.find((s) => s.section_type === "rsvp");
  const rsvpConfig = rsvpSection?.content || {};
  const mealOptions = (rsvpConfig.meal_options as string[]) || ["Standard", "Vegetarian", "Vegan", "Halal"];
  const allowPlusOne = rsvpConfig.allow_plus_one !== false;
  const showMeal = rsvpConfig.show_meal !== false;
  const showDietary = rsvpConfig.show_dietary !== false;
  const showGuestCount = rsvpConfig.show_guest_count !== false;
  const showChildren = rsvpConfig.show_children !== false;
  const showSpecialRequests = rsvpConfig.show_special_requests !== false;
  const rsvpEnabled = rsvpConfig.enabled !== false;
  const customConfirmation = (rsvpConfig.confirmation_message as string) || "";
  const deadline = rsvpConfig.rsvp_deadline as string | undefined;

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RsvpResult | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const captchaEnabled = useCaptchaEnabled();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    attendance: "accepted",
    meal_selection: "",
    dietary_restrictions: "",
    plus_one: false,
    plus_one_name: "",
    guest_count: 1,
    children_count: 0,
    special_requests: "",
  });

  const accent = (site.theme_config?.accent_color as string) || "#668c65";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (captchaEnabled && !captchaToken) {
      toast.error("Please complete the CAPTCHA");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiClient.website.submitRsvp<RsvpResult>(site.slug, {
        ...form,
        captcha_token: captchaToken || undefined,
        website_honeypot: honeypot || undefined,
      }, preview);
      setResult(unwrapData(res));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit RSVP";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#f9fafc" }}>
        <div className="max-w-md w-full text-center space-y-6 bg-white rounded-2xl shadow-xl p-8">
          <CheckCircle className="h-16 w-16 mx-auto" style={{ color: accent }} />
          <h1 className="font-serif text-3xl">Thank You, {result.name}!</h1>
          <p className="text-slate-600">{customConfirmation || result.message}</p>
          <div className="p-4 rounded-xl bg-slate-50 border">
            <p className="text-xs text-slate-400 uppercase tracking-wider">RSVP Reference</p>
            <p className="font-mono font-bold text-lg mt-1">{result.reference}</p>
          </div>
          <RsvpConfirmationQr
            reference={result.reference}
            coupleName={site.wedding.couple_name}
            accent={accent}
          />
          <p className="text-sm text-slate-500 capitalize">
            Status: {result.rsvp_status === "confirmed" ? "Accepted" : result.rsvp_status}
          </p>
          {result.email_sent && (
            <p className="text-sm text-emerald-600">A confirmation email has been sent to your inbox.</p>
          )}
          <Button asChild variant="outline">
            <Link href={`/w/${site.slug}`}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Wedding Site
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!rsvpEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f9fafc]">
        <div className="max-w-md w-full text-center space-y-4 bg-white rounded-2xl shadow-xl p-8">
          <Heart className="h-10 w-10 mx-auto" style={{ color: accent }} />
          <h1 className="font-serif text-2xl">RSVP Closed</h1>
          <p className="text-slate-500">RSVPs are not currently open for this wedding.</p>
          <Button asChild variant="outline">
            <Link href={`/w/${site.slug}`}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Wedding Site
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const pastDeadline = deadline ? new Date(deadline) < new Date(new Date().toDateString()) : false;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9fafc" }}>
      <div className="max-w-lg mx-auto px-6 py-12">
        <Link href={`/w/${site.slug}`} className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to {site.wedding.couple_name}
        </Link>

        <div className="text-center mb-8">
          <Heart className="h-8 w-8 mx-auto mb-3" style={{ color: accent }} />
          <h1 className="font-serif text-4xl text-[#0d182a]">RSVP</h1>
          <p className="text-slate-500 mt-2">
            Please respond for {site.wedding.couple_name}
            {site.wedding.wedding_date && (
              <> on {new Date(site.wedding.wedding_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</>
            )}
          </p>
          {deadline && (
            <p className="text-sm text-slate-400 mt-2">
              Please respond by {new Date(deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>

        {pastDeadline ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-3">
            <p className="text-slate-600">The RSVP deadline has passed. Please contact the couple directly if you still need to respond.</p>
            <Button asChild variant="outline">
              <Link href={`/w/${site.slug}/contact`}>Contact</Link>
            </Button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-5">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>

          <div>
            <Label>Will you attend? *</Label>
            <RadioGroup
              value={form.attendance}
              onValueChange={(v) => setForm({ ...form, attendance: v })}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="accepted" id="yes" />
                <Label htmlFor="yes" className="font-normal cursor-pointer">Joyfully Accept</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="declined" id="no" />
                <Label htmlFor="no" className="font-normal cursor-pointer">Regretfully Decline</Label>
              </div>
            </RadioGroup>
          </div>

          {form.attendance === "accepted" && (
            <>
              {showMeal && (
                <div>
                  <Label>Meal Selection</Label>
                  <Select value={form.meal_selection} onValueChange={(v) => setForm({ ...form, meal_selection: v })}>
                    <SelectTrigger><SelectValue placeholder="Select a meal" /></SelectTrigger>
                    <SelectContent>
                      {mealOptions.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {showDietary && (
                <div>
                  <Label htmlFor="dietary">Dietary Restrictions</Label>
                  <Input id="dietary" value={form.dietary_restrictions} onChange={(e) => setForm({ ...form, dietary_restrictions: e.target.value })} />
                </div>
              )}
              {allowPlusOne && (
                <>
                  <div className="flex items-center justify-between">
                    <Label>Plus One</Label>
                    <Switch checked={form.plus_one} onCheckedChange={(v) => setForm({ ...form, plus_one: v })} />
                  </div>
                  {form.plus_one && (
                    <div>
                      <Label>Plus One Name</Label>
                      <Input value={form.plus_one_name} onChange={(e) => setForm({ ...form, plus_one_name: e.target.value })} />
                    </div>
                  )}
                </>
              )}
              {(showGuestCount || showChildren) && (
                <div className="grid grid-cols-2 gap-4">
                  {showGuestCount && (
                    <div>
                      <Label>Number of Guests</Label>
                      <Input type="number" min={1} value={form.guest_count} onChange={(e) => setForm({ ...form, guest_count: parseInt(e.target.value) || 1 })} />
                    </div>
                  )}
                  {showChildren && (
                    <div>
                      <Label>Children</Label>
                      <Input type="number" min={0} value={form.children_count} onChange={(e) => setForm({ ...form, children_count: parseInt(e.target.value) || 0 })} />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {showSpecialRequests && (
            <div>
              <Label htmlFor="special">Special Requests</Label>
              <Textarea id="special" rows={3} value={form.special_requests} onChange={(e) => setForm({ ...form, special_requests: e.target.value })} />
            </div>
          )}

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

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
            style={{ backgroundColor: accent }}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit RSVP
          </Button>
        </form>
        )}
      </div>
    </div>
  );
}

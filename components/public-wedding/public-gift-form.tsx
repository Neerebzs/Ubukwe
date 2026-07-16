"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Gift, CheckCircle, Loader2, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { apiClient, PublicWeddingSite } from "@/lib/api";
import { toast } from "sonner";
import { HCaptchaField, useCaptchaEnabled } from "@/components/public-wedding/hcaptcha-field";

const GIFT_TYPES = [
  { value: "cash", label: "Cash" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "physical", label: "Physical Gift" },
  { value: "service", label: "Service Contribution" },
  { value: "other", label: "Other" },
];

const RELATIONSHIPS = ["family", "friend", "colleague", "organization", "church", "community", "other"];

interface GiftResult {
  id?: string;
  reference_number: string;
  contributor_name: string;
  message: string;
  payment_available?: boolean;
  amount?: string | null;
  currency?: string;
  gift_type?: string;
}

interface PayResult {
  payment_url?: string;
  already_paid?: boolean;
  message?: string;
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
  const [paying, setPaying] = useState(false);
  const [result, setResult] = useState<GiftResult | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const captchaEnabled = useCaptchaEnabled();
  const [payOnline, setPayOnline] = useState(true);
  const [form, setForm] = useState({
    contributor_name: "",
    contributor_phone: "",
    contributor_email: "",
    relationship: "friend",
    gift_type: "cash",
    privacy: "public",
    amount: "",
    currency: "RWF",
    payment_method: "",
    gift_name: "",
    gift_description: "",
    service_description: "",
    provider_name: "",
  });

  const canPayOnline =
    (form.gift_type === "cash" || form.gift_type === "mobile_money") &&
    Boolean(form.amount) &&
    parseFloat(form.amount) > 0;

  const startPayment = async (gift: GiftResult) => {
    setPaying(true);
    try {
      const res = await apiClient.gifts.payOnline<PayResult>(site.slug, {
        gift_id: gift.id,
        reference_number: gift.reference_number,
      }, preview);
      const data = unwrapData(res);
      if (data.already_paid) {
        toast.success(data.message || "Already paid");
        return;
      }
      if (data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }
      toast.error(data.message || "Could not start payment");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Payment failed to start");
    } finally {
      setPaying(false);
    }
  };

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
    if (payOnline && canPayOnline && !form.amount) {
      toast.error("Enter an amount to pay online");
      return;
    }

    const gift_details: Record<string, unknown> = {};
    if (form.gift_type === "cash" || form.gift_type === "mobile_money" || form.gift_type === "bank_transfer") {
      if (form.payment_method) gift_details.payment_method = form.payment_method;
      if (payOnline && canPayOnline) gift_details.payment_method = "dpo";
    }
    if (form.gift_type === "physical") {
      gift_details.gift_name = form.gift_name;
      gift_details.description = form.gift_description;
    }
    if (form.gift_type === "service") {
      gift_details.service_description = form.service_description;
      gift_details.provider_name = form.provider_name;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.gifts.registerPublic<GiftResult>(site.slug, {
        contributor_name: form.contributor_name,
        contributor_phone: form.contributor_phone,
        contributor_email: form.contributor_email || undefined,
        relationship: form.relationship,
        gift_type: form.gift_type,
        privacy: form.privacy,
        amount: form.amount ? parseFloat(form.amount) : undefined,
        currency: form.currency,
        gift_details,
        captcha_token: captchaToken || undefined,
        website_honeypot: honeypot || undefined,
      }, preview);
      const registered = unwrapData(res);
      setResult(registered);

      if (payOnline && registered.payment_available) {
        await startPayment(registered);
      }
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
            {result.amount && (
              <p className="text-sm text-slate-500 mt-2">
                {result.amount} {result.currency || "RWF"}
              </p>
            )}
          </div>
          {result.payment_available && (
            <Button
              onClick={() => startPayment(result)}
              disabled={paying}
              className="w-full"
              style={{ backgroundColor: accent }}
            >
              {paying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
              Pay Online (Card / Mobile Money)
            </Button>
          )}
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

          <div>
            <Label>Gift Type</Label>
            <Select value={form.gift_type} onValueChange={(v) => setForm({ ...form, gift_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GIFT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(form.gift_type === "cash" || form.gift_type === "mobile_money" || form.gift_type === "bank_transfer") && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount (RWF) *</Label>
                  <Input type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required={payOnline && canPayOnline} />
                </div>
                {!payOnline && (
                  <div>
                    <Label>Payment Method</Label>
                    <Input placeholder="MTN MoMo, Bank..." value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} />
                  </div>
                )}
              </div>
              {(form.gift_type === "cash" || form.gift_type === "mobile_money") && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label className="font-medium">Pay online now</Label>
                    <p className="text-xs text-slate-500 mt-0.5">Card or mobile money via DPO Pay</p>
                  </div>
                  <Switch checked={payOnline} onCheckedChange={setPayOnline} />
                </div>
              )}
            </>
          )}

          {form.gift_type === "physical" && (
            <>
              <div>
                <Label>Gift Name</Label>
                <Input value={form.gift_name} onChange={(e) => setForm({ ...form, gift_name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.gift_description} onChange={(e) => setForm({ ...form, gift_description: e.target.value })} />
              </div>
            </>
          )}

          {form.gift_type === "service" && (
            <>
              <div>
                <Label>Service Description</Label>
                <Textarea value={form.service_description} onChange={(e) => setForm({ ...form, service_description: e.target.value })} />
              </div>
              <div>
                <Label>Provider / Company</Label>
                <Input value={form.provider_name} onChange={(e) => setForm({ ...form, provider_name: e.target.value })} />
              </div>
            </>
          )}

          <div>
            <Label>Gift Privacy</Label>
            <RadioGroup value={form.privacy} onValueChange={(v) => setForm({ ...form, privacy: v })} className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="public" id="pub" />
                <Label htmlFor="pub" className="font-normal">Public — show my name</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="anonymous" id="anon" />
                <Label htmlFor="anon" className="font-normal">Anonymous — hide my name</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="private" id="priv" />
                <Label htmlFor="priv" className="font-normal">Private — couple only</Label>
              </div>
            </RadioGroup>
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

          <Button type="submit" className="w-full" disabled={submitting || paying} style={{ backgroundColor: accent }}>
            {(submitting || paying) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {payOnline && canPayOnline ? "Register & Pay Online" : "Register Gift"}
          </Button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Sparkles, MapPin, Star, Wallet, ChevronDown, ChevronUp,
  Loader2, RefreshCw, Trophy, Leaf, Gem, Info
} from "lucide-react";
import { fetchVendorRecommendations, RecommendationResult, VendorRecommendation } from "@/lib/api/vendorRecommendations";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { key: "venue",         label: "Venue",         emoji: "🏛️", color: "bg-blue-50 text-blue-700 border-blue-100" },
  { key: "catering",      label: "Catering",       emoji: "🍽️", color: "bg-orange-50 text-orange-700 border-orange-100" },
  { key: "decoration",    label: "Decoration",     emoji: "🌸", color: "bg-pink-50 text-pink-700 border-pink-100" },
  { key: "photography",   label: "Photography",    emoji: "📸", color: "bg-purple-50 text-purple-700 border-purple-100" },
  { key: "entertainment", label: "Entertainment",  emoji: "🎵", color: "bg-green-50 text-green-700 border-green-100" },
  { key: "other",         label: "Other",          emoji: "✨", color: "bg-slate-50 text-slate-700 border-slate-100" },
];

const DEFAULT_WEIGHTS: Record<string, number> = {
  venue: 30, catering: 25, decoration: 15,
  photography: 10, entertainment: 10, other: 10,
};

const BADGE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  "Best Match":      { icon: <Trophy className="h-3 w-3" />,  color: "bg-amber-50 text-amber-700 border-amber-200" },
  "Budget Friendly": { icon: <Leaf className="h-3 w-3" />,    color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "Premium Option":  { icon: <Gem className="h-3 w-3" />,     color: "bg-violet-50 text-violet-700 border-violet-200" },
  "Available":       { icon: <Info className="h-3 w-3" />,    color: "bg-slate-50 text-slate-600 border-slate-200" },
};

function VendorCard({ vendor, currency = "RWF" }: { vendor: VendorRecommendation; currency?: string }) {
  const router = useRouter();
  const badge = BADGE_CONFIG[vendor.badge] ?? BADGE_CONFIG["Available"];

  const formatPrice = (v: number | null) =>
    v != null ? `${v.toLocaleString()} ${currency}` : "—";

  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">
            {vendor.business_name || vendor.name}
          </p>
          {vendor.location && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-400 truncate">{vendor.city || vendor.location}</span>
            </div>
          )}
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border flex-shrink-0 ${badge.color}`}>
          {badge.icon}
          {vendor.badge}
        </span>
      </div>

      {/* Rating & Price */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold text-slate-700">{vendor.rating.toFixed(1)}</span>
          <span className="text-xs text-slate-400">({vendor.bookings_count} bookings)</span>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-800">
            {formatPrice(vendor.price_range_min)}
            {vendor.price_range_max && vendor.price_range_max !== vendor.price_range_min
              ? ` – ${formatPrice(vendor.price_range_max)}`
              : ""}
          </p>
          <p className="text-[10px] text-slate-400">
            Budget: {formatPrice(vendor.allocated_budget)}
          </p>
        </div>
      </div>

      {/* Specialties */}
      {vendor.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {vendor.specialties.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Score bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Match score</span>
          <span className="font-bold text-slate-600">{vendor.score.toFixed(0)}/100</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${vendor.score}%` }}
          />
        </div>
      </div>

      <Button
        size="sm"
        className="w-full rounded-xl text-xs font-bold"
        onClick={() => router.push(`/customer/dashboard?tab=booking&serviceId=${vendor.id}`, { scroll: false })}
      >
        Book Now
      </Button>
    </div>
  );
}

function CategorySection({
  catKey, vendors, allocation, currency,
}: {
  catKey: string;
  vendors: VendorRecommendation[];
  allocation: number;
  currency: string;
}) {
  const [open, setOpen] = useState(true);
  const meta = CATEGORIES.find((c) => c.key === catKey);
  if (!meta || vendors.length === 0) return null;

  return (
    <div className="space-y-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{meta.emoji}</span>
          <div className="text-left">
            <p className="font-bold text-slate-800 text-sm">{meta.label}</p>
            <p className="text-xs text-slate-400">
              Budget: <span className="font-semibold text-slate-600">{allocation.toLocaleString()} {currency}</span>
              {" · "}{vendors.length} match{vendors.length !== 1 ? "es" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${meta.color}`}>
            {Math.round((allocation / (vendors[0]?.allocated_budget || 1)) * 100 / 100 * 100)}% of budget
          </span>
          {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-2">
          {vendors.map((v) => (
            <VendorCard key={v.id} vendor={v} currency={currency} />
          ))}
        </div>
      )}
    </div>
  );
}

export function VendorRecommendations() {
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [showWeights, setShowWeights] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const currency = "RWF";

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const { data, isLoading, error, refetch } = useQuery<RecommendationResult>({
    queryKey: ["vendor-recommendations", budget, location, weights],
    queryFn: () =>
      fetchVendorRecommendations({
        total_budget: parseFloat(budget),
        location: location || undefined,
        top_n: 3,
        venue_weight: weights.venue / 100,
        catering_weight: weights.catering / 100,
        decoration_weight: weights.decoration / 100,
        photography_weight: weights.photography / 100,
        entertainment_weight: weights.entertainment / 100,
        other_weight: weights.other / 100,
      }),
    enabled: submitted && !!budget && parseFloat(budget) > 0,
    staleTime: 1000 * 60 * 5,
  });

  const handleSubmit = () => {
    if (!budget || parseFloat(budget) <= 0) return;
    setSubmitted(true);
    refetch();
  };

  const hasResults = data && Object.values(data.recommendations).some((v) => v.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-2xl">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">AI Vendor Recommendations</h2>
          <p className="text-sm text-slate-500">Smart matches based on your budget and priorities</p>
        </div>
      </div>

      {/* Input Card */}
      <Card className="border-none shadow-md rounded-2xl">
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Wedding Budget ({currency})
              </Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="number"
                  placeholder="e.g. 5000000"
                  value={budget}
                  onChange={(e) => { setBudget(e.target.value); setSubmitted(false); }}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Preferred Location (optional)
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="e.g. Kigali"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setSubmitted(false); }}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Priority weights toggle */}
          <button
            onClick={() => setShowWeights(!showWeights)}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            {showWeights ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Customize service priorities
            {totalWeight !== 100 && (
              <span className="text-rose-500 ml-1">(total: {totalWeight}% — must equal 100%)</span>
            )}
          </button>

          {showWeights && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              {CATEGORIES.map(({ key, label, emoji }) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold text-slate-600">
                      {emoji} {label}
                    </Label>
                    <span className="text-xs font-bold text-primary">{weights[key]}%</span>
                  </div>
                  <Slider
                    min={0}
                    max={60}
                    step={5}
                    value={[weights[key]]}
                    onValueChange={([v]) => {
                      setWeights((prev) => ({ ...prev, [key]: v }));
                      setSubmitted(false);
                    }}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!budget || parseFloat(budget) <= 0 || isLoading || totalWeight !== 100}
            className="w-full rounded-xl font-bold"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Finding matches...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Get Recommendations</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-sm text-rose-600 flex items-center gap-2">
          <Info className="h-4 w-4 flex-shrink-0" />
          {(error as Error).message}
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-6">
          {/* Summary bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <div>
              <p className="text-sm font-bold text-slate-800">{data.summary}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Total budget: <span className="font-semibold">{data.total_budget.toLocaleString()} {currency}</span>
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl gap-2">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>

          {/* Budget allocation pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ key, label, emoji, color }) => {
              const amount = data.budget_allocation[key];
              if (!amount) return null;
              return (
                <span key={key} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${color}`}>
                  {emoji} {label}: {amount.toLocaleString()} {currency}
                </span>
              );
            })}
          </div>

          {/* Category sections */}
          {hasResults ? (
            <div className="space-y-4">
              {CATEGORIES.map(({ key }) => (
                <CategorySection
                  key={key}
                  catKey={key}
                  vendors={data.recommendations[key] || []}
                  allocation={data.budget_allocation[key] || 0}
                  currency={currency}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-3">
              <p className="text-3xl">🔍</p>
              <p className="font-semibold text-slate-600">No vendors found for your criteria</p>
              <p className="text-sm text-slate-400">Try adjusting your budget or location</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

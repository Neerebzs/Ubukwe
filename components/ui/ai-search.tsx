"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Sparkles, X, Loader2, Star, MapPin, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
interface ServiceResult {
  id: string;
  name?: string;
  title?: string;
  service_name?: string;
  category: string;
  location: string;
  rating?: number;
  price_range_min?: number;
  price_range_max?: number;
  description?: string;
  thumbnail?: string;
  type: "service" | "event" | "offer";
  event_date?: string;
  valid_from?: string;
  valid_to?: string;
  service_id?: string;
}

interface AIResponse {
  message: string;
  services: ServiceResult[];
  events: ServiceResult[];
  offers: ServiceResult[];
  suggestions: string[];
}

interface AISearchProps {
  className?: string;
  open?: boolean;
  onClose?: () => void;
}

// ── Quick prompts ──────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  "Find a photographer in Kigali",
  "Upcoming events",
  "Special offers and deals",
  "Catering for 200 guests",
  "Outdoor venue with garden",
  "Traditional Intore dancers",
];

// ── Component ──────────────────────────────────────────────────────────────
export function AISearch({ className, open, onClose }: AISearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const panelRef      = useRef<HTMLDivElement>(null);
  const modalPanelRef = useRef<HTMLDivElement>(null);
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:4000").replace(/\/+$/, "");

  // Allow parent to open the panel via prop
  useEffect(() => {
    if (open !== undefined) setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const search = useCallback(async (q: string, loc?: string) => {
    const combined = loc?.trim() ? `${q} in ${loc}` : q;
    if (!combined.trim()) { setResponse(null); return; }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/ai-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: combined }),
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResponse(data.data ?? data);
    } catch {
      setError("Couldn't reach the search service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE]);

  const handleInput = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 3) {
      debounceRef.current = setTimeout(() => search(val, location), 500);
    } else {
      setResponse(null);
    }
  };

  const handleSearchSubmit = () => {
    if (!query.trim()) return;
    setIsOpen(true);
    search(query, location);
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (modalPanelRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      handleClose();
    };
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 100);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", handler); };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => modalInputRef.current?.focus(), 50);
  }, [isOpen]);

  return (
    <div ref={panelRef} className={cn("relative", className)}>

      {/* ── Trigger bar: [🔍 Search... | 📍 Location] [🔴] ── */}
      <div className="flex items-center bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-shadow overflow-hidden h-[50px]">

        {/* Search input */}
        <div className="flex items-center gap-2.5 flex-1 pl-5 pr-3 min-w-0">
          <Search className="h-[17px] w-[17px] flex-shrink-0 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={e => e.key === "Enter" && handleSearchSubmit()}
            placeholder="Search events, vendors..."
            className="flex-1 bg-transparent text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none min-w-0 font-medium"
          />
        </div>

        {/* Divider */}
        <div className="h-[26px] w-px bg-slate-200 flex-shrink-0" />

        {/* Location input */}
        <div className="flex items-center gap-2 flex-1 px-4 min-w-0">
          <MapPin className="h-[17px] w-[17px] flex-shrink-0 text-slate-500" />
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearchSubmit()}
            placeholder="Your Location"
            className="flex-1 bg-transparent text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none min-w-0 font-semibold"
          />
        </div>

        {/* Search button — brand green */}
        <button
          type="button"
          onClick={handleSearchSubmit}
          className="h-[50px] w-[54px] flex-shrink-0 flex items-center justify-center rounded-r-full transition-colors"
          style={{ background: "#668c65" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#527052")}
          onMouseLeave={e => (e.currentTarget.style.background = "#668c65")}
          aria-label="Search"
        >
          <Search className="h-[17px] w-[17px] text-white" />
        </button>
      </div>

          {/* ── Dropdown panel ── */}
      {isOpen && (
        <div
          ref={modalPanelRef}
          onMouseDown={e => e.stopPropagation()}
          className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-full min-w-[480px] max-w-[660px] bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/60 z-[200] max-h-[70vh] flex flex-col overflow-hidden"
        >
          {/* Scrollable results — no repeated inputs, panel is results-only */}
          <div className="overflow-y-auto">

            {isLoading && (
              <div className="flex items-center gap-3 p-5 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-[#668c65]" />
                <span className="text-sm font-medium">Searching with AI...</span>
              </div>
            )}

            {error && !isLoading && (
              <div className="p-5 text-sm text-rose-600 font-medium">{error}</div>
            )}

            {/* Quick prompts — shown when input is empty */}
            {!isLoading && !response && !error && query.length === 0 && (
              <div className="p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">Try asking</p>
                <div className="space-y-1">
                  {QUICK_PROMPTS.map(p => (
                    <button
                      key={p}
                      onClick={() => { setQuery(p); search(p, location); }}
                      className="w-full text-left px-4 py-3 rounded-2xl hover:bg-slate-50 text-sm text-slate-600 font-medium flex items-center gap-3 group transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#668c65]/40 flex-shrink-0" />
                      {p}
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 ml-auto group-hover:text-[#668c65] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {!isLoading && response && (
              <div className="divide-y divide-slate-50">

                {/* AI message */}
                <div className="p-5 flex items-start gap-3">
                  <div className="h-7 w-7 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#668c65]/60" />
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{response.message}</p>
                </div>

                {/* Services */}
                {response.services.length > 0 && (
                  <div className="p-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 pb-1">Services</p>
                    {response.services.map(svc => (
                      <button
                        key={svc.id}
                        onClick={() => { router.push(`/services/${svc.id}`); handleClose(); }}
                        className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                      >
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          {svc.thumbnail
                            ? <img src={svc.thumbnail} alt={svc.name ?? ""} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-slate-300 text-lg font-serif italic">{(svc.name ?? "S")[0]}</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate group-hover:text-[#668c65] transition-colors">{svc.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{svc.category}</span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400"><MapPin className="h-3 w-3" />{svc.location}</span>
                            {!!svc.rating && svc.rating > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-amber-500">
                                <Star className="h-3 w-3 fill-current" />{svc.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          {!!svc.price_range_min && (
                            <p className="text-[10px] text-slate-500 mt-0.5">From {svc.price_range_min.toLocaleString()} RWF</p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#668c65] flex-shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Events */}
                {response.events.length > 0 && (
                  <div className="p-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 pb-1">Events</p>
                    {response.events.map(evt => (
                      <button
                        key={evt.id}
                        onClick={() => { router.push(`/events/${evt.id}`); handleClose(); }}
                        className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                      >
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          {evt.thumbnail
                            ? <img src={evt.thumbnail} alt={evt.title ?? ""} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-slate-300 text-lg font-serif italic">{(evt.title ?? "E")[0]}</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate group-hover:text-[#668c65] transition-colors">{evt.title}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{evt.category}</span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400"><MapPin className="h-3 w-3" />{evt.location}</span>
                          </div>
                          {evt.event_date && (
                            <p className="text-[10px] text-slate-500 mt-0.5">{new Date(evt.event_date).toLocaleDateString()}</p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#668c65] flex-shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Offers */}
                {response.offers.length > 0 && (
                  <div className="p-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 pb-1">Special Offers</p>
                    {response.offers.map(offer => (
                      <button
                        key={offer.id}
                        onClick={() => { router.push(`/services/${offer.service_id}`); handleClose(); }}
                        className="w-full text-left p-3 rounded-2xl bg-amber-50/30 hover:bg-amber-50/60 transition-colors flex items-center gap-3 group"
                      >
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-amber-100 flex-shrink-0">
                          {offer.thumbnail
                            ? <img src={offer.thumbnail} alt={offer.title ?? ""} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-amber-200 flex items-center justify-center text-amber-700 text-lg font-serif italic">%</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate group-hover:text-[#668c65] transition-colors">{offer.title}</p>
                          <p className="text-[10px] text-slate-600 truncate">{offer.service_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-[10px] text-slate-400"><MapPin className="h-3 w-3" />{offer.location}</span>
                            {offer.valid_to && (
                              <span className="text-[10px] text-amber-600">Valid until {new Date(offer.valid_to).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#668c65] flex-shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {response.suggestions.length > 0 && (
                  <div className="p-4 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 pb-1">Try instead</p>
                    {response.suggestions.map(s => (
                      <button
                        key={s}
                        onClick={() => { setQuery(s); search(s, location); }}
                        className="w-full text-left px-4 py-2.5 rounded-2xl hover:bg-slate-50 text-sm text-slate-600 font-medium flex items-center gap-3 group transition-colors"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-[#668c65]/40 flex-shrink-0" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

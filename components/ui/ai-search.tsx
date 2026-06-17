"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Sparkles, X, Loader2, Star, MapPin, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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

const QUICK_PROMPTS = [
  "Find a photographer in Kigali",
  "Upcoming events",
  "Special offers and deals",
  "Catering for 200 guests",
  "Outdoor venue with garden",
  "Traditional Intore dancers",
];

interface AISearchProps {
  className?: string;
  /** When true the panel opens immediately — use with the mobile search icon */
  open?: boolean;
  /** Called when the panel is closed internally */
  onClose?: () => void;
}

export function AISearch({ className, open, onClose }: AISearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const modalInputRef = useRef<HTMLInputElement>(null);
  const modalPanelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:4000").replace(/\/+$/, "");

  // Allow parent to open the panel via prop (e.g. navbar search icon)
  useEffect(() => {
    if (open !== undefined) setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResponse(null); return; }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/ai-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResponse(data.data || data);
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
      debounceRef.current = setTimeout(() => search(val), 500);
    } else {
      setResponse(null);
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (modalPanelRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      handleClose();
    };
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 100);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", handler); };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus panel input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => modalInputRef.current?.focus(), 50);
  }, [isOpen]);

  return (
    <div ref={panelRef} className={cn("relative", className)}>
      {/* Trigger button — hidden when panel is open */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-3 bg-white border border-slate-200 rounded-full py-2.5 pl-4 pr-5 shadow-sm hover:border-slate-300 hover:shadow transition-all text-left"
        >
          <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
          <span className={cn("text-sm truncate", query ? "text-slate-700" : "text-slate-400")}>
            {query || "Search vendors, venues…"}
          </span>
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div
          ref={modalPanelRef}
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[640px] max-w-[95vw] bg-white rounded-3xl overflow-hidden z-[200] max-h-[80vh] flex flex-col border border-slate-100 shadow-xl shadow-slate-200/60"
        >
          {/* Panel header — single real input */}
          <div className="sticky top-0 z-10 bg-white px-5 pt-5 pb-4 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  ref={modalInputRef}
                  type="text"
                  value={query}
                  onChange={e => handleInput(e.target.value)}
                  onMouseDown={e => e.stopPropagation()}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (query.trim()) search(query); } }}
                  placeholder="Ask AI — find venues, photographers…"
                  className="w-full bg-white border border-slate-200 rounded-full py-3 pl-11 pr-28 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {query && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setQuery(""); setResponse(null); }}
                      className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); if (query.trim()) search(query); }}
                    disabled={!query.trim() || isLoading}
                    className="h-9 px-4 flex items-center gap-2 rounded-full bg-(--primary) hover:bg-(--primary)/90 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading
                      ? <Loader2 className="h-4 w-4 text-white animate-spin" />
                      : <><Sparkles className="h-3.5 w-3.5 text-white" /><span className="text-[10px] font-bold text-white uppercase tracking-wider">Ask AI</span></>
                    }
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="h-11 w-11 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Scrollable results */}
          <div className="overflow-y-auto">
            {isLoading && (
              <div className="flex items-center gap-3 p-5 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-(--primary)" />
                <span className="text-sm font-medium">Searching with AI...</span>
              </div>
            )}

            {error && !isLoading && (
              <div className="p-5 text-sm text-rose-600 font-medium">{error}</div>
            )}

            {!isLoading && !response && !error && query.length === 0 && (
              <div className="p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">Try asking</p>
                <div className="space-y-1">
                  {QUICK_PROMPTS.map(p => (
                    <button key={p} onClick={() => { setQuery(p); search(p); }}
                      className="w-full text-left px-4 py-3 rounded-2xl hover:bg-slate-50 text-sm text-slate-600 font-medium flex items-center gap-3 group transition-colors">
                      <Sparkles className="h-3.5 w-3.5 text-(--primary)/40 flex-shrink-0" />
                      {p}
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 ml-auto group-hover:text-(--primary) transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isLoading && response && (
              <div className="divide-y divide-slate-50">
                <div className="p-5 flex items-start gap-3">
                  <div className="h-7 w-7 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5 text-(--primary)/60" />
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{response.message}</p>
                </div>

                {response.services.length > 0 && (
                  <div className="p-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 pb-1">Services</p>
                    {response.services.map(svc => (
                      <button key={svc.id} onClick={() => { router.push(`/services/${svc.id}`); handleClose(); }}
                        className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-3 group">
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          {svc.thumbnail
                            ? <img src={svc.thumbnail} alt={svc.name || ''} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-slate-300 text-lg font-serif italic">{(svc.name || 'S')[0]}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate group-hover:text-(--primary) transition-colors">{svc.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{svc.category}</span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400"><MapPin className="h-3 w-3" />{svc.location}</span>
                            {svc.rating && svc.rating > 0 && <span className="flex items-center gap-1 text-[10px] text-amber-500"><Star className="h-3 w-3 fill-current" />{svc.rating.toFixed(1)}</span>}
                          </div>
                          {svc.price_range_min && <p className="text-[10px] text-slate-500 mt-0.5">From {svc.price_range_min.toLocaleString()} RWF</p>}
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-(--primary) flex-shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                {response.events.length > 0 && (
                  <div className="p-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 pb-1">Events</p>
                    {response.events.map(evt => (
                      <button key={evt.id} onClick={() => { router.push(`/events/${evt.id}`); handleClose(); }}
                        className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-3 group">
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          {evt.thumbnail
                            ? <img src={evt.thumbnail} alt={evt.title || ''} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-slate-300 text-lg font-serif italic">{(evt.title || 'E')[0]}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate group-hover:text-(--primary) transition-colors">{evt.title}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{evt.category}</span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400"><MapPin className="h-3 w-3" />{evt.location}</span>
                          </div>
                          {evt.event_date && <p className="text-[10px] text-slate-500 mt-0.5">{new Date(evt.event_date).toLocaleDateString()}</p>}
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-(--primary) flex-shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                {response.offers.length > 0 && (
                  <div className="p-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 pb-1">Special Offers</p>
                    {response.offers.map(offer => (
                      <button key={offer.id} onClick={() => { router.push(`/services/${offer.service_id}`); handleClose(); }}
                        className="w-full text-left p-3 rounded-2xl bg-amber-50/30 hover:bg-amber-50/60 transition-colors flex items-center gap-3 group">
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-amber-100 flex-shrink-0">
                          {offer.thumbnail
                            ? <img src={offer.thumbnail} alt={offer.title || ''} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-amber-200 flex items-center justify-center text-amber-700 text-lg font-serif italic">%</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate group-hover:text-(--primary) transition-colors">{offer.title}</p>
                          <p className="text-[10px] text-slate-600 truncate">{offer.service_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-[10px] text-slate-400"><MapPin className="h-3 w-3" />{offer.location}</span>
                            {offer.valid_to && <span className="text-[10px] text-amber-600">Valid until {new Date(offer.valid_to).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-(--primary) flex-shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                {response.suggestions.length > 0 && (
                  <div className="p-4 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 pb-1">Try instead</p>
                    {response.suggestions.map(s => (
                      <button key={s} onClick={() => { setQuery(s); search(s); }}
                        className="w-full text-left px-4 py-2.5 rounded-2xl hover:bg-slate-50 text-sm text-slate-600 font-medium flex items-center gap-3 group transition-colors">
                        <Sparkles className="h-3.5 w-3.5 text-(--primary)/40 flex-shrink-0" />
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Mic2, CheckCircle, Circle, Loader2, ArrowLeft, Clock, Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { apiClient, MCPortalData, MCProgramItem } from "@/lib/api";
import { toast } from "sonner";

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

export function PublicMcPortal({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || undefined;
  const preview = searchParams.get("preview") || undefined;

  const [data, setData] = useState<MCPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState(token || "");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async (t?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.mcPortal.getPublic<MCPortalData>(slug, t || token, preview);
      setData(unwrap(res));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Access denied");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [slug, token, preview]);

  const complete = async (itemId: string) => {
    try {
      await apiClient.mcPortal.completeActivity(slug, itemId, accessToken || token);
      toast.success("Activity completed");
      load(accessToken || token);
    } catch {
      toast.error("Failed to update");
    }
  };

  const saveNotes = async (itemId: string) => {
    try {
      await apiClient.mcPortal.saveNotes(slug, itemId, notes[itemId] || "", accessToken || token);
      toast.success("Notes saved");
    } catch {
      toast.error("Failed to save notes");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d182a] text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d182a] text-white p-6">
        <div className="max-w-sm w-full space-y-4 text-center">
          <Mic2 className="h-12 w-12 mx-auto text-[#668c65]" />
          <h1 className="font-serif text-2xl">MC Portal</h1>
          <p className="text-white/60 text-sm">{error === "Access denied" ? "This portal requires an access token." : error}</p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter MC access token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
            <Button onClick={() => load(accessToken)} className="bg-[#668c65]">Enter</Button>
          </div>
          <Link href={`/w/${slug}`} className="text-sm text-white/50 hover:text-white inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const currentId = data.live_status.current_activity_id;
  const completed = data.live_status.completed_count;
  const total = data.live_status.total_count;

  return (
    <div className="min-h-screen bg-[#0d182a] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#668c65]">MC Portal</p>
            <h1 className="font-serif text-2xl">{data.wedding.couple_name}</h1>
            {data.wedding.wedding_date && (
              <p className="text-sm text-white/50">
                {new Date(data.wedding.wedding_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-serif">{completed}/{total}</p>
            <p className="text-xs text-white/50">Completed</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-4">
        {(data.announcements?.length ?? 0) > 0 && (
          <div className="space-y-3 mb-6">
            <h2 className="text-sm uppercase tracking-widest text-[#668c65] flex items-center gap-2">
              <Megaphone className="h-4 w-4" /> Announcements
            </h2>
            {data.announcements!.map((a) => (
              <div
                key={a.id}
                className={`rounded-xl p-4 border ${
                  a.priority === "urgent"
                    ? "bg-red-500/10 border-red-400/30"
                    : "bg-amber-500/10 border-amber-400/20"
                }`}
              >
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-white/70 mt-1">{a.message}</p>
              </div>
            ))}
          </div>
        )}

        {data.program.map((item: MCProgramItem) => {
          const isCurrent = item.id === currentId;
          return (
            <div
              key={item.id}
              className={`rounded-2xl p-5 border transition-all ${
                item.is_completed
                  ? "bg-white/5 border-white/10 opacity-60"
                  : isCurrent
                    ? "bg-[#668c65]/20 border-[#668c65]/40 ring-1 ring-[#668c65]/30"
                    : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => !item.is_completed && complete(item.id)}
                  className="mt-1 flex-shrink-0"
                  disabled={item.is_completed}
                >
                  {item.is_completed ? (
                    <CheckCircle className="h-6 w-6 text-[#668c65]" />
                  ) : (
                    <Circle className="h-6 w-6 text-white/30 hover:text-[#668c65]" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3 w-3 text-white/40" />
                    <span className="font-mono text-sm">{item.start_time?.slice(0, 5)}</span>
                    {isCurrent && <span className="text-xs bg-[#668c65] px-2 py-0.5 rounded-full">NOW</span>}
                  </div>
                  <h3 className={`font-medium text-lg ${item.is_completed ? "line-through" : ""}`}>{item.title}</h3>
                  {item.responsible_person && (
                    <p className="text-sm text-white/50">Responsible: {item.responsible_person}</p>
                  )}
                  {item.couple_notes && (
                    <p className="text-sm text-amber-200/80 mt-2 bg-amber-500/10 p-2 rounded">{item.couple_notes}</p>
                  )}
                  <div className="mt-3 space-y-2">
                    <Textarea
                      placeholder="MC private notes..."
                      value={notes[item.id] ?? item.mc_private_notes ?? ""}
                      onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
                      className="bg-white/5 border-white/10 text-white text-sm min-h-[60px]"
                    />
                    <Button size="sm" variant="outline" className="border-white/20 text-white/80" onClick={() => saveNotes(item.id)}>
                      Save Notes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <footer className="text-center py-8 text-white/30 text-xs">
        <Link href={`/w/${slug}`} className="hover:text-white/60 inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Wedding Site
        </Link>
      </footer>
    </div>
  );
}

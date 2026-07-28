"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Mic2, CheckCircle, Circle, Loader2, ArrowLeft, Clock, Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient, MCPortalData, MCProgramItem } from "@/lib/api";
import { toast } from "sonner";

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

export function PublicMcPortal({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") || undefined;

  const [data, setData] = useState<MCPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.mcPortal.getPublic<MCPortalData>(slug, undefined, preview);
      setData(unwrap(res));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load MC portal");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [slug, preview]);

  const complete = async (itemId: string) => {
    setCompletingId(itemId);
    try {
      await apiClient.mcPortal.completeActivity(slug, itemId);
      toast.success("Marked as completed");
      await load();
    } catch {
      toast.error("Failed to update");
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f6] text-slate-700">
        <Loader2 className="h-8 w-8 animate-spin text-[#668c65]" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8f6] text-slate-900 p-6">
        <div className="max-w-sm w-full space-y-4 text-center">
          <Mic2 className="h-12 w-12 mx-auto text-[#668c65]" />
          <h1 className="font-serif text-2xl">MC Portal</h1>
          <p className="text-slate-500 text-sm">{error}</p>
          <Button onClick={() => load()} className="bg-[#668c65] hover:bg-[#557a54] text-white">
            Try again
          </Button>
          <div>
            <Link href={`/w/${slug}`} className="text-sm text-slate-400 hover:text-slate-700 inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const currentId = data.live_status.current_activity_id;
  const completed = data.live_status.completed_count;
  const total = data.live_status.total_count;

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#668c65]">MC Portal</p>
            <h1 className="font-serif text-2xl text-slate-900">{data.wedding.couple_name}</h1>
            {data.wedding.wedding_date && (
              <p className="text-sm text-slate-500">
                {new Date(data.wedding.wedding_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-serif text-slate-900">{completed}/{total}</p>
            <p className="text-xs text-slate-500">Completed</p>
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
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <p className="font-medium text-slate-900">{a.title}</p>
                <p className="text-sm text-slate-600 mt-1">{a.message}</p>
              </div>
            ))}
          </div>
        )}

        {data.program.map((item: MCProgramItem) => {
          const isCurrent = item.id === currentId;
          const isCompleting = completingId === item.id;
          return (
            <div
              key={item.id}
              className={`rounded-2xl p-5 border transition-all ${
                item.is_completed
                  ? "bg-white border-slate-200 opacity-60"
                  : isCurrent
                    ? "bg-[#eef3ee] border-[#668c65]/40 ring-1 ring-[#668c65]/25"
                    : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => !item.is_completed && complete(item.id)}
                  className="mt-1 flex-shrink-0"
                  disabled={item.is_completed || isCompleting}
                  aria-label={item.is_completed ? "Completed" : "Mark as completed"}
                >
                  {item.is_completed ? (
                    <CheckCircle className="h-6 w-6 text-[#668c65]" />
                  ) : isCompleting ? (
                    <Loader2 className="h-6 w-6 animate-spin text-[#668c65]" />
                  ) : (
                    <Circle className="h-6 w-6 text-slate-300 hover:text-[#668c65]" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="font-mono text-sm text-slate-600">{item.start_time?.slice(0, 5)}</span>
                    {isCurrent && (
                      <span className="text-xs bg-[#668c65] text-white px-2 py-0.5 rounded-full">NOW</span>
                    )}
                    {item.is_completed && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Done</span>
                    )}
                  </div>
                  <h3 className={`font-medium text-lg text-slate-900 ${item.is_completed ? "line-through text-slate-400" : ""}`}>
                    {item.title}
                  </h3>
                  {item.responsible_person && (
                    <p className="text-sm text-slate-500">Responsible: {item.responsible_person}</p>
                  )}
                  {item.couple_notes && (
                    <p className="text-sm text-amber-800 mt-2 bg-amber-50 border border-amber-100 p-2 rounded">{item.couple_notes}</p>
                  )}
                  {!item.is_completed && (
                    <Button
                      size="sm"
                      className="mt-3 bg-[#668c65] hover:bg-[#557a54] text-white"
                      disabled={isCompleting}
                      onClick={() => complete(item.id)}
                    >
                      {isCompleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Marking…
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark complete
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <footer className="text-center py-8 text-slate-400 text-xs">
        <Link href={`/w/${slug}`} className="hover:text-slate-600 inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Wedding Site
        </Link>
      </footer>
    </div>
  );
}

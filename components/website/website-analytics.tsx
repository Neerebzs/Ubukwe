"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Eye, Users, Gift, MessageSquare, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/cache";

interface Analytics {
  page_views: number;
  rsvp_confirmed: number;
  gift_registrations: number;
  guestbook_messages: number;
  rsvp_conversion_rate: number;
  website_slug?: string;
  recent_activity: Array<{ event_type: string; path?: string; created_at?: string }>;
}

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

export function WebsiteAnalytics({ weddingId }: { weddingId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.wedding.analytics(weddingId),
    queryFn: async () => unwrap(await apiClient.guestbook.analytics<Analytics>(weddingId)),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const stats = [
    { label: "Page Views", value: data?.page_views ?? 0, icon: Eye },
    { label: "RSVPs Confirmed", value: data?.rsvp_confirmed ?? 0, icon: Users },
    { label: "Gift Registrations", value: data?.gift_registrations ?? 0, icon: Gift },
    { label: "Guestbook Messages", value: data?.guestbook_messages ?? 0, icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-0 shadow-md">
            <CardContent className="pt-6 flex items-center gap-3">
              <s.icon className="h-5 w-5 text-[#668c65]" />
              <div>
                <p className="text-2xl font-serif">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="pt-6 flex items-center gap-4">
          <TrendingUp className="h-8 w-8 text-[#668c65]" />
          <div>
            <p className="text-3xl font-serif">{data?.rsvp_conversion_rate ?? 0}%</p>
            <p className="text-sm text-slate-500">RSVP Conversion Rate</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(data?.recent_activity || []).length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No activity logged yet</p>
          ) : (
            <div className="space-y-2">
              {data?.recent_activity.map((a, i) => (
                <div key={i} className="flex justify-between text-sm p-2 rounded bg-slate-50">
                  <span className="capitalize">{a.event_type.replace(/_/g, " ")}</span>
                  <span className="text-slate-400">{a.path || "—"}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

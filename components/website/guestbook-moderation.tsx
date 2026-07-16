"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/cache";
import { toast } from "sonner";

interface GuestbookEntry {
  id: string;
  author_name: string;
  message?: string;
  status: string;
  created_at: string;
}

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

export function GuestbookModeration({ weddingId }: { weddingId: string }) {
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: queryKeys.wedding.guestbook(weddingId),
    queryFn: async () => unwrap(await apiClient.guestbook.listAdmin<GuestbookEntry[]>(weddingId)),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.guestbook(weddingId) });

  const moderate = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.guestbook.moderate(weddingId, id, status),
    onSuccess: (_, vars) => {
      toast.success(`Message ${vars.status}`);
      invalidate();
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const pending = entries.filter((e) => e.status === "pending");

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#668c65]" />
          Guestbook Moderation
          {pending.length > 0 && (
            <Badge className="bg-amber-100 text-amber-800">{pending.length} pending</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-center text-slate-400 py-6">No guestbook messages yet</p>
        ) : entries.map((entry) => (
          <div key={entry.id} className="p-4 rounded-xl border bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{entry.author_name}</span>
              <Badge className={`capitalize ${
                entry.status === "approved" ? "bg-emerald-100 text-emerald-800" :
                entry.status === "rejected" ? "bg-red-100 text-red-700" :
                "bg-amber-100 text-amber-800"
              }`}>{entry.status}</Badge>
            </div>
            <p className="text-sm text-slate-600">{entry.message}</p>
            {entry.status === "pending" && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => moderate.mutate({ id: entry.id, status: "approved" })}>
                  <CheckCircle className="h-3 w-3 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => moderate.mutate({ id: entry.id, status: "rejected" })}>
                  <XCircle className="h-3 w-3 mr-1" /> Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

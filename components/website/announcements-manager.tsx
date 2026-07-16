"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Loader2, Plus, Trash2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiClient, WeddingAnnouncement } from "@/lib/api";
import { queryKeys } from "@/lib/cache";
import { toast } from "sonner";

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  normal: "bg-blue-100 text-blue-800",
  urgent: "bg-red-100 text-red-800",
};

export function AnnouncementsManager({ weddingId }: { weddingId: string }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    priority: "normal",
    notify_mc: true,
  });

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: queryKeys.wedding.announcements(weddingId),
    queryFn: async () => unwrap(await apiClient.announcements.list<WeddingAnnouncement[]>(weddingId)),
  });

  const createMutation = useMutation({
    mutationFn: () => apiClient.announcements.create(weddingId, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wedding.announcements(weddingId) });
      setForm({ title: "", message: "", priority: "normal", notify_mc: true });
      setShowForm(false);
      toast.success("Announcement sent to MC portal");
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.announcements.delete(weddingId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wedding.announcements(weddingId) });
      toast.success("Announcement removed");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      apiClient.announcements.update(weddingId, id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.wedding.announcements(weddingId) }),
  });

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Wedding Announcements
            </CardTitle>
            <CardDescription>Broadcast updates to your MC and wedding team</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-[#668c65] hover:bg-[#668c65]/90">
            <Plus className="h-4 w-4 mr-1" /> New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-4 rounded-xl border bg-slate-50 space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Venue change notice" />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Reception moved to Hall B..." />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.notify_mc} onCheckedChange={(v) => setForm({ ...form, notify_mc: v })} />
                <Label className="font-normal">Notify MC</Label>
              </div>
            </div>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!form.title.trim() || !form.message.trim() || createMutation.isPending}
              className="bg-[#668c65] hover:bg-[#668c65]/90"
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
              Publish Announcement
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
        ) : announcements.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-6">No announcements yet</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className={`p-4 rounded-xl border ${a.is_active ? "bg-white" : "bg-slate-50 opacity-60"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{a.title}</p>
                      <Badge className={PRIORITY_STYLES[a.priority] || ""}>{a.priority}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{a.message}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={a.is_active}
                      onCheckedChange={(v) => toggleMutation.mutate({ id: a.id, is_active: v })}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteMutation.mutate(a.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

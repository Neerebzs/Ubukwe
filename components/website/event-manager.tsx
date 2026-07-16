"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, Loader2, Trash2, MapPin, Sparkles } from "lucide-react";
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
import { apiClient, WeddingEventItem } from "@/lib/api";
import { queryKeys } from "@/lib/cache";
import { toast } from "sonner";

const EVENT_TYPES = [
  { value: "engagement", label: "Engagement" },
  { value: "traditional_ceremony", label: "Traditional Ceremony" },
  { value: "church_wedding", label: "Church Wedding" },
  { value: "civil_marriage", label: "Civil Marriage" },
  { value: "reception", label: "Reception" },
  { value: "after_party", label: "After Party" },
  { value: "brunch", label: "Brunch" },
  { value: "other", label: "Other" },
];

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

const emptyForm = {
  title: "",
  event_type: "reception",
  event_date: "",
  start_time: "",
  end_time: "",
  venue_name: "",
  venue_address: "",
  dress_code: "",
  google_maps_url: "",
  notes: "",
  is_public: true,
};

export function EventManager({ weddingId }: { weddingId: string }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: events = [], isLoading } = useQuery({
    queryKey: queryKeys.wedding.events(weddingId),
    queryFn: async () => unwrap(await apiClient.events.list<WeddingEventItem[]>(weddingId)),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.events(weddingId) });

  const createMutation = useMutation({
    mutationFn: () => apiClient.events.create(weddingId, form),
    onSuccess: () => {
      toast.success("Event created");
      invalidate();
      setForm(emptyForm);
      setShowForm(false);
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed"),
  });

  const seedMutation = useMutation({
    mutationFn: () => apiClient.events.seed(weddingId),
    onSuccess: () => { toast.success("Default event seeded"); invalidate(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.events.delete(weddingId, id),
    onSuccess: () => { toast.success("Event removed"); invalidate(); },
  });

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Wedding Events
            </CardTitle>
            <CardDescription>Engagement, ceremony, reception, and more</CardDescription>
          </div>
          <div className="flex gap-2">
            {events.length === 0 && (
              <Button variant="outline" size="sm" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                <Sparkles className="h-4 w-4 mr-1" /> Seed Default
              </Button>
            )}
            <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-[#668c65] hover:bg-[#668c65]/90">
              <Plus className="h-4 w-4 mr-1" /> Add Event
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-4 rounded-xl border bg-slate-50 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Wedding Reception" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Start</Label>
                  <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                </div>
                <div>
                  <Label>End</Label>
                  <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Venue</Label>
                <Input value={form.venue_name} onChange={(e) => setForm({ ...form, venue_name: e.target.value })} />
              </div>
              <div>
                <Label>Dress Code</Label>
                <Input value={form.dress_code} onChange={(e) => setForm({ ...form, dress_code: e.target.value })} placeholder="Formal / Traditional" />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Textarea rows={2} value={form.venue_address} onChange={(e) => setForm({ ...form, venue_address: e.target.value })} />
            </div>
            <div>
              <Label>Google Maps URL</Label>
              <Input value={form.google_maps_url} onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })} placeholder="https://maps.google.com/..." />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_public} onCheckedChange={(v) => setForm({ ...form, is_public: v })} />
              <Label className="font-normal">Visible on public site</Label>
            </div>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!form.title.trim() || !form.event_date || createMutation.isPending}
              className="bg-[#668c65] hover:bg-[#668c65]/90"
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Event
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : events.length === 0 ? (
          <p className="text-center text-slate-400 py-6">No events yet — add your ceremony, reception, etc.</p>
        ) : (
          <div className="space-y-3">
            {events.map((evt) => (
              <div key={evt.id} className="p-4 rounded-xl border bg-white flex gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{evt.title}</p>
                    <Badge variant="outline" className="text-xs capitalize">{evt.event_type.replace(/_/g, " ")}</Badge>
                    {!evt.is_public && <Badge className="text-xs bg-slate-100">Private</Badge>}
                  </div>
                  <p className="text-sm text-slate-600">
                    {new Date(evt.event_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    {evt.start_time && ` · ${evt.start_time.slice(0, 5)}`}
                    {evt.end_time && ` – ${evt.end_time.slice(0, 5)}`}
                  </p>
                  {evt.venue_name && (
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {evt.venue_name}
                    </p>
                  )}
                  {evt.dress_code && <p className="text-xs text-slate-400 mt-1">Dress code: {evt.dress_code}</p>}
                </div>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate(evt.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

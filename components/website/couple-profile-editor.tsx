"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, WeddingWebsite } from "@/lib/api";
import { queryKeys } from "@/lib/cache";
import { toast } from "sonner";

interface CoupleProfileEditorProps {
  weddingId: string;
  website: WeddingWebsite;
}

export function CoupleProfileEditor({ weddingId, website }: CoupleProfileEditorProps) {
  const queryClient = useQueryClient();
  const profile = website.couple_profile || {};
  const [form, setForm] = useState({
    bride_name: (profile.bride_name as string) || "",
    groom_name: (profile.groom_name as string) || "",
    display_names: (profile.display_names as string) || "",
    biography: (profile.biography as string) || "",
    love_story: (profile.love_story as string) || "",
    proposal_story: (profile.proposal_story as string) || "",
  });
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setForm({
      bride_name: (profile.bride_name as string) || "",
      groom_name: (profile.groom_name as string) || "",
      display_names: (profile.display_names as string) || "",
      biography: (profile.biography as string) || "",
      love_story: (profile.love_story as string) || "",
      proposal_story: (profile.proposal_story as string) || "",
    });
  }, [website.couple_profile]);

  const saveMutation = useMutation({
    mutationFn: (couple_profile: Record<string, unknown>) =>
      apiClient.website.update(weddingId, { couple_profile }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wedding.website(weddingId) });
      setSaving(false);
    },
    onError: () => {
      toast.error("Failed to save profile");
      setSaving(false);
    },
  });

  const scheduleSave = (next: typeof form) => {
    setForm(next);
    setSaving(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveMutation.mutate({
        ...profile,
        ...next,
        display_names: next.display_names || `${next.bride_name} & ${next.groom_name}`,
      });
    }, 2000);
  };

  const saveNow = () => {
    if (timer.current) clearTimeout(timer.current);
    setSaving(true);
    saveMutation.mutate({
      ...profile,
      ...form,
      display_names: form.display_names || `${form.bride_name} & ${form.groom_name}`,
    });
    toast.success("Profile saved");
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="font-serif text-lg">Couple Profile</CardTitle>
        <CardDescription>
          Edit names and story — auto-saves after 2 seconds
          {saving && <span className="ml-2 inline-flex items-center gap-1 text-amber-600"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Bride Name</Label>
            <Input value={form.bride_name} onChange={(e) => scheduleSave({ ...form, bride_name: e.target.value })} />
          </div>
          <div>
            <Label>Groom Name</Label>
            <Input value={form.groom_name} onChange={(e) => scheduleSave({ ...form, groom_name: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Display Names (shown on site)</Label>
          <Input
            value={form.display_names}
            placeholder="Emma & John"
            onChange={(e) => scheduleSave({ ...form, display_names: e.target.value })}
          />
        </div>
        <div>
          <Label>Biography</Label>
          <Textarea rows={3} value={form.biography} onChange={(e) => scheduleSave({ ...form, biography: e.target.value })} />
        </div>
        <div>
          <Label>Love Story</Label>
          <Textarea rows={4} value={form.love_story} onChange={(e) => scheduleSave({ ...form, love_story: e.target.value })} />
        </div>
        <div>
          <Label>Proposal Story</Label>
          <Textarea rows={3} value={form.proposal_story} onChange={(e) => scheduleSave({ ...form, proposal_story: e.target.value })} />
        </div>
        <Button variant="outline" onClick={saveNow} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 mr-2" /> Save Now
        </Button>
      </CardContent>
    </Card>
  );
}

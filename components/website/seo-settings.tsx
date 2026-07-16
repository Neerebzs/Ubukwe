"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, WeddingWebsite } from "@/lib/api";
import { queryKeys } from "@/lib/cache";
import { toast } from "sonner";

export function SeoSettings({ weddingId, website }: { weddingId: string; website: WeddingWebsite }) {
  const queryClient = useQueryClient();
  const seo = website.seo_config || {};
  const [form, setForm] = useState({
    meta_title: (seo.meta_title as string) || "",
    meta_description: (seo.meta_description as string) || "",
    meta_keywords: (seo.meta_keywords as string) || "",
    og_image: (seo.og_image as string) || "",
  });
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setForm({
      meta_title: (seo.meta_title as string) || "",
      meta_description: (seo.meta_description as string) || "",
      meta_keywords: (seo.meta_keywords as string) || "",
      og_image: (seo.og_image as string) || "",
    });
  }, [website.seo_config]);

  const saveMutation = useMutation({
    mutationFn: (seo_config: Record<string, unknown>) =>
      apiClient.website.update(weddingId, { seo_config }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wedding.website(weddingId) });
      setSaving(false);
    },
  });

  const scheduleSave = (next: typeof form) => {
    setForm(next);
    setSaving(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveMutation.mutate(next), 2000);
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="font-serif text-lg">SEO Settings</CardTitle>
        <CardDescription>
          Optimize how your site appears in search and social shares
          {saving && <span className="ml-2 text-amber-600 inline-flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Meta Title</Label>
          <Input value={form.meta_title} onChange={(e) => scheduleSave({ ...form, meta_title: e.target.value })} placeholder="Emma & John — Wedding" />
        </div>
        <div>
          <Label>Meta Description</Label>
          <Textarea rows={3} value={form.meta_description} onChange={(e) => scheduleSave({ ...form, meta_description: e.target.value })} placeholder="Join us in celebrating our wedding..." />
        </div>
        <div>
          <Label>Keywords (comma-separated)</Label>
          <Input value={form.meta_keywords} onChange={(e) => scheduleSave({ ...form, meta_keywords: e.target.value })} placeholder="wedding, Kigali, Emma, John" />
        </div>
        <div>
          <Label>Open Graph Image URL</Label>
          <Input value={form.og_image} onChange={(e) => scheduleSave({ ...form, og_image: e.target.value })} placeholder="https://..." />
        </div>
        <Button variant="outline" onClick={() => { if (timer.current) clearTimeout(timer.current); saveMutation.mutate(form); toast.success("SEO saved"); }}>
          <Save className="h-4 w-4 mr-2" /> Save Now
        </Button>
      </CardContent>
    </Card>
  );
}

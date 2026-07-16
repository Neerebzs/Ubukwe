"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Globe, ExternalLink, Eye, Rocket, Archive, Loader2,
  Copy, Check, Sparkles, Link2, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient, WeddingWebsite } from "@/lib/api";
import { queryKeys, dynamicQueryOptions } from "@/lib/cache";
import { toast } from "sonner";
import { SectionBuilder } from "@/components/website/section-builder";
import { CoupleProfileEditor } from "@/components/website/couple-profile-editor";
import { WebsiteLivePreview } from "@/components/website/website-live-preview";
import { GiftManagement } from "@/components/website/gift-management";
import { McProgramEditor } from "@/components/website/mc-program-editor";
import { WeddingTeamManager } from "@/components/website/wedding-team-manager";
import { GuestbookModeration } from "@/components/website/guestbook-moderation";
import { SeoSettings } from "@/components/website/seo-settings";
import { WebsiteAnalytics } from "@/components/website/website-analytics";
import { CustomDomainSettings } from "@/components/website/custom-domain-settings";
import { GuestAccessSettings } from "@/components/website/guest-access-settings";
import { AnnouncementsManager } from "@/components/website/announcements-manager";
import { WebsiteShareQr } from "@/components/website/website-share-qr";
import { RsvpSettings } from "@/components/website/rsvp-settings";
import { GalleryManager } from "@/components/website/gallery-manager";
import { EventManager } from "@/components/website/event-manager";
import { TimelineManager } from "@/components/website/timeline-manager";

const THEMES = [
  { id: "elegant_classic", name: "Elegant Classic" },
  { id: "luxury_gold", name: "Luxury Gold" },
  { id: "modern_minimal", name: "Modern Minimal" },
  { id: "rustic_garden", name: "Rustic Garden" },
  { id: "beach", name: "Beach" },
  { id: "traditional_african", name: "Traditional African" },
  { id: "royal", name: "Royal" },
  { id: "dark_mode", name: "Dark Mode" },
];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  preview: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-red-100 text-red-700",
};

interface WebsiteDashboardProps {
  weddingId: string;
  coupleName?: string;
  weddingDate?: string;
  venue?: string;
}

function unwrapData<T>(response: { data?: T } | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

export function WebsiteDashboard({ weddingId, coupleName, weddingDate, venue }: WebsiteDashboardProps) {
  const queryClient = useQueryClient();
  const [customSlug, setCustomSlug] = useState("");
  const [slugType, setSlugType] = useState<"custom" | "auto">("custom");
  const [selectedTheme, setSelectedTheme] = useState("elegant_classic");
  const [copied, setCopied] = useState(false);

  const { data: websiteResponse, isLoading } = useQuery({
    queryKey: queryKeys.wedding.website(weddingId),
    queryFn: async () => {
      const res = await apiClient.website.get<WeddingWebsite | null>(weddingId);
      return unwrapData(res);
    },
    ...dynamicQueryOptions,
  });

  const website = websiteResponse ?? null;
  const publicBase = typeof window !== "undefined"
    ? window.location.origin
    : "https://vownests.com";

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.website(weddingId) });

  const createMutation = useMutation({
    mutationFn: () =>
      apiClient.website.create<WeddingWebsite>(weddingId, {
        slug: slugType === "custom" ? customSlug || undefined : undefined,
        slug_type: slugType,
        theme_id: selectedTheme,
      }),
    onSuccess: () => {
      toast.success("Wedding website created!");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create website"),
  });

  const publishMutation = useMutation({
    mutationFn: () => apiClient.website.publish<WeddingWebsite>(weddingId),
    onSuccess: () => {
      toast.success("Website published!");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message || "Failed to publish"),
  });

  const unpublishMutation = useMutation({
    mutationFn: () => apiClient.website.unpublish<WeddingWebsite>(weddingId),
    onSuccess: () => {
      toast.success("Website unpublished");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message || "Failed to unpublish"),
  });

  const archiveMutation = useMutation({
    mutationFn: () => apiClient.website.archive<WeddingWebsite>(weddingId),
    onSuccess: () => {
      toast.success("Website archived");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message || "Failed to archive"),
  });

  const themeMutation = useMutation({
    mutationFn: (themeId: string) =>
      apiClient.website.update<WeddingWebsite>(weddingId, { theme_id: themeId }),
    onSuccess: () => {
      toast.success("Theme updated");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update theme"),
  });

  const copyPublicUrl = async () => {
    if (!website?.slug) return;
    await navigator.clipboard.writeText(`${publicBase}/w/${website.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#668c65]" />
      </div>
    );
  }

  if (!website) {
    const suggestedSlug = coupleName
      ? coupleName.toLowerCase().replace(/\s*&\s*/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-")
      : "";

    return (
      <div className="max-w-2xl mx-auto py-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#668c65]/10 mb-2">
            <Globe className="h-8 w-8 text-[#668c65]" />
          </div>
          <h2 className="font-serif text-3xl text-[#0d182a]">Create Your Wedding Website</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Build a beautiful, shareable wedding site — RSVP, gallery, gifts, and more. No coding required.
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Get Started</CardTitle>
            <CardDescription>Choose your URL and theme to begin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>URL Style</Label>
              <div className="flex gap-3">
                <Button
                  variant={slugType === "custom" ? "default" : "outline"}
                  onClick={() => setSlugType("custom")}
                  className="flex-1"
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Custom Slug
                </Button>
                <Button
                  variant={slugType === "auto" ? "default" : "outline"}
                  onClick={() => setSlugType("auto")}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Auto Generated
                </Button>
              </div>
            </div>

            {slugType === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="slug">Your URL</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 whitespace-nowrap">vownests.com/w/</span>
                  <Input
                    id="slug"
                    placeholder={suggestedSlug || "emma-john"}
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTheme(t.id)}
                    className={`p-3 rounded-xl border text-left text-sm transition-all ${
                      selectedTheme === t.id
                        ? "border-[#668c65] bg-[#668c65]/5 ring-2 ring-[#668c65]/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full bg-[#0d182a] hover:bg-[#0d182a]/90"
              size="lg"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Create Wedding Website
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const publicUrl = `${publicBase}/w/${website.slug}`;
  const visibleSections = (website.sections || []).filter((s) => s.is_visible && !s.deleted_at);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl text-[#0d182a]">Wedding Website</h2>
          <p className="text-slate-500 text-sm mt-1">Manage and publish your public wedding site</p>
        </div>
        <Badge className={`${STATUS_STYLES[website.status] || ""} capitalize px-3 py-1`}>
          {website.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-[#668c65]" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Public URL</p>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0d182a] font-medium hover:text-[#668c65] truncate block"
                >
                  {publicUrl}
                </a>
              </div>
              <Button variant="outline" size="sm" onClick={copyPublicUrl}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-serif text-[#0d182a]">{visibleSections.length}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Active Sections</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="rsvp">RSVP</TabsTrigger>
          <TabsTrigger value="profile">Couple Profile</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
          <TabsTrigger value="gifts">Gifts</TabsTrigger>
          <TabsTrigger value="mc">MC Program</TabsTrigger>
          <TabsTrigger value="guestbook">Guestbook</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="team">Wedding Team</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="domain">Custom Domain</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {website.status !== "published" && (
                <Button
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                  className="bg-[#668c65] hover:bg-[#668c65]/90"
                >
                  {publishMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Rocket className="h-4 w-4 mr-2" />}
                  Publish Website
                </Button>
              )}
              <Button variant="outline" asChild>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Site
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="mt-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Section Builder</CardTitle>
              <CardDescription>Drag, reorder, hide, duplicate, or remove homepage sections</CardDescription>
            </CardHeader>
            <CardContent>
              <SectionBuilder weddingId={weddingId} website={website} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rsvp" className="mt-4">
          <RsvpSettings weddingId={weddingId} website={website} />
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
          <CoupleProfileEditor weddingId={weddingId} website={website} />
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <WebsiteLivePreview
            website={website}
            coupleName={coupleName}
            weddingDate={weddingDate}
            venue={venue}
          />
        </TabsContent>

        <TabsContent value="theme" className="mt-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Website Theme</CardTitle>
              <CardDescription>Current: {THEMES.find((t) => t.id === website.theme_id)?.name || website.theme_id}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => themeMutation.mutate(t.id)}
                    disabled={themeMutation.isPending}
                    className={`p-4 rounded-xl border text-sm transition-all ${
                      website.theme_id === t.id
                        ? "border-[#668c65] bg-[#668c65]/5 ring-2 ring-[#668c65]/20 font-medium"
                        : "border-slate-200 hover:border-[#668c65]/40"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gifts" className="mt-4">
          <GiftManagement weddingId={weddingId} />
        </TabsContent>

        <TabsContent value="mc" className="mt-4">
          <McProgramEditor weddingId={weddingId} slug={website.slug} />
        </TabsContent>

        <TabsContent value="guestbook" className="mt-4">
          <GuestbookModeration weddingId={weddingId} />
        </TabsContent>

        <TabsContent value="gallery" className="mt-4">
          <GalleryManager weddingId={weddingId} slug={website.slug} />
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <EventManager weddingId={weddingId} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <TimelineManager weddingId={weddingId} />
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <WeddingTeamManager weddingId={weddingId} />
        </TabsContent>

        <TabsContent value="seo" className="mt-4">
          <SeoSettings weddingId={weddingId} website={website} />
        </TabsContent>

        <TabsContent value="domain" className="mt-4">
          <CustomDomainSettings weddingId={weddingId} website={website} />
        </TabsContent>

        <TabsContent value="privacy" className="mt-4 space-y-4">
          <GuestAccessSettings weddingId={weddingId} website={website} />
          <WebsiteShareQr url={publicUrl} coupleName={coupleName} />
        </TabsContent>

        <TabsContent value="announcements" className="mt-4">
          <AnnouncementsManager weddingId={weddingId} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <WebsiteAnalytics weddingId={weddingId} />
        </TabsContent>

        <TabsContent value="publish" className="mt-4 space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Publish Settings</CardTitle>
              <CardDescription>Control your website visibility</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {website.status !== "published" ? (
                <Button
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                  className="bg-[#668c65] hover:bg-[#668c65]/90"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => unpublishMutation.mutate()}
                  disabled={unpublishMutation.isPending}
                >
                  Unpublish
                </Button>
              )}
              {website.status !== "archived" && (
                <Button
                  variant="outline"
                  onClick={() => archiveMutation.mutate()}
                  disabled={archiveMutation.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Heart, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, PublicWeddingSite } from "@/lib/api";
import { toast } from "sonner";

export function weddingAccessStorageKey(slug: string) {
  return `wedding-access-${slug}`;
}

export function getWeddingAccessToken(slug: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(weddingAccessStorageKey(slug)) || undefined;
}

function unwrapData<T>(response: { data?: T } | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

interface PublicAccessGateProps {
  slug: string;
  initialSite: PublicWeddingSite;
  children: (site: PublicWeddingSite) => ReactNode;
}

export function PublicAccessGate({ slug, initialSite, children }: PublicAccessGateProps) {
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") || undefined;

  const [site, setSite] = useState<PublicWeddingSite | null>(initialSite);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadSite = useCallback(async (accessToken?: string) => {
    setLoading(true);
    try {
      const token =
        accessToken || getWeddingAccessToken(slug) || undefined;
      const res = await apiClient.website.getPublic<PublicWeddingSite>(
        slug,
        preview,
        token,
      );
      setSite(unwrapData(res));
    } catch {
      setSite(null);
    } finally {
      setLoading(false);
    }
  }, [slug, preview]);

  useEffect(() => {
    if (initialSite?.requires_access) {
      const stored = getWeddingAccessToken(slug);
      if (stored) loadSite(stored);
    }
  }, [initialSite?.requires_access, slug, loadSite]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = site?.privacy_mode === "invite_only"
        ? { invite_code: inviteCode }
        : { password };
      const res = await apiClient.website.verifyAccess<{ access_token: string }>(slug, payload);
      const data = unwrapData(res);
      if (data.access_token) {
        localStorage.setItem(weddingAccessStorageKey(slug), data.access_token);
        await loadSite(data.access_token);
        toast.success("Welcome!");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Access denied");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafc]">
        <Loader2 className="h-8 w-8 animate-spin text-[#668c65]" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafc] p-6">
        <p className="text-slate-500">Wedding website not found.</p>
      </div>
    );
  }

  const needsGate = Boolean(site.requires_access && site.sections.length === 0);

  if (needsGate) {
    const isInvite = site.privacy_mode === "invite_only";
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafc] p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
          <Lock className="h-10 w-10 mx-auto text-[#668c65]" />
          <div>
            <h1 className="font-serif text-3xl text-[#0d182a]">{site.wedding.couple_name}</h1>
            <p className="text-slate-500 mt-2">
              {isInvite
                ? "Enter your invite code to view this wedding site"
                : "This site is password protected"}
            </p>
          </div>
          <form onSubmit={handleVerify} className="space-y-4 text-left">
            {isInvite ? (
              <div>
                <Label htmlFor="invite">Invite Code</Label>
                <Input
                  id="invite"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter invite code"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter site password"
                />
              </div>
            )}
            <Button type="submit" className="w-full bg-[#668c65] hover:bg-[#668c65]/90" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
              Enter Site
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children(site)}</>;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiClient, WeddingWebsite } from "@/lib/api";
import { queryKeys } from "@/lib/cache";
import { toast } from "sonner";

const PRIVACY_MODES = [
  { value: "public", label: "Public", desc: "Anyone with the link can view" },
  { value: "password", label: "Password Protected", desc: "Guests need a password" },
  { value: "invite_only", label: "Invite Only", desc: "Guests need an invite code" },
  { value: "hidden", label: "Hidden", desc: "Site returns 404 (preview still works)" },
];

export function GuestAccessSettings({
  weddingId,
  website,
}: {
  weddingId: string;
  website: WeddingWebsite;
}) {
  const queryClient = useQueryClient();
  const config = website.guest_access_config || {};
  const [privacyMode, setPrivacyMode] = useState(website.privacy_mode || "public");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState((config.invite_code as string) || "");
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPrivacyMode(website.privacy_mode || "public");
    setInviteCode((website.guest_access_config?.invite_code as string) || "");
  }, [website.privacy_mode, website.guest_access_config]);

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.website.update(weddingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wedding.website(weddingId) });
      setSaving(false);
      setPassword("");
      toast.success("Privacy settings saved");
    },
    onError: (err: unknown) => {
      setSaving(false);
      toast.error(err instanceof Error ? err.message : "Failed to save");
    },
  });

  const scheduleSave = () => {
    setSaving(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const payload: Record<string, unknown> = {
        privacy_mode: privacyMode,
        guest_access_config: { ...config, invite_code: inviteCode },
      };
      if (password) payload.privacy_password = password;
      saveMutation.mutate(payload);
    }, 1500);
  };

  const saveNow = () => {
    if (timer.current) clearTimeout(timer.current);
    setSaving(true);
    const payload: Record<string, unknown> = {
      privacy_mode: privacyMode,
      guest_access_config: { ...config, invite_code: inviteCode },
    };
    if (password) payload.privacy_password = password;
    saveMutation.mutate(payload);
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Guest Access & Privacy
          {saving && <Loader2 className="h-4 w-4 animate-spin text-amber-600 ml-2" />}
        </CardTitle>
        <CardDescription>Control who can view your wedding website</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label>Privacy Mode</Label>
          <Select
            value={privacyMode}
            onValueChange={(v) => { setPrivacyMode(v); scheduleSave(); }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRIVACY_MODES.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 mt-1">
            {PRIVACY_MODES.find((m) => m.value === privacyMode)?.desc}
          </p>
        </div>

        {privacyMode === "password" && (
          <div>
            <Label>Site Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); }}
              onBlur={scheduleSave}
              placeholder={website.privacy_mode === "password" ? "Enter new password to change" : "Set password"}
            />
            <p className="text-xs text-slate-400 mt-1">Leave blank to keep current password</p>
          </div>
        )}

        {privacyMode === "invite_only" && (
          <div>
            <Label>Invite Code</Label>
            <Input
              value={inviteCode}
              onChange={(e) => { setInviteCode(e.target.value); scheduleSave(); }}
              placeholder="e.g. EMMA-JOHN-2026"
            />
            <p className="text-xs text-slate-400 mt-1">Share this code with invited guests</p>
          </div>
        )}

        <Button variant="outline" onClick={saveNow} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 mr-2" /> Save Now
        </Button>
      </CardContent>
    </Card>
  );
}

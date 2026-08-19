"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Invitation } from "@/components/invitations/types";
import { resolveTemplateId } from "@/components/invitations/content";
import { getTemplateMeta } from "@/components/invitations/registry";
import { Loader2, Mail, MessageCircle } from "lucide-react";

export type ShareChannel = "email" | "whatsapp";

export interface ShareGuest {
  id: string;
  name: string;
  email: string;
  phone: string;
  invitation_sent_email?: boolean;
  invitation_sent_whatsapp?: boolean;
}

export function ShareInvitationDialog({
  open,
  onOpenChange,
  invitations,
  selectedInvitationId,
  onInvitationChange,
  guests,
  selectedGuestIds,
  onToggleGuest,
  onToggleAll,
  channels,
  onToggleChannel,
  resend,
  onResendChange,
  sending,
  onSend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitations: Invitation[];
  selectedInvitationId: string;
  onInvitationChange: (id: string) => void;
  guests: ShareGuest[];
  selectedGuestIds: Set<string>;
  onToggleGuest: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  channels: Set<ShareChannel>;
  onToggleChannel: (channel: ShareChannel, checked: boolean) => void;
  resend: boolean;
  onResendChange: (checked: boolean) => void;
  sending: boolean;
  onSend: () => void;
}) {
  const allSelected = guests.length > 0 && selectedGuestIds.size === guests.length;
  const emailCount = guests.filter((g) => selectedGuestIds.has(g.id) && g.email).length;
  const waCount = guests.filter((g) => selectedGuestIds.has(g.id) && g.phone).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl p-8 bg-white/95" aria-describedby="share-inv-desc">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-serif italic text-slate-800">Share invitation</DialogTitle>
          <DialogDescription id="share-inv-desc">
            Send your saved invitation to listed guests by email and WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Saved invitation</Label>
            {invitations.length === 0 ? (
              <p className="text-sm text-rose-600">Save an invitation first in the Invitations tab.</p>
            ) : (
              <Select value={selectedInvitationId} onValueChange={onInvitationChange}>
                <SelectTrigger className="rounded-2xl h-11 border-slate-100">
                  <SelectValue placeholder="Choose invitation" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {invitations.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.couple_names || "Untitled"} · {getTemplateMeta(resolveTemplateId(inv.color_theme)).name}
                      {inv.is_selected ? " (selected)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Send via</Label>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-blue-100 bg-blue-50/50 cursor-pointer">
                <Checkbox checked={channels.has("email")} onCheckedChange={(v) => onToggleChannel("email", v === true)} />
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Email</span>
              </label>
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-green-100 bg-green-50/50 cursor-pointer">
                <Checkbox checked={channels.has("whatsapp")} onCheckedChange={(v) => onToggleChannel("whatsapp", v === true)} />
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-slate-700">WhatsApp</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Guests ({selectedGuestIds.size})</Label>
              <button type="button" className="text-xs text-slate-500 underline" onClick={() => onToggleAll(!allSelected)}>
                {allSelected ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="max-h-52 overflow-y-auto rounded-2xl border border-slate-100 divide-y divide-slate-50">
              {guests.length === 0 ? (
                <p className="p-4 text-sm text-slate-400">No guests on the list yet.</p>
              ) : (
                guests.map((g) => (
                  <label key={g.id} className="flex items-start gap-3 p-3 cursor-pointer hover:bg-slate-50">
                    <Checkbox
                      className="mt-0.5"
                      checked={selectedGuestIds.has(g.id)}
                      onCheckedChange={(v) => onToggleGuest(g.id, v === true)}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">{g.name}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {g.email || "No email"} · {g.phone || "No WhatsApp number"}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <Checkbox checked={resend} onCheckedChange={(v) => onResendChange(v === true)} />
            Resend to guests who already received it
          </label>

          <p className="text-xs text-slate-400">
            {channels.has("email") ? `${emailCount} with email` : "Email off"}
            {" · "}
            {channels.has("whatsapp") ? `${waCount} with a phone number` : "WhatsApp off"}.
            WhatsApp opens a chat for each guest so you can tap Send.
          </p>

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="ghost" className="rounded-2xl px-6" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              onClick={onSend}
              disabled={sending || invitations.length === 0 || selectedGuestIds.size === 0 || channels.size === 0}
              className="rounded-2xl px-8 text-white shadow-lg bg-rose-600 hover:bg-rose-700"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {sending ? "Sharing…" : "Share now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

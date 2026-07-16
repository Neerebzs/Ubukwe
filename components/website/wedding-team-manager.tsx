"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus, Trash2, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/cache";
import { toast } from "sonner";

const ROLES = [
  { value: "mc", label: "MC" },
  { value: "photographer", label: "Photographer" },
  { value: "videographer", label: "Videographer" },
  { value: "decorator", label: "Decorator" },
  { value: "coordinator", label: "Coordinator" },
  { value: "transport_manager", label: "Transport Manager" },
  { value: "gift_coordinator", label: "Gift Coordinator" },
  { value: "family_representative", label: "Family Representative" },
];

interface TeamData {
  roles: Array<{
    id: string;
    role_type: string;
    display_name?: string;
    email?: string;
    permissions: string[];
  }>;
  pending_invitations: Array<{
    id: string;
    role_type: string;
    email: string;
    display_name?: string;
  }>;
}

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

export function WeddingTeamManager({ weddingId }: { weddingId: string }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ role_type: "mc", email: "", display_name: "" });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.wedding.team(weddingId),
    queryFn: async () => unwrap(await apiClient.team.list<TeamData>(weddingId)),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.team(weddingId) });

  const inviteMutation = useMutation({
    mutationFn: () => apiClient.team.invite(weddingId, form),
    onSuccess: (res) => {
      const d = unwrap(res) as { invite_url?: string };
      toast.success("Invitation sent");
      if (d.invite_url) toast.info(`Share link: ${d.invite_url}`);
      setForm({ role_type: "mc", email: "", display_name: "" });
      invalidate();
    },
    onError: () => toast.error("Failed to send invitation"),
  });

  const assignMutation = useMutation({
    mutationFn: () => apiClient.team.assign(weddingId, form),
    onSuccess: () => {
      toast.success("Team member added");
      setForm({ role_type: "mc", email: "", display_name: "" });
      invalidate();
    },
  });

  const removeMutation = useMutation({
    mutationFn: (roleId: string) => apiClient.team.remove(weddingId, roleId),
    onSuccess: () => { toast.success("Removed"); invalidate(); },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const roles = data?.roles || [];
  const invites = data?.pending_invitations || [];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#668c65]" /> Add Team Member
          </CardTitle>
          <CardDescription>Assign roles with limited dashboard access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Role</Label>
              <Select value={form.role_type} onValueChange={(v) => setForm({ ...form, role_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Name</Label>
              <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Jean Mukama" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jean@email.com" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => assignMutation.mutate()} disabled={!form.display_name || assignMutation.isPending}>
              Add Directly
            </Button>
            <Button variant="outline" onClick={() => inviteMutation.mutate()} disabled={!form.email || inviteMutation.isPending}>
              <Mail className="h-4 w-4 mr-2" /> Send Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Users className="h-5 w-5" /> Wedding Team ({roles.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {roles.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No team members yet</p>
          ) : roles.map((role) => (
            <div key={role.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border">
              <div>
                <p className="font-medium">{role.display_name || role.email}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="capitalize text-xs">{role.role_type.replace(/_/g, " ")}</Badge>
                  {role.email && <span className="text-xs text-slate-400">{role.email}</span>}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-red-400" onClick={() => removeMutation.mutate(role.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {invites.length > 0 && (
        <Card className="border-0 shadow-md border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {invites.map((inv) => (
              <div key={inv.id} className="text-sm flex justify-between p-2 bg-amber-50 rounded">
                <span>{inv.display_name || inv.email}</span>
                <Badge className="capitalize text-xs">{inv.role_type.replace(/_/g, " ")}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

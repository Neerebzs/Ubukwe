"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Link2, Copy, Check, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiClient, MCProgramItem } from "@/lib/api";
import { queryKeys } from "@/lib/cache";
import { toast } from "sonner";

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

export function McProgramEditor({ weddingId, slug }: { weddingId: string; slug: string }) {
  const queryClient = useQueryClient();
  const [mcUrl, setMcUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [accessMode, setAccessMode] = useState("protected");
  const [newItem, setNewItem] = useState({ start_time: "09:00", title: "", responsible_person: "MC" });

  const { data: program = [], isLoading } = useQuery({
    queryKey: queryKeys.wedding.mcProgram(weddingId),
    queryFn: async () => unwrap(await apiClient.mcPortal.listProgram<MCProgramItem[]>(weddingId)),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.mcProgram(weddingId) });

  const createMutation = useMutation({
    mutationFn: () => apiClient.mcPortal.createItem(weddingId, newItem),
    onSuccess: () => {
      toast.success("Activity added");
      setNewItem({ start_time: "09:00", title: "", responsible_person: "MC" });
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.mcPortal.deleteItem(weddingId, id),
    onSuccess: () => { toast.success("Removed"); invalidate(); },
  });

  const linkMutation = useMutation({
    mutationFn: () => apiClient.mcPortal.generateAccessLink<{ mc_url: string }>(weddingId),
    onSuccess: (res) => {
      const data = unwrap(res);
      setMcUrl(data.mc_url);
      toast.success("MC link generated");
    },
  });

  const accessMutation = useMutation({
    mutationFn: (mode: string) => apiClient.mcPortal.updateAccess(weddingId, mode),
    onSuccess: () => toast.success("Access settings updated"),
  });

  const copyLink = async () => {
    const url = mcUrl || `${window.location.origin}/w/${slug}/mc`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Mic2 className="h-5 w-5 text-[#668c65]" /> MC Portal Access
          </CardTitle>
          <CardDescription>Share the official wedding program with your MC</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-2">
              <Label>Access Mode</Label>
              <Select value={accessMode} onValueChange={(v) => { setAccessMode(v); accessMutation.mutate(v); }}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="protected">Protected (token)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => linkMutation.mutate()} disabled={linkMutation.isPending}>
              <Link2 className="h-4 w-4 mr-2" /> Generate MC Link
            </Button>
            <Button variant="outline" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          {mcUrl && (
            <p className="text-sm text-slate-500 break-all font-mono bg-slate-50 p-2 rounded">{mcUrl}</p>
          )}
          <p className="text-xs text-slate-400">Public URL: /w/{slug}/mc</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Wedding Program</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {program.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-4 p-4 rounded-xl border ${item.is_completed ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-100"}`}
            >
              <div className="text-center min-w-[60px]">
                <p className="font-mono font-bold text-sm">{item.start_time?.slice(0, 5)}</p>
                {item.end_time && <p className="text-xs text-slate-400">{item.end_time.slice(0, 5)}</p>}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${item.is_completed ? "line-through text-slate-400" : ""}`}>{item.title}</p>
                {item.responsible_person && (
                  <p className="text-xs text-slate-400">Responsible: {item.responsible_person}</p>
                )}
                {item.couple_notes && <p className="text-xs text-slate-500 mt-1">{item.couple_notes}</p>}
              </div>
              <Button variant="ghost" size="icon" className="text-red-400" onClick={() => deleteMutation.mutate(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Input
              type="time"
              className="w-32"
              value={newItem.start_time}
              onChange={(e) => setNewItem({ ...newItem, start_time: e.target.value })}
            />
            <Input
              placeholder="Activity title"
              className="flex-1 min-w-[160px]"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            />
            <Input
              placeholder="Responsible"
              className="w-32"
              value={newItem.responsible_person}
              onChange={(e) => setNewItem({ ...newItem, responsible_person: e.target.value })}
            />
            <Button onClick={() => createMutation.mutate()} disabled={!newItem.title || createMutation.isPending}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

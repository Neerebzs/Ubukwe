"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Plus, Search, Filter, Mail, Phone, MapPin,
  CheckCircle, XCircle, Clock, Edit, Trash2, Download, Upload,
  Loader2, FileText, X, Heart, MessageCircle, Share2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { toast } from "sonner";
import { InvitationsTab } from "@/components/invitations/invitations-tab";
import type { Invitation } from "@/components/invitations/types";
import { ShareInvitationDialog, type ShareChannel } from "@/components/dashboard/share-invitation-dialog";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Guest {
  id: string; wedding_id: string; name: string; email: string;
  phone: string; relationship?: string;
  rsvp_status: "pending" | "confirmed" | "declined";
  dietary_restrictions?: string; plus_one: boolean; plus_one_name?: string;
  table_number?: number; notes?: string;
  invitation_sent: boolean;
  invitation_sent_email: boolean;
  invitation_sent_whatsapp: boolean;
  last_contacted?: string;
}

const EMPTY_FORM = {
  name: "", email: "", phone: "", relationship: "",
  rsvp_status: "pending" as const, dietary_restrictions: "",
  plus_one: false, plus_one_name: "", table_number: undefined as number | undefined, notes: ""
};

type WaLink = { guest: string; phone: string; link: string };

function cleanWhatsAppPhone(phone?: string) {
  let digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("07") && digits.length === 10) digits = "250" + digits.slice(1);
  else if (digits.startsWith("7") && digits.length === 9) digits = "250" + digits;
  return digits;
}

function buildWhatsAppLink(guest: { name: string; phone: string }, inv: Invitation, inviteUrl?: string) {
  const phone = cleanWhatsAppPhone(guest.phone);
  if (!phone) return null;
  const lines = [
    `Dear ${guest.name},`,
    "",
    `You are warmly invited to the wedding of ${inv.couple_names}.`,
  ];
  if (inv.wedding_date) lines.push(`Date: ${inv.wedding_date}`);
  if (inviteUrl) {
    lines.push("");
    lines.push(`View the invitation: ${inviteUrl}`);
  }
  lines.push("", "We look forward to celebrating with you!", "", "— Sent via Ubukwe");
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}

// ── GuestManagement (main export) ─────────────────────────────────────────────
export function GuestManagement() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Guest>>({});
  const [showEdit, setShowEdit] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<Array<{name:string;email:string;phone:string;relationship?:string;rsvp_status?:string;dietary_restrictions?:string;plus_one?:boolean;plus_one_name?:string;table_number?:number;notes?:string;error?:string}>>([]);
  const [importFileName, setImportFileName] = useState<string>("");
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [bulkSending, setBulkSending] = useState(false);
  const [waLinks, setWaLinks] = useState<WaLink[]>([]);
  const [showWaDialog, setShowWaDialog] = useState(false);
  const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"invitations" | "guests">("invitations");
  const [showShare, setShowShare] = useState(false);
  const [shareInvId, setShareInvId] = useState("");
  const [shareChannels, setShareChannels] = useState<Set<ShareChannel>>(new Set(["email", "whatsapp"]));
  const [shareResend, setShareResend] = useState(false);

  const { data: wedding } = useQuery({
    queryKey: ["wedding-me"],
    queryFn: async () => {
      try { const res = await apiClient.get<any>(API_ENDPOINTS.WEDDING.ME); return res.data; }
      catch { return null; }
    }
  });
  const weddingId = wedding?.id;

  const { data: guests = [], isLoading } = useQuery<Guest[]>({
    queryKey: ["wedding-guests", weddingId],
    queryFn: async () => { const res = await apiClient.guests.list<Guest[]>(weddingId); return (res as any).data || []; },
    enabled: !!weddingId
  });

  // Fetch invitations so we can send them to guests
  const { data: invitations = [] } = useQuery<Invitation[]>({
    queryKey: ["wedding-invitations", weddingId],
    queryFn: async () => { const res = await apiClient.invitations.list<Invitation[]>(weddingId!); return (res as any).data || []; },
    enabled: !!weddingId,
  });

  useEffect(() => {
    if (!shareInvId && invitations.length) {
      setShareInvId(invitations.find(i => i.is_selected)?.id || invitations[0].id);
    }
  }, [invitations, shareInvId]);

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.guests.create(weddingId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wedding-guests", weddingId] }); toast.success("Guest added"); setShowAdd(false); setForm({ ...EMPTY_FORM }); },
    onError: (e: any) => toast.error(e.message || "Failed to add guest")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.guests.update(weddingId, id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wedding-guests", weddingId] }); toast.success("Guest updated"); setShowEdit(false); setEditId(null); },
    onError: (e: any) => toast.error(e.message || "Failed to update guest")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.guests.delete(weddingId, id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wedding-guests", weddingId] }); toast.success("Guest removed"); },
    onError: (e: any) => toast.error(e.message || "Failed to remove guest")
  });

  const filteredGuests = guests.filter(g => {
    const ms = g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.email.toLowerCase().includes(searchTerm.toLowerCase()) || (g.relationship || "").toLowerCase().includes(searchTerm.toLowerCase());
    return ms && (filterStatus === "all" || g.rsvp_status === filterStatus);
  });

  const stats = { total: guests.length, confirmed: guests.filter(g => g.rsvp_status === "confirmed").length, pending: guests.filter(g => g.rsvp_status === "pending").length, declined: guests.filter(g => g.rsvp_status === "declined").length };

  const getStatusIcon = (s: string) => s === "confirmed" ? <CheckCircle className="w-4 h-4" /> : s === "declined" ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />;

  const handleAdd = () => {
    if (!form.name || !form.email || !form.phone) { toast.error("Name, email and phone are required"); return; }
    createMutation.mutate({ name: form.name, email: form.email, phone: form.phone || null, relationship: form.relationship || null, rsvp_status: form.rsvp_status, dietary_restrictions: form.dietary_restrictions || null, plus_one: form.plus_one, plus_one_name: form.plus_one_name || null, table_number: form.table_number || null, notes: form.notes || null });
  };

  const handleOpenEdit = (g: Guest) => { setEditId(g.id); setEditForm({ ...g }); setShowEdit(true); };
  const handleSaveEdit = () => { if (!editId || !editForm.name || !editForm.email) { toast.error("Name and email are required"); return; } updateMutation.mutate({ id: editId, data: editForm }); };
  const handleRSVP = (g: Guest, status: string) => updateMutation.mutate({ id: g.id, data: { rsvp_status: status } });

  const handleExportCSV = () => {
    // Export only user-editable fields (exclude backend-generated id/wedding_id)
    const header = ["name","email","phone","relationship","rsvp_status","dietary_restrictions","plus_one","plus_one_name","table_number","notes"];
    const rows = guests.map(g => [
      g.name,
      g.email,
      g.phone || "",
      g.relationship || "",
      g.rsvp_status,
      g.dietary_restrictions || "",
      g.plus_one ? "true" : "false",
      g.plus_one_name || "",
      g.table_number != null ? String(g.table_number) : "",
      (g.notes || "").replace(/\n/g, " ")
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guests.csv';
    document.body.appendChild(a); // Required for Firefox
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    // Download blank template with just headers and one example row
    const header = ["name","email","phone","relationship","rsvp_status","dietary_restrictions","plus_one","plus_one_name","table_number","notes"];
    const example = ["John Doe","john@example.com","+250 7XX XXX XXX","Family","pending","","false","","",""];
    const csv = [header, example].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Client-side CSV parsing for preview ─────────────────────────────────
  const parseCSV = (text: string): Array<Record<string, string>> => {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
      const values: string[] = [];
      let val = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') { val += '"'; i++; }
          else { inQuotes = !inQuotes; }
        } else if (ch === ',' && !inQuotes) {
          values.push(val.trim().replace(/^"|"$/g, ''));
          val = '';
        } else { val += ch; }
      }
      values.push(val.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => row[h] = values[i] ?? '');
      return row;
    });
  };

  const validateRow = (row: {name?:string;email?:string;phone?:string}): string | null => {
    if (!row.name?.trim()) return "Name is required";
    if (!row.email?.trim()) return "Email is required";
    if (!row.phone?.trim()) return "Phone is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email)) return "Invalid email format";
    return null;
  };

  const handleParseFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      const mapped = rows.map(r => {
        const name = r.name || r.full_name || r.guest_name || r['guest name'] || '';
        const email = r.email || r.email_address || r['email address'] || '';
        const phone = r.phone || r.phone_number || r['phone number'] || r.mobile || r.telephone || '';
        const error = validateRow({name, email, phone});
        return {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          relationship: r.relationship || r.relation || '',
          rsvp_status: (r.rsvp_status || r.rsvp || 'pending').toLowerCase(),
          dietary_restrictions: r.dietary_restrictions || r.dietary || '',
          plus_one: (r.plus_one || r.plusone || '').toLowerCase() === 'true',
          plus_one_name: r.plus_one_name || '',
          table_number: r.table_number ? Number(r.table_number) : undefined,
          notes: r.notes || '',
          error: error || undefined
        };
      });
      setImportPreview(mapped);
      const validCount = mapped.filter(r => !r.error).length;
      const errorCount = mapped.filter(r => r.error).length;
      toast.success(`Parsed ${mapped.length} rows: ${validCount} valid, ${errorCount} errors`);
    } catch (err: any) {
      toast.error("Failed to parse file: " + (err.message || "Unknown error"));
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleUpdatePreviewRow = (idx: number, field: string, value: any) => {
    setImportPreview(prev => {
      const next = [...prev];
      (next[idx] as any)[field] = value;
      // Re-validate
      next[idx].error = validateRow({name: next[idx].name, email: next[idx].email, phone: next[idx].phone}) || undefined;
      return next;
    });
  };

  const handleSaveImport = async () => {
    const validRows = importPreview.filter(r => !r.error && r.name && r.email && r.phone);
    if (validRows.length === 0) { toast.error("No valid rows to import"); return; }
    if (!weddingId) { toast.error("No wedding found"); return; }
    setImporting(true);
    try {
      // Send one by one or batch
      for (const row of validRows) {
        await apiClient.guests.create(weddingId, {
          name: row.name,
          email: row.email,
          phone: row.phone || null,
          relationship: row.relationship || null,
          rsvp_status: row.rsvp_status || 'pending',
          dietary_restrictions: row.dietary_restrictions || null,
          plus_one: row.plus_one || false,
          plus_one_name: row.plus_one_name || null,
          table_number: row.table_number || null,
          notes: row.notes || null
        });
      }
      queryClient.invalidateQueries({ queryKey: ["wedding-guests", weddingId] });
      toast.success(`${validRows.length} guests imported successfully`);
      setImportPreview([]);
      setImportFileName("");
      setShowAdd(false);
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const openShare = (opts?: { invitationId?: string; guestIds?: string[]; channels?: ShareChannel[] }) => {
    if (!invitations.length) { toast.error("Save an invitation first (Invitations tab)"); return; }
    if (!guests.length) { toast.error("Add guests to your list first"); return; }
    const invId = opts?.invitationId || invitations.find(i => i.is_selected)?.id || invitations[0].id;
    setShareInvId(invId);
    setShareChannels(new Set(opts?.channels || ["email", "whatsapp"]));
    if (opts?.guestIds) setSelectedGuestIds(new Set(opts.guestIds));
    else if (selectedGuestIds.size === 0) setSelectedGuestIds(new Set(guests.map(g => g.id)));
    setShareResend(false);
    setShowShare(true);
  };

  const runSend = async (ids: string[], channels: ShareChannel[], resend = false) => {
    const inv = invitations.find(i => i.id === shareInvId) || invitations.find(i => i.is_selected) || invitations[0] || null;
    if (!inv) { toast.error("Create an invitation first (Invitations tab)"); return; }
    const res: any = await apiClient.guests.sendInvitations(weddingId, ids, inv, { channels, resend });
    const data = res.data || res;
    queryClient.invalidateQueries({ queryKey: ["wedding-guests", weddingId] });
    toast.success(data.message || "Invitation shared");
    if (data.whatsapp_links?.length) {
      setWaLinks(data.whatsapp_links);
      setShowWaDialog(true);
    }
  };

  const handleSendOne = async (guest: Guest, channels: ShareChannel[] = ["email", "whatsapp"]) => {
    if (!invitations.length) { toast.error("Save an invitation first (Invitations tab)"); return; }
    if (channels.includes("whatsapp") && !guest.phone) { toast.error(`${guest.name} has no WhatsApp number`); return; }
    if (channels.includes("email") && !guest.email) { toast.error(`${guest.name} has no email`); return; }
    const inv = invitations.find(i => i.id === shareInvId) || invitations.find(i => i.is_selected) || invitations[0];
    if (channels.includes("whatsapp") && inv) {
      const inviteUrl = `${window.location.origin}/invite/${inv.id}`;
      const link = buildWhatsAppLink(guest, inv, inviteUrl);
      if (link) window.open(link, "_blank", "noopener,noreferrer");
    }
    setSendingIds(prev => new Set(prev).add(guest.id));
    try {
      await runSend([guest.id], channels, true);
    } catch (err: any) {
      toast.error(err.message || "Failed to send");
    } finally {
      setSendingIds(prev => { const s = new Set(prev); s.delete(guest.id); return s; });
    }
  };

  const handleShareSubmit = async () => {
    const ids = Array.from(selectedGuestIds);
    if (ids.length === 0) { toast.error("Select at least one guest"); return; }
    if (shareChannels.size === 0) { toast.error("Choose email, WhatsApp, or both"); return; }
    setBulkSending(true);
    try {
      await runSend(ids, Array.from(shareChannels) as ShareChannel[], shareResend);
      setShowShare(false);
      setSelectedGuestIds(new Set());
    } catch (err: any) {
      toast.error(err.message || "Failed to send");
    } finally {
      setBulkSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div><h2 className="text-3xl font-serif italic text-slate-800">Guests & Invitations</h2><p className="text-sm text-slate-500 mt-1 italic">Manage your guest list and create beautiful invitations</p></div>

      <Tabs value={activeTab} onValueChange={v=>setActiveTab(v as "invitations"|"guests")} className="space-y-8">
        <TabsList className="flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-2xl w-fit border border-slate-100">
          <TabsTrigger value="invitations" className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm"><Heart className="h-3.5 w-3.5" /> Invitations</TabsTrigger>
          <TabsTrigger value="guests" className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm"><Users className="h-3.5 w-3.5" /> Guest List</TabsTrigger>
        </TabsList>

        <TabsContent value="guests" className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleParseFile} />
              {guests.length > 0 && (
                <Button onClick={() => openShare()} disabled={bulkSending} className="rounded-full bg-rose-600 hover:bg-rose-700 text-white px-4 gap-2 text-sm shadow">
                  <Share2 className="w-4 h-4" />
                  {selectedGuestIds.size > 0 ? `Share with ${selectedGuestIds.size} selected` : "Share invitation"}
                </Button>
              )}
            </div>
            <Button onClick={() => setShowAdd(true)} className="rounded-full text-white shadow-lg px-6 gap-2 text-sm"><Plus className="w-4 h-4" />Add Guest</Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label:"Total Registry", value:stats.total, icon:Users, cc:"bg-sage-100 text-sage-600", tc:"text-slate-800" },
              { label:"Confirmed", value:stats.confirmed, icon:CheckCircle, cc:"bg-emerald-100 text-emerald-600", tc:"text-emerald-700" },
              { label:"Pending", value:stats.pending, icon:Clock, cc:"bg-amber-100 text-amber-600", tc:"text-amber-700" },
              { label:"Declined", value:stats.declined, icon:XCircle, cc:"bg-rose-100 text-rose-600", tc:"text-rose-700" },
            ].map(({ label, value, icon: Icon, cc, tc }) => (
              <Card key={label} className="border-none shadow-xl rounded-[2rem] bg-gradient-to-br from-slate-50/50 to-white overflow-hidden group">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={`p-3 ${cc} rounded-2xl mb-3 group-hover:scale-110 transition-transform`}><Icon className="w-5 h-5" /></div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
                  <p className={`text-2xl font-bold tracking-tight mt-1 ${tc}`}>{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search guests..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="pl-12 h-12 rounded-full border-sage-100 bg-white/50 shadow-sm" /></div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-56 h-12 rounded-full border-sage-100 bg-white shadow-sm"><Filter className="w-4 h-4 mr-2 text-sage-600" /><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-2xl border-sage-100"><SelectItem value="all">All Guests</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="declined">Declined</SelectItem></SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-serif italic text-slate-800 px-2">Registry ({filteredGuests.length})</h3>
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white/50 animate-pulse">
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="w-1.5 flex-shrink-0 bg-slate-200" />
                        <div className="flex-1 p-5 flex flex-col md:flex-row items-start justify-between gap-4">
                          <div className="flex-1 space-y-4 w-full">
                            <div className="h-6 bg-slate-200 rounded-lg w-1/3" />
                            <div className="flex gap-4">
                              <div className="h-4 bg-slate-100 rounded w-24" />
                              <div className="h-4 bg-slate-100 rounded w-24" />
                              <div className="h-4 bg-slate-100 rounded w-20" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-28 bg-slate-100 rounded-2xl" />
                            <div className="h-9 w-20 bg-slate-100 rounded-2xl" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
            : filteredGuests.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-serif italic text-lg">Your registry list is empty</p>
                <Button onClick={() => setShowAdd(true)} variant="link" className="text-sage-600 mt-2">Add your first guest</Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredGuests.map(guest => (
                  <Card key={guest.id} className="border-none shadow-lg rounded-[2rem] overflow-hidden bg-white group">
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className={`w-1.5 flex-shrink-0 ${guest.rsvp_status==="confirmed"?"bg-emerald-400":guest.rsvp_status==="declined"?"bg-rose-400":"bg-amber-400"}`} />
                        <div className="flex-1 p-5 flex flex-col md:flex-row items-start justify-between gap-4">
                          <div className="flex items-center gap-2 mb-2">
                            <input type="checkbox" className="rounded accent-rose-500 w-4 h-4 cursor-pointer"
                              checked={selectedGuestIds.has(guest.id)}
                              onChange={e => setSelectedGuestIds(prev => { const s = new Set(prev); e.target.checked ? s.add(guest.id) : s.delete(guest.id); return s; })} />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-lg font-serif italic text-slate-800">{guest.name}</h4>
                              <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase border-none flex items-center gap-1 ${guest.rsvp_status==="confirmed"?"bg-emerald-50 text-emerald-700":guest.rsvp_status==="declined"?"bg-rose-50 text-rose-700":"bg-amber-50 text-amber-700"}`}>{getStatusIcon(guest.rsvp_status)}<span>{guest.rsvp_status}</span></Badge>
                              {guest.plus_one && <Badge className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase bg-sage-50 text-sage-700 border-none">+1</Badge>}
                              {guest.invitation_sent_email && <Badge className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100 gap-1 flex items-center"><Mail className="w-2.5 h-2.5"/>Email Sent</Badge>}
                              {guest.invitation_sent_whatsapp && <Badge className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-green-50 text-green-600 border border-green-100 gap-1 flex items-center"><Phone className="w-2.5 h-2.5"/>WhatsApp</Badge>}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{guest.email}</span>
                              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{guest.phone}</span>
                              {guest.relationship && <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{guest.relationship}</span>}
                              {guest.table_number && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Table {guest.table_number}</span>}
                            </div>
                            {(guest.dietary_restrictions||guest.notes) && (
                              <div className="flex flex-wrap gap-2">
                                {guest.dietary_restrictions && <span className="px-3 py-1 bg-amber-50 rounded-xl text-[11px] text-amber-800 border border-amber-100"><b>Dietary:</b> {guest.dietary_restrictions}</span>}
                                {guest.notes && <span className="px-3 py-1 bg-sage-50 rounded-xl text-[11px] text-sage-800 border border-sage-100"><b>Note:</b> {guest.notes}</span>}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-100">
                              <Button size="icon" variant="ghost" className={`h-8 w-8 rounded-xl ${guest.rsvp_status==="confirmed"?"bg-white shadow-sm text-emerald-600":"text-slate-400 hover:text-emerald-500"}`} onClick={()=>handleRSVP(guest,"confirmed")}><CheckCircle className="w-4 h-4" /></Button>
                              <Button size="icon" variant="ghost" className={`h-8 w-8 rounded-xl ${guest.rsvp_status==="pending"?"bg-white shadow-sm text-amber-600":"text-slate-400 hover:text-amber-500"}`} onClick={()=>handleRSVP(guest,"pending")}><Clock className="w-4 h-4" /></Button>
                              <Button size="icon" variant="ghost" className={`h-8 w-8 rounded-xl ${guest.rsvp_status==="declined"?"bg-white shadow-sm text-rose-600":"text-slate-400 hover:text-rose-500"}`} onClick={()=>handleRSVP(guest,"declined")}><XCircle className="w-4 h-4" /></Button>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-2xl border-blue-200 text-blue-700 hover:bg-blue-50 gap-1.5 text-xs px-3" onClick={() => handleSendOne(guest, ["email"])} disabled={sendingIds.has(guest.id) || !guest.email} title="Send by email">
                              {sendingIds.has(guest.id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}Email
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-2xl border-green-200 text-green-700 hover:bg-green-50 gap-1.5 text-xs px-3" onClick={() => handleSendOne(guest, ["whatsapp"])} disabled={sendingIds.has(guest.id) || !guest.phone} title="Share on WhatsApp">
                              {sendingIds.has(guest.id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}WhatsApp
                            </Button>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-2xl border-sage-100 text-sage-700 hover:bg-sage-50" onClick={()=>handleOpenEdit(guest)}><Edit className="w-4 h-4" /></Button>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-2xl border-rose-100 text-rose-700 hover:bg-rose-50" onClick={()=>deleteMutation.mutate(guest.id)} disabled={deleteMutation.isPending}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invitations">
          <InvitationsTab
            weddingId={weddingId}
            wedding={wedding}
            onGoToGuests={() => setActiveTab("guests")}
            onShareInvitation={(inv) => {
              setActiveTab("guests");
              openShare({ invitationId: inv.id, guestIds: guests.map(g => g.id) });
            }}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={showAdd} onOpenChange={v=>{setShowAdd(v);if(!v)setForm({...EMPTY_FORM});}}>
        <DialogContent className="!max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl p-8 bg-white/95" aria-describedby="add-guests-desc">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-3xl font-serif italic text-slate-800">Add Guests</DialogTitle>
            <DialogDescription id="add-guests-desc">Add a single guest manually or import multiple guests from an Excel/CSV file.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="form" className="space-y-5">
            <TabsList className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl w-fit border border-slate-100">
              <TabsTrigger value="form" className="flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Plus className="h-3.5 w-3.5"/>Single Guest
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Upload className="h-3.5 w-3.5"/>Import File
              </TabsTrigger>
            </TabsList>

            {/* ── Tab 1: Manual form ── */}
            <TabsContent value="form" className="space-y-5 mt-0">
              <GuestForm form={form} setForm={setForm} />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" className="rounded-2xl px-6 text-slate-500" onClick={()=>{setShowAdd(false);setForm({...EMPTY_FORM});}}>Cancel</Button>
                <Button onClick={handleAdd} disabled={createMutation.isPending} className="rounded-2xl px-8 text-white shadow-lg">
                  {createMutation.isPending&&<Loader2 className="h-4 w-4 animate-spin mr-2"/>}Register Guest
                </Button>
              </div>
            </TabsContent>

            {/* ── Tab 2: Excel / CSV import ── */}
            <TabsContent value="import" className="space-y-5 mt-0">
              {importPreview.length === 0 ? (
                /* ── Upload UI (no file parsed yet) ── */
                <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 p-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
                    <FileText className="h-7 w-7 text-emerald-600"/>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-700">Upload Excel or CSV file</p>
                    <p className="text-xs text-slate-400 mt-1">Supports <span className="font-semibold">.csv</span> (Excel coming soon)</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-emerald-100 p-4 text-left space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Required columns (in any order):</p>
                    {[                      {col:"name", desc:"Guest full name"},
                      {col:"email", desc:"Email address (must be valid)"},
                      {col:"phone", desc:"Phone number e.g. +250 788 123 456"},
                    ].map(({col,desc})=>(
                      <div key={col} className="flex items-center gap-2">
                        <code className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-mono w-16 text-center">{col}</code>
                        <span className="text-xs text-slate-500">{desc}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={()=>fileInputRef.current?.click()}
                    disabled={importing}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 gap-2 shadow"
                  >
                    {importing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Upload className="h-4 w-4"/>}
                    {importing ? "Reading…" : "Choose File"}
                  </Button>

                  {/* Export CSV Template */}
                  <div className="pt-4 border-t border-emerald-100">
                    <p className="text-[11px] font-semibold text-slate-500 mb-2">Need a template?</p>
                    <Button
                      variant="outline"
                      onClick={handleDownloadTemplate}
                      className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-6 gap-2 text-sm"
                    >
                      <Download className="h-4 w-4"/>Download Import Template
                    </Button>
                    <p className="text-[10px] text-slate-400 mt-2">CSV with column headers and example row. Fill it out and re-import.</p>
                  </div>
                </div>
              ) : (
                /* ── Preview & Edit Table ── */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{importFileName}</p>
                      <p className="text-xs text-slate-400">
                        {importPreview.filter(r => !r.error).length} valid · {importPreview.filter(r => r.error).length} errors
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={()=>{setImportPreview([]);setImportFileName("");}}
                        className="rounded-full text-slate-500"
                      >
                        <X className="h-4 w-4 mr-1"/>Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveImport}
                        disabled={importing || importPreview.filter(r => !r.error).length === 0}
                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {importing ? <Loader2 className="h-4 w-4 animate-spin mr-1"/> : <CheckCircle className="h-4 w-4 mr-1"/>}
                        Save {importPreview.filter(r => !r.error).length} Guests
                      </Button>
                    </div>
                  </div>

                  {/* Editable Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[50vh] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          {["Name *","Email *","Phone *","Relationship","Status","Error"].map(h => (
                            <th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importPreview.map((row, idx) => (
                          <tr key={idx} className={row.error ? "bg-rose-50/50" : "bg-white"}>
                            <td className="px-2 py-1">
                              <Input
                                value={row.name}
                                onChange={e => handleUpdatePreviewRow(idx, 'name', e.target.value)}
                                className={`h-8 text-xs ${row.error && !row.name ? 'border-rose-400' : 'border-slate-200'}`}
                                placeholder="Name"
                              />
                            </td>
                            <td className="px-2 py-1">
                              <Input
                                value={row.email}
                                onChange={e => handleUpdatePreviewRow(idx, 'email', e.target.value)}
                                className={`h-8 text-xs ${row.error && (!row.email || row.error?.includes('email')) ? 'border-rose-400' : 'border-slate-200'}`}
                                placeholder="email@example.com"
                              />
                            </td>
                            <td className="px-2 py-1">
                              <Input
                                value={row.phone}
                                onChange={e => handleUpdatePreviewRow(idx, 'phone', e.target.value)}
                                className={`h-8 text-xs ${row.error && !row.phone ? 'border-rose-400' : 'border-slate-200'}`}
                                placeholder="+250..."
                              />
                            </td>
                            <td className="px-2 py-1">
                              <Input
                                value={row.relationship || ''}
                                onChange={e => handleUpdatePreviewRow(idx, 'relationship', e.target.value)}
                                className="h-8 text-xs border-slate-200"
                                placeholder="Family"
                              />
                            </td>
                            <td className="px-2 py-1">
                              <Select
                                value={row.rsvp_status || 'pending'}
                                onValueChange={v => handleUpdatePreviewRow(idx, 'rsvp_status', v)}
                              >
                                <SelectTrigger className="h-8 text-xs w-24">
                                  <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="declined">Declined</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-2 py-1">
                              {row.error ? (
                                <span className="text-[10px] text-rose-600 flex items-center gap-1">
                                  <XCircle className="w-3 h-3"/>{row.error}
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3"/>Valid
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-slate-400">* Required fields. Edit any cell above to fix errors before saving.</p>
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="ghost" className="rounded-2xl px-6 text-slate-500" onClick={()=>setShowAdd(false)}>Close</Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl p-8 bg-white/95" aria-describedby="edit-guest-desc">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-serif italic text-slate-800">Edit Guest</DialogTitle>
            <DialogDescription id="edit-guest-desc">Update guest information and RSVP status.</DialogDescription>
          </DialogHeader>
          <GuestForm form={editForm as any} setForm={setEditForm as any} showRsvp />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" className="rounded-2xl px-6 text-slate-500" onClick={()=>setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending} className="rounded-2xl px-8 text-white shadow-lg">{updateMutation.isPending&&<Loader2 className="h-4 w-4 animate-spin mr-2"/>}Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Links Dialog */}
      <Dialog open={showWaDialog} onOpenChange={setShowWaDialog}>
        <DialogContent className="max-w-lg rounded-[2.5rem] border-none shadow-2xl p-8 bg-white/95" aria-describedby="wa-links-desc">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-serif italic text-slate-800 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-green-600" /> WhatsApp invitations
            </DialogTitle>
            <DialogDescription id="wa-links-desc">
              Click each guest to open WhatsApp with the invitation message and card link. Tap Send in WhatsApp to deliver it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {waLinks.map((w, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-green-100 bg-green-50/40">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{w.guest}</p>
                  <p className="text-xs text-slate-400">{w.phone}</p>
                </div>
                <a href={w.link} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-colors">
                  <Phone className="w-3.5 h-3.5" />Open WhatsApp
                </a>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="ghost" className="rounded-2xl px-6" onClick={()=>setShowWaDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ShareInvitationDialog
        open={showShare}
        onOpenChange={setShowShare}
        invitations={invitations}
        selectedInvitationId={shareInvId}
        onInvitationChange={setShareInvId}
        guests={guests}
        selectedGuestIds={selectedGuestIds}
        onToggleGuest={(id, checked) => setSelectedGuestIds(prev => {
          const s = new Set(prev);
          checked ? s.add(id) : s.delete(id);
          return s;
        })}
        onToggleAll={(checked) => setSelectedGuestIds(checked ? new Set(guests.map(g => g.id)) : new Set())}
        channels={shareChannels}
        onToggleChannel={(channel, checked) => setShareChannels(prev => {
          const s = new Set(prev);
          checked ? s.add(channel) : s.delete(channel);
          return s;
        })}
        resend={shareResend}
        onResendChange={setShareResend}
        sending={bulkSending}
        onSend={handleShareSubmit}
      />
    </div>
  );
}

function GuestForm({ form, setForm, showRsvp = false }: { form: any; setForm: (v: any) => void; showRsvp?: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Full Name *"><Input value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Enter guest name" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        <Field label="Email *"><Input type="email" value={form.email||""} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Enter email address" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        <Field label="Phone * (required for WhatsApp)"><Input value={form.phone||""} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="e.g. +250 788 123 456" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        <Field label="Relationship">
          <Select value={form.relationship||""} onValueChange={v=>setForm({...form,relationship:v})}>
            <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"><SelectValue placeholder="Select relationship"/></SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100">{["Family","Friend","Colleague","Neighbor","Other"].map(r=><SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        {showRsvp && (
          <Field label="RSVP Status">
            <Select value={form.rsvp_status||"pending"} onValueChange={v=>setForm({...form,rsvp_status:v})}>
              <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"><SelectValue/></SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100"><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="declined">Declined</SelectItem></SelectContent>
            </Select>
          </Field>
        )}
        <Field label="Dietary Restrictions"><Input value={form.dietary_restrictions||""} onChange={e=>setForm({...form,dietary_restrictions:e.target.value})} placeholder="e.g. Vegetarian, Halal" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        <Field label="Table Number"><Input type="number" value={form.table_number??""} onChange={e=>setForm({...form,table_number:e.target.value?Number(e.target.value):undefined})} placeholder="Optional" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        <div className="md:col-span-2">
          <div className="flex items-center space-x-3 p-4 bg-sage-50/30 rounded-2xl border border-sage-100/50">
            <input type="checkbox" id="plus_one" checked={!!form.plus_one} onChange={e=>setForm({...form,plus_one:e.target.checked})} className="w-4 h-4 rounded text-sage-600"/>
            <Label htmlFor="plus_one" className="text-sm font-medium text-sage-800 cursor-pointer">Plus One Guest Included</Label>
          </div>
        </div>
        {form.plus_one && <Field label="Plus One Name" className="md:col-span-2"><Input value={form.plus_one_name||""} onChange={e=>setForm({...form,plus_one_name:e.target.value})} placeholder="Enter plus one name" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>}
      </div>
      <Field label="Additional Notes"><Textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Additional notes..." rows={3} className="rounded-2xl border-slate-100 bg-slate-50/50 resize-none"/></Field>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">{label}</Label>
      {children}
    </div>
  );
}

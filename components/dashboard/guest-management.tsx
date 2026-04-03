"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Plus, Search, Filter, Mail, Phone, MapPin,
  CheckCircle, XCircle, Clock, Edit, Trash2, Download, Upload,
  Loader2, Sparkles, FileText, Eye, Save, X, Heart
} from "lucide-react";
import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Guest {
  id: string; wedding_id: string; name: string; email: string;
  phone?: string; relationship?: string;
  rsvp_status: "pending" | "confirmed" | "declined";
  dietary_restrictions?: string; plus_one: boolean; plus_one_name?: string;
  table_number?: number; notes?: string; invitation_sent: boolean; last_contacted?: string;
}

interface Invitation {
  id: string; title: string; couple_names: string; wedding_date: string;
  wedding_time?: string; venue?: string; message?: string; rsvp_details?: string;
  dress_code?: string; theme?: string; tone?: string; template_style?: string;
  is_ai_generated: boolean;
}

const EMPTY_FORM = {
  name: "", email: "", phone: "", relationship: "",
  rsvp_status: "pending" as const, dietary_restrictions: "",
  plus_one: false, plus_one_name: "", table_number: undefined as number | undefined, notes: ""
};

const EMPTY_INV = {
  title: "Wedding Invitation", couple_names: "", wedding_date: "", wedding_time: "",
  venue: "", message: "", rsvp_details: "", dress_code: "",
  theme: "", tone: "formal", template_style: "classic",
};

const EMPTY_AI = {
  couple_names: "", wedding_date: "", wedding_time: "",
  venue: "", theme: "classic", tone: "formal", dress_code: "", rsvp_details: "",
};

const STYLE_COLORS: Record<string, string> = {
  classic: "from-slate-50 to-slate-100 border-slate-200",
  modern:  "from-violet-50 to-violet-100 border-violet-200",
  rustic:  "from-amber-50 to-amber-100 border-amber-200",
  floral:  "from-rose-50 to-rose-100 border-rose-200",
};

const STYLE_ACCENT: Record<string, string> = {
  classic: "text-slate-700", modern: "text-violet-700",
  rustic: "text-amber-700", floral: "text-rose-700",
};

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
    if (!form.name || !form.email) { toast.error("Name and email are required"); return; }
    createMutation.mutate({ name: form.name, email: form.email, phone: form.phone || null, relationship: form.relationship || null, rsvp_status: form.rsvp_status, dietary_restrictions: form.dietary_restrictions || null, plus_one: form.plus_one, plus_one_name: form.plus_one_name || null, table_number: form.table_number || null, notes: form.notes || null });
  };

  const handleOpenEdit = (g: Guest) => { setEditId(g.id); setEditForm({ ...g }); setShowEdit(true); };
  const handleSaveEdit = () => { if (!editId || !editForm.name || !editForm.email) { toast.error("Name and email are required"); return; } updateMutation.mutate({ id: editId, data: editForm }); };
  const handleRSVP = (g: Guest, status: string) => updateMutation.mutate({ id: g.id, data: { rsvp_status: status } });

  const handleExportCSV = () => {
    const header = ["id","name","email","phone","relationship","rsvp_status","dietary_restrictions","plus_one","plus_one_name","table_number","notes","invitation_sent"];
    const rows = guests.map(g => [g.id,g.name,g.email,g.phone||"",g.relationship||"",g.rsvp_status,g.dietary_restrictions||"",g.plus_one?"true":"false",g.plus_one_name||"",g.table_number!=null?String(g.table_number):"",(g.notes||"").replace(/\n/g," "),g.invitation_sent?"true":"false"]);
    const csv = [header,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"}); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='guests.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const text = String(reader.result||""); const lines = text.split(/\r?\n/).filter(l=>l.trim()); if (lines.length<=1) return;
      const [,...dataLines] = lines;
      for (const line of dataLines) {
        const cols = line.match(/\"([^\"]|\"\")*\"(?=,|$)/g)?.map(s=>s.slice(1,-1).replace(/\"\"/g,'"'))||[];
        if (!cols[1]||!cols[2]) continue;
        await apiClient.guests.create(weddingId, { name:cols[1],email:cols[2],phone:cols[3]||null,relationship:cols[4]||null,rsvp_status:cols[5]||"pending",dietary_restrictions:cols[6]||null,plus_one:cols[7]==="true",plus_one_name:cols[8]||null,table_number:cols[9]?Number(cols[9]):null,notes:cols[10]||null });
      }
      queryClient.invalidateQueries({ queryKey: ["wedding-guests", weddingId] }); toast.success("Guests imported");
    };
    reader.readAsText(file); e.target.value="";
  };

  return (
    <div className="space-y-8">
      <div><h2 className="text-3xl font-serif italic text-slate-800">Guests & Invitations</h2><p className="text-sm text-slate-500 mt-1 italic">Manage your guest list and create beautiful invitations</p></div>

      <Tabs defaultValue="guests" className="space-y-8">
        <TabsList className="flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-2xl w-fit border border-slate-100">
          <TabsTrigger value="guests" className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm"><Users className="h-3.5 w-3.5" /> Guest List</TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm"><Heart className="h-3.5 w-3.5" /> Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="guests" className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />
              <Button variant="outline" onClick={handleExportCSV} className="rounded-full border-sage-200 text-sage-700 hover:bg-sage-50 px-6"><Download className="w-4 h-4 mr-2" />Export</Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-full border-sage-200 text-sage-700 hover:bg-sage-50 px-6"><Upload className="w-4 h-4 mr-2" />Import</Button>
            </div>
            <Button onClick={() => setShowAdd(true)} className="rounded-full text-white shadow-lg px-8"><Plus className="w-4 h-4 mr-2" />Add Guest</Button>
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
            {isLoading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-sage-600" /></div>
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
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-lg font-serif italic text-slate-800">{guest.name}</h4>
                              <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase border-none flex items-center gap-1 ${guest.rsvp_status==="confirmed"?"bg-emerald-50 text-emerald-700":guest.rsvp_status==="declined"?"bg-rose-50 text-rose-700":"bg-amber-50 text-amber-700"}`}>{getStatusIcon(guest.rsvp_status)}<span>{guest.rsvp_status}</span></Badge>
                              {guest.plus_one && <Badge className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase bg-sage-50 text-sage-700 border-none">+1</Badge>}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{guest.email}</span>
                              {guest.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{guest.phone}</span>}
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
          <InvitationsTab weddingId={weddingId} wedding={wedding} />
        </TabsContent>
      </Tabs>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl p-8 bg-white/95">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-serif italic text-slate-800">Add New Guest</DialogTitle></DialogHeader>
          <GuestForm form={form} setForm={setForm} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" className="rounded-2xl px-6 text-slate-500" onClick={()=>{setShowAdd(false);setForm({...EMPTY_FORM});}}>Cancel</Button>
            <Button onClick={handleAdd} disabled={createMutation.isPending} className="rounded-2xl px-8 text-white shadow-lg">{createMutation.isPending&&<Loader2 className="h-4 w-4 animate-spin mr-2"/>}Register Guest</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl p-8 bg-white/95">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-serif italic text-slate-800">Edit Guest</DialogTitle></DialogHeader>
          <GuestForm form={editForm as any} setForm={setEditForm as any} showRsvp />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" className="rounded-2xl px-6 text-slate-500" onClick={()=>setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending} className="rounded-2xl px-8 text-white shadow-lg">{updateMutation.isPending&&<Loader2 className="h-4 w-4 animate-spin mr-2"/>}Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── InvitationsTab ────────────────────────────────────────────────────────────
function InvitationsTab({ weddingId, wedding }: { weddingId?: string; wedding?: any }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"list"|"manual"|"ai-form"|"ai-results"|"preview"|"edit">("list");
  const [manualForm, setManualForm] = useState({ ...EMPTY_INV });
  const [aiForm, setAiForm] = useState({ ...EMPTY_AI });
  const [aiResults, setAiResults] = useState<Partial<Invitation>[]>([]);
  const [previewInv, setPreviewInv] = useState<Partial<Invitation>|null>(null);
  const [editingId, setEditingId] = useState<string|null>(null);

  const { data: invitations = [], isLoading } = useQuery<Invitation[]>({
    queryKey: ["wedding-invitations", weddingId],
    queryFn: async () => { const res = await apiClient.invitations.list<Invitation[]>(weddingId!); return (res as any).data || []; },
    enabled: !!weddingId,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editingId ? apiClient.invitations.update(weddingId!, editingId, data) : apiClient.invitations.create(weddingId!, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wedding-invitations", weddingId] }); toast.success(editingId?"Invitation updated":"Invitation saved"); setMode("list"); setEditingId(null); setManualForm({...EMPTY_INV}); },
    onError: (e: any) => toast.error(e.message || "Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.invitations.delete(weddingId!, id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wedding-invitations", weddingId] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e.message || "Failed to delete"),
  });

  const aiMutation = useMutation({
    mutationFn: (data: any) => apiClient.invitations.aiGenerate<Partial<Invitation>[]>(weddingId!, data),
    onSuccess: (res) => { setAiResults((res as any).data || []); setMode("ai-results"); },
    onError: (e: any) => toast.error(e.message || "Failed to generate"),
  });

  const handleDownload = (inv: Partial<Invitation>) => {
    const text = [inv.title?.toUpperCase(), "", inv.message, "", inv.rsvp_details ? `RSVP: ${inv.rsvp_details}` : ""].filter(l=>l!==undefined).join("\n");
    const blob = new Blob([text],{type:"text/plain;charset=utf-8"}); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`${(inv.title||"invitation").replace(/\s+/g,"_")}.txt`; a.click(); URL.revokeObjectURL(url);
  };

  const handleOpenEdit = (inv: Invitation) => {
    setEditingId(inv.id);
    setManualForm({ title:inv.title, couple_names:inv.couple_names, wedding_date:inv.wedding_date, wedding_time:inv.wedding_time||"", venue:inv.venue||"", message:inv.message||"", rsvp_details:inv.rsvp_details||"", dress_code:inv.dress_code||"", theme:inv.theme||"", tone:inv.tone||"formal", template_style:inv.template_style||"classic" });
    setMode("edit");
  };

  const prefill = () => {
    if (!wedding) return;
    setManualForm(f => ({ ...f, couple_names: f.couple_names||wedding.couple_name||"", wedding_date: f.wedding_date||wedding.wedding_date||"", venue: f.venue||wedding.venue||"" }));
    setAiForm(f => ({ ...f, couple_names: f.couple_names||wedding.couple_name||"", wedding_date: f.wedding_date||wedding.wedding_date||"", venue: f.venue||wedding.venue||"" }));
  };

  // LIST
  if (mode === "list") return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h3 className="text-2xl font-serif italic text-slate-800">Wedding Invitations</h3><p className="text-sm text-slate-500 mt-1">Create, customise, and share your invitations</p></div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={()=>{prefill();setMode("manual");}} className="rounded-full border-slate-200 px-6 gap-2"><FileText className="h-4 w-4"/>Manual</Button>
          <Button onClick={()=>{prefill();setMode("ai-form");}} className="rounded-full text-white px-6 gap-2 shadow-lg bg-violet-600 hover:bg-violet-700"><Sparkles className="h-4 w-4"/>AI Generate</Button>
        </div>
      </div>
      {isLoading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-sage-600"/></div>
      : invitations.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-rose-50/30 to-slate-50 rounded-[2.5rem] border-2 border-dashed border-rose-100">
          <Heart className="h-14 w-14 text-rose-200 mx-auto mb-4"/>
          <p className="text-slate-600 font-serif italic text-xl mb-2">No invitations yet</p>
          <p className="text-slate-400 text-sm mb-6">Create manually or let AI design one for you</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={()=>{prefill();setMode("manual");}} className="rounded-full px-6 gap-2"><FileText className="h-4 w-4"/>Write Manually</Button>
            <Button onClick={()=>{prefill();setMode("ai-form");}} className="rounded-full text-white px-6 gap-2 bg-violet-600 hover:bg-violet-700"><Sparkles className="h-4 w-4"/>Generate with AI</Button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {invitations.map(inv => {
            const s = inv.template_style||"classic";
            return (
              <Card key={inv.id} className={`border rounded-[2rem] overflow-hidden bg-gradient-to-br ${STYLE_COLORS[s]||STYLE_COLORS.classic}`}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${STYLE_ACCENT[s]}`}>{s}</p>
                      <h4 className="text-lg font-serif italic text-slate-800">{inv.title}</h4>
                      <p className="text-sm text-slate-500 mt-0.5">{inv.couple_names} · {inv.wedding_date}</p>
                    </div>
                    {inv.is_ai_generated && <Badge className="rounded-full bg-violet-100 text-violet-700 border-none text-[10px] font-bold uppercase flex items-center gap-1 flex-shrink-0"><Sparkles className="h-3 w-3"/>AI</Badge>}
                  </div>
                  {inv.message && <p className="text-sm text-slate-600 line-clamp-3 italic leading-relaxed border-l-2 border-current/20 pl-3">{inv.message}</p>}
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" variant="ghost" className="rounded-xl gap-1.5 text-slate-600 hover:bg-white/60" onClick={()=>{setPreviewInv(inv);setMode("preview");}}><Eye className="h-3.5 w-3.5"/>Preview</Button>
                    <Button size="sm" variant="ghost" className="rounded-xl gap-1.5 text-slate-600 hover:bg-white/60" onClick={()=>handleOpenEdit(inv)}><Edit className="h-3.5 w-3.5"/>Edit</Button>
                    <Button size="sm" variant="ghost" className="rounded-xl gap-1.5 text-slate-600 hover:bg-white/60" onClick={()=>handleDownload(inv)}><Download className="h-3.5 w-3.5"/>Download</Button>
                    <Button size="sm" variant="ghost" className="rounded-xl gap-1.5 text-rose-500 hover:bg-rose-50 ml-auto" onClick={()=>deleteMutation.mutate(inv.id)} disabled={deleteMutation.isPending}><Trash2 className="h-3.5 w-3.5"/></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  // PREVIEW
  if (mode === "preview" && previewInv) {
    const s = previewInv.template_style||"classic";
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={()=>setMode("list")} className="rounded-full gap-2 text-slate-500"><X className="h-4 w-4"/>Back</Button>
          <h3 className="text-xl font-serif italic text-slate-800">Preview</h3>
        </div>
        <div className={`max-w-2xl mx-auto rounded-[2.5rem] border-2 bg-gradient-to-br ${STYLE_COLORS[s]||STYLE_COLORS.classic} p-10 shadow-xl`}>
          <div className="text-center space-y-6">
            <div className={`text-xs font-bold uppercase tracking-[0.3em] ${STYLE_ACCENT[s]}`}>{previewInv.title}</div>
            <div className="w-16 h-px bg-current/20 mx-auto"/>
            <p className="text-slate-700 whitespace-pre-line leading-relaxed text-base font-light">{previewInv.message}</p>
            {previewInv.venue && <p className="text-sm text-slate-500 font-medium">{previewInv.venue}</p>}
            {previewInv.dress_code && <p className="text-xs text-slate-400 uppercase tracking-widest">Dress Code: {previewInv.dress_code}</p>}
            {previewInv.rsvp_details && <div className="mt-6 pt-6 border-t border-current/10"><p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">RSVP</p><p className="text-sm text-slate-600">{previewInv.rsvp_details}</p></div>}
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={()=>handleDownload(previewInv)} className="rounded-full px-6 gap-2"><Download className="h-4 w-4"/>Download</Button>
        </div>
      </div>
    );
  }

  // MANUAL / EDIT
  if (mode === "manual" || mode === "edit") return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={()=>{setMode("list");setEditingId(null);}} className="rounded-full gap-2 text-slate-500"><X className="h-4 w-4"/>Cancel</Button>
        <h3 className="text-xl font-serif italic text-slate-800">{editingId?"Edit Invitation":"Create Invitation"}</h3>
      </div>
      <div className="space-y-5">
        <Field label="Invitation Title"><Input value={manualForm.title} onChange={e=>setManualForm(f=>({...f,title:e.target.value}))} className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Couple Names *"><Input value={manualForm.couple_names} onChange={e=>setManualForm(f=>({...f,couple_names:e.target.value}))} placeholder="e.g. Marie & Jean" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
          <Field label="Wedding Date *"><Input value={manualForm.wedding_date} onChange={e=>setManualForm(f=>({...f,wedding_date:e.target.value}))} placeholder="e.g. Saturday, June 14, 2026" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
          <Field label="Time"><Input value={manualForm.wedding_time} onChange={e=>setManualForm(f=>({...f,wedding_time:e.target.value}))} placeholder="e.g. 3:00 PM" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
          <Field label="Venue"><Input value={manualForm.venue} onChange={e=>setManualForm(f=>({...f,venue:e.target.value}))} placeholder="Venue name and address" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
          <Field label="Dress Code"><Input value={manualForm.dress_code} onChange={e=>setManualForm(f=>({...f,dress_code:e.target.value}))} placeholder="e.g. Black Tie" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
          <Field label="RSVP Details"><Input value={manualForm.rsvp_details} onChange={e=>setManualForm(f=>({...f,rsvp_details:e.target.value}))} placeholder="e.g. rsvp@email.com by May 1" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
          <Field label="Style">
            <Select value={manualForm.template_style} onValueChange={v=>setManualForm(f=>({...f,template_style:v}))}>
              <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"><SelectValue/></SelectTrigger>
              <SelectContent className="rounded-2xl">{["classic","modern","rustic","floral"].map(s=><SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Tone">
            <Select value={manualForm.tone} onValueChange={v=>setManualForm(f=>({...f,tone:v}))}>
              <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"><SelectValue/></SelectTrigger>
              <SelectContent className="rounded-2xl">{["formal","romantic","playful"].map(t=><SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Message / Invitation Text"><Textarea value={manualForm.message} onChange={e=>setManualForm(f=>({...f,message:e.target.value}))} placeholder="Write your invitation message here..." rows={6} className="rounded-2xl border-slate-100 bg-slate-50/50 resize-none"/></Field>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={()=>{setPreviewInv(manualForm as any);setMode("preview");}} className="rounded-full px-6 gap-2"><Eye className="h-4 w-4"/>Preview</Button>
        <Button onClick={()=>saveMutation.mutate(manualForm)} disabled={saveMutation.isPending||!manualForm.couple_names||!manualForm.wedding_date} className="rounded-full px-8 text-white shadow-lg gap-2">
          {saveMutation.isPending?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}Save Invitation
        </Button>
      </div>
    </div>
  );

  // AI FORM
  if (mode === "ai-form") return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={()=>setMode("list")} className="rounded-full gap-2 text-slate-500"><X className="h-4 w-4"/>Cancel</Button>
        <div>
          <h3 className="text-xl font-serif italic text-slate-800 flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet-500"/>AI Invitation Generator</h3>
          <p className="text-xs text-slate-400 mt-0.5">Fill in your details and we'll generate 4 unique invitation styles</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Couple Names *"><Input value={aiForm.couple_names} onChange={e=>setAiForm(f=>({...f,couple_names:e.target.value}))} placeholder="e.g. Marie & Jean" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        <Field label="Wedding Date *"><Input value={aiForm.wedding_date} onChange={e=>setAiForm(f=>({...f,wedding_date:e.target.value}))} placeholder="e.g. Saturday, June 14, 2026" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        <Field label="Time"><Input value={aiForm.wedding_time} onChange={e=>setAiForm(f=>({...f,wedding_time:e.target.value}))} placeholder="e.g. 3:00 PM" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        <Field label="Venue"><Input value={aiForm.venue} onChange={e=>setAiForm(f=>({...f,venue:e.target.value}))} placeholder="Venue name and address" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        <Field label="Tone">
          <Select value={aiForm.tone} onValueChange={v=>setAiForm(f=>({...f,tone:v}))}>
            <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"><SelectValue/></SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="formal">Formal — Traditional & Elegant</SelectItem>
              <SelectItem value="romantic">Romantic — Warm & Heartfelt</SelectItem>
              <SelectItem value="playful">Playful — Fun & Casual</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Dress Code"><Input value={aiForm.dress_code} onChange={e=>setAiForm(f=>({...f,dress_code:e.target.value}))} placeholder="e.g. Black Tie" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        <Field label="RSVP Details" className="md:col-span-2"><Input value={aiForm.rsvp_details} onChange={e=>setAiForm(f=>({...f,rsvp_details:e.target.value}))} placeholder="e.g. rsvp@email.com by May 1" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
      </div>
      <Button onClick={()=>aiMutation.mutate(aiForm)} disabled={aiMutation.isPending||!aiForm.couple_names||!aiForm.wedding_date} className="rounded-full px-8 text-white shadow-lg gap-2 bg-violet-600 hover:bg-violet-700">
        {aiMutation.isPending?<Loader2 className="h-4 w-4 animate-spin"/>:<Sparkles className="h-4 w-4"/>}Generate 4 Invitation Styles
      </Button>
    </div>
  );

  // AI RESULTS
  if (mode === "ai-results") return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={()=>setMode("ai-form")} className="rounded-full gap-2 text-slate-500"><X className="h-4 w-4"/>Back</Button>
          <h3 className="text-xl font-serif italic text-slate-800">Choose Your Style</h3>
        </div>
        <Button variant="outline" onClick={()=>aiMutation.mutate(aiForm)} disabled={aiMutation.isPending} className="rounded-full gap-2 text-xs">
          {aiMutation.isPending?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<Sparkles className="h-3.5 w-3.5"/>}Regenerate
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {aiResults.map((inv, i) => {
          const s = inv.template_style||"classic";
          return (
            <Card key={i} className={`border-2 rounded-[2rem] overflow-hidden bg-gradient-to-br ${STYLE_COLORS[s]} hover:shadow-xl transition-all`}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold uppercase tracking-widest ${STYLE_ACCENT[s]}`}>{inv.title}</p>
                  <Badge className="rounded-full bg-violet-100 text-violet-700 border-none text-[10px] font-bold uppercase flex items-center gap-1"><Sparkles className="h-3 w-3"/>AI</Badge>
                </div>
                <p className="text-sm text-slate-600 italic leading-relaxed line-clamp-5 whitespace-pre-line">{inv.message}</p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="ghost" className="rounded-xl gap-1.5 text-slate-600 hover:bg-white/60" onClick={()=>{setPreviewInv(inv);setMode("preview");}}><Eye className="h-3.5 w-3.5"/>Preview</Button>
                  <Button size="sm" className="rounded-xl gap-1.5 text-white ml-auto" onClick={()=>{
                    setManualForm({ title:inv.title||"Wedding Invitation", couple_names:inv.couple_names||"", wedding_date:inv.wedding_date||"", wedding_time:inv.wedding_time||"", venue:inv.venue||"", message:inv.message||"", rsvp_details:inv.rsvp_details||"", dress_code:inv.dress_code||"", theme:inv.theme||"", tone:inv.tone||"formal", template_style:inv.template_style||"classic" });
                    setEditingId(null); setMode("manual");
                  }}><Edit className="h-3.5 w-3.5"/>Customise & Save</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return null;
}

// ── Shared form components ────────────────────────────────────────────────────
function GuestForm({ form, setForm, showRsvp = false }: { form: any; setForm: (v: any) => void; showRsvp?: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Full Name *"><Input value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Enter guest name" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        <Field label="Email *"><Input type="email" value={form.email||""} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Enter email address" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        <Field label="Phone"><Input value={form.phone||""} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Enter phone number" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
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

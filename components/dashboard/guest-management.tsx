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
  Loader2, Sparkles, FileText, Eye, Save, X, Heart, BookOpen, CalendarClock, StickyNote, PhoneCall
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

interface ProgramEvent {
  time: string; event: string; location: string;
}

interface Invitation {
  id: string; title: string; couple_names: string; wedding_date: string;
  wedding_time?: string; venue?: string; message?: string; rsvp_details?: string;
  dress_code?: string; theme?: string; tone?: string; template_style?: string;
  bible_verse?: string; description?: string;
  program_events?: ProgramEvent[];
  invitation_note?: string; couple_contact?: string;
  color_theme?: string;
  is_ai_generated: boolean;
}

const EMPTY_FORM = {
  name: "", email: "", phone: "", relationship: "",
  rsvp_status: "pending" as const, dietary_restrictions: "",
  plus_one: false, plus_one_name: "", table_number: undefined as number | undefined, notes: ""
};

const EMPTY_PROGRAM_EVENT: ProgramEvent = { time: "", event: "", location: "" };

const EMPTY_INV = {
  title: "Wedding Invitation", couple_names: "", wedding_date: "", wedding_time: "",
  venue: "", message: "", rsvp_details: "", dress_code: "",
  theme: "", tone: "formal", template_style: "classic",
  bible_verse: "", description: "",
  program_events: [{ ...EMPTY_PROGRAM_EVENT }] as ProgramEvent[],
  invitation_note: "", couple_contact: "",
};

const EMPTY_AI = {
  couple_names: "", wedding_date: "", wedding_time: "",
  venue: "", theme: "classic", tone: "formal", dress_code: "", rsvp_details: "",
  bible_verse: "", description: "",
  program_events: [{ ...EMPTY_PROGRAM_EVENT }] as ProgramEvent[],
  invitation_note: "", couple_contact: "",
};

const STYLE_COLORS: Record<string, string> = {
  classic: "from-slate-50 to-slate-100 border-slate-200",
  modern:  "from-violet-50 to-violet-100 border-violet-200",
  rustic:  "from-amber-50 to-amber-100 border-amber-200",
  floral:  "from-rose-50 to-rose-100 border-rose-200",
  traditional: "from-amber-50/40 via-yellow-50/20 to-stone-100/40 border-amber-200/60 shadow-inner",
};

const CARD_THEMES = {
  white: {
    bg: "#FFFFFF", border: "#E8E0D0", innerBorder: "#F0EBE0",
    corner: "#C8B89A", text: "#1A1209", sub: "#4A3F2A",
    date: "#6B5A3A", divider: "#C8B89A", note: "#7A6A50",
    label: "White",
  },
  gold: {
    bg: "#FDF6E3", border: "#D4AF6A", innerBorder: "#E8C97A",
    corner: "#D4AF6A", text: "#2C1A00", sub: "#5C4A2A",
    date: "#8B6914", divider: "#D4AF6A", note: "#7B6A45",
    label: "Gold",
  },
  cream: {
    bg: "#FDFBF5", border: "#D4AF6A", innerBorder: "#E0D4B8",
    corner: "#C4A45A", text: "#2C2010", sub: "#5C4A2A",
    date: "#7B6A45", divider: "#C4A45A", note: "#7B6A45",
    label: "Cream",
  },
} as const;
type CardThemeKey = keyof typeof CARD_THEMES;

const STYLE_ACCENT: Record<string, string> = {
  classic: "text-slate-700", modern: "text-violet-700",
  rustic: "text-amber-700", floral: "text-rose-700",
  traditional: "text-amber-800 font-serif font-bold",
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
  const [mode, setMode] = useState<"list"|"upload"|"ai-form"|"ai-results"|"preview"|"edit">("list");
  const [manualForm, setManualForm] = useState({ ...EMPTY_INV });
  const [aiForm, setAiForm] = useState({ ...EMPTY_AI });
  const [aiResults, setAiResults] = useState<Partial<Invitation>[]>([]);
  const [previewInv, setPreviewInv] = useState<Partial<Invitation>|null>(null);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [cardTheme, setCardTheme] = useState<CardThemeKey>("cream");
  const [uploadedFile, setUploadedFile] = useState<{name:string; url:string; type:string}|null>(null);
  const uploadRef = useRef<HTMLInputElement|null>(null);

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
    onSuccess: async (res) => {
      const variants: Partial<Invitation>[] = (res as any).data || [];
      setAiResults(variants);
      setMode("ai-results");
      for (const v of variants) {
        try { await apiClient.invitations.create(weddingId!, v); } catch {}
      }
      queryClient.invalidateQueries({ queryKey: ["wedding-invitations", weddingId] });
      toast.success("3 invitations (White, Gold, Cream) generated & saved!");
    },
    onError: (e: any) => toast.error(e.message || "Failed to generate"),
  });

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedFile({ name: file.name, url, type: file.type });
  };

  const handleDownload = (inv: Partial<Invitation>) => {
    const lines: string[] = [];
    if (inv.title) lines.push(inv.title.toUpperCase(), "");
    if ((inv as any).bible_verse) lines.push(`"${(inv as any).bible_verse}"`, "");
    if ((inv as any).description) lines.push((inv as any).description, "");
    if (inv.couple_names) lines.push(inv.couple_names);
    if (inv.wedding_date) lines.push(`on ${inv.wedding_date}`);
    if (inv.wedding_time) lines.push(inv.wedding_time);
    if (inv.venue) lines.push(inv.venue);
    lines.push("");
    if (inv.message) lines.push(inv.message, "");
    const events: ProgramEvent[] = ((inv as any).program_events || []).filter((e: ProgramEvent) => e.time || e.event);
    if (events.length > 0) {
      lines.push("WEDDING SCHEDULE", "");
      events.forEach(ev => {
        if (ev.event) lines.push(ev.event);
        if (ev.time) lines.push(`  Time: ${ev.time}`);
        if (ev.location) lines.push(`  Venue: ${ev.location}`);
        lines.push("");
      });
    }
    if (inv.dress_code) lines.push(`Dress Code: ${inv.dress_code}`, "");
    if ((inv as any).invitation_note) lines.push(`Note: ${(inv as any).invitation_note}`, "");
    if ((inv as any).couple_contact) lines.push("Couple Contact:", (inv as any).couple_contact, "");
    if (inv.rsvp_details) lines.push(`RSVP: ${inv.rsvp_details}`);
    const text = lines.join("\n");
    const blob = new Blob([text],{type:"text/plain;charset=utf-8"}); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`${(inv.title||"invitation").replace(/\s+/g,"_")}.txt`; a.click(); URL.revokeObjectURL(url);
  };

  const handleOpenEdit = (inv: Invitation) => {
    setEditingId(inv.id);
    setManualForm({ title:inv.title, couple_names:inv.couple_names, wedding_date:inv.wedding_date, wedding_time:inv.wedding_time||"", venue:inv.venue||"", message:inv.message||"", rsvp_details:inv.rsvp_details||"", dress_code:inv.dress_code||"", theme:inv.theme||"", tone:inv.tone||"formal", template_style:inv.template_style||"classic", bible_verse:inv.bible_verse||"", description:inv.description||"", program_events:(inv.program_events&&inv.program_events.length>0)?inv.program_events:[{...EMPTY_PROGRAM_EVENT}], invitation_note:inv.invitation_note||"", couple_contact:inv.couple_contact||"" });
    setMode("edit");
  };

  const prefill = () => {
    if (!wedding) return;
    setAiForm(f => ({ ...f, couple_names: f.couple_names||wedding.couple_name||"", wedding_date: f.wedding_date||wedding.wedding_date||"", venue: f.venue||wedding.venue||"" }));
  };

  // GUARD: no wedding set up yet
  if (!weddingId) return (
    <div className="text-center py-20 bg-gradient-to-br from-rose-50/30 to-slate-50 rounded-[2.5rem] border-2 border-dashed border-rose-100">
      <Heart className="h-14 w-14 text-rose-200 mx-auto mb-4"/>
      <p className="text-slate-600 font-serif italic text-xl mb-2">No wedding found</p>
      <p className="text-slate-400 text-sm">Please set up your wedding details first before creating invitations.</p>
    </div>
  );

  // LIST
  if (mode === "list") return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h3 className="text-2xl font-serif italic text-slate-800">Wedding Invitations</h3><p className="text-sm text-slate-500 mt-1">Create, customise, and share your invitations</p></div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={()=>{setUploadedFile(null);setMode("upload");}} className="rounded-full border-slate-200 px-6 gap-2"><Upload className="h-4 w-4"/>Upload File</Button>
          <Button onClick={()=>{prefill();setMode("ai-form");}} className="rounded-full text-white px-6 gap-2 shadow-lg bg-violet-600 hover:bg-violet-700"><Sparkles className="h-4 w-4"/>AI Generate</Button>
        </div>
      </div>
      {isLoading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-sage-600"/></div>
      : invitations.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-rose-50/30 to-slate-50 rounded-[2.5rem] border-2 border-dashed border-rose-100">
          <Heart className="h-14 w-14 text-rose-200 mx-auto mb-4"/>
          <p className="text-slate-600 font-serif italic text-xl mb-2">No invitations yet</p>
          <p className="text-slate-400 text-sm mb-6">Upload your own file or let AI generate one for you</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={()=>{setUploadedFile(null);setMode("upload");}} className="rounded-full px-6 gap-2"><Upload className="h-4 w-4"/>Upload File</Button>
            <Button onClick={()=>{prefill();setMode("ai-form");}} className="rounded-full text-white px-6 gap-2 bg-violet-600 hover:bg-violet-700"><Sparkles className="h-4 w-4"/>Generate with AI</Button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {invitations.map(inv => {
            const ct = (inv.color_theme as CardThemeKey) || "cream";
            const thm = CARD_THEMES[ct] || CARD_THEMES.cream;
            return (
              <div key={inv.id} className="relative overflow-hidden rounded-2xl shadow-md cursor-pointer group transition-transform hover:scale-[1.01]"
                   style={{background:thm.bg, border:`1px solid ${thm.border}`}}
                   onClick={()=>{setCardTheme(ct);setPreviewInv(inv);setMode("preview");}}>
                {/* top color bar */}
                <div className="h-1 w-full" style={{background:`linear-gradient(to right, ${thm.divider}60, ${thm.divider}, ${thm.divider}60)`}}/>
                {/* corner ornament */}
                <div className="absolute top-2 right-2 w-10 h-10 pointer-events-none opacity-30">
                  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                    <path d="M2 2 L32 2 Q18 18 2 32 Z" fill={thm.corner}/>
                    <path d="M2 2 Q40 2 70 2 Q40 20 24 36 Q8 50 2 78" stroke={thm.corner} strokeWidth="1.5" fill="none"/>
                  </svg>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border" style={{color:thm.divider, borderColor:`${thm.divider}50`, background:`${thm.divider}10`}}>{ct}</span>
                        {inv.is_ai_generated && <span className="text-[9px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100 flex items-center gap-0.5"><Sparkles className="h-2.5 w-2.5"/>AI</span>}
                      </div>
                      <h4 className="text-base font-serif italic truncate" style={{color:thm.text}}>{inv.title}</h4>
                      <p className="text-[12px] mt-0.5 truncate" style={{color:thm.sub}}>{inv.couple_names} · {inv.wedding_date}</p>
                    </div>
                  </div>
                  {/* Mini card preview */}
                  <div className="rounded-xl p-3 text-center space-y-1" style={{background:`${thm.divider}08`, border:`1px solid ${thm.divider}20`}}>
                    {inv.bible_verse && <p className="text-[9px] italic line-clamp-2" style={{color:thm.note}}>&ldquo;{inv.bible_verse}&rdquo;</p>}
                    {inv.couple_names && <p className="text-[13px] font-serif italic" style={{color:thm.text}}>{inv.couple_names}</p>}
                    {inv.wedding_date && <p className="text-[9px] font-bold uppercase tracking-widest" style={{color:thm.date}}>{inv.wedding_date}</p>}
                    {inv.venue && <p className="text-[9px]" style={{color:thm.sub}}>{inv.venue}</p>}
                  </div>
                  <div className="flex items-center gap-1 pt-1" onClick={e=>e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className="rounded-xl gap-1 text-[11px] px-2 py-1 h-auto" style={{color:thm.sub}} onClick={()=>{const ct=((inv as any).color_theme as CardThemeKey)||"cream";setCardTheme(CARD_THEMES[ct]?ct:"cream");setPreviewInv(inv);setMode("preview");}}><Eye className="h-3 w-3"/>View</Button>
                    <Button size="sm" variant="ghost" className="rounded-xl gap-1 text-[11px] px-2 py-1 h-auto" style={{color:thm.sub}} onClick={()=>handleOpenEdit(inv)}><Edit className="h-3 w-3"/>Edit</Button>
                    <Button size="sm" variant="ghost" className="rounded-xl gap-1 text-[11px] px-2 py-1 h-auto" style={{color:thm.sub}} onClick={()=>handleDownload(inv)}><Download className="h-3 w-3"/>Save</Button>
                    <Button size="sm" variant="ghost" className="rounded-xl gap-1 text-[11px] px-2 py-1 h-auto text-rose-400 hover:bg-rose-50 ml-auto" onClick={()=>deleteMutation.mutate(inv.id)} disabled={deleteMutation.isPending}><Trash2 className="h-3 w-3"/></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // PREVIEW
  if (mode === "preview" && previewInv) {
    const s = previewInv.template_style||"classic";
    // cardTheme is set when Preview button is clicked (see onClick handlers below)
    const activeTheme = CARD_THEMES[cardTheme] ? cardTheme : "cream";

    if (s === "traditional") {
      // message field is raw text used for download/export only — preview uses structured fields

      const tradEvents: ProgramEvent[] = ((previewInv as any).program_events || []).filter((e: ProgramEvent) => e.event || e.time);

      const thm = CARD_THEMES[activeTheme];

      return (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={()=>setMode("list")} className="rounded-full gap-2 text-slate-500"><X className="h-4 w-4"/>Back</Button>
              <h3 className="text-xl font-serif italic text-slate-800">Preview Invitation</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Style:</span>
              {(Object.keys(CARD_THEMES) as CardThemeKey[]).map(k => (
                <button key={k} onClick={()=>setCardTheme(k)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    cardTheme===k ? "border-[#D4AF6A] bg-amber-50 text-[#7B6A45] shadow" : "border-slate-200 text-slate-400 hover:border-[#D4AF6A]/50"
                  }`}>{CARD_THEMES[k].label}</button>
              ))}
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative overflow-hidden" style={{background:thm.bg, border:`1px solid ${thm.border}`, borderRadius:"4px", boxShadow:"0 8px 40px rgba(180,150,80,0.18), 0 2px 8px rgba(0,0,0,0.08)"}}>

              {/* Inner frame */}
              <div className="absolute inset-2 pointer-events-none z-10" style={{border:`1px solid ${thm.innerBorder}`, borderRadius:"2px"}}/>

              {/* Corner flourishes */}
              {[
                {pos:"top-0 left-0", tr:""},
                {pos:"top-0 right-0", tr:"scaleX(-1)"},
                {pos:"bottom-0 left-0", tr:"scaleY(-1)"},
                {pos:"bottom-0 right-0", tr:"scale(-1,-1)"},
              ].map(({pos,tr},ci)=>(
                <div key={ci} className={`absolute ${pos} w-20 h-20 pointer-events-none z-20`} style={tr?{transform:tr}:{}}>
                  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                    <path d="M2 2 L32 2 Q18 18 2 32 Z" fill={thm.corner} opacity="0.35"/>
                    <path d="M2 2 Q40 2 70 2 Q40 20 24 36 Q8 50 2 78" stroke={thm.corner} strokeWidth="0.8" fill="none" opacity="0.6"/>
                    <path d="M14 14 Q22 14 14 22 Q14 22 14 30" stroke={thm.corner} strokeWidth="0.6" fill="none" opacity="0.5"/>
                    <circle cx="16" cy="16" r="1.5" fill={thm.corner} opacity="0.7"/>
                    <circle cx="6" cy="6" r="1" fill={thm.corner} opacity="0.5"/>
                  </svg>
                </div>
              ))}

              {/* Bible verse — top full width */}
              {(previewInv as any).bible_verse && (
                <div className="px-12 pt-10 pb-4 text-center">
                  <p className="text-[11px] italic leading-relaxed font-serif" style={{color:thm.note}}>
                    &ldquo;{(previewInv as any).bible_verse}&rdquo;
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center justify-center gap-2 px-8 mb-0">
                <div className="h-px flex-1" style={{background:`linear-gradient(to right, transparent, ${thm.divider}99)`}}/>
                <div className="w-1.5 h-1.5 rounded-full" style={{background:thm.divider}}/>
                <div className="w-2 h-2 rounded-full border" style={{borderColor:thm.divider, background:thm.bg}}/>
                <div className="w-1.5 h-1.5 rounded-full" style={{background:thm.divider}}/>
                <div className="h-px flex-1" style={{background:`linear-gradient(to left, transparent, ${thm.divider}99)`}}/>
              </div>

              {/* Two column body */}
              <div className="grid grid-cols-1 md:grid-cols-2 relative px-0">

                {/* Vertical divider */}
                <div className="hidden md:flex absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex-col items-center justify-center pointer-events-none z-10">
                  <div className="w-px flex-1" style={{background:`linear-gradient(to bottom, transparent, ${thm.divider}80, transparent)`}}/>
                </div>

                {/* LEFT — Kinyarwanda */}
                <div className="px-8 py-8 text-center font-serif space-y-3 border-b md:border-b-0" style={{borderColor:`${thm.divider}30`}}>
                  <p className="text-[11px] leading-relaxed italic" style={{color:thm.sub}}>
                    Imiryango yacu yishimiye kubatumira mu birori by&apos;ubukwe bw&apos;abana babo:
                  </p>
                  {previewInv.couple_names && (
                    <p className="text-[22px] italic leading-snug" style={{color:thm.text}}>{previewInv.couple_names}</p>
                  )}
                  {previewInv.wedding_date && (
                    <p className="text-[12px] font-bold tracking-widest uppercase" style={{color:thm.date}}>Buzaba tariki ya {previewInv.wedding_date}</p>
                  )}
                  {previewInv.wedding_time && (
                    <p className="text-[11px]" style={{color:thm.sub}}>{previewInv.wedding_time}</p>
                  )}
                  {tradEvents.length > 0 && (
                    <div className="pt-2 space-y-3 text-left">
                      {tradEvents.map((ev,i)=>(
                        <div key={i} className="flex items-start gap-2">
                          <span className="shrink-0 text-[10px] font-bold font-mono min-w-[52px] text-right pt-0.5" style={{color:thm.date}}>{ev.time}</span>
                          <div className="w-px self-stretch mx-1 shrink-0" style={{background:`${thm.divider}50`}}/>
                          <div>
                            <p className="text-[11px] font-semibold" style={{color:thm.text}}>{ev.event}</p>
                            {ev.location && <p className="text-[10px] italic" style={{color:thm.note}}>Aho: {ev.location}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {(previewInv as any).invitation_note && (
                    <p className="text-[10px] italic pt-1" style={{color:thm.note}}>{(previewInv as any).invitation_note}</p>
                  )}
                  {(previewInv as any).couple_contact && (
                    <div className="pt-2 border-t" style={{borderColor:`${thm.divider}30`}}>
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{color:thm.divider}}>Contacts</p>
                      <p className="text-[10px] whitespace-pre-line leading-relaxed" style={{color:thm.sub}}>{(previewInv as any).couple_contact}</p>
                    </div>
                  )}
                </div>

                {/* Mobile divider */}
                <div className="md:hidden flex items-center justify-center px-8">
                  <div className="h-px flex-1" style={{background:`linear-gradient(to right, transparent, ${thm.divider}99)`}}/>
                  <div className="mx-2 w-2 h-2 rounded-full border" style={{borderColor:thm.divider, background:thm.bg}}/>
                  <div className="h-px flex-1" style={{background:`linear-gradient(to left, transparent, ${thm.divider}99)`}}/>
                </div>

                {/* RIGHT — English */}
                <div className="px-8 py-8 text-center font-serif space-y-3">
                  <p className="text-[11px] leading-relaxed italic" style={{color:thm.sub}}>
                    Together with our families, we joyfully invite you to celebrate the wedding of:
                  </p>
                  {previewInv.couple_names && (
                    <p className="text-[22px] italic leading-snug" style={{color:thm.text}}>{previewInv.couple_names}</p>
                  )}
                  {previewInv.wedding_date && (
                    <p className="text-[12px] font-bold tracking-widest uppercase" style={{color:thm.date}}>Which will take place on {previewInv.wedding_date}</p>
                  )}
                  {previewInv.wedding_time && (
                    <p className="text-[11px]" style={{color:thm.sub}}>{previewInv.wedding_time}</p>
                  )}
                  {tradEvents.length > 0 && (
                    <div className="pt-2 space-y-3 text-left">
                      {tradEvents.map((ev,i)=>(
                        <div key={i} className="flex items-start gap-2">
                          <span className="shrink-0 text-[10px] font-bold font-mono min-w-[52px] text-right pt-0.5" style={{color:thm.date}}>{ev.time}</span>
                          <div className="w-px self-stretch mx-1 shrink-0" style={{background:`${thm.divider}50`}}/>
                          <div>
                            <p className="text-[11px] font-semibold" style={{color:thm.text}}>{ev.event}</p>
                            {ev.location && <p className="text-[10px] italic" style={{color:thm.note}}>Venue: {ev.location}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {(previewInv as any).invitation_note && (
                    <p className="text-[10px] italic pt-1" style={{color:thm.note}}>{(previewInv as any).invitation_note}</p>
                  )}
                  {(previewInv as any).couple_contact && (
                    <div className="pt-2 border-t" style={{borderColor:`${thm.divider}30`}}>
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{color:thm.divider}}>Contacts</p>
                      <p className="text-[10px] whitespace-pre-line leading-relaxed" style={{color:thm.sub}}>{(previewInv as any).couple_contact}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom divider */}
              <div className="flex items-center justify-center gap-2 px-8 mb-6 mt-2">
                <div className="h-px flex-1" style={{background:`linear-gradient(to right, transparent, ${thm.divider}60)`}}/>
                <div className="w-1.5 h-1.5 rounded-full" style={{background:`${thm.divider}99`}}/>
                <div className="h-px flex-1" style={{background:`linear-gradient(to left, transparent, ${thm.divider}60)`}}/>
              </div>

            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" onClick={()=>handleDownload(previewInv)} className="rounded-full px-6 gap-2 border-[#D4AF6A]/50 text-[#7B6A45] hover:bg-amber-50"><Download className="h-4 w-4"/>Download</Button>
          </div>
        </div>
      );
    }

    const events: ProgramEvent[] = ((previewInv as any).program_events || []).filter((e: ProgramEvent) => e.event || e.time);
    const thm2 = CARD_THEMES[activeTheme];

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={()=>setMode("list")} className="rounded-full gap-2 text-slate-500"><X className="h-4 w-4"/>Back</Button>
            <h3 className="text-xl font-serif italic text-slate-800">Preview</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Style:</span>
            {(Object.keys(CARD_THEMES) as CardThemeKey[]).map(k => (
              <button key={k} onClick={()=>setCardTheme(k)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  cardTheme===k ? "border-[#D4AF6A] bg-amber-50 text-[#7B6A45] shadow" : "border-slate-200 text-slate-400 hover:border-[#D4AF6A]/50"
                }`}>{CARD_THEMES[k].label}</button>
            ))}
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <div className="relative overflow-hidden" style={{background:thm2.bg, border:`1px solid ${thm2.border}`, borderRadius:"4px", boxShadow:"0 8px 40px rgba(180,150,80,0.18), 0 2px 8px rgba(0,0,0,0.08)"}}>

            {/* Inner frame */}
            <div className="absolute inset-2 pointer-events-none z-10" style={{border:`1px solid ${thm2.innerBorder}`, borderRadius:"2px"}}/>

            {/* Corner flourishes */}
            {([["top-0 left-0",""],["top-0 right-0","scaleX(-1)"],["bottom-0 left-0","scaleY(-1)"],["bottom-0 right-0","scale(-1,-1)"]] as [string,string][]).map(([pos,tr],ci)=>(
              <div key={ci} className={`absolute ${pos} w-20 h-20 pointer-events-none z-20`} style={tr?{transform:tr}:{}}>
                <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                  <path d="M2 2 L32 2 Q18 18 2 32 Z" fill={thm2.corner} opacity="0.35"/>
                  <path d="M2 2 Q40 2 70 2 Q40 20 24 36 Q8 50 2 78" stroke={thm2.corner} strokeWidth="0.8" fill="none" opacity="0.6"/>
                  <path d="M14 14 Q22 14 14 22 Q14 22 14 30" stroke={thm2.corner} strokeWidth="0.6" fill="none" opacity="0.5"/>
                  <circle cx="16" cy="16" r="1.5" fill={thm2.corner} opacity="0.7"/>
                  <circle cx="6" cy="6" r="1" fill={thm2.corner} opacity="0.5"/>
                </svg>
              </div>
            ))}

            <div className="px-10 py-10 space-y-0 relative z-0">

              {/* Bible verse */}
              {(previewInv as any).bible_verse && (
                <div className="text-center mb-5">
                  <p className="text-[11px] italic leading-relaxed font-serif" style={{color:thm2.note}}>
                    &ldquo;{(previewInv as any).bible_verse}&rdquo;
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center justify-center gap-2 mb-5">
                <div className="h-px flex-1" style={{background:`linear-gradient(to right,transparent,${thm2.divider}99)`}}/>
                <div className="w-1.5 h-1.5 rounded-full" style={{background:thm2.divider}}/>
                <div className="w-2 h-2 rounded-full border" style={{borderColor:thm2.divider, background:thm2.bg}}/>
                <div className="w-1.5 h-1.5 rounded-full" style={{background:thm2.divider}}/>
                <div className="h-px flex-1" style={{background:`linear-gradient(to left,transparent,${thm2.divider}99)`}}/>
              </div>

              {/* Description */}
              {(previewInv as any).description && (
                <p className="text-center text-[12px] leading-relaxed font-serif mb-4" style={{color:thm2.sub}}>
                  {(previewInv as any).description}
                </p>
              )}

              {/* Couple Names */}
              {previewInv.couple_names && (
                <div className="text-center mb-1">
                  <p className="text-[28px] font-serif italic tracking-wide leading-tight" style={{color:thm2.text}}>
                    {previewInv.couple_names}
                  </p>
                </div>
              )}

              {/* Date */}
              {previewInv.wedding_date && (
                <div className="text-center mb-5">
                  <p className="text-[13px] font-semibold tracking-widest uppercase mt-1" style={{color:thm2.date}}>
                    {previewInv.wedding_date}
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center justify-center gap-2 mb-5">
                <div className="h-px flex-1" style={{background:`linear-gradient(to right,transparent,${thm2.divider}60)`}}/>
                <div className="w-1.5 h-1.5 rounded-full" style={{background:`${thm2.divider}99`}}/>
                <div className="h-px flex-1" style={{background:`linear-gradient(to left,transparent,${thm2.divider}60)`}}/>
              </div>

              {/* Schedule */}
              {events.length > 0 && (
                <div className="mb-5 space-y-2">
                  {events.map((ev, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="shrink-0 min-w-[58px] text-right">
                        <span className="text-[11px] font-bold font-mono" style={{color:thm2.date}}>{ev.time || ""}</span>
                      </div>
                      <div className="w-px self-stretch mx-1 shrink-0" style={{background:`${thm2.divider}50`}}/>
                      <div className="flex-1 pb-2">
                        <p className="text-[12px] font-semibold font-serif" style={{color:thm2.text}}>{ev.event}</p>
                        {ev.location && <p className="text-[11px] italic mt-0.5" style={{color:thm2.note}}>{ev.location}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Note */}
              {(previewInv as any).invitation_note && (
                <>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="h-px flex-1" style={{background:`linear-gradient(to right,transparent,${thm2.divider}60)`}}/>
                    <div className="w-1.5 h-1.5 rounded-full" style={{background:`${thm2.divider}99`}}/>
                    <div className="h-px flex-1" style={{background:`linear-gradient(to left,transparent,${thm2.divider}60)`}}/>
                  </div>
                  <p className="text-center text-[11px] italic font-serif mb-4" style={{color:thm2.note}}>
                    {(previewInv as any).invitation_note}
                  </p>
                </>
              )}

              {/* Contacts */}
              {(previewInv as any).couple_contact && (
                <>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="h-px flex-1" style={{background:`linear-gradient(to right,transparent,${thm2.divider}60)`}}/>
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{color:thm2.divider}}>Contacts</span>
                    <div className="h-px flex-1" style={{background:`linear-gradient(to left,transparent,${thm2.divider}60)`}}/>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] whitespace-pre-line leading-relaxed font-serif" style={{color:thm2.sub}}>
                      {(previewInv as any).couple_contact}
                    </p>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Button variant="outline" onClick={()=>handleDownload(previewInv)} className="rounded-full px-6 gap-2 hover:bg-amber-50" style={{borderColor:`${thm2.divider}80`, color:thm2.note}}><Download className="h-4 w-4"/>Download</Button>
        </div>
      </div>
    );
  }

  // UPLOAD FILE
  if (mode === "upload") return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={()=>setMode("list")} className="rounded-full gap-2 text-slate-500"><X className="h-4 w-4"/>Cancel</Button>
        <h3 className="text-xl font-serif italic text-slate-800">Upload Invitation File</h3>
      </div>
      <input ref={uploadRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleUploadFile}/>
      {!uploadedFile ? (
        <div
          onClick={()=>uploadRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-[#D4AF6A]/50 rounded-[2.5rem] bg-[#FDFBF5] hover:bg-amber-50/40 transition-colors py-20 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-[#D4AF6A]/40 flex items-center justify-center">
              <Upload className="h-7 w-7 text-[#D4AF6A]"/>
            </div>
          </div>
          <div>
            <p className="text-[#5C4A2A] font-serif text-lg">Click to upload your invitation</p>
            <p className="text-slate-400 text-sm mt-1">Supports image files (JPG, PNG) and PDF</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-[#FDFBF5] border border-[#D4AF6A]/40 rounded-2xl overflow-hidden shadow-lg">
            {uploadedFile.type === "application/pdf" ? (
              <iframe src={uploadedFile.url} className="w-full h-[500px]" title="Invitation PDF"/>
            ) : (
              <img src={uploadedFile.url} alt="Invitation" className="w-full object-contain max-h-[500px]"/>
            )}
            <div className="absolute top-3 right-3">
              <Button size="sm" variant="ghost" className="rounded-full bg-white/80 shadow text-slate-600" onClick={()=>{setUploadedFile(null);uploadRef.current && (uploadRef.current.value="");}}><X className="h-4 w-4"/>Remove</Button>
            </div>
          </div>
          <p className="text-sm text-slate-500 text-center"><FileText className="h-3.5 w-3.5 inline mr-1"/>{uploadedFile.name}</p>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" onClick={()=>uploadRef.current?.click()} className="rounded-full px-6 gap-2 border-[#D4AF6A]/40 text-[#7B6A45]"><Upload className="h-4 w-4"/>Change File</Button>
            <Button onClick={()=>setMode("list")} className="rounded-full px-8 gap-2 text-white shadow-lg bg-[#C4A45A] hover:bg-[#B8944A]"><Save className="h-4 w-4"/>Use This Invitation</Button>
          </div>
        </div>
      )}
    </div>
  );

  // EDIT
  if (mode === "edit") return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={()=>{setMode("list");setEditingId(null);}} className="rounded-full gap-2 text-slate-500"><X className="h-4 w-4"/>Cancel</Button>
        <h3 className="text-xl font-serif italic text-slate-800">{editingId?"Edit Invitation":"Create Invitation"}</h3>
      </div>
      <div className="space-y-5">

        {/* 1. Bible Verse */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4 space-y-2">
          <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-amber-600"/><span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Bible Verse</span></div>
          <Textarea value={manualForm.bible_verse} onChange={e=>setManualForm(f=>({...f,bible_verse:e.target.value}))} placeholder={'e.g. "Therefore what God has joined together, let no one separate." — Mark 10:9'} rows={2} className="rounded-2xl border-amber-100 bg-white/70 resize-none text-sm"/>
        </div>

        {/* 2. Description */}
        <Field label="Description">
          <Textarea value={manualForm.description} onChange={e=>setManualForm(f=>({...f,description:e.target.value}))} placeholder={"Together with our families,\nwe joyfully invite you to celebrate our wedding ceremony..."} rows={3} className="rounded-2xl border-slate-100 bg-slate-50/50 resize-none"/>
        </Field>

        {/* 3. Couple Names & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Couple Names *"><Input value={manualForm.couple_names} onChange={e=>setManualForm(f=>({...f,couple_names:e.target.value}))} placeholder="e.g. Jean Claude ❤️ Diane Uwase" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
          <Field label="Date *"><Input value={manualForm.wedding_date} onChange={e=>setManualForm(f=>({...f,wedding_date:e.target.value}))} placeholder="e.g. Saturday, August 15, 2026" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        </div>

        {/* 4. Wedding Schedule */}
        <div className="rounded-2xl border border-rose-100 bg-rose-50/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-rose-500"/><span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Wedding Schedule</span></div>
            <Button type="button" size="sm" variant="outline" className="rounded-full text-xs px-3 border-rose-200 text-rose-600 hover:bg-rose-50" onClick={()=>setManualForm(f=>({...f,program_events:[...(f.program_events||[]),{...EMPTY_PROGRAM_EVENT}]}))}>+ Add Event</Button>
          </div>
          {(manualForm.program_events||[]).map((ev,idx)=>(
            <div key={idx} className="rounded-xl border border-rose-100 bg-white p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input value={ev.event} onChange={e=>{const arr=[...(manualForm.program_events||[])];arr[idx]={...arr[idx],event:e.target.value};setManualForm(f=>({...f,program_events:arr}));}} placeholder="📍 Introduction Ceremony (Gusaba)" className="rounded-xl border-rose-100 bg-rose-50/30 h-9 text-sm flex-1"/>
                <Button type="button" size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-slate-300 hover:text-rose-500 shrink-0" disabled={(manualForm.program_events||[]).length<=1} onClick={()=>{const arr=[...(manualForm.program_events||[])];arr.splice(idx,1);setManualForm(f=>({...f,program_events:arr}));}}><X className="h-3.5 w-3.5"/></Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-rose-50/30 border border-rose-100 rounded-xl px-3 h-9">
                  <Clock className="h-3.5 w-3.5 text-rose-400 shrink-0"/>
                  <Input value={ev.time} onChange={e=>{const arr=[...(manualForm.program_events||[])];arr[idx]={...arr[idx],time:e.target.value};setManualForm(f=>({...f,program_events:arr}));}} placeholder="9:00 AM – 1:00 PM" className="border-0 bg-transparent h-auto p-0 text-sm focus-visible:ring-0"/>
                </div>
                <div className="flex items-center gap-2 bg-rose-50/30 border border-rose-100 rounded-xl px-3 h-9">
                  <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0"/>
                  <Input value={ev.location} onChange={e=>{const arr=[...(manualForm.program_events||[])];arr[idx]={...arr[idx],location:e.target.value};setManualForm(f=>({...f,program_events:arr}));}} placeholder="Maliot Hotel" className="border-0 bg-transparent h-auto p-0 text-sm focus-visible:ring-0"/>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 5. Note */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 space-y-2">
          <div className="flex items-center gap-2"><StickyNote className="h-4 w-4 text-slate-500"/><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Note</span></div>
          <Textarea value={manualForm.invitation_note} onChange={e=>setManualForm(f=>({...f,invitation_note:e.target.value}))} placeholder="We will be happy to celebrate this special day with you." rows={2} className="rounded-2xl border-slate-100 bg-white/70 resize-none text-sm"/>
        </div>

        {/* 6. Couple Contact */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 space-y-2">
          <div className="flex items-center gap-2"><PhoneCall className="h-4 w-4 text-slate-500"/><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Couple Contact</span></div>
          <Textarea value={manualForm.couple_contact} onChange={e=>setManualForm(f=>({...f,couple_contact:e.target.value}))} placeholder={"Jean Claude: +250 788 123 456\nDiane Uwase: +250 788 654 321"} rows={2} className="rounded-2xl border-slate-100 bg-white/70 resize-none text-sm"/>
        </div>

      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={()=>{setPreviewInv(manualForm as any);setMode("preview");}} className="rounded-full px-6 gap-2"><Eye className="h-4 w-4"/>Preview</Button>
        <Button onClick={()=>saveMutation.mutate(manualForm)} disabled={saveMutation.isPending||!manualForm.couple_names||!manualForm.wedding_date||!weddingId} className="rounded-full px-8 text-white shadow-lg gap-2">
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
          <p className="text-xs text-slate-400 mt-0.5">Fill in your details and we'll generate 3 colour versions: White, Gold &amp; Cream</p>
        </div>
      </div>

      {/* 1. Bible Verse */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4 space-y-2">
        <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-amber-600"/><span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Bible Verse</span></div>
        <Textarea value={aiForm.bible_verse} onChange={e=>setAiForm(f=>({...f,bible_verse:e.target.value}))} placeholder={'e.g. "Therefore what God has joined together, let no one separate." — Mark 10:9'} rows={2} className="rounded-2xl border-amber-100 bg-white/70 resize-none text-sm"/>
      </div>

      {/* 2. Description */}
      <Field label="Description">
        <Textarea value={aiForm.description} onChange={e=>setAiForm(f=>({...f,description:e.target.value}))} placeholder={"Together with our families,\nwe joyfully invite you to celebrate our wedding ceremony..."} rows={3} className="rounded-2xl border-slate-100 bg-slate-50/50 resize-none"/>
      </Field>

      {/* 3. Couple Names & Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Couple Names *"><Input value={aiForm.couple_names} onChange={e=>setAiForm(f=>({...f,couple_names:e.target.value}))} placeholder="e.g. Jean Claude ❤️ Diane Uwase" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        <Field label="Date *"><Input value={aiForm.wedding_date} onChange={e=>setAiForm(f=>({...f,wedding_date:e.target.value}))} placeholder="e.g. Saturday, August 15, 2026" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
      </div>

      {/* 4. Wedding Schedule */}
      <div className="rounded-2xl border border-rose-100 bg-rose-50/20 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-rose-500"/><span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Wedding Schedule</span></div>
          <Button type="button" size="sm" variant="outline" className="rounded-full text-xs px-3 border-rose-200 text-rose-600 hover:bg-rose-50" onClick={()=>setAiForm(f=>({...f,program_events:[...(f.program_events),{...EMPTY_PROGRAM_EVENT}]}))}>+ Add Event</Button>
        </div>
        {aiForm.program_events.map((ev: ProgramEvent, idx: number)=>(
          <div key={idx} className="rounded-xl border border-rose-100 bg-white p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input value={ev.event} onChange={e=>{const arr=[...aiForm.program_events];arr[idx]={...arr[idx],event:e.target.value};setAiForm(f=>({...f,program_events:arr}));}} placeholder="📍 Introduction Ceremony (Gusaba)" className="rounded-xl border-rose-100 bg-rose-50/30 h-9 text-sm flex-1"/>
              <Button type="button" size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-slate-300 hover:text-rose-500 shrink-0" disabled={aiForm.program_events.length<=1} onClick={()=>{const arr=[...aiForm.program_events];arr.splice(idx,1);setAiForm(f=>({...f,program_events:arr}));}}><X className="h-3.5 w-3.5"/></Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 bg-rose-50/30 border border-rose-100 rounded-xl px-3 h-9">
                <Clock className="h-3.5 w-3.5 text-rose-400 shrink-0"/>
                <Input value={ev.time} onChange={e=>{const arr=[...aiForm.program_events];arr[idx]={...arr[idx],time:e.target.value};setAiForm(f=>({...f,program_events:arr}));}} placeholder="9:00 AM – 1:00 PM" className="border-0 bg-transparent h-auto p-0 text-sm focus-visible:ring-0"/>
              </div>
              <div className="flex items-center gap-2 bg-rose-50/30 border border-rose-100 rounded-xl px-3 h-9">
                <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0"/>
                <Input value={ev.location} onChange={e=>{const arr=[...aiForm.program_events];arr[idx]={...arr[idx],location:e.target.value};setAiForm(f=>({...f,program_events:arr}));}} placeholder="Maliot Hotel" className="border-0 bg-transparent h-auto p-0 text-sm focus-visible:ring-0"/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Note */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 space-y-2">
        <div className="flex items-center gap-2"><StickyNote className="h-4 w-4 text-slate-500"/><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Note</span></div>
        <Textarea value={aiForm.invitation_note} onChange={e=>setAiForm(f=>({...f,invitation_note:e.target.value}))} placeholder="We will be happy to celebrate this special day with you." rows={2} className="rounded-2xl border-slate-100 bg-white/70 resize-none text-sm"/>
      </div>

      {/* 5. Couple Contact */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 space-y-2">
        <div className="flex items-center gap-2"><PhoneCall className="h-4 w-4 text-slate-500"/><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Couple Contact</span></div>
        <Textarea value={aiForm.couple_contact} onChange={e=>setAiForm(f=>({...f,couple_contact:e.target.value}))} placeholder={"Jean Claude: +250 788 123 456\nDiane Uwase: +250 788 654 321"} rows={2} className="rounded-2xl border-slate-100 bg-white/70 resize-none text-sm"/>
      </div>

      <Button onClick={()=>aiMutation.mutate(aiForm)} disabled={aiMutation.isPending||!aiForm.couple_names||!aiForm.wedding_date||!weddingId} className="rounded-full px-8 text-white shadow-lg gap-2 bg-violet-600 hover:bg-violet-700">
        {aiMutation.isPending?<Loader2 className="h-4 w-4 animate-spin"/>:<Sparkles className="h-4 w-4"/>}Generate 3 Styles (White · Gold · Cream)
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
      <div className="grid md:grid-cols-3 gap-5">
        {aiResults.map((inv, i) => {
          const ct = ((inv as any).color_theme as CardThemeKey) || "cream";
          const thm = CARD_THEMES[ct] || CARD_THEMES.cream;
          const events: ProgramEvent[] = ((inv as any).program_events||[]).filter((e:ProgramEvent)=>e.event||e.time);
          return (
            <div key={i} className="relative overflow-hidden rounded-2xl shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
              style={{background:thm.bg, border:`1.5px solid ${thm.border}`}}
              onClick={()=>{setCardTheme(ct);setPreviewInv(inv);setMode("preview");}}>
              {/* Top accent bar */}
              <div className="h-1 w-full" style={{background:`linear-gradient(to right,${thm.divider}60,${thm.divider},${thm.divider}60)`}}/>
              <div className="p-4 space-y-3">
                {/* Theme badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border" style={{color:thm.divider,borderColor:`${thm.divider}50`,background:`${thm.divider}10`}}>{ct}</span>
                  <span className="text-[9px] font-bold uppercase text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100 flex items-center gap-0.5"><Sparkles className="h-2.5 w-2.5"/>AI</span>
                </div>
                {/* Mini card */}
                <div className="rounded-xl p-3 text-center space-y-1" style={{background:`${thm.divider}08`,border:`1px solid ${thm.divider}20`}}>
                  {(inv as any).bible_verse && <p className="text-[9px] italic line-clamp-2" style={{color:thm.note}}>&ldquo;{(inv as any).bible_verse}&rdquo;</p>}
                  {inv.couple_names && <p className="text-[14px] font-serif italic" style={{color:thm.text}}>{inv.couple_names}</p>}
                  {inv.wedding_date && <p className="text-[9px] font-bold uppercase tracking-widest" style={{color:thm.date}}>{inv.wedding_date}</p>}
                  {events.slice(0,2).map((ev,ei)=>(
                    <div key={ei} className="flex items-center gap-1 justify-center text-[9px]" style={{color:thm.sub}}>
                      <span className="font-mono" style={{color:thm.date}}>{ev.time}</span>
                      <span style={{color:thm.divider}}>·</span>
                      <span className="truncate">{ev.event}</span>
                    </div>
                  ))}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 pt-1" onClick={e=>e.stopPropagation()}>
                  <Button size="sm" variant="ghost" className="rounded-xl gap-1 text-[11px] px-2 py-1 h-auto" style={{color:thm.sub}} onClick={()=>{setCardTheme(ct);setPreviewInv(inv);setMode("preview");}}><Eye className="h-3 w-3"/>Preview</Button>
                  <Button size="sm" variant="ghost" className="rounded-xl gap-1 text-[11px] px-2 py-1 h-auto ml-auto" style={{color:thm.divider}} onClick={e=>{e.stopPropagation();setManualForm({title:inv.title||"Wedding Invitation",couple_names:inv.couple_names||"",wedding_date:inv.wedding_date||"",wedding_time:inv.wedding_time||"",venue:inv.venue||"",message:inv.message||"",rsvp_details:inv.rsvp_details||"",dress_code:inv.dress_code||"",theme:inv.theme||"",tone:inv.tone||"formal",template_style:"traditional",bible_verse:(inv as any).bible_verse||"",description:(inv as any).description||"",program_events:((inv as any).program_events?.length>0)?(inv as any).program_events:[{...EMPTY_PROGRAM_EVENT}],invitation_note:(inv as any).invitation_note||"",couple_contact:(inv as any).couple_contact||""});setEditingId(null);setMode("edit");}}><Edit className="h-3 w-3"/>Edit</Button>
                </div>
              </div>
            </div>
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

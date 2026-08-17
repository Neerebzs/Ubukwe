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
  Loader2, Sparkles, FileText, Eye, Save, X, Heart, BookOpen, CalendarClock, StickyNote, PhoneCall, Users2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { toast } from "sonner";
import QRCode from "qrcode";

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

interface ProgramEvent {
  time: string; event: string; location: string;
}

interface ContactPerson {
  name: string; phones: string[];
}

interface Invitation {
  id: string; title: string; couple_names: string; wedding_date: string;
  wedding_time?: string; venue?: string; message?: string; rsvp_details?: string;
  dress_code?: string; theme?: string; tone?: string; template_style?: string;
  bible_verse?: string; bible_verse_rw?: string; bible_verse_en?: string; description?: string;
  program_events?: ProgramEvent[];
  invitation_note?: string; couple_contact?: string;
  color_theme?: string;
  groom_family_name?: string; bride_family_name?: string; represented_by?: string;
  groom_represented_by?: string; bride_represented_by?: string;
  bride_contacts?: ContactPerson[]; groom_contacts?: ContactPerson[];
  is_ai_generated: boolean;
  is_selected?: boolean;
}

const EMPTY_FORM = {
  name: "", email: "", phone: "", relationship: "",
  rsvp_status: "pending" as const, dietary_restrictions: "",
  plus_one: false, plus_one_name: "", table_number: undefined as number | undefined, notes: ""
};

type WaLink = { guest: string; phone: string; link: string };

const EMPTY_PROGRAM_EVENT: ProgramEvent = { time: "", event: "", location: "" };
const EMPTY_CONTACT_PERSON: ContactPerson = { name: "", phones: [""] };

// Half-hour time-of-day options for the wedding-schedule time picker (12-hour, e.g. "9:00 AM")
const TIME_OPTIONS: string[] = (() => {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? "AM" : "PM";
      opts.push(`${hour12}:${m === 0 ? "00" : "30"} ${ampm}`);
    }
  }
  return opts;
})();

const EMPTY_INV = {
  title: "Wedding Invitation", couple_names: "", wedding_date: "", wedding_time: "",
  venue: "", message: "", rsvp_details: "", dress_code: "",
  theme: "", tone: "formal", template_style: "classic",
  bible_verse: "", bible_verse_rw: "", bible_verse_en: "", description: "",
  program_events: [{ ...EMPTY_PROGRAM_EVENT }] as ProgramEvent[],
  invitation_note: "", couple_contact: "",
  groom_family_name: "", bride_family_name: "", represented_by: "",
  groom_represented_by: "", bride_represented_by: "",
  bride_contacts: [] as ContactPerson[], groom_contacts: [] as ContactPerson[],
};

const EMPTY_AI = {
  couple_names: "", wedding_date: "", wedding_time: "",
  venue: "", theme: "classic", tone: "formal", dress_code: "", rsvp_details: "",
  bible_verse: "", bible_verse_rw: "", bible_verse_en: "", description: "",
  program_events: [{ ...EMPTY_PROGRAM_EVENT }] as ProgramEvent[],
  invitation_note: "", couple_contact: "",
  groom_family_name: "", bride_family_name: "", represented_by: "",
  groom_represented_by: "", bride_represented_by: "",
  bride_contacts: [] as ContactPerson[], groom_contacts: [] as ContactPerson[],
};


const STYLE_COLORS: Record<string, string> = {
  classic: "from-slate-50 to-slate-100 border-slate-200",
  modern:  "from-violet-50 to-violet-100 border-violet-200",
  rustic:  "from-amber-50 to-amber-100 border-amber-200",
  floral:  "from-rose-50 to-rose-100 border-rose-200",
  traditional: "from-amber-50/40 via-yellow-50/20 to-stone-100/40 border-amber-200/60 shadow-inner",
};

// Six invitation templates — each a distinct wallpaper/design, all rendered in the
// bilingual two-column (Kinyarwanda | English) layout. Colour + ornament only; the
// couple's own words always fill the content.
const CARD_THEMES = {
  botanical: {
    bg: "#FDFBF5", border: "#8FAE7A", innerBorder: "#E3E9D8",
    corner: "#5E7C4A", text: "#2C2010", sub: "#4A3F2A",
    date: "#5E7C4A", divider: "#7A9B6B", note: "#5E7C4A",
    label: "Botanical",
  },
  sage_leaf: {
    bg: "#F1EAD6", border: "#2F4A2F", innerBorder: "#4F6F4F",
    corner: "#2F4A2F", text: "#1F2E1F", sub: "#3F5A3F",
    date: "#2F4A2F", divider: "#4F6F4F", note: "#4F6F4F",
    label: "Sage & Leaf",
  },
  indigo_mandala: {
    bg: "#101B33", border: "#D4AF6A", innerBorder: "#3A4A6B",
    corner: "#E8C97A", text: "#F5E7C4", sub: "#C9D3E8",
    date: "#E8C97A", divider: "#D4AF6A", note: "#B8C4DC",
    label: "Indigo Mandala",
  },
  noir_gold: {
    bg: "#0B0A08", border: "#D4AF6A", innerBorder: "#8A6B2E",
    corner: "#D4AF6A", text: "#F5E7C4", sub: "#E8D9AE",
    date: "#E8C97A", divider: "#D4AF6A", note: "#C9B078",
    label: "Noir & Gold",
  },
  lavender_bloom: {
    bg: "#FBF8FD", border: "#9B7FC7", innerBorder: "#E4D9F2",
    corner: "#7C5CB0", text: "#2E1F3D", sub: "#5B4470",
    date: "#7C5CB0", divider: "#B79FDA", note: "#7C5CB0",
    label: "Lavender Bloom",
  },
  azure_watercolor: {
    bg: "linear-gradient(135deg, #7A8FC7 0%, #9B87C9 50%, #B79FDA 100%)", border: "#FFFFFF", innerBorder: "rgba(255,255,255,0.35)",
    corner: "#FFFFFF", text: "#FFFFFF", sub: "#F0EAFB",
    date: "#FFFFFF", divider: "#FFFFFF", note: "#EDE6FA",
    label: "Azure Watercolor",
  },
} as const;
type CardThemeKey = keyof typeof CARD_THEMES;

// One hand-drawn corner motif per template (not just a recolored shape) — mirrored into all
// four corners by the caller via CSS transform. viewBox is 0 0 80 80, corner anchored at (0,0).
function cardCornerMotif(key: CardThemeKey, color: string) {
  switch (key) {
    case "sage_leaf": // thick leafy vine running along both edges — heavy botanical frame
      return (
        <>
          <path d="M2 2 L2 78" stroke={color} strokeWidth="1.5" opacity="0.5"/>
          <path d="M2 2 L78 2" stroke={color} strokeWidth="1.5" opacity="0.5"/>
          {[12, 28, 44, 60].map((p, i) => (
            <ellipse key={`v${i}`} cx="2" cy={p} rx="7" ry="3" fill={color} opacity="0.55" transform={`rotate(${35 + i * 4} 2 ${p})`}/>
          ))}
          {[12, 28, 44, 60].map((p, i) => (
            <ellipse key={`h${i}`} cx={p} cy="2" rx="7" ry="3" fill={color} opacity="0.55" transform={`rotate(${-35 - i * 4} ${p} 2)`}/>
          ))}
          <circle cx="2" cy="2" r="3" fill={color} opacity="0.8"/>
        </>
      );
    case "indigo_mandala": // paisley / mandala arcs radiating from the corner
      return (
        <>
          <path d="M2 2 A20 20 0 0 1 22 2" stroke={color} strokeWidth="1" fill="none" opacity="0.7"/>
          <path d="M2 2 A34 34 0 0 1 36 2" stroke={color} strokeWidth="0.8" fill="none" opacity="0.55"/>
          <path d="M2 2 A48 48 0 0 1 50 2" stroke={color} strokeWidth="0.6" fill="none" opacity="0.4"/>
          {[0, 1, 2, 3, 4].map(i => {
            const a = (Math.PI / 2) * (i / 4);
            const r = 34;
            return <circle key={i} cx={2 + r * Math.sin(a)} cy={2 + r * (1 - Math.cos(a))} r="1.4" fill={color} opacity="0.7"/>;
          })}
          <circle cx="2" cy="2" r="3.5" fill={color} opacity="0.9"/>
          <path d="M2 2 L14 2 L2 14 Z" fill={color} opacity="0.2"/>
        </>
      );
    case "noir_gold": // circular medallion with radiating sunburst dashes
      return (
        <>
          <circle cx="16" cy="16" r="9" fill="none" stroke={color} strokeWidth="1" opacity="0.6"/>
          <circle cx="16" cy="16" r="4" fill="none" stroke={color} strokeWidth="0.8" opacity="0.7"/>
          <circle cx="16" cy="16" r="1.3" fill={color} opacity="0.9"/>
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <line key={deg} x1="16" y1="16" x2={16 + 13 * Math.cos(deg * Math.PI / 180)} y2={16 + 13 * Math.sin(deg * Math.PI / 180)} stroke={color} strokeWidth="0.5" opacity="0.35"/>
          ))}
          <path d="M2 2 L34 2 Q18 18 2 34 Z" fill={color} opacity="0.12"/>
        </>
      );
    case "lavender_bloom": // clustered flower rosette (overlapping petals + stem)
      return (
        <>
          <circle cx="16" cy="10" r="5.5" fill={color} opacity="0.5"/>
          <circle cx="24" cy="9" r="4.5" fill={color} opacity="0.38"/>
          <circle cx="10" cy="18" r="5" fill={color} opacity="0.42"/>
          <circle cx="20" cy="20" r="4" fill={color} opacity="0.32"/>
          <circle cx="17" cy="14" r="2.6" fill="#FFFFFF" opacity="0.65"/>
          <path d="M6 6 Q12 20 4 30" stroke={color} strokeWidth="1" fill="none" opacity="0.4"/>
          <ellipse cx="7" cy="24" rx="4" ry="2" fill={color} opacity="0.3" transform="rotate(50 7 24)"/>
        </>
      );
    case "azure_watercolor": // soft overlapping translucent wash blobs
      return (
        <>
          <circle cx="20" cy="16" r="18" fill={color} opacity="0.22"/>
          <circle cx="8" cy="28" r="12" fill={color} opacity="0.16"/>
          <circle cx="30" cy="6" r="9" fill="#FFFFFF" opacity="0.18"/>
          <circle cx="12" cy="10" r="6" fill="#FFFFFF" opacity="0.14"/>
        </>
      );
    case "botanical": // light two-leaf sprig, delicate
    default:
      return (
        <>
          <path d="M2 2 L32 2 Q18 18 2 32 Z" fill={color} opacity="0.3"/>
          <path d="M2 2 Q40 2 70 2 Q40 20 24 36 Q8 50 2 78" stroke={color} strokeWidth="0.8" fill="none" opacity="0.6"/>
          <ellipse cx="18" cy="12" rx="6" ry="2.6" fill={color} opacity="0.45" transform="rotate(35 18 12)"/>
          <ellipse cx="11" cy="22" rx="5" ry="2.2" fill={color} opacity="0.35" transform="rotate(65 11 22)"/>
          <circle cx="2" cy="2" r="2" fill={color} opacity="0.7"/>
        </>
      );
  }
}

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
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<Array<{name:string;email:string;phone:string;relationship?:string;rsvp_status?:string;dietary_restrictions?:string;plus_one?:boolean;plus_one_name?:string;table_number?:number;notes?:string;error?:string}>>([]);
  const [importFileName, setImportFileName] = useState<string>("");
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [bulkSending, setBulkSending] = useState(false);
  const [waLinks, setWaLinks] = useState<WaLink[]>([]);
  const [showWaDialog, setShowWaDialog] = useState(false);
  const [selectedGuestIds, setSelectedGuestIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"invitations" | "guests">("invitations");

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

  const pickInvitation = (): Invitation | null => {
    return invitations.find(i => i.is_selected) || invitations[0] || null;
  };

  const handleSendOne = async (guest: Guest) => {
    const inv = pickInvitation();
    if (!inv) { toast.error("Create an invitation first (Invitations tab)"); return; }
    setSendingIds(prev => new Set(prev).add(guest.id));
    try {
      const res: any = await apiClient.guests.sendInvitations(weddingId, [guest.id], inv);
      const data = res.data || res;
      queryClient.invalidateQueries({ queryKey: ["wedding-guests", weddingId] });
      toast.success(`Invitation sent to ${guest.name}`);
      if (data.whatsapp_links?.length) { setWaLinks(data.whatsapp_links); setShowWaDialog(true); }
    } catch (err: any) {
      toast.error(err.message || "Failed to send");
    } finally {
      setSendingIds(prev => { const s = new Set(prev); s.delete(guest.id); return s; });
    }
  };

  const handleBulkSend = async () => {
    const inv = pickInvitation();
    if (!inv) { toast.error("Create an invitation first (Invitations tab)"); return; }
    // If no selection, send to ALL guests. Otherwise send to selected only.
    const ids = selectedGuestIds.size > 0 ? Array.from(selectedGuestIds) : guests.map(g => g.id);
    if (ids.length === 0) { toast.error("No guests to send to"); return; }
    setBulkSending(true);
    try {
      const res: any = await apiClient.guests.sendInvitations(weddingId, ids, inv);
      const data = res.data || res;
      queryClient.invalidateQueries({ queryKey: ["wedding-guests", weddingId] });
      toast.success(data.message || `Invitations sent to ${ids.length} guests!`);
      setSelectedGuestIds(new Set());
      if (data.whatsapp_links?.length) { setWaLinks(data.whatsapp_links); setShowWaDialog(true); }
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
                <Button onClick={handleBulkSend} disabled={bulkSending} className="rounded-full bg-rose-600 hover:bg-rose-700 text-white px-4 gap-2 text-sm shadow">
                  {bulkSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {bulkSending ? "Sending…" : selectedGuestIds.size > 0 ? `Send to ${selectedGuestIds.size} selected` : "Send All Invitations"}
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
                            <Button variant="outline" size="sm" className="rounded-2xl border-rose-200 text-rose-700 hover:bg-rose-50 gap-1.5 text-xs px-3" onClick={()=>handleSendOne(guest)} disabled={sendingIds.has(guest.id)}>
                              {sendingIds.has(guest.id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}Send
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
          <InvitationsTab weddingId={weddingId} wedding={wedding} onGoToGuests={()=>setActiveTab("guests")} />
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
              <span className="text-2xl">💬</span> WhatsApp Invitation Links
            </DialogTitle>
            <DialogDescription id="wa-links-desc">Click each link to open WhatsApp and send the invitation message directly to the guest.</DialogDescription>
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
    </div>
  );
}

// ── InvitationsTab ────────────────────────────────────────────────────────────
function InvitationsTab({ weddingId, wedding, onGoToGuests }: { weddingId?: string; wedding?: any; onGoToGuests?: () => void }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"list"|"ai-form"|"ai-results"|"preview"|"edit">("list");
  const [manualForm, setManualForm] = useState({ ...EMPTY_INV });
  const [aiForm, setAiForm] = useState({ ...EMPTY_AI });
  const [aiResults, setAiResults] = useState<Partial<Invitation>[]>([]);
  const [previewInv, setPreviewInv] = useState<Partial<Invitation>|null>(null);
  const [previewGroup, setPreviewGroup] = useState<Partial<Invitation>[]>([]);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [cardTheme, setCardTheme] = useState<CardThemeKey>("botanical");
  const qrCanvasRef = useRef<HTMLCanvasElement|null>(null);

  // Public wedding site link — encoded into the QR code on the "Emerald & QR" invitation
  const { data: website } = useQuery<{ slug?: string } | null>({
    queryKey: ["wedding-website", weddingId],
    queryFn: async () => { const res = await apiClient.website.get<{ slug?: string }>(weddingId!); return (res as any).data ?? null; },
    enabled: !!weddingId,
  });
  const publicBase = typeof window !== "undefined" ? window.location.origin : "https://vownests.com";
  const weddingPublicUrl = website?.slug ? `${publicBase}/w/${website.slug}` : null;

  // Family intro line ("Umuryango wa X uhagarariwe na ... n'uwa Y uhagarariwe na ... yishimiye kubatumira...")
  // built from structured family fields — each side can have its own representative.
  const familyIntro = (inv: Partial<Invitation>, lang: "rw" | "en"): string => {
    const groomFam = (inv as any).groom_family_name?.trim();
    const brideFam = (inv as any).bride_family_name?.trim();
    const groomRep = (inv as any).groom_represented_by?.trim();
    const brideRep = (inv as any).bride_represented_by?.trim();
    const legacyRep = (inv as any).represented_by?.trim(); // backward compat for older invitations
    if (!groomFam && !brideFam) {
      return lang === "rw"
        ? "Imiryango yacu yishimiye kubatumira mu birori by'ubukwe bw'abana babo:"
        : "Together with our families, we joyfully invite you to celebrate the wedding of:";
    }
    if (lang === "rw") {
      const parts: string[] = [];
      if (groomFam) parts.push(`${parts.length === 0 ? "Umuryango wa" : "n'uwa"} ${groomFam}${groomRep ? ` uhagarariwe na ${groomRep}` : ""}`);
      if (brideFam) parts.push(`${parts.length === 0 ? "Umuryango wa" : "n'uwa"} ${brideFam}${brideRep ? ` uhagarariwe na ${brideRep}` : ""}`);
      let s = parts.join(" ");
      if (!groomRep && !brideRep && legacyRep) s += ` uhagarariwe na ${legacyRep}`;
      return s + " yishimiye kubatumira mu bukwe bw'abana babo aribo:";
    }
    const parts: string[] = [];
    if (groomFam) parts.push(`${groomFam}${groomRep ? `, represented by ${groomRep},` : ""}`);
    if (brideFam) parts.push(`${brideFam}${brideRep ? `, represented by ${brideRep},` : ""}`);
    let s = "The family of " + parts.join(" and ");
    if (!groomRep && !brideRep && legacyRep) s += `, represented by ${legacyRep},`;
    return s + " have the pleasure of inviting you to the wedding ceremony of their children:";
  };

  // Structured bride/groom contact columns, falling back to the legacy free-text couple_contact blob
  const renderContacts = (inv: Partial<Invitation>, colors: { text: string; sub: string }) => {
    const bride: ContactPerson[] = (inv as any).bride_contacts || [];
    const groom: ContactPerson[] = (inv as any).groom_contacts || [];
    const legacy: string | undefined = (inv as any).couple_contact;
    if (bride.length === 0 && groom.length === 0) {
      if (!legacy) return null;
      return <p className="text-[10px] whitespace-pre-line leading-relaxed" style={{ color: colors.sub }}>{legacy}</p>;
    }
    const side = (people: ContactPerson[]) => (
      <div className="space-y-1">
        {people.map((p, i) => (
          <div key={i}>
            {p.name && <p className="text-[10px] font-semibold" style={{ color: colors.text }}>{p.name}</p>}
            {(p.phones || []).filter(Boolean).map((ph, pi) => (
              <p key={pi} className="text-[9px]" style={{ color: colors.sub }}>{pi + 1}. {ph}</p>
            ))}
          </div>
        ))}
      </div>
    );
    return (
      <div className="grid grid-cols-2 gap-3 text-center">
        {side(bride)}
        {side(groom)}
      </div>
    );
  };

  useEffect(() => {
    if (!qrCanvasRef.current || !weddingPublicUrl) return;
    QRCode.toCanvas(qrCanvasRef.current, weddingPublicUrl, {
      width: 96, margin: 1, color: { dark: "#111111", light: "#FFFFFF" },
    }).catch(() => {});
  }, [mode, cardTheme, weddingPublicUrl, previewInv]);

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

  const selectMutation = useMutation({
    mutationFn: (id: string) => apiClient.invitations.select(weddingId!, id),
    onSuccess: (_res, id) => {
      queryClient.invalidateQueries({ queryKey: ["wedding-invitations", weddingId] });
      toast.success("Set as your wedding invitation");
      setPreviewInv(prev => prev ? { ...prev, is_selected: (prev as any).id === id } as any : prev);
      setAiResults(prev => prev.map(v => ({ ...v, is_selected: (v as any).id === id } as any)));
    },
    onError: (e: any) => toast.error(e.message || "Failed to select"),
  });

  const aiMutation = useMutation({
    mutationFn: (data: any) => apiClient.invitations.aiGenerate<Partial<Invitation>[]>(weddingId!, data),
    onSuccess: async (res) => {
      const variants: Partial<Invitation>[] = (res as any).data || [];
      const saved: Partial<Invitation>[] = [];
      for (const v of variants) {
        try {
          const created: any = await apiClient.invitations.create(weddingId!, v);
          saved.push(created.data || v);
        } catch { saved.push(v); }
      }
      setAiResults(saved); // use the saved records (with real ids) so Select works immediately
      setMode("ai-results");
      queryClient.invalidateQueries({ queryKey: ["wedding-invitations", weddingId] });
      toast.success("6 invitations (Botanical, Sage & Leaf, Indigo Mandala, Noir & Gold, Lavender Bloom, Azure Watercolor) generated & saved!");
    },
    onError: (e: any) => toast.error(e.message || "Failed to generate"),
  });

  const handleDownload = (inv: Partial<Invitation>) => {
    const lines: string[] = [];
    if (inv.title) lines.push(inv.title.toUpperCase(), "");
    const verseRw = (inv as any).bible_verse_rw; const verseEn = (inv as any).bible_verse_en || (inv as any).bible_verse;
    if (verseRw) lines.push(`"${verseRw}"`, "");
    if (verseEn) lines.push(`"${verseEn}"`, "");
    if ((inv as any).description) lines.push((inv as any).description, "");
    const groomFam = (inv as any).groom_family_name; const brideFam = (inv as any).bride_family_name;
    const groomRep = (inv as any).groom_represented_by; const brideRep = (inv as any).bride_represented_by; const legacyRep = (inv as any).represented_by;
    if (groomFam || brideFam) {
      const parts: string[] = [];
      if (groomFam) parts.push(`${parts.length === 0 ? "Umuryango wa" : "n'uwa"} ${groomFam}${groomRep ? ` uhagarariwe na ${groomRep}` : ""}`);
      if (brideFam) parts.push(`${parts.length === 0 ? "Umuryango wa" : "n'uwa"} ${brideFam}${brideRep ? ` uhagarariwe na ${brideRep}` : ""}`);
      let famLine = parts.join(" ");
      if (!groomRep && !brideRep && legacyRep) famLine += ` uhagarariwe na ${legacyRep}`;
      famLine += " yishimiye kubatumira mu bukwe bw'abana babo aribo:";
      lines.push(famLine, "");
    }
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
    const brideContacts: ContactPerson[] = (inv as any).bride_contacts || [];
    const groomContacts: ContactPerson[] = (inv as any).groom_contacts || [];
    if (brideContacts.length > 0 || groomContacts.length > 0) {
      lines.push("CONTACTS", "");
      [...brideContacts, ...groomContacts].forEach(p => {
        if (!p.name && !(p.phones||[]).some(ph=>ph)) return;
        if (p.name) lines.push(p.name);
        (p.phones||[]).filter(ph=>ph).forEach((ph, i) => lines.push(`  ${i+1}. ${ph}`));
      });
      lines.push("");
    } else if ((inv as any).couple_contact) {
      lines.push("Couple Contact:", (inv as any).couple_contact, "");
    }
    if (inv.rsvp_details) lines.push(`RSVP: ${inv.rsvp_details}`);
    if (weddingPublicUrl) lines.push("", `Wedding page: ${weddingPublicUrl}`);
    const text = lines.join("\n");
    const blob = new Blob([text],{type:"text/plain;charset=utf-8"}); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`${(inv.title||"invitation").replace(/\s+/g,"_")}.txt`; a.click(); URL.revokeObjectURL(url);
  };

  const handleOpenEdit = (inv: Invitation) => {
    setEditingId(inv.id);
    setManualForm({ title:inv.title, couple_names:inv.couple_names, wedding_date:inv.wedding_date, wedding_time:inv.wedding_time||"", venue:inv.venue||"", message:inv.message||"", rsvp_details:inv.rsvp_details||"", dress_code:inv.dress_code||"", theme:inv.theme||"", tone:inv.tone||"formal", template_style:inv.template_style||"classic", bible_verse:inv.bible_verse||"", bible_verse_rw:inv.bible_verse_rw||"", bible_verse_en:inv.bible_verse_en||"", description:inv.description||"", program_events:(inv.program_events&&inv.program_events.length>0)?inv.program_events:[{...EMPTY_PROGRAM_EVENT}], invitation_note:inv.invitation_note||"", couple_contact:inv.couple_contact||"", groom_family_name:inv.groom_family_name||"", bride_family_name:inv.bride_family_name||"", represented_by:inv.represented_by||"", groom_represented_by:inv.groom_represented_by||"", bride_represented_by:inv.bride_represented_by||"", bride_contacts:(inv.bride_contacts&&inv.bride_contacts.length>0)?inv.bride_contacts:[], groom_contacts:(inv.groom_contacts&&inv.groom_contacts.length>0)?inv.groom_contacts:[] });
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

  // LIST — group AI invitations by couple+date into one card
  const invitationGroups: { key: string; variants: Invitation[]; isAiGroup: boolean }[] = [];
  {
    const seen = new Map<string, number>();
    invitations.forEach((inv: Invitation) => {
      if (inv.is_ai_generated) {
        const key = `${inv.couple_names}|${inv.wedding_date}`;
        if (seen.has(key)) {
          invitationGroups[seen.get(key)!].variants.push(inv);
        } else {
          seen.set(key, invitationGroups.length);
          invitationGroups.push({ key, variants: [inv], isAiGroup: true });
        }
      } else {
        invitationGroups.push({ key: inv.id, variants: [inv], isAiGroup: false });
      }
    });
  }

  if (mode === "list") return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h3 className="text-2xl font-serif italic text-slate-800">Wedding Invitations</h3><p className="text-sm text-slate-500 mt-1">Create, customise, and share your invitations</p></div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={()=>{prefill();setMode("ai-form");}} className="rounded-full text-white px-5 gap-2 shadow-lg bg-[#668c65] hover:bg-[#527451] text-sm"><Sparkles className="h-4 w-4"/>AI Generate</Button>
        </div>
      </div>
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="relative overflow-hidden rounded-2xl shadow-sm border border-slate-100 bg-slate-50/50 animate-pulse">
              <div className="h-1 w-full bg-slate-200" />
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="h-28 bg-slate-100 border border-slate-200 rounded-xl" />
                <div className="flex gap-2 pt-1">
                  <div className="h-8 bg-slate-200 rounded-xl w-20" />
                  <div className="h-8 bg-slate-200 rounded-xl w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )
      : invitations.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-rose-50/30 to-slate-50 rounded-[2.5rem] border-2 border-dashed border-rose-100">
          <Heart className="h-14 w-14 text-rose-200 mx-auto mb-4"/>
          <p className="text-slate-600 font-serif italic text-xl mb-2">No invitations yet</p>
          <p className="text-slate-400 text-sm mb-6">Let AI generate a beautiful invitation for you</p>
          <div className="flex justify-center gap-3">
            <Button onClick={()=>{prefill();setMode("ai-form");}} className="rounded-full text-white px-6 gap-2 bg-[#668c65] hover:bg-[#527451]"><Sparkles className="h-4 w-4"/>Generate with AI</Button>
          </div>
        </div>
      ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {invitationGroups.map(({ key, variants, isAiGroup }) => {
                const inv = variants[0];
                // For AI groups, prefer cream as representative card theme
                const ct = (isAiGroup ? "botanical" : (inv.color_theme as CardThemeKey)) || "botanical";
                const thm = CARD_THEMES[ct] || CARD_THEMES.botanical;
                const openDetails = () => {
                  setCardTheme(ct);
                  setPreviewInv(inv);
                  setPreviewGroup(isAiGroup ? variants : []);
                  setMode("preview");
                };
                return (
                  <div key={key} className="relative overflow-hidden rounded-2xl shadow-md cursor-pointer group transition-transform hover:scale-[1.01]"
                       style={{background:thm.bg, border:`1px solid ${thm.border}`}}
                       onClick={openDetails}>
                    {/* top color bar */}
                    <div className="h-1 w-full" style={{background:`linear-gradient(to right, ${thm.divider}60, ${thm.divider}, ${thm.divider}60)`}}/>
                    {/* corner ornament */}
                    <div className="absolute top-2 right-2 w-10 h-10 pointer-events-none opacity-60">
                      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                        {cardCornerMotif(ct, thm.corner)}
                      </svg>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {isAiGroup ? (
                              <>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100 flex items-center gap-0.5"><Sparkles className="h-2.5 w-2.5"/>AI</span>
                                {/* Color swatches for all variants */}
                                <div className="flex items-center gap-1">
                                  {variants.map(v => {
                                    const vt = CARD_THEMES[(v.color_theme as CardThemeKey)] || CARD_THEMES.botanical;
                                    return <span key={v.id} className="w-3 h-3 rounded-full border border-slate-200 shadow-sm" style={{background:vt.bg}} title={v.color_theme||""}/>
                                  })}
                                </div>
                              </>
                            ) : (
                              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border" style={{color:thm.divider, borderColor:`${thm.divider}50`, background:`${thm.divider}10`}}>{ct}</span>
                            )}
                          </div>
                          <h4 className="text-base font-serif italic truncate" style={{color:thm.text}}>{isAiGroup ? inv.couple_names : inv.title}</h4>
                          <p className="text-[12px] mt-0.5 truncate" style={{color:thm.sub}}>{inv.couple_names} · {inv.wedding_date}</p>
                        </div>
                        {variants.some(v => v.is_selected) && (
                          <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1"><CheckCircle className="h-2.5 w-2.5"/>Selected</span>
                        )}
                      </div>
                      {/* Mini card preview */}
                      <div className="rounded-xl p-3 text-center space-y-1" style={{background:`${thm.divider}08`, border:`1px solid ${thm.divider}20`}}>
                        {((inv as any).bible_verse_en || inv.bible_verse) && <p className="text-[9px] italic line-clamp-2" style={{color:thm.note}}>&ldquo;{(inv as any).bible_verse_en || inv.bible_verse}&rdquo;</p>}
                        {inv.couple_names && <p className="text-[13px] font-serif italic" style={{color:thm.text}}>{inv.couple_names}</p>}
                        {inv.wedding_date && <p className="text-[9px] font-bold uppercase tracking-widest" style={{color:thm.date}}>{inv.wedding_date}</p>}
                        {inv.venue && <p className="text-[9px]" style={{color:thm.sub}}>{inv.venue}</p>}
                      </div>
                      <div className="flex items-center gap-1 pt-1" onClick={e=>e.stopPropagation()}>
                        <Button size="sm" className="rounded-xl gap-1 text-[11px] px-3 py-1 h-auto text-white" style={{background:thm.divider}} onClick={openDetails}><Eye className="h-3 w-3"/>Details</Button>
                        <Button size="sm" variant="ghost" className="rounded-xl gap-1 text-[11px] px-2 py-1 h-auto" style={{color:thm.sub}} onClick={()=>handleOpenEdit(inv)}><Edit className="h-3 w-3"/>Edit</Button>
                        <Button size="sm" variant="ghost" className="rounded-xl gap-1 text-[11px] px-2 py-1 h-auto" style={{color:thm.sub}} onClick={()=>handleDownload(inv)}><Download className="h-3 w-3"/>Save</Button>
                        <Button size="sm" variant="ghost" className="rounded-xl gap-1 text-[11px] px-2 py-1 h-auto text-rose-400 hover:bg-rose-50 ml-auto" onClick={()=>variants.forEach(v=>deleteMutation.mutate(v.id))} disabled={deleteMutation.isPending}><Trash2 className="h-3 w-3"/></Button>
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
    const activeTheme = CARD_THEMES[cardTheme] ? cardTheme : "botanical";
    // Layout comes from the learned template (two_column or single_column)
    const learnedLayout: string = (previewInv as any).template_layout || "two_column";
    const isTwoColumn = learnedLayout !== "single_column";

    if (s === "traditional") {
      // message field is raw text used for download/export only — preview uses structured fields

      const tradEvents: ProgramEvent[] = ((previewInv as any).program_events || []).filter((e: ProgramEvent) => e.event || e.time);

      const thm = CARD_THEMES[activeTheme];

      return (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={()=>setMode("list")} className="rounded-full gap-2 text-slate-500"><X className="h-4 w-4"/>Back</Button>
              <div>
                <h3 className="text-xl font-serif italic text-slate-800">Preview Invitation</h3>
                {(previewInv as any).learned_from_template && (
                  <p className="text-[10px] text-violet-500 flex items-center gap-1 mt-0.5">
                    <Sparkles className="h-3 w-3"/>{isTwoColumn ? "Two-column" : "Single-column"} layout from curated template
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Template:</span>
              {(Object.keys(CARD_THEMES) as CardThemeKey[]).map(k => (
                <button key={k} onClick={()=>{
                  setCardTheme(k);
                  // If we have a group, switch previewInv to the matching variant
                  if (previewGroup.length > 0) {
                    const match = previewGroup.find(v => v.color_theme === k);
                    if (match) setPreviewInv(match);
                  }
                }}
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
                    {cardCornerMotif(activeTheme, thm.corner)}
                  </svg>
                </div>
              ))}

              {/* Divider */}
              <div className="flex items-center justify-center gap-2 px-8 mb-0">
                <div className="h-px flex-1" style={{background:`linear-gradient(to right, transparent, ${thm.divider}99)`}}/>
                <div className="w-1.5 h-1.5 rounded-full" style={{background:thm.divider}}/>
                <div className="w-2 h-2 rounded-full border" style={{borderColor:thm.divider, background:thm.bg}}/>
                <div className="w-1.5 h-1.5 rounded-full" style={{background:thm.divider}}/>
                <div className="h-px flex-1" style={{background:`linear-gradient(to left, transparent, ${thm.divider}99)`}}/>
              </div>

              {/* Body — two-column or single-column based on learned template */}
              {isTwoColumn ? (
                <div className="grid grid-cols-1 md:grid-cols-2 relative px-0">
                  {/* Vertical divider with ornament */}
                  <div className="hidden md:flex absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex-col items-center justify-center pointer-events-none z-10">
                    <div className="w-px flex-1" style={{background:`linear-gradient(to bottom, transparent, ${thm.divider}80, transparent)`}}/>
                    <div className="w-2.5 h-2.5 rotate-45 shrink-0 my-1" style={{background:thm.divider}}/>
                    <Heart className="h-3 w-3 shrink-0" style={{color:thm.divider}} fill={thm.divider}/>
                    <div className="w-2.5 h-2.5 rotate-45 shrink-0 my-1" style={{background:thm.divider}}/>
                    <div className="w-px flex-1" style={{background:`linear-gradient(to bottom, transparent, ${thm.divider}80, transparent)`}}/>
                  </div>
                  {/* LEFT — Kinyarwanda */}
                  <div className="px-8 py-8 text-center font-serif space-y-3 border-b md:border-b-0" style={{borderColor:`${thm.divider}30`}}>
                    <p className="text-[20px] italic mb-1" style={{color:thm.text}}>Ubutumire</p>
                    {((previewInv as any).bible_verse_rw || (previewInv as any).bible_verse) && (
                      <p className="text-[10px] italic leading-relaxed" style={{color:thm.note}}>&ldquo;{(previewInv as any).bible_verse_rw || (previewInv as any).bible_verse}&rdquo;</p>
                    )}
                    <p className="text-[11px] leading-relaxed italic" style={{color:thm.sub}}>{familyIntro(previewInv, "rw")}</p>
                    {previewInv.couple_names && <p className="text-[22px] italic leading-snug" style={{color:thm.text}}>{previewInv.couple_names}</p>}
                    {previewInv.wedding_date && <p className="text-[12px] font-bold tracking-widest uppercase" style={{color:thm.date}}>Buzaba tariki ya {previewInv.wedding_date}</p>}
                    {previewInv.wedding_time && <p className="text-[11px]" style={{color:thm.sub}}>{previewInv.wedding_time}</p>}
                    {tradEvents.length > 0 && (
                      <div className="pt-2 space-y-3 text-left">
                        {tradEvents.map((ev,i)=>(
                          <div key={i} className="flex items-start gap-2">
                            <span className="shrink-0 text-[10px] font-bold font-mono min-w-[52px] text-right pt-0.5" style={{color:thm.date}}>{ev.time}</span>
                            <div className="w-px self-stretch mx-1 shrink-0" style={{background:`${thm.divider}50`}}/>
                            <div><p className="text-[11px] font-semibold" style={{color:thm.text}}>{ev.event}</p>{ev.location && <p className="text-[10px] italic" style={{color:thm.note}}>Aho: {ev.location}</p>}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {(previewInv as any).invitation_note && <p className="text-[10px] italic pt-1" style={{color:thm.note}}>{(previewInv as any).invitation_note}</p>}
                    {renderContacts(previewInv, thm) && (
                      <div className="pt-2 border-t" style={{borderColor:`${thm.divider}30`}}>
                        <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{color:thm.divider}}>Contacts</p>
                        {renderContacts(previewInv, thm)}
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
                    <p className="text-[20px] italic mb-1" style={{color:thm.text}}>Invitation</p>
                    {((previewInv as any).bible_verse_en || (previewInv as any).bible_verse) && (
                      <p className="text-[10px] italic leading-relaxed" style={{color:thm.note}}>&ldquo;{(previewInv as any).bible_verse_en || (previewInv as any).bible_verse}&rdquo;</p>
                    )}
                    <p className="text-[11px] leading-relaxed italic" style={{color:thm.sub}}>{familyIntro(previewInv, "en")}</p>
                    {previewInv.couple_names && <p className="text-[22px] italic leading-snug" style={{color:thm.text}}>{previewInv.couple_names}</p>}
                    {previewInv.wedding_date && <p className="text-[12px] font-bold tracking-widest uppercase" style={{color:thm.date}}>Which will take place on {previewInv.wedding_date}</p>}
                    {previewInv.wedding_time && <p className="text-[11px]" style={{color:thm.sub}}>{previewInv.wedding_time}</p>}
                    {tradEvents.length > 0 && (
                      <div className="pt-2 space-y-3 text-left">
                        {tradEvents.map((ev,i)=>(
                          <div key={i} className="flex items-start gap-2">
                            <span className="shrink-0 text-[10px] font-bold font-mono min-w-[52px] text-right pt-0.5" style={{color:thm.date}}>{ev.time}</span>
                            <div className="w-px self-stretch mx-1 shrink-0" style={{background:`${thm.divider}50`}}/>
                            <div><p className="text-[11px] font-semibold" style={{color:thm.text}}>{ev.event}</p>{ev.location && <p className="text-[10px] italic" style={{color:thm.note}}>Venue: {ev.location}</p>}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {(previewInv as any).invitation_note && <p className="text-[10px] italic pt-1" style={{color:thm.note}}>{(previewInv as any).invitation_note}</p>}
                    {renderContacts(previewInv, thm) && (
                      <div className="pt-2 border-t" style={{borderColor:`${thm.divider}30`}}>
                        <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{color:thm.divider}}>Contacts</p>
                        {renderContacts(previewInv, thm)}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* SINGLE COLUMN — matches uploaded single-column design */
                <div className="px-10 py-8 text-center font-serif space-y-4 max-w-sm mx-auto">
                  {((previewInv as any).bible_verse_en || (previewInv as any).bible_verse) && (
                    <p className="text-[11px] italic leading-relaxed" style={{color:thm.note}}>&ldquo;{(previewInv as any).bible_verse_en || (previewInv as any).bible_verse}&rdquo;</p>
                  )}
                  <p className="text-[11px] leading-relaxed italic" style={{color:thm.sub}}>{familyIntro(previewInv, "en")}</p>
                  {previewInv.couple_names && <p className="text-[26px] italic leading-snug" style={{color:thm.text}}>{previewInv.couple_names}</p>}
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-px flex-1" style={{background:`${thm.divider}60`}}/>
                    <div className="w-1.5 h-1.5 rounded-full" style={{background:thm.divider}}/>
                    <div className="h-px flex-1" style={{background:`${thm.divider}60`}}/>
                  </div>
                  {previewInv.wedding_date && <p className="text-[13px] font-bold tracking-widest uppercase" style={{color:thm.date}}>{previewInv.wedding_date}</p>}
                  {previewInv.wedding_time && <p className="text-[11px]" style={{color:thm.sub}}>{previewInv.wedding_time}</p>}
                  {tradEvents.length > 0 && (
                    <div className="pt-2 space-y-3 text-left">
                      {tradEvents.map((ev,i)=>(
                        <div key={i} className="flex items-start gap-2">
                          <span className="shrink-0 text-[10px] font-bold font-mono min-w-[52px] text-right pt-0.5" style={{color:thm.date}}>{ev.time}</span>
                          <div className="w-px self-stretch mx-1 shrink-0" style={{background:`${thm.divider}50`}}/>
                          <div><p className="text-[11px] font-semibold" style={{color:thm.text}}>{ev.event}</p>{ev.location && <p className="text-[10px] italic" style={{color:thm.note}}>{ev.location}</p>}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {(previewInv as any).invitation_note && <p className="text-[11px] italic pt-2" style={{color:thm.note}}>{(previewInv as any).invitation_note}</p>}
                  {renderContacts(previewInv, thm) && (
                    <div className="pt-3 border-t" style={{borderColor:`${thm.divider}30`}}>
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{color:thm.divider}}>Contacts</p>
                      {renderContacts(previewInv, thm)}
                    </div>
                  )}
                </div>
              )}

              {/* QR code — scan to open the couple's wedding page */}
              <div className="flex flex-col items-center gap-1.5 pb-4">
                {weddingPublicUrl ? (
                  <>
                    <canvas ref={qrCanvasRef} className="rounded"/>
                    <p className="text-[10px] font-semibold tracking-widest uppercase" style={{color:thm.note}}>Scan me</p>
                  </>
                ) : (
                  <p className="text-[10px] italic max-w-[220px] text-center" style={{color:thm.note}}>
                    Publish your wedding website to embed a scannable QR code here.
                  </p>
                )}
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
            {(previewInv as any).is_selected ? (
              <>
                <span className="rounded-full px-6 py-2 gap-2 inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold"><CheckCircle className="h-4 w-4"/>Your Wedding Invitation</span>
                <Button onClick={()=>onGoToGuests?.()} className="rounded-full px-6 gap-2 text-white shadow-lg bg-rose-600 hover:bg-rose-700"><Mail className="h-4 w-4"/>Send to Guests</Button>
              </>
            ) : (previewInv as any).id ? (
              <Button onClick={()=>selectMutation.mutate((previewInv as any).id)} disabled={selectMutation.isPending} className="rounded-full px-6 gap-2 text-white shadow-lg" style={{background:thm.divider}}>
                {selectMutation.isPending?<Loader2 className="h-4 w-4 animate-spin"/>:<CheckCircle className="h-4 w-4"/>}Select as Wedding Invitation
              </Button>
            ) : null}
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
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Template:</span>
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
                  {cardCornerMotif(activeTheme, thm2.corner)}
                </svg>
              </div>
            ))}

            <div className="px-10 py-10 space-y-0 relative z-0">

              {/* Bible verse */}
              {((previewInv as any).bible_verse_en || (previewInv as any).bible_verse) && (
                <div className="text-center mb-5">
                  <p className="text-[11px] italic leading-relaxed font-serif" style={{color:thm2.note}}>
                    &ldquo;{(previewInv as any).bible_verse_en || (previewInv as any).bible_verse}&rdquo;
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
              {renderContacts(previewInv, thm2) && (
                <>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="h-px flex-1" style={{background:`linear-gradient(to right,transparent,${thm2.divider}60)`}}/>
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{color:thm2.divider}}>Contacts</span>
                    <div className="h-px flex-1" style={{background:`linear-gradient(to left,transparent,${thm2.divider}60)`}}/>
                  </div>
                  <div className="text-center">
                    {renderContacts(previewInv, thm2)}
                  </div>
                </>
              )}

            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          {(previewInv as any).is_selected ? (
            <>
              <span className="rounded-full px-6 py-2 gap-2 inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold"><CheckCircle className="h-4 w-4"/>Your Wedding Invitation</span>
              <Button onClick={()=>onGoToGuests?.()} className="rounded-full px-6 gap-2 text-white shadow-lg bg-rose-600 hover:bg-rose-700"><Mail className="h-4 w-4"/>Send to Guests</Button>
            </>
          ) : (previewInv as any).id ? (
            <Button onClick={()=>selectMutation.mutate((previewInv as any).id)} disabled={selectMutation.isPending} className="rounded-full px-6 gap-2 text-white shadow-lg" style={{background:thm2.divider}}>
              {selectMutation.isPending?<Loader2 className="h-4 w-4 animate-spin"/>:<CheckCircle className="h-4 w-4"/>}Select as Wedding Invitation
            </Button>
          ) : null}
          <Button variant="outline" onClick={()=>handleDownload(previewInv)} className="rounded-full px-6 gap-2 hover:bg-amber-50" style={{borderColor:`${thm2.divider}80`, color:thm2.note}}><Download className="h-4 w-4"/>Download</Button>
        </div>
      </div>
    );
  }

  // EDIT
  if (mode === "edit") return (
    <div className="space-y-6 w-full md:w-3/4 mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={()=>{setMode("list");setEditingId(null);}} className="rounded-full gap-2 text-slate-500"><X className="h-4 w-4"/>Cancel</Button>
        <h3 className="text-xl font-serif italic text-slate-800">{editingId?"Edit Invitation":"Create Invitation"}</h3>
      </div>
      <div className="space-y-5">

        {/* 1. Opening Verse — Kinyarwanda & English */}
        <div className="rounded-2xl border border-[#668c65]/20 bg-[#668c65]/5 p-4 space-y-3">
          <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#668c65]"/><span className="text-xs font-semibold uppercase tracking-wider text-[#668c65]">Opening Verse (Bible, Qur&apos;an or your own words)</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Kinyarwanda"><Textarea value={manualForm.bible_verse_rw} onChange={e=>setManualForm(f=>({...f,bible_verse_rw:e.target.value}))} placeholder={'e.g. "Ndi uw\'umukunzi wanjye... — Indirimbo ya Salomo 6:3"'} rows={2} className="rounded-xl border-[#668c65]/20 bg-white/70 resize-none text-sm"/></Field>
            <Field label="English"><Textarea value={manualForm.bible_verse_en} onChange={e=>setManualForm(f=>({...f,bible_verse_en:e.target.value}))} placeholder={'e.g. "I am my beloved\'s... — Song of Solomon 6:3"'} rows={2} className="rounded-xl border-[#668c65]/20 bg-white/70 resize-none text-sm"/></Field>
          </div>
        </div>

        {/* 2. Description */}
        <Field label="Description">
          <Textarea value={manualForm.description} onChange={e=>setManualForm(f=>({...f,description:e.target.value}))} placeholder={"Together with our families,\nwe joyfully invite you to celebrate our wedding ceremony..."} rows={3} className="rounded-2xl border-slate-100 bg-slate-50/50 resize-none"/>
        </Field>

        {/* 3. Family Names — each side with its own "Represented By" */}
        <div className="rounded-2xl border border-[#668c65]/20 bg-[#668c65]/5 p-4 space-y-3">
          <div className="flex items-center gap-2"><Users2 className="h-4 w-4 text-[#668c65]"/><span className="text-xs font-semibold uppercase tracking-wider text-[#668c65]">Family Names</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Field label="Groom Family Name"><Input value={manualForm.groom_family_name} onChange={e=>setManualForm(f=>({...f,groom_family_name:e.target.value}))} placeholder="e.g. NIYONZIMA Celestin" className="rounded-xl border-[#668c65]/20 bg-white h-10 text-sm"/></Field>
              <Field label="Represented By (optional)"><Input value={manualForm.groom_represented_by} onChange={e=>setManualForm(f=>({...f,groom_represented_by:e.target.value}))} placeholder="e.g. RUTAGARAMA Ildephonse" className="rounded-xl border-[#668c65]/20 bg-white h-10 text-sm"/></Field>
            </div>
            <div className="space-y-2">
              <Field label="Bride Family Name"><Input value={manualForm.bride_family_name} onChange={e=>setManualForm(f=>({...f,bride_family_name:e.target.value}))} placeholder="e.g. BUTERA Valens" className="rounded-xl border-[#668c65]/20 bg-white h-10 text-sm"/></Field>
              <Field label="Represented By (optional)"><Input value={manualForm.bride_represented_by} onChange={e=>setManualForm(f=>({...f,bride_represented_by:e.target.value}))} placeholder="e.g. MUKANDAYISENGA Alice" className="rounded-xl border-[#668c65]/20 bg-white h-10 text-sm"/></Field>
            </div>
          </div>
        </div>

        {/* 4. Couple Names & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Couple Names *"><Input value={manualForm.couple_names} onChange={e=>setManualForm(f=>({...f,couple_names:e.target.value}))} placeholder="e.g. Jean Claude ❤️ Diane Uwase" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
          <Field label="Date *"><Input value={manualForm.wedding_date} onChange={e=>setManualForm(f=>({...f,wedding_date:e.target.value}))} placeholder="e.g. Saturday, August 15, 2026" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        </div>

        {/* 5. Wedding Schedule */}
        <div className="rounded-2xl border border-[#668c65]/20 bg-[#668c65]/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-[#668c65]"/><span className="text-xs font-semibold uppercase tracking-wider text-[#668c65]">Wedding Schedule</span></div>
            <Button type="button" size="sm" variant="outline" className="rounded-full text-xs px-3 border-[#668c65]/30 text-[#668c65] hover:bg-[#668c65]/10" onClick={()=>setManualForm(f=>({...f,program_events:[...(f.program_events||[]),{...EMPTY_PROGRAM_EVENT}]}))}>+ Add Event</Button>
          </div>
          {(manualForm.program_events||[]).map((ev,idx)=>(
            <div key={idx} className="rounded-xl border border-[#668c65]/20 bg-white p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input value={ev.event} onChange={e=>{const arr=[...(manualForm.program_events||[])];arr[idx]={...arr[idx],event:e.target.value};setManualForm(f=>({...f,program_events:arr}));}} placeholder="📍 Introduction Ceremony (Gusaba)" className="rounded-xl border-[#668c65]/20 bg-[#668c65]/5 h-9 text-sm flex-1"/>
                <Button type="button" size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-slate-300 hover:text-[#668c65] shrink-0" disabled={(manualForm.program_events||[]).length<=1} onClick={()=>{const arr=[...(manualForm.program_events||[])];arr.splice(idx,1);setManualForm(f=>({...f,program_events:arr}));}}><X className="h-3.5 w-3.5"/></Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-[#668c65]/5 border border-[#668c65]/20 rounded-xl px-3 h-9">
                  <Clock className="h-3.5 w-3.5 text-[#668c65] shrink-0"/>
                  <TimeRangeSelect value={ev.time} onChange={v=>{const arr=[...(manualForm.program_events||[])];arr[idx]={...arr[idx],time:v};setManualForm(f=>({...f,program_events:arr}));}}/>
                </div>
                <div className="flex items-center gap-2 bg-[#668c65]/5 border border-[#668c65]/20 rounded-xl px-3 h-9">
                  <MapPin className="h-3.5 w-3.5 text-[#668c65] shrink-0"/>
                  <Input value={ev.location} onChange={e=>{const arr=[...(manualForm.program_events||[])];arr[idx]={...arr[idx],location:e.target.value};setManualForm(f=>({...f,program_events:arr}));}} placeholder="Maliot Hotel" className="border-0 bg-transparent h-auto p-0 text-sm focus-visible:ring-0"/>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 6. Note */}
        <div className="rounded-2xl border border-[#668c65]/20 bg-[#668c65]/5 p-4 space-y-2">
          <div className="flex items-center gap-2"><StickyNote className="h-4 w-4 text-[#668c65]"/><span className="text-xs font-semibold uppercase tracking-wider text-[#668c65]">Note</span></div>
          <Textarea value={manualForm.invitation_note} onChange={e=>setManualForm(f=>({...f,invitation_note:e.target.value}))} placeholder="We will be happy to celebrate this special day with you." rows={2} className="rounded-2xl border-[#668c65]/20 bg-white/70 resize-none text-sm"/>
        </div>

        {/* 7. Contacts */}
        <div className="rounded-2xl border border-[#668c65]/20 bg-[#668c65]/5 p-4 space-y-3">
          <div className="flex items-center gap-2"><PhoneCall className="h-4 w-4 text-[#668c65]"/><span className="text-xs font-semibold uppercase tracking-wider text-[#668c65]">Contacts</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ContactsSideEditor label="Bride Side" contacts={manualForm.bride_contacts} onChange={v=>setManualForm(f=>({...f,bride_contacts:v}))}/>
            <ContactsSideEditor label="Groom Side" contacts={manualForm.groom_contacts} onChange={v=>setManualForm(f=>({...f,groom_contacts:v}))}/>
          </div>
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
    <div className="space-y-6 w-full md:w-3/4 mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={()=>setMode("list")} className="rounded-full gap-2 text-slate-500"><X className="h-4 w-4"/>Cancel</Button>
        <div>
          <h3 className="text-xl font-serif italic text-[#668c65] flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#668c65]"/>AI Invitation Generator</h3>
          <p className="text-xs text-[#668c65]/70 mt-0.5">Fill in your details and we&apos;ll generate 6 templates: Botanical, Sage &amp; Leaf, Indigo Mandala, Noir &amp; Gold, Lavender Bloom and Azure Watercolor</p>
        </div>
      </div>

      {/* 1. Opening Verse — Kinyarwanda & English */}
      <div className="rounded-2xl border border-[#668c65]/20 bg-[#668c65]/5 p-4 space-y-3">
        <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#668c65]"/><span className="text-xs font-semibold uppercase tracking-wider text-[#668c65]">Opening Verse (Bible, Qur&apos;an or your own words)</span></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Kinyarwanda"><Textarea value={aiForm.bible_verse_rw} onChange={e=>setAiForm(f=>({...f,bible_verse_rw:e.target.value}))} placeholder={'e.g. "Ndi uw\'umukunzi wanjye... — Indirimbo ya Salomo 6:3"'} rows={2} className="rounded-xl border-[#668c65]/20 bg-white/70 resize-none text-sm"/></Field>
          <Field label="English"><Textarea value={aiForm.bible_verse_en} onChange={e=>setAiForm(f=>({...f,bible_verse_en:e.target.value}))} placeholder={'e.g. "I am my beloved\'s... — Song of Solomon 6:3"'} rows={2} className="rounded-xl border-[#668c65]/20 bg-white/70 resize-none text-sm"/></Field>
        </div>
      </div>

      {/* 2. Description */}
      <Field label="Description">
        <Textarea value={aiForm.description} onChange={e=>setAiForm(f=>({...f,description:e.target.value}))} placeholder={"Together with our families,\nwe joyfully invite you to celebrate our wedding ceremony..."} rows={3} className="rounded-2xl border-slate-100 bg-slate-50/50 resize-none"/>
      </Field>

      {/* 3. Family Names — each side with its own "Represented By" */}
      <div className="rounded-2xl border border-[#668c65]/20 bg-[#668c65]/5 p-4 space-y-3">
        <div className="flex items-center gap-2"><Users2 className="h-4 w-4 text-[#668c65]"/><span className="text-xs font-semibold uppercase tracking-wider text-[#668c65]">Family Names</span></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Field label="Groom Family Name"><Input value={aiForm.groom_family_name} onChange={e=>setAiForm(f=>({...f,groom_family_name:e.target.value}))} placeholder="e.g. NIYONZIMA Celestin" className="rounded-xl border-[#668c65]/20 bg-white h-10 text-sm"/></Field>
            <Field label="Represented By (optional)"><Input value={aiForm.groom_represented_by} onChange={e=>setAiForm(f=>({...f,groom_represented_by:e.target.value}))} placeholder="e.g. RUTAGARAMA Ildephonse" className="rounded-xl border-[#668c65]/20 bg-white h-10 text-sm"/></Field>
          </div>
          <div className="space-y-2">
            <Field label="Bride Family Name"><Input value={aiForm.bride_family_name} onChange={e=>setAiForm(f=>({...f,bride_family_name:e.target.value}))} placeholder="e.g. BUTERA Valens" className="rounded-xl border-[#668c65]/20 bg-white h-10 text-sm"/></Field>
            <Field label="Represented By (optional)"><Input value={aiForm.bride_represented_by} onChange={e=>setAiForm(f=>({...f,bride_represented_by:e.target.value}))} placeholder="e.g. MUKANDAYISENGA Alice" className="rounded-xl border-[#668c65]/20 bg-white h-10 text-sm"/></Field>
          </div>
        </div>
      </div>

      {/* 4. Couple Names & Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Couple Names *"><Input value={aiForm.couple_names} onChange={e=>setAiForm(f=>({...f,couple_names:e.target.value}))} placeholder="e.g. Jean Claude ❤️ Diane Uwase" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
        <Field label="Date *"><Input value={aiForm.wedding_date} onChange={e=>setAiForm(f=>({...f,wedding_date:e.target.value}))} placeholder="e.g. Saturday, August 15, 2026" className="rounded-2xl border-slate-100 bg-slate-50/50 h-11"/></Field>
      </div>

      {/* 5. Wedding Schedule */}
      <div className="rounded-2xl border border-[#668c65]/20 bg-[#668c65]/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-[#668c65]"/><span className="text-xs font-semibold uppercase tracking-wider text-[#668c65]">Wedding Schedule</span></div>
          <Button type="button" size="sm" variant="outline" className="rounded-full text-xs px-3 border-[#668c65]/30 text-[#668c65] hover:bg-[#668c65]/10" onClick={()=>setAiForm(f=>({...f,program_events:[...(f.program_events),{...EMPTY_PROGRAM_EVENT}]}))}>+ Add Event</Button>
        </div>
        {aiForm.program_events.map((ev: ProgramEvent, idx: number)=>(
          <div key={idx} className="rounded-xl border border-[#668c65]/20 bg-white p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Input value={ev.event} onChange={e=>{const arr=[...aiForm.program_events];arr[idx]={...arr[idx],event:e.target.value};setAiForm(f=>({...f,program_events:arr}));}} placeholder="📍 Introduction Ceremony (Gusaba)" className="rounded-xl border-[#668c65]/20 bg-[#668c65]/5 h-9 text-sm flex-1"/>
              <Button type="button" size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-slate-300 hover:text-[#668c65] shrink-0" disabled={aiForm.program_events.length<=1} onClick={()=>{const arr=[...aiForm.program_events];arr.splice(idx,1);setAiForm(f=>({...f,program_events:arr}));}}><X className="h-3.5 w-3.5"/></Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 bg-[#668c65]/5 border border-[#668c65]/20 rounded-xl px-3 h-9">
                <Clock className="h-3.5 w-3.5 text-[#668c65] shrink-0"/>
                <TimeRangeSelect value={ev.time} onChange={v=>{const arr=[...aiForm.program_events];arr[idx]={...arr[idx],time:v};setAiForm(f=>({...f,program_events:arr}));}}/>
              </div>
              <div className="flex items-center gap-2 bg-[#668c65]/5 border border-[#668c65]/20 rounded-xl px-3 h-9">
                <MapPin className="h-3.5 w-3.5 text-[#668c65] shrink-0"/>
                <Input value={ev.location} onChange={e=>{const arr=[...aiForm.program_events];arr[idx]={...arr[idx],location:e.target.value};setAiForm(f=>({...f,program_events:arr}));}} placeholder="Maliot Hotel" className="border-0 bg-transparent h-auto p-0 text-sm focus-visible:ring-0"/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 6. Note */}
      <div className="rounded-2xl border border-[#668c65]/20 bg-[#668c65]/5 p-4 space-y-2">
        <div className="flex items-center gap-2"><StickyNote className="h-4 w-4 text-[#668c65]"/><span className="text-xs font-semibold uppercase tracking-wider text-[#668c65]">Note</span></div>
        <Textarea value={aiForm.invitation_note} onChange={e=>setAiForm(f=>({...f,invitation_note:e.target.value}))} placeholder="We will be happy to celebrate this special day with you." rows={2} className="rounded-2xl border-[#668c65]/20 bg-white/70 resize-none text-sm"/>
      </div>

      {/* 7. Contacts */}
      <div className="rounded-2xl border border-[#668c65]/20 bg-[#668c65]/5 p-4 space-y-3">
        <div className="flex items-center gap-2"><PhoneCall className="h-4 w-4 text-[#668c65]"/><span className="text-xs font-semibold uppercase tracking-wider text-[#668c65]">Contacts</span></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ContactsSideEditor label="Bride Side" contacts={aiForm.bride_contacts} onChange={v=>setAiForm(f=>({...f,bride_contacts:v}))}/>
          <ContactsSideEditor label="Groom Side" contacts={aiForm.groom_contacts} onChange={v=>setAiForm(f=>({...f,groom_contacts:v}))}/>
        </div>
      </div>

      <Button onClick={()=>aiMutation.mutate(aiForm)} disabled={aiMutation.isPending||!aiForm.couple_names||!aiForm.wedding_date||!weddingId} className="rounded-full px-8 text-white shadow-lg gap-2 bg-[#668c65] hover:bg-[#527451]">
        {aiMutation.isPending?<Loader2 className="h-4 w-4 animate-spin"/>:<Sparkles className="h-4 w-4"/>}Get Invitation
      </Button>
    </div>
  );

  // AI RESULTS
  if (mode === "ai-results") return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={()=>setMode("ai-form")} className="rounded-full gap-2 text-slate-500"><X className="h-4 w-4"/>Back</Button>
          <h3 className="text-xl font-serif italic text-slate-800">Choose Your Template</h3>
        </div>
        <Button variant="outline" onClick={()=>aiMutation.mutate(aiForm)} disabled={aiMutation.isPending} className="rounded-full gap-2 text-xs">
          {aiMutation.isPending?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<Sparkles className="h-3.5 w-3.5"/>}Regenerate
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {aiResults.map((inv, i) => {
          const ct = ((inv as any).color_theme as CardThemeKey) || "botanical";
          const thm = CARD_THEMES[ct] || CARD_THEMES.botanical;
          const events: ProgramEvent[] = ((inv as any).program_events||[]).filter((e:ProgramEvent)=>e.event||e.time);
          return (
            <div key={i} className="relative overflow-hidden rounded-2xl shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
              style={{background:thm.bg, border:`1.5px solid ${thm.border}`}}
              onClick={()=>{setCardTheme(ct);setPreviewInv(inv);setMode("preview");}}>
              {/* Top accent bar */}
              <div className="h-1 w-full" style={{background:`linear-gradient(to right,${thm.divider}60,${thm.divider},${thm.divider}60)`}}/>
              {/* Corner ornament — distinct motif per template, not just a recolored shape */}
              <div className="absolute top-2 right-2 w-10 h-10 pointer-events-none opacity-60">
                <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                  {cardCornerMotif(ct, thm.corner)}
                </svg>
              </div>
              <div className="p-4 space-y-3">
                {/* Theme badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border" style={{color:thm.divider,borderColor:`${thm.divider}50`,background:`${thm.divider}10`}}>{ct}</span>
                  {(inv as any).is_selected ? (
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-0.5"><CheckCircle className="h-2.5 w-2.5"/>Selected</span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100 flex items-center gap-0.5"><Sparkles className="h-2.5 w-2.5"/>AI</span>
                  )}
                </div>
                {/* Mini card */}
                <div className="rounded-xl p-3 text-center space-y-1" style={{background:`${thm.divider}08`,border:`1px solid ${thm.divider}20`}}>
                  {((inv as any).bible_verse_en || (inv as any).bible_verse) && <p className="text-[9px] italic line-clamp-2" style={{color:thm.note}}>&ldquo;{(inv as any).bible_verse_en || (inv as any).bible_verse}&rdquo;</p>}
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
                  <Button size="sm" variant="ghost" className="rounded-xl gap-1 text-[11px] px-2 py-1 h-auto" style={{color:thm.divider}} onClick={e=>{e.stopPropagation();setManualForm({title:inv.title||"Wedding Invitation",couple_names:inv.couple_names||"",wedding_date:inv.wedding_date||"",wedding_time:inv.wedding_time||"",venue:inv.venue||"",message:inv.message||"",rsvp_details:inv.rsvp_details||"",dress_code:inv.dress_code||"",theme:inv.theme||"",tone:inv.tone||"formal",template_style:"traditional",bible_verse:(inv as any).bible_verse||"",bible_verse_rw:(inv as any).bible_verse_rw||"",bible_verse_en:(inv as any).bible_verse_en||"",description:(inv as any).description||"",program_events:((inv as any).program_events?.length>0)?(inv as any).program_events:[{...EMPTY_PROGRAM_EVENT}],invitation_note:(inv as any).invitation_note||"",couple_contact:(inv as any).couple_contact||"",groom_family_name:(inv as any).groom_family_name||"",bride_family_name:(inv as any).bride_family_name||"",represented_by:(inv as any).represented_by||"",groom_represented_by:(inv as any).groom_represented_by||"",bride_represented_by:(inv as any).bride_represented_by||"",bride_contacts:(inv as any).bride_contacts||[],groom_contacts:(inv as any).groom_contacts||[]});setEditingId(null);setMode("edit");}}><Edit className="h-3 w-3"/>Edit</Button>
                  {(inv as any).id && !(inv as any).is_selected && (
                    <Button size="sm" variant="ghost" className="rounded-xl gap-1 text-[11px] px-2 py-1 h-auto ml-auto" style={{color:thm.divider}} onClick={()=>selectMutation.mutate((inv as any).id)} disabled={selectMutation.isPending}><CheckCircle className="h-3 w-3"/>Select</Button>
                  )}
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

// ── Contacts editor (bride / groom side, multiple people & phone numbers) ─────
// ── Time range picker (dropdowns, no free typing) for wedding-schedule events ──
function TimeRangeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [fromRaw, toRaw] = (value || "").split(/[–-]/).map(s => s.trim());
  const from = TIME_OPTIONS.includes(fromRaw) ? fromRaw : undefined;
  const to = TIME_OPTIONS.includes(toRaw) ? toRaw : undefined;
  const setFrom = (v: string) => onChange(to ? `${v} – ${to}` : v);
  const setTo = (v: string) => onChange(from ? `${from} – ${v}` : v);
  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      <Select value={from} onValueChange={setFrom}>
        <SelectTrigger className="border-0 bg-transparent h-auto p-0 text-sm focus:ring-0 w-auto min-w-0 shadow-none"><SelectValue placeholder="From"/></SelectTrigger>
        <SelectContent className="max-h-64">{TIME_OPTIONS.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
      </Select>
      <span className="text-slate-300 shrink-0">–</span>
      <Select value={to} onValueChange={setTo}>
        <SelectTrigger className="border-0 bg-transparent h-auto p-0 text-sm focus:ring-0 w-auto min-w-0 shadow-none"><SelectValue placeholder="To"/></SelectTrigger>
        <SelectContent className="max-h-64">{TIME_OPTIONS.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function ContactsSideEditor({ label, contacts, onChange }: { label: string; contacts: ContactPerson[]; onChange: (v: ContactPerson[]) => void }) {
  const addPerson = () => onChange([...(contacts||[]), { ...EMPTY_CONTACT_PERSON, phones: [""] }]);
  const removePerson = (idx: number) => { const arr=[...contacts]; arr.splice(idx,1); onChange(arr); };
  const setName = (idx: number, name: string) => { const arr=[...contacts]; arr[idx]={...arr[idx],name}; onChange(arr); };
  const addPhone = (idx: number) => { const arr=[...contacts]; arr[idx]={...arr[idx],phones:[...(arr[idx].phones||[]),""]}; onChange(arr); };
  const setPhone = (idx: number, pidx: number, val: string) => { const arr=[...contacts]; const phones=[...(arr[idx].phones||[])]; phones[pidx]=val; arr[idx]={...arr[idx],phones}; onChange(arr); };
  const removePhone = (idx: number, pidx: number) => { const arr=[...contacts]; const phones=[...(arr[idx].phones||[])]; phones.splice(pidx,1); arr[idx]={...arr[idx],phones}; onChange(arr); };

  return (
    <div className="rounded-xl border border-[#668c65]/20 bg-white p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#668c65]">{label}</span>
        <Button type="button" size="sm" variant="outline" className="rounded-full text-[11px] px-2.5 h-7 border-[#668c65]/30 text-[#668c65] hover:bg-[#668c65]/10" onClick={addPerson}>+ Add Person</Button>
      </div>
      {(contacts||[]).length === 0 && <p className="text-[11px] text-slate-400 italic">No contacts added yet.</p>}
      {(contacts||[]).map((person, idx) => (
        <div key={idx} className="rounded-lg border border-[#668c65]/15 bg-[#668c65]/5 p-2.5 space-y-2">
          <div className="flex items-center gap-2">
            <Input value={person.name} onChange={e=>setName(idx, e.target.value)} placeholder="Full name" className="rounded-lg border-[#668c65]/20 bg-white h-8 text-xs flex-1"/>
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-300 hover:text-rose-500 shrink-0" onClick={()=>removePerson(idx)}><X className="h-3.5 w-3.5"/></Button>
          </div>
          <div className="space-y-1.5 pl-1">
            {(person.phones||[]).map((phone, pidx) => (
              <div key={pidx} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 w-3 shrink-0">{pidx+1}.</span>
                <Input value={phone} onChange={e=>setPhone(idx, pidx, e.target.value)} placeholder="+250 788 123 456" className="rounded-lg border-[#668c65]/20 bg-white h-8 text-xs flex-1"/>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-slate-300 hover:text-rose-500 shrink-0" disabled={(person.phones||[]).length<=1} onClick={()=>removePhone(idx, pidx)}><X className="h-3 w-3"/></Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="ghost" className="rounded-lg text-[10px] px-2 h-6 text-[#668c65]" onClick={()=>addPhone(idx)}>+ phone number</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Shared form components ────────────────────────────────────────────────────
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

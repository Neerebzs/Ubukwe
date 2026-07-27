"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye, EyeOff, Mail, Loader2, Sparkles } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { StatCard } from "./stat-card"
import { Skeleton } from "@/components/ui/skeleton"

// ── Types ──────────────────────────────────────────────────────────────────
interface DesignTemplate {
  id: string
  name: string
  description?: string | null
  template_style: string
  color_theme: string
  layout: string
  preview_couple_names?: string | null
  preview_wedding_date?: string | null
  preview_venue?: string | null
  preview_bible_verse?: string | null
  preview_note?: string | null
  is_active: boolean
  display_order: number
  usage_count: number
  created_at?: string
  updated_at?: string
}

interface FormData {
  name: string
  description: string
  template_style: string
  color_theme: string
  layout: string
  preview_couple_names: string
  preview_wedding_date: string
  preview_venue: string
  preview_bible_verse: string
  preview_note: string
  is_active: boolean
  display_order: number
}

const EMPTY_FORM: FormData = {
  name: "", description: "", template_style: "classic", color_theme: "cream", layout: "single_column",
  preview_couple_names: "Alex & Jordan", preview_wedding_date: "Saturday, 12th December 2026", preview_venue: "",
  preview_bible_verse: "", preview_note: "", is_active: true, display_order: 0,
}

// Mirrors CARD_THEMES in components/dashboard/guest-management.tsx — keep in sync
// so what admins design here is exactly what customers will see and receive by email.
const CARD_THEMES: Record<string, { bg: string; border: string; innerBorder: string; corner: string; text: string; sub: string; date: string; divider: string; note: string; label: string }> = {
  white: { bg: "#FFFFFF", border: "#E8E0D0", innerBorder: "#F0EBE0", corner: "#C8B89A", text: "#1A1209", sub: "#4A3F2A", date: "#6B5A3A", divider: "#C8B89A", note: "#7A6A50", label: "White" },
  gold:  { bg: "#FDF6E3", border: "#D4AF6A", innerBorder: "#E8C97A", corner: "#D4AF6A", text: "#2C1A00", sub: "#5C4A2A", date: "#8B6914", divider: "#D4AF6A", note: "#7B6A45", label: "Gold" },
  cream: { bg: "#FDFBF5", border: "#D4AF6A", innerBorder: "#E0D4B8", corner: "#C4A45A", text: "#2C2010", sub: "#5C4A2A", date: "#7B6A45", divider: "#C4A45A", note: "#7B6A45", label: "Cream" },
}

const STYLE_OPTIONS = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "rustic", label: "Rustic" },
  { value: "floral", label: "Floral" },
  { value: "traditional", label: "Traditional (bilingual)" },
]

const THEME_OPTIONS = [
  { value: "white", label: "White" },
  { value: "gold", label: "Gold" },
  { value: "cream", label: "Cream" },
]

const LAYOUT_OPTIONS = [
  { value: "single_column", label: "Single column" },
  { value: "two_column", label: "Two column (bilingual)" },
]

// ── API ──────────────────────────────────────────────────────────────────
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

function authHeaders() {
  return {
    'Authorization': `Bearer ${typeof window !== "undefined" ? localStorage.getItem('accessToken') : ''}`,
    'Content-Type': 'application/json',
  }
}

const designAPI = {
  getAll: async (): Promise<DesignTemplate[]> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/invitation-designs/`, { headers: authHeaders() })
    if (!res.ok) throw new Error('Failed to fetch invitation design templates')
    const data = await res.json()
    return data.data || []
  },
  create: async (data: Partial<FormData>): Promise<DesignTemplate> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/invitation-designs/`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) })
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || 'Failed to create template') }
    return (await res.json()).data
  },
  update: async (id: string, data: Partial<FormData>): Promise<DesignTemplate> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/invitation-designs/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) })
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || 'Failed to update template') }
    return (await res.json()).data
  },
  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/invitation-designs/${id}`, { method: 'DELETE', headers: authHeaders() })
    if (!res.ok) throw new Error('Failed to delete template')
  },
  toggle: async (id: string): Promise<DesignTemplate> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/invitation-designs/${id}/toggle`, { method: 'PUT', headers: authHeaders() })
    if (!res.ok) throw new Error('Failed to toggle template')
    return (await res.json()).data
  },
}

// ── Mini live preview — shared look & feel with the customer gallery ─────
function DesignPreviewCard({ form }: { form: FormData }) {
  const thm = CARD_THEMES[form.color_theme] || CARD_THEMES.cream
  const isTraditional = form.template_style === "traditional"
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-md" style={{ background: thm.bg, border: `1px solid ${thm.border}` }}>
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(to right, ${thm.divider}60, ${thm.divider}, ${thm.divider}60)` }} />
      <div className="p-6 text-center space-y-2">
        <p className="text-[10px] uppercase tracking-[3px]" style={{ color: thm.date }}>Wedding Invitation</p>
        {form.preview_bible_verse && (
          <p className="text-[11px] italic font-serif" style={{ color: thm.note }}>&ldquo;{form.preview_bible_verse}&rdquo;</p>
        )}
        <p className="text-2xl font-serif italic" style={{ color: thm.text }}>{form.preview_couple_names || "Alex & Jordan"}</p>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: thm.date }}>{form.preview_wedding_date || "Wedding Date"}</p>
        {form.preview_venue && <p className="text-[11px]" style={{ color: thm.sub }}>{form.preview_venue}</p>}
        {isTraditional && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold border" style={{ color: thm.date, borderColor: `${thm.date}60` }}>Bilingual · 2 columns</span>
          </div>
        )}
        {form.preview_note && <p className="text-[11px] italic pt-2" style={{ color: thm.note }}>{form.preview_note}</p>}
      </div>
    </div>
  )
}

export function InvitationTemplatesManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<DesignTemplate | null>(null)
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM })
  const queryClient = useQueryClient()

  const { data: templates = [], isLoading } = useQuery<DesignTemplate[]>({
    queryKey: ["admin-invitation-designs"],
    queryFn: designAPI.getAll,
  })

  const createMutation = useMutation({
    mutationFn: designAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invitation-designs"] })
      toast.success("Design template created")
      setIsCreateOpen(false)
      setForm({ ...EMPTY_FORM })
    },
    onError: (e: any) => toast.error(e.message || "Failed to create template"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FormData> }) => designAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invitation-designs"] })
      toast.success("Design template updated")
      setIsEditOpen(false)
      setEditingTemplate(null)
    },
    onError: (e: any) => toast.error(e.message || "Failed to update template"),
  })

  const deleteMutation = useMutation({
    mutationFn: designAPI.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-invitation-designs"] }); toast.success("Design template deleted") },
    onError: (e: any) => toast.error(e.message || "Failed to delete template"),
  })

  const toggleMutation = useMutation({
    mutationFn: designAPI.toggle,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-invitation-designs"] }); toast.success("Status updated") },
    onError: (e: any) => toast.error(e.message || "Failed to toggle template"),
  })

  const handleOpenEdit = (tpl: DesignTemplate) => {
    setEditingTemplate(tpl)
    setForm({
      name: tpl.name, description: tpl.description || "", template_style: tpl.template_style, color_theme: tpl.color_theme,
      layout: tpl.layout, preview_couple_names: tpl.preview_couple_names || "", preview_wedding_date: tpl.preview_wedding_date || "",
      preview_venue: tpl.preview_venue || "", preview_bible_verse: tpl.preview_bible_verse || "", preview_note: tpl.preview_note || "",
      is_active: tpl.is_active, display_order: tpl.display_order,
    })
    setIsEditOpen(true)
  }

  const stats = {
    total: templates.length,
    active: templates.filter(t => t.is_active).length,
    inactive: templates.filter(t => !t.is_active).length,
    usage: templates.reduce((sum, t) => sum + (t.usage_count || 0), 0),
  }

  const FormFields = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Name *</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Golden Classic" />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Shown to customers in the template gallery" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Style</Label>
            <Select value={form.template_style} onValueChange={v => setForm(f => ({ ...f, template_style: v, layout: v === "traditional" ? f.layout : "single_column" }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STYLE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Color Theme</Label>
            <Select value={form.color_theme} onValueChange={v => setForm(f => ({ ...f, color_theme: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{THEME_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        {form.template_style === "traditional" && (
          <div className="space-y-1.5">
            <Label>Layout</Label>
            <Select value={form.layout} onValueChange={v => setForm(f => ({ ...f, layout: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LAYOUT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-1.5">
          <Label>Sample couple names (gallery preview only)</Label>
          <Input value={form.preview_couple_names} onChange={e => setForm(f => ({ ...f, preview_couple_names: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Sample date</Label>
            <Input value={form.preview_wedding_date} onChange={e => setForm(f => ({ ...f, preview_wedding_date: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Sample venue</Label>
            <Input value={form.preview_venue} onChange={e => setForm(f => ({ ...f, preview_venue: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Sample verse</Label>
          <Textarea value={form.preview_bible_verse} onChange={e => setForm(f => ({ ...f, preview_bible_verse: e.target.value }))} rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label>Sample note</Label>
          <Textarea value={form.preview_note} onChange={e => setForm(f => ({ ...f, preview_note: e.target.value }))} rows={2} />
        </div>
        <div className="flex items-center justify-between rounded-xl border p-3">
          <div>
            <Label>Active</Label>
            <p className="text-xs text-muted-foreground">Visible to customers in the gallery</p>
          </div>
          <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Display order</Label>
          <Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Live preview</Label>
        <DesignPreviewCard form={form} />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif italic">Invitation Design Templates</h2>
          <p className="text-sm text-muted-foreground mt-1">Curate the designs customers can pick, fill in, and email to their guests.</p>
        </div>
        <Button onClick={() => { setForm({ ...EMPTY_FORM }); setIsCreateOpen(true) }} className="gap-2">
          <Plus className="h-4 w-4" /> New Template
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Templates" value={stats.total} icon={Mail} />
        <StatCard label="Active" value={stats.active} icon={Eye} />
        <StatCard label="Inactive" value={stats.inactive} icon={EyeOff} />
        <StatCard label="Times Used" value={stats.usage} icon={Sparkles} />
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed">
          <Mail className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">No design templates yet</p>
          <p className="text-sm text-muted-foreground mb-4">Create your first invitation design for customers to use.</p>
          <Button onClick={() => { setForm({ ...EMPTY_FORM }); setIsCreateOpen(true) }} className="gap-2"><Plus className="h-4 w-4" />New Template</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map(tpl => (
            <div key={tpl.id} className="rounded-2xl border overflow-hidden bg-card">
              <DesignPreviewCard form={{
                ...EMPTY_FORM, template_style: tpl.template_style, color_theme: tpl.color_theme, layout: tpl.layout,
                preview_couple_names: tpl.preview_couple_names || "", preview_wedding_date: tpl.preview_wedding_date || "",
                preview_venue: tpl.preview_venue || "", preview_bible_verse: tpl.preview_bible_verse || "", preview_note: tpl.preview_note || "",
              }} />
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold truncate">{tpl.name}</p>
                  <Badge variant={tpl.is_active ? "default" : "secondary"}>{tpl.is_active ? "Active" : "Inactive"}</Badge>
                </div>
                {tpl.description && <p className="text-xs text-muted-foreground line-clamp-2">{tpl.description}</p>}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">{tpl.template_style}</Badge>
                  <Badge variant="outline" className="text-[10px]">{tpl.color_theme}</Badge>
                  <Badge variant="outline" className="text-[10px]">Used {tpl.usage_count}x</Badge>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" variant="outline" className="gap-1.5 flex-1" onClick={() => handleOpenEdit(tpl)}><Edit className="h-3.5 w-3.5" />Edit</Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toggleMutation.mutate(tpl.id)}>
                    {tpl.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1.5 text-red-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{tpl.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>This design template will be permanently removed from the gallery. Invitations already created from it keep their own copy of the style, so they are unaffected.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(tpl.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Invitation Design Template</DialogTitle></DialogHeader>
          <FormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending} className="gap-2">
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Invitation Design Template</DialogTitle></DialogHeader>
          <FormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={() => editingTemplate && updateMutation.mutate({ id: editingTemplate.id, data: form })} disabled={!form.name || updateMutation.isPending} className="gap-2">
              {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

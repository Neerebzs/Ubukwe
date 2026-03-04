"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Download,
  Upload
} from "lucide-react";
import { useRef, useState } from "react";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  dietaryRestrictions: string;
  plusOne: boolean;
  plusOneName?: string;
  tableNumber?: number;
  notes: string;
  invitationSent: boolean;
  lastContacted?: string;
}

export function GuestManagement() {
  const [guests, setGuests] = useState<Guest[]>([
    {
      id: "1",
      name: "Jean Baptiste",
      email: "jean@example.com",
      phone: "+250 788 123 456",
      relationship: "Family",
      rsvpStatus: "confirmed",
      dietaryRestrictions: "Vegetarian",
      plusOne: true,
      plusOneName: "Marie Claire",
      tableNumber: 1,
      notes: "Prefers front table",
      invitationSent: true,
      lastContacted: "2024-01-15"
    },
    {
      id: "2",
      name: "Dr. Paul Nkurunziza",
      email: "paul.nkurunziza@example.com",
      phone: "+250 789 234 567",
      relationship: "Family",
      rsvpStatus: "pending",
      dietaryRestrictions: "None",
      plusOne: false,
      tableNumber: 2,
      notes: "Medical professional",
      invitationSent: true,
      lastContacted: "2024-01-10"
    },
    {
      id: "3",
      name: "Grace Uwimana",
      email: "grace.uwimana@example.com",
      phone: "+250 787 345 678",
      relationship: "Friend",
      rsvpStatus: "declined",
      dietaryRestrictions: "Halal",
      plusOne: false,
      notes: "Will attend reception only",
      invitationSent: true,
      lastContacted: "2024-01-12"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [newGuest, setNewGuest] = useState<Partial<Guest>>({
    name: "",
    email: "",
    phone: "",
    relationship: "",
    rsvpStatus: "pending",
    dietaryRestrictions: "",
    plusOne: false,
    notes: ""
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [editGuest, setEditGuest] = useState<Partial<Guest>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.relationship.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || guest.rsvpStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const rsvpStats = {
    total: guests.length,
    confirmed: guests.filter(g => g.rsvpStatus === "confirmed").length,
    pending: guests.filter(g => g.rsvpStatus === "pending").length,
    declined: guests.filter(g => g.rsvpStatus === "declined").length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "default";
      case "pending": return "secondary";
      case "declined": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "declined": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleAddGuest = () => {
    if (newGuest.name && newGuest.email) {
      const guest: Guest = {
        id: Date.now().toString(),
        name: newGuest.name!,
        email: newGuest.email!,
        phone: newGuest.phone || "",
        relationship: newGuest.relationship || "",
        rsvpStatus: newGuest.rsvpStatus as any || "pending",
        dietaryRestrictions: newGuest.dietaryRestrictions || "",
        plusOne: newGuest.plusOne || false,
        plusOneName: newGuest.plusOneName || "",
        tableNumber: newGuest.tableNumber,
        notes: newGuest.notes || "",
        invitationSent: false
      };
      setGuests([...guests, guest]);
      setNewGuest({
        name: "",
        email: "",
        phone: "",
        relationship: "",
        rsvpStatus: "pending",
        dietaryRestrictions: "",
        plusOne: false,
        plusOneName: "",
        tableNumber: undefined,
        notes: ""
      });
      setShowAddGuest(false);
    }
  };

  const handleOpenEdit = (guestId: string) => {
    const g = guests.find(x => x.id === guestId);
    if (!g) return;
    setEditingGuestId(guestId);
    setEditGuest({ ...g });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingGuestId || !editGuest.name || !editGuest.email) {
      setIsEditOpen(false);
      return;
    }
    setGuests(guests.map(g => g.id === editingGuestId ? {
      ...g,
      name: editGuest.name!,
      email: editGuest.email!,
      phone: editGuest.phone || "",
      relationship: editGuest.relationship || "",
      rsvpStatus: (editGuest.rsvpStatus as any) || g.rsvpStatus,
      dietaryRestrictions: editGuest.dietaryRestrictions || "",
      plusOne: !!editGuest.plusOne,
      plusOneName: editGuest.plusOneName || "",
      tableNumber: editGuest.tableNumber,
      notes: editGuest.notes || "",
    } : g));
    setIsEditOpen(false);
    setEditingGuestId(null);
  };

  const handleSendInvite = (guestId: string) => {
    setGuests(guests.map(g => g.id === guestId ? { ...g, invitationSent: true, lastContacted: new Date().toISOString().split('T')[0] } : g));
  };

  const handleExportCSV = () => {
    const header = ["id", "name", "email", "phone", "relationship", "rsvpStatus", "dietaryRestrictions", "plusOne", "plusOneName", "tableNumber", "notes", "invitationSent", "lastContacted"];
    const rows = guests.map(g => [
      g.id,
      g.name,
      g.email,
      g.phone,
      g.relationship,
      g.rsvpStatus,
      g.dietaryRestrictions,
      g.plusOne ? "true" : "false",
      g.plusOneName || "",
      g.tableNumber != null ? String(g.tableNumber) : "",
      (g.notes || "").replace(/\n/g, " ").replace(/"/g, "'"),
      g.invitationSent ? "true" : "false",
      g.lastContacted || ""
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guests.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length <= 1) return;
      const [, ...dataLines] = lines; // skip header
      const imported: Guest[] = dataLines.map((line) => {
        const cols = line.match(/\"([^\"]|\"\")*\"(?=,|$)/g)?.map(s => s.slice(1, -1).replace(/\"\"/g, '"')) || [];
        return {
          id: cols[0] || Date.now().toString(),
          name: cols[1] || "",
          email: cols[2] || "",
          phone: cols[3] || "",
          relationship: cols[4] || "",
          rsvpStatus: (cols[5] as any) || "pending",
          dietaryRestrictions: cols[6] || "",
          plusOne: (cols[7] || "").toLowerCase() === "true",
          plusOneName: cols[8] || "",
          tableNumber: cols[9] ? Number(cols[9]) : undefined,
          notes: cols[10] || "",
          invitationSent: (cols[11] || "").toLowerCase() === "true",
          lastContacted: cols[12] || undefined,
        };
      }).filter(g => g.name && g.email);
      setGuests(prev => [...prev, ...imported]);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleUpdateRSVP = (guestId: string, status: string) => {
    setGuests(guests.map(guest =>
      guest.id === guestId
        ? { ...guest, rsvpStatus: status as any, lastContacted: new Date().toISOString().split('T')[0] }
        : guest
    ));
  };

  const handleDeleteGuest = (guestId: string) => {
    setGuests(guests.filter(guest => guest.id !== guestId));
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif italic text-slate-800">Guest Management</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium italic">Curate your celebration's inner circle and RSVPs</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportFileChange} />
          <Button variant="outline" onClick={handleExportCSV} className="rounded-full border-sage-200 text-sage-700 hover:bg-sage-50 px-6">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleImportClick} className="rounded-full border-sage-200 text-sage-700 hover:bg-sage-50 px-6">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowAddGuest(true)} className="rounded-full bg-sage-600 hover:bg-sage-700 text-white shadow-lg shadow-sage-200 px-8 transition-all hover:scale-105">
            <Plus className="w-4 h-4 mr-2" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* RSVP Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-xl shadow-sage-500/5 rounded-[2rem] bg-gradient-to-br from-sage-50/50 to-white overflow-hidden group hover:shadow-sage-500/10 transition-all duration-500">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="p-3 bg-sage-100 text-sage-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Total Registry</p>
            <p className="text-2xl font-bold text-slate-800 tracking-tight mt-1">{rsvpStats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-emerald-500/5 rounded-[2rem] bg-gradient-to-br from-emerald-50/50 to-white overflow-hidden group hover:shadow-emerald-500/10 transition-all duration-500">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Confirmed</p>
            <p className="text-2xl font-bold text-emerald-700 tracking-tight mt-1">{rsvpStats.confirmed}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-amber-500/5 rounded-[2rem] bg-gradient-to-br from-amber-50/50 to-white overflow-hidden group hover:shadow-amber-500/10 transition-all duration-500">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Pending Response</p>
            <p className="text-2xl font-bold text-amber-700 tracking-tight mt-1">{rsvpStats.pending}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-rose-500/5 rounded-[2rem] bg-gradient-to-br from-rose-50/50 to-white overflow-hidden group hover:shadow-rose-500/10 transition-all duration-500">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
              <XCircle className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Regretfully Declined</p>
            <p className="text-2xl font-bold text-rose-700 tracking-tight mt-1">{rsvpStats.declined}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-sage-600 transition-colors" />
          <Input
            placeholder="Search guests by name, email, or relationship..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 rounded-full border-sage-100 bg-white/50 backdrop-blur-sm focus:ring-sage-500 focus:border-sage-500 transition-all shadow-sm"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-56 h-12 rounded-full border-sage-100 bg-white shadow-sm focus:ring-sage-500">
            <Filter className="w-4 h-4 mr-2 text-sage-600" />
            <SelectValue placeholder="RSVP Status" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-sage-100">
            <SelectItem value="all">All Guests</SelectItem>
            <SelectItem value="confirmed">Confirmed Only</SelectItem>
            <SelectItem value="pending">Pending Only</SelectItem>
            <SelectItem value="declined">Declined Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Add Guest Modal */}
      <Dialog open={showAddGuest} onOpenChange={setShowAddGuest}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl p-8 bg-white/95 backdrop-blur-sm">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-serif italic text-slate-800">Add New Guest</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Full Name *</Label>
                <Input
                  id="name"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  placeholder="Enter guest name"
                  className="rounded-2xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all shadow-sm shadow-slate-100/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                  placeholder="Enter email address"
                  className="rounded-2xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all shadow-sm shadow-slate-100/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Phone</Label>
                <Input
                  id="phone"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="rounded-2xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all shadow-sm shadow-slate-100/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Relationship</Label>
                <Select value={newGuest.relationship} onValueChange={(value) => setNewGuest({ ...newGuest, relationship: value })}>
                  <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all shadow-sm shadow-slate-100/50">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-xl overflow-hidden">
                    <SelectItem value="Family">Family</SelectItem>
                    <SelectItem value="Friend">Friend</SelectItem>
                    <SelectItem value="Colleague">Colleague</SelectItem>
                    <SelectItem value="Neighbor">Neighbor</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dietary" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Dietary Restrictions</Label>
                <Input
                  id="dietary"
                  value={newGuest.dietaryRestrictions || ""}
                  onChange={(e) => setNewGuest({ ...newGuest, dietaryRestrictions: e.target.value })}
                  placeholder="e.g., Vegetarian, Halal"
                  className="rounded-2xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all shadow-sm shadow-slate-100/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="table" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Table Number</Label>
                <Input
                  id="table"
                  type="number"
                  value={newGuest.tableNumber ?? ''}
                  onChange={(e) => setNewGuest({ ...newGuest, tableNumber: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Optional"
                  className="rounded-2xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all shadow-sm shadow-slate-100/50"
                />
              </div>
              <div className="space-y-4 md:col-span-2 pt-2">
                <div className="flex items-center space-x-3 p-4 bg-sage-50/30 rounded-2xl border border-sage-100/50">
                  <input
                    type="checkbox"
                    id="plusOne"
                    checked={newGuest.plusOne}
                    onChange={(e) => setNewGuest({ ...newGuest, plusOne: e.target.checked })}
                    className="w-4 h-4 rounded text-sage-600 focus:ring-sage-500"
                  />
                  <Label htmlFor="plusOne" className="text-sm font-medium text-sage-800 cursor-pointer">Plus One Guest Included</Label>
                </div>
              </div>
              {newGuest.plusOne && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="plusOneName" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Plus One Name</Label>
                  <Input
                    id="plusOneName"
                    value={newGuest.plusOneName || ""}
                    onChange={(e) => setNewGuest({ ...newGuest, plusOneName: e.target.value })}
                    placeholder="Enter plus one name"
                    className="rounded-2xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all shadow-sm shadow-slate-100/50"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Additional Notes</Label>
              <Textarea
                id="notes"
                value={newGuest.notes}
                onChange={(e) => setNewGuest({ ...newGuest, notes: e.target.value })}
                placeholder="Additional notes about this guest..."
                rows={3}
                className="rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all shadow-sm shadow-slate-100/50 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="ghost"
                className="rounded-2xl px-6 text-slate-500 hover:bg-slate-50"
                onClick={() => {
                  setShowAddGuest(false);
                  setNewGuest({
                    name: "",
                    email: "",
                    phone: "",
                    relationship: "",
                    rsvpStatus: "pending",
                    dietaryRestrictions: "",
                    plusOne: false,
                    plusOneName: "",
                    tableNumber: undefined,
                    notes: ""
                  });
                }}>
                Cancel
              </Button>
              <Button onClick={handleAddGuest} className="rounded-2xl px-8 bg-sage-600 hover:bg-sage-700 text-white shadow-lg shadow-sage-500/20">
                Register Guest
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Guest List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-serif italic text-slate-800">Registry Details ({filteredGuests.length})</h3>
        </div>
        <div className="grid gap-6">
          {filteredGuests.length > 0 ? filteredGuests.map((guest) => (
            <Card key={guest.id} className="border-none shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white hover:shadow-sage-500/5 transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Status Indicator Bar */}
                  <div className={`w-full lg:w-1.5 h-1.5 lg:h-auto ${guest.rsvpStatus === 'confirmed' ? 'bg-emerald-400' :
                    guest.rsvpStatus === 'declined' ? 'bg-rose-400' : 'bg-amber-400'
                    }`} />

                  <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row items-start justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-xl font-serif italic text-slate-800 tracking-tight">{guest.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider border-none ${guest.rsvpStatus === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                            guest.rsvpStatus === 'declined' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                            {getStatusIcon(guest.rsvpStatus)}
                            <span className="ml-1">{guest.rsvpStatus}</span>
                          </Badge>
                          {guest.plusOne && (
                            <Badge className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-sage-50 text-sage-700 border-none">+1 Guest</Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2.5 text-sm text-slate-500">
                          <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-sage-50 transition-colors">
                            <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-sage-600" />
                          </div>
                          <span className="truncate">{guest.email}</span>
                        </div>
                        {guest.phone && (
                          <div className="flex items-center gap-2.5 text-sm text-slate-500">
                            <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-sage-50 transition-colors">
                              <Phone className="w-3.5 h-3.5 text-slate-400 group-hover:text-sage-600" />
                            </div>
                            <span>{guest.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2.5 text-sm text-slate-500">
                          <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-sage-50 transition-colors">
                            <Users className="w-3.5 h-3.5 text-slate-400 group-hover:text-sage-600" />
                          </div>
                          <span>{guest.relationship}</span>
                        </div>
                        {guest.tableNumber && (
                          <div className="flex items-center gap-2.5 text-sm text-slate-500">
                            <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-sage-50 transition-colors">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-sage-600" />
                            </div>
                            <span>Table {guest.tableNumber}</span>
                          </div>
                        )}
                      </div>

                      {(guest.dietaryRestrictions || guest.notes) && (
                        <div className="pt-2 flex flex-wrap gap-3">
                          {guest.dietaryRestrictions && (
                            <div className="px-3 py-1.5 bg-amber-50/50 rounded-xl border border-amber-100/50 text-[11px] text-amber-800">
                              <span className="font-bold uppercase mr-1">Dietary:</span> {guest.dietaryRestrictions}
                            </div>
                          )}
                          {guest.notes && (
                            <div className="px-3 py-1.5 bg-sage-50/30 rounded-xl border border-sage-100/30 text-[11px] text-sage-800">
                              <span className="font-bold uppercase mr-1">Note:</span> {guest.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col lg:flex-row items-center gap-3 w-full md:w-auto self-stretch md:self-center justify-end">
                      <div className="flex items-center bg-slate-50/50 p-1 rounded-2xl border border-slate-100">
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-9 w-9 rounded-xl transition-all ${guest.rsvpStatus === 'confirmed' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}
                          onClick={() => handleUpdateRSVP(guest.id, "confirmed")}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-9 w-9 rounded-xl transition-all ${guest.rsvpStatus === 'pending' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-400 hover:text-amber-500'}`}
                          onClick={() => handleUpdateRSVP(guest.id, "pending")}
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-9 w-9 rounded-xl transition-all ${guest.rsvpStatus === 'declined' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-400 hover:text-rose-500'}`}
                          onClick={() => handleUpdateRSVP(guest.id, "declined")}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-2xl border-sage-100 text-sage-700 hover:bg-sage-50" onClick={() => handleOpenEdit(guest.id)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-2xl border-rose-100 text-rose-700 hover:bg-rose-50" onClick={() => handleDeleteGuest(guest.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-serif italic text-lg">Your registry list is empty</p>
              <Button onClick={() => setShowAddGuest(true)} variant="link" className="text-sage-600 mt-2">Add your first guest</Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Guest Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl p-8 bg-white/95 backdrop-blur-sm">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-serif italic text-slate-800">Edit Guest Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={editGuest.name || ""}
                  onChange={(e) => setEditGuest({ ...editGuest, name: e.target.value })}
                  className="rounded-2xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all shadow-sm shadow-slate-100/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editGuest.email || ""}
                  onChange={(e) => setEditGuest({ ...editGuest, email: e.target.value })}
                  className="rounded-2xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all shadow-sm shadow-slate-100/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editGuest.phone || ""}
                  onChange={(e) => setEditGuest({ ...editGuest, phone: e.target.value })}
                  className="rounded-2xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all shadow-sm shadow-slate-100/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Relationship</Label>
                <Select value={editGuest.relationship || ""} onValueChange={(v) => setEditGuest({ ...editGuest, relationship: v })}>
                  <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all shadow-sm shadow-slate-100/50">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-xl overflow-hidden">
                    <SelectItem value="Family">Family</SelectItem>
                    <SelectItem value="Friend">Friend</SelectItem>
                    <SelectItem value="Colleague">Colleague</SelectItem>
                    <SelectItem value="Neighbor">Neighbor</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">RSVP Status</Label>
                <Select value={(editGuest.rsvpStatus as any) || "pending"} onValueChange={(v) => setEditGuest({ ...editGuest, rsvpStatus: v as any })}>
                  <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all shadow-sm shadow-slate-100/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-xl overflow-hidden">
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dietary" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Dietary Restrictions</Label>
                <Input
                  id="edit-dietary"
                  value={editGuest.dietaryRestrictions || ""}
                  onChange={(e) => setEditGuest({ ...editGuest, dietaryRestrictions: e.target.value })}
                  className="rounded-2xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all shadow-sm shadow-slate-100/50"
                />
              </div>
              <div className="space-y-4 pt-8">
                <div className="flex items-center space-x-3 p-3 bg-sage-50/30 rounded-2xl border border-sage-100/50">
                  <input
                    type="checkbox"
                    id="edit-plusOne"
                    checked={!!editGuest.plusOne}
                    onChange={(e) => setEditGuest({ ...editGuest, plusOne: e.target.checked })}
                    className="w-4 h-4 rounded text-sage-600 focus:ring-sage-500"
                  />
                  <Label htmlFor="edit-plusOne" className="text-sm font-medium text-sage-800 cursor-pointer">Plus One Guest Included</Label>
                </div>
              </div>
              {editGuest.plusOne && (
                <div className="space-y-2">
                  <Label htmlFor="edit-plusOneName" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Plus One Name</Label>
                  <Input
                    id="edit-plusOneName"
                    value={editGuest.plusOneName || ""}
                    onChange={(e) => setEditGuest({ ...editGuest, plusOneName: e.target.value })}
                    className="rounded-2xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all shadow-sm shadow-slate-100/50"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-table" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Table Number</Label>
                <Input
                  id="edit-table"
                  type="number"
                  value={editGuest.tableNumber ?? ''}
                  onChange={(e) => setEditGuest({ ...editGuest, tableNumber: e.target.value ? Number(e.target.value) : undefined })}
                  className="rounded-2xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all shadow-sm shadow-slate-100/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes" className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Additional Notes</Label>
              <Textarea
                id="edit-notes"
                value={editGuest.notes || ""}
                onChange={(e) => setEditGuest({ ...editGuest, notes: e.target.value })}
                className="rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all shadow-sm shadow-slate-100/50 resize-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-2xl px-6 text-slate-500 hover:bg-slate-50">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="rounded-2xl px-8 bg-sage-600 hover:bg-sage-700 text-white shadow-lg shadow-sage-500/20">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

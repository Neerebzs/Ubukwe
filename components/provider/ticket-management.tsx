"use client";

import { useState, useMemo } from "react";
import { Plus, X, AlertCircle, CheckCircle, Loader, Edit2, Trash2, Ticket, Users, UserCheck, DollarSign, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  useCreateTicketType,
  useUpdateTicketType,
  useDeleteTicketType,
  useCreateTicket,
  useCheckInTicket,
} from "@/hooks/useEvents";
import { TicketType } from "@/lib/api/events";
import { EventAnalytics } from "@/lib/api/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface TicketData {
  id: string;
  event_id: string;
  ticket_type_id: string;
  holder_name: string;
  holder_email: string;
  holder_phone?: string;
  ticket_number: string;
  status: string;
  is_checked_in: boolean;
  checked_in_at?: string;
  created_at: string;
  updated_at?: string;
}

interface TicketInspector {
  id: string;
  name: string;
  email?: string;
  phone_number?: string;
  identification_number: string;
  is_active: boolean;
}

interface TicketManagementProps {
  eventId: string;
  eventCapacity: number;
  ticketTypes: TicketType[];
  tickets?: TicketData[];
  inspectors?: TicketInspector[];
  analytics?: EventAnalytics;
  onTicketTypeAdded?: () => void;
  onTicketCreated?: () => void;
  onInspectorAdded?: (data: { name: string; email: string; phone_number: string }) => void;
  onInspectorDeleted?: (id: string) => void;
}

interface TicketTypeFormData {
  name: string;
  description: string;
  price: string;
  quantity: string;
}

interface TicketFormData {
  holder_name: string;
  holder_email: string;
  holder_phone: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  quantity?: string;
  holder_name?: string;
  holder_email?: string;
  holder_phone?: string;
  inspector_name?: string;
  inspector_email?: string;
  inspector_phone?: string;
}

// ─── Event Statistics Sub-component ────────────────────────────────────────

interface EventStatisticsTabProps {
  tickets: TicketData[];
  ticketTypes: TicketType[];
  analytics?: EventAnalytics;
}

function EventStatisticsTab({ tickets, ticketTypes, analytics }: EventStatisticsTabProps) {
  // Prefer backend analytics for KPI numbers; fall back to local computation
  const totalSold = analytics?.total_tickets_sold ?? tickets.length;
  const totalCheckedIn = analytics?.checked_in_count ?? tickets.filter((t) => t.is_checked_in).length;
  const checkInRate = analytics?.check_in_percentage ?? (totalSold > 0 ? Math.round((totalCheckedIn / totalSold) * 100) : 0);
  const totalRevenue = analytics?.total_revenue ?? ticketTypes.reduce((sum, tt) => sum + tt.price * tt.sold, 0);

  // Per-ticket-type breakdown — prefer analytics breakdown if available
  const typeBreakdown = analytics?.ticket_types_breakdown ?? ticketTypes.map((tt) => ({
    name: tt.name,
    price: tt.price,
    quantity: tt.quantity,
    sold: tt.sold,
    revenue: tt.price * tt.sold,
  }));

  // Bar chart data derived from breakdown
  const typeChartData = typeBreakdown.map((tt) => ({
    name: tt.name.length > 12 ? tt.name.slice(0, 12) + "…" : tt.name,
    Sold: tt.sold,
    Remaining: tt.quantity - tt.sold,
    Revenue: tt.revenue,
  }));

  // Sales over time — group tickets by date of purchase
  const salesByDate = useMemo(() => {
    const map: Record<string, number> = {};
    tickets.forEach((t) => {
      const day = new Date(t.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, count]) => ({ date, Tickets: count }));
  }, [tickets]);

  // Donut data: checked-in vs not
  const donutData = [
    { name: "Checked In", value: totalCheckedIn, color: "#668c65" },
    { name: "Not Yet", value: totalSold - totalCheckedIn, color: "#f1f5f4" },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-xl">
        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-[10px] font-black" style={{ color: p.color }}>
            {p.name}: {p.name === "Revenue" ? `${p.value.toLocaleString()} RWF` : p.value}
          </p>
        ))}
      </div>
    );
  };

  if (totalSold === 0 && ticketTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[3rem] border border-slate-100 bg-white py-32">
        <TrendingUp className="mb-6 h-12 w-12 text-slate-200" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">No data yet — stats will appear once tickets are sold</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Tickets Sold */}
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">Tickets Sold</p>
            <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center">
              <Ticket className="h-4 w-4 text-slate-400" />
            </div>
          </div>
          <p className="font-serif text-5xl italic text-slate-900 leading-none">{totalSold.toLocaleString()}</p>
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Across all ticket types</p>
        </div>

        {/* Total Checked In */}
        <div className="rounded-[2.5rem] border border-[#668c65]/20 bg-[#668c65]/5 p-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-black uppercase tracking-[0.25em] text-[#668c65]">Checked In</p>
            <div className="h-10 w-10 rounded-2xl bg-[#668c65]/10 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-[#668c65]" />
            </div>
          </div>
          <p className="font-serif text-5xl italic text-[#668c65] leading-none">{totalCheckedIn.toLocaleString()}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 rounded-full bg-[#668c65]/10 overflow-hidden">
              <div className="h-full bg-[#668c65] transition-all duration-700" style={{ width: `${checkInRate}%` }} />
            </div>
            <p className="text-[8px] font-black uppercase tracking-widest text-[#668c65]">{checkInRate}%</p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="rounded-[2.5rem] border border-amber-100 bg-amber-50/30 p-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-black uppercase tracking-[0.25em] text-amber-500">Total Revenue</p>
            <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-amber-500" />
            </div>
          </div>
          <p className="font-serif text-4xl italic text-amber-600 leading-none">
            {totalRevenue >= 1_000_000
              ? `${(totalRevenue / 1_000_000).toFixed(1)}M`
              : totalRevenue >= 1_000
              ? `${(totalRevenue / 1_000).toFixed(0)}K`
              : totalRevenue.toLocaleString()}
            <span className="text-lg ml-1 font-sans font-black">RWF</span>
          </p>
          <p className="text-[8px] font-black uppercase tracking-widest text-amber-300">Collected from ticket sales</p>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Over Time — Area Chart (spans 2 cols) */}
        <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-100 bg-white p-8 space-y-6">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Sales Over Time</p>
            <p className="text-[10px] font-black text-slate-300 mt-1">Tickets purchased per day</p>
          </div>
          {salesByDate.length < 2 ? (
            <div className="flex items-center justify-center h-48 text-[9px] font-black uppercase tracking-widest text-slate-300">
              Not enough data yet
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesByDate} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ticketGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#668c65" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#668c65" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f4" />
                  <XAxis dataKey="date" tick={{ fontSize: 8, fontWeight: 900, fill: "#94a3b8", textTransform: "uppercase" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fontWeight: 900, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Tickets" stroke="#668c65" strokeWidth={2} fill="url(#ticketGrad)" dot={{ r: 3, fill: "#668c65", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Check-In Rate — Donut */}
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 space-y-6 flex flex-col">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Check-In Rate</p>
            <p className="text-[10px] font-black text-slate-300 mt-1">Arrived vs total sold</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="relative h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={48} outerRadius={68} dataKey="value" strokeWidth={0} startAngle={90} endAngle={-270}>
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="font-serif text-3xl italic text-[#668c65] leading-none">{checkInRate}%</p>
                <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">arrived</p>
              </div>
            </div>
            <div className="flex gap-6">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: d.color === "#f1f5f4" ? "#cbd5e1" : d.color }} />
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{d.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Ticket Type Breakdown — Bar Chart ── */}
      {typeChartData.length > 0 && (
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 space-y-6">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Ticket Type Breakdown</p>
            <p className="text-[10px] font-black text-slate-300 mt-1">Sold vs remaining per type</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f4" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 8, fontWeight: 900, fill: "#94a3b8", textTransform: "uppercase" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 8, fontWeight: 900, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Sold" fill="#668c65" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Remaining" fill="#f1f5f4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Revenue per type */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-50">
            {typeBreakdown.map((tt, i) => (
              <div key={i} className="space-y-1">
                <p className="text-[7px] font-black uppercase tracking-widest text-slate-300 truncate">{tt.name}</p>
                <p className="text-[10px] font-black text-amber-500">{tt.revenue.toLocaleString()} RWF</p>
                <p className="text-[8px] font-black text-slate-400">{tt.sold} / {tt.quantity} sold</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function TicketManagement({
  eventId,
  eventCapacity,
  ticketTypes,
  tickets = [],
  inspectors = [],
  analytics,
  onTicketTypeAdded,
  onTicketCreated,
  onInspectorAdded,
  onInspectorDeleted,
}: TicketManagementProps) {
  // Ensure inspectors is always an array
  const safeInspectors = Array.isArray(inspectors) ? inspectors : [];
  const safeTickets = Array.isArray(tickets) ? tickets : [];
  const [activeTab, setActiveTab] = useState("types");
  const [isAddingType, setIsAddingType] = useState(false);
  const [isEditingType, setIsEditingType] = useState<string | null>(null);
  const [isAddingInspector, setIsAddingInspector] = useState(false);
  const [inspectorFormData, setInspectorFormData] = useState({ name: "", email: "", phone_number: "" });

  // Form states
  const [typeFormData, setTypeFormData] = useState<TicketTypeFormData>({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Mutations
  const createTypeMutation = useCreateTicketType();
  const updateTypeMutation = useUpdateTicketType();
  const deleteTypeMutation = useDeleteTicketType();
  const checkInMutation = useCheckInTicket();

  // Validation
  const validateTicketTypeForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!typeFormData.name.trim()) newErrors.name = "Ticket type name is required";
    if (!typeFormData.price) newErrors.price = "Price is required";
    if (Number(typeFormData.price) <= 0) newErrors.price = "Price must be greater than 0";
    if (!typeFormData.quantity) newErrors.quantity = "Quantity is required";
    if (Number(typeFormData.quantity) <= 0) newErrors.quantity = "Quantity must be greater than 0";

    const totalTickets = ticketTypes.reduce((sum, t) => sum + t.quantity, 0) + Number(typeFormData.quantity);
    if (totalTickets > eventCapacity) {
      newErrors.quantity = `Capacity exceeded (${totalTickets}/${eventCapacity})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleAddTicketType = async () => {
    if (!validateTicketTypeForm()) return;
    try {
      await createTypeMutation.mutateAsync({
        eventId,
        data: {
          name: typeFormData.name,
          description: typeFormData.description || undefined,
          price: Number(typeFormData.price),
          quantity: Number(typeFormData.quantity),
        },
      });
      setTypeFormData({ name: "", description: "", price: "", quantity: "" });
      setIsAddingType(false);
      onTicketTypeAdded?.();
    } catch (e) { console.error(e); }
  };

  const handleUpdateTicketType = async (id: string) => {
    if (!validateTicketTypeForm()) return;
    try {
      await updateTypeMutation.mutateAsync({
        eventId,
        ticketTypeId: id,
        data: {
          name: typeFormData.name,
          description: typeFormData.description || undefined,
          price: Number(typeFormData.price),
          quantity: Number(typeFormData.quantity),
        },
      });
      setIsEditingType(null);
      onTicketTypeAdded?.();
    } catch (e) { console.error(e); }
  };

  const handleDeleteTicketType = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteTypeMutation.mutateAsync({ eventId, ticketTypeId: id });
      onTicketTypeAdded?.();
    } catch (e) { console.error(e); }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await checkInMutation.mutateAsync({ eventId, ticketId: id });
      onTicketCreated?.();
    } catch (e) { console.error(e); }
  };

  const handleAddInspector = () => {
    const newErrors: FormErrors = { ...errors };
    let hasError = false;

    if (!inspectorFormData.name.trim()) {
      newErrors.inspector_name = "Inspector name is required";
      hasError = true;
    } else {
      delete newErrors.inspector_name;
    }

    if (!inspectorFormData.email.trim()) {
      newErrors.inspector_email = "Inspector email is required";
      hasError = true;
    } else {
      delete newErrors.inspector_email;
    }

    if (!inspectorFormData.phone_number.trim()) {
      newErrors.inspector_phone = "Inspector phone is required";
      hasError = true;
    } else {
      delete newErrors.inspector_phone;
    }

    setErrors(newErrors);

    if (hasError) return;

    onInspectorAdded?.(inspectorFormData);
    setInspectorFormData({ name: "", email: "", phone_number: "" });
    setIsAddingInspector(false);
  };

  const getTotalTickets = () => ticketTypes.reduce((sum, t) => sum + t.quantity, 0);
  const getAvailableCapacity = () => eventCapacity - getTotalTickets();

  return (
    <div className="space-y-12">
      {/* Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8 flex h-auto w-full rounded-2xl border border-slate-100/50 bg-slate-50/50 p-1 overflow-x-auto scrollbar-hide">
          <TabsList className="bg-transparent h-auto p-0 flex rounded-none w-full">
            <TabsTrigger
              value="types"
              className="h-10 sm:h-12 flex-1 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-[#668c65] shadow-none data-[state=active]:shadow-none px-2"
            >
              Ticket Types
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="h-10 sm:h-12 flex-1 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-[#668c65] shadow-none data-[state=active]:shadow-none px-2"
            >
              Event Statistics
            </TabsTrigger>
            <TabsTrigger
              value="inspectors"
              className="h-10 sm:h-12 flex-1 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-[#668c65] shadow-none data-[state=active]:shadow-none px-2"
            >
              Ticket Inspectors
            </TabsTrigger>
          </TabsList>
        </TabsList>

        <TabsContent value="types" className="space-y-12">
          {/* Add Ticket Type Button - Moved to Top */}
          {!isAddingType && !isEditingType && (
            <div className="flex justify-center">
              <Button
                onClick={() => setIsAddingType(true)}
                className="h-16 rounded-2xl border border-[#668c65]/20 bg-white px-12 text-[10px] font-black uppercase tracking-widest text-[#668c65] transition-all hover:bg-[#668c65] hover:text-white shadow-none"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Ticket Type
              </Button>
            </div>
          )}

          {/* Ticket Levels */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {ticketTypes.map((type) => {
              const soldPct = Math.round((type.sold / type.quantity) * 100);
              const available = type.quantity - type.sold;
              return (
                <Card key={type.id} className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white transition-all hover:border-[#668c65]/20 shadow-none">
                  <CardHeader className="p-6 sm:p-8 pb-3 sm:pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="font-serif text-xl sm:text-2xl italic text-slate-900">{type.name}</CardTitle>
                        <CardDescription className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {type.description || "No description provided"}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setTypeFormData({ name: type.name, description: type.description || "", price: type.price.toString(), quantity: type.quantity.toString() });
                            setIsEditingType(type.id);
                          }}
                          className="h-10 w-10 text-slate-300 hover:bg-[#668c65]/5 hover:text-[#668c65]"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTicketType(type.id)}
                          className="h-10 w-10 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 sm:space-y-8 p-6 sm:p-8 pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-300">Tickets Sold</span>
                        <span className="text-[#668c65]">{soldPct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-50">
                        <div className="h-full bg-[#668c65] transition-all duration-700" style={{ width: `${soldPct}%` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 sm:gap-y-6">
                      {[
                        { label: "Ticket Price", value: `${type.price.toLocaleString()} RWF`, color: "text-[#668c65]" },
                        { label: "Total Capacity", value: type.quantity },
                        { label: "Tickets Sold", value: type.sold },
                        { label: "Remaining", value: available, color: available > 0 ? "text-slate-900" : "text-rose-400" },
                      ].map((d, idx) => (
                        <div key={idx}>
                          <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-300">{d.label}</p>
                          <p className={cn("font-serif text-[10px] sm:text-xs italic font-bold", d.color || "text-slate-900")}>{d.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Event Statistics Tab */}
        <TabsContent value="tickets" className="space-y-10">
          <EventStatisticsTab tickets={safeTickets} ticketTypes={ticketTypes} analytics={analytics} />
        </TabsContent>

        {/* Inspectors Tab */}
        <TabsContent value="inspectors" className="space-y-12">
          {!isAddingInspector && (
            <div className="flex justify-center">
              <Button
                onClick={() => setIsAddingInspector(true)}
                className="h-16 rounded-2xl border border-[#668c65]/20 bg-white px-12 text-[10px] font-black uppercase tracking-widest text-[#668c65] transition-all hover:bg-[#668c65] hover:text-white shadow-none"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Ticket Inspector
              </Button>
            </div>
          )}

          {safeInspectors.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[3rem] border border-slate-100 bg-white py-32">
              <Users className="mb-6 h-12 w-12 text-slate-200" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">No inspectors added yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {safeInspectors.map((inspector) => (
                <div key={inspector.id} className="rounded-[2.5rem] border border-slate-50 bg-white p-8 transition-colors hover:border-[#668c65]/20">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-serif text-base sm:text-lg italic text-slate-900">{inspector.name}</p>
                      {(inspector.email || inspector.phone_number) && (
                        <div className="flex flex-col gap-0.5 mb-2 mt-1">
                          {inspector.email && <p className="text-[9px] font-black uppercase tracking-widest text-[#668c65]">{inspector.email}</p>}
                          {inspector.phone_number && <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{inspector.phone_number}</p>}
                        </div>
                      )}
                      <Badge className="bg-[#668c65]/10 text-[#668c65] rounded-full border-none px-3 py-1 text-[7px] font-black uppercase tracking-widest w-fit">
                        {inspector.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onInspectorDeleted?.(inspector.id)}
                      className="h-10 w-10 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-300">Identification Number</p>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                      <code className="text-[10px] font-black text-slate-900">{inspector.identification_number}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(inspector.identification_number)}
                        className="h-8 px-3 text-[7px] font-black uppercase tracking-widest text-[#668c65] hover:bg-white"
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-2">
                      Give this ID to the inspector to access the check-in page.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Forms Overlay */}
      {(isAddingType || isEditingType) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-none">
            <CardHeader className="border-b border-slate-50 p-6 sm:p-10">
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-2xl sm:text-3xl italic text-slate-900">
                  {isEditingType ? "Edit Ticket Type" : "Add New Ticket Type"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setIsAddingType(false); setIsEditingType(null); setErrors({}); }}
                  className="rounded-full hover:bg-slate-50"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8 p-6 sm:p-10">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ticket Title</Label>
                <Input placeholder="e.g. VIP Access, Early Bird..." value={typeFormData.name} onChange={(e) => setTypeFormData({...typeFormData, name: e.target.value})} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Description</Label>
                <Textarea 
                  placeholder="Briefly describe what this ticket includes..." 
                  value={typeFormData.description} 
                  onChange={(e) => setTypeFormData({...typeFormData, description: e.target.value})} 
                  className="min-h-[100px] rounded-2xl border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300 resize-none p-4" 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Price (RWF)</Label>
                  <Input type="number" value={typeFormData.price} onChange={(e) => setTypeFormData({...typeFormData, price: e.target.value})} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Available</Label>
                  <Input type="number" value={typeFormData.quantity} onChange={(e) => setTypeFormData({...typeFormData, quantity: e.target.value})} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest" />
                </div>
              </div>
              <Button
                onClick={() => isEditingType ? handleUpdateTicketType(isEditingType) : handleAddTicketType()}
                className="h-14 w-full rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black shadow-none border-none"
              >
                {isEditingType ? "Update Ticket Type" : "Create Ticket Type"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inspector Form Overlay */}
      {isAddingInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-none">
            <CardHeader className="border-b border-slate-50 p-6 sm:p-10">
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-2xl sm:text-3xl italic text-slate-900">
                  Add Ticket Inspector
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setIsAddingInspector(false); setInspectorFormData({ name: "", email: "", phone_number: "" }); setErrors({}); }}
                  className="rounded-full hover:bg-slate-50"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8 p-6 sm:p-10">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Inspector Name</Label>
                  <Input 
                    placeholder="e.g. John Doe" 
                    value={inspectorFormData.name} 
                    onChange={(e) => setInspectorFormData({ ...inspectorFormData, name: e.target.value })} 
                    className={cn(
                      "h-14 rounded-2xl border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300",
                      errors.inspector_name && "border-rose-200 bg-rose-50/30"
                    )} 
                  />
                  {errors.inspector_name && <p className="text-[8px] font-black uppercase tracking-widest text-rose-500">{errors.inspector_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Inspector Email</Label>
                  <Input 
                    type="email"
                    placeholder="e.g. john@example.com" 
                    value={inspectorFormData.email} 
                    onChange={(e) => setInspectorFormData({ ...inspectorFormData, email: e.target.value })} 
                    className={cn(
                      "h-14 rounded-2xl border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300",
                      errors.inspector_email && "border-rose-200 bg-rose-50/30"
                    )} 
                  />
                  {errors.inspector_email && <p className="text-[8px] font-black uppercase tracking-widest text-rose-500">{errors.inspector_email}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Phone Number (For WhatsApp)</Label>
                  <Input 
                    placeholder="e.g. +250 788 123 456" 
                    value={inspectorFormData.phone_number} 
                    onChange={(e) => setInspectorFormData({ ...inspectorFormData, phone_number: e.target.value })} 
                    className={cn(
                      "h-14 rounded-2xl border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300",
                      errors.inspector_phone && "border-rose-200 bg-rose-50/30"
                    )} 
                  />
                  {errors.inspector_phone && <p className="text-[8px] font-black uppercase tracking-widest text-rose-500">{errors.inspector_phone}</p>}
                </div>
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed">
                Add an inspector to help with ticket check-ins. They will receive a unique identification number to log into the check-in page along with a check-in link via WhatsApp/Email.
              </p>
              <Button
                onClick={handleAddInspector}
                className="h-14 w-full rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black shadow-none border-none"
              >
                Add Inspector
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

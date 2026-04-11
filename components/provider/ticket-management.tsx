"use client";

import { useState } from "react";
import { Plus, X, AlertCircle, CheckCircle, Loader, Edit2, Trash2, Ticket } from "lucide-react";
import {
  useCreateTicketType,
  useUpdateTicketType,
  useDeleteTicketType,
  useCreateTicket,
  useCheckInTicket,
} from "@/hooks/useEvents";
import { TicketType } from "@/lib/api/events";
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

interface TicketManagementProps {
  eventId: string;
  eventCapacity: number;
  ticketTypes: TicketType[];
  tickets?: TicketData[];
  onTicketTypeAdded?: () => void;
  onTicketCreated?: () => void;
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
}

export function TicketManagement({
  eventId,
  eventCapacity,
  ticketTypes,
  tickets = [],
  onTicketTypeAdded,
  onTicketCreated,
}: TicketManagementProps) {
  const [activeTab, setActiveTab] = useState("types");
  const [isAddingType, setIsAddingType] = useState(false);
  const [isEditingType, setIsEditingType] = useState<string | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState<string | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);

  // Form states
  const [typeFormData, setTypeFormData] = useState<TicketTypeFormData>({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });

  const [ticketFormData, setTicketFormData] = useState<TicketFormData>({
    holder_name: "",
    holder_email: "",
    holder_phone: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Mutations
  const createTypeMutation = useCreateTicketType();
  const updateTypeMutation = useUpdateTicketType();
  const deleteTypeMutation = useDeleteTicketType();
  const createTicketMutation = useCreateTicket();
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

  const validateTicketForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!ticketFormData.holder_name.trim()) newErrors.holder_name = "Name is required";
    if (!ticketFormData.holder_email.trim()) newErrors.holder_email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ticketFormData.holder_email)) {
      newErrors.holder_email = "Invalid email format";
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

  const handleCreateTicket = async () => {
    if (!validateTicketForm() || !selectedTicketType) return;
    try {
      await createTicketMutation.mutateAsync({
        eventId,
        ticketTypeId: selectedTicketType.id,
        data: {
          holder_name: ticketFormData.holder_name,
          holder_email: ticketFormData.holder_email,
          holder_phone: ticketFormData.holder_phone || undefined,
        },
      });
      setTicketFormData({ holder_name: "", holder_email: "", holder_phone: "" });
      setIsCreatingTicket(null);
      onTicketCreated?.();
    } catch (e) { console.error(e); }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await checkInMutation.mutateAsync({ eventId, ticketId: id });
      onTicketCreated?.();
    } catch (e) { console.error(e); }
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
              Guest List
            </TabsTrigger>
          </TabsList>
        </TabsList>

        <TabsContent value="types" className="space-y-12">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[{ label: "Total Event Capacity", value: eventCapacity, color: "text-slate-900" },
              { label: "Total Tickets Sold", value: getTotalTickets(), color: "text-[#668c65]" },
            { label: "Remaining Capacity", value: getAvailableCapacity(), color: "text-slate-400" },
            ].map((stat, i) => (
              <div key={i} className="flex h-28 sm:h-32 flex-col justify-between rounded-[2rem] border border-slate-100 bg-white p-6 sm:p-8 transition-colors hover:border-[#668c65]/20">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                <p className={cn("text-3xl sm:text-4xl font-serif italic", stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>

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
                    {available > 0 ? (
                      <Button
                        onClick={() => { setSelectedTicketType(type); setIsCreatingTicket(type.id); }}
                        className="h-12 w-full rounded-2xl bg-slate-900 text-[9px] font-black uppercase tracking-widest text-white hover:bg-black shadow-none border-none"
                      >
                        Create Ticket
                      </Button>
                    ) : (
                      <div className="flex h-12 items-center justify-center rounded-2xl bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-300">
                        Sold Out
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add Tier Button */}
          {!isAddingType && !isEditingType && (
            <div className="flex justify-center pt-8">
              <Button
                onClick={() => setIsAddingType(true)}
                className="h-16 rounded-2xl border border-[#668c65]/20 bg-white px-12 text-[10px] font-black uppercase tracking-widest text-[#668c65] transition-all hover:bg-[#668c65] hover:text-white shadow-none"
              >
                Add Ticket Type
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Guest List Tab */}
        <TabsContent value="tickets" className="space-y-8">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[3rem] border border-slate-100 bg-white py-32">
              <Ticket className="mb-6 h-12 w-12 text-slate-200" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">No guests found yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tickets.map((t) => (
                <div key={t.id} className="rounded-[2.5rem] border border-slate-50 bg-white p-8 transition-colors hover:border-[#668c65]/20">
                  <div className="mb-6 sm:mb-8 flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-serif text-base sm:text-lg italic text-slate-900">{t.holder_name}</p>
                      <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#668c65]">{t.holder_email}</p>
                    </div>
                    <Badge className={cn(
                      "rounded-full border-none px-2 py-1 sm:px-3 sm:py-1.5 text-[6px] sm:text-[7px] font-black uppercase tracking-widest",
                      t.is_checked_in ? "bg-[#668c65]/10 text-[#668c65]" : "bg-slate-50 text-slate-300"
                    )}>
                      {t.is_checked_in ? "Checked In" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="mb-1 text-[7px] font-black uppercase tracking-widest text-slate-300">Ticket ID</p>
                      <p className="font-serif text-[10px] font-bold italic text-slate-600">{t.ticket_number}</p>
                    </div>
                    {!t.is_checked_in && (
                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(t.id)}
                        className="h-10 rounded-xl bg-[#668c65] px-6 text-[9px] font-black uppercase tracking-widest text-white hover:bg-[#5a7b59] shadow-none border-none"
                      >
                        Check In
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Forms Overlay */}
      {(isAddingType || isEditingType || isCreatingTicket) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-none">
            <CardHeader className="border-b border-slate-50 p-6 sm:p-10">
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-2xl sm:text-3xl italic text-slate-900">
                  {isCreatingTicket ? "Create Guest Ticket" : isEditingType ? "Edit Ticket Type" : "Add New Ticket Type"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setIsAddingType(false); setIsEditingType(null); setIsCreatingTicket(null); setErrors({}); }}
                  className="rounded-full hover:bg-slate-50"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8 p-6 sm:p-10">
              {isCreatingTicket ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Guest Name</Label>
                    <Input placeholder="Enter guest's full name" value={ticketFormData.holder_name} onChange={(e) => setTicketFormData({...ticketFormData, holder_name: e.target.value})} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Guest Email Address</Label>
                    <Input placeholder="Enter guest's email" value={ticketFormData.holder_email} onChange={(e) => setTicketFormData({...ticketFormData, holder_email: e.target.value})} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300" />
                  </div>
                  <Button
                    onClick={handleCreateTicket}
                    className="h-14 w-full rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black shadow-none border-none"
                  >
                    Create Ticket
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

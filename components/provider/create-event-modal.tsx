"use client";

import { useState, useRef } from "react";
import { Plus, X, AlertCircle, CheckCircle, Calendar as CalendarIcon, Clock, MapPin, Users, Ticket, Image as ImageIcon, ChevronRight, Upload, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useCreateEvent } from "@/hooks/useEvents";
import { toast } from "sonner";

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  standalone?: boolean;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  date?: string;
  time?: string;
  location?: string;
  capacity?: string;
  ticketDrafts?: Record<string, { name?: string; price?: string; quantity?: string }>;
}

interface TicketDraft {
  tempId: string;
  name: string;
  price: string;
  quantity: string;
  description: string;
}

export function CreateEventModal({ open, onOpenChange, standalone }: CreateEventModalProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastSubmissionRef = useRef<number>(0);
  const createEventMutation = useCreateEvent();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
    amount: "",
    image: "",
  });

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);

  const [ticketDrafts, setTicketDrafts] = useState<TicketDraft[]>([
    { tempId: "init-1", name: "", price: "", quantity: "", description: "" },
  ]);

  const [errors, setErrors] = useState<FormErrors>({});

  const validateBasicInfo = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = "Event title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDetails = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.date) newErrors.date = "Event date is required";
    if (!formData.time) newErrors.time = "Event time is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.capacity) newErrors.capacity = "Capacity is required";
    if (Number(formData.capacity) <= 0) newErrors.capacity = "Capacity must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addDraftRow = () => {
    setTicketDrafts((prev) => [
      ...prev,
      { tempId: Date.now().toString(), name: "", price: "", quantity: "", description: "" },
    ]);
  };

  const removeDraftRow = (tempId: string) => {
    setTicketDrafts((prev) => prev.filter((d) => d.tempId !== tempId));
    if (ticketDrafts.length <= 1) {
      setTicketDrafts([{ tempId: Date.now().toString(), name: "", price: "", quantity: "", description: "" }]);
    }
  };

  const updateDraftRow = (tempId: string, field: keyof TicketDraft, value: string) => {
    setTicketDrafts((prev) =>
      prev.map((d) => (d.tempId === tempId ? { ...d, [field]: value } : d))
    );
    // Clear specific error if it exists
    if (errors.ticketDrafts?.[tempId]?.[field as keyof typeof errors.ticketDrafts[string]]) {
      setErrors((prev) => {
        const newDraftErrors = { ...prev.ticketDrafts };
        // Create a copy of the row's errors
        const rowErrors = { ...newDraftErrors?.[tempId] };
        delete (rowErrors as any)[field];

        if (Object.keys(rowErrors).length === 0) {
          delete newDraftErrors?.[tempId];
        } else {
          (newDraftErrors as any)[tempId] = rowErrors;
        }

        return { ...prev, ticketDrafts: newDraftErrors };
      });
    }
  };

  const finalizeAllDrafts = () => {
    const newErrors: Record<string, { name?: string; price?: string; quantity?: string }> = {};
    let hasErrors = false;

    ticketDrafts.forEach((draft) => {
      const rowErrors: { name?: string; price?: string; quantity?: string } = {};
      if (!draft.name.trim()) rowErrors.name = "Title required";
      if (!draft.price || Number(draft.price) <= 0) rowErrors.price = "Invalid price";
      if (!draft.quantity || Number(draft.quantity) <= 0) rowErrors.quantity = "Invalid count";

      if (Object.keys(rowErrors).length > 0) {
        newErrors[draft.tempId] = rowErrors;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors((prev) => ({ ...prev, ticketDrafts: newErrors }));
      return;
    }

    const totalNewTickets = ticketDrafts.reduce((sum, t) => sum + Number(t.quantity), 0);
    const existingTickets = ticketTypes.reduce((sum, t) => sum + t.quantity, 0);

    if (totalNewTickets + existingTickets > Number(formData.capacity)) {
      setErrors((prev) => ({
        ...prev,
        capacity: `Total tickets (${totalNewTickets + existingTickets}) exceeds capacity (${formData.capacity})`,
      }));
      return;
    }

    const newTickets: TicketType[] = ticketDrafts.map((draft) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: draft.name,
      price: Number(draft.price),
      quantity: Number(draft.quantity),
      description: draft.description,
    }));

    setTicketTypes((prev) => [...prev, ...newTickets]);
    setTicketDrafts([{ tempId: Date.now().toString(), name: "", price: "", quantity: "", description: "" }]);
    setErrors({});
  };

  const removeTicketType = (id: string) => {
    setTicketTypes((prev) => prev.filter((t) => t.id !== id));
  };

  const handleNextFromBasic = () => {
    if (validateBasicInfo()) {
      setActiveTab("details");
    }
  };

  const handleNextFromDetails = () => {
    if (validateDetails()) {
      setActiveTab("tickets");
    }
  };

  const handleSubmit = async () => {
    
    // Prevent multiple submissions
    if (createEventMutation.isPending) {
      return;
    }

    // Prevent rapid successive submissions (within 2 seconds)
    const now = Date.now();
    if (now - lastSubmissionRef.current < 2000) {
      return;
    }
    lastSubmissionRef.current = now;


    try {
      // Combine date and time into ISO datetime
      const eventDateTime = formData.time 
        ? `${formData.date}T${formData.time}:00`
        : `${formData.date}T00:00:00`;

      // Prepare event data
      let imageToSend: File | Blob | undefined = undefined;

      // Handle image
      if (formData.image && formData.image.startsWith('data:image')) {
        // Convert base64 to blob
        const response = await fetch(formData.image);
        imageToSend = await response.blob();
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category, // Already in correct format from select
        location: formData.location,
        event_date: eventDateTime,
        event_time: formData.time || undefined,
        capacity: parseInt(formData.capacity),
        image: imageToSend,
        ticket_types: ticketTypes.length > 0 ? ticketTypes.map(t => ({
          name: t.name,
          description: t.description,
          price: t.price,
          quantity: t.quantity
        })) : undefined,
      };

      await createEventMutation.mutateAsync(eventData);
      toast.success("Event created successfully!");
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        date: "",
        time: "",
        location: "",
        capacity: "",
        amount: "",
        image: "",
      });
      setTicketTypes([]);
      setTicketDrafts([{ tempId: Date.now().toString(), name: "", price: "", quantity: "", description: "" }]);
      setErrors({});
      setActiveTab("basic");
      onOpenChange(false);
    } catch (error: any) {
      console.error('Event creation failed:', error);
      toast.error(error.message || "Failed to create event");
    }
  };

  // Handle key press to prevent Enter key from triggering multiple submissions
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!createEventMutation.isPending) {
        handleSubmit();
      }
    }
  };

  const content = (
    <div className={cn(
      "overflow-hidden",
      standalone ? "bg-white rounded-[2.5rem] border border-slate-50 shadow-sm" : "max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none rounded-[2.5rem] shadow-2xl bg-white"
    )}>
      <div className="bg-[#668c65]/5 p-12 border-b border-[#668c65]/10">
        <div className="text-left">
          <h2 className="text-5xl font-serif italic text-slate-900 tracking-tight leading-none mb-3">
            Create New Event
          </h2>
          <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.3em] mt-2">
            Set up your upcoming event details
          </p>
        </div>
      </div>

      <div className="p-12" onKeyPress={handleKeyPress}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full bg-transparent border-b border-slate-100 rounded-none h-auto p-0 mb-12 overflow-x-auto no-scrollbar">
            {[
              { id: "basic", label: "Basic Information" },
              { id: "details", label: "Date & Time" },
              { id: "tickets", label: "Tickets" }
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#668c65] data-[state=active]:text-[#668c65] rounded-none py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all border-b-2 border-transparent whitespace-nowrap"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="basic" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Name *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Celestial Bespoke Reception"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={cn(
                      "h-16 rounded-2xl border-slate-50 bg-slate-50/50 focus:bg-white focus:ring-0 focus:border-[#668c65]/30 transition-all text-lg font-serif italic text-slate-900",
                      errors.title ? "border-rose-200 bg-rose-50/20" : ""
                    )}
                  />
                  {errors.title && (
                    <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-wider mt-2 ml-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.title}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your event details..."
                    rows={5}
                    value={formData.description}
                    onChange={handleInputChange}
                    className={cn(
                      "rounded-2xl border-slate-50 bg-slate-50/50 focus:bg-white focus:ring-0 focus:border-[#668c65]/30 transition-all resize-none text-slate-600 leading-relaxed",
                      errors.description ? "border-rose-200 bg-rose-50/20" : ""
                    )}
                  />
                  {errors.description && (
                    <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-wider mt-2 ml-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.description}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger id="category" className={cn(
                      "h-16 rounded-2xl border-slate-50 bg-slate-50/50 focus:bg-white transition-all text-[10px] font-black uppercase tracking-widest",
                      errors.category ? "border-rose-200 bg-rose-50/20" : ""
                    )}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 max-h-[400px] overflow-y-auto">
                      {/* Wedding-related */}
                      <div className="px-2 py-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">Wedding Events</div>
                      {[
                        { value: "wedding", label: "Wedding" },
                        { value: "reception", label: "Reception" },
                        { value: "ceremony", label: "Ceremony" },
                        { value: "rehearsal", label: "Rehearsal Dinner" },
                        { value: "engagement", label: "Engagement Party" },
                      ].map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3 hover:bg-[#668c65]/5 focus:bg-[#668c65]/5">
                          {cat.label}
                        </SelectItem>
                      ))}
                      
                      {/* Entertainment */}
                      <div className="px-2 py-1 mt-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Entertainment</div>
                      {[
                        { value: "concert", label: "Concert" },
                        { value: "festival", label: "Festival" },
                        { value: "comedy_show", label: "Comedy Show" },
                        { value: "theater", label: "Theater Performance" },
                        { value: "movie_screening", label: "Movie Screening" },
                      ].map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3 hover:bg-[#668c65]/5 focus:bg-[#668c65]/5">
                          {cat.label}
                        </SelectItem>
                      ))}
                      
                      {/* Sports */}
                      <div className="px-2 py-1 mt-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Sports</div>
                      {[
                        { value: "sports_event", label: "Sports Event" },
                        { value: "tournament", label: "Tournament" },
                      ].map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3 hover:bg-[#668c65]/5 focus:bg-[#668c65]/5">
                          {cat.label}
                        </SelectItem>
                      ))}
                      
                      {/* Business & Professional */}
                      <div className="px-2 py-1 mt-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Business & Professional</div>
                      {[
                        { value: "conference", label: "Conference" },
                        { value: "seminar", label: "Seminar" },
                        { value: "workshop", label: "Workshop" },
                        { value: "networking", label: "Networking Event" },
                        { value: "trade_show", label: "Trade Show" },
                      ].map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3 hover:bg-[#668c65]/5 focus:bg-[#668c65]/5">
                          {cat.label}
                        </SelectItem>
                      ))}
                      
                      {/* Social & Community */}
                      <div className="px-2 py-1 mt-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Social & Community</div>
                      {[
                        { value: "party", label: "Party" },
                        { value: "fundraiser", label: "Fundraiser" },
                        { value: "charity_event", label: "Charity Event" },
                        { value: "community_gathering", label: "Community Gathering" },
                      ].map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3 hover:bg-[#668c65]/5 focus:bg-[#668c65]/5">
                          {cat.label}
                        </SelectItem>
                      ))}
                      
                      {/* Cultural & Arts */}
                      <div className="px-2 py-1 mt-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Cultural & Arts</div>
                      {[
                        { value: "exhibition", label: "Exhibition" },
                        { value: "art_show", label: "Art Show" },
                        { value: "cultural_event", label: "Cultural Event" },
                      ].map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3 hover:bg-[#668c65]/5 focus:bg-[#668c65]/5">
                          {cat.label}
                        </SelectItem>
                      ))}
                      
                      {/* Food & Drink */}
                      <div className="px-2 py-1 mt-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Food & Drink</div>
                      {[
                        { value: "wine_tasting", label: "Wine Tasting" },
                      ].map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3 hover:bg-[#668c65]/5 focus:bg-[#668c65]/5">
                          {cat.label}
                        </SelectItem>
                      ))}
                      
                      {/* Other */}
                      <div className="px-2 py-1 mt-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Other</div>
                      <SelectItem value="other" className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3 hover:bg-[#668c65]/5 focus:bg-[#668c65]/5">
                        Other Event
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-wider mt-2 ml-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.category}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Image</Label>
                  <div className="space-y-4">
                    <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#668c65]/30 transition-all duration-500 aspect-video flex flex-col items-center justify-center p-6 text-center">
                      {formData.image ? (
                        <>
                          <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              className="h-10 px-4 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest"
                            >
                              Replace Image
                            </Button>
                            <Button
                              onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                              variant="destructive"
                              className="h-10 w-10 rounded-xl p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#668c65] mb-3">
                            <Upload className="h-6 w-6" />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Upload image from device</p>
                          <Button
                            variant="ghost"
                            className="absolute inset-0 w-full h-full hover:bg-transparent"
                            onClick={() => fileInputRef.current?.click()}
                          />
                        </>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    <div className="relative">
                      <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                      <Input
                        id="image"
                        name="image"
                        placeholder="Or provide image URL..."
                        value={formData.image.startsWith('data:') ? "" : formData.image}
                        onChange={handleInputChange}
                        className="h-16 pl-14 rounded-2xl border-slate-50 bg-slate-50/50 focus:bg-white transition-all text-sm font-serif italic"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-10">
              {!standalone && (
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="h-16 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all rounded-2xl"
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleNextFromBasic}
                className={cn(
                  "h-16 bg-[#668c65] hover:bg-[#5a7b59] text-white rounded-2xl shadow-2xl shadow-[#668c65]/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98]",
                  standalone ? "flex-1" : "flex-1"
                )}
              >
                Next: Date & Time
                <ChevronRight className="w-4 h-4 ml-3" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date *</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#668c65]" />
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={cn(
                      "h-16 pl-14 rounded-2xl border-slate-50 bg-slate-50/50 focus:bg-white transition-all font-serif italic text-lg",
                      errors.date ? "border-rose-200 bg-rose-50/20" : ""
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#668c65]" />
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className={cn(
                      "h-16 pl-14 rounded-2xl border-slate-50 bg-slate-50/50 focus:bg-white transition-all font-serif italic text-lg",
                      errors.time ? "border-rose-200 bg-rose-50/20" : ""
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#668c65]" />
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., The Artisanal Pavilion, Kigali"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={cn(
                      "h-16 pl-14 rounded-2xl border-slate-50 bg-slate-50/50 focus:bg-white transition-all text-lg font-serif italic text-slate-900",
                      errors.location ? "border-rose-200 bg-rose-50/20" : ""
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Capacity *</Label>
                <div className="relative">
                  <Users className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    placeholder="e.g., 500"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className={cn(
                      "h-16 pl-14 rounded-2xl border-slate-50 bg-slate-50/50 focus:bg-white transition-all text-lg font-serif italic text-slate-900",
                      errors.capacity ? "border-rose-200 bg-rose-50/20" : ""
                    )}
                  />
                </div>
                {errors.capacity && (
                  <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-wider mt-2 ml-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.capacity}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Budget (Amount) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#668c65]" />
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="e.g., 5,000,000"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className={cn(
                      "h-16 pl-14 rounded-2xl border-slate-50 bg-slate-50/50 focus:bg-white transition-all text-lg font-serif italic text-slate-900",
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-10">
              <Button
                variant="ghost"
                onClick={() => setActiveTab("basic")}
                className="h-16 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all rounded-2xl"
              >
                Previous
              </Button>
              <Button
                onClick={handleNextFromDetails}
                className="h-16 flex-1 bg-slate-900 hover:bg-black text-white rounded-2xl shadow-2xl shadow-slate-900/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Next: Tickets
                <ChevronRight className="w-4 h-4 ml-3 text-[#668c65]" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-8">

              {/* Capacity usage banner */}
              {formData.capacity && (() => {
                const cap = Number(formData.capacity)
                const used = ticketTypes.reduce((s, t) => s + t.quantity, 0)
                const drafting = ticketDrafts.reduce((s, d) => s + (Number(d.quantity) || 0), 0)
                const total = used + drafting
                const remaining = cap - total
                const pct = Math.min(100, Math.round((total / cap) * 100))
                const isOver = total > cap

                return (
                  <div className={`rounded-2xl border p-5 space-y-3 ${isOver ? "bg-rose-50 border-rose-200" : "bg-[#668c65]/5 border-[#668c65]/15"}`}>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className={isOver ? "text-rose-600" : "text-[#668c65]"}>
                        {isOver ? "⚠ Capacity Exceeded" : "Capacity Usage"}
                      </span>
                      <span className={isOver ? "text-rose-600" : "text-slate-600"}>
                        {total.toLocaleString()} / {cap.toLocaleString()} tickets
                      </span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-rose-500" : pct >= 90 ? "bg-amber-400" : "bg-[#668c65]"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-medium">
                      <span className={isOver ? "text-rose-500" : "text-slate-500"}>
                        {isOver
                          ? `Remove ${(total - cap).toLocaleString()} ticket${total - cap !== 1 ? "s" : ""} to stay within capacity`
                          : `${remaining.toLocaleString()} seat${remaining !== 1 ? "s" : ""} still available`}
                      </span>
                      <span className={`font-bold ${isOver ? "text-rose-600" : pct >= 90 ? "text-amber-600" : "text-[#668c65]"}`}>
                        {pct}% full
                      </span>
                    </div>
                    {isOver && (
                      <div className="flex items-center gap-2 text-rose-600 text-[10px] font-black uppercase tracking-wider pt-1">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        Total tickets ({total.toLocaleString()}) exceed event capacity ({cap.toLocaleString()}). Reduce ticket counts before finalizing.
                      </div>
                    )}
                  </div>
                )
              })()}
              <div>
                <h3 className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <div className="h-[1px] w-8 bg-[#668c65]/30" />
                  Current Tickets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ticketTypes.map((ticket) => (
                    <Card key={ticket.id} className="border-none shadow-none bg-white rounded-[2rem] group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-700 border border-slate-50 overflow-hidden">
                      <CardContent className="p-8 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-2xl bg-[#668c65]/5 flex items-center justify-center text-[#668c65] shadow-sm border border-[#668c65]/10 group-hover:bg-[#668c65] group-hover:text-white transition-all duration-500">
                            <Ticket className="h-7 w-7" />
                          </div>
                          <div>
                            <p className="text-xl font-serif italic text-slate-900 leading-tight mb-1">{ticket.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 space-x-2">
                              <span>{ticket.quantity} Units</span>
                              <span className="text-slate-200">•</span>
                              <span className="text-[#668c65]">{ticket.price.toLocaleString()} RWF</span>
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTicketType(ticket.id)}
                          className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Card className="border-slate-50 shadow-none bg-[#668c65]/5 rounded-[2.5rem] overflow-hidden border border-[#668c65]/10">
                <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-2xl font-serif italic text-slate-900">Add Tickets</CardTitle>
                    <CardDescription className="text-[10px] font-black text-[#668c65] uppercase tracking-widest mt-1">Create different ticket levels for your event</CardDescription>
                  </div>
                  <Button
                    onClick={addDraftRow}
                    variant="ghost"
                    className="h-12 gap-2 text-[#668c65] hover:bg-[#668c65]/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Add Level
                  </Button>
                </CardHeader>
                <CardContent className="p-10 pt-0 space-y-8">
                  <div className="space-y-10">
                    {ticketDrafts.map((draft, index) => (
                      <div key={draft.tempId} className="relative group animate-in fade-in slide-in-from-right-4 duration-500">
                        {index > 0 && <div className="h-[1px] w-full bg-[#668c65]/10 mb-10" />}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          <div className="md:col-span-5 space-y-2">
                            <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Ticket Name</Label>
                            <Input
                              placeholder="e.g., VIP Experience"
                              value={draft.name}
                              onChange={(e) => updateDraftRow(draft.tempId, 'name', e.target.value)}
                              className={cn(
                                "h-14 rounded-xl border-slate-50 bg-white transition-all text-[10px] font-black uppercase tracking-widest",
                                errors.ticketDrafts?.[draft.tempId]?.name ? "border-rose-200 bg-rose-50/20" : ""
                              )}
                            />
                            {errors.ticketDrafts?.[draft.tempId]?.name && (
                              <div className="flex items-center gap-1.5 text-rose-500 text-[10px] font-black uppercase tracking-wider ml-1">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                {errors.ticketDrafts[draft.tempId].name}
                              </div>
                            )}
                          </div>
                          <div className="md:col-span-3 space-y-2">
                            <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (RWF)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={draft.price}
                              onChange={(e) => updateDraftRow(draft.tempId, 'price', e.target.value)}
                              className={cn(
                                "h-14 rounded-xl border-slate-50 bg-white transition-all font-serif italic text-lg",
                                errors.ticketDrafts?.[draft.tempId]?.price ? "border-rose-200 bg-rose-50/20" : ""
                              )}
                            />
                            {errors.ticketDrafts?.[draft.tempId]?.price && (
                              <div className="flex items-center gap-1.5 text-rose-500 text-[10px] font-black uppercase tracking-wider ml-1">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                {errors.ticketDrafts[draft.tempId].price}
                              </div>
                            )}
                          </div>
                          <div className="md:col-span-3 space-y-2">
                            <div className="flex items-center justify-between ml-1">
                              <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Count</Label>
                              {formData.capacity && (() => {
                                const cap = Number(formData.capacity)
                                const usedByOthers = ticketTypes.reduce((s, t) => s + t.quantity, 0)
                                  + ticketDrafts.filter(d => d.tempId !== draft.tempId).reduce((s, d) => s + (Number(d.quantity) || 0), 0)
                                const remaining = cap - usedByOthers
                                return (
                                  <span className="text-[8px] font-bold text-slate-400">
                                    max {remaining.toLocaleString()}
                                  </span>
                                )
                              })()}
                            </div>
                            <Input
                              type="number"
                              placeholder="0"
                              min={1}
                              max={formData.capacity ? Number(formData.capacity) - ticketTypes.reduce((s, t) => s + t.quantity, 0) - ticketDrafts.filter(d => d.tempId !== draft.tempId).reduce((s, d) => s + (Number(d.quantity) || 0), 0) : undefined}
                              value={draft.quantity}
                              onChange={(e) => {
                                const val = e.target.value
                                updateDraftRow(draft.tempId, 'quantity', val)
                                // Live capacity check
                                if (formData.capacity && val) {
                                  const cap = Number(formData.capacity)
                                  const usedByOthers = ticketTypes.reduce((s, t) => s + t.quantity, 0)
                                    + ticketDrafts.filter(d => d.tempId !== draft.tempId).reduce((s, d) => s + (Number(d.quantity) || 0), 0)
                                  if (Number(val) + usedByOthers > cap) {
                                    setErrors(prev => ({
                                      ...prev,
                                      ticketDrafts: {
                                        ...prev.ticketDrafts,
                                        [draft.tempId]: {
                                          ...prev.ticketDrafts?.[draft.tempId],
                                          quantity: `Exceeds remaining capacity (${(cap - usedByOthers).toLocaleString()} left)`
                                        }
                                      }
                                    }))
                                  } else {
                                    // Clear the quantity error if now valid
                                    setErrors(prev => {
                                      const draftErrs = { ...prev.ticketDrafts }
                                      if (draftErrs?.[draft.tempId]) {
                                        const rowErrs = { ...draftErrs[draft.tempId] }
                                        delete rowErrs.quantity
                                        if (Object.keys(rowErrs).length === 0) delete draftErrs[draft.tempId]
                                        else draftErrs[draft.tempId] = rowErrs
                                      }
                                      return { ...prev, ticketDrafts: draftErrs }
                                    })
                                  }
                                }
                              }}
                              className={cn(
                                "h-14 rounded-xl border-slate-50 bg-white transition-all font-serif italic text-lg",
                                errors.ticketDrafts?.[draft.tempId]?.quantity ? "border-rose-200 bg-rose-50/20" : ""
                              )}
                            />
                            {errors.ticketDrafts?.[draft.tempId]?.quantity && (
                              <div className="flex items-center gap-1.5 text-rose-500 text-[10px] font-black uppercase tracking-wider ml-1">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                {errors.ticketDrafts[draft.tempId].quantity}
                              </div>
                            )}
                          </div>
                          <div className="md:col-span-1 pt-6 flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDraftRow(draft.tempId)}
                              className="h-14 w-14 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                          <div className="md:col-span-12 space-y-2">
                            <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Optional Specifications</Label>
                            <Textarea
                              placeholder="Tier specific benefits..."
                              rows={1}
                              value={draft.description}
                              onChange={(e) => updateDraftRow(draft.tempId, 'description', e.target.value)}
                              className="h-12 min-h-0 rounded-xl border-slate-50 bg-white transition-all resize-none text-slate-500 text-xs leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={finalizeAllDrafts}
                    className="w-full h-16 gap-3 bg-white hover:bg-[#668c65] hover:text-white text-[#668c65] border border-[#668c65]/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm hover:shadow-md"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Seal and Finalize All Tiers
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4 pt-10">
              <Button
                variant="ghost"
                onClick={() => setActiveTab("details")}
                className="h-16 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all rounded-2xl"
              >
                Back to Timeline
              </Button>
              <Button
                onClick={handleSubmit}
                className="h-16 flex-1 bg-[#668c65] hover:bg-[#5a7b59] text-white rounded-2xl shadow-2xl shadow-[#668c65]/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={createEventMutation.isPending}
              >
                {createEventMutation.isPending ? (
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Synchronizing Manifest...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-3" />
                    Finalize Ritual Manifest
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  if (standalone) {
    return content;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none">
        {content}
      </DialogContent>
    </Dialog>
  );
}
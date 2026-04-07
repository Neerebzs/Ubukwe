"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, XCircle, CheckCircle, Search, MapPin, Package, Star, Calendar, MessageCircle, UserCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "./stat-card";

interface ProviderService {
  id: string;
  name: string;
  category: string;
  location: string;
  description: string;
  specialties: string[];
  price_range_min: number;
  price_range_max: number;
  gallery: any[];
  packages: any[];
  phone?: string;
  email?: string;
  status: "pending" | "approved" | "rejected" | "suspended" | "on_hold";
  verified: boolean;
  created_at: string;
  updated_at?: string;
  provider: {
    id: string;
    full_name: string;
    email: string;
  };
}

export function AdminProviderServices() {
  const [services, setServices] = useState<ProviderService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedService, setSelectedService] = useState<ProviderService | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [statusFilter]);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.admin.providerServices.getAll(statusFilter);
      const data = response.data?.data || response.data || [];
      setServices(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch services");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServiceDetails = async (id: string) => {
    try {
      const response = await apiClient.admin.providerServices.getDetails(id);
      setSelectedService(response.data.data || response.data);
      setIsDetailsModalOpen(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch service details");
    }
  };

  const handleAction = async () => {
    if (!selectedService) return;
    setIsProcessing(true);
    try {
      if (actionType === "approve") {
        await apiClient.admin.providerServices.approve(selectedService.id, adminNotes);
        toast.success("Service approved successfully");
      } else if (actionType === "reject") {
        if (!adminNotes.trim()) {
          toast.error("Please provide a reason for rejection");
          return;
        }
        await apiClient.admin.providerServices.reject(selectedService.id, adminNotes);
        toast.success("Service rejected");
      }
      setIsActionModalOpen(false);
      setIsDetailsModalOpen(false);
      setAdminNotes("");
      setSelectedService(null);
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${actionType} service`);
    } finally {
      setIsProcessing(false);
    }
  };

  const openActionModal = (service: ProviderService, type: typeof actionType) => {
    setSelectedService(service);
    setActionType(type);
    setIsActionModalOpen(true);
  };

  const filteredServices = services.filter(
    (service) =>
      service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: services.length,
    pending: services.filter(s => s.status === "pending").length,
    approved: services.filter(s => s.status === "approved").length,
    rejected: services.filter(s => s.status === "rejected").length
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif italic text-slate-900 tracking-tight">Artisanal Submissions</h1>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-[#608d64]/60" />
            <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">Curating the Platform Offerings</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-600 group-focus-within:text-[#608d64] transition-colors" />
          </div>
          <Input
            placeholder="Search submissions..."
            className="pl-12 pr-4 h-14 w-full md:w-[320px] bg-white border-slate-100 rounded-2xl focus-visible:ring-1 focus-visible:ring-[#608d64] focus-visible:border-[#608d64] shadow-none transition-all duration-300 placeholder:text-slate-500 placeholder:font-light"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Directory Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Total Dossiers" value={stats.total} />
        <StatCard label="Pending Review" value={stats.pending} color="text-amber-600" />
        <StatCard label="Authorized" value={stats.approved} color="text-[#608d64]" />
        <StatCard label="Rejected" value={stats.rejected} color="text-rose-600" />
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="flex items-center gap-1 bg-white border border-slate-100 p-1.5 rounded-[1.8rem] h-auto w-fit mb-8 shadow-sm">
          {[
            { id: "pending", label: "Awaiting Review" },
            { id: "approved", label: "Authorized" },
            { id: "suspended", label: "Archived" },
            { id: "on_hold", label: "Deferred" },
            { id: "rejected", label: "Declined" },
            { id: "all", label: "Complete Logs" }
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={`h-11 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2 ${statusFilter === tab.id
                ? "bg-slate-900 text-white shadow-xl translate-y-[-1px]"
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
            >
              {tab.label}
              {tab.id === "pending" && stats.pending > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[8px] font-black border ${statusFilter === "pending" ? "bg-white/20 border-white/40 text-white" : "bg-rose-50 border-rose-100 text-rose-500"}`}>
                  {stats.pending}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={statusFilter} className="mt-0 focus-visible:outline-none">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-8 h-8 border-2 border-[#608d64]/20 border-t-[#608d64] rounded-full animate-spin" />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Retrieving Portfolios</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-32 rounded-[3rem] border border-dashed border-slate-200 bg-slate-50/50">
              <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-serif italic text-slate-600">Catalogue subset is currently clear</h3>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2 px-10">No {statusFilter} entries match your refinement filters</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className="border-slate-100 bg-white shadow-none rounded-[2.5rem] overflow-hidden hover:border-[#608d64]/20 transition-all duration-500 group">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      {/* Service Identity Area */}
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="h-20 w-20 rounded-[1.5rem] bg-slate-50 border-2 border-slate-50 flex items-center justify-center group-hover:border-[#608d64]/10 transition-colors overflow-hidden">
                            {service.gallery?.[0] ? (
                              <img src={typeof service.gallery[0] === 'string' ? service.gallery[0] : (service.gallery[0].url || service.gallery[0].image_url)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Star className="w-8 h-8 text-[#608d64]/40" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-2xl font-serif italic text-slate-900 tracking-tight group-hover:text-[#608d64] transition-colors duration-500 leading-tight">
                            {service.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="outline" className="bg-[#608d64]/5 border-[#608d64]/20 text-[#608d64] px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-none">
                              {service.category}
                            </Badge>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                              <MapPin className="w-3 h-3" />
                              {service.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Editorial Metadata */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:items-center gap-8 lg:gap-14">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Valuation</p>
                          <p className="text-sm font-medium text-slate-900 font-serif italic">
                            {service.price_range_min?.toLocaleString()} RWF+
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Originator</p>
                          <p className="text-sm font-medium text-slate-600 truncate max-w-[120px]">
                            {service.provider?.full_name || "Unknown"}
                          </p>
                        </div>

                        {/* Refined Actions */}
                        <div className="col-span-2 md:col-span-1 flex items-center gap-2 lg:ml-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchServiceDetails(service.id)}
                            className="h-11 px-5 rounded-2xl border-slate-100 hover:border-[#608d64] hover:bg-[#608d64]/5 text-slate-600 hover:text-[#608d64] transition-all duration-300 flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Inspect</span>
                          </Button>
                          {service.status === "pending" && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => openActionModal(service, "approve")}
                                className="h-11 px-5 rounded-2xl bg-[#608d64] hover:bg-[#4a6e4d] text-white shadow-lg shadow-[#608d64]/10 transition-all duration-300 flex items-center gap-2 border-none"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Authorize</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActionModal(service, "reject")}
                                className="h-11 w-11 p-0 rounded-2xl border-rose-50 text-rose-500 hover:bg-rose-50 transition-all duration-300 flex items-center justify-center outline-none"
                              >
                                <XCircle className="h-5 w-5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Modal - Minimalist Sanctuary */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl bg-white">
          <div className="p-8 space-y-6 text-slate-900">
            <div className="space-y-2">
              <h2 className="text-2xl font-serif italic text-slate-900 capitalize leading-tight">
                {actionType} Submission
              </h2>
              <div className="h-[1px] w-12 bg-[#608d64]/60" />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Finalizing the Artisanal Record
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Administrative Narrative</Label>
                <Textarea
                  placeholder={actionType === "approve" ? "Optional: Add an approval note..." : "Reason for rejection (Required)..."}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="min-h-[120px] rounded-2xl border-slate-100 focus-visible:ring-1 focus-visible:ring-[#608d64] focus-visible:border-[#608d64] resize-none p-4 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsActionModalOpen(false)}
                className="flex-1 h-12 rounded-2xl border-slate-100 text-slate-700 hover:bg-slate-50 font-bold uppercase text-[10px] tracking-widest transition-all"
              >
                Retreat
              </Button>
              <Button
                onClick={handleAction}
                disabled={isProcessing || (actionType === "reject" && !adminNotes.trim())}
                className={`flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-lg transition-all ${actionType === "approve"
                  ? "bg-[#608d64] hover:bg-[#4a6e4d] text-white shadow-[#608d64]/20"
                  : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
                  }`}
              >
                {isProcessing ? "Processing..." : `Confirm ${actionType}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal - Artisanal Dossier */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="w-[70vw] max-w-[70vw] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl bg-white max-h-[92vh]">
          {selectedService && (
            <div className="flex flex-col h-full overflow-hidden">

              {/* Hero */}
              <div className="relative h-56 shrink-0">
                {selectedService.gallery?.[0] ? (
                  <img
                    src={typeof selectedService.gallery[0] === 'string' ? selectedService.gallery[0] : (selectedService.gallery[0].url || selectedService.gallery[0].image_url)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <Package className="w-16 h-16 text-slate-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Status badge top-right */}
                <div className="absolute top-5 right-5">
                  <Badge className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-none shadow-lg ${
                    selectedService.status === "approved" ? "bg-[#608d64] text-white" :
                    selectedService.status === "pending" ? "bg-amber-500 text-white" :
                    "bg-rose-500 text-white"
                  }`}>
                    {selectedService.status}
                  </Badge>
                </div>

                {/* Title + category bottom-left */}
                <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between gap-4">
                  <div className="space-y-1.5">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {selectedService.category}
                    </Badge>
                    <h2 className="text-3xl font-serif italic text-white leading-tight drop-shadow-sm">
                      {selectedService.name}
                    </h2>
                  </div>
                  {selectedService.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => { setIsDetailsModalOpen(false); openActionModal(selectedService!, "reject") }}
                        className="h-10 px-5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-rose-500/80 font-bold uppercase text-[10px] tracking-widest transition-all"
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => { setIsDetailsModalOpen(false); openActionModal(selectedService!, "approve") }}
                        className="h-10 px-5 rounded-xl bg-white text-slate-900 hover:bg-slate-50 font-bold uppercase text-[10px] tracking-widest shadow-xl transition-all"
                      >
                        Authorize
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">

                  {/* Left — main content */}
                  <div className="md:col-span-2 p-8 space-y-8">

                    {/* Description */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.3em]">The Narrative</p>
                      <p className="text-slate-600 leading-relaxed text-sm font-light">
                        {selectedService.description}
                      </p>
                    </div>

                    {/* Specialties */}
                    {selectedService.specialties?.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.3em]">Specialties</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedService.specialties.map((s, i) => (
                            <Badge key={i} variant="outline" className="border-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Packages */}
                    {selectedService.packages?.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.3em]">Investment Packages</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {selectedService.packages.map((pkg: any, idx: number) => (
                            <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-[#608d64]/20 transition-all">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-serif italic text-slate-900 text-base">{pkg.name}</h4>
                                {pkg.popular && <Badge className="bg-[#608d64]/10 text-[#608d64] border-none text-[9px] font-black uppercase tracking-widest">Popular</Badge>}
                              </div>
                              <p className="text-xl font-bold text-[#608d64]">{pkg.price?.toLocaleString()} <span className="text-xs font-black text-slate-400">RWF</span></p>
                              {pkg.duration && <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Duration: {pkg.duration}</p>}
                              {pkg.features?.length > 0 && (
                                <ul className="mt-3 space-y-1">
                                  {pkg.features.slice(0, 3).map((f: string, fi: number) => (
                                    <li key={fi} className="text-xs text-slate-500 flex items-center gap-1.5">
                                      <CheckCircle className="w-3 h-3 text-[#608d64] shrink-0" />{f}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gallery grid */}
                    {selectedService.gallery?.length > 1 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.3em]">Gallery ({selectedService.gallery.length})</p>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedService.gallery.slice(0, 6).map((item: any, i: number) => {
                            const src = typeof item === 'string' ? item : (item.url || item.image_url || item.preview)
                            return src ? (
                              <div key={i} className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                                <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                              </div>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right — metadata */}
                  <div className="p-8 space-y-6 bg-slate-50/50">

                    {/* Provider */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Originator</p>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#608d64]/10 flex items-center justify-center shrink-0">
                          <UserCircle2 className="w-5 h-5 text-[#608d64]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{selectedService.provider?.full_name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{selectedService.provider?.email}</p>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* Meta fields */}
                    {[
                      { label: "Location", value: selectedService.location, icon: <MapPin className="w-3 h-3" /> },
                      { label: "Submitted", value: new Date(selectedService.created_at).toLocaleDateString('en-CA') },
                      { label: "Min Price", value: `${selectedService.price_range_min?.toLocaleString()} RWF` },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          {item.icon}{item.value}
                        </p>
                      </div>
                    ))}

                    {/* Contact */}
                    {(selectedService.phone || selectedService.email) && (
                      <>
                        <Separator className="bg-slate-100" />
                        {selectedService.phone && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                            <p className="text-sm font-medium text-slate-700">{selectedService.phone}</p>
                          </div>
                        )}
                        {selectedService.email && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                            <p className="text-sm font-medium text-slate-700 break-all">{selectedService.email}</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Action buttons if pending */}
                    {selectedService.status === "pending" && (
                      <>
                        <Separator className="bg-slate-100" />
                        <div className="space-y-2 pt-1">
                          <Button
                            onClick={() => { setIsDetailsModalOpen(false); openActionModal(selectedService!, "approve") }}
                            className="w-full h-11 rounded-2xl bg-[#608d64] hover:bg-[#4a6e4d] text-white font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-[#608d64]/20"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Authorize
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => { setIsDetailsModalOpen(false); openActionModal(selectedService!, "reject") }}
                            className="w-full h-11 rounded-2xl border-rose-100 text-rose-500 hover:bg-rose-50 font-bold uppercase text-[10px] tracking-widest"
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Decline
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

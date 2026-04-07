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
              className="h-11 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2 data-[state=active]:!bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:translate-y-[-1px] text-slate-600 hover:text-slate-800 hover:bg-slate-50"
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
        <DialogContent className="w-[92vw] max-w-[1300px] p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-white max-h-[92vh]">
          {selectedService && (
            <div className="flex flex-col h-full overflow-hidden">

              {/* Enhanced Hero Section */}
              <div className="relative h-72 shrink-0">
                {selectedService.gallery?.[0] ? (
                  <img
                    src={typeof selectedService.gallery[0] === 'string' ? selectedService.gallery[0] : (selectedService.gallery[0].url || selectedService.gallery[0].image_url)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <Package className="w-20 h-20 text-slate-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

                {/* Status badge top-right */}
                <div className="absolute top-6 right-6 flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                    <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                      selectedService.status === "approved" ? "bg-emerald-400" :
                      selectedService.status === "pending" ? "bg-amber-400" :
                      "bg-rose-400"
                    }`} />
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">{selectedService.status}</span>
                  </div>
                </div>

                {/* Title + category bottom-left */}
                <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between gap-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#608d64] text-white border-none px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#608d64]/20">
                        {selectedService.category}
                      </Badge>
                      {selectedService.verified && (
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full border border-white/30 text-[9px] font-black uppercase tracking-widest">
                          <CheckCircle className="w-3 h-3 text-emerald-400" /> Verified
                        </div>
                      )}
                    </div>
                    <h2 className="text-5xl font-serif italic text-white leading-tight drop-shadow-lg">
                      {selectedService.name}
                    </h2>
                  </div>

                  {selectedService.status === "pending" && (
                    <div className="flex gap-4 mb-2 shrink-0">
                      <Button
                        size="lg"
                        onClick={() => { setIsDetailsModalOpen(false); openActionModal(selectedService!, "reject") }}
                        className="h-14 px-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-rose-500 hover:border-rose-500 font-black uppercase text-[11px] tracking-[0.2em] transition-all duration-500"
                      >
                        Decline Entry
                      </Button>
                      <Button
                        size="lg"
                        onClick={() => { setIsDetailsModalOpen(false); openActionModal(selectedService!, "approve") }}
                        className="h-14 px-8 rounded-2xl bg-white text-slate-900 hover:scale-105 active:scale-95 font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl transition-all duration-500"
                      >
                        Authorize Service
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Refined Body Layout */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

                  {/* Main Editorial Body */}
                  <div className="lg:col-span-8 p-12 space-y-14">

                    {/* Narrative Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">The Narrative</p>
                        <div className="h-[1px] flex-1 bg-slate-100" />
                      </div>
                      <p className="text-slate-600 leading-[1.8] text-lg font-light max-w-3xl">
                        {selectedService.description}
                      </p>
                    </div>

                    {/* Specialties with Modern Chips */}
                    {selectedService.specialties?.length > 0 && (
                      <div className="space-y-6">
                        <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">Distinctive Specialties</p>
                        <div className="flex flex-wrap gap-3">
                          {selectedService.specialties.map((s, i) => (
                            <div key={i} className="group flex items-center gap-2 bg-slate-50 border border-slate-100 hover:border-[#608d64]/30 hover:bg-white px-5 py-2.5 rounded-2xl transition-all duration-300">
                              <Star className="w-3.5 h-3.5 text-[#608d64]/40 group-hover:text-[#608d64] transition-colors" />
                              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Investment Packages - Refined Grid */}
                    {selectedService.packages?.length > 0 && (
                      <div className="space-y-8">
                        <div className="flex items-center gap-4">
                          <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">Investment Tiers</p>
                          <div className="h-[1px] flex-1 bg-slate-100" />
                        </div>
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {selectedService.packages.map((pkg: any, idx: number) => (
                            <div key={idx} className="group relative bg-white rounded-3xl p-8 border border-slate-100 hover:border-[#608d64]/20 hover:shadow-2xl hover:shadow-[#608d64]/5 transition-all duration-500 overflow-hidden">
                              {pkg.popular && (
                                <div className="absolute top-0 right-0">
                                  <div className="bg-[#608d64] text-white text-[8px] font-black uppercase tracking-widest px-6 py-1 rotate-45 translate-x-4 translate-y-2 shadow-lg">
                                    Preferred
                                  </div>
                                </div>
                              )}
                              <div className="space-y-6">
                                <div>
                                  <h4 className="font-serif italic text-slate-900 text-xl mb-1">{pkg.name}</h4>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-slate-900">{pkg.price?.toLocaleString()}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RWF</span>
                                  </div>
                                </div>

                                {pkg.features?.length > 0 && (
                                  <div className="space-y-3">
                                    {pkg.features.slice(0, 4).map((f: string, fi: number) => (
                                      <div key={fi} className="flex items-center gap-3 text-xs text-slate-500">
                                        <div className="h-1 w-1 rounded-full bg-[#608d64]" />
                                        {f}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="pt-2">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    {pkg.duration ? `Est. Duration: ${pkg.duration}` : 'Standard Engagement'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Modern Gallery Grid */}
                    {selectedService.gallery?.length > 1 && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">Visual Anthology ({selectedService.gallery.length})</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                          {selectedService.gallery.slice(0, 8).map((item: any, i: number) => {
                            const src = typeof item === 'string' ? item : (item.url || item.image_url || item.preview)
                            return src ? (
                              <div key={i} className="group relative aspect-square rounded-[1.8rem] overflow-hidden bg-slate-100 border border-slate-100">
                                <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Curated Sidebar */}
                  <div className="lg:col-span-4 bg-slate-50/50 p-12 space-y-12">

                    {/* Originator Profile */}
                    <div className="space-y-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">The Originator</p>
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-[#608d64]/5 border border-[#608d64]/10 flex items-center justify-center shrink-0">
                            <UserCircle2 className="w-7 h-7 text-[#608d64]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-serif italic text-slate-900 text-lg truncate leading-none mb-1">{selectedService.provider?.full_name}</p>
                            <p className="text-[10px] font-bold text-[#608d64] uppercase tracking-widest opacity-70">Verified Artisan</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-slate-500">
                            <Calendar className="w-4 h-4 opacity-50" />
                            <span className="text-[11px] font-medium tracking-wide">{new Date(selectedService.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-500">
                            <MessageCircle className="w-4 h-4 opacity-50" />
                            <span className="text-[11px] font-medium tracking-wide truncate">{selectedService.provider?.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Technical Metadata */}
                    <div className="space-y-8">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Logistical Details</p>

                      <div className="grid grid-cols-1 gap-8">
                        {[
                          { label: "Regional Locus", value: selectedService.location, icon: <MapPin className="w-4 h-4 text-[#608d64]" />, detail: "Primary Operation Area" },
                          { label: "Base Valuation", value: `${selectedService.price_range_min?.toLocaleString()} RWF`, icon: <Star className="w-4 h-4 text-[#608d64]" />, detail: "Starting Price Point" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-5">
                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                              {item.icon}
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                              <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">{item.value}</p>
                              <p className="text-[9px] text-slate-400 font-medium">{item.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Secured Communication */}
                    {(selectedService.phone || selectedService.email) && (
                      <div className="space-y-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Contact Channels</p>
                        <div className="space-y-4">
                          {selectedService.phone && (
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Direct Line</p>
                              <p className="text-sm font-bold text-slate-700 tracking-widest">{selectedService.phone}</p>
                            </div>
                          )}
                          {selectedService.email && (
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Electronic Mail</p>
                              <p className="text-sm font-bold text-slate-700 break-all">{selectedService.email}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Final Executive Actions */}
                    {selectedService.status === "pending" && (
                      <div className="space-y-4 pt-4">
                        <Button
                          onClick={() => { setIsDetailsModalOpen(false); openActionModal(selectedService!, "approve") }}
                          className="w-full h-14 rounded-2xl bg-[#608d64] hover:bg-[#4a6e4d] text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-[#608d64]/30 group"
                        >
                          <CheckCircle className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" /> Authorize Dossier
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => { setIsDetailsModalOpen(false); openActionModal(selectedService!, "reject") }}
                          className="w-full h-14 rounded-2xl border-rose-100 text-rose-500 hover:bg-rose-50 font-black uppercase text-[10px] tracking-[0.2em]"
                        >
                          <XCircle className="w-4 h-4 mr-3" /> Decline Entry
                        </Button>
                      </div>
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

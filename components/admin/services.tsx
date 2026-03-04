"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, XCircle, CheckCircle, Plus, Edit, Star, Home, Search, MapPin, Package, Calendar, UserCircle2, MessageCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "./stat-card";

interface ServiceData {
  id: string;
  service_name: string;
  service_type: string;
  description?: string;
  is_active: boolean;
  status: string;
  is_featured?: boolean;
  is_visible_on_homepage?: boolean;
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
  approved_at?: string;
  creator?: {
    id: string;
    full_name: string;
    email: string;
  };
  approver?: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  display_order: number;
}

export function AdminServices() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [serviceDetail, setServiceDetail] = useState<ServiceData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "suspend" | "enable" | "delete" | "homepage" | "featured">("approve");
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [newService, setNewService] = useState({
    service_name: "",
    service_type: "",
    description: ""
  });
  const [editService, setEditService] = useState({
    service_name: "",
    service_type: "",
    description: "",
    is_active: true,
    is_featured: false,
    is_visible_on_homepage: false
  });

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [statusFilter]);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.admin.services.getAll(statusFilter);
      const data = response.data?.data || response.data || [];
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(`Failed to fetch services`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE_URL}/api/v1/public/categories`);
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  const fetchServiceDetails = async (id: string) => {
    try {
      const response = await apiClient.admin.services.getDetails(id);
      setServiceDetail(response.data.data || response.data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      toast.error("Failed to fetch service details");
    }
  };

  const handleAction = async () => {
    if (!selectedServiceId) return;
    setIsProcessing(true);
    try {
      if (actionType === "approve") {
        await apiClient.admin.services.approve(selectedServiceId, adminNotes);
        toast.success("Service approved");
      } else if (actionType === "reject") {
        await apiClient.admin.services.reject(selectedServiceId, adminNotes);
        toast.success("Service rejected");
      } else if (actionType === "suspend") {
        await apiClient.admin.services.suspend(selectedServiceId, adminNotes);
        toast.success("Service suspended");
      } else if (actionType === "enable") {
        await apiClient.admin.services.enable(selectedServiceId);
        toast.success("Service enabled");
      } else if (actionType === "delete") {
        await apiClient.admin.services.delete(selectedServiceId);
        toast.success("Service deleted");
      } else if (actionType === "homepage") {
        const service = services.find(s => s.id === selectedServiceId);
        await apiClient.admin.services.toggleHomepageVisibility(selectedServiceId, !service?.is_visible_on_homepage);
        toast.success("Homepage visibility updated");
      } else if (actionType === "featured") {
        const service = services.find(s => s.id === selectedServiceId);
        await apiClient.admin.services.toggleFeatured(selectedServiceId, !service?.is_featured);
        toast.success("Featured status updated");
      }
      setIsActionModalOpen(false);
      setIsDetailsModalOpen(false);
      setAdminNotes("");
      fetchServices();
    } catch (error) {
      toast.error(`Failed to ${actionType} service`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateService = async () => {
    setIsProcessing(true);
    try {
      await apiClient.admin.services.create(newService);
      toast.success("Service created successfully");
      setIsCreateModalOpen(false);
      setNewService({ service_name: "", service_type: "", description: "" });
      fetchServices();
    } catch (error) {
      toast.error("Failed to create service");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditService = async () => {
    if (!selectedServiceId) return;
    setIsProcessing(true);
    try {
      await apiClient.admin.services.update(selectedServiceId, editService);
      toast.success("Service updated successfully");
      setIsEditModalOpen(false);
      fetchServices();
    } catch (error) {
      toast.error("Failed to update service");
    } finally {
      setIsProcessing(false);
    }
  };

  const openActionModal = (id: string, type: typeof actionType) => {
    setSelectedServiceId(id);
    setActionType(type);
    setIsActionModalOpen(true);
  };

  const openEditModal = (service: ServiceData) => {
    setSelectedServiceId(service.id);
    setEditService({
      service_name: service.service_name,
      service_type: service.service_type,
      description: service.description || "",
      is_active: service.is_active,
      is_featured: service.is_featured || false,
      is_visible_on_homepage: service.is_visible_on_homepage || false
    });
    setIsEditModalOpen(true);
  };

  const stats = {
    total: services.length,
    active: services.filter(s => s.status === "approved" || s.is_active).length,
    pending: services.filter(s => s.status === "pending").length,
    featured: services.filter(s => s.is_featured).length
  };

  const filteredServices = services.filter(
    (service) =>
      service.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif italic text-slate-900 tracking-tight">Artisanal Catalogue</h1>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-[#608d64]/60" />
            <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">Managing the Platform Inventory</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-600 group-focus-within:text-[#608d64] transition-colors" />
            </div>
            <Input
              placeholder="Search catalogue..."
              className="pl-12 pr-4 h-14 w-full md:w-[280px] bg-white border-slate-100 rounded-2xl focus-visible:ring-1 focus-visible:ring-[#608d64] focus-visible:border-[#608d64] shadow-none transition-all duration-300 placeholder:text-slate-500 placeholder:font-light"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-14 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-all duration-300 flex items-center gap-2 border-none"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[11px] font-black uppercase tracking-widest">New Service</span>
          </Button>
        </div>
      </div>

      {/* Catalogue Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Total Services" value={stats.total} />
        <StatCard label="Active Listings" value={stats.active} color="text-[#608d64]" />
        <StatCard label="Awaiting Review" value={stats.pending} color="text-amber-600" />
        <StatCard label="Featured Masterpieces" value={stats.featured} color="text-indigo-600" />
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="flex items-center gap-1 bg-white border border-slate-100 p-1.5 rounded-[1.8rem] h-auto w-fit mb-8 shadow-sm">
          {[
            { id: "all", label: "Full Inventory" },
            { id: "pending", label: "Awaiting Author" },
            { id: "approved", label: "Live Listings" },
            { id: "suspended", label: "Archived" },
            { id: "rejected", label: "Declined" }
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
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={statusFilter} className="mt-0 focus-visible:outline-none">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-8 h-8 border-2 border-[#608d64]/20 border-t-[#608d64] rounded-full animate-spin" />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Consulting the Records</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-32 rounded-[3.5rem] border border-dashed border-slate-200 bg-slate-50/50">
              <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-serif italic text-slate-600">The catalogue is currently still</h3>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2 px-10">No entries align with your current classification</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className="border-slate-100 bg-white shadow-none rounded-[2.5rem] overflow-hidden hover:border-[#608d64]/20 transition-all duration-500 group relative">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Badge variant="outline" className="bg-[#608d64]/5 border-[#608d64]/20 text-[#608d64] px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-none">
                          {service.service_type}
                        </Badge>
                        <h3 className="text-2xl font-serif italic text-slate-900 tracking-tight group-hover:text-[#608d64] transition-colors duration-500 leading-tight">
                          {service.service_name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {service.is_featured && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                        {service.is_visible_on_homepage && <Home className="w-4 h-4 text-slate-500" />}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 font-light line-clamp-2 min-h-[40px]">
                      {service.description || "No artisanal description provided for this listing."}
                    </p>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#608d64]" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{service.status}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchServiceDetails(service.id)}
                          className="h-9 w-9 p-0 rounded-xl border-slate-100 text-slate-400 hover:border-[#608d64] hover:text-[#608d64] transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(service)}
                          className="h-9 w-9 p-0 rounded-xl border-slate-100 text-slate-400 hover:border-[#608d64] hover:text-[#608d64] transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Details Modal - Artisanal Record */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl bg-white">
          {serviceDetail && (
            <div className="p-10 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Badge className="bg-[#608d64]/10 text-[#608d64] hover:bg-[#608d64]/10 border-none px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {serviceDetail.service_type}
                    </Badge>
                    <h2 className="text-4xl font-serif italic text-slate-900 leading-tight">
                      {serviceDetail.service_name}
                    </h2>
                  </div>
                  <Badge className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-none ${serviceDetail.status === 'approved' ? 'bg-[#608d64] text-white' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {serviceDetail.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-[#608d64]/40" />
                    <h3 className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">The Manifest</h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-light text-lg">
                    {serviceDetail.description || "No narrative established for this catalogue entry."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Catalogue Status</p>
                    <div className="flex items-center gap-2">
                      {serviceDetail.is_featured && <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-100 text-[9px] uppercase tracking-widest py-0.5">Featured</Badge>}
                      {serviceDetail.is_visible_on_homepage && <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-[9px] uppercase tracking-widest py-0.5">Homepage</Badge>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Origin Date</p>
                    <p className="text-sm font-medium text-slate-700">{new Date(serviceDetail.created_at).toLocaleDateString('en-CA', { dateStyle: 'long' })}</p>
                  </div>
                </div>

                <Separator className="bg-slate-50" />

                <div className="bg-slate-50/50 rounded-[2rem] p-6 space-y-4">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[#608d64]">
                        <UserCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Originator</p>
                        <p className="font-medium text-slate-900">{serviceDetail.creator?.full_name || "System"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="flex-1 h-12 rounded-2xl border-slate-100 text-slate-700 hover:bg-slate-50 font-bold uppercase text-[10px] tracking-widest transition-all"
                >
                  Close Archive
                </Button>
                {serviceDetail.status === "pending" && (
                  <Button
                    onClick={() => openActionModal(serviceDetail.id, "approve")}
                    className="flex-1 h-12 rounded-2xl bg-[#608d64] hover:bg-[#4a6e4d] text-white font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-[#608d64]/20 transition-all border-none"
                  >
                    Authorize Entry
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Minimalist Action Modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl bg-white">
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-serif italic text-slate-900 capitalize leading-tight">
                {actionType} Service
              </h2>
              <div className="h-[1px] w-12 bg-[#608d64]/60" />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Confirming Administrative Decision
              </p>
            </div>

            <div className="space-y-4 text-slate-900">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Administrative Narrative</Label>
                <Textarea
                  placeholder={`Reason for ${actionType}...`}
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
                disabled={isProcessing}
                className={`flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-lg transition-all ${["approve", "enable", "homepage", "featured"].includes(actionType)
                  ? "bg-[#608d64] hover:bg-[#4a6e4d] text-white shadow-[#608d64]/20 border-none"
                  : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 border-none"
                  }`}
              >
                {isProcessing ? "Processing..." : `Confirm ${actionType}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Modals - Create & Edit (Boutique Sanctuary style) */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl bg-white">
          <div className="p-10 space-y-8">
            <div className="space-y-2 text-slate-900">
              <h2 className="text-3xl font-serif italic text-slate-900 leading-tight">Draft New Entry</h2>
              <p className="text-[10px] font-black text-[#608d64] uppercase tracking-widest">Introducing a regular service to the catalogue</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Service Designation</Label>
                <Input
                  placeholder="e.g., Traditional Ceremonial Dance"
                  className="h-14 rounded-2xl border-slate-100 focus-visible:ring-1 focus-visible:ring-[#608d64] focus-visible:border-[#608d64] px-5"
                  value={newService.service_name}
                  onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Classification</Label>
                <Select
                  value={newService.service_type}
                  onValueChange={(value) => setNewService({ ...newService, service_type: value })}
                >
                  <SelectTrigger className="h-14 rounded-2xl border-slate-100 focus:ring-[#608d64] px-5 text-slate-900">
                    <SelectValue placeholder="Select service category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-xl text-slate-900">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug} className="rounded-xl focus:bg-[#608d64]/5 focus:text-[#608d64]">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Narrative Description</Label>
                <Textarea
                  placeholder="Elaborate on the artisanal nature of this service..."
                  value={newService.description}
                  className="min-h-[120px] rounded-2xl border-slate-100 focus-visible:ring-1 focus-visible:ring-[#608d64] focus-visible:border-[#608d64] resize-none p-5 text-slate-900"
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest border-slate-100 text-slate-700">Cancel</Button>
              <Button
                onClick={handleCreateService}
                disabled={isProcessing || !newService.service_name || !newService.service_type}
                className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase text-[10px] tracking-widest shadow-xl border-none"
              >
                {isProcessing ? "Processing..." : "Publish to Catalogue"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl bg-white">
          <div className="p-10 space-y-8">
            <div className="space-y-2 text-slate-900">
              <h2 className="text-3xl font-serif italic text-slate-900 leading-tight">Refine Entry</h2>
              <p className="text-[10px] font-black text-[#608d64] uppercase tracking-widest">Adjusting the details of an existing masterpiece</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Service Designation</Label>
                <Input
                  className="h-14 rounded-2xl border-slate-100 focus-visible:ring-1 focus-visible:ring-[#608d64] focus-visible:border-[#608d64] px-5 text-slate-900"
                  value={editService.service_name}
                  onChange={(e) => setEditService({ ...editService, service_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Classification</Label>
                <Select
                  value={editService.service_type}
                  onValueChange={(value) => setEditService({ ...editService, service_type: value })}
                >
                  <SelectTrigger className="h-14 rounded-2xl border-slate-100 focus:ring-[#608d64] px-5 text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-xl text-slate-900">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug} className="rounded-xl focus:bg-[#608d64]/5 focus:text-[#608d64]">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-2">
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${editService.is_featured ? 'bg-[#608d64]' : 'bg-slate-200'}`}
                    onClick={() => setEditService({ ...editService, is_featured: !editService.is_featured })}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editService.is_featured ? 'left-5' : 'left-1'}`} />
                  </div>
                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Featured</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${editService.is_visible_on_homepage ? 'bg-[#608d64]' : 'bg-slate-200'}`}
                    onClick={() => setEditService({ ...editService, is_visible_on_homepage: !editService.is_visible_on_homepage })}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editService.is_visible_on_homepage ? 'left-5' : 'left-1'}`} />
                  </div>
                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Homepage</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Narrative Description</Label>
                <Textarea
                  value={editService.description}
                  className="min-h-[120px] rounded-2xl border-slate-100 focus-visible:ring-1 focus-visible:ring-[#608d64] focus-visible:border-[#608d64] resize-none p-5 text-slate-900"
                  onChange={(e) => setEditService({ ...editService, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1 h-12 rounded-2xl font-bold uppercase text-[10px] tracking-widest border-slate-100 text-slate-700">Discard</Button>
              <Button
                onClick={handleEditService}
                disabled={isProcessing}
                className="flex-1 h-12 rounded-2xl bg-[#608d64] hover:bg-[#4a6e4d] text-white font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-[#608d64]/20 border-none"
              >
                {isProcessing ? "Processing..." : "Commit Refinements"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Filter, Star, Eye, Edit, Trash2, MapPin, Calendar, TrendingUp, MoreVertical, ExternalLink, Package } from "lucide-react";
import { ServiceForm, ServiceFormData } from "./service-form";
import { ServiceDetailView } from "./service-detail-view";
import { cn } from "@/lib/utils";

interface Service {
  id: string; // UUID from backend
  title: string;
  category: string;
  location: string;
  priceRange: string;
  bookings: number;
  rating: number;
  status: "draft" | "active";
  // Extended fields matching vendor detail view
  description?: string;
  specialties?: string[];
  image?: string;
  verified?: boolean;
  priceRangeMin?: number;
  priceRangeMax?: number;
  packages?: Array<{
    id: string;
    name: string;
    price: number;
    duration: string;
    description: string;
    features: string[];
    popular: boolean;
  }>;
  gallery?: Array<{
    id: string;
    type: "image" | "video" | "reel";
    url: string;
    thumbnail?: string;
    contentType?: null | "offer" | "event";
    title?: string;
    description?: string;
    validFrom?: string;
    validTo?: string;
  }>;
  phone?: string;
  email?: string;
}

interface ProviderServicesProps {
  services: Service[];
}

export function ProviderServices({ services: initialServices }: ProviderServicesProps) {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [categories, setCategories] = useState<Array<{ id: string, name: string }>>([]);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const response = await fetch(`${API_BASE_URL}/api/v1/public/categories`);
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error("Failed to load categories");
    }
  };

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.providerServices.getAll();

      // Backend returns list directly, not wrapped in { data: [...] }
      const responseData = response.data as any;
      const servicesArray = Array.isArray(responseData) ? responseData : (responseData?.data || []);

      const mappedServices = servicesArray.map((s: any) => {

        return {
          id: s.id,
          title: s.name,
          category: s.category,
          location: s.location || "N/A",
          priceRange: s.price_range_min && s.price_range_max
            ? `${s.price_range_min.toLocaleString()} - ${s.price_range_max.toLocaleString()} RWF`
            : "Contact for price",
          bookings: s.bookings_count || 0,
          rating: s.rating || 0,
          status: s.status,
          description: s.description,
          priceRangeMin: s.price_range_min,
          priceRangeMax: s.price_range_max,
          packages: s.packages,
          specialties: s.specialties || [],
          phone: s.phone,
          email: s.email,
          verified: s.verified || false,
          // Handle gallery - can be array of objects or array of strings
          gallery: Array.isArray(s.gallery)
            ? s.gallery.map((item: any, idx: number) => {
              // If item is a string (URL), convert to gallery object
              if (typeof item === 'string') {
                return {
                  id: String(idx),
                  type: 'image',
                  contentType: null,
                  url: item,
                  thumbnail: item,
                  title: '',
                  description: ''
                };
              }
              // If item is already an object, use it
              return {
                id: item.id || String(idx),
                type: item.type || 'image',
                contentType: item.contentType || item.content_type || null,
                url: item.url,
                thumbnail: item.thumbnail,
                title: item.title || '',
                description: item.description || ''
              };
            })
            : [],
        };
      });


      setServices(mappedServices);
    } catch (error) {
      console.error("Fetch services error:", error);
      toast.error("Failed to fetch services");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || service.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateService = () => {
    setEditingService(null);
    setShowCreateForm(true);
  };

  const handleEditService = (service: Service) => {

    // Find the category ID from the categories list
    const categoryData = categories.find(cat => cat.name === service.category);

    const editData = {
      name: service.title,
      category: service.category,
      categoryId: categoryData?.id || "", // Map category name to ID
      location: service.location,
      description: service.description || "",
      specialties: service.specialties || [],
      priceRangeMin: service.priceRangeMin?.toString() || "",
      priceRangeMax: service.priceRangeMax?.toString() || "",
      gallery: (service.gallery || []).map(g => ({
        id: g.id,
        type: g.type as "image" | "video" | "reel",
        contentType: g.contentType || null,
        url: g.url,
        thumbnail: g.thumbnail,
        title: g.title || "",
        description: g.description || "",
        validFrom: g.validFrom || undefined,
        validTo: g.validTo || undefined
      })) as any,
      packages: service.packages || [],
      phone: service.phone || "",
      email: service.email || "",
      status: service.status,
      verified: service.verified || false,
    };


    setEditingService(service);
    setShowCreateForm(true);
  };

  const handleSaveService = async (formData: ServiceFormData) => {
    setIsSaving(true);

    console.log("Gallery debug:", formData.gallery?.map(g => ({
      id: g.id,
      type: g.type,
      hasUrl: !!g.url,
      url: g.url,
      contentType: g.contentType
    })))

    const servicePayload = {
      name: formData.name,
      category: formData.category,
      category_id: formData.categoryId,  // Add category_id
      location: formData.location,
      description: formData.description,
      specialties: formData.specialties,
      phone: formData.phone,
      email: formData.email,
      price_range_min: Number(formData.priceRangeMin),
      price_range_max: Number(formData.priceRangeMax),
      status: formData.status,
      verified: formData.verified,
      packages: formData.packages,
      gallery: formData.gallery?.map(g => ({
        id: g.id,
        type: g.type,
        contentType: g.contentType || null,
        url: g.url || "",
        thumbnail: g.thumbnail,
        title: g.title || "",
        description: g.description || "",
        validFrom: g.validFrom || undefined,
        validTo: g.validTo || undefined
      })).filter(item => item.url && item.url.trim() !== "") || [],
    };


    try {
      if (editingService) {
        await apiClient.providerServices.update(editingService.id, servicePayload);
        toast.success("Service updated successfully!");
      } else {
        await apiClient.providerServices.create(servicePayload);
        toast.success("Service created successfully!");
      }

      // Refresh the services list
      await fetchServices();

      // Close the form
      setShowCreateForm(false);
      setEditingService(null);
    } catch (error: any) {
      console.error("Save service error:", error);
      const errorMessage = error?.response?.data?.detail || error?.message || "Failed to save service";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      setIsDeleting(serviceId);
      try {
        await apiClient.providerServices.delete(serviceId);
        toast.success("Service deleted successfully!");
        await fetchServices();
      } catch (error: any) {
        toast.error("Failed to delete service");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleToggleServiceStatus = async (service: Service) => {
    const newStatus = service.status === "active" ? "draft" : "active";
    const actionText = newStatus === "active" ? "enable" : "disable";

    setIsToggling(service.id);

    try {
      // Create a minimal payload for status update
      const statusPayload = {
        name: service.title,
        category: service.category,
        category_id: categories.find(cat => cat.name === service.category)?.id || "",
        location: service.location,
        description: service.description || "",
        specialties: service.specialties || [],
        phone: service.phone || "",
        email: service.email || "",
        price_range_min: service.priceRangeMin || 0,
        price_range_max: service.priceRangeMax || 0,
        status: newStatus,
        verified: service.verified || false,
        packages: service.packages || [],
        gallery: service.gallery || [],
      };

      await apiClient.providerServices.update(service.id, statusPayload);
      toast.success(`Service ${actionText}d successfully!`);
      await fetchServices();
    } catch (error: any) {
      console.error(`Failed to ${actionText} service:`, error);
      toast.error(`Failed to ${actionText} service`);
    } finally {
      setIsToggling(null);
    }
  };

  const handleViewService = (service: Service) => {
    setViewingService(service);
  };

  const handleBackFromDetail = () => {
    setViewingService(null);
  };

  const handleEditFromDetail = () => {
    if (viewingService) {
      setEditingService(viewingService);
      setViewingService(null);
      setShowCreateForm(true);
    }
  };

  const handleDeleteFromDetail = async () => {
    if (viewingService) {
      await handleDeleteService(viewingService.id);
      setViewingService(null);
    }
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingService(null);
  };

  // Show detail view
  if (viewingService) {
    return (
      <ServiceDetailView
        service={{
          id: viewingService.id,
          name: viewingService.title,
          category: viewingService.category,
          location: viewingService.location,
          description: viewingService.description || "",
          specialties: viewingService.specialties || [],
          priceRangeMin: viewingService.priceRangeMin || 0,
          priceRangeMax: viewingService.priceRangeMax || 0,
          gallery: viewingService.gallery || [],
          packages: viewingService.packages || [],
          phone: viewingService.phone,
          email: viewingService.email,
          status: viewingService.status,
          verified: viewingService.verified || false,
          bookings: viewingService.bookings,
          rating: viewingService.rating,
        }}
        onBack={handleBackFromDetail}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />
    );
  }

  if (showCreateForm) {
    // Prepare initial data for edit mode
    const initialData = editingService ? (() => {

      // Find the category ID from the categories list
      const categoryData = categories.find(cat => cat.name === editingService.category);

      const data = {
        name: editingService.title,
        category: editingService.category,
        categoryId: categoryData?.id || "", // Map category name to ID
        location: editingService.location,
        description: editingService.description || "",
        specialties: editingService.specialties || [],
        priceRangeMin: editingService.priceRangeMin?.toString() || "",
        priceRangeMax: editingService.priceRangeMax?.toString() || "",
        gallery: (editingService.gallery || []).map(g => ({
          id: g.id,
          type: g.type as "image" | "video" | "reel",
          contentType: g.contentType || null,
          url: g.url,
          thumbnail: g.thumbnail,
          title: g.title || "",
          description: g.description || "",
          validFrom: g.validFrom || undefined,
          validTo: g.validTo || undefined
        })) as any,
        packages: editingService.packages || [],
        phone: editingService.phone || "",
        email: editingService.email || "",
        status: editingService.status,
        verified: editingService.verified || false,
      };


      return data;
    })() : undefined;

    return (
      <ServiceForm
        initialData={initialData}
        onSave={handleSaveService}
        onCancel={handleCancelForm}
      />
    );
  }

  if (isLoading) {
    return <ServicesLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-4xl font-serif italic text-slate-900 tracking-tight">Catalogue</h2>
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-[#668c65]/60" />
          <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em]">Artisanal Service Inventory</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div />
        <Button onClick={handleCreateService} size="lg" className="rounded-2xl bg-[#668c65] hover:bg-[#5a7b59] text-white shadow-lg shadow-[#668c65]/20 px-8 h-12 transition-all duration-300 group">
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
          <span className="font-bold tracking-tight uppercase text-[10px]">Create New Experience</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#668c65] transition-colors" />
          <Input
            placeholder="Search experiences..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-white border-slate-100 rounded-2xl focus-visible:ring-[#668c65] transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 w-full md:w-40 bg-white border-slate-100 rounded-2xl focus:ring-[#668c65] text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
              <Filter className="w-4 h-4 mr-2 text-[#668c65]/60" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">All Rituals</SelectItem>
              <SelectItem value="active" className="text-[10px] font-black uppercase tracking-widest text-[#668c65]">Active</SelectItem>
              <SelectItem value="draft" className="text-[10px] font-black uppercase tracking-widest">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-12 w-full md:w-48 bg-white border-slate-100 rounded-2xl focus:ring-[#668c65] text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
              <Package className="w-4 h-4 mr-2 text-[#668c65]/60" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">All Categories</SelectItem>
              {categories?.map(cat => (
                <SelectItem key={cat.id} value={cat.name} className="text-[10px] font-black uppercase tracking-widest">{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Services List */}
      <div className="grid gap-4">
        {filteredServices.length === 0 ? (
          <Card className="border-none shadow-none bg-slate-50/50 rounded-[2rem] p-12 text-center">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-900 font-serif italic text-xl mb-2">No artisanal services identified</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                  ? "Refine your parameters or reset the search to discover more."
                  : "Begin your legacy by documenting your first artisanal offering."}
              </p>
              {!searchTerm && statusFilter === "all" && categoryFilter === "all" ? (
                <Button onClick={handleCreateService} size="lg" className="mt-8 rounded-2xl bg-[#668c65] hover:bg-[#5a7b59] text-white shadow-xl shadow-[#668c65]/20 px-8 h-12">
                  <Plus className="h-5 w-5 mr-2" />
                  Manifest Your First Offering
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => { setSearchTerm(""); setStatusFilter("all"); setCategoryFilter("all"); }} className="mt-8 text-[10px] font-black uppercase tracking-widest text-[#668c65]">
                  Reset Parameters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredServices.map((service) => (
            <Card key={service.id} className="group overflow-hidden border-none shadow-none rounded-[2rem] bg-white group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 border border-slate-50">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row h-full">
                  {/* Service Thumbnail */}
                  <div className="relative w-full md:w-80 h-64 md:h-auto bg-slate-50 overflow-hidden">
                    {service.gallery && service.gallery.length > 0 ? (
                      <Image
                        src={service.gallery[0].url}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-slate-100" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border-none shadow-none",
                          service.status === "active" ? "bg-[#668c65]/10 text-[#668c65]" : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {service.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className="flex-1 p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.2em]">
                            {service.category}
                          </p>
                          <h3 className="text-3xl font-serif italic text-slate-900 tracking-tight group-hover:text-[#668c65] transition-colors leading-tight">
                            {service.title}
                            {service.verified && (
                              <Badge className="ml-3 bg-indigo-50 text-indigo-600 border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                                Verified Manifest
                              </Badge>
                            )}
                          </h3>
                        </div>
                        {service.rating > 0 && (
                          <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full text-amber-600 text-[10px] font-black border-none uppercase tracking-widest">
                            <Star className="h-3 w-3 mr-1.5 fill-current" />
                            {service.rating}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-y-4 gap-x-8 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-6">
                        <div className="flex items-center group/item">
                          <MapPin className="h-4 w-4 mr-2 text-[#668c65] group-hover/item:scale-110 transition-transform" />
                          {service.location}
                        </div>
                        <div className="flex items-center group/item">
                          <TrendingUp className="h-4 w-4 mr-2 text-[#668c65] group-hover/item:scale-110 transition-transform" />
                          {service.bookings} Engagements
                        </div>
                        {service.packages && service.packages.length > 0 && (
                          <div className="flex items-center group/item">
                            <Package className="h-4 w-4 mr-2 text-[#668c65] group-hover/item:scale-110 transition-transform" />
                            {service.packages.length} Tiers
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-slate-500 italic font-light leading-relaxed line-clamp-2 mb-8">
                        "{service.description || "No specific manifesto provided for this offering."}"
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-6 border-t border-slate-50">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pricing Matrix</p>
                        <p className="text-2xl font-serif italic text-[#668c65]">
                          {service.priceRange}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-xl bg-slate-50 text-slate-400 hover:text-[#668c65] hover:bg-[#668c65]/5 transition-all"
                            onClick={() => handleViewService(service)}
                            title="Inspect Data"
                          >
                            <Eye className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-xl bg-slate-50 text-slate-400 hover:text-[#668c65] hover:bg-[#668c65]/5 transition-all"
                            onClick={() => handleEditService(service)}
                            title="Refine Asset"
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            onClick={() => handleDeleteService(service.id)}
                            disabled={isDeleting === service.id}
                            title="Remove Permanently"
                          >
                            {isDeleting === service.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </Button>
                        </div>

                        <div className="h-8 w-[1px] bg-slate-100 hidden sm:block mx-1" />

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleServiceStatus(service)}
                          disabled={isToggling === service.id}
                          className={cn(
                            "flex-1 sm:flex-none h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            service.status === "active"
                              ? "text-slate-400 hover:text-slate-900 border-none bg-slate-50"
                              : "bg-[#668c65]/10 text-[#668c65] hover:bg-[#668c65]/20 hover:text-[#5a7b59]"
                          )}
                        >
                          {isToggling === service.id ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          ) : null}
                          {service.status === "active" ? "Archive Ritual" : "Manifest Ritual"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Alibaba-style Loading Skeleton
function ServicesLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-[1px] w-8" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Skeleton className="h-12 flex-1 rounded-2xl" />
        <div className="flex gap-2 w-full md:w-auto">
          <Skeleton className="h-12 w-40 rounded-2xl" />
          <Skeleton className="h-12 w-48 rounded-2xl" />
        </div>
      </div>

      {/* Services List Skeleton */}
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-none shadow-none rounded-[2rem] overflow-hidden bg-white border border-slate-50">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row h-full">
                <Skeleton className="w-full md:w-80 h-64 md:h-auto" />
                <div className="flex-1 p-10 space-y-6">
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-10 w-64" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-2 w-16" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <Skeleton className="h-12 w-40 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

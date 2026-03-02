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
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error("Failed to load categories");
    }
  };

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.providerServices.getAll();
      console.log("=== SERVICES API RESPONSE ===");
      console.log("Raw response:", response);

      // Backend returns list directly, not wrapped in { data: [...] }
      const responseData = response.data as any;
      const servicesArray = Array.isArray(responseData) ? responseData : (responseData?.data || []);
      console.log("Services array:", servicesArray);

      const mappedServices = servicesArray.map((s: any) => {
        console.log("=== MAPPING SERVICE ===");
        console.log("Service name:", s.name);
        console.log("Gallery data:", s.gallery);
        console.log("Gallery type:", typeof s.gallery);
        console.log("Is array:", Array.isArray(s.gallery));

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
              console.log("Gallery item:", item, "Type:", typeof item);
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

      console.log("Mapped services:", mappedServices);
      console.log("First service gallery:", mappedServices[0]?.gallery);
      console.log("===========================");

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
    console.log("=== EDITING SERVICE ===");
    console.log("Original service:", service);
    console.log("Gallery data:", service.gallery);

    // Find the category ID from the categories list
    const categoryData = categories.find(cat => cat.name === service.category);
    console.log("Found category:", categoryData);

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
        description: g.description || ""
      })) as any,
      packages: service.packages || [],
      phone: service.phone || "",
      email: service.email || "",
      status: service.status,
      verified: service.verified || false,
    };

    console.log("Edit data prepared:", editData);
    console.log("Edit gallery:", editData.gallery);
    console.log("========================");

    setEditingService(service);
    setShowCreateForm(true);
  };

  const handleSaveService = async (formData: ServiceFormData) => {
    setIsSaving(true);

    console.log("=== HANDLE SAVE SERVICE ===")
    console.log("Is editing:", !!editingService)
    console.log("Editing service ID:", editingService?.id)
    console.log("Form data:", formData)
    console.log("Received gallery count:", formData.gallery?.length || 0)
    console.log("Gallery items:", formData.gallery?.map(g => ({
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
        description: g.description || ""
      })).filter(item => item.url && item.url.trim() !== "") || [],
    };

    console.log("=== FINAL PAYLOAD ===")
    console.log("Gallery count after filter:", servicePayload.gallery.length)
    console.log("Gallery:", servicePayload.gallery)
    console.log("Payload:", servicePayload)

    try {
      if (editingService) {
        console.log("Updating service with ID:", editingService.id)
        await apiClient.providerServices.update(editingService.id, servicePayload);
        toast.success("Service updated successfully!");
      } else {
        console.log("Creating new service")
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
      console.log("=== PREPARING EDIT DATA ===");
      console.log("Editing service:", editingService);
      console.log("Categories available:", categories);

      // Find the category ID from the categories list
      const categoryData = categories.find(cat => cat.name === editingService.category);
      console.log("Found category for edit:", categoryData);

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
          description: g.description || ""
        })) as any,
        packages: editingService.packages || [],
        phone: editingService.phone || "",
        email: editingService.email || "",
        status: editingService.status,
        verified: editingService.verified || false,
      };

      console.log("Final edit data:", data);
      console.log("Edit gallery count:", data.gallery?.length);
      console.log("============================");

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Services</h2>
          <p className="text-muted-foreground mt-1">Manage and optimize your wedding service listings</p>
        </div>
        <Button onClick={handleCreateService} size="lg" className="shadow-sm">
          <Plus className="h-5 w-5 mr-2" />
          Create New Service
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm bg-muted/30">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services by title or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-none shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40 bg-background border-none shadow-sm">
                  <Filter className="w-4 h-4 mr-2 opacity-50" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48 bg-background border-none shadow-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <div className="grid gap-4">
        {filteredServices.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent">
            <CardContent className="text-center py-20">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No services found</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                  ? "We couldn't find any services matching your current filters. Try adjusting them or clear filters."
                  : "You haven't added any services yet. Start by creating your first listing."}
              </p>
              {!searchTerm && statusFilter === "all" && categoryFilter === "all" ? (
                <Button onClick={handleCreateService} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Service
                </Button>
              ) : (
                <Button variant="outline" onClick={() => { setSearchTerm(""); setStatusFilter("all"); setCategoryFilter("all"); }}>
                  Clear all filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredServices.map((service) => (
            <Card key={service.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row h-full">
                  {/* Service Thumbnail */}
                  <div className="relative w-full md:w-64 h-48 md:h-auto bg-muted overflow-hidden">
                    {service.gallery && service.gallery.length > 0 ? (
                      <Image
                        src={service.gallery[0].url}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <Badge
                      className={cn(
                        "absolute top-3 left-3 shadow-sm",
                        service.status === "active" ? "bg-teal-500 hover:bg-teal-600" : "bg-slate-500 hover:bg-slate-600"
                      )}
                    >
                      {service.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Service Info */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
                            {service.category}
                          </p>
                          <h3 className="text-xl font-bold group-hover:text-teal-700 transition-colors uppercase">
                            {service.title}
                            {service.verified && (
                              <Badge variant="secondary" className="ml-2 text-[10px] h-4 bg-blue-50 text-blue-600 border-blue-100 uppercase tracking-tighter">
                                Verified
                              </Badge>
                            )}
                          </h3>
                        </div>
                        {service.rating > 0 && (
                          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700 text-sm font-bold border border-yellow-100">
                            <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                            {service.rating}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                          {service.location}
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1 text-slate-400" />
                          {service.bookings} Bookings
                        </div>
                        {service.packages && service.packages.length > 0 && (
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-1 text-slate-400" />
                            {service.packages.length} Packages
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                        {service.description || "No description provided for this service."}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                      <div className="text-lg font-bold text-slate-900">
                        {service.priceRange}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="flex -space-x-1 mr-2 invisible sm:visible">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-slate-50 text-slate-400 hover:text-teal-600"
                            onClick={() => handleViewService(service)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-slate-50 text-slate-400 hover:text-teal-600"
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-slate-50 text-slate-400 hover:text-destructive"
                            onClick={() => handleDeleteService(service.id)}
                            disabled={isDeleting === service.id}
                          >
                            {isDeleting === service.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <Button
                          variant={service.status === "active" ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleServiceStatus(service)}
                          disabled={isToggling === service.id}
                          className={cn(
                            "flex-1 sm:flex-none font-semibold",
                            service.status === "active"
                              ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                              : "bg-teal-600 hover:bg-teal-700 text-white"
                          )}
                        >
                          {isToggling === service.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          ) : null}
                          {isToggling === service.id ? "Processing..." : service.status === "active" ? "Disable Service" : "Enable Service"}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 px-3 text-slate-400 hover:text-slate-900 sm:hidden"
                        >
                          <MoreVertical className="h-4 w-4" />
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
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Filters Skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-full md:w-48" />
            <Skeleton className="h-10 w-full md:w-48" />
          </div>
        </CardContent>
      </Card>

      {/* Services List Skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-3">
                  {/* Title and badges */}
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>

                  {/* Category and location */}
                  <Skeleton className="h-4 w-48" />

                  {/* Price and stats */}
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-10" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Filter, Star, Eye, Edit, Trash2 } from "lucide-react";
import { ServiceForm, ServiceFormData } from "./service-form";
import { ServiceDetailView } from "./service-detail-view";

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
    type: "image" | "video";
    url: string;
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.providerServices.getAll();
      console.log("=== SERVICES API RESPONSE ===");
      console.log("Raw response:", response);
      
      // Backend returns list directly, not wrapped in { data: [...] }
      const servicesArray = Array.isArray(response.data) ? response.data : (response.data?.data || []);
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
    setEditingService(service);
    setShowCreateForm(true);
  };

  const handleSaveService = async (formData: ServiceFormData) => {
    setIsSaving(true);
    const servicePayload = {
      name: formData.name,
      category: formData.category,
      location: formData.location,
      description: formData.description,
      specialties: formData.specialties,
      phone: formData.phone,
      email: formData.email,
      price_range_min: Number(formData.priceRangeMin),
      price_range_max: Number(formData.priceRangeMax),
      status: formData.status,
      packages: formData.packages,
      gallery: formData.gallery?.map(g => ({
        id: g.id,
        type: g.type,
        contentType: g.contentType || null,
        url: g.url || "",
        thumbnail: g.thumbnail,
        title: g.title || "",
        description: g.description || ""
      })).filter(item => item.url && item.url.trim() !== ""),
    };

    try {
      if (editingService) {
        await apiClient.providerServices.update(editingService.id, servicePayload);
        toast.success("Service updated successfully!");
      } else {
        await apiClient.providerServices.create(servicePayload);
        toast.success("Service created successfully!");
      }
      await fetchServices();
      setShowCreateForm(false);
      setEditingService(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to save service");
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

  const categories = Array.from(new Set(services.map(s => s.category)));

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
    return (
      <ServiceForm
        initialData={editingService ? {
          name: editingService.title,
          category: editingService.category,
          location: editingService.location,
          description: editingService.description,
          specialties: editingService.specialties,
          priceRangeMin: editingService.priceRangeMin?.toString(),
          priceRangeMax: editingService.priceRangeMax?.toString(),
          gallery: editingService.gallery,
          packages: editingService.packages,
          phone: editingService.phone,
          email: editingService.email,
          status: editingService.status,
          verified: editingService.verified,
        } : undefined}
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
          <h2 className="text-2xl font-bold">My Services</h2>
          <p className="text-muted-foreground">Manage your services that customers can browse and book</p>
        </div>
        <Button onClick={handleCreateService}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Service
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <div className="grid gap-4">
        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                  ? "No services match your filters"
                  : "You haven't created any services yet"}
              </p>
              {!searchTerm && statusFilter === "all" && categoryFilter === "all" && (
                <Button onClick={handleCreateService}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Service
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredServices.map((service) => (
            <Card key={service.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{service.title}</h3>
                      <Badge variant={service.status === "active" ? "default" : "secondary"}>
                        {service.status}
                      </Badge>
                      {service.verified && (
                        <Badge variant="outline" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">
                      {service.category} • {service.location}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="font-medium">{service.priceRange}</span>
                      <span className="text-muted-foreground">{service.bookings} bookings</span>
                      {service.rating > 0 && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                          <span>{service.rating}</span>
                        </div>
                      )}
                      {service.packages && service.packages.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {service.packages.length} package{service.packages.length > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewService(service)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditService(service)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {service.status === "active" ? (
                      <Button variant="outline" size="sm" onClick={() => handleSaveService({ ...service, name: service.title, status: "draft" } as any)}>
                        Disable
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleSaveService({ ...service, name: service.title, status: "active" } as any)}>
                        Enable
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      className="text-destructive hover:text-destructive"
                      disabled={isDeleting === service.id}
                    >
                      {isDeleting === service.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
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

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, XCircle, CheckCircle, Plus, Edit, Trash2, Star, Home, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
      setServices(response.data.data || []);
    } catch (error) {
      toast.error(`Failed to fetch services`);
      console.error("Error fetching services:", error);
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
      console.error("Error fetching categories:", error);
    }
  };

  const fetchServiceDetails = async (id: string) => {
    try {
      const response = await apiClient.admin.services.getDetails(id);
      setServiceDetail(response.data.data);
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      case "suspended": return "outline";
      default: return "outline";
    }
  };

  const getServiceActions = (service: ServiceData) => {
    const actions = [
      <Button key="view" variant="outline" size="sm" onClick={() => fetchServiceDetails(service.id)}>
        <Eye className="w-4 h-4 mr-2" />
        View Details
      </Button>
    ];

    if (service.status === "pending") {
      actions.push(
        <Button key="reject" variant="destructive" size="sm" onClick={() => openActionModal(service.id, "reject")}>
          <XCircle className="w-4 h-4 mr-2" />
          Reject
        </Button>,
        <Button key="approve" size="sm" onClick={() => openActionModal(service.id, "approve")}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Approve
        </Button>
      );
    }

    if (service.status === "approved" || service.is_active) {
      actions.push(
        <Button key="edit" variant="outline" size="sm" onClick={() => openEditModal(service)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      );

      if (service.status !== "suspended") {
        actions.push(
          <Button key="suspend" variant="destructive" size="sm" onClick={() => openActionModal(service.id, "suspend")}>
            Suspend
          </Button>
        );
      }
    }

    if (service.status === "suspended" || !service.is_active) {
      actions.push(
        <Button key="enable" size="sm" onClick={() => openActionModal(service.id, "enable")}>
          Enable
        </Button>
      );
    }

    return actions;
  };

  const filteredServices = services.filter(
    (service) =>
      service.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTabTitle = (status: string) => {
    switch (status) {
      case "pending": return "Pending Approval";
      case "approved": return "Approved Services";
      case "rejected": return "Rejected";
      case "suspended": return "Suspended";
      case "all": return "All Services";
      default: return "All Services";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Service Management</h2>
          <p className="text-muted-foreground">Manage platform services and categories</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[250px]"
            />
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{getTabTitle(statusFilter)}</h3>
            <p className="text-sm text-muted-foreground">
              {statusFilter === "pending" ? "Review and approve new services" : `Manage ${statusFilter} services`}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <p>Loading services...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <EmptyState
              title={`No ${statusFilter === "all" ? "" : statusFilter} services found`}
              description="No services match your search criteria."
              icon={<Search className="h-12 w-12 mx-auto text-muted-foreground" />}
            />
          ) : (
            <div className="space-y-4">
              {filteredServices.map((service) => (
                <Card key={service.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{service.service_name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Type: {service.service_type} • Created: {new Date(service.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {service.is_featured && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {service.is_visible_on_homepage && (
                          <Badge variant="outline" className="text-xs">
                            <Home className="w-3 h-3 mr-1" />
                            Homepage
                          </Badge>
                        )}
                        <Badge variant={getStatusBadgeVariant(service.status)} className="capitalize">
                          {service.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        {service.description || "No description provided"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-xs text-muted-foreground">
                        {service.creator && `Created by: ${service.creator.full_name}`}
                        {service.approver && ` • Approved by: ${service.approver.full_name}`}
                      </div>
                      <div className="flex gap-2">
                        {getServiceActions(service)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Service Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Service</DialogTitle>
            <DialogDescription>Add a new service to the platform catalog.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service_name">Service Name</Label>
              <Input
                id="service_name"
                placeholder="e.g., Traditional Dance"
                value={newService.service_name}
                onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_type">Service Category</Label>
              <Select
                value={newService.service_type}
                onValueChange={(value) => setNewService({ ...newService, service_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Service description..."
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateService}
              disabled={isProcessing || !newService.service_name || !newService.service_type}
            >
              {isProcessing ? "Creating..." : "Create Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">{actionType} Service</DialogTitle>
            <DialogDescription>
              {actionType === "approve" && "This will approve the service and make it available on the platform."}
              {actionType === "reject" && "This will reject the service and prevent it from being used."}
              {actionType === "suspend" && "This will temporarily suspend the service."}
              {actionType === "enable" && "This will enable the service and make it active."}
              {actionType === "delete" && "This will soft delete the service."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">
                {actionType === "reject" || actionType === "suspend" ? "Reason (Required)" : "Notes (Optional)"}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  actionType === "reject" ? "Please provide a reason for rejection..." :
                  actionType === "suspend" ? "Please provide a reason for suspension..." :
                  "Optional notes..."
                }
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>Cancel</Button>
            <Button
              variant={actionType === "approve" || actionType === "enable" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={isProcessing || ((actionType === "reject" || actionType === "suspend") && !adminNotes.trim())}
            >
              {isProcessing ? "Processing..." : `Confirm ${actionType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
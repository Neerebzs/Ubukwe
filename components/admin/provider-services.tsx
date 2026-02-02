"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, XCircle, CheckCircle, Search, MapPin, DollarSign, Package, Star, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Separator } from "@/components/ui/separator";

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
  status: "draft" | "active" | "pending" | "approved" | "rejected";
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
      const response = await apiClient.admin.services.getAll(statusFilter);
      console.log("Admin services response:", response);
      setServices(response.data.data || response.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch services");
      console.error("Error fetching services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServiceDetails = async (id: string) => {
    try {
      const response = await apiClient.admin.services.getDetails(id);
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
        await apiClient.admin.services.approve(selectedService.id, adminNotes);
        toast.success("Service approved successfully");
      } else if (actionType === "reject") {
        if (!adminNotes.trim()) {
          toast.error("Please provide a reason for rejection");
          return;
        }
        await apiClient.admin.services.reject(selectedService.id, adminNotes);
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return "default";
      case "pending":
      case "draft":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTabTitle = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Approval";
      case "approved":
        return "Approved Services";
      case "rejected":
        return "Rejected";
      case "active":
        return "Active Services";
      case "all":
        return "All Services";
      default:
        return "All Services";
    }
  };

  const getTabCount = (status: string) => {
    if (status === "all") return services.length;
    return services.filter((s) => s.status === status).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Provider Services</h2>
          <p className="text-muted-foreground">Review and approve provider service submissions</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-[250px]"
          />
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">
            Pending
            {!isLoading && getTabCount("pending") > 0 && (
              <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                {getTabCount("pending")}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{getTabTitle(statusFilter)}</h3>
            <p className="text-sm text-muted-foreground">
              {statusFilter === "pending"
                ? "Review and approve new service submissions from providers"
                : `Manage ${statusFilter} provider services`}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-6 w-64" />
                        <Skeleton className="h-4 w-96" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-48" />
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{service.name}</CardTitle>
                          <Badge variant={getStatusBadgeVariant(service.status)} className="capitalize">
                            {service.status}
                          </Badge>
                          {service.verified && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {service.location}
                          </span>
                          <span>•</span>
                          <span>{service.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {service.price_range_min?.toLocaleString()} - {service.price_range_max?.toLocaleString()} RWF
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      {service.packages?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {service.packages.length} package{service.packages.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {service.gallery?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {service.gallery.length} media item{service.gallery.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {service.specialties?.length > 0 && (
                        <span>{service.specialties.length} specialt{service.specialties.length > 1 ? "ies" : "y"}</span>
                      )}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        <p>
                          Provider: <span className="font-medium">{service.provider?.full_name || "Unknown"}</span>
                        </p>
                        <p className="flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          Submitted: {new Date(service.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => fetchServiceDetails(service.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        {service.status === "pending" && (
                          <>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openActionModal(service, "reject")}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => openActionModal(service, "approve")}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Service Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedService?.name}</DialogTitle>
            <DialogDescription>
              Review complete service details before approval
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="py-4 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{selectedService.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedService.location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price Range</p>
                    <p className="font-medium">
                      {selectedService.price_range_min?.toLocaleString()} - {selectedService.price_range_max?.toLocaleString()} RWF
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant={getStatusBadgeVariant(selectedService.status)} className="capitalize">
                      {selectedService.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedService.description}
                </p>
              </div>

              {/* Specialties */}
              {selectedService.specialties?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Packages */}
              {selectedService.packages?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Packages ({selectedService.packages.length})</h3>
                    <div className="grid gap-3">
                      {selectedService.packages.map((pkg: any, index: number) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{pkg.name}</h4>
                              <p className="text-lg font-bold">{pkg.price?.toLocaleString()} RWF</p>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
                            <p className="text-xs text-muted-foreground">Duration: {pkg.duration}</p>
                            {pkg.features?.length > 0 && (
                              <ul className="mt-3 space-y-1">
                                {pkg.features.map((feature: string, idx: number) => (
                                  <li key={idx} className="text-xs flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Gallery */}
              {selectedService.gallery?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Gallery ({selectedService.gallery.length} items)</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedService.gallery.slice(0, 8).map((item: any, index: number) => (
                        <div key={index} className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <Badge variant="outline">{item.type || "image"}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Contact */}
              {(selectedService.phone || selectedService.email) && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedService.phone && (
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p className="font-medium">{selectedService.phone}</p>
                        </div>
                      )}
                      {selectedService.email && (
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedService.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Provider Info */}
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Provider Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedService.provider?.full_name || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedService.provider?.email || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
              Close
            </Button>
            {selectedService?.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    openActionModal(selectedService, "reject");
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    openActionModal(selectedService, "approve");
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">{actionType} Service</DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "This will approve the service and make it available on the platform."
                : "This will reject the service. Please provide a reason."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">
                {actionType === "reject" ? "Rejection Reason (Required)" : "Notes (Optional)"}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  actionType === "reject"
                    ? "Please provide a clear reason for rejection..."
                    : "Optional notes for the provider..."
                }
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={isProcessing || (actionType === "reject" && !adminNotes.trim())}
            >
              {isProcessing ? "Processing..." : `Confirm ${actionType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, XCircle, CheckCircle, FileText, Search, MapPin, Briefcase, Calendar, Info, Users, UserCheck, UserX, Filter } from "lucide-react";
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

interface ProviderData {
  id: string;
  username: string;
  email: string;
  full_name: string;
  is_verified: boolean;
  business_type?: string;
  years_experience?: number;
  phone_number?: string;
  city?: string;
  country?: string;
  created_at: string;
}

interface VerificationData {
  id: string;
  status: string;
  rdb_company_name?: string;
  rdb_tin_number?: string;
  created_at: string;
}

interface ProviderDetail {
  provider: ProviderData;
  verification: VerificationData | null;
  bookingsCount: number;
}

export function AdminProviders() {
  const [providers, setProviders] = useState<ProviderDetail[]>([]);
  const [allProviders, setAllProviders] = useState<ProviderDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [providerDetail, setProviderDetail] = useState<ProviderDetail | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "suspend" | "activate">("approve");
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, [statusFilter]);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching providers with statusFilter:", statusFilter);
      
      if (statusFilter === "pending") {
        // Fetch pending onboarding applications
        console.log("Calling onboarding.getAll('pending')");
        const response = await apiClient.admin.onboarding.getAll('pending');
        console.log("Onboarding response:", response.data);
        setProviders(response.data.data || []);
      } else if (statusFilter === "all") {
        // For "All" tab, get all onboarding applications
        console.log("Calling onboarding.getAll()");
        const response = await apiClient.admin.onboarding.getAll();
        console.log("All onboarding response:", response.data);
        setProviders(response.data.data || []);
      } else {
        // Fetch providers with specific status filter (active, suspended)
        console.log("Calling providers.getAll() with status:", statusFilter);
        const response = await apiClient.admin.providers.getAll(statusFilter);
        const formattedProviders = response.data.map((provider: any) => ({
          provider: provider,
          verification: null, // Will be fetched individually if needed
          onboarding: null,
          bookingsCount: 0
        }));
        setProviders(formattedProviders);
      }
    } catch (error) {
      toast.error(`Failed to fetch ${statusFilter || "all"} providers`);
      console.error("Error fetching providers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProviderDetails = async (id: string) => {
    try {
      const response = await apiClient.admin.onboarding.getDetails(id);
      setProviderDetail(response.data.data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      toast.error("Failed to fetch provider details");
    }
  };

  const handleAction = async () => {
    if (!selectedProviderId) return;
    setIsProcessing(true);
    try {
      if (actionType === "approve") {
        await apiClient.admin.onboarding.approve(selectedProviderId, adminNotes);
        toast.success("Provider application approved");
      } else if (actionType === "reject") {
        await apiClient.admin.onboarding.reject(selectedProviderId, adminNotes);
        toast.success("Provider application rejected");
      } else if (actionType === "suspend") {
        await apiClient.admin.providers.suspend(selectedProviderId, adminNotes);
        toast.success("Provider suspended");
      } else if (actionType === "activate") {
        await apiClient.admin.providers.activate(selectedProviderId);
        toast.success("Provider activated");
      }
      setIsActionModalOpen(false);
      setIsDetailsModalOpen(false);
      setAdminNotes("");
      fetchProviders();
    } catch (error) {
      toast.error(`Failed to ${actionType} provider`);
    } finally {
      setIsProcessing(false);
    }
  };

  const openActionModal = (id: string, type: "approve" | "reject" | "suspend" | "activate") => {
    setSelectedProviderId(id);
    setActionType(type);
    setIsActionModalOpen(true);
  };

  const getStatusBadgeVariant = (status: string, isVerified: boolean) => {
    if (status === "pending") return "secondary";
    if (status === "approved" || isVerified) return "default";
    if (status === "rejected") return "destructive";
    return "outline";
  };

  const getStatusText = (item: any) => {
    if (statusFilter === "pending") {
      return item.onboarding?.status || "pending";
    }
    return item.provider?.is_verified ? "active" : "inactive";
  };

  const getProviderActions = (item: any) => {
    const providerId = item.onboarding?.id || item.provider?.id;
    
    if (statusFilter === "pending") {
      return (
        <>
          <Button variant="outline" size="sm" onClick={() => fetchProviderDetails(providerId)}>
            <Eye className="w-4 h-4 mr-2" />
            Review Details
          </Button>
          <Button variant="destructive" size="sm" onClick={() => openActionModal(providerId, "reject")}>
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button size="sm" onClick={() => openActionModal(providerId, "approve")}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
        </>
      );
    } else if (statusFilter === "active") {
      return (
        <>
          <Button variant="outline" size="sm" onClick={() => fetchProviderDetails(providerId)}>
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button variant="destructive" size="sm" onClick={() => openActionModal(providerId, "suspend")}>
            <UserX className="w-4 h-4 mr-2" />
            Suspend
          </Button>
        </>
      );
    } else if (statusFilter === "suspended") {
      return (
        <>
          <Button variant="outline" size="sm" onClick={() => fetchProviderDetails(providerId)}>
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button size="sm" onClick={() => openActionModal(providerId, "activate")}>
            <UserCheck className="w-4 h-4 mr-2" />
            Activate
          </Button>
        </>
      );
    }
    return (
      <Button variant="outline" size="sm" onClick={() => fetchProviderDetails(providerId)}>
        <Eye className="w-4 h-4 mr-2" />
        View Details
      </Button>
    );
  };

  const filteredProviders = providers.filter(
    (item) => {
      const provider = item.user || item.provider;
      const onboarding = item.onboarding;
      
      return (
        provider?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider?.business_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        onboarding?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        onboarding?.business_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  );

  const getTabTitle = (status: string) => {
    switch (status) {
      case "pending": return "Pending Approval";
      case "active": return "Active Providers";
      case "suspended": return "Suspended";
      case "all": return "All Providers";
      default: return "All Providers";
    }
  };

  const getTabDescription = (status: string) => {
    switch (status) {
      case "pending": return "Review and approve new provider applications";
      case "active": return "Manage active service providers";
      case "suspended": return "Review suspended provider accounts";
      case "all": return "View all providers in the system";
      default: return "View all providers in the system";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Onboarding Management</h2>
          <p className="text-muted-foreground">Manage service provider onboarding and accounts</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[250px]"
            />
          </div>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Pending ({providers.filter(p => statusFilter === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="suspended" className="flex items-center gap-2">
            <UserX className="w-4 h-4" />
            Suspended
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            All
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{getTabTitle(statusFilter)}</h3>
            <p className="text-sm text-muted-foreground">{getTabDescription(statusFilter)}</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <p>Loading {statusFilter || "all"} providers...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <EmptyState
              title={`No ${statusFilter || "providers"} found`}
              description={
                statusFilter === "pending" 
                  ? "All provider applications have been reviewed." 
                  : `No ${statusFilter} providers match your search criteria.`
              }
              icon={<FileText className="h-12 w-12 mx-auto text-muted-foreground" />}
            />
          ) : (
            <div className="space-y-4">
              {filteredProviders.map((item) => {
                const provider = item.user || item.provider;
                const verification = item.verification;
                const onboarding = item.onboarding;
                const providerId = onboarding?.id || provider?.id;
                
                return (
                  <Card key={providerId}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">
                            {onboarding?.business_name || provider?.full_name || provider?.username}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1 lowercase">
                            Provider ID: {providerId?.split("-")[0].toUpperCase()} • 
                            {statusFilter === "pending" ? " Applied: " : " Joined: "}
                            {new Date(onboarding?.submitted_at || provider?.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={getStatusBadgeVariant(getStatusText(item), provider?.is_verified)} 
                          className="capitalize"
                        >
                          {getStatusText(item)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Service Category</p>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {onboarding?.business_type?.replace("_", " ") || provider?.business_type?.replace("_", " ") || "Not Specified"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Location</p>
                          <p className="text-sm font-medium flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                            {(onboarding?.city && onboarding?.country) ? `${onboarding.city}, ${onboarding.country}` : 
                             (provider?.city && provider?.country) ? `${provider.city}, ${provider.country}` : "Not Specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Experience</p>
                          <p className="text-sm font-medium flex items-center mt-1">
                            <Briefcase className="h-3 w-3 mr-1 text-muted-foreground" />
                            {(onboarding?.years_experience || provider?.years_experience) ? 
                             `${onboarding?.years_experience || provider?.years_experience} years` : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Verification Status</p>
                          <p className={`text-sm font-medium flex items-center mt-1 ${
                            provider?.is_verified ? "text-green-600" : 
                            verification?.rdb_tin_number ? "text-amber-600" : "text-gray-600"
                          }`}>
                            {provider?.is_verified ? "Verified" : 
                             verification?.rdb_tin_number ? "Documents Submitted" : "Pending Documents"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Info className="h-3 w-3 mr-1" />
                          {statusFilter === "pending" ? "Review provider's legal documents before approval" : "Manage provider account status"}
                        </div>
                        <div className="flex gap-2">
                          {getProviderActions(item)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Provider Application Details</DialogTitle>
            <DialogDescription>
              Comprehensive review of service provider credentials and documentation.
            </DialogDescription>
          </DialogHeader>
          {providerDetail && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase">Basic Information</h4>
                    <div className="mt-2 space-y-1">
                      <p className="text-lg font-semibold">
                        {providerDetail.onboarding?.business_name || providerDetail.provider?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {providerDetail.onboarding?.email || providerDetail.provider?.email}
                      </p>
                      <p className="text-sm">
                        {providerDetail.onboarding?.phone || providerDetail.provider?.phone_number || "No phone provided"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase">Business Profile</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center text-sm">
                        <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="capitalize">
                          {(providerDetail.onboarding?.business_type || providerDetail.provider?.business_type)?.replace("_", " ")}
                        </span>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span>
                          {providerDetail.onboarding?.years_experience || providerDetail.provider?.years_experience} Years Experience
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {providerDetail.onboarding?.city || providerDetail.provider?.city}, {providerDetail.onboarding?.country || providerDetail.provider?.country}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase">Legal & Verification</h4>
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="secondary" className="capitalize">
                          {providerDetail.onboarding?.status || providerDetail.verification?.status || "No attempt"}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Registered Name:</span>
                        <span className="font-medium">
                          {providerDetail.verification?.rdb_company_name || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">TIN Number:</span>
                        <span className="font-medium font-mono">
                          {providerDetail.verification?.rdb_tin_number || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase">Statistics</h4>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg text-center">
                        <p className="text-2xl font-bold">{providerDetail.bookingsCount || 0}</p>
                        <p className="text-xs text-muted-foreground">Total Bookings</p>
                      </div>
                      <div className="p-3 border rounded-lg text-center">
                        <p className="text-2xl font-bold">New</p>
                        <p className="text-xs text-muted-foreground">Status</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
            <Button variant="destructive" onClick={() => openActionModal(providerDetail?.onboarding?.id || providerDetail?.provider?.id!, "reject")}>
              Reject Application
            </Button>
            <Button onClick={() => openActionModal(providerDetail?.onboarding?.id || providerDetail?.provider?.id!, "approve")}>
              Approve Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">{actionType} Provider</DialogTitle>
            <DialogDescription>
              {actionType === "approve" && "This will grant the provider full access to the platform services."}
              {actionType === "reject" && "This will decline the provider's current application for verification."}
              {actionType === "suspend" && "This will temporarily disable the provider's account and services."}
              {actionType === "activate" && "This will restore the provider's account and services."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">
                {actionType === "activate" ? "Optional Notes" : "Admin Notes / Feedback"}
                {(actionType === "reject" || actionType === "suspend") && " (Required)"}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  actionType === "approve" ? "Optional approval notes..." :
                  actionType === "reject" ? "Please provide a reason for rejection..." :
                  actionType === "suspend" ? "Please provide a reason for suspension..." :
                  "Optional notes..."
                }
                value={adminNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>Cancel</Button>
            <Button
              variant={actionType === "approve" || actionType === "activate" ? "default" : "destructive"}
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

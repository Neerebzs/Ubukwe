"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, XCircle, CheckCircle, FileText, Search, MapPin, Briefcase, Calendar, Info, Users, UserCheck, UserX, Filter, ShieldCheck, ShieldAlert, Building2, UserCircle2, Clock, Globe2, ChevronRight, Ban, Mail, Phone } from "lucide-react";
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
  id?: string;
  user?: any;
  provider?: ProviderData | any;
  onboarding?: any;
  verification?: VerificationData | null;
  bookingsCount?: number;
}

export function AdminProviders() {
  const [providers, setProviders] = useState<ProviderDetail[]>([]);
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

      if (statusFilter === "pending") {
        const response: any = await apiClient.admin.onboarding.getAll('pending');
        const data = Array.isArray(response) ? response : (response?.data?.data || response?.data || []);
        setProviders(data);
      } else if (statusFilter === "all") {
        const response: any = await apiClient.admin.onboarding.getAll();
        const data = Array.isArray(response) ? response : (response?.data?.data || response?.data || []);
        setProviders(data);
      } else {
        // Fetch providers with specific status filter (active, suspended)
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
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif italic text-slate-900 tracking-tight">Artisan Onboarding</h1>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-[#608d64]/60" />
            <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">Curating the Crafting Elite</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-600 group-focus-within:text-[#608d64] transition-colors" />
          </div>
          <Input
            placeholder="Search artisans..."
            className="pl-12 pr-4 h-14 w-full md:w-[320px] bg-white border-slate-100 rounded-2xl focus-visible:ring-1 focus-visible:ring-[#608d64] focus-visible:border-[#608d64] shadow-none transition-all duration-300 placeholder:text-slate-500 placeholder:font-light"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="flex items-center gap-1 bg-white border border-slate-100 p-1.5 rounded-[1.8rem] h-auto w-fit mb-8 shadow-sm">
          {[
            { id: "pending", label: "Pending Review", icon: <Clock className="w-3.5 h-3.5" /> },
            { id: "active", label: "Active Presence", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            { id: "suspended", label: "Restricted Access", icon: <Ban className="w-3.5 h-3.5" /> },
            { id: "all", label: "Full Registry", icon: <Users className="w-3.5 h-3.5" /> }
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="h-11 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2.5 data-[state=active]:!bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:translate-y-[-1px] text-slate-600 hover:text-slate-800 hover:bg-slate-50"
            >
              {tab.icon}
              {tab.label}
              {tab.id === "pending" && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[8px] font-black border ${statusFilter === "pending" ? "bg-white/20 border-white/40 text-white" : "bg-slate-50 border-slate-100 text-slate-600"
                  }`}>
                  {providers.filter(p => !p.provider?.is_verified && statusFilter === "pending").length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={statusFilter} className="mt-0 focus-visible:outline-none">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-8 h-8 border-2 border-[#608d64]/20 border-t-[#608d64] rounded-full animate-spin" />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Retrieving Credentials</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-32 rounded-[3rem] border border-dashed border-slate-200 bg-slate-50/50">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-serif italic text-slate-600">Registry section is currently clear</h3>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2 px-10">No {statusFilter} artisans match your refinement filters</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredProviders.map((item) => {
                const provider = item.user || item.provider;
                const verification = item.verification;
                const onboarding = item.onboarding;
                const providerId = onboarding?.id || provider?.id;
                const status = getStatusText(item);

                return (
                  <Card key={providerId} className="border-slate-100 bg-white shadow-none rounded-[2.5rem] overflow-hidden hover:border-[#608d64]/20 transition-all duration-500 group">
                    <CardContent className="p-8">
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                        {/* Provider Essence */}
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            <div className="h-20 w-20 rounded-[1.5rem] bg-slate-50 border-2 border-slate-50 flex items-center justify-center group-hover:border-[#608d64]/10 transition-colors">
                              <Building2 className="w-8 h-8 text-[#608d64]/40" />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-lg border-4 border-white flex items-center justify-center shadow-sm ${status === 'active' || status === 'approved' ? 'bg-[#608d64]' :
                              status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                              }`}>
                              {status === 'active' || status === 'approved' ? <ShieldCheck className="w-3 h-3 text-white" /> :
                                status === 'pending' ? <Clock className="w-3 h-3 text-white" /> : <ShieldAlert className="w-3 h-3 text-white" />}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-2xl font-serif italic text-slate-900 tracking-tight group-hover:text-[#608d64] transition-colors duration-500 leading-tight">
                              {onboarding?.business_name || provider?.full_name || provider?.username}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3">
                              <Badge variant="outline" className="bg-[#608d64]/5 border-[#608d64]/20 text-[#608d64] px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-none">
                                {onboarding?.business_type?.replace("_", " ") || provider?.business_type?.replace("_", " ") || "Boutique"}
                              </Badge>
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                {providerId?.split("-")[0].toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Architectural Metadata */}
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:flex xl:items-center gap-8 xl:gap-14">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Global Location</p>
                            <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                              {(onboarding?.city && onboarding?.country) ? `${onboarding.city}` :
                                (provider?.city && provider?.country) ? `${provider.city}` : "Kigali"}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Legacy</p>
                            <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                              <Briefcase className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                              {(onboarding?.years_experience || provider?.years_experience) ?
                                `${onboarding?.years_experience || provider?.years_experience} Yrs` : "N/A"}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{statusFilter === "pending" ? "Applied" : "Presence"}</p>
                            <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5 leading-none">
                              <Calendar className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                              {new Date(onboarding?.submitted_at || provider?.created_at).toLocaleDateString('en-CA', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>

                          {/* Refined Actions */}
                          <div className="col-span-2 md:col-span-1 flex items-center gap-2 ml-auto">
                            {statusFilter === "pending" ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fetchProviderDetails(providerId)}
                                  className="h-11 px-5 rounded-2xl border-slate-100 hover:border-[#608d64] hover:bg-[#608d64]/5 text-slate-600 hover:text-[#608d64] transition-all duration-300 flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="text-[11px] font-bold uppercase tracking-wider">Inspect</span>
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => openActionModal(providerId, "approve")}
                                  className="h-11 px-5 rounded-2xl bg-[#608d64] hover:bg-[#4a6e4d] text-white shadow-lg shadow-[#608d64]/10 transition-all duration-300 flex items-center gap-2 border-none"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-[11px] font-bold uppercase tracking-wider">Admit</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openActionModal(providerId, "reject")}
                                  className="h-11 w-11 p-0 rounded-2xl border-rose-50 text-rose-500 hover:bg-rose-50 transition-all duration-300 flex items-center justify-center outline-none"
                                >
                                  <XCircle className="h-5 w-5" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchProviderDetails(providerId)}
                                className="h-11 px-6 rounded-2xl border-slate-100 hover:border-[#608d64] hover:bg-[#608d64]/5 text-slate-600 hover:text-[#608d64] transition-all duration-300 flex items-center gap-3"
                              >
                                <span className="text-[11px] font-bold uppercase tracking-widest">Detailed Dossier</span>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
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

      {/* Detail Modal - Sanctuary Aesthetic */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl">
          <div className="bg-[#fdfcf9] p-12 space-y-10">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-3xl font-serif italic text-slate-900 tracking-tight">Artisan Dossier</DialogTitle>
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-6 bg-[#608d64]/60" />
                <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.3em]">Comprehensive Credential Analysis</p>
              </div>
            </DialogHeader>

            {providerDetail && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
                {/* Profile Essence */}
                <div className="flex items-center gap-8">
                  <div className="h-28 w-28 rounded-[2rem] bg-white border-4 border-white shadow-2xl shadow-slate-200/50 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-[#608d64]/60" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-serif italic text-slate-900">
                      {providerDetail.onboarding?.business_name || providerDetail.provider?.full_name}
                    </h4>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-[#608d64]/5 border-[#608d64]/20 text-[#608d64] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-none">
                        {(providerDetail.onboarding?.business_type || providerDetail.provider?.business_type)?.replace("_", " ")}
                      </Badge>
                      <span className="text-[11px] text-slate-600 font-light flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5" />
                        {providerDetail.onboarding?.city || providerDetail.provider?.city}, Rwanda
                      </span>
                    </div>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Contact Metadata</p>
                      <div className="space-y-4 bg-white p-6 rounded-[2rem] border border-slate-50">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600"><Mail className="w-4 h-4" /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Email conduit</p>
                            <p className="text-sm font-medium text-slate-700 uppercase tracking-tight">{providerDetail.onboarding?.email || providerDetail.provider?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600"><Phone className="w-4 h-4" /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Telephonic</p>
                            <p className="text-sm font-medium text-slate-700">{providerDetail.onboarding?.phone || providerDetail.provider?.phone_number || "Confidential"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Legal Stature</p>
                      <div className="space-y-4 bg-[#608d64]/[0.02] p-6 rounded-[2rem] border border-[#608d64]/5">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">RDB Entity</span>
                          <span className="font-serif italic text-slate-700">{providerDetail.verification?.rdb_company_name || "Self-Propelled"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">TIN Identity</span>
                          <span className="font-mono text-[11px] font-bold text-slate-500">{providerDetail.verification?.rdb_tin_number || "Not Furnished"}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-[#608d64]/10">
                          <span className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.2em]">Verification</span>
                          <Badge className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${providerDetail.provider?.is_verified ? 'bg-[#608d64]' : 'bg-amber-500'
                            }`}>
                            {providerDetail.provider?.is_verified ? "Certified" : "In Review"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-4 pt-4 shrink-0">
              <Button
                variant="outline"
                onClick={() => setIsDetailsModalOpen(false)}
                className="flex-1 h-14 border-slate-200 rounded-2xl text-slate-600 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all duration-300 shadow-none border"
              >
                Conclude Dossier
              </Button>
              {statusFilter === "pending" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => openActionModal(providerDetail?.onboarding?.id || providerDetail?.provider?.id!, "reject")}
                    className="h-14 px-8 border-rose-100 bg-rose-50/20 rounded-2xl text-rose-500 font-bold uppercase tracking-widest text-[10px] hover:bg-rose-50 transition-all duration-300"
                  >
                    Decline Admission
                  </Button>
                  <Button
                    onClick={() => openActionModal(providerDetail?.onboarding?.id || providerDetail?.provider?.id!, "approve")}
                    className="h-14 px-10 bg-[#608d64] border-none rounded-2xl text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#4a6e4d] transition-all duration-300 shadow-xl shadow-[#608d64]/10"
                  >
                    Authorize Admission
                  </Button>
                </>
              )}
              {statusFilter === "active" && (
                <Button
                  variant="outline"
                  onClick={() => openActionModal(providerDetail?.onboarding?.id || providerDetail?.provider?.id!, "suspend")}
                  className="h-14 px-8 border-rose-100 bg-rose-50/20 rounded-2xl text-rose-500 font-bold uppercase tracking-widest text-[10px] hover:bg-rose-50 transition-all duration-300"
                >
                  Suspend Presence
                </Button>
              )}
              {statusFilter === "suspended" && (
                <Button
                  onClick={() => openActionModal(providerDetail?.onboarding?.id || providerDetail?.provider?.id!, "activate")}
                  className="h-14 px-10 bg-[#608d64] border-none rounded-2xl text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#4a6e4d] transition-all duration-300 shadow-xl shadow-[#608d64]/10"
                >
                  Restore Presence
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Modal - Sanctuary Aesthetic */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl">
          <div className="bg-[#fdfcf9] p-10 space-y-8">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-2xl font-serif italic text-slate-900 capitalize">{actionType} Personnel</DialogTitle>
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-4 bg-[#608d64]/60" />
                <p className="text-[10px] font-black text-[#608d64] uppercase tracking-widest">Administrative Resolution</p>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-50 text-sm font-light text-slate-500 leading-relaxed italic">
                {actionType === "approve" && "Acknowledging the professional merit of this artisan for full platform integration."}
                {actionType === "reject" && "Concluding that current credentials do not align with our collective curation standards."}
                {actionType === "suspend" && "Temporarily archiving this presence to resolve pending administrative incongruities."}
                {actionType === "activate" && "Restoring the narrative flow and platform accessibility for this artisan."}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">
                  Justification Dossier
                  {(actionType === "reject" || actionType === "suspend") && " (Necessary)"}
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Enter administrative rationale..."
                  value={adminNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)}
                  className="min-h-[120px] bg-white border-slate-100 rounded-2xl focus:ring-[#608d64] focus:border-[#608d64] shadow-none font-medium px-6 py-4 resize-none"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsActionModalOpen(false)}
                className="flex-1 h-14 border-slate-200 rounded-2xl text-slate-600 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all duration-300 shadow-none border"
              >
                Discard Choice
              </Button>
              <Button
                variant={actionType === "approve" || actionType === "activate" ? "default" : "destructive"}
                onClick={handleAction}
                disabled={isProcessing || ((actionType === "reject" || actionType === "suspend") && !adminNotes.trim())}
                className={`flex-1 h-14 border-none rounded-2xl text-white font-bold uppercase tracking-widest text-[10px] transition-all duration-300 shadow-xl ${actionType === "approve" || actionType === "activate"
                  ? "bg-[#608d64] hover:bg-[#4a6e4d] shadow-[#608d64]/10"
                  : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/10"
                  }`}
              >
                {isProcessing ? "Finalizing..." : `Commit ${actionType}`}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

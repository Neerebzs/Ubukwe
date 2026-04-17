"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock, CheckCircle, XCircle, AlertTriangle, FileText,
  Edit, RefreshCw, Building2, Phone, Mail, MapPin,
  Tag, AlignLeft, Image as ImageIcon, ExternalLink
} from "lucide-react";
import { axiosInstance } from "@/lib/api-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ApplicationDetails {
  id: string;
  business_name: string;
  business_type: string;
  years_experience: number;
  service_categories: string[];
  business_description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  rdb_document_url?: string;
  business_logo_url?: string;
  admin_notes?: string;
  rejection_reason?: string;
  submitted_at?: string;
  updated_at?: string;
}

interface OnboardingData {
  onboarding_status: "pending" | "approved" | "rejected" | "requires_revision" | null;
  admin_notes?: string;
  submitted_at?: string;
  application_details?: ApplicationDetails;
}

export function ProviderOnboardingStatus() {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/v1/provider/onboarding/status");
      const responseData = res.data?.data ?? res.data;
      setData(responseData);
    } catch (error) {
      console.error("Failed to fetch onboarding status", error);
      toast.error("Failed to load onboarding status");
    } finally {
      setLoading(false);
    }
  };

  const goToForm = () => router.push("/provider/onboarding");

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  // ── No application yet ───────────────────────────────────────────────────
  if (!data || !data.onboarding_status) {
    return (
      <Card className="border-slate-200 border-dashed bg-slate-50/50">
        <CardContent className="pt-12 pb-12 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <div className="max-w-xs">
            <h3 className="text-lg font-bold text-slate-900">No Onboarding Application</h3>
            <p className="text-sm text-slate-500 mt-1">
              You haven&apos;t started your onboarding process yet. Complete it to start offering services on the platform.
            </p>
          </div>
          <Button
            onClick={goToForm}
            className="rounded-xl bg-[#668c65] hover:bg-[#557555]"
          >
            Start Onboarding
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Status config ────────────────────────────────────────────────────────
  const statusConfig = {
    approved: {
      icon: <CheckCircle className="w-10 h-10 text-emerald-500" />,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      title: "Application Approved",
      description: "Your business is verified and ready to accept bookings.",
      badge: <Badge className="bg-emerald-500 hover:bg-emerald-600">Approved</Badge>,
    },
    pending: {
      icon: <Clock className="w-10 h-10 text-amber-500" />,
      bg: "bg-amber-50",
      border: "border-amber-100",
      title: "Review in Progress",
      description: "Our team is reviewing your documentation. This usually takes 2–3 business days.",
      badge: <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200">Pending Review</Badge>,
    },
    requires_revision: {
      icon: <AlertTriangle className="w-10 h-10 text-orange-500" />,
      bg: "bg-orange-50",
      border: "border-orange-100",
      title: "Revision Required",
      description: "Changes are needed to your application before we can proceed.",
      badge: <Badge className="bg-orange-500 hover:bg-orange-600">Revision Needed</Badge>,
    },
    rejected: {
      icon: <XCircle className="w-10 h-10 text-red-500" />,
      bg: "bg-red-50",
      border: "border-red-100",
      title: "Application Declined",
      description: "Unfortunately, your application was not approved at this time.",
      badge: <Badge variant="destructive">Declined</Badge>,
    },
  };

  const cfg = statusConfig[data.onboarding_status];
  const details = data.application_details;
  const canEdit = data.onboarding_status === "requires_revision" || data.onboarding_status === "rejected";

  return (
    <div className="space-y-6">
      {/* ── Status banner ── */}
      <Card className={`border ${cfg.border} ${cfg.bg}`}>
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
              {cfg.icon}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-bold text-slate-900">{cfg.title}</h3>
                {cfg.badge}
              </div>
              <p className="text-slate-600 text-sm">{cfg.description}</p>
              {details?.submitted_at && (
                <p className="text-xs text-slate-400 mt-1">
                  Submitted {new Date(details.submitted_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStatus}
                className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Refresh
              </Button>
              {canEdit && (
                <Button
                  size="sm"
                  onClick={goToForm}
                  className="rounded-xl bg-[#668c65] hover:bg-[#557555]"
                >
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                  Update Application
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Admin feedback ── */}
      {(data.application_details?.admin_notes || data.application_details?.rejection_reason) && (
        <Card className="border-orange-100 bg-orange-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-4 h-4" />
              Feedback from Administration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-900 bg-white/60 p-4 rounded-xl border border-orange-100 italic">
              &quot;{data.application_details?.rejection_reason || data.application_details?.admin_notes}&quot;
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Application details ── */}
      {details && (
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Application Summary</CardTitle>
              <CardDescription>Details of your submitted onboarding documents</CardDescription>
            </div>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToForm}
                className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hidden md:flex"
              >
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-8">

            {/* Business logo */}
            {details.business_logo_url && (
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <img
                  src={details.business_logo_url}
                  alt="Business logo"
                  className="w-16 h-16 object-contain rounded-xl border border-slate-200 bg-white p-1"
                />
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Business Logo</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{details.business_name}</p>
                </div>
              </div>
            )}

            {/* Two-column grid */}
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
              {/* Business details */}
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Business Details
                </p>
                <div className="space-y-0 divide-y divide-slate-50">
                  <Row label="Business Name" value={details.business_name} />
                  <Row label="Business Type" value={details.business_type?.replace(/-/g, " ")} capitalize />
                  <Row label="Experience" value={`${details.years_experience} year${details.years_experience !== 1 ? "s" : ""}`} />
                </div>
              </div>

              {/* Contact info */}
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Contact Info
                </p>
                <div className="space-y-0 divide-y divide-slate-50">
                  <Row label="Phone" value={details.phone} />
                  <Row label="Email" value={details.email} />
                  <Row label="Location" value={[details.city, details.country].filter(Boolean).join(", ")} />
                </div>
              </div>
            </div>

            {/* Service categories */}
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Service Categories
              </p>
              {details.service_categories?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {details.service_categories.map((cat: string) => (
                    <Badge key={cat} variant="outline" className="rounded-lg bg-slate-50 border-slate-200 text-slate-700">
                      {cat}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No categories selected</p>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5" /> Business Description
              </p>
              <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                {details.business_description || <span className="italic text-slate-400">No description provided</span>}
              </p>
            </div>

            {/* Documents */}
            {details.rdb_document_url && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Documents
                </p>
                <a
                  href={details.rdb_document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#668c65] hover:text-[#557555] font-medium bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-[#668c65]/30 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  View RDB Certificate
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Mobile edit button */}
            {canEdit && (
              <div className="md:hidden pt-2">
                <Button
                  onClick={goToForm}
                  className="w-full rounded-xl bg-[#668c65] hover:bg-[#557555]"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update Application
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Small helper row component
function Row({ label, value, capitalize }: { label: string; value?: string | null; capitalize?: boolean }) {
  return (
    <div className="flex justify-between py-2.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold text-slate-900 text-right max-w-[55%] truncate ${capitalize ? "capitalize" : ""}`}>
        {value || <span className="text-slate-400 font-normal italic">—</span>}
      </span>
    </div>
  );
}

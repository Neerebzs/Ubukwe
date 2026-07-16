"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Globe, Loader2, CheckCircle, AlertCircle, Copy, Check, Trash2, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, WeddingWebsite } from "@/lib/api";
import { queryKeys } from "@/lib/cache";
import { toast } from "sonner";

interface DnsRecord {
  type: string;
  host: string;
  value: string;
  purpose: string;
}

interface CustomDomainInfo {
  domain: string;
  verified: boolean;
  verified_at?: string | null;
  cname_target: string;
  dns_records: DnsRecord[];
  instructions: string[];
}

function unwrapData<T>(response: { data?: T } | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

export function CustomDomainSettings({
  weddingId,
  website,
}: {
  weddingId: string;
  website: WeddingWebsite;
}) {
  const queryClient = useQueryClient();
  const [domainInput, setDomainInput] = useState(website.custom_domain || "");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: domainInfo, isLoading } = useQuery({
    queryKey: queryKeys.wedding.customDomain(weddingId),
    queryFn: async () => {
      const res = await apiClient.website.getCustomDomain<CustomDomainInfo | null>(weddingId);
      return unwrapData(res);
    },
    enabled: !!website.custom_domain,
  });

  const setDomainMutation = useMutation({
    mutationFn: (domain: string) => apiClient.website.setCustomDomain<CustomDomainInfo>(weddingId, domain),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wedding.website(weddingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.wedding.customDomain(weddingId) });
      toast.success("Domain configured — add the DNS records below");
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed to set domain"),
  });

  const verifyMutation = useMutation({
    mutationFn: () => apiClient.website.verifyCustomDomain<{ verified: boolean; message: string }>(weddingId),
    onSuccess: (res) => {
      const data = unwrapData(res);
      queryClient.invalidateQueries({ queryKey: queryKeys.wedding.website(weddingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.wedding.customDomain(weddingId) });
      toast.success(data.message || "Domain verified");
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Verification failed"),
  });

  const removeMutation = useMutation({
    mutationFn: () => apiClient.website.removeCustomDomain(weddingId),
    onSuccess: () => {
      setDomainInput("");
      queryClient.invalidateQueries({ queryKey: queryKeys.wedding.website(weddingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.wedding.customDomain(weddingId) });
      toast.success("Custom domain removed");
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed to remove domain"),
  });

  const copyValue = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const info = domainInfo ?? (website.custom_domain ? {
    domain: website.custom_domain,
    verified: website.custom_domain_verified,
    cname_target: "sites.vownests.com",
    dns_records: [],
    instructions: [],
  } : null);

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Custom Domain
        </CardTitle>
        <CardDescription>
          Connect your own domain (e.g. emmaandjohn.com) to your wedding website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {website.status !== "published" && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100 text-amber-800 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            Publish your website before connecting a custom domain.
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="custom-domain">Your Domain</Label>
            <Input
              id="custom-domain"
              placeholder="emmaandjohn.com"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              disabled={!!website.custom_domain}
            />
          </div>
          {!website.custom_domain ? (
            <Button
              className="mt-6 bg-[#668c65] hover:bg-[#668c65]/90"
              disabled={!domainInput.trim() || setDomainMutation.isPending || website.status !== "published"}
              onClick={() => setDomainMutation.mutate(domainInput.trim())}
            >
              {setDomainMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="mt-6 text-red-600 hover:text-red-700"
              disabled={removeMutation.isPending}
              onClick={() => removeMutation.mutate()}
            >
              {removeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {website.custom_domain && info && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">{info.domain}</span>
              {info.verified ? (
                <Badge className="bg-emerald-100 text-emerald-800">
                  <CheckCircle className="h-3 w-3 mr-1" /> Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-700 border-amber-200">
                  Pending verification
                </Badge>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : (
              <>
                {info.dns_records.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">DNS Records</p>
                    {info.dns_records.map((record) => (
                      <div key={`${record.type}-${record.host}`} className="p-4 rounded-xl border bg-slate-50 text-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{record.type}</Badge>
                          <span className="text-xs text-slate-500">{record.purpose}</span>
                        </div>
                        <div className="grid gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500">Host</span>
                            <code className="text-xs bg-white px-2 py-1 rounded border">{record.host}</code>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500">Value</span>
                            <div className="flex items-center gap-1">
                              <code className="text-xs bg-white px-2 py-1 rounded border max-w-[200px] truncate">{record.value}</code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => copyValue(record.value, record.host)}
                              >
                                {copiedField === record.host ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {info.instructions.length > 0 && (
                  <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
                    {info.instructions.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                )}

                {!info.verified && (
                  <Button
                    onClick={() => verifyMutation.mutate()}
                    disabled={verifyMutation.isPending}
                    className="bg-[#668c65] hover:bg-[#668c65]/90"
                  >
                    {verifyMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Verify Domain
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

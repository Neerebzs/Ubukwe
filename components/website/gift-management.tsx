"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Gift, Users, DollarSign, CheckCircle, XCircle, Loader2, Heart, Download, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { apiClient, WeddingGift, GiftSummary } from "@/lib/api";
import { queryKeys } from "@/lib/cache";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  received: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
};

function unwrap<T>(r: { data?: T } | T): T {
  if (r && typeof r === "object" && "data" in r) return (r as { data: T }).data;
  return r as T;
}

export function GiftManagement({ weddingId }: { weddingId: string }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string | undefined>();

  const { data: gifts = [], isLoading } = useQuery({
    queryKey: [...queryKeys.wedding.gifts(weddingId), filter],
    queryFn: async () => unwrap(await apiClient.gifts.list<WeddingGift[]>(weddingId, filter)),
  });

  const { data: summary } = useQuery({
    queryKey: queryKeys.wedding.giftsSummary(weddingId),
    queryFn: async () => unwrap(await apiClient.gifts.summary<GiftSummary>(weddingId)),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.gifts(weddingId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.wedding.giftsSummary(weddingId) });
  };

  const approveMutation = useMutation({
    mutationFn: (giftId: string) => apiClient.gifts.approve(weddingId, giftId),
    onSuccess: () => { toast.success("Gift approved"); invalidate(); },
  });
  const rejectMutation = useMutation({
    mutationFn: (giftId: string) => apiClient.gifts.reject(weddingId, giftId),
    onSuccess: () => { toast.success("Gift rejected"); invalidate(); },
  });
  const receivedMutation = useMutation({
    mutationFn: (giftId: string) => apiClient.gifts.markReceived(weddingId, giftId),
    onSuccess: () => { toast.success("Marked as received"); invalidate(); },
  });
  const thankMutation = useMutation({
    mutationFn: (giftId: string) => apiClient.gifts.thankYou(weddingId, giftId),
    onSuccess: () => { toast.success("Thank-you recorded"); invalidate(); },
  });

  const exportCsv = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
      const res = await fetch(apiClient.gifts.exportCsvUrl(weddingId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gifts-${weddingId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch {
      toast.error("Failed to export gifts");
    }
  };

  const exportPdf = async () => {
    if (!gifts.length) {
      toast.error("No gifts to export");
      return;
    }
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Wedding Gift Registry", 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.text(`Total gifts: ${summary?.total_gifts ?? gifts.length}`, 14, 34);

      let y = 46;
      const lineHeight = 7;
      gifts.forEach((g, i) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(11);
        doc.text(`${i + 1}. ${g.reference_number} — ${g.contributor_name}`, 14, y);
        y += lineHeight;
        doc.setFontSize(9);
        doc.text(
          `Type: ${g.gift_type} | Amount: ${g.amount ? `${g.amount} ${g.currency}` : "N/A"} | Status: ${g.status}`,
          14,
          y,
        );
        y += lineHeight + 2;
      });

      doc.save(`gifts-${weddingId}.pdf`);
      toast.success("PDF exported");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#668c65]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6 flex items-center gap-3">
            <Gift className="h-5 w-5 text-[#668c65]" />
            <div>
              <p className="text-2xl font-serif">{summary?.total_gifts ?? 0}</p>
              <p className="text-xs text-slate-400">Total Gifts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6 flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-[#668c65]" />
            <div>
              <p className="text-2xl font-serif">{Number(summary?.total_amount || 0).toLocaleString()}</p>
              <p className="text-xs text-slate-400">RWF Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6 flex items-center gap-3">
            <Users className="h-5 w-5 text-[#668c65]" />
            <div>
              <p className="text-2xl font-serif">{summary?.contributors_count ?? 0}</p>
              <p className="text-xs text-slate-400">Contributors</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-2xl font-serif">{summary?.pending_count ?? 0}</p>
              <p className="text-xs text-slate-400">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap">
        {["all", "pending", "approved", "received", "rejected"].map((s) => (
          <Button
            key={s}
            variant={(!filter && s === "all") || filter === s ? "default" : "outline"}
            size="sm"
            className="capitalize"
            onClick={() => setFilter(s === "all" ? undefined : s)}
          >
            {s}
          </Button>
        ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-2" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPdf}>
            <FileText className="h-4 w-4 mr-2" /> PDF
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Gift Registrations</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {gifts.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No gifts registered yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Contributor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gifts.map((gift) => (
                  <TableRow key={gift.id}>
                    <TableCell className="font-mono text-xs">{gift.reference_number}</TableCell>
                    <TableCell>
                      <div className="font-medium">{gift.contributor_name}</div>
                      <div className="text-xs text-slate-400 capitalize">{gift.relationship}</div>
                    </TableCell>
                    <TableCell className="capitalize">{gift.gift_type.replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      {gift.amount ? `${Number(gift.amount).toLocaleString()} ${gift.currency}` : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={`${STATUS_COLORS[gift.status] || ""} capitalize`}>{gift.status}</Badge>
                        {(gift.gift_details as Record<string, unknown> | undefined)?.payment_status === "paid" && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Paid online</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {gift.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => approveMutation.mutate(gift.id)}><CheckCircle className="h-3 w-3" /></Button>
                            <Button size="sm" variant="outline" onClick={() => rejectMutation.mutate(gift.id)}><XCircle className="h-3 w-3" /></Button>
                          </>
                        )}
                        {gift.status === "approved" && (
                          <Button size="sm" variant="outline" onClick={() => receivedMutation.mutate(gift.id)}>Received</Button>
                        )}
                        {!gift.thank_you_sent && gift.status !== "rejected" && (
                          <Button size="sm" variant="ghost" onClick={() => thankMutation.mutate(gift.id)} title="Thank you">
                            <Heart className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

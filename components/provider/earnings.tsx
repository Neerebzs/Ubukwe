"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DollarSign, TrendingUp, Wallet, CreditCard, Clock,
  Calendar, Ticket, CheckCircle, AlertCircle, Phone,
  Building2, Settings, ArrowDownToLine, Loader2, Info,
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";
import { useEvents } from "@/hooks/useEvents";
import { Event } from "@/lib/api/events";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
interface EarningSummary {
  total_earnings: number;
  pending_earnings: number;
  completed_earnings: number;
  available_for_withdrawal: number;
  commission_rate?: number;
  payout_rate?: number;
}

interface Earning {
  id: string;
  booking_id: string;
  amount: number;
  gross_amount?: number;
  platform_commission?: number;
  status: string;
  created_at: string;
}

interface PayoutConfig {
  configured: boolean;
  payout_method?: string;
  momo_phone?: string;
  momo_name?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  bank_branch?: string;
}

const METHOD_LABELS: Record<string, string> = {
  mtn_momo: "MTN MoMo",
  airtel_money: "Airtel Money",
  bank_transfer: "Bank Transfer",
};

const METHOD_COLORS: Record<string, string> = {
  mtn_momo: "bg-yellow-400 text-black",
  airtel_money: "bg-red-500 text-white",
  bank_transfer: "bg-slate-700 text-white",
};

// ── Payout Settings Tab ────────────────────────────────────────────────────────
function PayoutSettings() {
  const queryClient = useQueryClient();
  const [method, setMethod] = useState<string>("mtn_momo");
  const [form, setForm] = useState({
    momo_phone: "",
    momo_name: "",
    bank_name: "",
    bank_account_number: "",
    bank_account_name: "",
    bank_branch: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // React Query v5 — no onSuccess in useQuery, use useEffect on data instead
  const { data: config, isLoading } = useQuery<PayoutConfig>({
    queryKey: ["payout-config"],
    queryFn: async () => {
      const res = await apiClient.provider.earnings.getPayoutConfig();
      const data = res.data as any;
      return data?.data ?? data ?? { configured: false };
    },
  });

  // Populate form when config loads
  const [hydrated, setHydrated] = useState(false);
  if (config?.configured && config.payout_method && !hydrated) {
    setHydrated(true);
    setMethod(config.payout_method);
    setForm({
      momo_phone: config.momo_phone ?? "",
      momo_name: config.momo_name ?? "",
      bank_name: config.bank_name ?? "",
      bank_account_number: config.bank_account_number ?? "",
      bank_account_name: config.bank_account_name ?? "",
      bank_branch: config.bank_branch ?? "",
    });
  }

  // Client-side validation — returns error map or null if valid
  const validate = (): Record<string, string> | null => {
    const errors: Record<string, string> = {};
    if (method === "mtn_momo" || method === "airtel_money") {
      if (!form.momo_phone.trim())
        errors.momo_phone = "Phone number is required";
      else if (!/^0[0-9]{9}$/.test(form.momo_phone.replace(/\s/g, "")))
        errors.momo_phone = "Enter a valid Rwandan phone number (e.g. 0781234567)";
      if (!form.momo_name.trim())
        errors.momo_name = "Account holder name is required";
    } else if (method === "bank_transfer") {
      if (!form.bank_name.trim())
        errors.bank_name = "Bank name is required";
      if (!form.bank_account_number.trim())
        errors.bank_account_number = "Account number is required";
      if (!form.bank_account_name.trim())
        errors.bank_account_name = "Account holder name is required";
    }
    return Object.keys(errors).length > 0 ? errors : null;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = { payout_method: method };
      if (method === "mtn_momo" || method === "airtel_money") {
        payload.momo_phone = form.momo_phone.replace(/\s/g, "");
        payload.momo_name = form.momo_name.trim();
      } else {
        payload.bank_name = form.bank_name.trim();
        payload.bank_account_number = form.bank_account_number.trim();
        payload.bank_account_name = form.bank_account_name.trim();
        if (form.bank_branch.trim()) payload.bank_branch = form.bank_branch.trim();
      }
      return apiClient.provider.earnings.savePayoutConfig(payload);
    },
    onSuccess: () => {
      toast.success("Payout method saved successfully");
      setFieldErrors({});
      queryClient.invalidateQueries({ queryKey: ["payout-config"] });
    },
    onError: (err: any) => {
      // err.message is already the extracted `detail` string from the interceptor
      const msg = err.message || "Failed to save payout method";
      toast.error(msg);
    },
  });

  const handleSave = () => {
    const errors = validate();
    if (errors) {
      setFieldErrors(errors);
      // Show the first error as a toast too
      toast.error(Object.values(errors)[0]);
      return;
    }
    setFieldErrors({});
    saveMutation.mutate();
  };

  const f = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (fieldErrors[field]) {
      setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-xl">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-8">
      {/* Current config banner */}
      {config?.configured && (
        <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-800">Payout method configured</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              {METHOD_LABELS[config.payout_method ?? ""] ?? config.payout_method}
              {config.momo_phone && ` · ${config.momo_phone}`}
              {config.bank_account_number && ` · ${config.bank_account_number}`}
            </p>
          </div>
        </div>
      )}

      {/* Method selector */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Select Payout Method
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "mtn_momo", label: "MTN MoMo", icon: "📱" },
            { id: "airtel_money", label: "Airtel Money", icon: "📲" },
            { id: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
          ].map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => { setMethod(m.id); setFieldErrors({}); }}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                method === m.id
                  ? "border-[#668c65] bg-[#668c65]/5 text-[#668c65]"
                  : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
              )}
            >
              <span className="text-2xl">{m.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* Mobile Money fields */}
      {(method === "mtn_momo" || method === "airtel_money") && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Phone Number <span className="text-rose-400">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={form.momo_phone}
                onChange={e => f("momo_phone", e.target.value)}
                placeholder="0781234567"
                className={cn(
                  "pl-11 h-12 rounded-2xl bg-slate-50 border-none",
                  fieldErrors.momo_phone && "ring-2 ring-rose-300 bg-rose-50"
                )}
              />
            </div>
            {fieldErrors.momo_phone && (
              <p className="text-xs text-rose-500 font-medium px-1">{fieldErrors.momo_phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Account Holder Name <span className="text-rose-400">*</span>
            </Label>
            <Input
              value={form.momo_name}
              onChange={e => f("momo_name", e.target.value)}
              placeholder="Full name as registered on MoMo"
              className={cn(
                "h-12 rounded-2xl bg-slate-50 border-none",
                fieldErrors.momo_name && "ring-2 ring-rose-300 bg-rose-50"
              )}
            />
            {fieldErrors.momo_name && (
              <p className="text-xs text-rose-500 font-medium px-1">{fieldErrors.momo_name}</p>
            )}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              The name must match your registered {METHOD_LABELS[method]} account exactly.
            </p>
          </div>
        </div>
      )}

      {/* Bank Transfer fields */}
      {method === "bank_transfer" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Bank Name <span className="text-rose-400">*</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={form.bank_name}
                onChange={e => f("bank_name", e.target.value)}
                placeholder="e.g. Bank of Kigali"
                className={cn(
                  "pl-11 h-12 rounded-2xl bg-slate-50 border-none",
                  fieldErrors.bank_name && "ring-2 ring-rose-300 bg-rose-50"
                )}
              />
            </div>
            {fieldErrors.bank_name && (
              <p className="text-xs text-rose-500 font-medium px-1">{fieldErrors.bank_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Account Number <span className="text-rose-400">*</span>
            </Label>
            <Input
              value={form.bank_account_number}
              onChange={e => f("bank_account_number", e.target.value)}
              placeholder="Account number"
              className={cn(
                "h-12 rounded-2xl bg-slate-50 border-none",
                fieldErrors.bank_account_number && "ring-2 ring-rose-300 bg-rose-50"
              )}
            />
            {fieldErrors.bank_account_number && (
              <p className="text-xs text-rose-500 font-medium px-1">{fieldErrors.bank_account_number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Account Holder Name <span className="text-rose-400">*</span>
            </Label>
            <Input
              value={form.bank_account_name}
              onChange={e => f("bank_account_name", e.target.value)}
              placeholder="Full name as on bank account"
              className={cn(
                "h-12 rounded-2xl bg-slate-50 border-none",
                fieldErrors.bank_account_name && "ring-2 ring-rose-300 bg-rose-50"
              )}
            />
            {fieldErrors.bank_account_name && (
              <p className="text-xs text-rose-500 font-medium px-1">{fieldErrors.bank_account_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Branch <span className="text-slate-300">(optional)</span>
            </Label>
            <Input
              value={form.bank_branch}
              onChange={e => f("bank_branch", e.target.value)}
              placeholder="e.g. Kigali City Tower"
              className="h-12 rounded-2xl bg-slate-50 border-none"
            />
          </div>
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={saveMutation.isPending}
        className="h-12 px-10 rounded-2xl bg-[#668c65] hover:bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-50"
      >
        {saveMutation.isPending ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </div>
        ) : (
          <>
            <Settings className="w-4 h-4 mr-2" />
            Save Payout Method
          </>
        )}
      </Button>
    </div>
  );
}

// ── Withdraw Modal ─────────────────────────────────────────────────────────────
function WithdrawModal({
  available,
  config,
  onClose,
}: {
  available: number;
  config: PayoutConfig | undefined;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      return apiClient.provider.earnings.requestWithdrawal(Number(amount));
    },
    onSuccess: () => {
      toast.success("Withdrawal request submitted! Admin will process it within 1–2 business days.");
      queryClient.invalidateQueries({ queryKey: ["earnings-summary"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawal-history"] });
      onClose();
    },
    onError: (err: any) => toast.error(err.message || "Withdrawal failed"),
  });

  const isValid =
    Number(amount) > 0 &&
    Number(amount) <= available &&
    config?.configured;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md rounded-[2rem] border-none p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4 border-b border-slate-50">
          <DialogTitle className="text-2xl font-serif italic text-slate-900">
            Request Withdrawal
          </DialogTitle>
        </DialogHeader>

        <div className="p-8 space-y-6">
          {/* Available balance */}
          <div className="p-5 bg-[#668c65]/5 border border-[#668c65]/10 rounded-2xl">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#668c65] mb-1">
              Available Balance
            </p>
            <p className="text-3xl font-black text-[#668c65]">
              {available.toLocaleString()} <span className="text-sm font-normal opacity-60">RWF</span>
            </p>
          </div>

          {/* Payout method */}
          {config?.configured ? (
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black", METHOD_COLORS[config.payout_method ?? ""] ?? "bg-slate-200 text-slate-600")}>
                {config.payout_method === "bank_transfer" ? "🏦" : "📱"}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {METHOD_LABELS[config.payout_method ?? ""] ?? config.payout_method}
                </p>
                <p className="text-xs text-slate-400">
                  {config.momo_phone ?? config.bank_account_number ?? "—"}
                  {config.momo_name && ` · ${config.momo_name}`}
                  {config.bank_account_name && ` · ${config.bank_account_name}`}
                </p>
              </div>
              <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <p className="text-sm text-rose-700">
                No payout method configured. Go to <strong>Payout Settings</strong> tab first.
              </p>
            </div>
          )}

          {/* Amount input */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Amount to Withdraw
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">RWF</span>
              <Input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                max={available}
                className="pl-14 h-14 rounded-2xl bg-slate-50 border-none text-lg font-bold"
              />
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
              <span>Min: 5,000 RWF</span>
              <button
                type="button"
                onClick={() => setAmount(String(available))}
                className="text-[#668c65] hover:underline"
              >
                Max: {available.toLocaleString()} RWF
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl border-slate-100 font-bold uppercase text-[10px] tracking-widest"
            >
              Cancel
            </Button>
            <Button
              onClick={() => withdrawMutation.mutate()}
              disabled={!isValid || withdrawMutation.isPending}
              className="flex-1 h-12 rounded-2xl bg-[#668c65] hover:bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest disabled:opacity-50 transition-all"
            >
              {withdrawMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </div>
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4 mr-2" />
                  Request Withdrawal
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function ProviderEarnings() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const { data: events = [] } = useEvents();

  const { data: summary, isLoading: summaryLoading } = useQuery<EarningSummary>({
    queryKey: ["earnings-summary"],
    queryFn: async () => {
      const res = await apiClient.provider.earnings.getSummary();
      return res.data as any;
    },
  });

  const { data: earnings = [], isLoading: earningsLoading } = useQuery<Earning[]>({
    queryKey: ["earnings-details"],
    queryFn: async () => {
      const res = await apiClient.provider.earnings.getDetails();
      const data = res.data as any;
      return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    },
  });

  const { data: withdrawalHistory = [] } = useQuery({
    queryKey: ["withdrawal-history"],
    queryFn: async () => {
      const res = await apiClient.provider.earnings.getPayments();
      const data = res.data as any;
      return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    },
  });

  const { data: payoutConfig } = useQuery<PayoutConfig>({
    queryKey: ["payout-config"],
    queryFn: async () => {
      const res = await apiClient.provider.earnings.getPayoutConfig();
      const data = res.data as any;
      return data?.data ?? data ?? { configured: false };
    },
  });

  const available = summary?.available_for_withdrawal ?? 0;

  // Chart data
  const chartData = (() => {
    const months: Record<string, number> = {};
    earnings.forEach((e: Earning) => {
      const month = new Date(e.created_at).toLocaleString("default", { month: "short" });
      months[month] = (months[month] || 0) + Number(e.amount);
    });
    return Object.entries(months).map(([label, amount]) => ({ label, amount }));
  })();

  const totalEventRevenue = (events as Event[]).reduce((s, e) => s + e.total_revenue, 0);
  const totalTicketsSold = (events as Event[]).reduce((s, e) => s + e.tickets_sold, 0);

  if (summaryLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-[2rem]" />)}
        </div>
        <Skeleton className="h-64 rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-serif italic text-slate-900">My Earnings</h2>
          <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em] mt-1">
            You receive 90% of every payment
          </p>
        </div>
        <Button
          onClick={() => setShowWithdrawModal(true)}
          disabled={available <= 0}
          className="h-12 px-8 rounded-2xl bg-[#668c65] hover:bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#668c65]/20 transition-all gap-2 disabled:opacity-40"
        >
          <ArrowDownToLine className="w-4 h-4" />
          Withdraw Funds
          {available > 0 && (
            <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-[9px]">
              {available.toLocaleString()} RWF
            </span>
          )}
        </Button>
      </div>

      <Tabs defaultValue="services" className="space-y-8">
        <TabsList className="bg-white border border-slate-100 rounded-2xl h-auto p-1 shadow-sm w-fit">
          {[
            { id: "services", label: "Service Bookings" },
            { id: "events", label: "Event Tickets" },
            { id: "withdrawals", label: "Withdrawal History" },
            { id: "settings", label: "Payout Settings" },
          ].map(t => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="rounded-xl text-[10px] font-black uppercase tracking-widest py-3 px-6 data-[state=active]:bg-[#668c65] data-[state=active]:text-white transition-all"
            >
              {t.id === "settings" && <Settings className="w-3.5 h-3.5 mr-1.5" />}
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Service Bookings ── */}
        <TabsContent value="services" className="space-y-8 mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Earned (90%)", value: summary?.total_earnings ?? 0, icon: TrendingUp, color: "text-[#668c65]" },
              { label: "Completed", value: summary?.completed_earnings ?? 0, icon: DollarSign, color: "text-emerald-700" },
              { label: "Pending Payout", value: summary?.pending_earnings ?? 0, icon: Clock, color: "text-amber-600" },
              { label: "Available", value: available, icon: Wallet, color: "text-blue-600" },
            ].map((s, i) => (
              <Card key={i} className="border-none shadow-sm rounded-[2rem] bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                  </div>
                  <p className={`text-2xl font-bold tracking-tight ${s.color}`}>
                    {Number(s.value).toLocaleString()} <span className="text-xs font-normal text-slate-400">RWF</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {chartData.length > 0 && (
            <Card className="border-none shadow-sm rounded-[2rem] bg-white">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-serif italic text-slate-900">Earnings History</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} RWF`, "Your Payout"]} />
                    <Bar dataKey="amount" fill="#668c65" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-sm rounded-[2rem] bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-serif italic text-slate-900">Payment History</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {earningsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
                </div>
              ) : earnings.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {earnings.slice(0, 10).map((e: Earning) => (
                    <div key={e.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          Booking {e.booking_id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                          {new Date(e.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-[9px] font-bold uppercase ${e.status === "completed" ? "text-emerald-600 border-emerald-200" : "text-amber-600 border-amber-200"}`}>
                          {e.status}
                        </Badge>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">{Number(e.amount).toLocaleString()} RWF</p>
                          {e.gross_amount && (
                            <p className="text-[9px] text-slate-400">Gross: {Number(e.gross_amount).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Event Tickets ── */}
        <TabsContent value="events" className="space-y-8 mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Total Event Revenue (90%)", value: totalEventRevenue * 0.9, icon: TrendingUp },
              { label: "Tickets Sold", value: totalTicketsSold, icon: Ticket, isCount: true },
              { label: "Total Events", value: (events as Event[]).length, icon: Calendar, isCount: true },
            ].map((s, i) => (
              <Card key={i} className="border-none shadow-sm rounded-[2rem] bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <s.icon className="w-5 h-5 text-[#668c65]" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-slate-900">
                    {s.isCount ? s.value : `${Math.round(Number(s.value)).toLocaleString()} RWF`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-none shadow-sm rounded-[2rem] bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-serif italic text-slate-900">Sales By Event</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {(events as Event[]).length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No events hosted yet</p>
              ) : (
                <div className="space-y-3">
                  {(events as Event[]).map(e => (
                    <div key={e.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/80 rounded-2xl gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{e.title}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                          {new Date(e.event_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tickets</p>
                          <p className="text-xs font-bold text-slate-700">{e.tickets_sold} / {e.capacity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Your Payout (90%)</p>
                          <p className="text-sm font-bold text-[#668c65]">
                            {Math.round(Number(e.total_revenue) * 0.9).toLocaleString()} RWF
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Withdrawal History ── */}
        <TabsContent value="withdrawals" className="space-y-6 mt-0 focus-visible:outline-none">
          <Card className="border-none shadow-sm rounded-[2rem] bg-white">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-serif italic text-slate-900">Withdrawal Requests</CardTitle>
                <Button
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={available <= 0}
                  size="sm"
                  className="h-10 px-6 rounded-2xl bg-[#668c65] hover:bg-slate-900 text-white font-black uppercase text-[9px] tracking-widest gap-1.5 disabled:opacity-40"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  New Request
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {(withdrawalHistory as any[]).length === 0 ? (
                <div className="py-12 text-center">
                  <Wallet className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-serif italic">No withdrawal requests yet.</p>
                  {available > 0 && (
                    <p className="text-sm text-slate-400 mt-1">
                      You have {available.toLocaleString()} RWF available to withdraw.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {(withdrawalHistory as any[]).map((w: any) => (
                    <div key={w.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {Number(w.amount).toLocaleString()} RWF
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {w.payout_method && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                              {METHOD_LABELS[w.payout_method] ?? w.payout_method}
                            </span>
                          )}
                          {w.payout_account && (
                            <span className="text-[9px] text-slate-400">· {w.payout_account}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(w.requested_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] font-black uppercase tracking-widest rounded-full px-3 border",
                          w.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          w.status === "approved" ? "bg-blue-50 text-blue-700 border-blue-100" :
                          w.status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-100" :
                          "bg-amber-50 text-amber-700 border-amber-100"
                        )}
                      >
                        {w.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Payout Settings ── */}
        <TabsContent value="settings" className="mt-0 focus-visible:outline-none">
          <Card className="border-none shadow-sm rounded-[2rem] bg-white">
            <CardHeader className="p-8 pb-4 border-b border-slate-50">
              <CardTitle className="text-xl font-serif italic text-slate-900">Payout Settings</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Configure where you want to receive your earnings. This will be used for all withdrawal requests.
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <PayoutSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          available={available}
          config={payoutConfig}
          onClose={() => setShowWithdrawModal(false)}
        />
      )}
    </div>
  );
}

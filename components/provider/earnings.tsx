"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Wallet, CreditCard, Clock, Download } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";

interface EarningSummary {
  total_earnings: number;
  pending_earnings: number;
  completed_earnings: number;
  available_for_withdrawal: number;
}

interface Earning {
  id: string;
  booking_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export function ProviderEarnings() {
  const queryClient = useQueryClient();
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { data: summary, isLoading: summaryLoading } = useQuery<EarningSummary>({
    queryKey: ["earnings-summary"],
    queryFn: async () => {
      const res = await axiosInstance.get<EarningSummary>("/api/v1/provider/earnings/summary");
      return res.data;
    },
  });

  const { data: earnings = [], isLoading: earningsLoading } = useQuery<Earning[]>({
    queryKey: ["earnings-details"],
    queryFn: async () => {
      const res = await axiosInstance.get<Earning[]>("/api/v1/provider/earnings/details");
      return res.data ?? [];
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      return axiosInstance.post("/api/v1/provider/earnings/withdraw", { amount });
    },
    onSuccess: () => {
      toast.success("Withdrawal request submitted");
      queryClient.invalidateQueries({ queryKey: ["earnings-summary"] });
      setWithdrawAmount("");
    },
    onError: (err: any) => toast.error(err.message || "Withdrawal failed"),
  });

  // Build a simple monthly chart from earnings data
  const chartData = (() => {
    const months: Record<string, number> = {};
    earnings.forEach(e => {
      const month = new Date(e.created_at).toLocaleString("default", { month: "short" });
      months[month] = (months[month] || 0) + Number(e.amount);
    });
    return Object.entries(months).map(([label, amount]) => ({ label, amount }));
  })();

  if (summaryLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-[2rem]" />)}
        </div>
        <Skeleton className="h-64 rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-4xl font-serif italic text-slate-900">Earnings</h2>
        <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em] mt-1">Revenue Overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Earned", value: summary?.total_earnings ?? 0, icon: TrendingUp, color: "text-sage-700" },
          { label: "Completed", value: summary?.completed_earnings ?? 0, icon: DollarSign, color: "text-emerald-700" },
          { label: "Pending", value: summary?.pending_earnings ?? 0, icon: Clock, color: "text-amber-600" },
          { label: "Available", value: summary?.available_for_withdrawal ?? 0, icon: Wallet, color: "text-blue-600" },
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

      {/* Chart */}
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
                <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} RWF`, "Earnings"]} />
                <Bar dataKey="amount" fill="#668c65" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Withdrawal */}
      {(summary?.available_for_withdrawal ?? 0) > 0 && (
        <Card className="border-none shadow-sm rounded-[2rem] bg-white">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-serif italic text-slate-900">Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">RWF</span>
              <input
                type="number"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                placeholder="Amount"
                className="w-full h-12 pl-14 pr-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sage-500/20"
              />
            </div>
            <Button
              onClick={() => withdrawMutation.mutate(Number(withdrawAmount))}
              disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || withdrawMutation.isPending}
              className="h-12 rounded-2xl bg-[#668c65] text-white hover:bg-sage-700 px-8 font-bold uppercase text-[10px] tracking-widest"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent transactions */}
      <Card className="border-none shadow-sm rounded-[2rem] bg-white">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-serif italic text-slate-900">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          {earningsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          ) : earnings.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {earnings.slice(0, 10).map(e => (
                <div key={e.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Booking {e.booking_id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                      {new Date(e.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`text-[9px] font-bold uppercase ${e.status === "completed" ? "text-emerald-600 border-emerald-200" : "text-amber-600 border-amber-200"}`}>
                      {e.status}
                    </Badge>
                    <p className="font-bold text-slate-800">{Number(e.amount).toLocaleString()} RWF</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

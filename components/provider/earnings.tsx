"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance, apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Wallet, CreditCard, Clock, Download, Calendar, Ticket } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";
import { useEvents } from "@/hooks/useEvents";
import { Event } from "@/lib/api/events";

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

  const { data: events = [], isLoading: eventsLoading } = useEvents();

  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      return apiClient.provider.earnings.requestWithdrawal(amount);
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

  const eventChartData = (() => {
    const months: Record<string, number> = {};
    events.forEach((e: Event) => {
      if (e.total_revenue > 0) {
        const month = new Date(e.event_date).toLocaleString("default", { month: "short" });
        months[month] = (months[month] || 0) + Number(e.total_revenue);
      }
    });
    return Object.entries(months).map(([label, amount]) => ({ label, amount }));
  })();

  const totalEventRevenue = events.reduce((sum: number, e: Event) => sum + e.total_revenue, 0);
  const totalTicketsSold = events.reduce((sum: number, e: Event) => sum + e.tickets_sold, 0);

  if (summaryLoading || eventsLoading) {
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
        <h2 className="text-4xl font-serif italic text-slate-900">My Earnings</h2>
        <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em] mt-1">See how much you've made so far</p>
      </div>

      <Tabs defaultValue="services" className="space-y-8">
        <TabsList className="bg-white border text-slate-500 rounded-2xl h-auto p-1 shadow-sm">
          <TabsTrigger 
            value="services" 
            className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest py-3 data-[state=active]:bg-[#668c65] data-[state=active]:text-white transition-all"
          >
            Service Bookings
          </TabsTrigger>
          <TabsTrigger 
            value="events" 
            className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest py-3 data-[state=active]:bg-[#668c65] data-[state=active]:text-white transition-all"
          >
            Event Tickets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-8 mt-0 focus-visible:outline-none">
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
                <CardTitle className="text-xl font-serif italic text-slate-900">Withdraw Money</CardTitle>
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
              <CardTitle className="text-xl font-serif italic text-slate-900">Payment History</CardTitle>
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
        </TabsContent>

        <TabsContent value="events" className="space-y-8 mt-0 focus-visible:outline-none">
          {/* Event Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm rounded-[2rem] bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-[#668c65]" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Event Revenue</p>
                </div>
                <p className="text-2xl font-bold tracking-tight text-slate-900">
                  {totalEventRevenue.toLocaleString()} <span className="text-xs font-normal text-slate-400">RWF</span>
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-[2rem] bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Ticket className="w-5 h-5 text-[#668c65]" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tickets Sold</p>
                </div>
                <p className="text-2xl font-bold tracking-tight text-slate-900">
                  {totalTicketsSold.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-[2rem] bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-[#668c65]" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Events</p>
                </div>
                <p className="text-2xl font-bold tracking-tight text-slate-900">
                  {events.length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Event Chart */}
          {eventChartData.length > 0 && (
            <Card className="border-none shadow-sm rounded-[2rem] bg-white">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-serif italic text-slate-900">Event Sales History</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={eventChartData}>
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} RWF`, "Revenue"]} />
                    <Bar dataKey="amount" fill="#668c65" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Event List */}
          <Card className="border-none shadow-sm rounded-[2rem] bg-white">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-serif italic text-slate-900">Sales By Event</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {events.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No events hosted yet</p>
              ) : (
                <div className="space-y-3">
                  {events.map((e: Event) => (
                    <div key={e.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/80 rounded-2xl gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{e.title}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                          {new Date(e.event_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-6 justify-between sm:justify-end">
                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-[#668c65]">Tickets</p>
                          <p className="text-xs font-bold text-slate-700">{e.tickets_sold} / {e.capacity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-[#668c65]">Revenue</p>
                          <p className="text-sm font-bold text-slate-900">{Number(e.total_revenue).toLocaleString()} RWF</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

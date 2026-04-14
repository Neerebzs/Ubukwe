"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, UserCheck, Calendar, DollarSign, Clock,
  AlertCircle, ArrowRight, CheckCircle, XCircle,
  BookOpen, ShieldAlert, UserPlus, TrendingUp,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { StatCard } from "./stat-card";
import { cn } from "@/lib/utils";

interface AdminOverviewProps {
  // Optional — component fetches its own data but accepts overrides
  platformStats?: any;
  recentActivity?: any[];
  isLoading?: boolean;
  onTabChange?: (tab: string) => void;
}

const ACTIVITY_ICONS: Record<string, any> = {
  booking:      BookOpen,
  dispute:      ShieldAlert,
  verification: UserPlus,
  onboarding:   UserCheck,
};

const ACTIVITY_COLORS: Record<string, string> = {
  booking:      "bg-blue-50 text-blue-600",
  dispute:      "bg-rose-50 text-rose-600",
  verification: "bg-amber-50 text-amber-600",
  onboarding:   "bg-[#608d64]/10 text-[#608d64]",
};

const STATUS_COLORS: Record<string, string> = {
  completed:  "bg-emerald-50 text-emerald-700 border-emerald-100",
  pending:    "bg-amber-50 text-amber-700 border-amber-100",
  confirmed:  "bg-blue-50 text-blue-700 border-blue-100",
  open:       "bg-slate-50 text-slate-600 border-slate-100",
  resolved:   "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected:   "bg-rose-50 text-rose-700 border-rose-100",
};

export function AdminOverview({ onTabChange }: AdminOverviewProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  // ── Platform stats ─────────────────────────────────────────────────────────
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-platform-stats"],
    queryFn: async () => {
      const res = await apiClient.admin.stats.get();
      return res.data as any;
    },
    refetchInterval: 60_000,
  });

  // ── Recent activity ────────────────────────────────────────────────────────
  const { data: activityRaw = [], isLoading: activityLoading } = useQuery({
    queryKey: ["admin-recent-activity"],
    queryFn: async () => {
      const res = await apiClient.admin.stats.getRecentActivity(10);
      const data = res.data as any;
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 30_000,
  });

  // ── Pending onboarding applications ───────────────────────────────────────
  const { data: pendingOnboarding = [], isLoading: onboardingLoading } = useQuery({
    queryKey: ["admin-pending-onboarding"],
    queryFn: async () => {
      const res = await apiClient.admin.onboarding.getAll("pending");
      const data = res.data as any;
      // Backend returns { data: [...] } or array directly
      const list = Array.isArray(data?.data) ? data.data
        : Array.isArray(data?.onboarding) ? data.onboarding
        : Array.isArray(data) ? data : [];
      return list.slice(0, 5); // show top 5
    },
    refetchInterval: 60_000,
  });

  // ── Growth chart ───────────────────────────────────────────────────────────
  const { data: chartData = [] } = useQuery({
    queryKey: ["admin-growth-chart"],
    queryFn: async () => {
      const [usersRes, revenueRes] = await Promise.all([
        apiClient.admin.stats.getUserAnalytics(),
        apiClient.admin.stats.getRevenueAnalytics("monthly"),
      ]);
      const usersArr: any[] = (usersRes.data as any) ?? [];
      const revArr: any[] = (revenueRes.data as any) ?? [];

      const usersMap: Record<string, number> = {};
      usersArr.forEach((d: any) => { usersMap[d.month ?? ""] = d.total ?? 0; });

      const revMap: Record<string, number> = {};
      revArr.forEach((d: any) => { revMap[d.period ?? d.month ?? ""] = d.revenue ?? 0; });

      const now = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return {
          name: d.toLocaleString("default", { month: "short" }),
          users: usersMap[key] ?? 0,
          revenue: revMap[key] ?? 0,
        };
      });
    },
    staleTime: 5 * 60_000,
  });

  const stats = {
    totalUsers:       statsData?.totalUsers       ?? 0,
    activeProviders:  statsData?.activeProviders  ?? 0,
    totalBookings:    statsData?.totalBookings     ?? 0,
    monthlyRevenue:   statsData?.monthlyRevenue    ?? 0,
    pendingApprovals: statsData?.pendingApprovals  ?? 0,
    pendingOnboarding:statsData?.pendingOnboarding ?? 0,
    activeDisputes:   statsData?.activeDisputes    ?? 0,
  };

  const activity = activityRaw.map((a: any, i: number) => ({
    id: a.entityId ?? i,
    type: a.type ?? "booking",
    user: a.userId ? a.userId.slice(0, 8).toUpperCase() : "SYS",
    action: a.action ?? "",
    time: a.timestamp
      ? new Date(a.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "",
    status: a.status ?? "pending",
  }));

  const isLoading = statsLoading || activityLoading;

  if (isLoading) {
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="space-y-3">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-4 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-[2rem]" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[380px] rounded-[2rem]" />
          <div className="space-y-6">
            <Skeleton className="h-[180px] rounded-[2rem]" />
            <Skeleton className="h-[180px] rounded-[2rem]" />
          </div>
        </div>
        <Skeleton className="h-[300px] rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-serif italic text-slate-900 tracking-tight">Platform Intel</h1>
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-[#608d64]/60" />
          <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">
            Real-time Ecosystem Overview
          </p>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Users"       value={stats.totalUsers}      icon={Users}     trend="+12%" />
        <StatCard label="Active Providers"  value={stats.activeProviders} icon={UserCheck} trend="+5.4%" />
        <StatCard label="Total Bookings"    value={stats.totalBookings}   icon={Calendar}  trend="+18.2%" />
        <StatCard
          label="Monthly Revenue"
          value={`${stats.monthlyRevenue.toLocaleString()} RWF`}
          icon={DollarSign}
          trend="+22.1%"
        />
      </div>

      {/* Chart + Quick Metrics */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <Card className="lg:col-span-2 border-slate-100 bg-white shadow-none rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-serif italic text-slate-900">Ecosystem Growth</CardTitle>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                  User & Revenue Trends
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] rounded-full px-4 border-[#608d64]/20 text-[#608d64] font-black tracking-widest uppercase">
                Last 7 Months
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[280px]">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.length > 0 ? chartData : [
                    { name: "—", users: 0, revenue: 0 }
                  ]}>
                    <defs>
                      <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#608d64" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#608d64" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }} />
                    <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", fontSize: "12px", fontWeight: 700 }} />
                    <Area type="monotone" dataKey="users" stroke="#608d64" strokeWidth={3} fill="url(#usersGrad)" dot={{ r: 4, fill: "#608d64", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="revenue" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              {!isMounted && (
                <div className="h-full bg-slate-50 rounded-2xl animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending + Disputes */}
        <div className="space-y-6">
          <Card
            className="border-emerald-100 bg-emerald-50/30 shadow-none rounded-[2rem] overflow-hidden cursor-pointer hover:shadow-md transition-all"
            onClick={() => onTabChange?.("providers")}
          >
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-100 rounded-2xl">
                  <Clock className="w-5 h-5 text-[#608d64]" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#608d64] opacity-50" />
              </div>
              <div className="text-5xl font-serif italic text-[#608d64] mb-1">
                {statsLoading ? <Skeleton className="h-12 w-16 rounded-xl" /> : stats.pendingApprovals}
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Pending Approvals
              </p>
              <p className="text-[9px] text-[#608d64] font-bold mt-1">
                {statsLoading ? "Loading..." : stats.pendingOnboarding > 0
                  ? `${stats.pendingOnboarding} onboarding · ${stats.pendingApprovals - stats.pendingOnboarding} verifications`
                  : "Click to review applications"
                }
              </p>
            </CardContent>
          </Card>

          <Card
            className="border-rose-100 bg-rose-50/20 shadow-none rounded-[2rem] overflow-hidden cursor-pointer hover:shadow-md transition-all"
            onClick={() => onTabChange?.("disputes")}
          >
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-rose-100 rounded-2xl">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                </div>
                <ArrowRight className="w-4 h-4 text-rose-400 opacity-50" />
              </div>
              <div className="text-5xl font-serif italic text-rose-500 mb-1">
                {stats.activeDisputes}
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Active Disputes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pending Onboarding Requests — always shown */}
      <Card className="border-slate-100 bg-white shadow-none rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-serif italic text-slate-900">
                Pending Onboarding
              </CardTitle>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                Provider Applications Awaiting Review
              </p>
            </div>
            <Button
              variant="ghost"
              className="text-[10px] font-black text-[#608d64] uppercase tracking-widest rounded-full hover:bg-[#608d64]/5"
              onClick={() => onTabChange?.("providers")}
            >
              View All <ArrowRight className="w-3 h-3 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {onboardingLoading ? (
            <div className="p-8 space-y-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}
            </div>
          ) : pendingOnboarding.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {pendingOnboarding.map((app: any) => (
                <div
                  key={app.id}
                  className="p-6 flex items-center justify-between group hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#608d64]/10 flex items-center justify-center text-[#608d64] font-black text-sm flex-shrink-0">
                      {(app.business_name || app.provider_name || "P")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {app.business_name || app.provider_name || "Provider Application"}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {app.business_type || app.service_category || "Service Provider"}
                        </p>
                        <span className="text-slate-200">·</span>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {app.created_at ? new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-amber-50 text-amber-700 border-amber-100 border rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest">
                      Pending
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white text-[9px] font-black uppercase tracking-widest h-8 px-4 transition-all"
                      onClick={() => onTabChange?.("providers")}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-200 mx-auto mb-3" />
              <p className="font-serif italic text-slate-400 text-lg">No pending applications</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">
                All onboarding requests have been reviewed
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card className="border-slate-100 bg-white shadow-none rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-serif italic text-slate-900">Platform Narrative</CardTitle>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                The Recent Evolution of Ubukwe Hub
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-50">
            {activity.length > 0 ? (
              activity.map((item) => {
                const Icon = ACTIVITY_ICONS[item.type] ?? BookOpen;
                const iconCls = ACTIVITY_COLORS[item.type] ?? "bg-slate-50 text-slate-500";
                const statusCls = STATUS_COLORS[item.status] ?? STATUS_COLORS.pending;
                return (
                  <div
                    key={item.id}
                    className="p-6 flex items-center justify-between group hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0", iconCls)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-slate-900">{item.user}</span>
                          <span className="text-[10px] font-black text-slate-300">·</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.time}</span>
                        </div>
                        <p className="text-sm text-slate-500 font-light">{item.action}</p>
                      </div>
                    </div>
                    <Badge className={cn("rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest border", statusCls)}>
                      {item.status}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="p-16 text-center">
                <p className="text-sm text-slate-400 font-light italic">
                  Waiting for the next movement in the ecosystem...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { StatCard } from "./stat-card";

interface ActivityItem {
  id: number;
  type: string;
  user: string;
  action: string;
  time: string;
  status: string;
}

interface PlatformStats {
  totalUsers: number;
  activeProviders: number;
  totalBookings: number;
  monthlyRevenue: number;
  pendingApprovals: number;
  activeDisputes: number;
}

// Simulated trend data
const trendData = [
  { name: 'Jan', users: 400, revenue: 2400 },
  { name: 'Feb', users: 300, revenue: 1398 },
  { name: 'Mar', users: 200, revenue: 9800 },
  { name: 'Apr', users: 278, revenue: 3908 },
  { name: 'May', users: 189, revenue: 4800 },
  { name: 'Jun', users: 239, revenue: 3800 },
  { name: 'Jul', users: 349, revenue: 4300 },
];

export function AdminOverview({ platformStats, recentActivity }: { platformStats: PlatformStats; recentActivity: ActivityItem[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Editorial Header Section */}
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-4xl font-serif italic text-slate-900 tracking-tight">Platform Intel</h1>
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-[#608d64]/60" />
          <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">Real-time Ecosystem Overview</p>
        </div>
      </div>

      {/* Primary Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Users"
          value={platformStats.totalUsers}
          icon={Users}
          trend="+12%"
        />
        <StatCard
          label="Active Providers"
          value={platformStats.activeProviders}
          icon={UserCheck}
          trend="+5.4%"
        />
        <StatCard
          label="Total Bookings"
          value={platformStats.totalBookings}
          icon={Calendar}
          trend="+18.2%"
        />
        <StatCard
          label="Monthly Revenue"
          value={`${platformStats.monthlyRevenue.toLocaleString()} RWF`}
          icon={DollarSign}
          trend="+22.1%"
        />
      </div>

      {/* Trend Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-100 bg-white shadow-none rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-serif italic text-slate-900">Ecosystem Growth</CardTitle>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Provider & User Registration Trends</p>
              </div>
              <Badge variant="outline" className="text-[10px] rounded-full px-4 border-[#608d64]/20 text-[#608d64] font-black tracking-widest uppercase">Last 7 Months</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[300px] w-full">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                        fontWeight: 700
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#608d64"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#608d64', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-slate-50 rounded-2xl animate-pulse" />
              )}
            </div>

          </CardContent>
        </Card>

        {/* Secondary Metrics Area */}
        <div className="space-y-6">
          <Card className="border-emerald-100 bg-emerald-50/20 shadow-none rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8">
              <div className="p-3 bg-emerald-100 rounded-2xl w-fit mb-4">
                <Clock className="w-5 h-5 text-[#608d64]" />
              </div>
              <CardTitle className="text-xl font-serif italic text-slate-800">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="text-5xl font-serif italic text-[#608d64] mb-2">{platformStats.pendingApprovals}</div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Applications Awaiting Review</p>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white shadow-none rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8">
              <div className="p-3 bg-rose-50 rounded-2xl w-fit mb-4">
                <ArrowDownRight className="w-5 h-5 text-rose-500" />
              </div>
              <CardTitle className="text-xl font-serif italic text-slate-800">Active Disputes</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="text-5xl font-serif italic text-rose-500 mb-2">{platformStats.activeDisputes}</div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urgent Mediation Required</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Platform Narrative (Activity Feed) */}
      <Card className="border-slate-100 bg-white shadow-none rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-serif italic text-slate-900">Platform Narrative</CardTitle>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">The Recent Evolution of Ubukwe Hub</p>
            </div>
            <button className="text-[10px] font-black text-[#608d64] uppercase tracking-widest hover:translate-x-1 transition-transform">
              View All Events &rarr;
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-50">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#608d64] font-black text-xs group-hover:bg-white transition-colors border border-slate-100">
                      {activity.user.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900">{activity.user}</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">•</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activity.time}</span>
                      </div>
                      <p className="text-sm text-slate-500 font-light tracking-tight">{activity.action}</p>
                    </div>
                  </div>
                  <Badge className={`rounded-full px-4 text-[10px] font-black uppercase tracking-widest ${activity.status === "completed"
                    ? "bg-[#608d64]/10 text-[#608d64] border-none shadow-none"
                    : "bg-slate-100 text-slate-500 border-none shadow-none"
                    }`}>
                    {activity.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-16 text-center">
                <p className="text-sm text-slate-400 font-light italic">Waiting for the next movement in the ecosystem...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  DollarSign,
  Users,
  Star,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Briefcase,
  Activity,
  CheckCircle2,
  Loader2,
  Wallet
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { StatCard } from "@/components/admin/stat-card";

interface BookingStats {
  total: number;
  pending: number;
  in_progress: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  rejected: number;
  total_revenue: number;
}

interface RecentBooking {
  id: string;
  customer_name: string;
  service_name: string;
  booking_date: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export function ProviderOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [serviceCount, setServiceCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch booking statistics
        const statsResponse = await apiClient.get<BookingStats>("/api/v1/bookings/provider/statistics/summary");
        setStats(statsResponse.data || null);

        // Fetch recent bookings (limit to 5)
        const bookingsResponse = await apiClient.get<RecentBooking[]>("/api/v1/bookings/provider");
        const bookings = bookingsResponse.data || [];
        setRecentBookings(bookings.slice(0, 5));

        // Fetch provider services count
        const servicesResponse = await apiClient.get("/api/v1/provider/services");
        const services = (servicesResponse as any).data || [];
        setServiceCount(services.length);

      } catch (error) {
        console.error("Error fetching overview data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-sage-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const monthlyEarnings = stats?.total_revenue || 0;
  const totalBookings = stats?.total || 0;
  const averageRating = 4.8; // TODO: Implement rating system

  // Generate trend data from recent bookings (last 7 days)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

    // Count bookings for this day
    const dayBookings = recentBookings.filter(b => {
      const bookingDate = new Date(b.created_at + 'T00:00:00');
      return bookingDate.toDateString() === date.toDateString();
    });

    const bookingsCount = dayBookings.length;
    const revenue = dayBookings.reduce((sum, b) => sum + b.total_amount, 0);

    return {
      name: dayName,
      bookings: bookingsCount,
      revenue: revenue
    };
  });
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-8">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-4xl font-serif italic text-slate-900 tracking-tight">My Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-[#668c65]/60" />
          <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em]">How you're doing right now</p>
        </div>
      </div>

      {/* Primary Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Bookings"
          value={totalBookings}
          icon={Calendar}
          trend="+12%"
          color="#668c65"
          subtitle={`${stats?.pending || 0} waiting for review`}
        />
        <StatCard
          label="Monthly Revenue"
          value={`${monthlyEarnings.toLocaleString()} RWF`}
          icon={Wallet}
          trend="+8.4%"
          color="#668c65"
          subtitle={`From ${stats?.completed || 0} completions`}
        />
        <StatCard
          label="My Rating"
          value={averageRating}
          icon={Star}
          color="#f59e0b"
          subtitle="Customer satisfaction"
        />
        <StatCard
          label="My Services"
          value={serviceCount}
          icon={Briefcase}
          color="#0ea5e9"
          subtitle="Listings currently live"
        />
      </div>

      {/* Trend Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-100 bg-white shadow-none rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-serif italic text-slate-900">My Earnings</CardTitle>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Your recent growth and stats</p>
              </div>
              <Badge variant="outline" className="text-[10px] rounded-full px-4 border-[#668c65]/20 text-[#668c65] font-black tracking-widest uppercase">Last 7 Days</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#668c65" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#668c65" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#668c65"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    dot={{ r: 4, fill: '#668c65', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights Sidebar */}
        <Card className="border-slate-100 bg-slate-900 text-white rounded-[2rem] p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp className="w-48 h-48" />
          </div>
          <div className="relative z-10 space-y-10">
            <div>
              <h4 className="text-2xl font-serif italic mb-2 flex items-center">
                <Activity className="w-5 h-5 mr-3 text-[#608d64]" />
                My Growth
              </h4>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">How quickly you're growing</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">Success Rate</span>
                  <span className="font-black text-[#608d64]">68%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#608d64] rounded-full shadow-[0_0_8px_#608d64]" style={{ width: '68%' }} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">Profile Visits</span>
                  <span className="font-black text-blue-400">+1,420</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" style={{ width: '85%' }} />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-[#668c65]" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">Helpful Tip</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-light italic">"Update your portfolio with 3 new cultural reels to increase engagement by 25%."</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Recent Activity Narrative */}
        <Card className="border-slate-100 bg-white shadow-none rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-serif italic text-slate-900">Recent Activity</CardTitle>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Latest updates on your bookings</p>
              </div>
              <button className="text-[10px] font-black text-[#668c65] uppercase tracking-widest hover:translate-x-1 transition-transform">
                View All &rarr;
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#668c65] font-black text-xs group-hover:bg-white transition-colors border border-slate-100 uppercase">
                        {booking.customer_name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-900">{booking.customer_name}</span>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">•</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {new Date(booking.booking_date + 'T00:00:00').toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-[#668c65] font-serif italic tracking-tight">{booking.service_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-slate-900">{booking.total_amount.toLocaleString()} RWF</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Earnings</p>
                      </div>
                      <Badge className={cn(
                        "rounded-full px-4 text-[10px] font-black uppercase tracking-widest border-none shadow-none",
                        booking.status === "completed" ? "bg-[#668c65]/10 text-[#668c65]" :
                          booking.status === "confirmed" ? "bg-blue-50 text-blue-600" :
                            booking.status === "pending" ? "bg-amber-50 text-amber-600" :
                              "bg-slate-100 text-slate-500"
                      )}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-16 text-center">
                  <p className="text-sm text-slate-300 font-serif italic">Waiting for your first bookings to show up here!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

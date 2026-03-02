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
  Loader2
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
        const statsResponse = await apiClient.get<BookingStats>("/api/v1/bookings/provider/bookings/statistics/summary");
        setStats(statsResponse.data || null);

        // Fetch recent bookings (limit to 5)
        const bookingsResponse = await apiClient.get<RecentBooking[]>("/api/v1/bookings/provider/bookings");
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
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
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
    <div className="space-y-8 pb-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 font-medium">Welcome back! Here's what's happening with your services today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-xl border-slate-200 font-bold text-slate-600">
            Export Report
          </Button>
          <Button size="sm" className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm">
            Manage Services
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white rounded-3xl p-1 group hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Calendar className="h-5 w-5" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] py-0.5">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                12%
              </Badge>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Bookings</p>
              <h3 className="text-3xl font-black text-slate-900">{totalBookings}</h3>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                {stats?.pending || 0} pending, {stats?.confirmed || 0} confirmed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-3xl p-1 group hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <DollarSign className="h-5 w-5" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] py-0.5">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                8.4%
              </Badge>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Earnings</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {monthlyEarnings.toLocaleString()} <span className="text-sm font-bold text-slate-400">RWF</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                From {stats?.completed || 0} completed bookings
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-3xl p-1 group hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl group-hover:bg-yellow-600 group-hover:text-white transition-colors">
                <Star className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className={cn("w-2.5 h-2.5", i <= Math.round(averageRating) ? "text-yellow-400 fill-current" : "text-slate-200")} />)}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Avg. Rating</p>
              <h3 className="text-3xl font-black text-slate-900">{averageRating}</h3>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Based on customer reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-3xl p-1 group hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Briefcase className="h-5 w-5" />
              </div>
              <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] py-0.5">
                Stable
              </Badge>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Active Services</p>
              <h3 className="text-3xl font-black text-slate-900">{serviceCount}</h3>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Services listed on platform</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-3xl p-6">
          <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-extrabold text-slate-900">Performance Trends</CardTitle>
              <CardDescription className="font-medium">Total bookings and revenue over the last 7 days</CardDescription>
            </div>
            <select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-2 py-1 outline-none text-slate-600">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </CardHeader>
          <CardContent className="p-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#0d9488"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                  dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Insights Sidebar */}
        <Card className="border-none shadow-sm bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp className="w-48 h-48" />
          </div>
          <div className="relative z-10 space-y-8">
            <div>
              <h4 className="text-xl font-black mb-2 flex items-center">
                <Activity className="w-5 h-5 mr-3 text-teal-400" />
                Growth Insights
              </h4>
              <p className="text-slate-400 text-sm font-medium">Based on your recent performance metrics.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Booking Conversion</span>
                  <span className="font-black text-teal-400">68%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '68%' }} />
                </div>
                <p className="text-[10px] text-slate-500 font-medium">12% higher than category average</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Profile Visibility</span>
                  <span className="font-black text-blue-400">+1,420</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }} />
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Increased peaks on weekends</p>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <p className="text-xs font-bold text-white">Pro Tip</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">Update your gallery with at least 3 new reels to increase engagement by up to 25%.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Recent Bookings List */}
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-extrabold text-slate-900">Recent Activity</CardTitle>
              <CardDescription className="font-medium">Latest bookings from your clients</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-teal-600 font-bold hover:bg-teal-50">
              View All Bookings
            </Button>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="space-y-3">
              {recentBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No recent bookings</p>
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-teal-200 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-lg group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                        {booking.customer_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-none mb-1">{booking.customer_name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-teal-600">{booking.service_name}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                            <Clock className="w-2.5 h-2.5 mr-1" />
                            {new Date(booking.booking_date + 'T00:00:00').toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="font-black text-slate-900">{booking.total_amount.toLocaleString()} RWF</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Total Fee</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-none",
                            booking.status === "completed" ? "bg-emerald-500 text-white" :
                              booking.status === "confirmed" ? "bg-blue-500 text-white" :
                                booking.status === "in_progress" ? "bg-yellow-500 text-white" :
                                  "bg-slate-200 text-slate-600"
                          )}
                        >
                          {booking.status}
                        </Badge>
                        <Button variant="ghost" size="icon" className="rounded-full text-slate-300 hover:text-slate-600">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

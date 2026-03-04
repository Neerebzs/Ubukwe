"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Download, Calendar, Wallet, CreditCard, Clock, FileText } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { StatCard } from "@/components/admin/stat-card"
import { cn } from "@/lib/utils"

interface ProviderEarningsProps {
  recentCompleted: Array<{
    id: string
    serviceName: string
    customerName: string
    amount: number
    date: string
  }>
}

export function ProviderEarnings({ recentCompleted }: ProviderEarningsProps) {
  // Mock time-series data; replace with API later
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const series = useMemo(() => {
    if (period === "weekly") {
      return [
        { label: "Mon", amount: 45000 },
        { label: "Tue", amount: 52000 },
        { label: "Wed", amount: 48000 },
        { label: "Thu", amount: 61000 },
        { label: "Fri", amount: 55000 },
        { label: "Sat", amount: 67000 },
        { label: "Sun", amount: 42000 },
      ];
    }
    if (period === "monthly") {
      return [
        { label: "Week 1", amount: 210000 },
        { label: "Week 2", amount: 245000 },
        { label: "Week 3", amount: 195000 },
        { label: "Week 4", amount: 280000 },
      ];
    }
    return [
      { label: "Jan", amount: 850000 },
      { label: "Feb", amount: 920000 },
      { label: "Mar", amount: 780000 },
      { label: "Apr", amount: 1100000 },
      { label: "May", amount: 950000 },
      { label: "Jun", amount: 1250000 },
    ];
  }, [period]);

  // Mock data for the new BarChart, derived from 'series' for consistency
  const data = useMemo(() => series.map(item => ({ name: item.label, total: item.amount })), [series]);

  const totalInPeriod = series.reduce((s, p) => s + p.amount, 0);
  const avgPerPoint = Math.round(totalInPeriod / series.length);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-4xl font-serif italic text-slate-900 tracking-tight">Financial Overview</h2>
        <div className="flex items-center gap-2">
          <div className="h-[1px] w-8 bg-[#668c65]/60" />
          <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em]">Revenue & Payout Intelligence</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Cumulative Revenue"
          value="4,250,000 RWF"
          icon={Wallet}
          trend="12.5%"
          trendType="up"
          color="#668c65"
        />
        <StatCard
          label="Pending Clearance"
          value="850,000 RWF"
          icon={Clock}
          trend="8.2%"
          trendType="up"
          color="#6366f1"
        />
        <StatCard
          label="Next Disbursement"
          value="June 15, 2024"
          icon={Calendar}
          color="#f59e0b"
        />
        <StatCard
          label="Active Contracts"
          value="12"
          icon={FileText}
          trend="3"
          trendType="up"
          color="#0ea5e9"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-slate-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-serif italic text-slate-900">Revenue Velocity</CardTitle>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Monthly earnings trajectory</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl border-slate-100 text-[10px] font-black uppercase tracking-widest px-4 h-9">
                <Download className="w-4 h-4 mr-2 text-[#668c65]" />
                Export Data
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={10}
                    fontWeight={900}
                    tickLine={false}
                    axisLine={false}
                    dx={0}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    fontWeight={900}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9', radius: 8 }}
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}
                  />
                  <Bar
                    dataKey="total"
                    fill="#668c65"
                    radius={[8, 8, 8, 8]}
                    barSize={32}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#0b7a6f' : '#668c65'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-slate-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-serif italic text-slate-900">Live Transitions</CardTitle>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time fiscal ledger</p>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <div className="space-y-6">
              {[
                { label: "Wedding MC - June 2024", amount: "+450,000 RWF", date: "June 12, 2024", icon: ArrowUpRight, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Platform Service Fee", amount: "-45,000 RWF", date: "June 12, 2024", icon: ArrowDownRight, color: "text-slate-400", bg: "bg-slate-50" },
                { label: "Deposit - Corporate Gala", amount: "+200,000 RWF", date: "June 10, 2024", icon: ArrowUpRight, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Wedding DJ - May Finish", amount: "+600,000 RWF", date: "June 08, 2024", icon: ArrowUpRight, color: "text-emerald-600", bg: "bg-emerald-50" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-[1rem] transition-colors", item.bg)}>
                      <item.icon className={cn("w-4 h-4", item.color)} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.date}</p>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-[#668c65] transition-colors">{item.label}</p>
                    </div>
                  </div>
                  <div className={cn("text-sm font-black tracking-tight", item.color)}>
                    {item.amount}
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full mt-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#668c65] hover:bg-[#668c65]/5 h-12">
                Audit Full Ledger
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-100 shadow-none rounded-[2rem] overflow-hidden bg-white">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-serif italic text-slate-900">Recent Transactions</CardTitle>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Latest completed services</p>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="space-y-4">
            {recentCompleted.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{booking.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.serviceName} - {booking.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">+{booking.amount.toLocaleString()} RWF</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

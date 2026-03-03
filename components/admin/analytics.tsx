"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "./stat-card";
import { Star } from "lucide-react";

export function AdminAnalytics() {
  const categories = [
    { label: "Traditional Dancers", value: 85, color: "#608d64" },
    { label: "Wedding Venues", value: 78, color: "#0d182b" },
    { label: "Catering Services", value: 71, color: "#94a3b8" },
    { label: "MC Services", value: 64, color: "#cbd5e1" },
  ];

  return (
    <div className="space-y-12 pb-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900 tracking-tight">Platform Intelligence</h2>
          <p className="text-slate-700 mt-2 uppercase tracking-[0.2em] text-xs font-medium">Growth Metrics & Ecosystem Vitality</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#608d64] animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-600">Live Intel Active</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="User Growth"
          value="+15%"
          subtitle="Monthly adoption rate"
          icon="📈"
        />
        <StatCard
          label="Booking Success"
          value="87%"
          subtitle="Completion velocity"
          icon="✨"
        />
        <StatCard
          label="Platform Rating"
          value="4.8"
          subtitle="Ecosystem satisfaction"
          icon="⭐"
        />
        <StatCard
          label="Revenue Velocity"
          value="+18%"
          subtitle="Economic expansion"
          icon="🌿"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 rounded-[2.5rem] border-slate-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="p-10 pb-6 border-b border-slate-50">
            <CardTitle className="text-2xl font-serif italic text-slate-900">Service Category Vitality</CardTitle>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-600">Market Share & Engagement Volumes</p>
          </CardHeader>
          <CardContent className="p-10">
            <div className="space-y-10">
              {categories.map((cat) => (
                <div className="group" key={cat.label}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-serif italic text-slate-900 group-hover:text-[#608d64] transition-colors">{cat.label}</span>
                    <span className="text-xs font-black tracking-widest text-[#608d64]">{cat.value}%</span>
                  </div>
                  <div className="w-full bg-slate-50 rounded-full h-3 overflow-hidden border border-slate-100/50 p-[2px]">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{
                        width: `${cat.value}%`,
                        backgroundColor: cat.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-slate-100 shadow-sm bg-[#0d182b] overflow-hidden text-white">
          <CardHeader className="p-10 pb-6">
            <CardTitle className="text-2xl font-serif italic text-slate-50">Intel Summary</CardTitle>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">Snapshot Overview</p>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-8">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed italic font-serif">
                “The platform ecosystem is experiencing a synchronized expansion across cultural and catering sectors, with a notable velocity in Traditional Dance engagements.”
              </p>
              <div className="h-[1px] w-12 bg-white/20" />
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#608d64]">Strategic Insight</p>
            </div>

            <div className="space-y-6">
              {[
                { label: "Active Nodes", value: "1,248" },
                { label: "Data Integrity", value: "99.9%" },
                { label: "Platform Pulse", value: "Optimal" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400">{item.label}</span>
                  <span className="text-lg font-serif italic text-slate-100">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

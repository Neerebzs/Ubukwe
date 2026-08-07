"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert, Lock, Globe, Activity, AlertTriangle, CheckCircle2, Ban,
} from "lucide-react";

function unwrap(res: any) {
  return res?.data?.data ?? res?.data ?? res;
}

export function AdminSecurity() {
  const [days, setDays] = useState(7);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-security", days],
    queryFn: async () => unwrap(await apiClient.admin.stats.getSecurity(days)),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-slate-500">
          Unable to load security monitoring data.
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { label: "Successful logins today", value: data.logins_today ?? 0, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
    { label: "Failed logins today", value: data.failed_logins_today ?? 0, icon: AlertTriangle, tone: "text-amber-600 bg-amber-50" },
    { label: "Account lock events", value: data.account_lock_events ?? 0, icon: Lock, tone: "text-rose-600 bg-rose-50" },
    { label: "Rate limits triggered", value: data.rate_limit_events ?? 0, icon: Ban, tone: "text-orange-600 bg-orange-50" },
    { label: "CAPTCHA challenges", value: data.captcha_events ?? 0, icon: ShieldAlert, tone: "text-sky-600 bg-sky-50" },
    { label: "Suspicious events", value: data.suspicious_events ?? 0, icon: Activity, tone: "text-violet-600 bg-violet-50" },
    { label: "Blocked IPs (live)", value: data.blocked_ips_live ?? 0, icon: Globe, tone: "text-slate-700 bg-slate-100" },
    { label: "Locked accounts (live)", value: data.locked_accounts_live ?? 0, icon: Lock, tone: "text-slate-700 bg-slate-100" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-slate-900">Security Monitoring</h2>
          <p className="text-sm text-slate-500 mt-1">
            Login protection, brute-force signals, and audit activity
            {data.rate_limit_backend ? ` · limiter: ${data.rate_limit_backend}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {[1, 7, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                days === d
                  ? "bg-[#0d182b] text-white border-[#0d182b]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${s.tone}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Top attacking IPs</CardTitle>
            <CardDescription>Highest failed login volume in the selected window</CardDescription>
          </CardHeader>
          <CardContent>
            {(data.top_attacking_ips?.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No attacking IPs recorded</p>
            ) : (
              <ul className="space-y-3">
                {data.top_attacking_ips.map((row: { ip: string; failures: number }) => (
                  <li key={row.ip} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-slate-700">{row.ip}</span>
                    <Badge variant="secondary">{row.failures} failures</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Login activity trend</CardTitle>
            <CardDescription>Successful vs failed attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 max-h-72 overflow-y-auto">
              {(data.login_trend || []).map((day: { date: string; successful: number; failed: number }) => (
                <li key={day.date} className="flex items-center gap-3 text-sm">
                  <span className="w-24 text-slate-500 font-mono text-xs">{day.date}</span>
                  <div className="flex-1 flex gap-1 h-2 rounded-full overflow-hidden bg-slate-100">
                    <div
                      className="bg-emerald-500"
                      style={{ width: `${Math.min(100, (day.successful / Math.max(1, day.successful + day.failed)) * 100)}%` }}
                    />
                    <div
                      className="bg-rose-400"
                      style={{ width: `${Math.min(100, (day.failed / Math.max(1, day.successful + day.failed)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-20 text-right">
                    {day.successful}/{day.failed}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Recent security events</CardTitle>
          <CardDescription>Failed logins, locks, rate limits, CAPTCHA, and suspicious activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b">
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Event</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">IP</th>
                  <th className="pb-3 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody>
                {(data.recent_events || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">No events yet</td>
                  </tr>
                ) : (
                  data.recent_events.map((e: any) => (
                    <tr key={e.id} className="border-b border-slate-50">
                      <td className="py-3 text-slate-500 whitespace-nowrap font-mono text-xs">
                        {e.created_at?.replace("T", " ").slice(0, 19)}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={e.success ? "secondary" : "destructive"}
                          className="font-mono text-[10px]"
                        >
                          {e.action}
                        </Badge>
                      </td>
                      <td className="py-3 text-slate-700">{e.user_email || "—"}</td>
                      <td className="py-3 font-mono text-xs text-slate-600">{e.ip_address || "—"}</td>
                      <td className="py-3 text-slate-500 max-w-xs truncate">{e.detail || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

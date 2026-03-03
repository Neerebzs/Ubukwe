"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: LucideIcon | string;
    trend?: string;
    trendType?: "up" | "down";
    subtitle?: string;
    color?: string;
    className?: string;
    variant?: "default" | "outline" | "ghost";
}

export function StatCard({
    label,
    value,
    icon: Icon,
    trend,
    trendType = "up",
    subtitle,
    color = "#608d64",
    className = "",
    variant = "default",
}: StatCardProps) {
    const isEmoji = typeof Icon === "string";

    return (
        <Card className={cn(
            "rounded-[2.5rem] border-slate-100 shadow-sm hover:shadow-xl transition-all duration-700 overflow-hidden bg-white group",
            className
        )}>
            <CardContent className="p-8 md:p-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-600 group-hover:text-[#608d64] transition-colors">
                            {label}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {trend && (
                            <div className={cn(
                                "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-tight",
                                trendType === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            )}>
                                {trendType === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {trend}
                            </div>
                        )}
                        {Icon && (
                            <div className={cn(
                                "p-3 rounded-2xl transition-colors duration-500",
                                !isEmoji ? "bg-slate-50 group-hover:bg-[#608d64]/5" : ""
                            )}>
                                {isEmoji ? (
                                    <span className="text-xl">{Icon}</span>
                                ) : (
                                    <Icon className="w-5 h-5 text-slate-600 group-hover:text-[#608d64] transition-colors" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-4xl md:text-5xl font-serif italic text-slate-900 tracking-tight leading-none">
                        {value}
                    </h3>
                    {subtitle && (
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600">{subtitle}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

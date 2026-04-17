"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronDown, ChevronRight, Home, Users, Store, CheckCircle, BookOpen, ShieldAlert, BarChart, LogOut, Calendar, Globe } from "lucide-react";
import Link from "next/link";
import { TranslatedText } from "@/components/translated-text";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AdminMobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  user?: {
    full_name?: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

export function AdminMobileMenuDrawer({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  user,
  onLogout,
}: AdminMobileMenuDrawerProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["overview", "users"]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const menuSections = [
    {
      id: "overview",
      title: "Overview",
      items: [
        { id: "overview", label: "Dashboard", icon: Home },
      ]
    },
    {
      id: "users",
      title: "User Management",
      items: [
        { id: "users", label: "Users", icon: Users },
      ]
    },
    {
      id: "onboarding",
      title: "Provider Management",
      items: [
        { id: "onboarding", label: "Onboarding", icon: Store },
        { id: "approvals", label: "Approvals", icon: CheckCircle },
      ]
    },
    {
      id: "operations",
      title: "Operations",
      items: [
        { id: "bookings", label: "Bookings", icon: BookOpen },
        { id: "events", label: "Events", icon: Calendar },
        { id: "services", label: "Services", icon: ShieldAlert },
        { id: "disputes", label: "Disputes", icon: ShieldAlert },
      ]
    },
    {
      id: "analytics",
      title: "Analytics",
      items: [
        { id: "analytics", label: "Analytics", icon: BarChart },
      ]
    }
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      {/* Drawer */}
      <div className="fixed left-0 top-0 h-full w-[85%] max-w-sm bg-[#0d182b] shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col animate-in slide-in-from-left duration-700 ease-out">
        {/* Editorial Header */}
        <div className="p-8 pb-10 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div className="space-y-1">
            <h2 className="font-serif italic text-3xl text-slate-50 tracking-tight">Admin</h2>
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-4 bg-[#668c65]/50" />
              <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.3em]">Platform Sanctuary</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/50 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {menuSections.map((section) => {
            const isExpanded = expandedSections.includes(section.id);
            
            return (
              <Collapsible
                key={section.id}
                open={isExpanded}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between px-4 py-2 rounded-md hover:bg-white/5 transition-colors">
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.4em]">
                      {section.title}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-white/40" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-white/40" />
                    )}
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-1 mt-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={cn(
                          "relative w-full text-left text-sm px-4 py-3 rounded-2xl transition-all duration-500 flex items-center gap-4",
                          isActive
                            ? "bg-white/10 text-white shadow-2xl shadow-[#668c65]/10 border border-white/10"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-[#668c65] shadow-[0_0_8px_#668c65]" />
                        )}
                        <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors duration-500", isActive ? "text-[#668c65]" : "group-hover:text-white")} />
                        <span className={cn("font-medium tracking-tight", isActive ? "font-bold" : "font-light")}>
                          <TranslatedText text={item.label} />
                        </span>
                      </button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <Link href="/" onClick={onClose}>
              <button
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-white/50 hover:text-white hover:bg-white/5 transition-all group"
                title="Return to Main Site"
              >
                <div className="h-4 w-4 flex-shrink-0 text-[#668c65]/70 group-hover:text-[#668c65] transition-colors">
                  <Globe className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Return to Site</span>
              </button>
            </Link>
          </div>
        </nav>

        {/* User Profile Footer */}
        {user && (
          <div className="p-8 bg-black/20 border-t border-white/5 space-y-4">
            <div className="p-4 rounded-3xl bg-white/5 border border-white/5 shadow-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#668c65]/20 flex items-center justify-center text-sm font-black text-[#668c65] flex-shrink-0 border border-[#668c65]/10">
                {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">
                  {user.full_name || "Admin"}
                </p>
                <p className="text-[10px] text-white/50 font-black uppercase tracking-widest truncate">
                  Curator
                </p>
              </div>
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="p-2 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

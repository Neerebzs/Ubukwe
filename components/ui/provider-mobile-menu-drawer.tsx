"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Home,
  Package,
  BookOpen,
  MessageSquare,
  FileText,
  DollarSign,
  User,
  LogOut,
  Ticket,
  Calendar,
  Globe,
  Star
} from "lucide-react";
import { TranslatedText } from "@/components/translated-text";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ProviderMobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  user?: {
    full_name?: string;
    email: string;
    avatar?: string;
    is_verified?: boolean;
  };
  onLogout?: () => void;
}

export function ProviderMobileMenuDrawer({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  user,
  onLogout,
}: ProviderMobileMenuDrawerProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["overview", "services", "crm", "business"]);

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
      icon: <Home className="w-4 h-4" />,
      items: [
        { id: "overview", label: "Dashboard", icon: Home },
        ...(!user?.is_verified ? [{ id: "onboarding", label: "Onboarding", icon: FileText }] : []),
      ]
    },
    {
      id: "services",
      title: "Services",
      icon: <Package className="w-4 h-4" />,
      items: [
        { id: "services", label: "My Services", icon: Package },
        { id: "events", label: "Events", icon: Calendar },
        { id: "bookings", label: "Bookings", icon: BookOpen },
      ]
    },
    {
      id: "crm",
      title: "My Relationships",
      icon: <MessageSquare className="w-4 h-4" />,
      items: [
        { id: "messages", label: "Messages", icon: MessageSquare },
        { id: "inquiries", label: "Customer Feedback", icon: Star },
        { id: "contracts", label: "Contracts", icon: FileText },
      ]
    },
    {
      id: "business",
      title: "Business",
      icon: <DollarSign className="w-4 h-4" />,
      items: [
        { id: "earnings", label: "Earnings", icon: DollarSign },
        { id: "profile", label: "Profile", icon: User },
      ]
    }
  ];

  const handleTabClick = (tabId: string) => {
    const isTabDisabled = !user?.is_verified && !['overview', 'onboarding'].includes(tabId);
    if (!isTabDisabled) {
      onTabChange(tabId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed left-0 top-0 h-full w-[85%] max-w-sm bg-[#0d182b] shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col animate-in slide-in-from-left duration-700 ease-out">
        {/* Editorial Header */}
        <div className="p-8 pb-10 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div className="space-y-1">
            <h2 className="font-serif italic text-3xl text-slate-50 tracking-tight">Provider</h2>
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-4 bg-[#668c65]/50" />
              <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.3em]">Business Sanctuary</p>
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

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {menuSections.map((section) => {
            const isExpanded = expandedSections.includes(section.id);

            return (
              <div key={section.id} className="space-y-4">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 flex-shrink-0 text-white/60 group-hover:text-[#668c65] transition-colors">
                      {section.icon}
                    </span>
                    <span className="text-[10px] font-black text-white/70 group-hover:text-[#668c65] uppercase tracking-[0.4em] transition-colors">
                      {section.title}
                    </span>
                  </div>
                  <ChevronDown className={cn("h-3 w-3 text-white/40 transition-transform duration-500", !isExpanded && "-rotate-90")} />
                </button>

                {isExpanded && (
                  <div className="space-y-2">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const isTabDisabled = !user?.is_verified && !['overview', 'onboarding'].includes(item.id);

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleTabClick(item.id)}
                          disabled={isTabDisabled}
                          className={cn(
                            "relative w-full text-left text-sm px-4 py-3 rounded-2xl transition-all duration-500 flex items-center gap-4",
                            isActive
                              ? "bg-white/10 text-white shadow-2xl shadow-[#668c65]/10 border border-white/10"
                              : isTabDisabled
                                ? "opacity-20 cursor-not-allowed text-white/50"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <Icon className={cn("h-5 w-5 flex-shrink-0 transition-colors duration-500", isActive ? "text-[#668c65]" : "group-hover:text-white")} />
                          <span className={cn("font-medium tracking-tight", isActive ? "font-bold" : "font-light")}>
                            <TranslatedText text={item.label} />
                          </span>
                          {isActive && (
                            <div className="ml-auto w-1 h-1 rounded-full bg-[#668c65] shadow-[0_0_8px_#668c65]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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
                {user.full_name?.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase() || (user.email?.[0] || '?').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">
                  {user.full_name || "Provider"}
                </p>
                <p className="text-[10px] text-white/50 font-black uppercase tracking-widest truncate">
                  Artisan Collective
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

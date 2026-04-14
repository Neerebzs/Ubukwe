"use client";

import * as React from "react";
import { Calendar, CheckCircle, Star, BookOpen, DollarSign, Home, ChevronLeft, ChevronRight, Users, MessageCircle, Heart, Clock, MapPin, Camera, LogOut, ChevronDown, ShieldAlert, FileText, Sparkles, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
  user?: {
    full_name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

export function DashboardSidebar({ activeTab, onTabChange, userRole = "Customer", isCollapsed = false, onToggle, user, onLogout }: DashboardSidebarProps) {
  const navigationGroups = [
    {
      title: "Overview",
      items: [
        { id: "overview", label: "Dashboard", icon: <Home className="w-4 h-4" /> },
      ]
    },
    {
      title: "Planning",
      items: [
        { id: "budget", label: "Budget", icon: <DollarSign className="w-4 h-4" /> },
        { id: "planning", label: "Planning & Timeline", icon: <CheckCircle className="w-4 h-4" /> },
        { id: "ai-assistant", label: "AI Assistant", icon: <Sparkles className="w-4 h-4" /> },
        { id: "guests", label: "Guest Management", icon: <Users className="w-4 h-4" /> },
      ]
    },
    {
      title: "Services & Vendors",
      items: [
        { id: "vendors", label: "Find Vendors", icon: <Star className="w-4 h-4" /> },
      ]
    },
    {
      title: "Management",
      items: [
        { id: "bookings", label: "My Bookings", icon: <BookOpen className="w-4 h-4" /> },
        { id: "messages", label: "Messages", icon: <MessageCircle className="w-4 h-4" /> },
        { id: "disputes", label: "Disputes", icon: <ShieldAlert className="w-4 h-4" /> },
        { id: "reviews", label: "Reviews", icon: <Star className="w-4 h-4" /> },
      ]
    }
  ];

  const initialExpanded = React.useMemo(() => {
    const state: Record<string, boolean> = {};
    for (const group of navigationGroups) state[group.title] = true;
    return state;
  }, []);

  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>(initialExpanded);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    try {
      const saved = window.localStorage.getItem('dashboardSidebarExpanded');
      if (saved) {
        setExpandedGroups(JSON.parse(saved));
      }
    } catch {
      // Keep initial state
    }
  }, []);

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  React.useEffect(() => {
    if (isClient) {
      try {
        window.localStorage.setItem('dashboardSidebarExpanded', JSON.stringify(expandedGroups));
      } catch { }
    }
  }, [expandedGroups, isClient]);

  const groupIconByTitle: Record<string, React.ReactNode> = {
    "Overview": <Home className="w-4 h-4" />,
    "Planning": <Calendar className="w-4 h-4" />,
    "Services & Vendors": <Star className="w-4 h-4" />,
    "Management": <BookOpen className="w-4 h-4" />,
    "Inspiration": <Heart className="w-4 h-4" />,
  };

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-72'} bg-[#0d182b] border-r border-white/5 h-screen p-6 left-0 fixed transition-all duration-500 z-50 hidden md:flex flex-col overflow-x-hidden`}>
      {/* Editorial Header */}
      <div className="mb-12 flex items-center justify-between flex-shrink-0">
        {!isCollapsed && (
          <div className="space-y-1">
            <h2 className="font-serif italic text-3xl text-slate-50 tracking-tight">Portal</h2>
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-4 bg-[#668c65]/50" />
              <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.3em]">{userRole} Sanctuary</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-2 h-10 w-10 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-all"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-8 scrollbar-hide pr-2">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            {/* Group Title */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className="w-full px-4 flex items-center justify-between group transition-all"
                aria-expanded={expandedGroups[group.title]}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-4 w-4 flex-shrink-0 text-white/60 group-hover:text-[#668c65] transition-colors`}>
                    {groupIconByTitle[group.title]}
                  </span>
                  <span className="text-[10px] font-black text-white/70 group-hover:text-[#668c65] uppercase tracking-[0.4em] transition-colors">
                    {group.title}
                  </span>
                </div>
                <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-500 ${isClient && expandedGroups[group.title] ? '' : '-rotate-90'}`} />
              </button>
            )}

            {/* Group Items */}
            <div className="space-y-2">
              {group.items.map((tab) => {
                const isActive = activeTab === tab.id;
                const content = (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative group w-full text-left text-sm px-4 py-3 rounded-2xl transition-all duration-500 flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'
                      } ${isActive
                        ? 'bg-white/10 text-white shadow-2xl shadow-[#668c65]/10 border border-white/10'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    title={isCollapsed ? tab.label : undefined}
                  >
                    <span className={`h-5 w-5 flex-shrink-0 transition-colors duration-500 ${isActive ? 'text-[#668c65]' : 'group-hover:text-white'}`}>{tab.icon}</span>
                    {!isCollapsed && <span className={`font-medium tracking-tight ${isActive ? 'font-bold' : 'font-light'}`}>{tab.label}</span>}
                    {isActive && !isCollapsed && (
                      <div className="ml-auto w-1 h-1 rounded-full bg-[#668c65] shadow-[0_0_8px_#668c65]" />
                    )}
                  </button>
                );
                if (isCollapsed) return content;
                return isClient && expandedGroups[group.title] ? content : null;
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Sanctuary Area */}
      <div className="flex-shrink-0 pt-8 border-t border-white/5 space-y-4">
        {/* Return to Main Site */}
        <div className={`px-2 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <Link href="/">
            <button
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-white/50 hover:text-white hover:bg-white/5 transition-all group ${isCollapsed ? 'justify-center' : ''}`}
              title="Return to Main Site"
            >
              <Globe className="h-5 w-5 text-[#668c65]/70 group-hover:text-[#668c65]" />
              {!isCollapsed && <span className="font-medium tracking-tight">Return to Site</span>}
            </button>
          </Link>
        </div>

        {user && (
          <div className={`mb-4 ${isCollapsed ? 'px-0 flex justify-center' : 'px-2'}`}>
            {!isCollapsed ? (
              <div className="p-4 rounded-3xl bg-white/5 border border-white/5 shadow-2xl flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-[#668c65]/20 flex items-center justify-center text-sm font-black text-[#668c65] flex-shrink-0 border border-[#668c65]/10">
                  {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">
                    {user.full_name}
                  </p>
                  <p className="text-[10px] text-white/50 font-black uppercase tracking-widest truncate">
                    Collective Member
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#668c65]/20 flex items-center justify-center text-xs font-black text-[#668c65] border border-[#668c65]/10">
                  {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  className="p-3 rounded-full text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

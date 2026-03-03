"use client";

import * as React from "react";
import { Home, Users, Briefcase, BookOpen, ShieldAlert, BarChart3, ChevronLeft, ChevronRight, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminTabsSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
  user?: {
    full_name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
  mobile?: boolean; // when true, render suitable container for mobile overlays
}

export function AdminTabsSidebar({ activeTab, onTabChange, isCollapsed = false, onToggle, user, onLogout, mobile = false }: AdminTabsSidebarProps) {
  const navigationGroups = [
    {
      title: "Overview",
      items: [
        { id: "overview", label: "Dashboard", icon: <Home className="w-4 h-4" /> },
      ]
    },
    {
      title: "User Management",
      items: [
        { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
        { id: "providers", label: "Onboarding", icon: <Briefcase className="w-4 h-4" /> },
      ]
    },
    {
      title: "Platform",
      items: [
        { id: "bookings", label: "Bookings", icon: <BookOpen className="w-4 h-4" /> },
        { id: "services", label: "Services", icon: <ShieldAlert className="w-4 h-4" /> },
        { id: "disputes", label: "Disputes", icon: <ShieldAlert className="w-4 h-4" /> },
        { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
      ]
    }
  ];

  const initialExpanded = React.useMemo(() => {
    const state: Record<string, boolean> = {};
    for (const group of navigationGroups) state[group.title] = true;
    return state;
  }, []);

  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>(initialExpanded);

  React.useEffect(() => {
    // Load from localStorage after hydration
    try {
      const saved = window.localStorage.getItem('adminSidebarExpanded');
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
    try {
      window.localStorage.setItem('adminSidebarExpanded', JSON.stringify(expandedGroups));
    } catch { }
  }, [expandedGroups]);

  const groupIconByTitle: Record<string, React.ReactNode> = {
    "Overview": <Home className="w-4 h-4" />,
    "User Management": <Users className="w-4 h-4" />,
    "Platform": <BarChart3 className="w-4 h-4" />,
  };

  return (
    <div className={
      mobile
        ? `w-full bg-transparent h-full p-0 flex md:hidden flex-col overflow-x-hidden`
        : `${isCollapsed ? 'w-20' : 'w-72'} bg-[#0d182b] border-r border-white/5 h-screen p-6 left-0 fixed transition-all duration-500 z-50 hidden md:flex flex-col overflow-x-hidden`
    }>
      {/* Toggle Button - Hide in mobile mode */}
      {!mobile && (
        <div className="mb-12 flex items-center justify-between flex-shrink-0">
          {!isCollapsed && (
            <div className="space-y-1">
              <h2 className="font-serif italic text-3xl text-slate-50 tracking-tight">Admin</h2>
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-4 bg-[#608d64]/50" />
                <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.3em]">Platform Sanctuary</p>
              </div>
            </div>
          )}
          {onToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="p-2 h-10 w-10 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
          )}
        </div>
      )}

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
                  <span className={`h-4 w-4 flex-shrink-0 text-slate-500 group-hover:text-[#608d64] transition-colors`}>
                    {groupIconByTitle[group.title]}
                  </span>
                  <span className="text-[10px] font-black text-slate-500 group-hover:text-[#608d64] uppercase tracking-[0.4em] transition-colors">
                    {group.title}
                  </span>
                </div>
                <ChevronDown className={`w-3 h-3 text-slate-600 transition-transform duration-500 ${expandedGroups[group.title] ? '' : '-rotate-90'}`} />
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
                        ? 'bg-white/10 text-white shadow-2xl shadow-[#608d64]/10 border border-white/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    title={isCollapsed ? tab.label : undefined}
                  >
                    <span className={`h-5 w-5 flex-shrink-0 transition-colors duration-500 ${isActive ? 'text-[#608d64]' : 'group-hover:text-white'}`}>{tab.icon}</span>
                    {!isCollapsed && <span className={`font-medium tracking-tight ${isActive ? 'font-bold' : 'font-light'}`}>{tab.label}</span>}
                    {isActive && !isCollapsed && (
                      <div className="ml-auto w-1 h-1 rounded-full bg-[#608d64] shadow-[0_0_8px_#608d64]" />
                    )}
                  </button>
                );
                if (isCollapsed) return content;
                return expandedGroups[group.title] ? content : null;
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex-shrink-0 pt-8 border-t border-white/5">
        {user && (
          <div className={`mb-4 ${isCollapsed ? 'px-0 flex justify-center' : 'px-2'}`}>
            {!isCollapsed ? (
              <div className="p-4 rounded-3xl bg-white/5 border border-white/5 shadow-2xl flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-[#608d64]/20 flex items-center justify-center text-sm font-black text-[#608d64] flex-shrink-0 border border-[#608d64]/10">
                  {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">
                    {user.full_name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate">
                    Curator
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
                <div className="w-10 h-10 rounded-xl bg-[#608d64]/20 flex items-center justify-center text-xs font-black text-[#608d64] border border-[#608d64]/10">
                  {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  className="p-3 rounded-full text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
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

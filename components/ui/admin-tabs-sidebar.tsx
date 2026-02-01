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
        ? `w-full bg-transparent h-full p-0 shadow-none transition-all duration-300 flex md:hidden flex-col overflow-x-hidden`
        : `${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r h-screen p-3 left-0 fixed shadow-sm transition-all duration-300 z-50 hidden md:flex flex-col overflow-x-hidden`
    }>
      {/* Toggle Button - Hide in mobile mode */}
      {!mobile && (
        <div className="mb-8 flex items-center justify-between flex-shrink-0">
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Admin Dashboard</h2>
              <p className="text-sm text-muted-foreground">Platform Management</p>
            </div>
          )}
          {onToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="p-2 hover:bg-muted/50"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          )}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.title} className="space-y-1">
            {/* Group Title */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
                aria-expanded={expandedGroups[group.title]}
              >
                <span className="flex items-center gap-2">
                  <span className="text-foreground/80">{groupIconByTitle[group.title] || null}</span>
                  {group.title}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedGroups[group.title] ? '' : '-rotate-90'}`} />
              </button>
            )}

            {/* Group Items */}
            <div className={`space-y-1`}>
              {group.items.map((tab) => {
                const isActive = activeTab === tab.id;
                const content = (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative group w-full text-left text-sm px-3 py-2.5 rounded-md transition-all duration-200 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'
                      } ${isActive
                        ? 'bg-muted text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-sm'
                      }`}
                    title={isCollapsed ? tab.label : undefined}
                  >
                    <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${isActive ? 'bg-primary' : 'bg-transparent'}`} />
                    <span className="w-4 h-4 flex-shrink-0">{tab.icon}</span>
                    {!isCollapsed && <span className="font-medium truncate">{tab.label}</span>}
                  </button>
                );
                if (isCollapsed) return content;
                return expandedGroups[group.title] ? content : null;
              })}
            </div>


          </div>
        ))}
      </nav>

      <div className="flex-shrink-0 pt-4 border-t border-border/50">
        {/* User Profile Section */}
        {user && (
          <div className={`mb-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
            {!isCollapsed ? (
              <div className="flex items-center p-3 rounded-lg bg-muted/30 min-w-0">
                <div className="flex items-center space-x-3 flex-1 min-w-0 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                    {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="ml-2 p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-all duration-200 flex-shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                  {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
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

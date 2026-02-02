"use client";

import * as React from "react";
import { Home, Package, BookOpen, DollarSign, User, ChevronLeft, ChevronRight, LogOut, ChevronDown, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProviderSidebarProps {
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
  isVerified?: boolean;
}

export function ProviderTabsSidebar({
  activeTab,
  onTabChange,
  isCollapsed = false,
  onToggle,
  user,
  onLogout,
  isVerified = false,
}: ProviderSidebarProps) {
  const navigationGroups = [
    {
      title: "Overview",
      items: [
        { id: "overview", label: "Dashboard", icon: <Home className="w-4 h-4" /> },
        // Only show onboarding tab if user is not verified
        ...(!isVerified ? [{ id: "onboarding", label: "Onboarding", icon: <FileText className="w-4 h-4" /> }] : []),
      ]
    },
    {
      title: "Services",
      items: [
        { id: "services", label: "My Services", icon: <Package className="w-4 h-4" /> },
        { id: "bookings", label: "Bookings", icon: <BookOpen className="w-4 h-4" /> },
      ]
    },
    {
      title: "CRM",
      items: [
        { id: "inquiries", label: "Inquiries", icon: <MessageSquare className="w-4 h-4" /> },
        { id: "quotes", label: "Quotes", icon: <FileText className="w-4 h-4" /> },
        { id: "contracts", label: "Contracts", icon: <FileText className="w-4 h-4" /> },
      ]
    },
    {
      title: "Business",
      items: [
        { id: "earnings", label: "Earnings", icon: <DollarSign className="w-4 h-4" /> },
        { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
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
      const saved = window.localStorage.getItem('providerSidebarExpanded');
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
      window.localStorage.setItem('providerSidebarExpanded', JSON.stringify(expandedGroups));
    } catch { }
  }, [expandedGroups]);

  const groupIconByTitle: Record<string, React.ReactNode> = {
    "Overview": <Home className="w-4 h-4" />,
    "Services": <Package className="w-4 h-4" />,
    "CRM": <MessageSquare className="w-4 h-4" />,
    "Business": <DollarSign className="w-4 h-4" />,
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r h-screen p-3 left-0 fixed shadow-sm transition-all duration-300 z-50 hidden md:flex flex-col overflow-x-hidden`}>
      {/* Toggle Button */}
      <div className="mb-8 flex items-center justify-between flex-shrink-0">
        {!isCollapsed && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Provider Dashboard
            </h2>
            <p className="text-sm text-muted-foreground">Manage your services</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-2 hover:bg-muted/50"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
        {navigationGroups.map((group) => (
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
            <div className="space-y-1">
              {group.items.map((tab) => {
                const isActive = activeTab === tab.id;
                const isTabDisabled = !isVerified && !['overview', 'onboarding'].includes(tab.id);

                const content = (
                  <button
                    key={tab.id}
                    onClick={() => !isTabDisabled && onTabChange(tab.id)}
                    disabled={isTabDisabled}
                    className={`relative group w-full text-left text-sm px-3 py-2.5 rounded-md transition-all duration-200 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'
                      } ${isActive
                        ? 'bg-muted text-foreground shadow-sm'
                        : isTabDisabled
                          ? 'opacity-50 cursor-not-allowed text-muted-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-sm'
                      }`}
                    title={isTabDisabled ? "Verify your account to access this tab" : isCollapsed ? tab.label : undefined}
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

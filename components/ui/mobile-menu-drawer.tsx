"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronDown, ChevronRight, Home, CheckCircle, Star, BookOpen, DollarSign, MessageCircle, Users, Heart, FileText, ShieldAlert, LogOut } from "lucide-react";
import { TranslatedText } from "@/components/translated-text";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MobileMenuDrawerProps {
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

export function MobileMenuDrawer({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  user,
  onLogout,
}: MobileMenuDrawerProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["overview", "planning"]);

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
      id: "planning",
      title: "Planning",
      items: [
        { id: "planning", label: "Planning & Timeline", icon: CheckCircle },
        { id: "guests", label: "Guest Management", icon: Users },
      ]
    },
    {
      id: "services",
      title: "Services & Vendors",
      items: [
        { id: "vendors", label: "Find Vendors", icon: Star },
      ]
    },
    {
      id: "management",
      title: "Management",
      items: [
        { id: "bookings", label: "My Bookings", icon: BookOpen },
        { id: "budget", label: "Budget", icon: DollarSign },
        { id: "messages", label: "Messages", icon: MessageCircle },
        { id: "quotes", label: "Quotes", icon: FileText },
        { id: "contracts", label: "Contracts", icon: FileText },
        { id: "disputes", label: "Disputes", icon: ShieldAlert },
        { id: "reviews", label: "Reviews", icon: Star },
      ]
    },
    {
      id: "inspiration",
      title: "Inspiration",
      items: [
        { id: "inspiration", label: "Wedding Ideas", icon: Heart },
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
      <div className="fixed left-0 top-0 h-full w-72 bg-card border-r shadow-lg overflow-hidden flex flex-col animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              <TranslatedText text="Dashboard" />
            </h2>
            <p className="text-xs text-muted-foreground">
              <TranslatedText text="Customer Portal" />
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-muted/50"
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
                  <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/50 transition-colors">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.title}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
                          "relative w-full text-left text-sm px-3 py-2.5 rounded-md transition-all duration-200 flex items-center gap-3",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-primary" />
                        )}
                        <Icon className={cn("w-4 h-4 flex-shrink-0 ml-1", isActive && "text-primary")} />
                        <span className="truncate">
                          <TranslatedText text={item.label} />
                        </span>
                      </button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        {user && (
          <div className="flex-shrink-0 p-4 border-t">
            <div className="flex items-center p-3 rounded-lg bg-muted/30">
              <div className="flex items-center space-x-3 flex-1 min-w-0 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                  {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.full_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="ml-2 p-2 rounded-md hover:bg-destructive/10 hover:text-destructive transition-all duration-200 flex-shrink-0"
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

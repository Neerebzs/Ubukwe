import { Home, Users, Briefcase, BookOpen, ShieldAlert, BarChart3, Settings, Calendar, HeadphonesIcon, Wallet } from "lucide-react";
import React from "react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export interface NavGroup {
  title: string;
  id: string;
  icon: React.ElementType;
  items: NavItem[];
}

export const ADMIN_NAVIGATION: NavGroup[] = [
  {
    title: "Overview",
    id: "overview-group",
    icon: Home,
    items: [
      { id: "overview", label: "Dashboard", icon: Home },
    ]
  },
  {
    title: "User Management",
    id: "user-management",
    icon: Users,
    items: [
      { id: "users", label: "Users", icon: Users },
      { id: "onboarding", label: "Onboarding", icon: Briefcase },
    ]
  },
  {
    title: "Platform",
    id: "platform",
    icon: BarChart3,
    items: [
      { id: "bookings", label: "Bookings", icon: BookOpen },
      { id: "events", label: "Events", icon: Calendar },
      { id: "services", label: "Services", icon: ShieldAlert },
      { id: "disputes", label: "Disputes", icon: ShieldAlert },
      { id: "support", label: "Support", icon: HeadphonesIcon },
      { id: "payments", label: "Payments", icon: Wallet },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
      { id: "system", label: "System Settings", icon: Settings },
    ]
  }
];

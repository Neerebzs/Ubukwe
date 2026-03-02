"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
  Edit,
  Ban,
  MessageCircle,
  Star,
  Clock,
  UserCheck,
  Settings,
  BarChart3,
  Menu,
  Home,
  Briefcase,
  BookOpen,
  ShieldAlert,
  ChevronLeft,
  Bell,
  Search,
} from "lucide-react"
import { AdminTabsSidebar } from "@/components/ui/admin-tabs-sidebar";
import { AdminOverview } from "@/components/admin/overview";
import { AdminUsers } from "@/components/admin/users";
import { AdminProviders } from "@/components/admin/providers";
import { AdminServices } from "@/components/admin/services";
import { AdminProviderServices } from "@/components/admin/provider-services";
import { AdminBookingsMetrics } from "@/components/admin/bookings";
import { AdminDisputes } from "@/components/admin/disputes";
import { AdminAnalytics } from "@/components/admin/analytics";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/ui/dashboard-header"
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav"
import { MobileAppBar } from "@/components/ui/mobile-app-bar"
import { AdminMobileMenuDrawer } from "@/components/ui/admin-mobile-menu-drawer"
import { CategoriesManagement } from "@/components/admin/categories";

export function AdminDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get("tab") || "overview"

  const [activeTab, setActiveTab] = useState(tabFromUrl)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const currentTab = searchParams.get("tab") || "overview"
    if (currentTab !== activeTab) {
      setActiveTab(currentTab)
    }
  }, [searchParams, activeTab])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    router.push(`/admin/dashboard?tab=${tab}`, { scroll: false })
  }

  // Platform stats will be fetched by sub-components or in future iterations
  const platformStats = {
    totalUsers: 0,
    activeProviders: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0,
    activeDisputes: 0,
  }

  const recentActivity: any[] = []

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Header logic replaced by DashboardHeader

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminOverview platformStats={platformStats} recentActivity={recentActivity} />
      case "users":
        return <AdminUsers />
      case "providers":
        return <AdminProviders />
      case "services":
        return (
          <div className="space-y-6">
            <Tabs defaultValue="provider-services" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="provider-services">Provider Services</TabsTrigger>
                <TabsTrigger value="service-categories">Service Categories</TabsTrigger>
                <TabsTrigger value="categories">Categories Management</TabsTrigger>
              </TabsList>
              <TabsContent value="provider-services">
                <AdminProviderServices />
              </TabsContent>
              <TabsContent value="service-categories">
                <AdminServices />
              </TabsContent>
              <TabsContent value="categories">
                <CategoriesManagement />
              </TabsContent>
            </Tabs>
          </div>
        )
      case "bookings":
        return <AdminBookingsMetrics />
      case "disputes":
        return <AdminDisputes disputes={[]} />
      case "analytics":
        return <AdminAnalytics />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafc]">
      {/* Mobile App Bar - Only on mobile */}
      <MobileAppBar
        title="Admin Dashboard"
        subtitle="Platform Management"
        onMenuClick={toggleMobileMenu}
        user={user ? {
          full_name: user.full_name || user.username,
          email: user.email,
          profile_image_url: user.profile_image_url
        } : undefined}
        onLogout={logout}
        notificationCount={0}
      />

      {/* Desktop Sidebar */}
      <AdminTabsSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
        user={user ? {
          full_name: user.full_name || user.username,
          email: user.email,
          avatar: user.profile_image_url
        } : undefined}
        onLogout={logout}
      />

      {/* Mobile Menu Drawer */}
      <AdminMobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={toggleMobileMenu}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user ? {
          full_name: user.full_name || user.username,
          email: user.email,
          avatar: user.profile_image_url
        } : undefined}
        onLogout={logout}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ml-0 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        {/* Desktop Header - Hidden on mobile, Sticky on desktop */}
        <div className="hidden md:block sticky top-0 z-30 bg-[#f9fafc]">
          <DashboardHeader
            user={{
              full_name: user?.full_name || user?.username || "Admin",
              role: "Administrator",
              profile_image_url: user?.profile_image_url
            }}
            onLogout={logout}
            onToggleSidebar={toggleSidebar}
            onToggleMobileMenu={toggleMobileMenu}
            title="Admin Dashboard"
            subtitle="Platform Management"
          />
        </div>

        {/* Content Area with mobile padding */}
        <main className="flex-1 p-3 md:p-4 lg:p-6 xl:p-8 overflow-y-auto pb-20 md:pb-4" role="main">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation - Only on mobile */}
      <MobileBottomNav
        userRole="admin"
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  )
}


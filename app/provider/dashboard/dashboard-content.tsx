"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, ChevronLeft, Home, Package, BookOpen, MessageSquare, FileText, DollarSign, User, LogOut } from "lucide-react"
import { ProviderTabsSidebar } from "@/components/ui/provider-tabs-sidebar"
import { useAuth } from "@/hooks/useAuth"
import { DashboardHeader } from "@/components/ui/dashboard-header"
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav"
import { MobileAppBar } from "@/components/ui/mobile-app-bar"
import { ProviderMobileMenuDrawer } from "@/components/ui/provider-mobile-menu-drawer"
import { ProviderOverview } from "@/components/provider/overview"
import { ProviderServices } from "@/components/provider/services"
import { ProviderBookings } from "@/components/provider/bookings"
import { ProviderEarnings } from "@/components/provider/earnings"
import { ProviderProfile } from "@/components/provider/profile"
import { InquiryManagement } from "@/components/provider/inquiry-management"
import { QuoteBuilder } from "@/components/provider/quote-builder"
import { AvailabilityCalendar } from "@/components/provider/availability-calendar"
import { AssetLibrary } from "@/components/provider/asset-library"
import { ProviderOnboardingForm } from "@/components/provider/onboarding-form"
import { ProviderContracts } from "@/components/provider/contracts"
import { EventsManagement } from "@/components/provider/events-management"
import { TicketManagementWrapper } from "@/components/provider/ticket-management-wrapper"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Plus } from "lucide-react"
import { TranslatedText } from "@/components/translated-text"

export function ProviderDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get("tab") || "overview"
  const inquiryId = searchParams.get("inquiryId")
  const customerId = searchParams.get("customerId")

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
    router.push(`/provider/dashboard?tab=${tab}`, { scroll: false })
  }

  // Stats and data are fetched inside individual components (ProviderOverview, ProviderEarnings, etc.)

  const recentBookings: any[] = []
  const services: any[] = []

  // Header logic replaced by DashboardHeader

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const renderContent = () => {
    // Redirect verified users away from onboarding tab
    if (activeTab === "onboarding" && user?.is_verified) {
      handleTabChange("overview");
      return null;
    }

    switch (activeTab) {
      case "overview": return <ProviderOverview />
      case "services": return <ProviderServices />
      case "events": return <EventsManagement />
      case "tickets": return <TicketManagementWrapper />
      case "bookings": return <ProviderBookings />
      case "inquiries": return (
        <InquiryManagement
          onSendQuote={(inqId, custId) => {
            router.push(`/provider/dashboard?tab=quotes&inquiryId=${inqId}&customerId=${custId}`, { scroll: false })
          }}
        />
      )
      case "quotes": return <QuoteBuilder customerId={customerId || undefined} inquiryId={inquiryId || undefined} />

      case "contracts": return <ProviderContracts />
      case "onboarding": return <ProviderOnboardingForm />
      case "earnings": return <ProviderEarnings />
      case "profile": return <ProviderProfile />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafc]">
      {/* Mobile App Bar - Only on mobile */}
      <MobileAppBar
        title="My Business"
        subtitle="Manage your listings and customers"
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
      <ProviderTabsSidebar
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
        isVerified={user?.is_verified}
      />

      {/* Mobile Menu Drawer */}
      <ProviderMobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={toggleMobileMenu}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user ? {
          full_name: user.full_name || user.username,
          email: user.email,
          avatar: user.profile_image_url,
          is_verified: user.is_verified
        } : undefined}
        onLogout={logout}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ml-0 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        {/* Desktop Header - Hidden on mobile, Sticky on desktop */}
        <div className="hidden md:block sticky top-0 z-30 bg-[#f9fafc]">
          <DashboardHeader
            user={{
              full_name: user?.full_name || user?.username || "Provider",
              role: "Service Provider",
              profile_image_url: user?.profile_image_url
            }}
            onLogout={logout}
            onToggleSidebar={toggleSidebar}
            onToggleMobileMenu={toggleMobileMenu}
            title="My Business"
            subtitle="Manage your listings and customers"
          />
        </div>

        {/* Content Area with mobile padding */}
        <main className="flex-1 p-3 md:p-4 lg:p-6 xl:p-8 overflow-y-auto pb-20 md:pb-4" role="main">
          {!user?.is_verified && activeTab !== "onboarding" && activeTab !== "overview" ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold"><TranslatedText text="Account Not Ready" /></h2>
              <p className="text-muted-foreground">
                <TranslatedText text="Please complete your setup and wait for approval to access this feature." />
              </p>
              <Button onClick={() => handleTabChange("onboarding")}><TranslatedText text="Finish Setup" /></Button>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation - Only on mobile */}
      <MobileBottomNav
        userRole="provider"
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  )
}

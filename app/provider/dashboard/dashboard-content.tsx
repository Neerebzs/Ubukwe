"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, ChevronLeft, Home, Package, BookOpen, MessageSquare, FileText, DollarSign, User, LogOut, Clock, XCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
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
import { ProviderProfileSettings } from "@/components/provider/profile-settings"
import { ProviderPreferencesSettings } from "@/components/provider/preferences-settings"
import { InquiryManagement } from "@/components/provider/inquiry-management"
import { AvailabilityCalendar } from "@/components/provider/availability-calendar"
import { AssetLibrary } from "@/components/provider/asset-library"
import { ProviderOnboardingForm } from "@/components/provider/onboarding-form"
import { ProviderOnboardingStatus } from "@/components/provider/onboarding-status"
import { ProviderReviewsView } from "@/components/provider/reviews-view"
import { ProviderContracts } from "@/components/provider/contracts"
import { EventsManagement } from "@/components/provider/events-management"
import { TicketManagementWrapper } from "@/components/provider/ticket-management-wrapper"
import { MessagesHub } from "@/components/dashboard/messages-hub"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Plus } from "lucide-react"
import { TranslatedText } from "@/components/translated-text"
import { axiosInstance } from "@/lib/api-client"

// Tabs that require approved onboarding
const PROTECTED_TABS = ["services", "bookings", "events", "tickets", "availability", "gallery", "inquiries", "contracts", "earnings"]

type OnboardingStatus = "pending" | "approved" | "rejected" | "requires_revision" | null

export function ProviderDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get("tab") || "overview"
  const inquiryId = searchParams.get("inquiryId")
  const customerId = searchParams.get("customerId")

  const [activeTab, setActiveTab] = useState(tabFromUrl)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { user, logout } = useAuth()

  // Ensure router is only used after client mount
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    const currentTab = searchParams.get("tab") || "overview"
    if (currentTab === activeTab) return

    const approved = onboardingStatus === "approved"
    if (PROTECTED_TABS.includes(currentTab) && !approved && !statusLoading) {
      router.replace("/provider/dashboard?tab=onboarding", { scroll: false })
      setActiveTab("onboarding")
      return
    }

    setActiveTab(currentTab)
  }, [searchParams, activeTab, onboardingStatus, statusLoading, mounted])

  // Fetch onboarding status once user is loaded
  useEffect(() => {
    if (!user) return
    if (user.is_verified) {
      setOnboardingStatus("approved")
      setStatusLoading(false)
      return
    }
    axiosInstance.get("/api/v1/provider/onboarding/status")
      .then((res) => {
        setOnboardingStatus(res.data?.onboarding_status ?? null)
      })
      .catch(() => setOnboardingStatus(null))
      .finally(() => setStatusLoading(false))
  }, [user])

  const handleTabChange = (tab: string) => {
    // Block navigation to protected tabs if onboarding is not approved.
    // Derive approval directly from state to avoid declaration-order issues.
    const approved = onboardingStatus === "approved"
    if (PROTECTED_TABS.includes(tab) && !approved) {
      // Redirect to onboarding so the provider can complete registration
      setActiveTab("onboarding")
      router.push(`/provider/dashboard?tab=onboarding`, { scroll: false })
      return
    }
    setActiveTab(tab)
    router.push(`/provider/dashboard?tab=${tab}`, { scroll: false })
  }

  const recentBookings: any[] = []
  const services: any[] = []

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  // Alert content based on onboarding status
  const renderOnboardingAlert = () => {
    if (onboardingStatus === "pending") {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold"><TranslatedText text="Application Under Review" /></h2>
          <p className="text-muted-foreground">
            <TranslatedText text="Your onboarding application has been submitted and is currently being reviewed by our team. You'll be notified once it's approved." />
          </p>
          <Button variant="outline" onClick={() => handleTabChange("onboarding")}>
            <TranslatedText text="View My Application" />
          </Button>
        </div>
      )
    }

    if (onboardingStatus === "rejected") {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold"><TranslatedText text="Application Rejected" /></h2>
          <p className="text-muted-foreground">
            <TranslatedText text="Your onboarding application was not approved. Please review the feedback and resubmit your documents." />
          </p>
          <Button onClick={() => handleTabChange("onboarding")}>
            <TranslatedText text="Resubmit Application" />
          </Button>
        </div>
      )
    }

    if (onboardingStatus === "requires_revision") {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold"><TranslatedText text="Revision Required" /></h2>
          <p className="text-muted-foreground">
            <TranslatedText text="Our team has requested changes to your onboarding application. Please update your documents and resubmit." />
          </p>
          <Button onClick={() => handleTabChange("onboarding")}>
            <TranslatedText text="Update Application" />
          </Button>
        </div>
      )
    }

    // No application submitted yet
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold"><TranslatedText text="Complete Your Onboarding" /></h2>
        <p className="text-muted-foreground">
          <TranslatedText text="You need to submit your onboarding documents and get approved before accessing this feature." />
        </p>
        <Button onClick={() => handleTabChange("onboarding")}>
          <TranslatedText text="Submit Onboarding Documents" />
        </Button>
      </div>
    )
  }

  const renderContent = () => {
    // Don't render onboarding tab for verified users — redirect handled by useEffect below
    if (activeTab === "onboarding" && user?.is_verified) {
      return null;
    }

    switch (activeTab) {
      case "overview": return <ProviderOverview />
      case "services": return <ProviderServices />
      case "bookings": return <ProviderBookings />
      case "events": return <EventsManagement />
      case "tickets": return <TicketManagementWrapper />
      case "availability": return <AvailabilityCalendar />
      case "gallery": return <AssetLibrary />
      case "inquiries": return (
        <div className="space-y-12">
          <InquiryManagement
            onSendQuote={(inqId, custId) => {
              console.log("Send quote for inquiry", inqId, "to customer", custId);
            }}
          />
          <ProviderReviewsView />
        </div>
      )
      case "contracts": return <ProviderContracts />
      case "messages": return <MessagesHub />
      case "onboarding": return <ProviderOnboardingStatus />
      case "reviews": return <ProviderReviewsView />
      case "earnings": return <ProviderEarnings />
      case "profile": return <ProviderProfileSettings />
      case "preferences": return <ProviderPreferencesSettings />
      default: return null
    }
  }

  // Gate: block protected tabs if onboarding is not approved
  const isProtectedTab = PROTECTED_TABS.includes(activeTab)
  const isApproved = onboardingStatus === "approved"

  // Once status is resolved, if the active tab is protected and not approved,
  // redirect to onboarding. Guard with mounted to avoid calling router before hydration.
  useEffect(() => {
    if (!mounted) return
    if (statusLoading) return
    if (isApproved) return
    if (user?.is_verified) return
    if (PROTECTED_TABS.includes(activeTab)) {
      router.replace("/provider/dashboard?tab=onboarding", { scroll: false })
      setActiveTab("onboarding")
    }
  }, [mounted, statusLoading, isApproved, activeTab, user?.is_verified])

  // Redirect verified users away from the onboarding tab
  useEffect(() => {
    if (!mounted) return
    if (activeTab === "onboarding" && user?.is_verified) {
      router.replace("/provider/dashboard?tab=overview", { scroll: false })
      setActiveTab("overview")
    }
  }, [mounted, activeTab, user?.is_verified])

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
          profile_image_url: user.profile_image_url,
          role: user.role
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
        isOnboardingApproved={isApproved}
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
        isOnboardingApproved={isApproved}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ml-0 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        {/* Desktop Header - Hidden on mobile, Sticky on desktop */}
        <div className="hidden md:block sticky top-0 z-30 bg-[#f9fafc]">
          <DashboardHeader
            user={{
              full_name: user?.full_name || user?.username || "Provider",
              role: "service_provider",
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
        <main
          className={cn(
            "flex-1 p-3 md:p-4 lg:p-6 xl:p-8 pb-20 md:pb-4",
            activeTab === "messages" ? "overflow-hidden" : "overflow-y-auto"
          )}
          role="main"
        >
          {statusLoading && !user?.is_verified
            ? (
              // Still checking onboarding status — show nothing to avoid flash
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-[#668c65] border-t-transparent rounded-full animate-spin" />
              </div>
            )
            : isProtectedTab && !isApproved
              ? renderOnboardingAlert()
              : renderContent()
          }
        </main>
      </div>

      {/* Mobile Bottom Navigation - Only on mobile */}
      <MobileBottomNav
        userRole="provider"
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOnboardingApproved={isApproved}
      />
    </div>
  )
}

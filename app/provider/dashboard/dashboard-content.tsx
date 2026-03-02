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

  const providerStats = {
    totalBookings: 24,
    monthlyEarnings: 850000,
    averageRating: 4.8,
    activeServices: 3,
  }

  const recentBookings = [
    { id: 1, client: "Marie Uwimana", service: "Traditional Dancers", date: "2024-03-15", status: "confirmed", amount: 120000 },
    { id: 2, client: "Jean Baptiste", service: "MC Services", date: "2024-03-22", status: "pending", amount: 80000 },
    { id: 3, client: "Grace Mukamana", service: "Traditional Dancers", date: "2024-04-05", status: "completed", amount: 150000 },
  ]

  const services = [
    {
      id: "1",
      title: "Traditional Intore Dancers",
      category: "Entertainment",
      location: "Kigali",
      priceRange: "120,000 - 200,000 RWF",
      priceRangeMin: 120000,
      priceRangeMax: 200000,
      bookings: 12,
      rating: 4.9,
      status: "active" as const,
      description: "Professional traditional Rwandan dancers specializing in Intore and cultural performances for weddings.",
      specialties: ["Intore Dance", "Cultural Music", "Traditional Costumes"],
      verified: true,
      packages: [
        {
          id: "1",
          name: "Basic Package",
          price: 120000,
          duration: "2 hours",
          description: "Perfect for intimate ceremonies",
          features: ["Traditional dance performance", "Up to 5 dancers", "Basic costumes", "2-hour performance"],
          popular: false,
        },
        {
          id: "2",
          name: "Standard Package",
          price: 180000,
          duration: "3 hours",
          description: "Most popular choice for weddings",
          features: ["Extended traditional dance performance", "Up to 8 dancers", "Premium costumes", "Live drumming", "3-hour performance", "Cultural storytelling"],
          popular: true,
        }
      ],
      gallery: [],
      phone: "+250 788 123 456",
      email: "contact@intoregroup.rw"
    },
    {
      id: "2",
      title: "Wedding MC Services",
      category: "Entertainment",
      location: "Kigali",
      priceRange: "80,000 - 120,000 RWF",
      priceRangeMin: 80000,
      priceRangeMax: 120000,
      bookings: 8,
      rating: 4.7,
      status: "active" as const,
      description: "Bilingual MC specializing in Rwandan wedding ceremonies and cultural traditions.",
      specialties: ["Bilingual Hosting", "Cultural Expertise", "Event Coordination"],
      verified: true,
    },
    {
      id: "3",
      title: "Cultural Music Performance",
      category: "Entertainment",
      location: "Kigali",
      priceRange: "100,000 - 180,000 RWF",
      priceRangeMin: 100000,
      priceRangeMax: 180000,
      bookings: 4,
      rating: 4.8,
      status: "draft" as const,
      description: "Traditional Rwandan musicians playing authentic instruments for wedding ceremonies.",
      specialties: ["Traditional Instruments", "Live Performances"],
    },
  ]

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
      case "services": return <ProviderServices services={services} />
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
      case "earnings": return <ProviderEarnings recentCompleted={recentBookings.filter((b) => b.status === "completed")} />
      case "profile": return <ProviderProfile />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafc]">
      {/* Mobile App Bar - Only on mobile */}
      <MobileAppBar
        title="Provider Dashboard"
        subtitle="Manage your services"
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
      <div className={`flex-1 flex flex-col transition-all duration-300 ml-0 ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
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
            title="Provider Dashboard"
            subtitle="Manage your services"
          />
        </div>

        {/* Content Area with mobile padding */}
        <main className="flex-1 p-3 md:p-4 lg:p-6 xl:p-8 overflow-y-auto pb-20 md:pb-4" role="main">
          {!user?.is_verified && activeTab !== "onboarding" && activeTab !== "overview" ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold"><TranslatedText text="Verification Required" /></h2>
              <p className="text-muted-foreground">
                <TranslatedText text="Please complete your onboarding and wait for admin approval to access this feature." />
              </p>
              <Button onClick={() => handleTabChange("onboarding")}><TranslatedText text="Go to Onboarding" /></Button>
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

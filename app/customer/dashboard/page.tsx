"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Search, Menu, Home, CheckCircle, Star, BookOpen, DollarSign, ChevronLeft, Users, Clock, MapPin, Camera, FileText, ShieldAlert, LogOut } from "lucide-react";
import { DashboardSidebar } from "@/components/ui/dashboard-sidebar";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { MobileAppBar } from "@/components/ui/mobile-app-bar";
import { MobileMenuDrawer } from "@/components/ui/mobile-menu-drawer";
import { Overview } from "@/components/dashboard/overview";
import { Planning } from "@/components/dashboard/planning";
import { Services } from "@/components/dashboard/services";
import { Bookings } from "@/components/dashboard/bookings";
import { BudgetManagement } from "@/components/dashboard/budget-management";
import { ComprehensivePlanning } from "@/components/dashboard/comprehensive-planning";
import { VendorMarketplace } from "@/components/dashboard/vendor-marketplace";
import { GuestManagement } from "@/components/dashboard/guest-management";
import { MessagesHub } from "@/components/dashboard/messages-hub";
import { WeddingInspiration } from "@/components/dashboard/wedding-inspiration";
import { ComingSoon } from "@/components/ui/coming-soon";
import { useAuth } from "@/hooks/useAuth";
import { CustomerQuotes } from "@/components/customer/quotes";
import { CustomerContractsView } from "@/components/customer/contracts-view";
import { CustomerDisputesView } from "@/components/customer/disputes-view";
import { ReviewForm } from "@/components/reviews/review-form";
import { CustomerBookingWizard } from "@/components/customer/booking-wizard";
import { CustomerContractSign } from "@/components/customer/contract-sign";
import { WeddingTasks } from "@/components/customer/wedding-tasks";
import { useQuery } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS, Wedding } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { TranslatedText } from "@/components/translated-text";
function CustomerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "overview";

  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const { data: weddingResponse, isLoading: isWeddingLoading } = useQuery({
    queryKey: ["wedding-me"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<Wedding>(API_ENDPOINTS.WEDDING.ME);
        return response.data;
      } catch (err: any) {
        if (err.message.includes("404")) return null;
        throw err;
      }
    }
  });

  const currentWedding = weddingResponse || null;

  // Sync URL with activeTab
  useEffect(() => {
    const currentTab = searchParams.get("tab") || "overview";
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams, activeTab]);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/customer/dashboard?tab=${tab}`, { scroll: false });
  };

  // Placeholder/Fallback wedding data
  const fallbackWedding = {
    coupleName: "Set Wedding Names",
    weddingDate: "",
    venue: "Not set",
    guestCount: 0,
    budget: 0,
    spent: 0,
  };

  const displayWedding = currentWedding ? {
    coupleName: currentWedding.couple_name,
    weddingDate: currentWedding.wedding_date,
    venue: currentWedding.venue || "Not set",
    guestCount: currentWedding.guest_count,
    budget: Number(currentWedding.budget),
    spent: Number(currentWedding.spent)
  } : fallbackWedding;

  const recommendedServices = [
    {
      id: 1,
      provider: "Rwandan Delights Catering",
      service: "Traditional Wedding Catering",
      price: "150,000 RWF",
      rating: 4.9,
      reviews: 45,
      category: "Food",
      icon: <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center">🍽️</div>,
    },
    {
      id: 2,
      provider: "Heritage Decorations",
      service: "Traditional Wedding Decor",
      price: "200,000 RWF",
      rating: 4.8,
      reviews: 32,
      category: "Decor",
      icon: <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center">🎨</div>,
    },
    {
      id: 3,
      provider: "Kinyarwanda Music Ensemble",
      service: "Traditional Wedding Music",
      price: "100,000 RWF",
      rating: 4.9,
      reviews: 28,
      category: "Music",
      icon: <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center">🎵</div>,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <Overview
            weddingDetails={displayWedding}
          />
        );

      case "vendors":
        return <VendorMarketplace />;

      case "planning":
        return <WeddingTasks />;

      case "guests":
        return <GuestManagement />;

      case "bookings":
        return <Bookings />;

      case "budget":
        return <BudgetManagement totalBudget={displayWedding.budget} onBudgetUpdate={(newBudget) => {
          // Budget update will be handled by React Query cache invalidation
        }} />;

      case "messages":
        return <MessagesHub />;

      case "inspiration":
        return <WeddingInspiration />;

      case "quotes":
        return <CustomerQuotes />;

      case "contracts":
        return <CustomerContractsView />;

      case "contract-sign":
        return <CustomerContractSign />;

      case "disputes":
        return <CustomerDisputesView />;

      case "reviews":
        return <ReviewForm bookingId="" serviceName="" providerName="" />;

      case "booking":
        return <CustomerBookingWizard />;

      default:
        return null;
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-[#f9fafc]">
      {/* Mobile App Bar - Only on mobile */}
      <MobileAppBar
        title={displayWedding.coupleName}
        subtitle={displayWedding.weddingDate ? new Date(displayWedding.weddingDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : "Set your wedding date"}
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
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userRole="Customer"
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
      <MobileMenuDrawer
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
              full_name: user?.full_name || user?.username || "Customer",
              role: "Event Owner",
              profile_image_url: user?.profile_image_url
            }}
            onLogout={logout}
            onToggleSidebar={toggleSidebar}
            onToggleMobileMenu={toggleMobileMenu}
            title={displayWedding.coupleName}
            subtitle={displayWedding.weddingDate ? new Date(displayWedding.weddingDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : "Set your wedding date"}
          />
        </div>

        {/* Content Area with mobile padding */}
        <div className="flex-1 p-3 md:p-4 lg:p-6 xl:p-8 overflow-y-auto pb-20 md:pb-4">
          {renderContent()}
        </div>
      </div>

      {/* Mobile Bottom Navigation - Only on mobile */}
      <MobileBottomNav
        userRole="customer"
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}


export default function CustomerDashboard() {
  return <CustomerDashboardContent />;
}

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Search, Menu, Home, CheckCircle, Star, BookOpen, DollarSign, ChevronLeft, Users, Clock, MapPin, Camera, FileText, ShieldAlert, LogOut } from "lucide-react";
import { DashboardSidebar } from "@/components/ui/dashboard-sidebar";
import { Overview } from "@/components/dashboard/overview";
import { Planning } from "@/components/dashboard/planning";
import { Services } from "@/components/dashboard/services";
import { Bookings } from "@/components/dashboard/bookings";
import BudgetAnlyo from "@/components/dashboard/budget-anlyo";
import { ComprehensivePlanning } from "@/components/dashboard/comprehensive-planning";
import { VendorMarketplace } from "@/components/dashboard/vendor-marketplace";
import { GuestManagement } from "@/components/dashboard/guest-management";
import { MessagesHub } from "@/components/dashboard/messages-hub";
import { WeddingInspiration } from "@/components/dashboard/wedding-inspiration";
import { ComingSoon } from "@/components/ui/coming-soon";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/ui/dashboard-header";
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

export default function CustomerDashboard() {
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

  const bookings = [
    {
      id: 1,
      provider: "Intore Cultural Group",
      service: "Traditional Dancers",
      date: "2024-06-15",
      status: "confirmed",
      amount: 120000,
      rating: 4.9,
    },
    {
      id: 2,
      provider: "Emmanuel MC Services",
      service: "Wedding MC",
      date: "2024-06-15",
      status: "confirmed",
      amount: 80000,
      rating: 4.8,
    },
    {
      id: 3,
      provider: "Kigali Serena Hotel",
      service: "Wedding Venue",
      date: "2024-06-15",
      status: "confirmed",
      amount: 800000,
      rating: 4.7,
    },
  ];

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
        return <Bookings bookings={bookings} />;

      case "budget":
        return <BudgetAnlyo />;

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
        return <ReviewForm bookingId="BK-2024-001" serviceName="Traditional Dancers" providerName="Intore Cultural Group" />;

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

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu} />
          <div className="fixed left-0 top-0 h-full w-64 bg-card border-r shadow-lg overflow-y-auto">
            <div className="p-4 h-full flex flex-col">
              <div className="mb-4 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-1"><TranslatedText text="Dashboard" /></h2>
                  <p className="text-xs text-muted-foreground"><TranslatedText text="Customer Portal" /></p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMobileMenu}
                  className="p-2 hover:bg-muted/50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>

              <nav className="flex-1 overflow-y-auto space-y-3 pt-2">
                {[
                  {
                    title: "Overview",
                    items: [
                      { id: "overview", label: <TranslatedText text="Dashboard" />, icon: <Home className="w-4 h-4" /> },
                    ]
                  },
                  {
                    title: "Planning",
                    items: [
                      { id: "planning", label: <TranslatedText text="Planning & Timeline" />, icon: <CheckCircle className="w-4 h-4" /> },
                      { id: "guests", label: <TranslatedText text="Guest Management" />, icon: <Users className="w-4 h-4" /> },
                    ]
                  },
                  {
                    title: "Services & Vendors",
                    items: [
                      { id: "vendors", label: <TranslatedText text="Find Vendors" />, icon: <Star className="w-4 h-4" /> },
                    ]
                  },
                  {
                    title: "Management",
                    items: [
                      { id: "bookings", label: <TranslatedText text="My Bookings" />, icon: <BookOpen className="w-4 h-4" /> },
                      { id: "budget", label: <TranslatedText text="Budget Anlyo" />, icon: <DollarSign className="w-4 h-4" /> },
                      { id: "messages", label: <TranslatedText text="Messages" />, icon: <MessageCircle className="w-4 h-4" /> },
                      { id: "quotes", label: <TranslatedText text="Quotes" />, icon: <FileText className="w-4 h-4" /> },
                      { id: "contracts", label: <TranslatedText text="Contracts" />, icon: <FileText className="w-4 h-4" /> },
                      { id: "disputes", label: <TranslatedText text="Disputes" />, icon: <ShieldAlert className="w-4 h-4" /> },
                      { id: "reviews", label: <TranslatedText text="Reviews" />, icon: <Star className="w-4 h-4" /> },
                    ]
                  },
                  {
                    title: "Inspiration",
                    items: [
                      { id: "inspiration", label: <TranslatedText text="Wedding Ideas" />, icon: <Heart className="w-4 h-4" /> },
                    ]
                  }
                ].map((group, groupIndex) => (
                  <div key={group.title} className="space-y-1">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 pb-1">
                      {group.title}
                    </h3>
                    <div className="space-y-0.5">
                      {group.items.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            handleTabChange(tab.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`relative w-full text-left text-sm px-3 py-2.5 rounded-md transition-all duration-200 flex items-center gap-3 ${activeTab === tab.id
                            ? "bg-muted text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                        >
                          <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${activeTab === tab.id ? 'bg-primary' : 'bg-transparent'}`} />
                          <span className="w-4 h-4 flex-shrink-0">{tab.icon}</span>
                          <span className="font-medium truncate">{tab.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>

              {user && (
                <div className="flex-shrink-0 pt-4 border-t border-border/50 mt-4">
                  <div className="mb-4 px-3">
                    <div className="flex items-center p-3 rounded-lg bg-muted/30 min-w-0">
                      <div className="flex items-center space-x-3 flex-1 min-w-0 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                          {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || (user.username?.[0] || user.email[0]).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="text-sm font-medium text-foreground truncate">
                            {user.full_name || user.username}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (logout) logout();
                          toggleMobileMenu();
                        }}
                        className="ml-2 p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-all duration-200 flex-shrink-0"
                        title="Logout"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ml-0 ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
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

        <div className="flex-1 p-3 md:p-4 lg:p-6 xl:p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
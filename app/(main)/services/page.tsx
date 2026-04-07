"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Music, Utensils, MapPin, Palette, Mic, Star, Search, Filter, SlidersHorizontal } from "lucide-react"
import { PublicBottomNav } from "@/components/ui/public-bottom-nav"
import { ServiceSchema } from "@/components/schemas/service-schema"
import { EmptyState } from "@/components/ui/empty-state"
import { useQuery } from "@tanstack/react-query"
import { apiClient, API_ENDPOINTS, ProviderService, ServiceCategory } from "@/lib/api"
import { ServiceCard } from "@/components/ui/service-card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CategorySidebar } from "@/components/ui/category-sidebar"
import { cn } from "@/lib/utils"

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const { data: servicesResponse, isLoading: servicesLoading, error: servicesError } = useQuery({
    queryKey: ["public-services", selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      const url = `${API_ENDPOINTS.SERVICES.SEARCH}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<ProviderService[]>(url);
      return response.data;
    }
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => {
      const response = await apiClient.categories.getAll<ServiceCategory[]>();
      return response.data;
    }
  });

  const isLoading = servicesLoading;
  const error = servicesError;
  const services = servicesResponse || [];

  const getCategoryIcon = (iconName: string | undefined, className: string = "h-4 w-4") => {
    switch (iconName?.toLowerCase()) {
      case "users": return <Users className={className} />;
      case "music": return <Music className={className} />;
      case "utensils": return <Utensils className={className} />;
      case "map-pin": return <MapPin className={className} />;
      case "mic": return <Mic className={className} />;
      case "palette": return <Palette className={className} />;
      default: return <Search className={className} />;
    }
  };

  const categories = [
    {
      value: "all",
      label: "All Services",
      icon: <Search className="h-4 w-4" />,
      description: "Browse all available wedding services"
    },
    ...(categoriesResponse?.map(cat => ({
      value: cat.slug,
      label: cat.name,
      icon: getCategoryIcon(cat.icon),
      description: cat.description || `Explore ${cat.name} services`
    })) || [])
  ];

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getThumbnail = (service: ProviderService) => {
    const firstItem = service.gallery?.[0];
    if (!firstItem) return "/placeholder.svg";
    if (typeof firstItem === "string") return firstItem;
    return firstItem.url || "/placeholder.svg";
  };

  const currentCategory = categories.find(c => c.value === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] space-y-6">
        <div className="relative flex items-center justify-center">
           <div className="absolute w-20 h-20 rounded-full border-[3px] border-slate-200" />
           <div className="absolute w-20 h-20 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
           <Search className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-serif italic text-2xl text-slate-900">
            Finding Services...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:pl-10 mx-auto px-4">
      <div className="flex flex-1 flex-col md:flex-row">

        {/* Main Content Area */}
        <main className="flex-1 pb-16 md:pb-8">
          <div className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-12 space-y-8">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-6 animate-in fade-in slide-in-from-left duration-1000">
                  <div className="flex items-center gap-3">
                    <div className="h-[1px] w-12 bg-primary/30" />
                    <span className="text-primary font-outfit font-bold tracking-[0.3em] uppercase text-[10px]">
                      Our Curation
                    </span>
                  </div>
                  <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-slate-900 leading-[0.9] tracking-tight whitespace-nowrap">
                    <span className="font-light">Explore</span>{" "}
                    <span className="italic font-medium text-primary">Services</span>
                  </h1>
                  <p className="font-outfit text-slate-500 text-lg max-w-lg leading-relaxed font-light">
                    Find the perfect partners for your special day. From traditional ceremonies to modern celebrations, we've curated the best of Rwanda.
                  </p>
                </div>

                <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-right duration-1000">
                  <div className="relative group flex-1 lg:w-80">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-primary" />
                    <Input
                      placeholder="Search providers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-14 bg-white rounded-2xl shadow-sm border-slate-100 focus-visible:ring-primary/20 text-slate-600 font-medium"
                    />
                  </div>

                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 bg-white hover:bg-slate-50 text-slate-700 font-bold gap-3 shadow-sm">
                        <SlidersHorizontal className="h-5 w-5 text-primary" />
                        Categories
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[340px] sm:w-[400px] p-0 border-l-slate-100">
                      <SheetHeader className="p-8 border-b border-slate-50">
                        <SheetTitle className="text-3xl font-serif italic text-slate-900">Categories</SheetTitle>
                      </SheetHeader>
                      <div className="p-6 h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide">
                        <CategorySidebar
                          categories={categories}
                          selectedCategory={selectedCategory}
                          onCategoryChange={(val: string) => {
                            setSelectedCategory(val)
                            setIsSheetOpen(false)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className="border-0 shadow-none bg-transparent"
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>

            {/* Category Banner (only for non-'all') */}
            {selectedCategory !== "all" && currentCategory && (
              <div className="mb-12 p-12 bg-white rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] transition-transform duration-1000 group-hover:scale-110">
                  {getCategoryIcon(categoriesResponse?.find(c => c.slug === selectedCategory)?.icon, "w-64 h-64")}
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-sage-50 rounded-2xl flex items-center justify-center text-sage-600 shadow-sm">
                      {currentCategory.icon}
                    </div>
                    <Badge variant="secondary" className="bg-slate-900 text-white font-bold px-4 py-1.5 rounded-full border-none">
                      {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900">{currentCategory.label}</h2>
                    <p className="text-slate-500 text-lg max-w-2xl font-medium leading-relaxed">{currentCategory.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Info (only for 'all' or search) */}
            {(selectedCategory === "all" || searchTerm) && (
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <p className="text-base font-medium text-slate-500">
                  Showing <span className="text-slate-900 font-bold">{filteredServices.length}</span> services
                  {searchTerm && <span> for "<span className="text-primary">{searchTerm}</span>"</span>}
                </p>
                <div className="md:hidden">
                  <Button variant="outline" size="sm" className="rounded-full">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Results */}
            {error ? (
              <div className="text-center py-24 bg-white rounded-[32px] border border-dashed border-slate-200">
                <div className="text-red-500 mb-6 inline-block p-6 bg-red-50 rounded-3xl">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Unable to load services</h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-lg">
                  There was a problem reaching our servers. Please try again.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="rounded-full px-10 h-12 border-slate-200 hover:bg-slate-50"
                >
                  Retry
                </Button>
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredServices.map((service) => {
                  const categoryName = categoriesResponse?.find(
                    (cat) => cat.id === service.category_id
                  )?.name || service.category || "Service";

                  return (
                    <ServiceCard
                      key={service.id}
                      id={service.id}
                      title={service.business_name || service.name}
                      image={getThumbnail(service)}
                      images={service.gallery?.filter((item: any) => {
                        const type = typeof item === 'string' ? 'image' : item.type;
                        return !type || type === 'image';
                      }).map((item: any) =>
                        typeof item === 'string' ? item : (item.url || item.preview)
                      ).filter(Boolean)}
                      category={categoryName}
                      location={service.location || "Rwanda"}
                      provider={service.business_name || service.name}
                      price={service.price_range_min ? `${service.price_range_min.toLocaleString()} RWF` : "Contact"}
                      rating={service.rating}
                      bookings={service.bookings_count}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No services found"
                description={
                  searchTerm
                    ? "We couldn't find any services matching your search. Try different keywords."
                    : selectedCategory === "all"
                      ? "No approved services are currently available."
                      : `No approved services available in the ${currentCategory?.label || ""} category.`
                }
                icon={<Search className="h-16 w-16 mx-auto text-slate-200 mb-2" />}
                action={
                  searchTerm ? (
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm("")}
                      className="rounded-full px-10 h-12 border-slate-200"
                    >
                      Clear Search
                    </Button>
                  ) : undefined
                }
                className="py-24 bg-white rounded-[32px] border border-slate-100 shadow-sm"
              />
            )}
          </div>
        </main>
      </div>

      {/* Schema.org markup for services */}
      {filteredServices.map((service) => (
        <ServiceSchema
          key={service.id}
          service={{
            id: service.id,
            title: service.name,
            provider: service.business_name || "Verified Provider",
            description: service.description || "",
            price: service.price_range_min ? `From ${service.price_range_min} RWF` : "Contact",
            rating: service.rating,
            reviews: service.bookings_count,
            location: service.location || "Rwanda",
            category: service.category,
            image: getThumbnail(service),
          }}
        />
      ))}

      {/* Mobile Bottom Navigation - Only on mobile */}
      <PublicBottomNav />
    </div>
  )
}

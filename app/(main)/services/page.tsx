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

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:pl-10 mx-auto px-4">
      <div className="flex flex-1 flex-col md:flex-row">

        {/* Main Content Area */}
        <main className="flex-1 pb-16 md:pb-8">
          <div className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-10">
              <Badge variant="outline" className="mb-3 px-3 py-1 text-primary border-primary/20 bg-primary/5 font-bold tracking-widest uppercase text-[10px]">
                The Journey Begins Here
              </Badge>
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="max-w-xl">
                  <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-slate-900 leading-tight">
                    Browse Wedding Services
                  </h1>

                </div>
                <div className="w-full lg:w-auto flex gap-4">
                  <div className="relative group flex-1 lg:w-80">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-primary" />
                    <Input
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 bg-white rounded-xl shadow-sm border-slate-200 focus-visible:ring-primary/20"
                    />
                  </div>

                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold gap-2">
                        <Filter className="h-5 w-5" />
                        Categories
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[340px] sm:w-[400px] p-0 border-l-slate-100">
                      <SheetHeader className="p-6 border-b border-slate-50">
                        <SheetTitle className="text-2xl font-bold text-slate-900">Browse Categories</SheetTitle>
                      </SheetHeader>
                      <div className="p-4 h-[calc(100vh-80px)] overflow-y-auto">
                        <CategorySidebar
                          categories={categories}
                          selectedCategory={selectedCategory}
                          onCategoryChange={(val: string) => {
                            setSelectedCategory(val)
                            setIsSheetOpen(false)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className="border-0 shadow-none"
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>

            {/* Category Banner (only for non-'all') */}
            {selectedCategory !== "all" && currentCategory && (
              <div className="mb-8 p-10 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] transition-transform duration-700 group-hover:scale-110">
                  {getCategoryIcon(categoriesResponse?.find(c => c.slug === selectedCategory)?.icon, "w-48 h-48")}
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                      {currentCategory.icon}
                    </div>
                    <Badge variant="secondary" className="font-semibold px-3 py-1">
                      {filteredServices.length} Results
                    </Badge>
                  </div>
                  <h2 className="text-4xl font-bold mb-3 text-slate-900">{currentCategory.label}</h2>
                  <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">{currentCategory.description}</p>
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

            {/* Services Grid */}
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="h-[380px] animate-pulse border-slate-100 shadow-none rounded-2xl overflow-hidden">
                    <div className="aspect-[4/3] bg-slate-50" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-slate-50 rounded-lg w-3/4" />
                      <div className="h-4 bg-slate-50 rounded-lg w-1/2" />
                      <div className="h-24 bg-slate-50 rounded-lg" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
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

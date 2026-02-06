"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Music, Utensils, MapPin, Palette, Mic, Star, Search } from "lucide-react"
import Link from "next/link"
import { PublicBottomNav } from "@/components/ui/public-bottom-nav"
import { ServiceSchema } from "@/components/schemas/service-schema"
import { EmptyState } from "@/components/ui/empty-state"
import { useQuery } from "@tanstack/react-query"
import { apiClient, API_ENDPOINTS, ProviderService, ServiceCategory } from "@/lib/api"
import { ServiceCard } from "@/components/ui/service-card"

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const { data: servicesResponse, isLoading: servicesLoading, error: servicesError } = useQuery({
    queryKey: ["public-services", selectedCategory],
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      const url = `${API_ENDPOINTS.SERVICES.SEARCH}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<ProviderService[]>(url);
      return response.data;
    }
  });

  // Fetch categories from backend - moved up to be accessible
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

  // Map backend categories to icons helper - accessible to whole page
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

  const categoryGroups = [
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

  const getServicesForCategory = (categoryValue: string) => {
    // Since we're filtering by category on the backend, just return filtered services
    return filteredServices
  }

  const getThumbnail = (service: ProviderService) => {
    const firstItem = service.gallery?.[0];
    if (!firstItem) return "/placeholder.svg";
    if (typeof firstItem === "string") return firstItem;
    return firstItem.url || "/placeholder.svg";
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
     

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-3 py-1 text-primary border-primary/20 bg-primary/5 font-bold tracking-widest uppercase text-[10px]">
            The Journey Begins Here
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Browse Wedding Services</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover authentic Rwandan wedding service providers who understand and honor your cultural traditions.
          </p>
       
        </div>

        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search services or providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-base rounded-full shadow-sm hover:shadow-md transition-shadow border-muted focus-visible:ring-primary/20"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="w-full flex overflow-x-auto h-auto justify-start gap-3 bg-transparent mb-12 border-none scrollbar-hide">
            {categoryGroups.map((category) => (
              <TabsTrigger
                key={category.value}
                value={category.value}
                className="flex items-center gap-2 h-11 px-5 rounded-full border border-border bg-white transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-md data-[state=active]:scale-105 flex-shrink-0"
              >
                <div className="transition-transform duration-300">
                  {category.icon}
                </div>
                <span className="hidden sm:inline whitespace-nowrap">{category.label}</span>
                <span className="sm:hidden whitespace-nowrap">{category.label.split(' ')[0]}</span>
                {category.value !== "all" && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {getServicesForCategory(category.value).length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {categoryGroups.map((category) => (
            <TabsContent key={category.value} value={category.value} className="mt-0">
              {/* Category Header */}
              {category.value !== "all" && (
                <div className="mb-6 p-6 bg-white rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-primary">{category.icon}</div>
                    <h2 className="text-2xl font-bold">{category.label}</h2>
                    <Badge variant="outline">
                      {getServicesForCategory(category.value).length} service{getServicesForCategory(category.value).length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground ml-10">{category.description}</p>
                </div>
              )}

              {/* Services Grid */}
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="h-[400px] animate-pulse">
                      <div className="aspect-video bg-muted rounded-t-lg" />
                      <div className="p-6 space-y-4">
                        <div className="h-6 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="h-20 bg-muted rounded" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">
                    <span className="text-lg font-semibold">Error loading services</span>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Unable to load services. Please try again later.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {getServicesForCategory(category.value).map((service) => {
                    // Find category name from category_id
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
              )}

              {/* Empty State */}
              {!isLoading && !error && getServicesForCategory(category.value).length === 0 && (
                <EmptyState
                  title="No services found"
                  description={
                    searchTerm
                      ? "Try adjusting your search or browse other categories."
                      : category.value === "all"
                        ? "No approved services are currently available."
                        : `No approved services available in the ${category.label} category.`
                  }
                  icon={<Search className="h-12 w-12 mx-auto text-muted-foreground" />}
                  action={
                    searchTerm ? (
                      <Button
                        variant="outline"
                        onClick={() => setSearchTerm("")}
                      >
                        Clear Search
                      </Button>
                    ) : undefined
                  }
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
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

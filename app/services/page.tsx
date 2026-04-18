"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Music, Utensils, MapPin, Palette, Mic, Star, Search } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { PublicBottomNav } from "@/components/ui/public-bottom-nav"
import { ServiceSchema } from "@/components/schemas/service-schema"
import { EmptyState } from "@/components/ui/empty-state"
import { useQuery } from "@tanstack/react-query"
import { apiClient, API_ENDPOINTS, ProviderService } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const { data: servicesResponse, isLoading, error } = useQuery({
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

  const services = servicesResponse || [];

  const categoryGroups = [
    {
      value: "all",
      label: "All Services",
      icon: <Search className="h-4 w-4" />,
      description: "Browse all available wedding services"
    },
    {
      value: "traditional-troupe",
      label: "Traditional Troupe",
      icon: <Users className="h-4 w-4" />,
      description: "Authentic cultural dancers and performers"
    },
    {
      value: "music-band",
      label: "Music & Entertainment",
      icon: <Music className="h-4 w-4" />,
      description: "Live bands, musicians, and DJs"
    },
    {
      value: "catering",
      label: "Catering",
      icon: <Utensils className="h-4 w-4" />,
      description: "Traditional and modern cuisine services"
    },
    {
      value: "venue",
      label: "Venue",
      icon: <MapPin className="h-4 w-4" />,
      description: "Beautiful event spaces and locations"
    },
    {
      value: "mc",
      label: "Master of Ceremonies",
      icon: <Mic className="h-4 w-4" />,
      description: "Professional event hosts and MCs"
    },
    {
      value: "decoration",
      label: "Decoration",
      icon: <Palette className="h-4 w-4" />,
      description: "Event decoration and styling services"
    },
  ]

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

  const ServiceCard = ({ service }: { service: ProviderService }) => {
    // Map backend categories to icons
    const getIcon = (category: string) => {
      switch (category.toLowerCase()) {
        case "dance":
        case "traditional-troupe": return <Users className="h-6 w-6" />;
        case "music":
        case "music-band": return <Music className="h-6 w-6" />;
        case "food":
        case "catering": return <Utensils className="h-6 w-6" />;
        case "venue": return <MapPin className="h-6 w-6" />;
        case "mc": return <Mic className="h-6 w-6" />;
        case "decor":
        case "decoration": return <Palette className="h-6 w-6" />;
        default: return <Star className="h-6 w-6" />;
      }
    };

    return (
      <Card className="hover:shadow-xl transition-all duration-300 h-full flex flex-col border-none ring-1 ring-border shadow-sm group overflow-hidden mt-10">
        <div className="aspect-[16/10] bg-muted/20 rounded-t-lg overflow-hidden relative">
          <img
            src={service.gallery?.[0] || "/placeholder.svg"}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Badge variant="secondary" className="absolute top-3 right-3 backdrop-blur-md bg-white/80 shadow-sm border-none font-medium">
            <MapPin className="h-3 w-3 mr-1 text-primary" />
            {service.location || "Rwanda"}
          </Badge>
        </div>
        <CardHeader className="pb-2 pt-5 flex-none px-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="bg-primary/10 p-2 rounded-full text-primary flex-shrink-0">
                {getIcon(service.category)}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg font-bold truncate leading-tight">{service.name}</CardTitle>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-bold mt-0.5">
                  {service.category}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-5 pb-5 flex-1 flex flex-col">
          <CardDescription className="mb-4 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed">
            {service.description || "Top rated wedding service in Rwanda."}
          </CardDescription>

          <div className="flex items-center justify-between mb-5 mt-auto bg-muted/5 p-3 rounded-lg border border-border/50">
            <div className="flex items-center space-x-1.5">
              <div className="flex items-center bg-yellow-400/10 px-2 py-0.5 rounded text-yellow-700 font-bold text-xs ring-1 ring-yellow-400/20">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                {service.rating.toFixed(1)}
              </div>
              <span className="text-xs text-muted-foreground">({service.bookings_count} bookings)</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-tighter">Starting from</span>
              <span className="font-extrabold text-primary text-base">
                {service.price_range_min ? `${service.price_range_min.toLocaleString()} RWF` : "Contact"}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href={`/services/${service.id}`} className="flex-1">
              <Button variant="outline" className="w-full h-10 font-medium transition-colors hover:bg-muted/50">View Details</Button>
            </Link>
            <Link href={`/booking/${service.id}`} className="flex-1">
              <Button className="w-full h-10 shadow-md font-bold hover:translate-y-[-1px] transition-transform">Book Now</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Header */}
      <Navbar />

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-3 py-1 text-primary border-primary/20 bg-primary/5 font-bold tracking-widest uppercase text-[10px]">
            The Journey Begins Here
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Browse Wedding Services</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover authentic Rwandan wedding service providers who understand and honor your cultural traditions.
          </p>
          {/* Debug info - only show in development */}
          {process.env.NODE_ENV === 'development' && services.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              ✅ Showing {services.length} approved and active services only
            </div>
          )}
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
          <TabsList className="w-full flex flex-wrap h-auto justify-center gap-3 bg-transparent mb-12 border-none">
            {categoryGroups.map((category) => (
              <TabsTrigger
                key={category.value}
                value={category.value}
                className="flex items-center gap-2 h-11 px-5 rounded-full border border-border bg-white transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-md data-[state=active]:scale-105"
              >
                <div className="transition-transform duration-300">
                  {category.icon}
                </div>
                <span className="hidden sm:inline">{category.label}</span>
                <span className="sm:hidden">{category.label.split(' ')[0]}</span>
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getServicesForCategory(category.value).map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
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
            provider: "Verified Provider", // Backend doesn't return provider name directly in list yet
            description: service.description || "",
            price: service.price_range_min ? `From ${service.price_range_min} RWF` : "Contact",
            rating: service.rating,
            reviews: service.bookings_count,
            location: service.location || "Rwanda",
            category: service.category,
            image: service.gallery?.[0] || "",
          }}
        />
      ))}

      <Footer />

      {/* Mobile Bottom Navigation - Only on mobile */}
      <PublicBottomNav />
    </div>
  )
}

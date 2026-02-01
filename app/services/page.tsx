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

  const { data: servicesResponse, isLoading } = useQuery({
    queryKey: ["public-services"],
    queryFn: async () => {
      const response = await apiClient.get<ProviderService[]>(API_ENDPOINTS.SERVICES.LIST);
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
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getServicesForCategory = (categoryValue: string) => {
    if (categoryValue === "all") return filteredServices
    return filteredServices.filter(service => service.category === categoryValue)
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
      <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="aspect-video bg-muted/20 rounded-t-lg overflow-hidden relative">
          <img
            src={service.gallery?.[0] || "/placeholder.svg"}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          <Badge variant="secondary" className="absolute top-2 right-2 backdrop-blur-md bg-white/70 shadow-sm border-none">
            {service.location || "Rwanda"}
          </Badge>
        </div>
        <CardHeader className="pb-3 flex-none">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="text-primary flex-shrink-0">{getIcon(service.category)}</div>
              <div className="min-w-0">
                <CardTitle className="text-lg truncate">{service.name}</CardTitle>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  {service.category}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col">
          <CardDescription className="mb-4 line-clamp-2 min-h-[2.5rem]">
            {service.description || "Top rated wedding service in Rwanda."}
          </CardDescription>

          <div className="flex items-center justify-between mb-4 mt-auto">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{service.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({service.bookings_count})</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Price starts</span>
              <span className="font-bold text-primary">
                {service.price_range_min ? `${service.price_range_min.toLocaleString()} RWF` : "Contact"}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/services/${service.id}`} className="flex-1">
              <Button variant="outline" className="w-full h-9">View Details</Button>
            </Link>
            <Link href={`/booking/${service.id}`} className="flex-1">
              <Button className="w-full h-9 shadow-sm">Book</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-[#eff4fa] pb-16 md:pb-0">
      {/* Header */}
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Browse Wedding Services</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover authentic Rwandan wedding service providers who understand and honor your cultural traditions.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search services or providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto justify-start gap-2 bg-transparent mb-8">
            {categoryGroups.map((category) => (
              <TabsTrigger
                key={category.value}
                value={category.value}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {category.icon}
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
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getServicesForCategory(category.value).map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {getServicesForCategory(category.value).length === 0 && (
                <EmptyState
                  title="No services found"
                  description={searchTerm ? "Try adjusting your search or browse other categories." : "No services available in this category yet."}
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

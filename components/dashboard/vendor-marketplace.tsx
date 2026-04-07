"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, MapPin, Heart, Eye, Image as ImageIcon, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS, ProviderService, ServiceCategory } from "@/lib/api";
import { VendorDetailView } from "./vendor-detail-view";
import { VendorRecommendations } from "./vendor-recommendations";

export function VendorMarketplace() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"browse" | "ai">("browse");

  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ["vendor-marketplace-services", selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      const url = `${API_ENDPOINTS.SERVICES.SEARCH}${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await apiClient.get<ProviderService[]>(url);
      return response.data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => {
      const response = await apiClient.categories.getAll<ServiceCategory[]>();
      return response.data || [];
    },
  });

  // Derive unique locations from fetched services
  const locations = ["all", ...Array.from(new Set(services.map((s) => s.location).filter(Boolean) as string[]))];

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.specialties?.some((sp) => sp.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = selectedLocation === "all" || s.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case "rating": return b.rating - a.rating;
      case "price-low": return (a.price_range_min || 0) - (b.price_range_min || 0);
      case "price-high": return (b.price_range_min || 0) - (a.price_range_min || 0);
      case "reviews": return b.bookings_count - a.bookings_count;
      default: return 0;
    }
  });

  const getThumbnail = (service: ProviderService) => {
    const first = service.gallery?.[0];
    if (!first) return null;
    return typeof first === "string" ? first : first.url;
  };

  const getPriceRange = (service: ProviderService) => {
    if (service.price_range_min && service.price_range_max)
      return `${service.price_range_min.toLocaleString()} - ${service.price_range_max.toLocaleString()} RWF`;
    if (service.price_range_min)
      return `From ${service.price_range_min.toLocaleString()} RWF`;
    return "Contact for price";
  };

  const selectedService = selectedVendorId ? services.find((s) => s.id === selectedVendorId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Find Wedding Vendors</h2>
          <p className="text-muted-foreground">Discover trusted Rwandan wedding service providers</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveView("browse")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeView === "browse" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Browse All
          </button>
          <button
            onClick={() => setActiveView("ai")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeView === "ai" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Match
          </button>
        </div>
      </div>

      {activeView === "ai" && <VendorRecommendations />}

      {activeView === "browse" && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc === "all" ? "All Locations" : loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="reviews">Most Bookings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Failed to load vendors. Please try again.</p>
              </CardContent>
            </Card>
          )}

          {/* Vendor Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedServices.map((service) => {
                const thumb = getThumbnail(service);
                const categoryName = categories.find((c) => c.id === service.category_id)?.name || service.category;
                return (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="relative aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/40 overflow-hidden">
                      {thumb ? (
                        <img src={thumb} alt={service.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-primary/50" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {service.status === "approved" || service.status === "active" ? (
                          <Badge variant="default" className="text-xs">Verified</Badge>
                        ) : null}
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{service.business_name || service.name}</CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{service.location || "Rwanda"}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(service.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{service.rating?.toFixed(1) || "0.0"}</span>
                        <span className="text-sm text-muted-foreground">({service.bookings_count} bookings)</span>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Price Range:</span>
                          <span className="font-medium">{getPriceRange(service)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Category:</span>
                          <Badge variant="outline">{categoryName}</Badge>
                        </div>
                      </div>

                      {service.specialties && service.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {service.specialties.slice(0, 2).map((s, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                          {service.specialties.length > 2 && (
                            <Badge variant="secondary" className="text-xs">+{service.specialties.length - 2} more</Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center space-x-2 pt-2">
                        <Button size="sm" className="flex-1" onClick={() => setSelectedVendorId(service.id)}>
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedVendorId(service.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Vendor Detail Modal */}
          {selectedService && (
            <VendorDetailView
              vendor={selectedService}
              onClose={() => setSelectedVendorId(null)}
            />
          )}

          {/* No Results */}
          {!isLoading && !error && sortedServices.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No vendors found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters</p>
                <Button onClick={() => { setSearchTerm(""); setSelectedCategory("all"); setSelectedLocation("all"); }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

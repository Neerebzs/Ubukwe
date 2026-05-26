"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, MapPin, Heart, Image as ImageIcon, Sparkles, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient, API_ENDPOINTS, ProviderService, ServiceCategory } from "@/lib/api";
import { VendorRecommendations } from "./vendor-recommendations";

export function VendorMarketplace() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [activeView, setActiveView] = useState<"browse" | "ai">("browse");
  const [showFilters, setShowFilters] = useState(false);

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
      return `${service.price_range_min.toLocaleString()} – ${service.price_range_max.toLocaleString()} RWF`;
    if (service.price_range_min)
      return `From ${service.price_range_min.toLocaleString()} RWF`;
    return "Contact for price";
  };

  const hasActiveFilters = selectedCategory !== "all" || selectedLocation !== "all" || searchTerm !== "";

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif italic text-slate-800">Find Wedding Vendors</h2>
          <p className="text-sm text-slate-400 mt-0.5">Discover trusted Rwandan wedding service providers</p>
        </div>
        {/* Browse / AI toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveView("browse")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeView === "browse" ? "bg-white text-slate-800" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Browse All
          </button>
          <button
            onClick={() => setActiveView("ai")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeView === "ai" ? "bg-white text-[#668c65]" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Match
          </button>
        </div>
      </div>

      {/* ── AI View ── */}
      {activeView === "ai" && <VendorRecommendations />}

      {/* ── Browse View ── */}
      {activeView === "browse" && (
        <div className="space-y-5">

          {/* Search + filter bar */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, category, specialty…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-2xl bg-white h-11 text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-4 h-11 rounded-2xl text-sm font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-[#668c65] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-white/80" />}
            </button>
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="rounded-xl h-10 text-sm bg-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="rounded-xl h-10 text-sm bg-white">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc === "all" ? "All Locations" : loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="rounded-xl h-10 text-sm bg-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="reviews">Most Bookings</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <button
                  onClick={() => { setSearchTerm(""); setSelectedCategory("all"); setSelectedLocation("all"); setSortBy("rating"); }}
                  className="text-xs text-[#668c65] underline text-left sm:col-span-3"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Results count */}
          {!isLoading && (
            <p className="text-xs text-slate-400 font-medium">
              {sortedServices.length} vendor{sortedServices.length !== 1 ? "s" : ""} found
              {hasActiveFilters && " · filtered"}
            </p>
          )}

          {/* Skeleton loading */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="rounded-2xl bg-slate-100 overflow-hidden">
                  <div className="aspect-[4/3] w-full bg-slate-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-slate-200 rounded-lg w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="flex gap-1">{[1,2,3,4,5].map(s => <div key={s} className="w-3.5 h-3.5 bg-slate-200 rounded" />)}</div>
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-9 bg-slate-200 rounded-xl w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="text-center py-16 rounded-2xl bg-rose-50">
              <p className="text-rose-500 font-medium">Failed to load vendors.</p>
              <p className="text-sm text-slate-400 mt-1">Please check your connection and try again.</p>
            </div>
          )}

          {/* Vendor Grid */}
          {!isLoading && !error && sortedServices.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedServices.map((service) => {
                const thumb = getThumbnail(service);
                const categoryName = categories.find((c) => c.id === service.category_id)?.name || service.category;
                const isVerified = service.status === "approved" || service.status === "active";
                return (
                  <div
                    key={service.id}
                    className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col"
                    onClick={() => router.push(`/services/${service.id}`)}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden flex-shrink-0">
                      {thumb ? (
                        <img src={thumb} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <ImageIcon className="h-12 w-12 text-[#668c65]/30" />
                          <span className="text-[10px] text-[#668c65]/50 font-medium uppercase tracking-widest">No photo</span>
                        </div>
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="px-4 py-2 rounded-full bg-white text-[#668c65] text-xs font-bold">View Details</span>
                      </div>
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {isVerified && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#668c65] text-white text-[10px] font-bold">
                            <ShieldCheck className="h-2.5 w-2.5" /> Verified
                          </span>
                        )}
                      </div>
                      {/* Favourite button */}
                      <button
                        onClick={e => e.stopPropagation()}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center transition-all"
                      >
                        <Heart className="h-3.5 w-3.5 text-slate-400 hover:text-rose-400" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-1 p-4 space-y-2.5">
                      {/* Category pill */}
                      {categoryName && (
                        <span className="self-start text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#668c65]/10 text-[#668c65]">
                          {categoryName}
                        </span>
                      )}

                      {/* Name & location */}
                      <div>
                        <h3 className="font-serif italic text-[15px] font-semibold text-slate-800 leading-snug line-clamp-1">
                          {service.business_name || service.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="text-[11px] text-slate-400">{service.location || "Rwanda"}</span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < Math.floor(service.rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{service.rating?.toFixed(1) || "0.0"}</span>
                        <span className="text-[11px] text-slate-400">({service.bookings_count} bookings)</span>
                      </div>

                      {/* Description */}
                      {service.description && (
                        <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed">{service.description}</p>
                      )}

                      {/* Specialties */}
                      {service.specialties && service.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {service.specialties.slice(0, 2).map((sp, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{sp}</span>
                          ))}
                          {service.specialties.length > 2 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">+{service.specialties.length - 2}</span>
                          )}
                        </div>
                      )}

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between pt-2 mt-auto">
                        <span className="text-[12px] font-semibold text-[#668c65]">{getPriceRange(service)}</span>
                        <button
                          onClick={e => { e.stopPropagation(); router.push(`/services/${service.id}`); }}
                          className="text-[11px] font-bold text-white bg-[#668c65] hover:bg-[#527451] px-3 py-1.5 rounded-xl transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && sortedServices.length === 0 && (
            <div className="text-center py-20 rounded-2xl bg-slate-50">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-serif italic text-lg mb-1">No vendors found</p>
              <p className="text-sm text-slate-400 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => { setSearchTerm(""); setSelectedCategory("all"); setSelectedLocation("all"); }}
                className="px-6 py-2 rounded-full bg-[#668c65] text-white text-sm font-medium hover:bg-[#527451] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

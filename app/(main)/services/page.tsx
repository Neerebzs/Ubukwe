"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Music, Utensils, MapPin, Palette, Mic, Search, SlidersHorizontal, Sparkles } from "lucide-react"
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
      const params = new URLSearchParams()
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }

      const url = `${API_ENDPOINTS.SERVICES.SEARCH}${params.toString() ? `?${params.toString()}` : ''}`
      const response = await apiClient.get<ProviderService[]>(url)
      return response.data
    }
  })

  const { data: categoriesResponse } = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => {
      const response = await apiClient.categories.getAll<ServiceCategory[]>()
      return response.data
    }
  })

  const isLoading = servicesLoading
  const error = servicesError
  const services = servicesResponse || []

  const getCategoryIcon = (iconName: string | undefined, className: string = "h-4 w-4") => {
    switch (iconName?.toLowerCase()) {
      case "users": return <Users className={className} />
      case "music": return <Music className={className} />
      case "utensils": return <Utensils className={className} />
      case "map-pin": return <MapPin className={className} />
      case "mic": return <Mic className={className} />
      case "palette": return <Palette className={className} />
      default: return <Search className={className} />
    }
  }

  const categories = [
    {
      value: "all",
      label: "All Services",
      icon: <Sparkles className="h-4 w-4" />,
      description: "Browse all available wedding services"
    },
    ...(categoriesResponse?.map(cat => ({
      value: cat.slug,
      label: cat.name,
      icon: getCategoryIcon(cat.icon),
      description: cat.description || `Explore ${cat.name} services`
    })) || [])
  ]

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getThumbnail = (service: ProviderService) => {
    const firstItem = service.gallery?.[0]
    if (!firstItem) return "/placeholder.svg"
    if (typeof firstItem === "string") return firstItem
    return firstItem.url || "/placeholder.svg"
  }

  const currentCategory = categories.find(c => c.value === selectedCategory)

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFBF9] space-y-6">
        <div className="relative flex items-center justify-center">
           <div className="absolute w-20 h-20 rounded-full border-[3px] border-slate-200" />
           <div className="absolute w-20 h-20 rounded-full border-[3px] border-[#668c65] border-t-transparent animate-spin" />
           <Search className="w-8 h-8 text-[#668c65] animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-serif italic text-2xl text-slate-900">
            Finding Curated Discoveries...
          </h3>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FCFBF9] flex flex-col md:pl-10 mx-auto pt-20">
      <div className="flex flex-1 flex-col md:flex-row relative">

        {/* Decorative Background Mesh */}
        <div className="fixed top-0 left-0 w-full h-[60vh] opacity-[0.02] pointer-events-none"
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        {/* Main Content Area */}
        <main className="flex-1 pb-24 md:pb-16 relative z-10 w-full">
          
          {/* Aesthetic Hero Header & Search */}
          <div className="px-2 pt-4 pb-4 md:pt-6 md:pb-6 lg:pt-8 lg:pb-6">
            <div className="max-w-4xl mx-auto text-left space-y-4 mb-8 animate-in fade-in slide-in-from-left-4 duration-1000">
              <div className="flex items-center justify-start gap-4">
                <div className="h-[1px] w-8 sm:w-12 bg-[#668c65]/30" />
                <span className="text-[#668c65] font-bold tracking-[0.4em] uppercase text-[10px] sm:text-xs">
                  Exclusive Directory
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-slate-900 leading-[1.1] md:leading-[1] tracking-tight w-full break-words">
                <span className="block font-light">Explore Services</span>
              </h1>
            </div>

            {/* Redesigned Search & Discovery Bar */}
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
              <div className="relative group shadow-2xl shadow-slate-200/50 rounded-[32px] md:rounded-full border border-white bg-white/70 backdrop-blur-xl p-2 sm:p-2.5 flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative flex items-center">
                    <Search className="absolute left-6 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-[#668c65]" />
                    <Input
                      placeholder="What service are you looking for?"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-14 h-14 md:h-16 bg-transparent border-none rounded-full shadow-none focus-visible:ring-0 text-slate-800 text-base md:text-lg placeholder:text-slate-400 w-full"
                    />
                </div>
                
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                     <Button className="h-14 md:h-16 px-8 rounded-[24px] md:rounded-full bg-slate-900 hover:bg-[#668c65] text-white font-bold tracking-widest uppercase text-[10px] md:text-xs transition-colors w-full md:w-auto shadow-md">
                        <SlidersHorizontal className="h-4 w-4 md:mr-3 mr-2" />
                        All Filters
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

              {/* Horizontal Scroll Quick-Categories */}
              <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                 {categories.map((cat, i) => (
                    <button
                       key={i}
                       onClick={() => setSelectedCategory(cat.value)}
                       className={cn(
                          "flex items-center gap-2 whitespace-nowrap px-6 py-3.5 rounded-full text-sm font-semibold transition-all border",
                          selectedCategory === cat.value
                             ? "bg-[#668c65] text-white border-[#668c65] shadow-xl shadow-[#668c65]/30 scale-105"
                             : "bg-white text-slate-600 border-slate-100 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                       )}
                    >
                       <span className={cn("flex items-center justify-center", selectedCategory === cat.value ? "text-white" : "text-[#668c65]")}>
                         {cat.icon}
                       </span>
                       {cat.label}
                    </button>
                 ))}
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 md:px-6">
            {/* Elegant Category Banner (only for non-'all') */}
            {selectedCategory !== "all" && currentCategory && (
              <div className="mb-14 px-8 md:px-16 py-12 md:py-16 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 p-8 opacity-[0.03] transition-transform duration-1000 group-hover:scale-110 pointer-events-none">
                  {getCategoryIcon(categoriesResponse?.find(c => c.slug === selectedCategory)?.icon, "w-96 h-96")}
                </div>
                <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 justify-between items-start md:items-center">
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#668c65]/10 rounded-2xl flex items-center justify-center text-[#668c65] shadow-inner">
                        {currentCategory.icon}
                      </div>
                      <Badge variant="secondary" className="bg-slate-900 text-white font-bold px-4 py-1.5 rounded-full border-none tracking-widest uppercase text-[10px]">
                        {filteredServices.length} {filteredServices.length === 1 ? 'Curated Match' : 'Curated Matches'}
                      </Badge>
                    </div>
                    <div>
                      <h2 className="text-4xl md:text-6xl font-serif italic text-slate-900 mt-2 leading-tight">{currentCategory.label}.</h2>
                      <p className="text-slate-500 text-lg md:text-xl font-light leading-relaxed mt-2">{currentCategory.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Refined Results Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 pb-6 border-b border-slate-100 gap-4">
              <p className="text-sm md:text-base font-medium text-slate-400 tracking-wide">
                <span className="text-slate-900 font-bold">{filteredServices.length}</span> SERVICES ACCESSIBLE
                {searchTerm && <span> FOR "<span className="text-[#668c65] italic">{searchTerm}</span>"</span>}
              </p>
              <div className="hidden sm:block">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                   Curated Directory
                 </p>
              </div>
            </div>

            {/* Grid Results */}
            {error ? (
              <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200">
                <div className="text-rose-500 mb-6 inline-block p-6 bg-rose-50 rounded-full">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-2xl font-serif italic font-bold mb-3 text-slate-900">Directory Unavailable</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto text-lg font-light">
                  There was a problem reaching the curation servers. Please refresh.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="rounded-full px-10 h-14 border-slate-200 hover:bg-slate-50 font-bold tracking-widest uppercase text-[10px]"
                >
                  Refresh Page
                </Button>
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-8 md:gap-10">
                {filteredServices.map((service, index) => {
                  const categoryName = categoriesResponse?.find(
                    (cat) => cat.id === service.category_id
                  )?.name || service.category || "Service"

                  return (
                    <div key={service.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}>
                      <ServiceCard
                        id={service.id}
                        title={service.business_name || service.name}
                        image={getThumbnail(service)}
                        images={service.gallery?.filter((item: any) => {
                          const type = typeof item === 'string' ? 'image' : item.type
                          const contentType = typeof item === 'object' ? item.contentType : null
                          return (!type || type === 'image') && contentType !== 'offer'
                        }).map((item: any) =>
                          typeof item === 'string' ? item : (item.url || item.preview)
                        ).filter(Boolean)}
                        category={categoryName}
                        location={service.location || "Rwanda"}
                        provider={service.business_name || service.name}
                        price={service.price_range_min ? `${service.price_range_min.toLocaleString()} RWF` : "Tailored pricing"}
                        rating={service.rating}
                        bookings={service.bookings_count}
                      />
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                title="No Discoveries Found."
                description={
                  searchTerm
                    ? "We couldn't match any curation to your current search terms. Try refining your keywords."
                    : selectedCategory === "all"
                      ? "No verified services are currently accessible."
                      : `We currently don't have premium services listed under ${currentCategory?.label || "this category"}.`
                }
                icon={<Search className="h-16 w-16 mx-auto text-slate-200 mb-2" />}
                action={
                  searchTerm ? (
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm("")}
                      className="rounded-full px-10 h-14 border-slate-200 font-bold tracking-widest uppercase text-[10px]"
                    >
                      Clear Search
                    </Button>
                  ) : undefined
                }
                className="py-32 bg-white rounded-[40px] border border-slate-50 shadow-xl shadow-slate-100/50"
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

      {/* Mobile Bottom Navigation */}
      <PublicBottomNav />
    </div>
  )
}

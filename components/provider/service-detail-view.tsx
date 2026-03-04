"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Star,
  Phone,
  Mail,
  CheckCircle,
  Package,
  Image as ImageIcon,
  Film,
  PlayCircle,
  Tag,
  Calendar,
  Eye,
  Share2,
  Download,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Clock,
  ShieldCheck,
  Globe
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface GalleryItem {
  id: string
  type: "image" | "video" | "reel"
  contentType?: "offer" | "event" | null
  url: string
  thumbnail?: string
  title?: string
  description?: string
}

interface ServicePackage {
  id: string
  name: string
  price: number
  duration: string
  description: string
  features: string[]
  popular: boolean
}

interface ServiceDetails {
  id: string
  name: string
  category: string
  location: string
  description: string
  specialties: string[]
  priceRangeMin: number
  priceRangeMax: number
  gallery: GalleryItem[]
  packages: ServicePackage[]
  phone?: string
  email?: string
  status: "draft" | "active"
  verified: boolean
  bookings?: number
  rating?: number
  createdAt?: string
  updatedAt?: string
}

interface ServiceDetailViewProps {
  service: ServiceDetails
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  isLoading?: boolean
}

export function ServiceDetailView({
  service,
  onBack,
  onEdit,
  onDelete,
  isLoading = false
}: ServiceDetailViewProps) {
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Debug logging
  console.log("=== SERVICE DETAIL VIEW ===");
  console.log("Service:", service);
  console.log("Gallery:", service.gallery);
  console.log("Gallery length:", service.gallery?.length);
  console.log("Gallery items:", service.gallery);
  console.log("===========================");

  if (isLoading) {
    return <ServiceDetailSkeleton />
  }

  const regularMedia = service.gallery.filter(item => !item.contentType)
  const offers = service.gallery.filter(item => item.contentType === "offer")
  const events = service.gallery.filter(item => item.contentType === "event")
  const images = regularMedia.filter(item => item.type === "image")
  const reels = regularMedia.filter(item => item.type === "reel")
  const videos = regularMedia.filter(item => item.type === "video")

  console.log("=== GALLERY BREAKDOWN ===");
  console.log("Regular media:", regularMedia.length);
  console.log("Images:", images.length, images);
  console.log("Reels:", reels.length);
  console.log("Videos:", videos.length);
  console.log("Offers:", offers.length);
  console.log("Events:", events.length);
  console.log("========================");

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Navigation Header */}
      <div className="flex items-center justify-between sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 border-b border-slate-100 -mx-4 px-4 sm:mx-0 sm:px-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-slate-500 hover:text-sage-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex border-slate-200 text-slate-600 hover:bg-slate-50">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit} className="border-slate-200 text-slate-600 hover:bg-slate-50">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive border-slate-200 hover:bg-red-50 hover:border-red-100">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="bg-sage-50 text-sage-700 hover:bg-sage-100 border-sage-100 uppercase tracking-wider text-[10px] px-2 py-0.5 font-bold">
                {service.category}
              </Badge>
              <Badge
                className={cn(
                  "uppercase tracking-wider text-[10px] px-2 py-0.5 font-bold border-none",
                  service.status === "active" ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                )}
              >
                {service.status}
              </Badge>
              {service.verified && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 uppercase tracking-wider text-[10px] px-2 py-0.5 font-bold">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Verified Provider
                </Badge>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
              {service.name}
            </h1>

            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-slate-500 font-medium">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-1.5 text-sage-600" />
                {service.location}, Rwanda
              </div>
              {service.rating && (
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-1.5 text-yellow-400 fill-current" />
                  <span className="text-slate-900 font-bold mr-1">{service.rating}</span>
                  <span className="text-sm font-normal text-slate-400">Rating</span>
                </div>
              )}
              {service.bookings !== undefined && (
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-1.5 text-slate-400" />
                  <span className="text-slate-900 font-bold mr-1">{service.bookings}</span>
                  <span className="text-sm font-normal text-slate-400">Bookings</span>
                </div>
              )}
            </div>
          </div>

          {/* Featured Image / Desktop Gallery Preview */}
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-100 shadow-xl group">
            {service.gallery && service.gallery.length > 0 ? (
              <img
                src={service.gallery[0].url}
                alt={service.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-slate-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            <Button
              className="absolute bottom-6 right-6 bg-white/90 backdrop-blur hover:bg-white text-slate-900 font-bold rounded-full shadow-lg"
              onClick={() => setActiveTab("gallery")}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              View Gallery
            </Button>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-50/50 rounded-3xl p-6">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Starting From</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {service.priceRangeMin.toLocaleString()}
                  </span>
                  <span className="text-lg font-bold text-slate-500 uppercase">RWF</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">Up to {service.priceRangeMax.toLocaleString()} RWF</p>
              </div>

              <Separator className="bg-slate-200" />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", service.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400')} />
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Categories</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{service.category}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full bg-sage-600 hover:bg-sage-700 text-white font-bold h-12 rounded-xl shadow-md transition-all active:scale-95">
                  <Award className="w-4 h-4 mr-2" />
                  Request Verification
                </Button>
                <Button variant="outline" className="w-full border-slate-200 text-slate-600 font-bold h-12 rounded-xl transition-all">
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Availability
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-3xl p-6">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-sage-600" />
              Contact Details
            </h4>
            <div className="space-y-4">
              {service.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{service.phone}</p>
                  </div>
                </div>
              )}
              {service.email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{service.email}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-8">
        <div className="border-b border-slate-100 flex overflow-x-auto no-scrollbar">
          <TabsList className="bg-transparent h-auto p-0 flex rounded-none gap-8">
            <TabsTrigger
              value="overview"
              className="px-0 py-4 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-sage-600 rounded-none text-slate-500 font-bold text-sm transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="packages"
              className="px-0 py-4 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-sage-600 rounded-none text-slate-500 font-bold text-sm transition-all text-nowrap"
            >
              Packages ({service.packages.length})
            </TabsTrigger>
            <TabsTrigger
              value="gallery"
              className="px-0 py-4 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-sage-600 rounded-none text-slate-500 font-bold text-sm transition-all"
            >
              Gallery ({regularMedia.length})
            </TabsTrigger>
            <TabsTrigger
              value="promotional"
              className="px-0 py-4 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-sage-600 rounded-none text-slate-500 font-bold text-sm transition-all"
            >
              Promos ({offers.length + events.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Service Description</h3>
                <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                  {service.description}
                </p>
              </section>

              {service.specialties.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-sage-600" />
                    Specialties & Expertise
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {service.specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center px-4 py-2 bg-slate-50 text-slate-700 rounded-2xl border border-slate-100 font-medium text-sm">
                        <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                        {specialty}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-6">
              <Card className="border-none bg-sage-50 shadow-sm p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Package className="w-24 h-24" />
                </div>
                <h4 className="font-bold text-sage-900 mb-2">Package Overview</h4>
                <p className="text-sage-700/80 text-sm mb-4">Choose from our curated wedding packages designed for excellence.</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sage-900 font-medium">Available Packages</span>
                    <span className="bg-white px-2 py-0.5 rounded-full text-sage-900 font-bold">{service.packages.length}</span>
                  </div>
                  <Separator className="bg-sage-200/50" />
                  {service.packages.slice(0, 3).map(pkg => (
                    <div key={pkg.id} className="flex items-center gap-2 text-sm text-sage-900 font-medium">
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                      {pkg.name}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-none shadow-sm bg-slate-900 text-white p-6 rounded-3xl">
                <h4 className="font-bold mb-4 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-sage-400" />
                  Quick Stats
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Revenue Grade</p>
                    <p className="text-lg font-bold">Premium</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Satisfaction</p>
                    <p className="text-lg font-bold">{service.rating || 'N/A'}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-6 pt-6">
          {service.packages.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent py-12">
              <CardContent className="text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 font-medium">No packages created for this service yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {service.packages.map((pkg) => (
                <Card key={pkg.id} className={cn(
                  "relative group overflow-hidden border-none shadow-sm transition-all duration-300 hover:shadow-md h-full flex flex-col rounded-3xl",
                  pkg.popular ? "ring-2 ring-sage-600 bg-sage-50/30" : "bg-white"
                )}>
                  {pkg.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-sage-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                        Popular
                      </div>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-sage-700 transition-colors">
                      {pkg.name}
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-sm line-clamp-2 mt-1">
                      {pkg.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-900">{pkg.price.toLocaleString()}</span>
                      <span className="text-sm font-bold text-slate-400 uppercase">RWF</span>
                      <span className="text-xs text-slate-400 ml-2">/ {pkg.duration}</span>
                    </div>

                    <Separator className="bg-slate-100" />

                    <div className="space-y-3 flex-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Features Included</p>
                      <ul className="space-y-2.5">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm text-slate-600">
                            <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className={cn(
                      "w-full font-bold py-6 rounded-2xl transition-all active:scale-95",
                      pkg.popular ? "bg-sage-600 hover:bg-sage-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                    )}>
                      {pkg.popular ? "Best Value" : "Select Package"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-8 pt-6">
          {regularMedia.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-slate-200" />
              <h4 className="text-xl font-bold text-slate-900">Your gallery is empty</h4>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">Add photos and videos to showcase your work to potential customers.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Images Grid */}
              {images.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center">
                      <ImageIcon className="w-5 h-5 mr-2 text-sage-600" />
                      Photography
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                        onClick={() => setSelectedGalleryItem(item)}
                      >
                        <img
                          src={item.url}
                          alt={item.title || "Gallery image"}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Video Content */}
              {(reels.length > 0 || videos.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {reels.length > 0 && (
                    <section>
                      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <Film className="w-5 h-5 mr-2 text-purple-600" />
                        Reels & Shorts
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {reels.map((item) => (
                          <div key={item.id} className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 shadow-lg group">
                            <video src={item.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" preload="metadata" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <PlayCircle className="w-12 h-12 text-white/50 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <p className="text-white text-xs font-bold truncate drop-shadow-md">{item.title || "Wedding Highlight"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {videos.length > 0 && (
                    <section>
                      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <PlayCircle className="w-5 h-5 mr-2 text-blue-600" />
                        Full Videos
                      </h3>
                      <div className="space-y-4">
                        {videos.map((item) => (
                          <div key={item.id} className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-lg group">
                            <video src={item.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" preload="metadata" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <PlayCircle className="w-16 h-16 text-white/50 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="absolute bottom-6 left-6 right-6">
                              <h4 className="text-white font-bold text-lg drop-shadow-md">{item.title || "Full Coverage"}</h4>
                              <p className="text-white/70 text-sm line-clamp-1">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Promotional Tab */}
        <TabsContent value="promotional" className="space-y-8 pt-6">
          {(offers.length === 0 && events.length === 0) ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Tag className="w-16 h-16 mx-auto mb-4 text-slate-200" />
              <h4 className="text-xl font-bold text-slate-900">No active promotions</h4>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">Create exclusive offers and events to attract more couples.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Offers Section */}
              {offers.length > 0 && (
                <section className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-sage-600" />
                    Special Offers
                  </h3>
                  <div className="space-y-4">
                    {offers.map((item) => (
                      <Card key={item.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl bg-white border border-slate-100">
                        <div className="flex flex-col sm:flex-row h-full">
                          <div className="relative w-full sm:w-40 aspect-square sm:aspect-auto overflow-hidden">
                            <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-sage-600 text-white text-[10px] font-bold">OFFER</Badge>
                            </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                              <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                            </div>
                            <Button variant="link" className="text-sage-600 p-0 h-auto font-bold text-xs self-start mt-3 group-hover:translate-x-1 transition-transform">
                              Redeem details <ChevronRight className="w-3 h-3 ml-0.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Events Section */}
              {events.length > 0 && (
                <section className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                    Upcoming Events
                  </h3>
                  <div className="space-y-4">
                    {events.map((item) => (
                      <Card key={item.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl bg-white border border-slate-100">
                        <div className="flex flex-col sm:flex-row h-full">
                          <div className="relative w-full sm:w-40 aspect-square sm:aspect-auto overflow-hidden">
                            <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-purple-600 text-white text-[10px] font-bold">EVENT</Badge>
                            </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                              <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                            </div>
                            <Button variant="link" className="text-purple-600 p-0 h-auto font-bold text-xs self-start mt-3 group-hover:translate-x-1 transition-transform">
                              Event schedule <ChevronRight className="w-3 h-3 ml-0.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </TabsContent>

        {/* Contact Tab is now partially in sidebar, but we can keep it as a fallback or detailed view */}
        <TabsContent value="contact" className="pt-6">
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Connect with Us</h3>
                  <p className="text-slate-500">Reach out directly for customized quotes and bookings.</p>
                </div>

                <div className="space-y-6">
                  {service.phone && (
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-sage-50 flex items-center justify-center text-sage-600 group-hover:bg-sage-600 group-hover:text-white transition-all duration-300">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                        <p className="text-lg font-bold text-slate-900">{service.phone}</p>
                      </div>
                    </div>
                  )}

                  {service.email && (
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                        <p className="text-lg font-bold text-slate-900">{service.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Website</p>
                      <p className="text-lg font-bold text-slate-900">www.ubukwe.com/p/{service.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1 bg-sage-600 hover:bg-sage-700 h-12 rounded-xl font-bold">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="flex-1 border-slate-200 h-12 rounded-xl font-bold">
                    <Mail className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>

              <div className="bg-slate-900 p-8 flex flex-col justify-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <ShieldCheck className="w-64 h-64" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 bg-sage-500/20 rounded-2xl flex items-center justify-center text-sage-400">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold mb-2">Verified Professional</h4>
                    <p className="text-slate-400 leading-relaxed">This provider has been vetted by the Ubukwe Hub team for quality, reliability, and professional excellence.</p>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <div className="w-5 h-5 rounded-full bg-sage-500/10 flex items-center justify-center text-sage-400 overflow-hidden">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                      Identity Verified
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <div className="w-5 h-5 rounded-full bg-sage-500/10 flex items-center justify-center text-sage-400 overflow-hidden">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                      Quality Vetted Gallery
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <div className="w-5 h-5 rounded-full bg-sage-500/10 flex items-center justify-center text-sage-400 overflow-hidden">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                      Registered Business
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Metadata */}
      {(service.createdAt || service.updatedAt) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              {service.createdAt && (
                <span>Created: {new Date(service.createdAt).toLocaleDateString()}</span>
              )}
              {service.updatedAt && (
                <span>Last updated: {new Date(service.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Loading Skeleton
function ServiceDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between py-4 border-b">
        <Skeleton className="h-9 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-12 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          <Skeleton className="aspect-video w-full rounded-3xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-80 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
      </div>

      <Skeleton className="h-12 w-full mt-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    </div>
  )
}

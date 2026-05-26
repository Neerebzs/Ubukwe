"use client"

import { useState, useRef } from "react"
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
  Globe,
  Upload,
  Plus,
  X,
  Loader2,
  Camera,
  Video,
  Clapperboard,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { AddPromotionModal } from "./add-promotion-modal"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"

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
  const [showPromotionModal, setShowPromotionModal] = useState(false)

  // Gallery management state
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(service.gallery)
  const [uploadingType, setUploadingType] = useState<"image" | "video" | "reel" | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const reelInputRef = useRef<HTMLInputElement>(null)

  if (isLoading) {
    return <ServiceDetailSkeleton />
  }

  const handlePromotionSuccess = () => {
    window.location.reload()
  }

  // Upload a new gallery item
  const handleGalleryUpload = async (file: File, type: "image" | "video" | "reel") => {
    setUploadingType(type)
    try {
      const folder = type === "image" ? "ubukwe/gallery" : type === "reel" ? "ubukwe/reels" : "ubukwe/videos"
      const resourceType = type === "image" ? "image" : "video"
      const uploadRes = await apiClient.upload.general(file, folder, resourceType)
      const url: string = uploadRes.data?.url
      if (!url) throw new Error("Upload failed — no URL returned")

      let thumbnail: string | undefined
      if (type === "image") {
        thumbnail = url.replace("/upload/", "/upload/c_thumb,w_200/")
      } else {
        thumbnail = url.replace("/upload/", "/upload/so_0/").replace(/\.[^.]+$/, ".jpg")
      }

      const res = await apiClient.providerServices.addGalleryItem(service.id, {
        type,
        url,
        thumbnail,
        title: file.name.replace(/\.[^.]+$/, ""),
        description: "",
        contentType: null,
      })

      const updatedGallery: GalleryItem[] = (res.data?.gallery ?? []).map((item: any) => ({
        id: item.id,
        type: item.type,
        contentType: item.contentType ?? null,
        url: item.url,
        thumbnail: item.thumbnail,
        title: item.title ?? "",
        description: item.description ?? "",
      }))
      setGalleryItems(updatedGallery)
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added to gallery`)
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed")
    } finally {
      setUploadingType(null)
    }
  }

  // Remove a gallery item
  const handleGalleryDelete = async (itemId: string) => {
    setDeletingId(itemId)
    try {
      await apiClient.providerServices.removeGalleryItem(service.id, itemId)
      setGalleryItems(prev => prev.filter(i => i.id !== itemId))
      toast.success("Gallery item removed")
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to remove item")
    } finally {
      setDeletingId(null)
    }
  }

  const regularMedia = galleryItems.filter(item => !item.contentType)
  const offers = galleryItems.filter(item => item.contentType === "offer")
  const events = galleryItems.filter(item => item.contentType === "event")
  const images = regularMedia.filter(item => item.type === "image")
  const reels = regularMedia.filter(item => item.type === "reel")
  const videos = regularMedia.filter(item => item.type === "video")

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Navigation Header */}
      <div className="flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-xl py-6 border-b border-slate-50 -mx-4 px-4 sm:mx-0 sm:px-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#668c65] transition-all group px-2 sm:px-4"
        >
          <ArrowLeft className="h-4 w-4 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" className="hidden sm:flex rounded-xl text-[10px] font-black uppercase tracking-widest text-[#668c65] bg-[#668c65]/5 hover:bg-[#668c65]/10 h-10 px-5">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit} className="rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 h-10 px-3 sm:px-5 transition-all">
            <Edit className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 h-10 px-3 sm:px-5 transition-all">
            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-[#668c65]/10 text-[#668c65] border-none uppercase tracking-[0.2em] text-[8px] px-3 py-1 font-black rounded-full">
                {service.category} Service
              </Badge>
              <Badge
                className={cn(
                  "uppercase tracking-[0.2em] text-[8px] px-3 py-1 font-black border-none rounded-full",
                  service.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                )}
              >
                {service.status.toUpperCase()} Status
              </Badge>
              {service.verified && (
                <Badge className="bg-indigo-50 text-indigo-600 border-none uppercase tracking-[0.2em] text-[8px] px-3 py-1 font-black rounded-full">
                  <ShieldCheck className="w-3 h-3 mr-1.5" />
                  Verified Service
                </Badge>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic tracking-tighter text-slate-900 leading-[0.95] sm:leading-[0.9]">
              {service.name}
            </h1>

            <div className="flex flex-wrap items-center gap-y-4 gap-x-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <div className="flex items-center group/item">
                <MapPin className="w-4 h-4 mr-2 text-[#668c65] group-hover/item:scale-110 transition-transform" />
                {service.location}
              </div>
              {service.rating && (
                <div className="flex items-center group/item">
                  <Star className="w-4 h-4 mr-2 text-amber-400 fill-current group-hover/item:scale-110 transition-transform" />
                  <span className="text-slate-900 mr-2">{service.rating}</span>
                  Rating
                </div>
              )}
              {service.bookings !== undefined && (
                <div className="flex items-center group/item">
                  <TrendingUp className="w-4 h-4 mr-2 text-[#668c65] group-hover/item:scale-110 transition-transform" />
                  <span className="text-slate-900 mr-2">{service.bookings}</span>
                  Bookings
                </div>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden bg-slate-50 shadow-2xl shadow-slate-200/50 group">
            {service.gallery && service.gallery.length > 0 ? (
              <img
                src={service.gallery[0].url}
                alt={service.name}
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-20 h-20 text-slate-100" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 pointer-events-none" />
            <div className="absolute bottom-8 right-8">
              <Button
                className="bg-white/90 backdrop-blur-md hover:bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl px-6 h-12 shadow-xl shadow-black/10 transition-all active:scale-95 group/btn"
                onClick={() => setActiveTab("gallery")}
              >
                <ImageIcon className="w-4 h-4 mr-3 group-hover/btn:rotate-12 transition-transform" />
                View Gallery
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="flex flex-col gap-8 h-full">
          <Card className="border-none shadow-none bg-[#668c65]/5 rounded-[2.5rem] p-6 md:p-10 border border-[#668c65]/10 flex flex-col justify-between flex-1">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.3em] mb-3">Service Pricing</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-serif italic text-slate-900 tracking-tighter">
                    {service.priceRangeMin.toLocaleString()}
                  </span>
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">RWF</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-1">Up to: {service.priceRangeMax.toLocaleString()} RWF</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white rounded-3xl border border-slate-50 shadow-sm">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current Status</p>
                  <p className="text-[10px] font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-widest">
                    <span className={cn("w-2 h-2 rounded-full", service.status === 'active' ? 'bg-[#668c65]' : 'bg-slate-300')} />
                    {service.status}
                  </p>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-slate-50 shadow-sm">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</p>
                  <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-widest">{service.category}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Button className="w-full bg-[#668c65] hover:bg-[#5a7b59] text-white text-[10px] font-black uppercase tracking-[0.2em] h-14 rounded-2xl shadow-xl shadow-[#668c65]/20 transition-all active:scale-[0.98]">
                  <Award className="w-4 h-4 mr-3" />
                  Verify Service
                </Button>
                <Button variant="ghost" className="w-full bg-white text-[#668c65] hover:bg-[#668c65]/5 text-[10px] font-black uppercase tracking-[0.2em] h-14 rounded-2xl border border-[#668c65]/10 shadow-sm">
                  <Calendar className="w-4 h-4 mr-3" />
                  View History
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-none bg-white rounded-[2rem] p-6 md:p-8 border border-slate-50 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-900 mb-6 flex items-center uppercase tracking-widest group">
              <Mail className="w-4 h-4 mr-3 text-[#668c65] group-hover:rotate-12 transition-transform" />
              Contact Details
            </h4>
            <div className="space-y-6">
              {service.phone && (
                <div className="flex items-center gap-4 group/item">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-[#668c65] group-hover/item:bg-[#668c65]/5 transition-all flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                    <p className="text-sm font-serif italic text-slate-900 truncate">{service.phone}</p>
                  </div>
                </div>
              )}
              {service.email && (
                <div className="flex items-center gap-4 group/item">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:text-[#668c65] group-hover/item:bg-[#668c65]/5 transition-all flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
                    <p className="text-sm font-serif italic text-slate-900 truncate">{service.email}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-12">
        <div className="flex w-full bg-transparent border-b border-slate-100 rounded-none h-auto p-0 mb-8 overflow-x-auto scrollbar-hide">
          <TabsList className="bg-transparent h-auto p-0 flex rounded-none gap-6 sm:gap-12 min-w-max">
            {[
              { id: "overview", label: "Overview" },
              { id: "packages", label: `Packages (${service.packages.length})` },
              { id: "gallery", label: `Gallery (${regularMedia.length})` },
              { id: "promotional", label: `Promotions & Events (${offers.length + events.length})` },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="px-0 py-5 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#668c65] data-[state=active]:text-[#668c65] rounded-none text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 border-transparent text-nowrap"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-12 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-12">
              <section className="space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <div className="h-[1px] w-6 bg-[#668c65]/40" />
                  <h3 className="text-[10px] font-black text-[#668c65] uppercase tracking-[0.4em]">Description</h3>
                </div>
                <p className="text-slate-600 leading-[1.6] text-xl font-light italic whitespace-pre-wrap">
                  "{service.description}"
                </p>
              </section>

              {service.specialties.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-[1px] w-6 bg-[#668c65]/40" />
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Service Specialties</h3>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {service.specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center px-6 py-3 bg-white text-slate-900 rounded-[1.5rem] border border-slate-100 shadow-sm font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-50">
                        <CheckCircle className="w-3.5 h-3.5 mr-3 text-[#668c65]" />
                        {specialty}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-8">
              <Card className="border-none bg-[#668c65]/5 shadow-none p-6 md:p-8 rounded-[2rem] relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                  <Package className="w-40 h-40" />
                </div>
                <h4 className="text-[10px] font-black text-[#668c65] mb-4 uppercase tracking-widest">About Packages</h4>
                <p className="text-slate-500 font-light italic text-sm mb-6 leading-relaxed">Choose the perfect tier that fits your special day.</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-900">Available Packages</span>
                    <span className="bg-white px-3 py-1 rounded-full text-[#668c65] border border-[#668c65]/10 shadow-sm">{service.packages.length}</span>
                  </div>
                  <div className="h-[1px] w-full bg-[#668c65]/10" />
                  {service.packages.slice(0, 3).map(pkg => (
                    <div key={pkg.id} className="flex items-center gap-3 text-[10px] font-black text-slate-900 uppercase tracking-widest group/pkg">
                      <ChevronRight className="w-3.5 h-3.5 text-[#668c65] group-hover/pkg:translate-x-1 transition-transform" />
                      {pkg.name}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-none shadow-none bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-900/10">
                <h4 className="text-[10px] font-black mb-6 flex items-center uppercase tracking-[0.2em] text-slate-500">
                  <TrendingUp className="w-4 h-4 mr-3 text-[#668c65]" />
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Price Tier</p>
                    <p className="text-xl font-serif italic text-white leading-tight">Premium</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Audience Rating</p>
                    <p className="text-xl font-serif italic text-white leading-tight">{service.rating || 'Awaiting'} <span className="text-[8px] font-sans not-italic text-slate-500">/ 5.0</span></p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-10 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {service.packages.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
              <Package className="w-16 h-16 mx-auto mb-6 text-slate-100" />
              <h4 className="text-xl font-serif italic text-slate-900 mb-2">No packages added yet</h4>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Create your first package to show pricing options</p>
            </div>
          ) : (
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {service.packages.map((pkg) => (
                <Card key={pkg.id} className={cn(
                  "relative group overflow-hidden border-none shadow-none transition-all duration-500 h-full flex flex-col rounded-[2.5rem]",
                  pkg.popular ? "bg-[#668c65]/5 border border-[#668c65]/20" : "bg-white border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50"
                )}>
                  {pkg.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-[#668c65] text-white text-[8px] font-black px-4 py-1.5 rounded-bl-[1.5rem] uppercase tracking-[0.2em]">
                        Popular Choice
                      </div>
                    </div>
                  )}
                  <CardHeader className="p-10 pb-6">
                    <CardTitle className="text-2xl font-serif italic text-slate-900 group-hover:text-[#668c65] transition-colors leading-tight">
                      {pkg.name}
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">
                      {pkg.description.slice(0, 60)}...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-10 pt-0 space-y-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl md:text-4xl font-serif italic text-slate-900 tracking-tighter">{pkg.price.toLocaleString()}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RWF / {pkg.duration}</span>
                    </div>

                    <div className="h-[1px] w-full bg-slate-100" />

                    <div className="space-y-4 flex-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">What's Included</p>
                      <ul className="space-y-3">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            <div className="mt-0.5 w-4 h-4 rounded-full bg-[#668c65]/10 flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="w-2.5 h-2.5 text-[#668c65]" />
                            </div>
                            <span className="leading-tight">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className={cn(
                      "w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95",
                      pkg.popular ? "bg-[#668c65] hover:bg-[#5a7b59] text-white shadow-xl shadow-[#668c65]/20" : "bg-slate-50 hover:bg-slate-100 text-slate-900"
                    )}>
                      {pkg.popular ? "Select Plan" : "Choose Package"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Gallery Tab */}
        < TabsContent value="gallery" className="space-y-12 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700" >
          {/* Hidden file inputs */}
          <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? [])
              for (const file of files) await handleGalleryUpload(file, "image")
              e.target.value = ""
            }}
          />
          <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) await handleGalleryUpload(file, "video")
              e.target.value = ""
            }}
          />
          <input ref={reelInputRef} type="file" accept="video/*" className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) await handleGalleryUpload(file, "reel")
              e.target.value = ""
            }}
          />

          {/* Upload toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-6 bg-[#668c65]/40" />
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">
                Gallery ({regularMedia.length} items)
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                variant="outline"
                disabled={uploadingType === "image"}
                onClick={() => imageInputRef.current?.click()}
                className="rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-widest h-10 px-5 hover:bg-[#668c65]/5 hover:border-[#668c65]/30 transition-all"
              >
                {uploadingType === "image" ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Camera className="h-3.5 w-3.5 mr-2" />}
                Add Photo
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={uploadingType === "video"}
                onClick={() => videoInputRef.current?.click()}
                className="rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-widest h-10 px-5 hover:bg-[#668c65]/5 hover:border-[#668c65]/30 transition-all"
              >
                {uploadingType === "video" ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Video className="h-3.5 w-3.5 mr-2" />}
                Add Video
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={uploadingType === "reel"}
                onClick={() => reelInputRef.current?.click()}
                className="rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-widest h-10 px-5 hover:bg-[#668c65]/5 hover:border-[#668c65]/30 transition-all"
              >
                {uploadingType === "reel" ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Clapperboard className="h-3.5 w-3.5 mr-2" />}
                Add Reel
              </Button>
            </div>
          </div>

          {/* Upload progress indicator */}
          {uploadingType && (
            <div className="flex items-center gap-3 px-6 py-4 bg-[#668c65]/5 rounded-2xl border border-[#668c65]/10">
              <Loader2 className="h-4 w-4 text-[#668c65] animate-spin flex-shrink-0" />
              <p className="text-[10px] font-black text-[#668c65] uppercase tracking-widest">
                Uploading {uploadingType}…
              </p>
            </div>
          )}

          {regularMedia.length === 0 && !uploadingType ? (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
              <ImageIcon className="w-16 h-16 mx-auto mb-6 text-slate-100" />
              <h4 className="text-xl font-serif italic text-slate-900 mb-2">No media yet</h4>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">
                Use the buttons above to add photos, videos, or reels
              </p>
              <div className="flex justify-center gap-3">
                <Button size="sm" onClick={() => imageInputRef.current?.click()} className="rounded-2xl bg-[#668c65] hover:bg-[#5a7b59] text-white shadow-lg shadow-[#668c65]/20 px-6 h-11">
                  <Camera className="h-4 w-4 mr-2" /> Add Photo
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-20">
              {/* Images Grid */}
              {images.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-10">
                    <div className="h-[1px] w-6 bg-[#668c65]/40" />
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Photos ({images.length})</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images.map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-square rounded-[2rem] overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-700"
                      >
                        <img
                          src={item.url}
                          alt={item.title || "Gallery image"}
                          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 cursor-pointer"
                          onClick={() => setSelectedGalleryItem(item)}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-3">
                          <button
                            onClick={() => setSelectedGalleryItem(item)}
                            className="bg-white/10 backdrop-blur-xl p-3 rounded-full border border-white/20 text-white hover:bg-white/20 transition-all"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleGalleryDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="bg-red-500/80 backdrop-blur-xl p-3 rounded-full border border-red-400/20 text-white hover:bg-red-600 transition-all disabled:opacity-50"
                          >
                            {deletingId === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Video Content */}
              {(reels.length > 0 || videos.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {reels.length > 0 && (
                    <section className="space-y-10">
                      <div className="flex items-center gap-3">
                        <div className="h-[1px] w-6 bg-indigo-400/40" />
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Cinematic Reels ({reels.length})</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        {reels.map((item) => (
                          <div key={item.id} className="relative aspect-[9/16] rounded-[2rem] overflow-hidden bg-slate-950 shadow-2xl border border-white/5 group">
                            <video
                              src={item.url}
                              controls
                              preload="metadata"
                              className="w-full h-full object-contain bg-black rounded-[2rem]"
                            />
                            {item.title && (
                              <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none rounded-b-[2rem]">
                                <p className="text-white text-[10px] font-black uppercase tracking-widest drop-shadow-lg">{item.title}</p>
                              </div>
                            )}
                            <button
                              onClick={() => handleGalleryDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="absolute top-3 right-3 bg-red-500/80 backdrop-blur-xl p-2 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all disabled:opacity-50 z-10"
                            >
                              {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {videos.length > 0 && (
                    <section className="space-y-10">
                      <div className="flex items-center gap-3">
                        <div className="h-[1px] w-6 bg-emerald-400/40" />
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Full Videos ({videos.length})</h3>
                      </div>
                      <div className="space-y-6">
                        {videos.map((item) => (
                          <div key={item.id} className="relative aspect-video rounded-[2rem] overflow-hidden bg-slate-950 shadow-2xl border border-white/5 group">
                            <video
                              src={item.url}
                              controls
                              preload="metadata"
                              className="w-full h-full object-contain bg-black rounded-[2rem]"
                            />
                            {item.title && (
                              <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-black/70 to-transparent pointer-events-none rounded-b-[2rem]">
                                <h4 className="text-white font-serif italic text-lg drop-shadow-xl">{item.title}</h4>
                                {item.description && (
                                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1">{item.description}</p>
                                )}
                              </div>
                            )}
                            <button
                              onClick={() => handleGalleryDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="absolute top-3 right-3 bg-red-500/80 backdrop-blur-xl p-2 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all disabled:opacity-50 z-10"
                            >
                              {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          )}
        </TabsContent >

        {/* Promotional Tab */}
        < TabsContent value="promotional" className="space-y-12 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700" >
          {/* Add Promotion/Offer Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-6 bg-[#668c65]/40" />
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Manage Promotions</h3>
            </div>
            <Button 
              onClick={() => setShowPromotionModal(true)}
              className="rounded-2xl bg-[#668c65] hover:bg-[#5a7b59] text-white shadow-lg shadow-[#668c65]/20 px-6 h-12 transition-all duration-300 group"
            >
              <Tag className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
              <span className="font-bold tracking-tight uppercase text-[10px]">Add Promotion</span>
            </Button>
          </div>

          {(offers.length === 0 && events.length === 0) ? (
            <div className="text-center py-24 bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem]">
              <Tag className="w-16 h-16 mx-auto mb-6 text-slate-100" />
              <h4 className="text-xl font-serif italic text-slate-900 mb-2">No active promotions found</h4>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">Create special offers to attract new clients</p>
              <Button 
                onClick={() => setShowPromotionModal(true)}
                size="lg"
                className="rounded-2xl bg-[#668c65] hover:bg-[#5a7b59] text-white shadow-xl shadow-[#668c65]/20 px-8 h-12"
              >
                <Tag className="h-5 w-5 mr-2" />
                Create First Promotion
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Offers Section */}
              {offers.length > 0 && (
                <section className="space-y-10">
                  <div className="flex items-center gap-3">
                    <div className="h-[1px] w-6 bg-amber-400/40" />
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Special Offers</h3>
                  </div>
                  <div className="space-y-6">
                    {offers.map((item) => (
                      <Card key={item.id} className="group overflow-hidden border-none bg-white shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-700 rounded-[2rem] border border-slate-50">
                        <div className="flex flex-col sm:flex-row h-full">
                          <div className="relative w-full sm:w-48 aspect-square sm:aspect-auto overflow-hidden">
                            <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-amber-100 text-amber-700 border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md">Special Offer</Badge>
                            </div>
                          </div>
                          <div className="p-8 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <h4 className="text-xl font-serif italic text-slate-900 group-hover:text-[#668c65] transition-colors">{item.title}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">{item.description}</p>
                            </div>
                            <Button variant="ghost" className="text-[#668c65] p-0 h-auto text-[10px] font-black uppercase tracking-[0.2em] self-start group/btn">
                              View Details <ChevronRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
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
                <section className="space-y-10">
                  <div className="flex items-center gap-3">
                    <div className="h-[1px] w-6 bg-indigo-400/40" />
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Upcoming Events</h3>
                  </div>
                  <div className="space-y-6">
                    {events.map((item) => (
                      <Card key={item.id} className="group overflow-hidden border-none bg-white shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-700 rounded-[2rem] border border-slate-50">
                        <div className="flex flex-col sm:flex-row h-full">
                          <div className="relative w-full sm:w-48 aspect-square sm:aspect-auto overflow-hidden">
                            <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-indigo-100 text-indigo-700 border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md">Event</Badge>
                            </div>
                          </div>
                          <div className="p-8 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <h4 className="text-xl font-serif italic text-slate-900 group-hover:text-[#668c65] transition-colors">{item.title}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">{item.description}</p>
                            </div>
                            <Button variant="ghost" className="text-[#668c65] p-0 h-auto text-[10px] font-black uppercase tracking-[0.2em] self-start group/btn">
                              View Event <ChevronRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
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
        </TabsContent >

        {/* Contact Tab fallback */}
        < TabsContent value="contact" className="pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700" >
          <Card className="border-none shadow-none bg-white rounded-[2.5rem] overflow-hidden border border-slate-50 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 md:p-12 space-y-10">
                <div>
                  <h3 className="text-3xl font-serif italic text-slate-900 mb-4">Contact Information</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Get in touch to discuss your requirements and book your event.</p>
                </div>

                <div className="space-y-8">
                  {service.phone && (
                    <div className="flex items-center gap-6 group">
                      <div className="w-14 h-14 rounded-[1.5rem] bg-[#668c65]/5 flex items-center justify-center text-[#668c65] group-hover:bg-[#668c65] group-hover:text-white transition-all duration-500 shadow-sm border border-[#668c65]/10">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Phone Number</p>
                        <p className="text-xl font-serif italic text-slate-900">{service.phone}</p>
                      </div>
                    </div>
                  )}

                  {service.email && (
                    <div className="flex items-center gap-6 group">
                      <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm border border-indigo-100">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Email Address</p>
                        <p className="text-xl font-serif italic text-slate-900">{service.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button className="flex-1 bg-[#668c65] hover:bg-[#5a7b59] h-16 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#668c65]/20">
                    <Phone className="w-4 h-4 mr-3" />
                    Call Now
                  </Button>
                  <Button variant="ghost" className="flex-1 bg-white border border-slate-100 h-16 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 hover:bg-slate-50">
                    <Mail className="w-4 h-4 mr-3" />
                    Send Message
                  </Button>
                </div>
              </div>

              <div className="bg-slate-950 p-6 md:p-12 flex flex-col justify-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                  <ShieldCheck className="w-80 h-80" />
                </div>
                <div className="relative z-10 space-y-10">
                  <div className="w-20 h-20 bg-[#668c65]/20 rounded-[1.5rem] flex items-center justify-center text-[#668c65] border border-[#668c65]/20 shadow-2xl">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-3xl font-serif italic mb-4">Verified Provider</h4>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-[1.8]">This provider has been verified by Ubukwe for their quality and reliable service.</p>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "Service Verified",
                      "Portfolio Reviewed",
                      "Reliability Confirmed"
                    ].map((check, i) => (
                      <li key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-[#668c65]/20 flex items-center justify-center text-[#668c65] border border-[#668c65]/20">
                          <CheckCircle className="w-3 h-3" />
                        </div>
                        {check}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent >
      </Tabs >

      {/* Metadata */}
      {
        (service.createdAt || service.updatedAt) && (
          <div className="pt-10 flex items-center justify-center gap-4">
            <div className="h-[1px] flex-1 bg-slate-50" />
            <div className="flex items-center gap-10 text-[8px] font-black uppercase tracking-[0.4em] text-slate-300">
              {service.createdAt && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Created: {new Date(service.createdAt).toLocaleDateString()}
                </span>
              )}
              {service.updatedAt && (
                <span className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Updated: {new Date(service.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="h-[1px] flex-1 bg-slate-50" />
          </div>
        )
      }

      {/* Add Promotion Modal */}
      <AddPromotionModal
        isOpen={showPromotionModal}
        onClose={() => setShowPromotionModal(false)}
        serviceId={service.id}
        servicePackages={service.packages.map(pkg => ({
          id: pkg.id,
          name: pkg.name,
          price: pkg.price
        }))}
        onSuccess={handlePromotionSuccess}
      />
    </div>
  )
}

// Loading Skeleton
function ServiceDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-pulse">
      <div className="flex items-center justify-between py-6 border-b border-slate-50">
        <Skeleton className="h-4 w-32 rounded-full" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-6">
            <div className="flex gap-3">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-20 w-3/4 rounded-3xl" />
            <div className="flex gap-10">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-4 w-40 rounded-full" />
            </div>
          </div>
          <Skeleton className="aspect-[16/9] w-full rounded-[2.5rem]" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-[450px] w-full rounded-[2.5rem]" />
          <Skeleton className="h-[200px] w-full rounded-[2rem]" />
        </div>
      </div>

      <div className="pt-12 border-b border-slate-50">
        <div className="flex gap-12">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8">
        <div className="md:col-span-2 space-y-10">
          <Skeleton className="h-4 w-48 rounded-full" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full rounded-xl" />
            <Skeleton className="h-6 w-full rounded-xl" />
            <Skeleton className="h-6 w-2/3 rounded-xl" />
          </div>
          <div className="flex flex-wrap gap-4 pt-10">
            <Skeleton className="h-10 w-32 rounded-[1.5rem]" />
            <Skeleton className="h-10 w-32 rounded-[1.5rem]" />
            <Skeleton className="h-10 w-32 rounded-[1.5rem]" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-[2rem]" />
      </div>
    </div>
  )
}

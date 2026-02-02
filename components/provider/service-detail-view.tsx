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
  ExternalLink
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{service.name}</h1>
              <Badge variant={service.status === "active" ? "default" : "secondary"}>
                {service.status}
              </Badge>
              {service.verified && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {service.location}
              </span>
              <span>•</span>
              <span>{service.category}</span>
              {service.rating && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {service.rating}
                  </span>
                </>
              )}
              {service.bookings !== undefined && (
                <>
                  <span>•</span>
                  <span>{service.bookings} bookings</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Price Range */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Price Range</p>
              <p className="text-3xl font-bold">
                {service.priceRangeMin.toLocaleString()} - {service.priceRangeMax.toLocaleString()} RWF
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Packages Available</p>
              <p className="text-2xl font-semibold">{service.packages.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="packages">Packages ({service.packages.length})</TabsTrigger>
          <TabsTrigger value="gallery">Gallery ({regularMedia.length})</TabsTrigger>
          <TabsTrigger value="promotional">Promotional ({offers.length + events.length})</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {service.description}
              </p>
            </CardContent>
          </Card>

          {service.specialties.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {service.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{images.length}</p>
                    <p className="text-sm text-muted-foreground">Images</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Film className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{reels.length}</p>
                    <p className="text-sm text-muted-foreground">Reels</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <PlayCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{videos.length}</p>
                    <p className="text-sm text-muted-foreground">Videos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-4">
          {service.packages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No packages available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {service.packages.map((pkg) => (
                <Card key={pkg.id} className={pkg.popular ? "border-primary border-2 shadow-lg" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl">{pkg.name}</CardTitle>
                      {pkg.popular && (
                        <Badge className="bg-primary">Most Popular</Badge>
                      )}
                    </div>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold">{pkg.price.toLocaleString()} RWF</p>
                      <p className="text-sm text-muted-foreground">{pkg.duration}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="font-semibold mb-3">Features:</p>
                      <ul className="space-y-2">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-6">
          {/* Images */}
          {images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Images ({images.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((item) => {
                    console.log("Rendering image:", item.url);
                    return (
                      <div 
                        key={item.id} 
                        className="relative aspect-video bg-muted rounded-lg overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => setSelectedGalleryItem(item)}
                      >
                        <img
                          src={item.url}
                          alt={item.title || "Gallery image"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("Image failed to load:", item.url);
                            console.error("Error event:", e);
                            // Show placeholder on error
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log("Image loaded successfully:", item.url);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {/* Fallback icon if image fails */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <ImageIcon className="w-12 h-12 text-muted-foreground opacity-50" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reels */}
          {reels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  Reels ({reels.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {reels.map((item) => (
                    <div 
                      key={item.id} 
                      className="relative aspect-[9/16] bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg overflow-hidden group cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                      onClick={() => setSelectedGalleryItem(item)}
                    >
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title || "Reel thumbnail"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-12 h-12 text-white opacity-75" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <PlayCircle className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <Badge className="absolute top-2 left-2 bg-purple-600">Reel</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Videos ({videos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.map((item) => (
                    <div 
                      key={item.id} 
                      className="relative aspect-video bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg overflow-hidden group cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      onClick={() => setSelectedGalleryItem(item)}
                    >
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title || "Video thumbnail"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PlayCircle className="w-16 h-16 text-white opacity-75" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <PlayCircle className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <Badge className="absolute top-2 left-2 bg-blue-600">Video</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {regularMedia.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No media items in gallery</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Promotional Tab */}
        <TabsContent value="promotional" className="space-y-6">
          {/* Offers */}
          {offers.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  Special Offers ({offers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {offers.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative aspect-video bg-muted">
                        {item.type === "image" ? (
                          <img
                            src={item.url}
                            alt={item.title || "Offer"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                            {item.type === "reel" ? (
                              <Film className="w-16 h-16 text-primary opacity-75" />
                            ) : (
                              <PlayCircle className="w-16 h-16 text-primary opacity-75" />
                            )}
                          </div>
                        )}
                        <Badge className="absolute top-2 left-2 bg-primary">
                          {item.type}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        {item.title && (
                          <h4 className="font-semibold mb-2">{item.title}</h4>
                        )}
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                        <Button variant="outline" size="sm" className="mt-3 w-full">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Offer
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Events */}
          {events.length > 0 && (
            <Card className="border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Upcoming Events ({events.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {events.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative aspect-video bg-muted">
                        {item.type === "image" ? (
                          <img
                            src={item.url}
                            alt={item.title || "Event"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-purple-500/10">
                            {item.type === "reel" ? (
                              <Film className="w-16 h-16 text-purple-600 opacity-75" />
                            ) : (
                              <PlayCircle className="w-16 h-16 text-purple-600 opacity-75" />
                            )}
                          </div>
                        )}
                        <Badge className="absolute top-2 left-2 bg-purple-600">
                          {item.type}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        {item.title && (
                          <h4 className="font-semibold mb-2">{item.title}</h4>
                        )}
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                        <Button variant="outline" size="sm" className="mt-3 w-full">
                          <Calendar className="w-4 h-4 mr-2" />
                          Event Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {offers.length === 0 && events.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No promotional content available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Get in touch with the service provider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {service.phone && (
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="text-lg font-medium">{service.phone}</p>
                  </div>
                </div>
              )}

              {service.email && (
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email Address</p>
                    <p className="text-lg font-medium">{service.email}</p>
                  </div>
                </div>
              )}

              {!service.phone && !service.email && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No contact information available</p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                {service.phone && (
                  <Button className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                )}
                {service.email && (
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                )}
              </div>
            </CardContent>
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
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Price Card Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-64" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <Skeleton className="h-10 w-full" />

      {/* Content Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  )
}

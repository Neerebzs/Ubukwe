"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
    MapPin, Star, Phone, Mail, Share2, Heart, ArrowLeft,
    CheckCircle, Users, Clock, Award, Calendar, Tag,
    Play, Image as ImageIcon, Video, Sparkles, ThumbsUp, MessageSquare
} from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { apiClient, API_ENDPOINTS, ProviderService } from "@/lib/api"
import { Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function ServiceDetailsPage({ params }: { params: { serviceId: string } }) {
    // All hooks must be called before any conditional returns
    const [activeTab, setActiveTab] = useState("home")
    const [isFavorite, setIsFavorite] = useState(false)
    const [selectedPackage, setSelectedPackage] = useState<any>(null)
    const router = useRouter()
    const { isAuthenticated } = useAuth()

    // Auth check handler
    const handleBookingClick = (e: React.MouseEvent, targetUrl: string) => {
        if (!isAuthenticated) {
            e.preventDefault();
            toast.info("Authentication Required", {
                description: "Please login to book this service.",
                action: {
                    label: "Login",
                    onClick: () => router.push("/auth/signin"),
                },
            });
            return;
        }

        if (!selectedPackage && targetUrl.includes('/booking/')) {
            toast.error("Package Required", {
                description: "Please select a package before proceeding to booking."
            });
            return;
        }

        router.push(targetUrl);
    };

    const { data: serviceRes, isLoading, error } = useQuery({
        queryKey: ["service-detail", params.serviceId],
        queryFn: async () => {
            try {
                console.log(`🔍 Fetching service: ${params.serviceId}`);
                const response = await apiClient.get<ProviderService>(API_ENDPOINTS.SERVICES.DETAILS(params.serviceId));
                console.log(`✅ Service response:`, response);

                // The backend returns the service directly (not wrapped in ApiResponse)
                // Cast to ProviderService since apiClient returns it directly for this endpoint
                const serviceData = response as unknown as ProviderService;

                if (!serviceData || !serviceData.id) {
                    console.log(`❌ No valid service data in response`);
                    throw new Error('Service not found or not available');
                }

                return serviceData;
            } catch (error: any) {
                console.log(`❌ Service fetch error:`, error);
                // If it's a 404 or other error, throw it so React Query can handle it
                throw error;
            }
        },
        retry: false, // Don't retry on 404s
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Loading service details...</p>
                </div>
            </div>
        );
    }

    if (error || !serviceRes) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Card className="max-w-md w-full mx-4">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Service Not Found</h2>
                        <p className="text-muted-foreground mb-6">
                            {error ?
                                "This service is not available or has been deactivated. Only approved and active services can be viewed." :
                                "We couldn't find the service you're looking for. It might have been removed or the link is incorrect."
                            }
                        </p>
                        <div className="space-y-2">
                            <Link href="/services">
                                <Button className="w-full">Browse All Services</Button>
                            </Link>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const serviceData = serviceRes;

    // Helper to format packages
    const pkgArray = Array.isArray(serviceData.packages) ? serviceData.packages : [];

    // Debug gallery items
    console.log('📸 Gallery items:', serviceData.gallery);
    if (Array.isArray(serviceData.gallery)) {
        console.log('📸 Gallery item types:', serviceData.gallery.map((item: any) => ({
            type: typeof item === 'string' ? 'string/image' : item.type,
            url: typeof item === 'string' ? item : item.url
        })));
    }

    // Map backend to frontend structure with better data handling
    const service = {
        id: serviceData.id,
        title: serviceData.business_name || serviceData.name,
        provider: "Verified Provider", // TODO: Join with provider data from backend
        category: serviceData.category,
        location: serviceData.location || "Rwanda",
        rating: serviceData.rating || 0,
        verified: serviceData.status === "approved",
        experience: "Expert",
        image: typeof serviceData.gallery?.[0] === 'string' ? serviceData.gallery[0] : (serviceData.gallery?.[0]?.url || "/placeholder.svg"),
        coverImage: typeof serviceData.gallery?.[0] === 'string' ? serviceData.gallery[0] : (serviceData.gallery?.[0]?.url || "/placeholder.svg"),
        description: serviceData.description || "Professional wedding service provider.",
        longDescription: serviceData.description || "A professional wedding service provider dedicated to making your special day unforgettable with authentic Rwandan traditions and modern excellence.",
        specialties: serviceData.specialties || [serviceData.category],
        features: [
            "Professional service delivery",
            "High-quality equipment/materials",
            "Experienced team",
            "Cultural expertise",
            "On-time delivery",
            "Post-event support"
        ],
        packages: serviceData.packages && Array.isArray(serviceData.packages) && serviceData.packages.length > 0
            ? serviceData.packages.map((p: any, i: number) => ({
                id: p.id || `pkg-${i}`,
                name: p.name || `Package ${i + 1}`,
                price: p.price || serviceData.price_range_min || 0,
                duration: p.duration || "Event Duration",
                description: p.description || "Comprehensive service package",
                features: p.features || ["Professional service", "Quality guarantee", "Expert team"],
                popular: p.popular || i === 0
            }))
            : [{
                id: 'default-pkg',
                name: 'Standard Package',
                price: serviceData.price_range_min || 0,
                duration: 'Event Duration',
                description: 'Comprehensive service package',
                features: ['Professional service', 'Quality guarantee', 'Expert team'],
                popular: true
            }],
        gallery: {
            photos: serviceData.gallery?.filter((item: any) => {
                const type = typeof item === 'string' ? 'image' : item.type;
                const contentType = typeof item === 'object' ? item.contentType : null;
                // Only show images with contentType === null in gallery tab
                return (!type || type === 'image') && contentType === null;
            }).map((item: any, i: number) => ({
                id: i,
                url: typeof item === 'string' ? item : item.url,
                caption: typeof item === 'object' ? (item.title || item.description || `Gallery image ${i + 1}`) : `Gallery image ${i + 1}`
            })) || [
                    { id: 0, url: "/placeholder.svg", caption: "Service showcase" }
                ],
            videos: serviceData.gallery?.filter((item: any) => {
                const type = typeof item === 'string' ? null : item.type;
                const contentType = typeof item === 'object' ? item.contentType : null;
                // Only show videos with contentType === null in gallery tab
                const isVideo = type === 'video' && contentType === null;
                if (isVideo) console.log('🎥 Found video:', item);
                return isVideo;
            }).map((item: any, i: number) => ({
                id: item.id || `video-${i}`,
                title: item.title || `Video ${i + 1}`,
                url: item.url,
                thumbnail: item.thumbnail || item.url,
                description: item.description || ''
            })) || [],
            reels: serviceData.gallery?.filter((item: any) => {
                const type = typeof item === 'string' ? null : item.type;
                const contentType = typeof item === 'object' ? item.contentType : null;
                // Only show reels with contentType === null in gallery tab
                const isReel = type === 'reel' && contentType === null;
                if (isReel) console.log('🎬 Found reel:', item);
                return isReel;
            }).map((item: any, i: number) => ({
                id: item.id || `reel-${i}`,
                title: item.title || `Reel ${i + 1}`,
                url: item.url,
                thumbnail: item.thumbnail || item.url,
                description: item.description || ''
            })) || []
        },
        events: [] as Array<{
            id: string;
            title: string;
            description: string;
            type: string;
            badge?: string;
            discount?: string;
            validUntil?: string;
            date?: string;
            location?: string;
            mediaUrl?: string;
            mediaThumbnail?: string;
            mediaType?: 'image' | 'video' | 'reel';
        }>,
        promotionalMedia: {
            offers: serviceData.gallery?.filter((item: any) => {
                const contentType = typeof item === 'object' ? item.contentType : null;
                return contentType === 'offer';
            }).map((item: any, i: number) => ({
                id: item.id || `offer-${i}`,
                type: item.type || 'image',
                title: item.title || `Offer ${i + 1}`,
                url: item.url,
                thumbnail: item.thumbnail || item.url,
                description: item.description || ''
            })) || [],
            events: serviceData.gallery?.filter((item: any) => {
                const contentType = typeof item === 'object' ? item.contentType : null;
                return contentType === 'event';
            }).map((item: any, i: number) => ({
                id: item.id || `event-${i}`,
                type: item.type || 'image',
                title: item.title || `Event ${i + 1}`,
                url: item.url,
                thumbnail: item.thumbnail || item.url,
                description: item.description || ''
            })) || []
        },
        contact: {
            phone: serviceData.phone || "+250 000 000 000",
            email: serviceData.email || "contact@provider.rw",
            website: "www.provider.rw"
        },
        stats: {
            eventsCompleted: serviceData.bookings_count || 0,
            yearsExperience: 5,
            teamSize: 10,
            satisfactionRate: Math.round(serviceData.rating * 20) || 95
        },
        reviews: {
            summary: {
                average: serviceData.rating || 0,
                total: serviceData.bookings_count || 0,
                breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            },
            items: [] as Array<{
                id: string;
                author: string;
                avatar: string;
                rating: number;
                date: string;
                comment: string;
                verified: boolean;
                helpful: number;
            }>
        }
    };

    return (
        <>
            {/* Back Button */}
            <div className="container mx-auto px-4 pt-6 max-w-7xl">
                <Link href="/services">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Services
                    </Button>
                </Link>
            </div>

            {/* Hero Section */}
            <div className="relative h-[400px] mx-auto px-4 py-8 max-w-7xl ">
                <div
                    className="absolute inset-0 bg-cover bg-center "
                    style={{ backgroundImage: `url(${service.coverImage})` }}
                />
                <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
                    <div className="flex items-end justify-between w-full max-w-7xl mx-auto">
                        <div className="flex items-end gap-6">
                            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                                <AvatarImage src={service.image} />
                                <AvatarFallback>{service.provider[0]}</AvatarFallback>
                            </Avatar>
                            <div className="mb-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <h1 className="text-4xl font-bold text-gray-900">{service.title}</h1>
                                    {service.verified && (
                                        <Badge variant="default" className="bg-blue-600">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Verified
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xl text-gray-700 mb-2">{service.provider}</p>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold">{service.rating.toFixed(1)}</span>
                                        <span className="text-gray-600">({service.reviews.summary.total} reviews)</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <MapPin className="h-4 w-4" />
                                        {service.location}
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <Award className="h-4 w-4" />
                                        {service.experience}
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="flex gap-2 mb-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="bg-white"
                                onClick={() => setIsFavorite(!isFavorite)}
                            >
                                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                            <Button variant="outline" size="icon" className="bg-white">
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Tabs Content */}
                    <div className="lg:col-span-2">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="w-full justify-start mb-6 bg-white">
                                <TabsTrigger value="home" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Home
                                </TabsTrigger>
                                <TabsTrigger value="gallery" className="flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" />
                                    Gallery
                                </TabsTrigger>
                                <TabsTrigger value="events" className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Events & Offers
                                </TabsTrigger>
                            </TabsList>

                            {/* Home Tab */}
                            <TabsContent value="home" className="space-y-6">
                                {/* About */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>About This Service</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-gray-700 leading-relaxed">{service.description}</p>
                                        <p className="text-gray-600 leading-relaxed">{service.longDescription}</p>

                                        <div>
                                            <h4 className="font-semibold mb-3">Our Specialties</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {service.specialties.map((specialty, index) => (
                                                    <Badge key={index} variant="secondary">
                                                        {specialty}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-3">What's Included</h4>
                                            <ul className="space-y-2">
                                                {service.features.map((feature, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                        <span className="text-gray-700">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Packages */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Available Packages</CardTitle>
                                        <CardDescription>Choose the perfect package for your event</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            {service.packages.map((pkg, index) => (
                                                <Card key={pkg.id} className={`relative ${pkg.popular ? 'border-primary border-2' : ''}`}>
                                                    {pkg.popular && (
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                            <Badge className="bg-primary">Most Popular</Badge>
                                                        </div>
                                                    )}
                                                    <CardHeader>
                                                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                                        <CardDescription>{pkg.description}</CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div>
                                                            <div className="text-3xl font-bold text-primary">
                                                                {pkg.price.toLocaleString()} RWF
                                                            </div>
                                                            <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                                                <Clock className="h-3 w-3" />
                                                                {pkg.duration}
                                                            </div>
                                                        </div>
                                                        <Separator />
                                                        <ul className="space-y-2">
                                                            {pkg.features.map((feature: string, index: number) => (
                                                                <li key={index} className="flex items-start gap-2 text-sm">
                                                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                                    <span>{feature}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <Button
                                                            className="w-full"
                                                            variant={selectedPackage?.id === (pkg.id || index) ? "default" : "outline"}
                                                            onClick={() => {
                                                                if (selectedPackage?.id === (pkg.id || index)) {
                                                                    setSelectedPackage(null);
                                                                } else {
                                                                    setSelectedPackage({ ...pkg, id: pkg.id || index });
                                                                    toast.success(`${pkg.name} selected`, {
                                                                        description: "You can now proceed to book."
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            {selectedPackage?.id === (pkg.id || index) ? "Selected" : "Select Package"}
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Stats */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Our Track Record</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-primary">{service.stats.eventsCompleted}+</div>
                                                <div className="text-sm text-gray-600 mt-1">Events Completed</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-primary">{service.stats.yearsExperience}+</div>
                                                <div className="text-sm text-gray-600 mt-1">Years Experience</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-primary">{service.stats.teamSize}</div>
                                                <div className="text-sm text-gray-600 mt-1">Team Members</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-primary">{service.stats.satisfactionRate}%</div>
                                                <div className="text-sm text-gray-600 mt-1">Satisfaction Rate</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Reviews & Ratings */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                            Reviews & Ratings
                                        </CardTitle>
                                        <CardDescription>
                                            See what our clients are saying about their experience
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Rating Summary */}
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Overall Rating */}
                                            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                                                <div className="text-5xl font-bold text-primary mb-2">
                                                    {service.reviews.summary.average}
                                                </div>
                                                <div className="flex items-center gap-1 mb-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-5 w-5 ${star <= Math.round(service.reviews.summary.average)
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Based on {service.reviews.summary.total} reviews
                                                </div>
                                            </div>

                                            {/* Rating Breakdown */}
                                            <div className="space-y-2">
                                                {[5, 4, 3, 2, 1].map((rating) => {
                                                    const count = service.reviews.summary.breakdown[rating as keyof typeof service.reviews.summary.breakdown]
                                                    const percentage = (count / service.reviews.summary.total) * 100
                                                    return (
                                                        <div key={rating} className="flex items-center gap-3">
                                                            <div className="flex items-center gap-1 w-12">
                                                                <span className="text-sm font-medium">{rating}</span>
                                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            </div>
                                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-yellow-400 transition-all"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm text-gray-600 w-12 text-right">
                                                                {count}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Individual Reviews */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">Customer Reviews</h4>
                                            {service.reviews.items.map((review) => (
                                                <Card key={review.id} className="border-l-4 border-l-primary/20">
                                                    <CardContent className="pt-6">
                                                        <div className="flex items-start gap-4">
                                                            <Avatar className="h-12 w-12">
                                                                <AvatarImage src={review.avatar} />
                                                                <AvatarFallback>{review.author[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <h5 className="font-semibold">{review.author}</h5>
                                                                            {review.verified && (
                                                                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                                    Verified
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <div className="flex items-center gap-0.5">
                                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                                    <Star
                                                                                        key={star}
                                                                                        className={`h-4 w-4 ${star <= review.rating
                                                                                            ? 'fill-yellow-400 text-yellow-400'
                                                                                            : 'text-gray-300'
                                                                                            }`}
                                                                                    />
                                                                                ))}
                                                                            </div>
                                                                            <span className="text-sm text-gray-500">
                                                                                {new Date(review.date).toLocaleDateString('en-US', {
                                                                                    year: 'numeric',
                                                                                    month: 'long',
                                                                                    day: 'numeric'
                                                                                })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <p className="text-gray-700 leading-relaxed mb-3">
                                                                    {review.comment}
                                                                </p>
                                                                <div className="flex items-center gap-4">
                                                                    <Button variant="ghost" size="sm" className="h-8 text-gray-600">
                                                                        <ThumbsUp className="h-4 w-4 mr-1" />
                                                                        Helpful ({review.helpful})
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm" className="h-8 text-gray-600">
                                                                        <MessageSquare className="h-4 w-4 mr-1" />
                                                                        Reply
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>

                                        {/* View All Reviews Button */}
                                        <Button variant="outline" className="w-full">
                                            View All {service.reviews.summary.total} Reviews
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Gallery Tab */}
                            <TabsContent value="gallery" className="space-y-6">
                                {/* Photos */}
                                {service.gallery.photos.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <ImageIcon className="h-5 w-5" />
                                                Photos ({service.gallery.photos.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {service.gallery.photos.map((photo) => (
                                                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                                                        <img
                                                            src={photo.url}
                                                            alt={photo.caption}
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                            <p className="text-white text-sm">{photo.caption}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Videos */}
                                {service.gallery.videos.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Video className="h-5 w-5" />
                                                Videos ({service.gallery.videos.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {service.gallery.videos.map((video) => (
                                                    <div key={video.id} className="relative aspect-video rounded-lg overflow-hidden bg-black">
                                                        <video
                                                            src={video.url}
                                                            controls
                                                            className="w-full h-full object-contain"
                                                            poster={video.thumbnail}
                                                        >
                                                            Your browser does not support the video tag.
                                                        </video>
                                                        {video.title && (
                                                            <div className="mt-2">
                                                                <p className="text-sm font-medium">{video.title}</p>
                                                                {video.description && (
                                                                    <p className="text-xs text-gray-600">{video.description}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Reels */}
                                {service.gallery.reels.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Sparkles className="h-5 w-5" />
                                                Reels & Highlights ({service.gallery.reels.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {service.gallery.reels.map((reel) => (
                                                    <div key={reel.id} className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black">
                                                        <video
                                                            src={reel.url}
                                                            controls
                                                            className="w-full h-full object-contain"
                                                            poster={reel.thumbnail}
                                                        >
                                                            Your browser does not support the video tag.
                                                        </video>
                                                        {reel.title && (
                                                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                                                <p className="text-white text-sm font-medium">{reel.title}</p>
                                                                {reel.description && (
                                                                    <p className="text-white/80 text-xs">{reel.description}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Empty State */}
                                {service.gallery.photos.length === 0 &&
                                    service.gallery.videos.length === 0 &&
                                    service.gallery.reels.length === 0 && (
                                        <Card>
                                            <CardContent className="py-12 text-center">
                                                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold mb-2">No Gallery Items</h3>
                                                <p className="text-gray-600">This service hasn't added any photos, videos, or reels yet.</p>
                                            </CardContent>
                                        </Card>
                                    )}
                            </TabsContent>

                            {/* Events & Promotions Tab */}
                            <TabsContent value="events" className="space-y-6">
                                {/* Offers Section */}
                                {service.promotionalMedia.offers.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Tag className="h-5 w-5" />
                                                Special Offers ({service.promotionalMedia.offers.length})
                                            </CardTitle>
                                            <CardDescription>Check out our current promotions and special deals</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {service.promotionalMedia.offers.map((offer) => (
                                                    <Card key={offer.id} className="border-l-4 border-l-green-500 overflow-hidden">
                                                        <div className="relative aspect-video bg-black">
                                                            {offer.type === 'image' ? (
                                                                <img
                                                                    src={offer.url}
                                                                    alt={offer.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : offer.type === 'video' ? (
                                                                <video
                                                                    src={offer.url}
                                                                    controls
                                                                    className="w-full h-full object-contain"
                                                                    poster={offer.thumbnail}
                                                                >
                                                                    Your browser does not support the video tag.
                                                                </video>
                                                            ) : offer.type === 'reel' ? (
                                                                <video
                                                                    src={offer.url}
                                                                    controls
                                                                    className="w-full h-full object-contain"
                                                                    poster={offer.thumbnail}
                                                                >
                                                                    Your browser does not support the video tag.
                                                                </video>
                                                            ) : null}
                                                            <div className="absolute top-2 right-2">
                                                                <Badge variant="default" className="bg-green-600">
                                                                    Special Offer
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <CardContent className="pt-4">
                                                            <h4 className="font-semibold text-lg mb-2">{offer.title}</h4>
                                                            {offer.description && (
                                                                <p className="text-gray-600 text-sm mb-3">{offer.description}</p>
                                                            )}
                                                            <Button
                                                                className="w-full"
                                                                onClick={(e) => handleBookingClick(e, `/booking/${service.id}`)}
                                                            >
                                                                <Tag className="h-4 w-4 mr-2" />
                                                                Claim Offer
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Events Section */}
                                {service.promotionalMedia.events.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5" />
                                                Upcoming Events ({service.promotionalMedia.events.length})
                                            </CardTitle>
                                            <CardDescription>Join us at our upcoming events and showcases</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {service.promotionalMedia.events.map((event) => (
                                                    <Card key={event.id} className="border-l-4 border-l-primary overflow-hidden">
                                                        <div className="relative aspect-video bg-black">
                                                            {event.type === 'image' ? (
                                                                <img
                                                                    src={event.url}
                                                                    alt={event.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : event.type === 'video' ? (
                                                                <video
                                                                    src={event.url}
                                                                    controls
                                                                    className="w-full h-full object-contain"
                                                                    poster={event.thumbnail}
                                                                >
                                                                    Your browser does not support the video tag.
                                                                </video>
                                                            ) : event.type === 'reel' ? (
                                                                <video
                                                                    src={event.url}
                                                                    controls
                                                                    className="w-full h-full object-contain"
                                                                    poster={event.thumbnail}
                                                                >
                                                                    Your browser does not support the video tag.
                                                                </video>
                                                            ) : null}
                                                            <div className="absolute top-2 right-2">
                                                                <Badge variant="default" className="bg-primary">
                                                                    Event
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <CardContent className="pt-4">
                                                            <h4 className="font-semibold text-lg mb-2">{event.title}</h4>
                                                            {event.description && (
                                                                <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                                                            )}
                                                            <Button variant="outline" className="w-full">
                                                                <Calendar className="h-4 w-4 mr-2" />
                                                                Learn More
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Empty State */}
                                {service.promotionalMedia.offers.length === 0 &&
                                    service.promotionalMedia.events.length === 0 && (
                                        <Card>
                                            <CardContent className="py-12 text-center">
                                                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-semibold mb-2">No Events or Offers</h3>
                                                <p className="text-gray-600">This service doesn't have any active promotions or events at the moment.</p>
                                                <p className="text-gray-600 mt-2">Check back later for special offers and upcoming events!</p>
                                            </CardContent>
                                        </Card>
                                    )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column - Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Quick Booking */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ready to Book?</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center py-4">
                                        <div className="text-sm text-gray-600 mb-1">Starting from</div>
                                        <div className="text-3xl font-bold text-primary">
                                            {service.packages[0].price.toLocaleString()} RWF
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Button
                                            className="w-full"
                                            size="lg"
                                            disabled={!selectedPackage}
                                            onClick={(e) => handleBookingClick(e, `/booking/${service.id}?packageId=${selectedPackage.id}&packageName=${encodeURIComponent(selectedPackage.name)}`)}
                                        >
                                            Book Now
                                        </Button>
                                        {!selectedPackage && (
                                            <p className="text-xs text-center text-amber-600 font-medium">
                                                Please select a package first
                                            </p>
                                        )}
                                    </div>
                                    <Button variant="outline" className="w-full">
                                        Request Quote
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Contact */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Provider</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span>{service.contact.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="h-4 w-4 text-gray-500" />
                                        <span className="truncate">{service.contact.email}</span>
                                    </div>
                                    <Separator />
                                    <Button variant="outline" className="w-full">
                                        Send Message
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Category */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Service Category</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="secondary" className="text-sm">
                                        {service.category}
                                    </Badge>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

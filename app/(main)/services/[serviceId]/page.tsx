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
                const response = await apiClient.get<ProviderService>(API_ENDPOINTS.SERVICES.DETAILS(params.serviceId));

                // The backend returns the service directly (not wrapped in ApiResponse)
                // Cast to ProviderService since apiClient returns it directly for this endpoint
                const serviceData = response as unknown as ProviderService;

                if (!serviceData || !serviceData.id) {
                    throw new Error('Service not found or not available');
                }

                return serviceData;
            } catch (error: any) {
                // If it's a 404 or other error, throw it so React Query can handle it
                throw error;
            }
        },
        retry: false, // Don't retry on 404s
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] space-y-6">
                <div className="relative flex items-center justify-center">
                   <div className="absolute w-20 h-20 rounded-full border-[3px] border-slate-200" />
                   <div className="absolute w-20 h-20 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
                   <Heart className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-serif italic text-2xl text-slate-900">
                    Finding Service...
                  </h3>
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
    if (Array.isArray(serviceData.gallery)) {
        console.log("Gallery debug:", serviceData.gallery.map((item: any) => ({
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
            {/* Navigation Header */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-50">
                <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between">
                    <Link href="/services">
                        <Button variant="ghost" className="hover:bg-slate-50 rounded-full font-bold text-slate-600 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Collection
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full bg-white border-slate-100 hover:border-rose-100 group transition-all duration-300"
                            onClick={() => setIsFavorite(!isFavorite)}
                        >
                            <Heart className={`h-4 w-4 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400 group-hover:text-rose-400'}`} />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full bg-white border-slate-100 hover:border-[#608d64]/30 group transition-all duration-300">
                            <Share2 className="h-4 w-4 text-slate-400 group-hover:text-[#608d64]" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Editorial Hero Section */}
            <section className="relative bg-white pt-8 pb-16 overflow-hidden">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-[1px] w-12 bg-primary/30" />
                                    <span className="text-primary font-bold tracking-[0.3em] uppercase text-[10px]">
                                        {service.category}
                                    </span>
                                </div>
                                <h1 className="font-serif text-5xl md:text-7xl text-slate-900 leading-[0.9] tracking-tight">
                                    <span className="block font-light">{service.title.split(' ')[0]}</span>
                                    <span className="block italic font-medium ml-8 text-primary">{service.title.split(' ').slice(1).join(' ')}</span>
                                </h1>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 py-6 border-y border-slate-50">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className={`h-3 w-3 ${s <= Math.round(service.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-100'}`} />
                                        ))}
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{service.rating.toFixed(1)}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">({service.reviews.summary.total} reviews)</span>
                                </div>
                                <div className="h-4 w-[1px] bg-slate-100 hidden sm:block" />
                                <div className="flex items-center gap-2 text-slate-600">
                                    <MapPin className="h-4 w-4 text-primary/60" />
                                    <span className="text-xs font-bold uppercase tracking-widest">{service.location}</span>
                                </div>
                                <div className="h-4 w-[1px] bg-slate-100 hidden sm:block" />
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-[#608d64]" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Verified</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[24px]">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                    <AvatarImage src={service.image} />
                                    <AvatarFallback>{service.provider[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Provided by</p>
                                    <p className="text-sm font-bold text-slate-900">{service.provider}</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative animate-in fade-in slide-in-from-right duration-1000">
                            <div className="aspect-[4/5] rounded-[100px] overflow-hidden border-[12px] border-slate-50 shadow-2xl relative">
                                <img
                                    src={service.coverImage}
                                    alt={service.title}
                                    className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />
                                <div className="absolute bottom-12 left-12 right-12">
                                    <div className="p-6 bg-white/90 backdrop-blur-md rounded-[32px] shadow-2xl border border-white/20">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Investment</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-serif italic text-slate-900">From</span>
                                            <span className="text-4xl font-black text-primary">{service.packages[0].price.toLocaleString()}</span>
                                            <span className="text-xs font-bold text-slate-400 uppercase">RWF</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Arch */}
                            <div className="absolute -z-10 -top-8 -right-8 w-64 h-64 bg-[#608d64]/10 rounded-full blur-3xl opacity-60" />
                            <div className="absolute -z-10 -bottom-8 -left-8 w-64 h-64 bg-rose-50 rounded-full blur-3xl opacity-60" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Tabs Content */}
                    <div className="lg:col-span-2">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="w-full justify-start mb-8 bg-transparent border-b border-slate-100 rounded-none h-auto p-0 gap-8">
                                <TabsTrigger
                                    value="home"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 pb-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] gap-2 transition-all"
                                >
                                    <Users className="h-3.5 w-3.5" />
                                    Experience
                                </TabsTrigger>
                                <TabsTrigger
                                    value="gallery"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 pb-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] gap-2 transition-all"
                                >
                                    <ImageIcon className="h-3.5 w-3.5" />
                                    Portfolio
                                </TabsTrigger>
                                <TabsTrigger
                                    value="events"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 pb-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] gap-2 transition-all"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Occasions
                                </TabsTrigger>
                            </TabsList>

                            {/* Experience Tab Content */}
                            <TabsContent value="home" className="space-y-16 animate-in fade-in duration-700">
                                {/* Our Craft (About) */}
                                <div className="space-y-12">
                                    <div className="space-y-2">
                                        <h3 className="font-serif italic text-4xl lg:text-5xl text-slate-900">Our Craft</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">The Philosophy & Approach</p>
                                    </div>
                                    <div className="prose prose-slate max-w-none">
                                        <p className="text-xl leading-relaxed text-slate-600 first-letter:text-7xl first-letter:font-serif first-letter:italic first-letter:mr-4 first-letter:float-left first-letter:text-primary first-letter:leading-none">
                                            {service.description}
                                        </p>
                                        <p className="text-slate-600 text-lg leading-relaxed">{service.longDescription}</p>
                                    </div>

                                    {/* Specialties */}
                                    <div className="flex flex-wrap gap-3 pt-6">
                                        {service.specialties.map((specialty, index) => (
                                            <Badge key={index} className="bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-100 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors">
                                                {specialty}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Collections (Packages) */}
                                <div className="space-y-16">
                                    <div className="space-y-2">
                                        <h3 className="font-serif italic text-4xl lg:text-5xl text-slate-900">Collections</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Handpicked Experiences</p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-10">
                                        {service.packages.map((pkg, index) => (
                                            <div
                                                key={pkg.id || index}
                                                className={`group relative rounded-[56px] border-2 p-10 transition-all duration-700 cursor-pointer flex flex-col h-full ${selectedPackage?.id === (pkg.id || index)
                                                    ? 'border-slate-900 bg-slate-900 text-white shadow-2xl scale-[1.02]'
                                                    : 'border-slate-100 hover:border-slate-300 bg-white shadow-sm'
                                                    }`}
                                                onClick={() => {
                                                    setSelectedPackage({ ...pkg, id: pkg.id || index });
                                                    toast.success(`${pkg.name} Selected`);
                                                }}
                                            >
                                                {pkg.popular && (
                                                    <Badge className="absolute top-8 right-8 bg-[#608d64] text-white border-none px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                                                        Signature
                                                    </Badge>
                                                )}
                                                <div className="space-y-6 flex-1">
                                                    <div className="space-y-2">
                                                        <h4 className="font-serif italic text-3xl leading-tight">{pkg.name}</h4>
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{pkg.duration}</p>
                                                    </div>
                                                    <div className="pt-4 flex items-baseline gap-2 flex-wrap">
                                                        <span className="text-3xl lg:text-4xl font-black">{pkg.price.toLocaleString()}</span>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">RWF</span>
                                                    </div>
                                                    <div className={`h-[1px] w-full ${selectedPackage?.id === (pkg.id || index) ? 'bg-white/10' : 'bg-slate-100'}`} />
                                                    <ul className="space-y-5 py-4">
                                                        {pkg.features.map((feature: string, i: number) => (
                                                            <li key={i} className="flex items-start gap-4">
                                                                <div className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${selectedPackage?.id === (pkg.id || index) ? 'bg-[#608d64]' : 'bg-slate-200'}`} />
                                                                <span className="text-[10px] font-bold uppercase tracking-[0.1em] leading-relaxed opacity-80">{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <Button
                                                    className={`w-full h-16 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] mt-10 transition-all duration-500 ${selectedPackage?.id === (pkg.id || index)
                                                        ? 'bg-white text-slate-900 hover:bg-[#608d64]/5'
                                                        : 'bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white'
                                                        }`}
                                                >
                                                    {selectedPackage?.id === (pkg.id || index) ? 'Selected Collection' : 'Select Collection'}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Stats Grid moved out and below Collections */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 pt-16 border-t border-slate-100">
                                    <div className="space-y-1">
                                        <p className="text-5xl font-black text-slate-900 tracking-tighter">{service.stats.eventsCompleted}+</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Masterpieces Created</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-5xl font-black text-slate-900 tracking-tighter">{service.stats.yearsExperience}+</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Years of Artistry</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-5xl font-black text-slate-900 tracking-tighter">{service.stats.teamSize}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dedicated Artisans</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-5xl font-black text-slate-900 tracking-tighter">{service.stats.satisfactionRate}%</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eternal Satisfaction</p>
                                    </div>
                                </div>

                                {/* Essentials (Included) */}
                                <div className="bg-slate-50 rounded-[80px] p-12 lg:p-20 space-y-16 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 h-64 w-64 bg-[#608d64]/10 blur-[100px] -mr-32 -mt-32 opacity-60" />
                                    <div className="text-center space-y-3 relative">
                                        <h4 className="font-serif italic text-4xl text-slate-900">The Essentials</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Curated inclusions for your journey</p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6 relative">
                                        {service.features.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-6 p-8 bg-white rounded-[40px] shadow-sm border border-slate-100 hover:border-[#608d64]/30 hover:shadow-xl transition-all duration-500 group">
                                                <div className="h-12 w-12 rounded-full bg-[#608d64]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#608d64] group-hover:rotate-12 transition-all duration-500">
                                                    <CheckCircle className="h-5 w-5 text-[#608d64] group-hover:text-white" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>


                                {/* Client Narratives (Reviews) */}
                                <div className="space-y-16 pt-8">
                                    <div className="space-y-2">
                                        <h3 className="font-serif italic text-4xl lg:text-5xl text-slate-900">Client Narratives</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Voices of Experience</p>
                                    </div>

                                    <div className="grid lg:grid-cols-3 gap-16">
                                        {/* Rating Master Card */}
                                        <div className="lg:col-span-1">
                                            <div className="bg-slate-900 rounded-[56px] p-12 text-white flex flex-col items-center justify-center text-center space-y-8 sticky top-32">
                                                <div className="text-8xl font-black leading-none text-white tracking-tighter">
                                                    {service.reviews.summary.average}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-5 w-5 ${star <= Math.round(service.reviews.summary.average) ? 'fill-[#608d64] text-[#608d64]' : 'text-slate-700'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Based on {service.reviews.summary.total} Testimonials</p>
                                            </div>
                                        </div>

                                        {/* Reviews Timeline */}
                                        <div className="lg:col-span-2 space-y-10">
                                            {service.reviews.items.map((review) => (
                                                <div key={review.id} className="group space-y-6 relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-100 hover:before:bg-[#608d64] before:transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-5">
                                                            <Avatar className="h-14 w-14 border-2 border-white shadow-xl">
                                                                <AvatarImage src={review.avatar} />
                                                                <AvatarFallback>{review.author[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-3">
                                                                    <h5 className="font-serif italic text-xl text-slate-900">{review.author}</h5>
                                                                    {review.verified && (
                                                                        <Badge className="bg-[#608d64]/10 text-[#608d64] border-none px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                                                                            Verified
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex items-center gap-0.5">
                                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                                            <Star key={star} className={`h-2.5 w-2.5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                                        {new Date(review.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ThumbsUp className="h-4 w-4 text-slate-400" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-slate-600 text-lg leading-relaxed italic font-serif">"{review.comment}"</p>
                                                    <div className="h-[1px] w-full bg-slate-50 group-last:hidden" />
                                                </div>
                                            ))}
                                            <Button variant="outline" className="w-full h-16 rounded-3xl border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50 font-black uppercase tracking-[0.3em] text-[10px] transition-all">
                                                Discover all Narrative Journals
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Gallery Tab */}
                            <TabsContent value="gallery" className="space-y-12 animate-in fade-in duration-700">
                                {/* Photos */}
                                {service.gallery.photos.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h3 className="font-serif italic text-3xl text-slate-900">Portfolio</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visual Showcase</p>
                                            </div>
                                            <Badge variant="outline" className="rounded-full border-slate-100 font-bold text-slate-400">
                                                {service.gallery.photos.length} Pieces
                                            </Badge>
                                        </div>
                                        <div className="columns-1 md:columns-2 gap-6 space-y-6">
                                            {service.gallery.photos.map((photo) => (
                                                <div key={photo.id} className="relative rounded-[32px] overflow-hidden group cursor-pointer border border-slate-100 shadow-sm break-inside-avoid">
                                                    <img
                                                        src={photo.url}
                                                        alt={photo.caption}
                                                        className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                                        <p className="text-white text-sm font-medium italic font-serif">{photo.caption}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Videos */}
                                {service.gallery.videos.length > 0 && (
                                    <div className="space-y-8">
                                        <div className="space-y-1">
                                            <h3 className="font-serif italic text-3xl text-slate-900">Cinematography</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Masterpieces in Motion</p>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {service.gallery.videos.map((video) => (
                                                <div key={video.id} className="relative aspect-video rounded-[40px] overflow-hidden bg-slate-100 group border border-slate-50 shadow-sm">
                                                    <video
                                                        src={video.url}
                                                        controls
                                                        className="w-full h-full object-cover"
                                                        poster={video.thumbnail}
                                                    />
                                                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <p className="text-white text-sm font-medium italic font-serif">{video.title}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reels */}
                                {service.gallery.reels.length > 0 && (
                                    <div className="space-y-8">
                                        <div className="space-y-1">
                                            <h3 className="font-serif italic text-3xl text-slate-900">Highlights</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Glimpses of Perfection</p>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            {service.gallery.reels.map((reel) => (
                                                <div key={reel.id} className="relative aspect-[9/16] rounded-[32px] overflow-hidden bg-slate-100 group border border-slate-50 shadow-sm">
                                                    <video
                                                        src={reel.url}
                                                        loop
                                                        muted
                                                        playsInline
                                                        className="w-full h-full object-cover"
                                                        poster={reel.thumbnail}
                                                    />
                                                    <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                                                            <Play className="h-5 w-5 text-white fill-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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

                            {/* Occasions Tab */}
                            <TabsContent value="events" className="space-y-16 animate-in fade-in duration-700">
                                {/* Special Offers Section */}
                                {service.promotionalMedia.offers.length > 0 && (
                                    <div className="space-y-12">
                                        <div className="space-y-2">
                                            <h3 className="font-serif italic text-4xl lg:text-5xl text-slate-900">Curated Offerings</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Exclusive Opportunities</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-10">
                                            {service.promotionalMedia.offers.map((offer) => (
                                                <div key={offer.id} className="group relative bg-white rounded-[56px] border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-700">
                                                    <div className="relative aspect-[4/3] overflow-hidden">
                                                        <img
                                                            src={offer.url}
                                                            alt={offer.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                                        />
                                                        <div className="absolute top-8 left-8">
                                                            <Badge className="bg-[#608d64] text-white border-none px-5 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-xl">
                                                                Exclusive
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="p-10 space-y-8">
                                                        <div className="space-y-3">
                                                            <h4 className="font-serif italic text-3xl text-slate-900">{offer.title}</h4>
                                                            <p className="text-slate-500 text-base leading-relaxed font-serif italic">"{offer.description}"</p>
                                                        </div>
                                                        <Button
                                                            className="w-full h-16 rounded-2xl bg-slate-900 text-white hover:bg-[#608d64] transition-all font-black uppercase tracking-[0.3em] text-[10px] gap-4"
                                                            onClick={(e) => handleBookingClick(e, `/booking/${service.id}`)}
                                                        >
                                                            <Tag className="h-4 w-4" />
                                                            Claim this Privilege
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Events Section */}
                                {service.promotionalMedia.events.length > 0 && (
                                    <div className="space-y-12">
                                        <div className="space-y-2">
                                            <h3 className="font-serif italic text-4xl lg:text-5xl text-slate-900">Artistry Live</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Upcoming Showcases</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-10">
                                            {service.promotionalMedia.events.map((event) => (
                                                <div key={event.id} className="group relative bg-white rounded-[56px] border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-700">
                                                    <div className="relative aspect-[4/3] overflow-hidden">
                                                        <img
                                                            src={event.url}
                                                            alt={event.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                                        />
                                                        <div className="absolute top-8 left-8">
                                                            <Badge className="bg-primary text-white border-none px-5 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-xl">
                                                                Live Event
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="p-10 space-y-8">
                                                        <div className="space-y-3">
                                                            <h4 className="font-serif italic text-3xl text-slate-900">{event.title}</h4>
                                                            <p className="text-slate-500 text-base leading-relaxed font-serif italic">"{event.description}"</p>
                                                        </div>
                                                        <Button variant="outline" className="w-full h-16 rounded-2xl border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all font-black uppercase tracking-[0.3em] text-[10px] gap-4">
                                                            <Calendar className="h-4 w-4 text-primary" />
                                                            Guest Registry
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {service.promotionalMedia.offers.length === 0 &&
                                    service.promotionalMedia.events.length === 0 && (
                                        <div className="py-32 text-center space-y-8 bg-slate-50 rounded-[56px] border border-dashed border-slate-200">
                                            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                                <Sparkles className="h-10 w-10 text-slate-200" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="font-serif italic text-3xl text-slate-900">Quiet Elegance</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">No Current Showcases</p>
                                            </div>
                                            <p className="max-w-xs mx-auto text-slate-500 text-sm font-medium leading-relaxed">
                                                Our artisans are currently focused on private commissions. Check back soon for exclusive season previews.
                                            </p>
                                        </div>
                                    )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column - Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-8">
                            {/* Instant Inquiry Card */}
                            <div className="bg-slate-900 rounded-[48px] p-10 text-white space-y-8 shadow-2xl overflow-hidden relative group">
                                <div className="absolute top-0 right-0 h-32 w-32 bg-primary/20 blur-[80px] -mr-16 -mt-16 group-hover:bg-primary/40 transition-colors" />

                                <div className="space-y-2 relative">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Your investment</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-white">
                                            {(selectedPackage?.price || service.packages[0].price).toLocaleString()}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400 uppercase">RWF</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-[#608d64] uppercase tracking-widest pt-2">
                                        {selectedPackage ? `Selected: ${selectedPackage.name}` : 'Starting price'}
                                    </p>
                                </div>

                                <Separator className="bg-white/10" />

                                <div className="space-y-4 relative">
                                    <Button
                                        className="w-full h-16 rounded-2xl bg-white text-slate-900 hover:bg-[#608d64]/5 transition-all font-black uppercase tracking-[0.2em] text-[10px]"
                                        disabled={!selectedPackage}
                                        onClick={(e) => handleBookingClick(e, `/booking/${service.id}?packageId=${selectedPackage?.id}&packageName=${encodeURIComponent(selectedPackage?.name || '')}`)}
                                    >
                                        Proceed to Booking
                                    </Button>
                                    {!selectedPackage && (
                                        <p className="text-[10px] text-center text-rose-400 font-bold uppercase tracking-widest animate-pulse">
                                            Select a collection to continue
                                        </p>
                                    )}
                                    <Button variant="ghost" className="w-full h-14 rounded-2xl text-white hover:bg-white/5 border border-white/10 font-bold uppercase tracking-[0.2em] text-[10px]">
                                        Request Personal Quote
                                    </Button>
                                </div>

                                <div className="pt-4 flex items-center justify-center gap-4 opacity-40">
                                    <div className="h-1 w-1 rounded-full bg-white" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.4em]">Secure Concierge Booking</span>
                                    <div className="h-1 w-1 rounded-full bg-white" />
                                </div>
                            </div>

                            {/* Artisan Contact Card */}
                            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14 border-2 border-slate-50">
                                        <AvatarImage src={service.image} />
                                        <AvatarFallback>{service.provider[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-serif italic text-xl text-slate-900 leading-tight">{service.provider}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">Lead Artisan</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center gap-4 group cursor-pointer">
                                        <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <Phone className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{service.contact.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-4 group cursor-pointer">
                                        <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <Mail className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-tight truncate">{service.contact.email}</span>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full h-12 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-600 font-bold uppercase tracking-widest text-[9px]">
                                    Private Inquiry
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

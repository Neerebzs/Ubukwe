"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
    MapPin, Star, Phone, Mail, Share2, Heart, ArrowLeft,
    CheckCircle, Users, Clock, Award, Calendar, Tag,
    Play, Image as ImageIcon, Video, Sparkles, ThumbsUp, MessageSquare,
    ChevronDown, Search, ArrowRight, ChevronLeft, ChevronRight,
    Loader2, AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { apiClient, API_ENDPOINTS, ProviderService } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { TranslatedText } from "@/components/translated-text"
import { cn } from "@/lib/utils"
import React, { useRef, useEffect } from "react"
import { AuthModal } from "@/components/auth-modal"
import { motion, AnimatePresence } from "framer-motion"

export default function ServiceDetailsPage({ params }: { params: { serviceId: string } }) {
    // All hooks must be called before any conditional returns
    const [activeTab, setActiveTab] = useState("home")
    const [isFavorite, setIsFavorite] = useState(false)
    const [selectedPackage, setSelectedPackage] = useState<any>(null)
    const [selectedImage, setSelectedImage] = useState<{url: string, caption?: string} | null>(null)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [pendingBookingUrl, setPendingBookingUrl] = useState("")
    const [authModalContext, setAuthModalContext] = useState("")
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    
    // Carousel refs
    const photosRef = useRef<HTMLDivElement>(null)
    const videosRef = useRef<HTMLDivElement>(null)
    const reelsRef = useRef<HTMLDivElement>(null)
    
    const [isHovered, setIsHovered] = useState(false)
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
    
    useEffect(() => {
        if (isHovered) return;

        const interval = setInterval(() => {
            [photosRef].forEach(ref => {
                if (ref.current) {
                    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
                    const maxScroll = scrollWidth - clientWidth;

                    if (scrollLeft >= maxScroll - 10) {
                        ref.current.scrollTo({ left: 0, behavior: "smooth" });
                    } else {
                        ref.current.scrollBy({ left: clientWidth / 3, behavior: "smooth" });
                    }
                }
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [isHovered]);

    const scroll = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
        if (ref.current) {
            const { clientWidth } = ref.current;
            ref.current.scrollBy({
                left: direction === "left" ? -clientWidth / 3 : clientWidth / 3,
                behavior: "smooth"
            });
        }
    };

    // Auth check handler — package must be selected before auth check
    const handleBookingClick = (e: React.MouseEvent, targetUrl: string) => {
        e.preventDefault();

        // Step 1: Package must be selected first (regardless of auth state)
        if (!selectedPackage && targetUrl.includes('/booking/')) {
            document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
            toast.info("Choose a Collection First", {
                description: "Please select an artisan collection below before proceeding to booking."
            });
            return;
        }

        // Step 2: Must be authenticated
        if (!isAuthenticated) {
            // Store the full URL (with valid packageId already embedded by the caller)
            setPendingBookingUrl(targetUrl);
            setAuthModalContext("Sign in or create a free account to continue booking this service. After logging in, you'll be taken directly to the booking details page.");
            setShowAuthModal(true);
            return;
        }

        // Step 3: All good — navigate
        router.push(targetUrl);
    };

    // Inquiry handler — Gates messaging behind the AuthModal
    const handleInquiryClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const inquiryUrl = `/customer/dashboard?tab=messages&providerId=${serviceRes?.provider_id || ""}`;
        
        if (!isAuthenticated) {
            setPendingBookingUrl(inquiryUrl);
            setAuthModalContext("Sign in or register to message this artisan directly. Your conversation will be saved in your dashboard.");
            setShowAuthModal(true);
            return;
        }
        
        router.push(inquiryUrl);
    };

    // Favorite handler — Gates favoriting behind the AuthModal
    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            setPendingBookingUrl(window.location.pathname + window.location.search);
            setAuthModalContext("Join VowNest to save your favorite artisans and create your dream wedding collection.");
            setShowAuthModal(true);
            return;
        }

        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? "Removed from favorites" : "Added to favorites", {
            description: serviceRes?.business_name || serviceRes?.name
        });
    };

    const { data: serviceRes, isLoading, error } = useQuery({
        queryKey: ["service-detail", params.serviceId],
        queryFn: async () => {
            try {
                const response = await apiClient.get<ProviderService>(API_ENDPOINTS.SERVICES.DETAILS(params.serviceId));
                const serviceData = response.data;
                if (!serviceData || !serviceData.id) {
                    throw new Error('Service not found or not available');
                }
                return serviceData;
            } catch (error: any) {
                throw error;
            }
        },
        retry: false,
        refetchOnWindowFocus: false,
    });

    // Fetch featured testimonials for this service
    const { data: serviceReviews } = useQuery({
        queryKey: ["service-reviews-featured", params.serviceId],
        queryFn: async () => {
            try {
                const { apiClient: ac } = await import("@/lib/api-client")
                const response = await ac.reviews.getFeaturedByService(params.serviceId)
                const data = response.data as any
                return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
            } catch {
                return []
            }
        },
        enabled: !!params.serviceId,
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

    // First portfolio image (exclude offers/events)
    const firstPortfolioImage = serviceData.gallery?.find((item: any) => {
        const type = typeof item === 'string' ? 'image' : item.type;
        const contentType = typeof item === 'object' ? item.contentType : null;
        return (!type || type === 'image') && !contentType;
    });
    const firstPortfolioUrl = firstPortfolioImage
        ? (typeof firstPortfolioImage === 'string' ? firstPortfolioImage : firstPortfolioImage.url)
        : "/placeholder.svg";

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
        image: firstPortfolioUrl,
        coverImage: firstPortfolioUrl,
        description: serviceData.description || "Professional wedding service provider.",
        longDescription: "", // removed — same as description, was causing duplication
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
            items: (serviceReviews || []).map((r: any) => ({
                id: r.id,
                author: r.reviewer_name || r.author || 'Verified Customer',
                avatar: r.reviewer_avatar || '/placeholder.svg',
                rating: r.overall_rating ?? r.rating ?? 5,
                date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
                comment: r.review_text || r.comment || '',
                verified: true,
                helpful: 0,
            }))
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden pb-16 md:pb-0">
            {/* Top Navigation Overlay */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-sm border-b border-white/10 px-6 py-4 md:px-12 flex justify-between items-center group/nav hover:bg-white/80 hover:border-slate-100 transition-all duration-500">
                <Link href="/services">
                    <Button variant="ghost" className="rounded-full bg-white/20 hover:bg-slate-900 hover:text-white backdrop-blur-md border border-white/20 text-white group-hover/nav:text-slate-900 group-hover/nav:bg-white group-hover/nav:border-slate-200 transition-all gap-2 px-6">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-bold text-[10px] uppercase tracking-widest">Collection</span>
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-rose-500 hover:text-white transition-all group/heart"
                        onClick={handleFavoriteClick}
                    >
                        <Heart className={cn("h-4 w-4 transition-colors", isFavorite ? "fill-white text-white" : "text-white")} />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-slate-900 hover:text-white transition-all">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Immersive Editorial Hero Section */}
            <section className="relative w-full min-h-[95vh] flex items-center pt-20 bg-white overflow-hidden">
                {/* Subtle Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-6 space-y-10 animate-in fade-in slide-in-from-left duration-1000">
                                <motion.div 
                                    className="space-y-6"
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-[1px] w-12 bg-[#668c65]/30" />
                                        <span className="text-[#668c65] font-bold tracking-[0.4em] uppercase text-[10px]">
                                            {service.category} • {service.location}
                                        </span>
                                    </div>

                                    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-slate-900 leading-[1.1] md:leading-[1] tracking-tight">
                                        <span className="block font-light whitespace-normal">
                                            {service.title.split(' ').length > 2 
                                                ? service.title.split(' ').slice(0, 2).join(' ') 
                                                : service.title.split(' ')[0]}
                                        </span>
                                        <span className="block italic font-medium ml-4 md:ml-12 text-[#668c65] whitespace-normal">
                                            {service.title.split(' ').length > 2 
                                                ? service.title.split(' ').slice(2).join(' ') 
                                                : service.title.split(' ').slice(1).join(' ')}
                                        </span>
                                    </h1>

                                    <div className="flex items-center gap-6 pt-4">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className={`h-4 w-4 ${s <= Math.round(service.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                            ))}
                                            <span className="ml-2 font-bold text-slate-900">{service.rating.toFixed(1)}</span>
                                        </div>
                                        <div className="h-4 w-[1px] bg-slate-200" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {service.reviews.summary.total} Verified Reviews
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    className="flex flex-wrap items-center gap-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                >
                                    <Button 
                                        size="lg" 
                                        className="h-16 px-10 rounded-full bg-[#668c65] hover:bg-slate-900 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                                        onClick={() => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        View Collections
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                    <div className="flex -space-x-4">
                                      {[1, 2, 3].map(i => (
                                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-slate-100 italic font-serif flex items-center justify-center text-slate-300 text-xs">
                                            P
                                        </div>
                                      ))}
                                      <div className="w-12 h-12 rounded-full border-4 border-white bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-xs">
                                        +{service.stats.eventsCompleted}
                                      </div>
                                    </div>
                                    <p className="text-sm font-bold text-slate-400 font-outfit uppercase tracking-widest">
                                      Trusted for {service.stats.yearsExperience}+ Years
                                    </p>
                                </motion.div>
                        </div>

                        <motion.div 
                            className="lg:col-span-6 relative h-[600px] flex items-center justify-center px-4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                        >
                            <div className="relative w-full max-w-[450px] aspect-[4/5] z-20 group mx-auto">
                                <div className="absolute inset-0 border-[1px] border-slate-200 rounded-[200px] -m-6 group-hover:m-0 transition-all duration-700 pointer-events-none" />
                                <div className="w-full h-full overflow-hidden rounded-[200px] shadow-2xl border-8 border-white">
                                    <img
                                      src={service.coverImage}
                                      className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                                      alt={service.title}
                                    />
                                </div>
                                
                                {/* Floating Badge */}
                                <motion.div 
                                    className="absolute right-0 lg:-right-8 top-1/4 bg-white p-3 md:p-6 rounded-3xl shadow-2xl z-30 border border-slate-50 text-center"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <Heart className="w-4 h-4 md:w-6 md:h-6 text-rose-500 fill-rose-500 mx-auto mb-1 md:mb-2" />
                                    <p className="font-serif italic text-sm md:text-lg text-slate-900">Premium</p>
                                    <p className="text-[7px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selection</p>
                                </motion.div>

                                {/* Experience Badge */}
                                <motion.div 
                                    className="absolute left-0 lg:-left-12 bottom-1/4 bg-[#668c65] p-3 md:p-6 rounded-3xl shadow-2xl z-30 text-white text-center"
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                >
                                    <Award className="w-4 h-4 md:w-6 md:h-6 text-white mx-auto mb-1 md:mb-2" />
                                    <p className="font-serif italic text-sm md:text-lg leading-tight">Expert</p>
                                    <p className="text-[7px] md:text-[8px] font-black uppercase tracking-widest opacity-70">Experience</p>
                                </motion.div>
                            </div>

                            {/* Text Accent Background */}
                            <div className="absolute inset-0 z-10 opacity-5 select-none pointer-events-none flex items-center justify-center">
                              <span className="font-serif text-[180px] leading-none text-slate-900 rotate-90 lg:rotate-0">
                                {service.category.substring(0, 4)}
                              </span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* The Narrative / Experience Section */}
            <section className="py-32 bg-[#FCFBF9] relative overflow-hidden">
                <div className="container mx-auto px-6 md:px-12 max-w-6xl relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="aspect-[3/4] rounded-[60px] overflow-hidden shadow-2xl border-[12px] border-white relative group">
                                <img 
                                    src={service.gallery.photos[0]?.url || service.coverImage} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                    alt="Process" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                            </div>
                            {/* Decorative watercolor-like element could go here */}
                        </div>

                        <div className="order-1 lg:order-2 space-y-12">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[#668c65]">
                                    <Sparkles className="h-4 w-4" />
                                    <span className="font-bold tracking-[0.4em] uppercase text-[10px]">The Philosophy</span>
                                </div>
                                <h2 className="font-serif text-5xl md:text-6xl text-slate-900 italic">Our Craft & Narrative.</h2>
                            </div>

                            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light italic font-serif">
                                <span className="text-7xl font-serif text-[#668c65] float-left mr-4 leading-[0.7] mt-2 italic font-medium">B</span>
                                {service.description}
                            </p>

                            <div className="grid grid-cols-2 gap-10 pt-8 border-t border-slate-200">
                                {service.features.slice(0, 4).map((feature, i) => (
                                    <div key={i} className="flex items-start gap-4 group">
                                        <div className="mt-1 h-5 w-5 rounded-full bg-[#668c65]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#668c65] transition-colors duration-500">
                                            <CheckCircle className="h-3 w-3 text-[#668c65] group-hover:text-white" />
                                        </div>
                                        <span className="font-bold text-[11px] uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Visual Art Section (Photos) */}
            {service.gallery.photos.length > 0 && (
                <section className="py-24 bg-white group/carousel"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}>
                    <div className="container mx-auto px-4 max-w-7xl mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <ImageIcon className="h-4 w-4 text-[#668c65]" />
                                <span className="text-[#668c65] font-bold tracking-[0.4em] uppercase text-[10px]">Visual Art</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900 leading-tight">The Stills.</h2>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => scroll(photosRef, "left")} className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-500 flex items-center justify-center group/btn">
                                <ChevronLeft className="h-5 w-5 group-hover/btn:-translate-x-0.5 transition-transform" />
                            </button>
                            <button onClick={() => scroll(photosRef, "right")} className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-500 flex items-center justify-center group/btn">
                                <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <div className="container mx-auto px-0 max-w-7xl">
                        <div ref={photosRef} className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8 px-6 md:px-12 max-w-7xl mx-auto">
                            {service.gallery.photos.map((item: any, i: number) => (
                                <div key={i} className="flex-shrink-0 w-[80vw] md:w-[400px] snap-center">
                                    <div 
                                        className="relative h-[500px] rounded-[40px] overflow-hidden group/item cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-700"
                                        onClick={() => setSelectedImage({url: item.url, caption: item.caption})}
                                    >
                                        <img src={item.url} alt="Still art" className="absolute inset-0 w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-1000" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-40 group-hover/item:opacity-70 transition-opacity" />
                                        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end translate-y-2 group-hover/item:translate-y-0 transition-transform duration-500">
                                            <p className="text-lg font-serif italic text-white line-clamp-1">{item.caption || 'Masterpiece'}</p>
                                            <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                                                <Search className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* The Cinema Section (Videos) */}
            {service.gallery.videos.length > 0 && (
                <section className="py-24 bg-[#FCFBF9] border-y border-slate-100">
                    <div className="container mx-auto px-4 max-w-7xl mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Video className="h-4 w-4 text-[#668c65]" />
                                <span className="text-[#668c65] font-bold tracking-[0.4em] uppercase text-[10px]">Cinema</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900 leading-tight">Motion Mastery.</h2>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => scroll(videosRef, "left")} className="w-12 h-12 rounded-full bg-white border border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-500 flex items-center justify-center group/btn">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button onClick={() => scroll(videosRef, "right")} className="w-12 h-12 rounded-full bg-white border border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-500 flex items-center justify-center group/btn">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="container mx-auto px-0 max-w-7xl">
                        <div ref={videosRef} className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8 px-6 md:px-12 max-w-7xl mx-auto">
                            {service.gallery.videos.map((video: any, i: number) => (
                                <div key={i} className="flex-shrink-0 w-[85vw] md:w-[500px] snap-center">
                                    <div className="relative aspect-video rounded-[40px] overflow-hidden group/vid shadow-xl bg-slate-200">
                                        <img src={video.thumbnail || video.url} alt="Video preview" className="absolute inset-0 w-full h-full object-cover group-hover/vid:scale-105 transition-transform duration-1000" />
                                        <div className="absolute inset-0 bg-black/30 group-hover/vid:bg-black/10 transition-colors" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover/vid:scale-110 transition-transform">
                                                <Play className="h-6 w-6 text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <p className="text-lg font-serif italic text-white line-clamp-1">{video.title || 'Cinematic Story'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Live Stories Section (Reels) */}
            {service.gallery.reels.length > 0 && (
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-6 md:px-12 max-w-7xl mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Sparkles className="h-4 w-4 text-[#668c65]" />
                                <span className="text-[#668c65] font-bold tracking-[0.4em] uppercase text-[10px]">Live Stories</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900 leading-tight">The Highlights.</h2>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => scroll(reelsRef, "left")} className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-500 flex items-center justify-center group/btn">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button onClick={() => scroll(reelsRef, "right")} className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-500 flex items-center justify-center group/btn">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="container mx-auto px-0 max-w-7xl">
                        <div ref={reelsRef} className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8 px-6 md:px-12 max-w-7xl mx-auto">
                            {service.gallery.reels.map((reel: any, i: number) => (
                                <div key={i} className="flex-shrink-0 w-[60vw] md:w-[280px] snap-center">
                                    <div className="relative aspect-[9/16] rounded-[32px] overflow-hidden group/reel shadow-lg border border-slate-50">
                                        <img src={reel.thumbnail || reel.url} alt="Reel preview" className="absolute inset-0 w-full h-full object-cover group-hover/reel:scale-105 transition-transform duration-1000" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover/reel:scale-110 transition-transform">
                                                <Play className="h-4 w-4 text-white fill-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Artisan Exclusives Section (Offers) */}
            {service.promotionalMedia.offers.length > 0 && (
                <section className="py-24 bg-[#FCFBF9] border-y border-slate-100">
                    <div className="container mx-auto px-6 md:px-12 max-w-7xl text-center mb-16 space-y-4">
                        <div className="flex items-center justify-center gap-2 text-[#668c65]">
                            <Tag className="h-4 w-4" />
                            <span className="font-bold tracking-[0.4em] uppercase text-[10px]">Artisan Exclusives</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900">Limited Invitations.</h2>
                    </div>

                    <div className="container mx-auto px-6 md:px-12 max-w-6xl">
                        <div className="grid md:grid-cols-2 gap-10">
                            {service.promotionalMedia.offers.map((offer: any) => (
                                <div key={offer.id} className="group relative h-[400px] rounded-[50px] overflow-hidden bg-slate-900 shadow-xl border border-white/10 hover:shadow-2xl transition-all duration-700">
                                    <img src={offer.url || offer.thumbnail} alt={offer.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 origin-center" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                    
                                    <div className="absolute top-8 left-8">
                                        <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 py-1.5 px-4 rounded-full font-bold text-[9px] uppercase tracking-[0.2em]">
                                            Curated Exclusive
                                        </Badge>
                                    </div>

                                    <div className="absolute inset-x-10 bottom-10 space-y-4">
                                        <div className="space-y-1">
                                            <h3 className="text-3xl font-serif italic text-white leading-tight">{offer.title}</h3>
                                            <p className="text-white/70 text-sm font-medium leading-relaxed line-clamp-2">{offer.description || 'Join us for an exclusive experience curated for excellence.'}</p>
                                        </div>
                                        <div className="flex items-center justify-between pt-6 border-t border-white/10">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>Limited Commission</span>
                                            </div>
                                            <Button variant="ghost" className="h-10 px-0 flex items-center text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-transparent group/btn" onClick={(e) => handleBookingClick(e, `/booking/${service.id}`)}>
                                                Claim Now
                                                <div className="ml-3 w-8 h-[1px] bg-white/30 group-hover/btn:w-12 group-hover/btn:bg-[#668c65] transition-all duration-500 relative">
                                                    <ArrowRight className="absolute -right-1 -top-1.5 w-3 h-3 group-hover/btn:translate-x-1 group-hover/btn:text-[#668c65] transition-all" />
                                                </div>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Stats Summary - Floating Style */}
            <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="container mx-auto px-6 md:px-12 max-w-6xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {[
                            { label: "Completed Events", value: `${service.stats.eventsCompleted}+`, icon: <CheckCircle className="h-6 w-6" /> },
                            { label: "Years Experience", value: `${service.stats.yearsExperience}`, icon: <Clock className="h-6 w-6" /> },
                            { label: "Artisans", value: `${service.stats.teamSize}`, icon: <Users className="h-6 w-6" /> },
                            { label: "Satisfaction", value: `${service.stats.satisfactionRate}%`, icon: <Star className="h-6 w-6" /> },
                        ].map((stat, i) => (
                            <div key={i} className="text-center space-y-4 group">
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-[#668c65] group-hover:scale-110 transition-all duration-500">
                                    {React.cloneElement(stat.icon as React.ReactElement, { className: 'h-6 w-6 text-[#668c65] group-hover:text-white' })}
                                </div>
                                <div>
                                    <p className="text-4xl md:text-5xl font-black tracking-tighter">{stat.value}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-[#668c65] transition-colors">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Artisan Collections (Pricing) Section */}
            <section id="collections" className="py-32 bg-[#FCFBF9] relative">
                <div className="container mx-auto px-6 md:px-12 max-w-6xl">
                    <div className="text-center mb-20 space-y-4">
                        <div className="flex items-center justify-center gap-2 text-[#668c65]">
                            <Tag className="h-4 w-4" />
                            <span className="font-bold tracking-[0.4em] uppercase text-[10px]">The Investment</span>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-serif text-slate-900 italic">Artisan Collections.</h2>
                                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {service.packages.map((pkg: any, i: number) => {
                            const isSelected = selectedPackage?.id === (pkg.id || i);
                            return (
                                <motion.div
                                    key={pkg.id || i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    whileHover={{ y: -10 }}
                                >
                                    <div 
                                        className={cn(
                                            "relative rounded-[60px] p-10 flex flex-col h-full transition-all duration-700 cursor-pointer group",
                                            isSelected 
                                                ? "bg-slate-900 text-white shadow-2xl scale-[1.03] z-10" 
                                                : "bg-white border border-slate-100 hover:border-[#668c65]/30 hover:shadow-2xl"
                                        )}
                                        onClick={() => setSelectedPackage({ ...pkg, id: pkg.id || i })}
                                    >
                                        {/* Selection Badge */}
                                        <AnimatePresence>
                                            {isSelected && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="absolute top-10 right-10 z-20"
                                                >
                                                    <div className="bg-[#668c65] text-white p-2.5 rounded-full shadow-lg">
                                                        <CheckCircle className="h-5 w-5" />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="space-y-8 flex-1">
                                            <div className="space-y-2">
                                                <h3 className={cn("font-serif italic text-3xl leading-tight transition-colors", isSelected ? "text-white" : "group-hover:text-[#668c65]")}>{pkg.name}</h3>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{pkg.duration}</p>
                                            </div>
                                            
                                            <div className="flex items-baseline gap-2">
                                                <span className={cn("text-4xl font-serif transition-colors", isSelected ? "text-white" : "text-slate-900")}>
                                                    {(pkg.price / 1000).toLocaleString()}k
                                                </span>
                                                <span className="text-slate-400 font-bold text-xs uppercase tracking-tighter">RWF</span>
                                            </div>

                                            <div className={cn("h-[1px] w-full", isSelected ? "bg-white/10" : "bg-slate-100")} />
                                            
                                            <ul className="space-y-4">
                                                {(pkg.features || service.features.slice(0, 4)).map((feature: string, idx: number) => (
                                                    <li key={idx} className="flex gap-4 items-start">
                                                        <Sparkles className={cn("h-4 w-4 shrink-0 transition-colors", isSelected ? "text-white/40" : "text-[#668c65]")} />
                                                        <span className={cn("text-[11px] font-bold uppercase tracking-widest leading-relaxed", isSelected ? "text-white/70" : "text-slate-600")}>
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <Button 
                                            variant={isSelected ? "default" : "outline"}
                                            className={cn(
                                                "w-full h-16 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 mt-10",
                                                isSelected 
                                                    ? "bg-[#668c65] text-white hover:bg-white hover:text-slate-900" 
                                                    : "border-slate-200 hover:bg-slate-900 hover:text-white"
                                            )}
                                        >
                                            {isSelected ? "Collection Selected" : "Select Collection"}
                                        </Button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>      </div>
                </div>
            </section>

            {/* Client Stories (Reviews) Section */}
            <section className="py-32 bg-white relative overflow-hidden">
                 <div className="container mx-auto px-6 md:px-12 max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="relative group">
                            <div className="w-full max-w-[450px] h-[450px] mx-auto relative flex items-center justify-center">
                                {/* Decorative Ring */}
                                <div className="absolute inset-0 border border-[#668c65]/20 rounded-full animate-spin-slow" />
                                <div className="absolute inset-4 border border-[#668c65]/10 rounded-full" />
                                
                                <div className="absolute inset-12 rounded-full overflow-hidden shadow-2xl border-8 border-white">
                                    <img 
                                        src={service.reviews.items[0]?.avatar || service.coverImage} 
                                        className="w-full h-full object-cover"
                                        alt="Happy Client" 
                                    />
                                </div>
                                <div className="absolute -top-4 -right-4 w-32 h-32 opacity-20">
                                  <Sparkles className="w-full h-full text-[#668c65]" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-[#668c65] font-bold tracking-[0.4em] uppercase text-[10px]">The Experience Journals</h2>
                                <h3 className="font-serif text-5xl md:text-6xl text-slate-900 italic leading-tight">Voices of Excellence.</h3>
                            </div>

                            <div className="space-y-10">
                                {service.reviews.items.length > 0 ? (
                                    service.reviews.items.slice(0, 2).map((review: { id: string; author: string; avatar: string; rating: number; date: string; comment: string; verified: boolean; helpful: number }) => (
                                        <div key={review.id} className="space-y-6 animate-in fade-in duration-1000">
                                            <div className="flex items-center gap-6">
                                                <div className="text-[#668c65]/20">
                                                    <svg width="40" height="30" viewBox="0 0 60 40" fill="currentColor">
                                                        <path d="M0 40h20l10-20V0H0v20h10L0 40zM30 40h20l10-20V0H30v20h10L30 40z" />
                                                    </svg>
                                                </div>
                                                <div className="h-[1px] w-20 bg-slate-100" />
                                            </div>
                                            <p className="text-2xl md:text-3xl font-serif italic text-slate-800 leading-relaxed">
                                                "{review.comment}"
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-50">
                                                    <img src={review.avatar} alt={review.author} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-serif italic text-xl text-slate-900">{review.author}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex">
                                                            {[1,2,3,4,5].map(s => <Star key={s} className="h-2 w-2 fill-amber-400 text-amber-400" />)}
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Couple</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 bg-slate-50 rounded-[40px] text-center border border-dashed border-slate-200">
                                        <p className="font-serif italic text-2xl text-slate-400 uppercase tracking-widest">Eternal Satisfaction Guaranteed</p>
                                        <p className="text-sm text-slate-400 mt-2">New reviews arriving soon.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                 </div>
            </section>

            {/* Practicalities (FAQ) Section */}
            <section className="py-32 bg-[#FCFBF9] border-t border-slate-100">
                <div className="container mx-auto max-w-3xl px-6 md:px-12">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-5xl font-serif italic text-slate-900">Essential Enquiries.</h2>
                        <p className="text-sm font-bold text-[#668c65] uppercase tracking-widest">Clarifying your vision</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: "How do we begin the booking process?", a: "Start by selecting your preferred collection above. Once you proceed, our concierge team will reach out to finalize dates and specific requirements." },
                            { q: "Can we customize the collections?", a: "Absolutely. Our collections are starting points. We pride ourselves on creating bespoke experiences tailored to your unique narrative." },
                            { q: "What is the typical lead time?", a: "We recommend booking at least 6-12 months in advance for peak season, as our artisans take on a limited number of commissions to ensure excellence." }
                        ].map((faq, idx) => (
                            <div key={idx} className="group border border-slate-100 rounded-[32px] overflow-hidden bg-white hover:shadow-xl transition-all duration-500">
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                    className="w-full px-8 py-8 flex items-center justify-between text-left group-hover:bg-[#668c65]/5 transition-all duration-300"
                                >
                                    <span className="font-bold text-slate-900 text-lg tracking-tight">{faq.q}</span>
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500", expandedFaq === idx ? "bg-slate-900 text-white rotate-180" : "bg-slate-50 text-slate-300")}>
                                        <ChevronDown className="h-5 w-5" />
                                    </div>
                                </button>
                                {expandedFaq === idx && (
                                    <div className="px-8 pb-8 pt-2 bg-white text-slate-500 text-lg font-serif italic leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sticky Action Footer / Booking Bar */}
            <div className={cn(
                "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-700 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:max-w-4xl w-full",
                "px-6 md:px-0"
            )}>
                <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 md:px-10 md:py-6 md:rounded-[40px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                    {/* Background Light Effect */}
                    <div className="absolute top-0 right-0 h-32 w-32 bg-[#668c65]/20 blur-[60px] -mr-16 -mt-16 group-hover:bg-[#668c65]/40 transition-colors" />

                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {selectedPackage ? `Selected: ${selectedPackage.name}` : "Artisan Investment"}
                            </p>
                            <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                <span className="text-3xl md:text-4xl font-black text-white">
                                    {(selectedPackage?.price || service.packages[0].price).toLocaleString()}
                                </span>
                                <span className="text-xs font-bold text-slate-500 uppercase">RWF</span>
                            </div>
                        </div>
                        <div className="hidden lg:block h-10 w-[1px] bg-white/10" />
                        <div className="hidden lg:flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800" />)}
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Limited Slots Available</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Button 
                            className="flex-1 md:flex-none h-14 md:h-16 px-10 rounded-2xl bg-[#668c65] text-white hover:bg-white hover:text-slate-900 font-bold uppercase tracking-[0.2em] text-[10px] transition-all"
                            onClick={(e) => handleBookingClick(e, `/booking/${service.id}?packageId=${selectedPackage?.id}&packageName=${encodeURIComponent(selectedPackage?.name || "")}`)}
                        >
                            Confirm Booking
                        </Button>
                        <Button 
                            variant="outline" 
                            className="h-14 md:h-16 px-8 rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/5 font-bold uppercase tracking-[0.2em] text-[10px] transition-all hidden sm:flex"
                            onClick={handleInquiryClick}
                        >
                           Inquiry
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sub-domain Ready Section / Recommendation Bar */}
            <section className="py-24 bg-white border-t border-slate-50 text-center mb-24 md:mb-0">
                <div className="container mx-auto px-6 md:px-12">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-4">You Might Also Admire</p>
                    <Link href="/services">
                        <Button variant="link" className="font-serif italic text-2xl text-slate-900 hover:text-[#668c65]">
                            Explore More Verified Artisans
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Auth Modal — shown when unauthenticated user clicks Gated Actions */}
            <AuthModal
                open={showAuthModal}
                onOpenChange={setShowAuthModal}
                callbackUrl={pendingBookingUrl}
                contextMessage={authModalContext || "Sign in or create a free account to continue booking this service. After logging in, you'll be taken directly to the booking details page."}
            />

            {/* Lightbox Dialog (Keep Existing) */}
            <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent className="max-w-[90vw] md:max-w-5xl h-[90vh] p-0 overflow-hidden border-none bg-transparent shadow-none flex items-center justify-center">
                   {selectedImage && (
                       <div className="relative w-full h-full flex flex-col items-center justify-center">
                           <img 
                               src={selectedImage.url} 
                               alt={selectedImage.caption || "Gallery visual"} 
                               className="max-w-full max-h-full object-contain rounded-2xl" 
                           />
                           {selectedImage.caption && (
                               <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                                   <div className="bg-black/60 shadow-xl backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                                       <p className="text-white text-sm font-medium italic font-serif">{selectedImage.caption}</p>
                                   </div>
                               </div>
                           )}
                       </div>
                   )}
                </DialogContent>
            </Dialog>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                }
                @keyframes float-reverse {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(20px) rotate(-2deg); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-float-reverse {
                    animation: float-reverse 7s ease-in-out infinite;
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
            `}</style>
        </div>
    )
}

"use client";

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Music, Utensils, MapPin, Palette, Mic, Star, ArrowRight, Heart, Sparkles, Clock, Shield, ChevronDown, Search, Calendar, Tag } from "lucide-react"
import Link from "next/link"
import React, { useState, useRef, useEffect } from "react";
import { TranslatedText } from "@/components/translated-text";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePublicEvents } from "@/hooks/useCustomerEvents";
import { useOffers } from "@/hooks/useOffers";
import { SupportWidget } from "@/components/SupportWidget";
import { useSystemSettings } from "@/contexts/system-settings-context";
import { PopularServicesSection } from "@/components/home/PopularServicesSection";

export default function HomePage() {
  const { settings, isLoading: isLoadingSettings } = useSystemSettings();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        const maxScroll = scrollWidth - clientWidth;

        if (scrollLeft >= maxScroll - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carouselRef.current.scrollBy({ left: clientWidth / 3, behavior: "smooth" });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isHovered]);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { clientWidth } = carouselRef.current;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -clientWidth / 3 : clientWidth / 3,
        behavior: "smooth"
      });
    }
  };

  const { data: realEvents, isLoading: isLoadingEvents } = usePublicEvents();
  const { offers, isLoading: isLoadingOffers } = useOffers();

  // Map real events to promotions format — only future/today events
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dynamicEvents = (realEvents || [])
    .filter((event: any) => {
      if (!event.event_date) return false;
      const eventDate = new Date(event.event_date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today; // hide past events
    })
    .map((event: any) => ({
    id: event.id,
    type: "event",
    badge: "Upcoming Event",
    title: event.title,
    description: event.description || "Join us for an exclusive experience.",
    discount: event.ticket_types?.length > 0 
      ? `${event.ticket_types[0].price.toLocaleString()} RWF`
      : "Free Entry",
    validUntil: new Date(event.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    icon: <Calendar className="h-6 w-6" />,
    image: event.image_url || "/beautiful-garden-wedding-venue-rwanda.jpg"
  }));

  // Combine events and offers
  const promotions = [...dynamicEvents, ...offers];
  const isLoadingEventsAndOffers = isLoadingEvents || isLoadingOffers;

  const services = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Traditional Dancers",
      description: "Authentic Rwandan wedding dancers performing Intore and other cultural dances",
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: <Mic className="h-8 w-8" />,
      title: "Master of Ceremonies",
      description: "Experienced MCs who understand Rwandan wedding traditions and customs",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Decoration Services",
      description: "Beautiful traditional and modern decorations for your special day",
      color: "bg-orange-50 text-orange-600",
    },
    {
      icon: <Utensils className="h-8 w-8" />,
      title: "Catering & Food",
      description: "Authentic Rwandan cuisine and international dishes for your celebration",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Venue Booking",
      description: "Perfect venues for traditional and modern Rwandan wedding celebrations",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      icon: <Music className="h-8 w-8" />,
      title: "Cultural Music",
      description: "Traditional Rwandan musicians and modern entertainment options",
      color: "bg-rose-50 text-rose-600",
    },
  ];


  const faqs = [
    {
      question: "How do I book a service?",
      answer: "Browse our verified providers, view their portfolios and pricing, then contact them directly through our platform. We handle all coordination and payments securely."
    },
    {
      question: "Are all providers verified?",
      answer: "Yes! Every provider on Ubukwe undergoes thorough verification including identity checks, portfolio review, and customer references to ensure quality."
    },
    {
      question: "What if I'm not satisfied?",
      answer: "We offer a satisfaction guarantee. If you're unhappy with a service, our support team will work with you and the provider to resolve the issue."
    },
    {
      question: "Can I customize my wedding package?",
      answer: "Absolutely! You can mix and match services from different providers or request custom packages. Our team helps coordinate everything."
    },
  ];

  const stats = [
    { number: "500+", label: "Verified Providers", icon: <Shield className="h-6 w-6" /> },
    { number: "2000+", label: "Happy Couples", icon: <Heart className="h-6 w-6" /> },
    { number: "98%", label: "Satisfaction", icon: <Star className="h-6 w-6" /> },
    { number: "24/7", label: "Support", icon: <Clock className="h-6 w-6" /> },
  ];

  // No full-page loading gate — each section handles its own loading state.
  // isLoadingSettings only prevents showing broken image URLs in the hero,
  // so we guard just the hero image src, not the whole page render.

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden pb-16 md:pb-0">
      {/* Editorial Hero Section — desktop only */}
      <section className="hidden md:block relative w-full overflow-hidden min-h-[90vh] pt-12 lg:pt-20 bg-white">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-10 animate-in fade-in slide-in-from-left duration-1000">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] w-12 bg-primary/30" />
                  <span className="text-primary font-outfit font-bold tracking-[0.3em] uppercase text-[10px]">
                    <TranslatedText text="Est. 2024 • Kigali, Rwanda" />
                  </span>
                </div>

                <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-sage-950 leading-[0.9] tracking-tight">
                  <span className="block font-light">Crafting</span>
                  <span className="block italic font-medium ml-4 md:ml-12 text-primary">Moments</span>
                  <span className="block font-light text-sage-300">That Last.</span>
                </h1>

                <p className="font-outfit text-sage-600/70 text-lg md:text-xl max-w-lg leading-relaxed font-light">
                  <TranslatedText text="Experience the art of Rwandan wedding planning. We connect you with the finest providers to create a celebration that honors tradition and embraces elegance." />
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <Link href="/services">
                  <Button size="lg" className="h-16 px-10 rounded-full bg-[#668c65] hover:bg-sage-900 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                    <TranslatedText text="Start Planning" />
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex -space-x-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-slate-100">
                      <img src={`/grom.jpg`} className="w-full h-full object-cover grayscale" alt="Client" />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-4 border-white bg-[#668c65]/10 flex items-center justify-center text-[#668c65] font-bold text-xs">
                    +2k
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-400 font-outfit uppercase tracking-widest">
                  <TranslatedText text="Trusted by 2,000+ couples" />
                </p>
              </div>
            </div>

            {/* Right Visual Column */}
            <div className="lg:col-span-6 relative h-[600px] hidden lg:block">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Main Arch Image */}
                <div className="relative w-[380px] h-[540px] z-20 group">
                  <div className="absolute inset-0 border-[1px] border-slate-200 rounded-[200px] -m-4 group-hover:m-0 transition-all duration-700" />
                  <div className="w-full h-full overflow-hidden rounded-[200px] shadow-2xl border-8 border-white relative">
                    {isLoadingSettings ? (
                      <div className="absolute inset-0 bg-slate-200 animate-pulse" />
                    ) : (
                      <img
                        src={settings.homeHeroImageUrl}
                        className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                        alt="Rwandan Wedding"
                      />
                    )}
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -right-12 top-20 bg-white p-6 rounded-3xl shadow-2xl animate-float z-30 border border-slate-50">
                    <Heart className="w-8 h-8 text-rose-500 fill-rose-500 mb-2" />
                    <p className="font-serif italic text-xl text-slate-900">Beautiful</p>
                  </div>
                </div>

                {/* Secondary Circular Image */}
                <div className="absolute left-[-40px] bottom-10 w-48 h-48 z-30 rounded-full overflow-hidden border-8 border-white shadow-xl hover:scale-110 transition-transform duration-500 cursor-pointer">
                  <img
                    src="/beautiful-garden-wedding-venue-rwanda.jpg"
                    className="w-full h-full object-cover"
                    alt="Venue"
                  />
                </div>

                {/* Text Accent */}
                <div className="absolute right-0 bottom-20 z-10 opacity-5 select-none pointer-events-none">
                  <span className="font-serif text-[180px] leading-none text-sage-950">Hub</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Full-Height Background Promotional Carousel */}
      {(isLoadingEventsAndOffers || promotions.length > 0) && (
      <section
        className="py-12 md:py-16 px-0 relative bg-[#fcfbf9] overflow-hidden group/carousel"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="container mx-auto px-4 mb-8 flex flex-row items-end justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-[#668c65]" />
              <span className="text-[#668c65] font-outfit font-bold tracking-[0.4em] uppercase text-[10px]">
                <TranslatedText text="Curated Exclusives" />
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif italic text-sage-950 leading-tight">
              <TranslatedText text="Limited Moments." />
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 hover:bg-sage-950 hover:text-white hover:border-sage-950 transition-all duration-500 flex items-center justify-center group/btn"
            >
              <ChevronLeft className="h-4 w-4 group-hover/btn:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 hover:bg-sage-950 hover:text-white hover:border-sage-950 transition-all duration-500 flex items-center justify-center group/btn"
            >
              <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        <div className="container mx-auto">
          <div
            ref={carouselRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6 px-4 scroll-smooth"
          >
            {isLoadingEventsAndOffers ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`loading-${index}`}
                  className="flex-shrink-0 w-[75vw] sm:w-[55vw] md:w-[35vw] lg:w-[310px] snap-center"
                >
                  <div className="h-[390px] rounded-[2.5rem] bg-slate-100 animate-pulse overflow-hidden" />
                </div>
              ))
            ) : promotions.length > 0 ? (
              promotions.map((promo: any) => (
                <div
                  key={promo.id}
                  className="flex-shrink-0 w-[75vw] sm:w-[55vw] md:w-[35vw] lg:w-[310px] snap-center"
                >
                  {/* Premium Full-Height Background Card */}
                  <Link
                    href={promo.type === "event" ? `/events/${promo.id}/tickets` : `/services/${promo.serviceId || promo.id}`}
                    className="group relative h-[390px] rounded-[2.5rem] overflow-hidden bg-slate-900 border border-slate-100/10 shadow-lg hover:shadow-2xl transition-all duration-700 block cursor-pointer"
                  >
                    {/* Background Image */}
                    <img
                      src={promo.image}
                      alt={promo.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 origin-center"
                    />
                    
                    {/* Multi-Layer Overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    
                    {/* Glassmorphism Badges (Top) */}
                    <div className="absolute top-8 left-8">
                      <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-xl py-2 px-5 rounded-full font-bold text-[9px] uppercase tracking-[0.2em]">
                        {promo.badge}
                      </Badge>
                    </div>

                    {/* Integrated Price Label (Top Right) */}
                    <div className="absolute top-8 right-8">
                       <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex flex-col items-center">
                          <span className="text-[8px] font-black text-white/60 uppercase tracking-widest leading-tight mb-1">Value</span>
                          <span className="text-sm font-bold text-white font-outfit">
                            {promo.discount}
                          </span>
                       </div>
                    </div>

                    {/* Floating Content Section (Bottom) */}
                    <div className="absolute inset-x-8 bottom-8 z-10 space-y-6">
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-500 border border-white/10">
                           {React.cloneElement(promo.icon as React.ReactElement, { className: 'w-5 h-5' })}
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-3xl font-serif italic text-white leading-tight">
                            <TranslatedText text={promo.title} />
                          </h3>
                          <p className="text-white/70 text-sm font-medium line-clamp-2 leading-relaxed group-hover:text-white transition-colors duration-500">
                            <TranslatedText text={promo.description} />
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-white/10">
                        <div className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Until {promo.validUntil}</span>
                        </div>
                        <Button variant="ghost" className="h-10 px-0 flex items-center text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-transparent group/btn">
                            <TranslatedText text="Explore" />
                            <div className="ml-3 w-8 h-[1px] bg-white/30 group-hover/btn:w-12 group-hover/btn:bg-[#668c65] transition-all duration-500 relative">
                               <ArrowRight className="absolute -right-1 -top-1.5 w-3 h-3 group-hover/btn:translate-x-1 group-hover/btn:text-[#668c65] transition-all" />
                            </div>
                          </Button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="flex-shrink-0 w-full flex items-center justify-center py-20">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="h-10 w-10 text-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-serif italic text-slate-900">
                      <TranslatedText text="No Events Yet" />
                    </h3>
                    <p className="text-slate-400 font-medium max-w-xs mx-auto">
                      <TranslatedText text="Check back soon for exclusive deals and exciting upcoming events." />
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {/* ── Popular Services ── */}
      <PopularServicesSection />

      {/* Modernized Stats Section */}
      <section className="py-12 md:py-16 relative bg-white border-y border-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="group text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-sage-50 text-[#668c65] rounded-2xl flex items-center justify-center group-hover:bg-[#668c65] group-hover:text-white transition-all duration-300">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-black text-sage-950 tracking-tighter mb-1">{stat.number}</div>
                  <div className="text-sm font-bold text-sage-400 uppercase tracking-[0.2em] font-outfit">
                    <TranslatedText text={stat.label} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 relative bg-[#f7f9fa] overflow-hidden">
        {/* Background Leaf Motif */}
        <div className="leaf-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Left Column: Circular Wreath Image */}
            <div className="relative flex justify-center lg:justify-end animate-in fade-in slide-in-from-left duration-1000">
              <div className="wreath-container w-[350px] h-[350px] md:w-[450px] md:h-[450px]">
                {/* Wreath Border */}
                <div className="wreath-border" />

                {/* Image Container */}
                <div className="absolute inset-8 rounded-full overflow-hidden shadow-2xl">
                  <img
                    src="/beautiful-garden-wedding-venue-rwanda.jpg"
                    className="w-full h-full object-cover"
                    alt="Success Story Couple"
                  />
                </div>

                {/* Decorative Watercolor Leaf Overlays */}
                <div className="absolute -top-4 -right-4 w-32 h-32 animate-float">
                  <img src="/leaf-motif.png" className="w-full h-full object-contain -rotate-45" alt="Leaf Decor" />
                </div>
                <div className="absolute -bottom-8 -left-8 w-40 h-40 animate-float" style={{ animationDelay: '1s' }}>
                  <img src="/leaf-motif.png" className="w-full h-full object-contain rotate-12" alt="Leaf Decor" />
                </div>
              </div>
            </div>

            {/* Right Column: Testimonial Content */}
            <div className="space-y-8 animate-in fade-in slide-in-from-right duration-1000">
              <div className="space-y-4">
                <h2 className="text-primary font-outfit font-medium tracking-[0.2em] uppercase text-sm">
                  <TranslatedText text="What Our Client Say" />
                </h2>

                <div className="flex items-center gap-6">
                  <div className="text-primary/20">
                    <svg width="60" height="40" viewBox="0 0 60 40" fill="currentColor">
                      <path d="M0 40h20l10-20V0H0v20h10L0 40zM30 40h20l10-20V0H30v20h10L30 40z" />
                    </svg>
                  </div>
                  <div className="h-[1px] w-24 bg-primary/20" />
                </div>

                <p className="font-outfit text-slate-800 text-2xl md:text-3xl leading-relaxed font-light italic">
                  "This is not only a wedding planning agency but also a dreamy friend. I am very glad to work with them. They make my dream come true. In my wedding I found them as my best friends."
                </p>
              </div>

              {/* Author Block */}
              <div className="flex items-center gap-4 py-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md">
                  <img src="/grom.jpg" className="w-full h-full object-cover" alt="Jenifer Marvella" />
                </div>
                <div>
                  <h4 className="font-serif italic text-2xl text-slate-900">
                    Jenifer Marvella
                  </h4>
                  <p className="text-slate-400 text-sm font-outfit uppercase tracking-wider">
                    Wedding 12/12/24
                  </p>
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="flex gap-3 pt-4">
                <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/10 hover:bg-primary/20 cursor-pointer transition-colors" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/10 hover:bg-primary/20 cursor-pointer transition-colors" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Modernized FAQ Section */}
      <section className="py-14 md:py-20 relative bg-white border-t border-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 space-y-4">
            <h2 className="text-5xl font-black text-sage-950 tracking-tight">
              <TranslatedText text="Common Questions" />
            </h2>
            <p className="text-lg text-sage-500 font-medium">
              <TranslatedText text="Everything you need to know about planning with Ubukwe Hub." />
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="group border border-slate-100 rounded-[32px] overflow-hidden bg-slate-50/30 transition-all duration-300">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-8 py-7 flex items-center justify-between text-left group-hover:bg-white transition-all duration-300"
                >
                  <span className="font-bold text-sage-950 text-xl tracking-tight">
                    <TranslatedText text={faq.question} />
                  </span>
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300", expandedFaq === index ? "bg-sage-950 text-white rotate-180" : "bg-white text-sage-300 border border-sage-100 shadow-sm")}>
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </button>
                {expandedFaq === index && (
                  <div className="px-8 pb-8 pt-2 bg-white text-sage-500 text-lg font-medium leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                    <TranslatedText text={faq.answer} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Widget */}
      <SupportWidget />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }



        @keyframes scroll {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(12px);
            opacity: 0;
          }
        }


        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}



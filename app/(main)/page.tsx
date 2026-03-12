"use client";

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Music, Utensils, MapPin, Palette, Mic, Star, ArrowRight, Heart, Sparkles, Clock, Shield, ChevronDown, Zap, Play, Search, Gift, Calendar, TrendingUp, Tag, Percent } from "lucide-react"
import Link from "next/link"
import React, { useState, useRef, useEffect } from "react";
import { TranslatedText } from "@/components/translated-text";
import { PublicBottomNav } from "@/components/ui/public-bottom-nav";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HomePage() {
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

  const promotions = [
    {
      id: 1,
      type: "offer",
      badge: "Limited Offer",
      title: "Summer Wedding Package",
      description: "Get 30% off on complete wedding packages booked this month",
      discount: "30% OFF",
      validUntil: "Dec 31, 2024",
      icon: <Percent className="h-6 w-6" />,
      image: "/grom.jpg"
    },
    {
      id: 2,
      type: "promotion",
      badge: "Hot Deal",
      title: "Traditional Dance Package",
      description: "Book Intore dancers and get free traditional music",
      discount: "Buy 1 Get 1",
      validUntil: "Jan 15, 2025",
      icon: <Gift className="h-6 w-6" />,
      image: "/intore-new.jpeg"
    },
    {
      id: 3,
      type: "event",
      badge: "Upcoming Event",
      title: "Wedding Expo 2025",
      description: "Meet top vendors and get exclusive discounts",
      discount: "Free Entry",
      validUntil: "Feb 20, 2025",
      icon: <Calendar className="h-6 w-6" />,
      image: "/beautiful-garden-wedding-venue-rwanda.jpg"
    },
    {
      id: 4,
      type: "offer",
      badge: "Flash Sale",
      title: "Venue Booking Special",
      description: "Premium venues at discounted rates for early bookings",
      discount: "25% OFF",
      validUntil: "Dec 25, 2024",
      icon: <TrendingUp className="h-6 w-6" />,
      image: "/rwandan-wedding-decorations-traditional.jpg"
    },
    {
      id: 5,
      type: "promotion",
      badge: "Special Offer",
      title: "Catering Bundle Deal",
      description: "Traditional & modern menu combo with free cake",
      discount: "Save 40%",
      validUntil: "Jan 30, 2025",
      icon: <Tag className="h-6 w-6" />,
      image: "/rwandan-traditional-food-buffet.jpg"
    },
    {
      id: 6,
      type: "event",
      badge: "Workshop",
      title: "Wedding Planning Masterclass",
      description: "Learn from experts and plan your perfect day",
      discount: "Register Now",
      validUntil: "Mar 10, 2025",
      icon: <Sparkles className="h-6 w-6" />,
      image: "/grom.jpg"
    },
  ];

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

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden pb-16 md:pb-0">
      {/* Editorial Hero Section */}
      <section className="relative w-full overflow-hidden min-h-[90vh] flex items-center pt-20 bg-white">
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
                  <div className="w-full h-full overflow-hidden rounded-[200px] shadow-2xl border-8 border-white">
                    <img
                      src="/grom.jpg"
                      className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                      alt="Rwandan Wedding"
                    />
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


      {/* Modernized Full-Width Promotional Carousel */}
      <section
        className="py-16 md:py-24 px-0 relative bg-slate-50/50 overflow-hidden group/carousel"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-black text-sage-950 tracking-tight">
              <TranslatedText text="Limited Exclusives" />
            </h2>
            <p className="text-sage-500 font-medium text-lg">
              <TranslatedText text="Hand-picked deals and upcoming events just for you." />
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="p-4 rounded-2xl bg-white shadow-sm border border-sage-100 text-sage-600 hover:bg-sage-950 hover:text-white transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-4 rounded-2xl bg-white shadow-sm border border-sage-100 text-sage-600 hover:bg-sage-950 hover:text-white transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto">
          {/* Carousel Wrapper */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8 px-4 md:px-6 scroll-smooth"
          >
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-[45vw] lg:w-[400px] snap-center"
              >
                {/* Modern Card (No Gradients) */}
                <div className="group relative h-[500px] rounded-[32px] overflow-hidden bg-white border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500">
                  {/* Image Holder */}
                  <div className="h-[240px] w-full overflow-hidden">
                    <img
                      src={promo.image}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none shadow-sm py-1.5 px-4 rounded-full font-bold text-[10px] uppercase tracking-wider">
                      {promo.badge}
                    </Badge>
                  </div>

                  <div className="absolute top-4 right-4 bg-[#668c65] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                    <div className="text-center leading-none">
                      <p className="text-lg font-black">{promo.discount.split(' ')[0]}</p>
                      <p className="text-[8px] font-bold uppercase tracking-tighter">{promo.discount.split(' ')[1]}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-sage-50 flex items-center justify-center text-sage-300 group-hover:bg-[#668c65]/10 group-hover:text-[#668c65] transition-colors duration-300">
                      {promo.icon}
                    </div>

                    <div>
                      <h3 className="text-2xl font-extrabold text-sage-950 mb-2 leading-tight">
                        <TranslatedText text={promo.title} />
                      </h3>
                      <p className="text-sage-500 text-sm font-medium line-clamp-2 leading-relaxed">
                        <TranslatedText text={promo.description} />
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-sage-50">
                      <div className="flex items-center gap-2 text-xs font-bold text-sage-400">
                        <Clock className="w-4 h-4" />
                        <span>Until {promo.validUntil}</span>
                      </div>
                      <Link href={promo.type === "event" ? "/events" : "/services"}>
                        <Button variant="ghost" className="text-[#668c65] font-bold hover:bg-[#668c65]/10 rounded-xl group/btn p-0">
                          <TranslatedText text="Explore" />
                          <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modernized Stats Section */}
      <section className="py-20 md:py-28 px-4 md:px-6 relative bg-white border-y border-slate-50">
        <div className="container mx-auto max-w-6xl">
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

      {/* Modernized Services Section */}
      <section className="py-24 md:py-32 px-4 md:px-6 relative bg-slate-50/30">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-2 text-[#668c65]">
                <Sparkles className="h-5 w-5" />
                <span className="font-outfit font-bold tracking-widest uppercase text-xs">
                  <TranslatedText text="Categories" />
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-sage-950 leading-tight">
                <TranslatedText text="Everything for Your Celebration" />
              </h2>
            </div>
            <p className="text-lg text-sage-500 max-w-md font-medium leading-relaxed">
              <TranslatedText text="Explore our curated directory of luxury wedding providers. Each service is hand-vetted to ensure the highest standards of excellence." />
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#668c65]/30 transition-all duration-500 flex flex-col items-center text-center space-y-6"
              >
                <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6", service.color)}>
                  {service.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-sage-950 tracking-tight">
                    <TranslatedText text={service.title} />
                  </h3>
                  <p className="text-sage-500 text-sm font-medium leading-relaxed">
                    <TranslatedText text={service.description} />
                  </p>
                </div>
                <div className="pt-4 w-full">
                  <Link href="/services">
                    <Button variant="outline" className="w-full h-14 rounded-2xl border-sage-100 font-bold hover:bg-sage-950 hover:text-white transition-all">
                      <TranslatedText text="Explore Providers" />
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modernized How It Works Section */}
      <section className="py-24 md:py-32 px-4 md:px-6 relative bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-5xl md:text-6xl font-black text-sage-950 tracking-tight">
              <TranslatedText text="Simple Three-Step Planning" />
            </h2>
            <p className="text-lg text-sage-500 max-w-2xl mx-auto font-medium">
              <TranslatedText text="We've streamlined the journey from your engagement to your dream wedding day." />
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[2px] bg-slate-100 z-0" />

            {[
              { step: "01", title: "Discover", desc: "Browse hand-vetted portfolios and secure your favorites.", icon: <Search className="h-6 w-6" /> },
              { step: "02", title: "Collaborate", desc: "Connect directly with providers to discuss your vision.", icon: <Users className="h-6 w-6" /> },
              { step: "03", title: "Celebrate", desc: "Enjoy your perfect moment with everything in place.", icon: <Sparkles className="h-6 w-6" /> },
            ].map((item, index) => (
              <div key={index} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center mb-8 shadow-sm group-hover:border-[#668c65] group-hover:shadow-xl transition-all duration-500">
                  <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-black">
                    {item.step}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    <TranslatedText text={item.title} />
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    <TranslatedText text={item.desc} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 px-4 md:px-6 relative bg-[#f7f9fa] overflow-hidden">
        {/* Background Leaf Motif */}
        <div className="leaf-bg opacity-20" />

        <div className="container mx-auto max-w-7xl relative z-10">
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
      <section className="py-24 md:py-32 px-4 md:px-6 relative bg-white border-t border-slate-50">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16 space-y-4">
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

      {/* Mobile Bottom Navigation - Only on mobile */}
      <PublicBottomNav />

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


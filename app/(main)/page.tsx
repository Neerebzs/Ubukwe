"use client";

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Music, Utensils, MapPin, Palette, Mic, Star, ArrowRight, Heart, Sparkles, Clock, Shield, ChevronDown, Zap, Play, Search, Gift, Calendar, TrendingUp, Tag, Percent } from "lucide-react"
import Link from "next/link"
import React, { useState, useRef, useEffect } from "react";
import { TranslatedText } from "@/components/translated-text";
import { PublicBottomNav } from "@/components/ui/public-bottom-nav";
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
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Mic className="h-8 w-8" />,
      title: "Master of Ceremonies",
      description: "Experienced MCs who understand Rwandan wedding traditions and customs",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Decoration Services",
      description: "Beautiful traditional and modern decorations for your special day",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: <Utensils className="h-8 w-8" />,
      title: "Catering & Food",
      description: "Authentic Rwandan cuisine and international dishes for your celebration",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Venue Booking",
      description: "Perfect venues for traditional and modern Rwandan wedding celebrations",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: <Music className="h-8 w-8" />,
      title: "Cultural Music",
      description: "Traditional Rwandan musicians and modern entertainment options",
      color: "from-teal-500 to-pink-500",
    },
  ];

  const testimonials = [
    {
      name: "Marie & Jean",
      role: "Newlyweds",
      text: "Ubukwe made our wedding planning effortless. The providers were professional and understood our cultural vision perfectly.",
      rating: 5,
      image: "👰",
    },
    {
      name: "Amina & David",
      role: "Newlyweds",
      text: "From traditional dancers to catering, everything was coordinated seamlessly. Our guests couldn't stop talking about the celebration!",
      rating: 5,
      image: "💒",
    },
    {
      name: "Grace & Peter",
      role: "Newlyweds",
      text: "The platform's transparency and quality assurance gave us peace of mind. Highly recommended for any Rwandan wedding!",
      rating: 5,
      image: "💍",
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
      {/* Pinterest-Style Hero Section with Masonry Grid */}
      <section className="relative w-full overflow-hidden min-h-[85vh] flex items-center pt-24 bg-[#fffefe]">
        {/* Background Decorative Blobs */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-[#f4f7f4] rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[50%] bg-[#fff5f5] rounded-full blur-3xl opacity-60" />

        {/* Content Wrapper */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* ================= LEFT CONTENT ================= */}
            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
              <div className="space-y-4">
                <span className="text-primary font-outfit font-medium tracking-[0.2em] uppercase text-xs block">
                  <TranslatedText text="Master Wedding" />
                </span>

                <h1 className="font-serif italic text-5xl md:text-7xl lg:text-8xl text-slate-900 leading-[1.1] font-light">
                  Making Your <br />
                  <span className="relative">
                    Dream
                    <div className="absolute -right-4 top-4 w-3 h-3 bg-red-500 rounded-full" />
                  </span> Long <br />
                  Lasting.
                </h1>

                <p className="font-outfit text-slate-500 text-lg max-w-md leading-relaxed font-light">
                  <TranslatedText text="Best wishes to your big day of life. Congratulation to your wedding time. We are happy to see you here. We must want that your dreamy wedding will made with us." />
                </p>
              </div>


            </div>

            {/* ================= RIGHT VISUALS ================= */}
            <div className="relative h-[500px] w-full animate-in fade-in slide-in-from-right duration-1000 delay-200">
              {/* Main Photo Blob (Large Oval) */}
              <div className="absolute left-[10%] top-0 w-[60%] h-[90%] z-20 overflow-hidden mask-arch shadow-2xl hover:scale-[1.02] transition-transform duration-700">
                <img
                  src="/grom.jpg"
                  className="w-full h-full object-cover"
                  alt="Wedding Groom"
                />
              </div>

              {/* Decorative Arch with Line Art (Sage Green) */}
              <div className="absolute left-[50%] bottom-[5%] w-[45%] h-[65%] z-30 bg-[#7d8c70] mask-arch flex items-center justify-center p-8 shadow-xl animate-float">
                <svg viewBox="0 0 100 100" className="w-full h-full text-white/90 opacity-80" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M50 20 C30 20, 20 40, 20 60 L20 80 L80 80 L80 60 C80 40, 70 20, 50 20 Z" />
                  <circle cx="40" cy="35" r="5" />
                  <circle cx="60" cy="35" r="5" />
                  <path d="M35 80 L35 70 C35 65, 45 60, 50 60 C55 60, 65 65, 65 70 L65 80" />
                </svg>
                {/* Fallback Couple Icon if SVG is too simple */}
                <Users className="absolute text-white/20 w-32 h-32" />
              </div>

              {/* Secondary Photo Blob (Small Circle) */}
              <div className="absolute right-0 top-[10%] w-[40%] h-[40%] z-10 overflow-hidden rounded-full border-[10px] border-white shadow-lg">
                <img
                  src="/beautiful-garden-wedding-venue-rwanda.jpg"
                  className="w-full h-full object-cover"
                  alt="Wedding Venue"
                />
              </div>

              {/* Decorative Flowers */}
              <div className="absolute -right-8 bottom-12 w-32 h-32 z-40 opacity-90 animate-pulse transition-all duration-1000">
                <img src="/flower-corner.png" className="w-full h-full object-contain" alt="Flowers" style={{ filter: 'hue-rotate(320deg) brightness(1.1)' }} />
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Full-Width Promotional Carousel - Offers, Promotions & Events */}
      <section
        className="py-8 md:py-12 px-0 relative bg-white overflow-hidden group/carousel"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-full max-w-7xl mx-auto">
          {/* Carousel Container */}
          <div className="relative">
            {/* Navigation Buttons - Appear on Hover */}
            <div className="absolute inset-y-0 left-0 flex items-center z-30 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 pointer-events-none">
              <button
                onClick={() => scroll("left")}
                className="ml-4 p-3 rounded-full bg-white/90 shadow-xl border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all pointer-events-auto"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center z-30 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 pointer-events-none">
              <button
                onClick={() => scroll("right")}
                className="mr-4 p-3 rounded-full bg-white/90 shadow-xl border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all pointer-events-auto"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Carousel Wrapper */}
            <div
              ref={carouselRef}
              className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 px-4 md:px-6 scroll-smooth"
            >
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-[45vw] lg:w-[calc(33.33%-16px)] snap-center"
                >
                  {/* Card */}
                  <div className="group relative h-[380px] md:h-[420px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01]">
                    {/* Full Background Image */}
                    <img
                      src={promo.image}
                      alt={promo.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 md:top-4 left-3 md:left-4 right-3 md:right-4 flex items-start justify-between z-10">
                      {/* Type Badge */}
                      <div className="px-3 md:px-4 py-1.5 md:py-2 bg-transparent rounded-full shadow-lg backdrop-blur-sm border border-white/20">
                        <span className="text-white font-bold text-[10px] md:text-xs uppercase tracking-wide">
                          <TranslatedText text={promo.badge} />
                        </span>
                      </div>

                      {/* Discount Badge */}
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform duration-300">
                        <div className="text-center">
                          <div className="text-base md:text-lg font-black text-primary leading-tight">
                            {promo.discount.split(' ')[0]}
                          </div>
                          <div className="text-[9px] md:text-[10px] font-bold text-gray-600 leading-tight">
                            {promo.discount.split(' ')[1] || ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 z-10">
                      {/* Icon */}
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-lg md:rounded-xl flex items-center justify-center shadow-lg mb-3 md:mb-5 group-hover:scale-110 transition-transform duration-300">
                        <div className="text-white scale-90 md:scale-100">
                          {promo.icon}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 drop-shadow-lg line-clamp-1 font-serif italic">
                        <TranslatedText text={promo.title} />
                      </h3>

                      {/* Description */}
                      <p className="text-white/90 text-sm md:text-base mb-3 md:mb-4 drop-shadow-md line-clamp-2 font-outfit font-light leading-relaxed">
                        <TranslatedText text={promo.description} />
                      </p>

                      {/* Valid Until */}
                      <div className="flex items-center gap-2 text-xs text-white/80 mb-4 md:mb-5">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-outfit">
                          <TranslatedText text="Valid until" /> {promo.validUntil}
                        </span>
                      </div>
                    </div>

                    {/* Claim Button - Absolute Positioned */}
                    <button className="absolute bottom-5 md:bottom-7 right-5 md:right-7 px-5 md:px-7 py-2.5 md:py-3.5 bg-white text-primary font-bold text-sm md:text-base rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center gap-2 z-20 group/btn font-outfit">
                      <TranslatedText text="Claim" />
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll Indicators */}
            <div className="flex justify-center gap-2.5 mt-6 md:mt-8">
              {promotions.map((_, index) => (
                <div
                  key={index}
                  className="w-2.5 h-2.5 rounded-full bg-primary/20 hover:bg-primary transition-colors cursor-pointer"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Rose Theme */}
      <section className="py-12 md:py-20 px-4 md:px-6 relative bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="group relative">
                <div className="relative bg-secondary rounded-2xl p-8 text-center transition-all duration-300 group-hover:translate-y-[-4px]">
                  <div className="text-primary mb-4 flex justify-center group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <div className="text-4xl font-black text-primary mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium"><TranslatedText text={stat.label} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section with Rose Theme */}
      <section className="py-12 md:py-20 px-4 md:px-6 relative bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white text-primary px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              <TranslatedText text="Our Services" />
            </Badge>
            <h2 className="text-5xl font-black mb-4 text-black">
              <TranslatedText text="Premium Wedding Services" />
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto"><TranslatedText text="Everything you need for your perfect celebration" /></p>
          </div>

          <div className="relative">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="group cursor-pointer"
                >
                  <div className="relative rounded-2xl transition-all duration-300">
                    <div className="relative bg-white rounded-2xl p-8 h-full space-y-4 transition-all duration-300">
                      <div className="w-16 h-16 rounded-2xl bg-gray-300 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                        {service.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900"><TranslatedText text={service.title} /></h3>
                      <p className="text-gray-600 leading-relaxed"><TranslatedText text={service.description} /></p>
                      <Link href="/services">
                        <Button className="w-full bg-primary hover:bg-primary/80 text-white font-bold transition-all">
                          <TranslatedText text="Explore" />
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Rose Theme */}
      <section className="py-12 md:py-20 px-4 md:px-6 relative bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary text-primary px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              <TranslatedText text="Simple Process" />
            </Badge>
            <h2 className="text-5xl font-black mb-4 text-primary">
              <TranslatedText text="How It Works" />
            </h2>
            <p className="text-xl text-gray-600"><TranslatedText text="Three simple steps to your dream wedding" /></p>
          </div>

          <div className="space-y-8">
            {[
              { step: "1", title: "Browse & Discover", desc: "Explore verified providers and services tailored to your needs", icon: <Search className="h-6 w-6" /> },
              { step: "2", title: "Connect & Plan", desc: "Contact providers and discuss your vision with experts", icon: <Heart className="h-6 w-6" /> },
              { step: "3", title: "Celebrate & Enjoy", desc: "Relax and enjoy your perfect wedding day", icon: <Sparkles className="h-6 w-6" /> },
            ].map((item, index) => (
              <div key={index} className="flex gap-8 items-start group">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-black text-white group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>
                  </div>
                  {index < 2 && (
                    <div className="w-1 h-24 bg-primary mt-4 rounded-full" />
                  )}
                </div>
                <div className="pt-4 flex-1 bg-secondary rounded-2xl p-6 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary">
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900"><TranslatedText text={item.title} /></h3>
                  </div>
                  <p className="text-gray-600 text-lg"><TranslatedText text={item.desc} /></p>
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

      {/* FAQ Section with Rose Theme */}
      <section className="py-12 md:py-20 px-4 md:px-6 relative bg-white">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary text-primary px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              <TranslatedText text="Help Center" />
            </Badge>
            <h2 className="text-5xl font-black mb-4 text-primary">
              <TranslatedText text="Frequently Asked Questions" />
            </h2>
            <p className="text-xl text-gray-600"><TranslatedText text="Everything you need to know" /></p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="group">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-5 bg-primary/10 rounded-2xl flex items-center justify-between transition-all duration-300"
                >
                  <span className="font-bold text-gray-900 text-left text-lg"><TranslatedText text={faq.question} /></span>
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 ml-4">
                    <ChevronDown className={`h-5 w-5 text-white transition-transform duration-300 ${expandedFaq === index ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {expandedFaq === index && (
                  <div className="px-6 py-5 bg-white rounded-b-2xl text-gray-700 leading-relaxed">
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


"use client";

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Music, Utensils, MapPin, Palette, Mic, Star, ArrowRight, Heart, Sparkles, Clock, Shield, ChevronDown, Zap, Play, Search, Gift, Calendar, TrendingUp, Tag, Percent } from "lucide-react"
import Link from "next/link"
import React, { useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { TranslatedText } from "@/components/translated-text";
import { PublicBottomNav } from "@/components/ui/public-bottom-nav";

export default function HomePage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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
      image: "/Intore new.jpeg"
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
      color: "from-rose-500 to-pink-500",
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
      <Navbar />

      {/* Pinterest-Style Hero Section with Masonry Grid */}
<section className="relative w-full overflow-x-hidden min-h-[90vh] md:min-h-screen flex items-center pt-20 bg-gradient-to-br from-rose-50 via-white to-purple-50">
  
  {/* Floating Background (disabled on mobile) */}
  <div className="hidden lg:block absolute top-20 left-10 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl animate-float" />
  <div className="hidden lg:block absolute top-40 right-10 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-float-delayed" />
  <div className="hidden lg:block absolute bottom-20 left-1/3 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl animate-float-slow" />

  {/* Content Wrapper */}
  <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-5 md:px-6">
    
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

      {/* ================= LEFT CONTENT ================= */}
      <div className="space-y-6 md:space-y-8 order-2 lg:order-1 w-full min-w-0">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur rounded-full border border-rose-200 shadow">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-gray-700">
            <TranslatedText text="Rwanda's #1 Wedding Platform" />
          </span>
          <Sparkles className="h-4 w-4 text-rose-500" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
          <span className="bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            <TranslatedText text="Discover Your" />
          </span>
          <br />
          <span className="text-gray-900">
            <TranslatedText text="Dream Wedding" />
          </span>
          <br />
          <span className="bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
            <TranslatedText text="Experience" />
          </span>
        </h1>

        <p className="text-base md:text-lg text-gray-600 max-w-xl">
          <TranslatedText text="Connect with Rwanda's finest wedding providers. From traditional dancers to modern venues — everything you need." />
        </p>

        {/* Search */}
        <div className="relative w-full max-w-full overflow-hidden rounded-2xl bg-white border shadow">
          <div className="flex flex-col sm:flex-row">
            <div className="flex items-center px-4 py-3 flex-1 min-w-0">
              <Search className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search services..."
                className="w-full min-w-0 outline-none text-sm"
              />
            </div>
            <Button className="m-2 sm:m-3 bg-rose-500 text-white font-bold rounded-xl">
              <TranslatedText text="Search" />
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-1">
          {["Traditional Dance", "Venues", "Catering", "Photography"].map((tag) => (
            <button
              key={tag}
              className="flex-shrink-0 px-4 py-2 bg-white border rounded-full text-xs font-semibold whitespace-nowrap"
            >
              <TranslatedText text={tag} />
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/services" className="w-full sm:w-auto">
            <Button className="w-full bg-rose-500 text-white font-bold rounded-2xl px-8 py-5">
              <Zap className="mr-2 h-5 w-5" />
              <TranslatedText text="Explore Services" />
            </Button>
          </Link>

          <Link href="/auth/signup" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full rounded-2xl px-8 py-5">
              <Play className="mr-2 h-5 w-5" />
              <TranslatedText text="Watch Demo" />
            </Button>
          </Link>
        </div>

      </div>

      {/* ================= RIGHT MASONRY ================= */}
      <div className="relative order-1 lg:order-2 w-full min-w-0">
        <div className="grid grid-cols-2 gap-3 md:gap-4">

          {/* Tall Card */}
          <div className="row-span-2 rounded-2xl overflow-hidden shadow-lg">
            <img src="/grom.jpg" className="w-full h-full object-cover" />
          </div>

          <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
            <img src="/beautiful-garden-wedding-venue-rwanda.jpg" className="w-full h-full object-cover" />
          </div>

          <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
            <img src="/rwandan-traditional-food-buffet.jpg" className="w-full h-full object-cover" />
          </div>

        </div>
      </div>

    </div>
  </div>
</section>


      {/* Full-Width Promotional Carousel - Offers, Promotions & Events */}
      <section className="py-8 md:py-12 px-0 relative bg-white overflow-hidden">
        <div className="w-full max-w-7xl mx-auto">
          {/* Carousel Container */}
          <div className="relative">
            {/* Carousel Wrapper */}
            <div className="flex gap-3 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 px-4 md:px-6">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="flex-shrink-0 w-[80vw] sm:w-[70vw] md:w-[40vw] lg:w-[calc(25%-18px)] xl:w-[calc(25%-18px)] snap-center"
                >
                  {/* Card */}
                  <div className="group relative h-[350px] md:h-[400px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
                    {/* Full Background Image */}
                    <img 
                      src={promo.image} 
                      alt={promo.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    
                    {/* Glow Effect on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500 mix-blend-overlay" />

                    {/* Top Badges */}
                    <div className="absolute top-3 md:top-4 left-3 md:left-4 right-3 md:right-4 flex items-start justify-between z-10">
                      {/* Type Badge */}
                      <div className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full shadow-lg backdrop-blur-sm">
                        <span className="text-white font-bold text-[10px] md:text-xs uppercase tracking-wide">
                          <TranslatedText text={promo.badge} />
                        </span>
                      </div>

                      {/* Discount Badge */}
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform duration-300">
                        <div className="text-center">
                          <div className="text-base md:text-lg font-black bg-gradient-to-br from-rose-500 to-pink-600 bg-clip-text text-transparent leading-tight">
                            {promo.discount.split(' ')[0]}
                          </div>
                          <div className="text-[9px] md:text-[10px] font-bold text-gray-600 leading-tight">
                            {promo.discount.split(' ')[1] || ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
                      {/* Icon */}
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                        <div className="text-white scale-90 md:scale-100">
                          {promo.icon}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2 drop-shadow-lg line-clamp-1">
                        <TranslatedText text={promo.title} />
                      </h3>

                      {/* Description */}
                      <p className="text-white/90 text-xs md:text-sm mb-2 md:mb-3 drop-shadow-md line-clamp-2">
                        <TranslatedText text={promo.description} />
                      </p>

                      {/* Valid Until */}
                      <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-white/80 mb-3 md:mb-4">
                        <Clock className="h-3 w-3" />
                        <span>
                          <TranslatedText text="Valid until" /> {promo.validUntil}
                        </span>
                      </div>
                    </div>

                    {/* Claim Button - Absolute Positioned */}
                    <button className="absolute bottom-4 md:bottom-6 right-4 md:right-6 px-4 md:px-6 py-2 md:py-3 bg-white text-rose-600 font-bold text-sm md:text-base rounded-lg md:rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center gap-1 md:gap-2 z-20 group/btn">
                      <TranslatedText text="Claim" />
                      <ArrowRight className="h-3 w-3 md:h-4 md:w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll Indicators */}
            <div className="flex justify-center gap-2 mt-4 md:mt-6">
              {promotions.map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-rose-300 hover:bg-rose-500 transition-colors cursor-pointer"
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
                <div className="relative bg-rose-50 rounded-2xl p-8 text-center transition-all duration-300 group-hover:translate-y-[-4px]">
                  <div className="text-rose-600 mb-4 flex justify-center group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <div className="text-4xl font-black text-rose-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium"><TranslatedText text={stat.label} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section with Rose Theme */}
      <section className="py-12 md:py-20 px-4 md:px-6 relative bg-rose-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white text-rose-600 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              <TranslatedText text="Our Services" />
            </Badge>
            <h2 className="text-5xl font-black mb-4 text-rose-600">
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
                      <div className="w-16 h-16 rounded-2xl bg-rose-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                        {service.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900"><TranslatedText text={service.title} /></h3>
                      <p className="text-gray-600 leading-relaxed"><TranslatedText text={service.description} /></p>
                      <Link href="/services">
                        <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all">
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
            <Badge className="mb-4 bg-rose-50 text-rose-600 px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              <TranslatedText text="Simple Process" />
            </Badge>
            <h2 className="text-5xl font-black mb-4 text-rose-600">
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
                    <div className="relative w-20 h-20 rounded-full bg-rose-500 flex items-center justify-center text-2xl font-black text-white group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>
                  </div>
                  {index < 2 && (
                    <div className="w-1 h-24 bg-rose-500 mt-4 rounded-full" />
                  )}
                </div>
                <div className="pt-4 flex-1 bg-rose-50 rounded-2xl p-6 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-600">
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

      {/* Testimonials with Rose Theme */}
      <section className="py-12 md:py-20 px-4 md:px-6 relative bg-rose-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white text-rose-600 px-4 py-2">
              <Star className="h-4 w-4 mr-2 fill-rose-600" />
              <TranslatedText text="Testimonials" />
            </Badge>
            <h2 className="text-5xl font-black mb-4 text-rose-600">
              <TranslatedText text="Success Stories" />
            </h2>
            <p className="text-xl text-gray-600"><TranslatedText text="Hear from couples who trusted us" /></p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group">
                <div className="relative bg-white rounded-2xl p-8 transition-all duration-300 h-full">
                  <div className="absolute top-6 right-6 text-6xl opacity-10 text-rose-500">"</div>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center text-3xl mb-4">
                      {testimonial.image}
                    </div>
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                    <div className="border-t border-rose-200 pt-4">
                      <p className="font-bold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600"><TranslatedText text={testimonial.role} /></p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section with Rose Theme */}
      <section className="py-12 md:py-20 px-4 md:px-6 relative bg-white">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-rose-50 text-rose-600 px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              <TranslatedText text="Help Center" />
            </Badge>
            <h2 className="text-5xl font-black mb-4 text-rose-600">
              <TranslatedText text="Frequently Asked Questions" />
            </h2>
            <p className="text-xl text-gray-600"><TranslatedText text="Everything you need to know" /></p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="group">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-5 bg-rose-50 rounded-2xl flex items-center justify-between transition-all duration-300"
                >
                  <span className="font-bold text-gray-900 text-left text-lg"><TranslatedText text={faq.question} /></span>
                  <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0 ml-4">
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

      <Footer />

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

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-30px, 30px) scale(1.05);
          }
          66% {
            transform: translate(20px, -20px) scale(0.95);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(15px, -15px) scale(1.02);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
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

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
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

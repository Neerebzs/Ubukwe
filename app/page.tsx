"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Music, Utensils, MapPin, Palette, Mic, Star, CheckCircle, ArrowRight, Heart, Sparkles, Clock, Shield, ChevronDown, Zap, Play } from "lucide-react"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile";
import React, { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { HeroCarousel } from "@/components/ui/hero-carousel";
import { TranslatedText } from "@/components/translated-text";
import { PublicBottomNav } from "@/components/ui/public-bottom-nav";

export default function HomePage() {
  const isMobile = useIsMobile();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeService, setActiveService] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

      {/* Hero Section with Animated Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20 px-4">
        <div className="absolute inset-0  bg-gradient-to-br from-teal-50/40 via-white to-blue-50/40" />
        
        {/* Animated Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl animate-blob animation-delay-4000" />

        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-teal-100 text-teal-700 border border-teal-300 hover:bg-teal-200">
                  <Sparkles className="h-3 w-3 mr-2" />
                  <TranslatedText text="Next Generation Wedding Platform" />
                </Badge>
                <h1 className="text-6xl lg:text-7xl font-black leading-tight">
                  <span className="text-teal-600">
                    <TranslatedText text="Your Perfect" />
                  </span>
                  <br />
                  <span className="text-gray-900"><TranslatedText text="Wedding Awaits" /></span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                  <TranslatedText text="Connect with Rwanda's finest wedding providers. Seamless booking, verified professionals, and unforgettable celebrations." />
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/services" className="group">
                  <Button size="lg" className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white font-bold text-lg px-8 shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50 transition-all">
                    <TranslatedText text="Explore Services" />
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/auth/signup" className="group">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-teal-500 text-teal-600 hover:bg-teal-50 font-bold text-lg px-8">
                    <TranslatedText text="Become Provider" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right - Hero Carousel */}
            <div className="relative h-96 lg:h-full min-h-96">
              <div className="absolute inset-0 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl overflow-hidden h-full ">
                <HeroCarousel />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Interactive Cards */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-200/40 to-purple-200/40 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 group-hover:border-teal-400 rounded-2xl p-8 text-center transition-all duration-300 group-hover:translate-y-[-4px]">
                  <div className="text-teal-600 mb-4 flex justify-center group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <div className="text-4xl font-black text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600"><TranslatedText text={stat.label} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Carousel Section */}
      <section className="py-20 px-4 relative bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">
              <span className="text-teal-600">
                <TranslatedText text="Premium Services" />
              </span>
            </h2>
            <p className="text-xl text-gray-600"><TranslatedText text="Curated wedding experiences for your special day" /></p>
          </div>

          <div className="relative">
            {/* Service Cards Carousel */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="group cursor-pointer"
                  onMouseEnter={() => setActiveService(index)}
                >
                  <div className="relative rounded-2xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-teal-400/40">
                    <div className="bg-white rounded-2xl p-8 h-full space-y-4">
                      <div className="text-gray-900 text-4xl group-hover:scale-125 transition-transform duration-300">{service.icon}</div>
                      <h3 className="text-2xl font-bold text-gray-900"><TranslatedText text={service.title} /></h3>
                      <p className="text-gray-600 leading-relaxed"><TranslatedText text={service.description} /></p>
                      <Link href="/services">
                        <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold group-hover:shadow-lg group-hover:shadow-teal-400/40 transition-all">
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

      {/* How It Works - Timeline */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-5xl font-black text-center mb-16">
            <span className="text-teal-600">
              <TranslatedText text="How It Works" />
            </span>
          </h2>

          <div className="space-y-8">
            {[
              { step: "1", title: "Browse", desc: "Explore verified providers and services" },
              { step: "2", title: "Connect", desc: "Contact providers and discuss your vision" },
              { step: "3", title: "Celebrate", desc: "Enjoy your perfect wedding day" },
            ].map((item, index) => (
              <div key={index} className="flex gap-8 items-start group">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center text-2xl font-black text-white group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  {index < 2 && <div className="w-1 h-24 bg-teal-500 mt-4" />}
                </div>
                <div className="pt-2 flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2"><TranslatedText text={item.title} /></h3>
                  <p className="text-gray-600"><TranslatedText text={item.desc} /></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials with Glassmorphism */}
      <section className="py-20 px-4 relative bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-5xl font-black text-center mb-16">
            <span className="text-teal-600">
              <TranslatedText text="Success Stories" />
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group">
                <div className="relative bg-white/60 backdrop-blur-md border border-gray-200 rounded-2xl p-8 hover:border-teal-400 transition-all duration-300 group-hover:bg-white/80 shadow-sm hover:shadow-md">
                  <div className="text-5xl mb-4">{testimonial.image}</div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600"><TranslatedText text={testimonial.role} /></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-5xl font-black text-center mb-16">
            <span className="text-teal-600">
              <TranslatedText text="FAQ" />
            </span>
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="group">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 group-hover:border-teal-400 rounded-xl flex items-center justify-between transition-all duration-300 group-hover:bg-gray-100"
                >
                  <span className="font-bold text-gray-900 text-left"><TranslatedText text={faq.question} /></span>
                  <ChevronDown className={`h-5 w-5 text-teal-600 transition-transform duration-300 ${expandedFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 border border-gray-200 border-t-0 rounded-b-xl text-gray-700">
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

"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Hero images array
const heroImages = [
  {
    src: "/ababyinyi.jpeg",
    alt: "Traditional Rwandan Wedding Dancers",
    title: "Traditional Dancers",
    description: "Authentic cultural performances"
  },
  {
    src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop",
    alt: "Wedding Venue Decoration",
    title: "Beautiful Venues",
    description: "Stunning locations for your celebration"
  },
  {
    src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
    alt: "Traditional Rwandan Cuisine",
    title: "Authentic Cuisine",
    description: "Delicious traditional dishes"
  },
  {
    src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop",
    alt: "Wedding Ceremony",
    title: "Cultural Ceremonies",
    description: "Honoring Rwandan traditions"
  },
  {
    src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=600&fit=crop",
    alt: "Wedding Decoration",
    title: "Elegant Decorations",
    description: "Transform your venue beautifully"
  }
];

export function HeroCarousel() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="image-content w-full">
      {!mounted ? (
        <div className="relative w-full h-[300px] min-h-[300px] rounded-2xl md:rounded-4xl overflow-hidden shadow-2xl">
          <img 
            src="/ababyinyi.jpeg" 
            alt="Traditional Rwandan Wedding Dancers" 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 md:p-6 rounded-b-2xl md:rounded-b-4xl">
            <h3 className="text-white font-bold text-sm md:text-xl mb-1 md:mb-2">Traditional Dancers</h3>
            <p className="text-white/90 text-xs md:text-base">Authentic cultural performances</p>
          </div>
        </div>
      ) : (
        <Swiper
          modules={[Autoplay, EffectFade, Navigation, Pagination]}
          effect="fade"
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          loop={true}
          navigation={false}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          className="hero-swiper rounded-2xl md:rounded-4xl overflow-hidden shadow-2xl"
          style={{ height: '300px', minHeight: '300px' }}
        >
          {heroImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full">
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="w-full h-full object-cover rounded-4xl"
                  onError={(e) => {
                    // Fallback to first image if others don't exist
                    if (index > 0) {
                      e.currentTarget.src = "/ababyinyi.jpeg";
                    }
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 md:p-6 rounded-b-2xl md:rounded-b-4xl">
                  <h3 className="text-white font-bold text-sm md:text-xl mb-1 md:mb-2">{image.title}</h3>
                  <p className="text-white/90 text-xs md:text-base">{image.description}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      
      <style jsx global>{`
        .hero-swiper .swiper-pagination-bullet {
          background: white;
          opacity: 0.7;
          width: 12px;
          height: 12px;
          margin: 0 6px;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #5046e5;
          transform: scale(1.2);
        }
        .hero-swiper .swiper-pagination {
          bottom: 30px;
        }
        .hero-swiper .swiper-slide {
          transition: all 0.3s ease;
        }
        .hero-swiper .swiper-slide-active {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

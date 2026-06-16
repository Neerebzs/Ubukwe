"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { TranslatedText } from "@/components/translated-text";
import { useSystemSettings } from "@/contexts/system-settings-context";
import { usePathname } from "next/navigation";

export function Footer() {
  const { settings } = useSystemSettings();
  const pathname = usePathname();

  const hideOnMobilePaths = [
    /^\/services(\/.*)?$/,
    /^\/events(\/.*)?$/,
    /^\/about$/,
  ];

  const shouldHideOnMobile = hideOnMobilePaths.some(regex => regex.test(pathname || ""));

  return (
    <footer className={`bg-[#fcfbf9] border-t border-primary/10 pt-20 pb-10 ${shouldHideOnMobile ? "hidden md:block" : ""}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden">
                {settings.logoUrl && (
                  <Image 
                    src={settings.logoUrl} 
                    alt="VowNest Logo" 
                    width={48} 
                    height={48}
                    className="object-contain"
                  />
                )}
              </div>
              <span className="text-2xl font-serif italic text-slate-900 font-medium">VowNest</span>
            </Link>
            <p className="text-slate-600 leading-relaxed font-outfit font-light">
              <TranslatedText text="Connecting Rwandan couples with authentic wedding service providers to celebrate love and cultural heritage with elegance and ease." />
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="p-2.5 rounded-full bg-white border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-white border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-white border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="hidden md:block">
            <h4 className="font-serif italic text-xl text-slate-900 mb-6 font-medium">Services</h4>
            <ul className="space-y-4 font-outfit font-light">
              {["Traditional Dancers", "Master of Ceremonies", "Decorations", "Catering"].map((item) => (
                <li key={item}>
                  <Link href="/services" className="text-slate-600 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                    <TranslatedText text={item} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="hidden md:block">
            <h4 className="font-serif italic text-xl text-slate-900 mb-6 font-medium">Support</h4>
            <ul className="space-y-4 font-outfit font-light">
              {[
                { label: "Contact Us", href: "/contact" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Refund Policy", href: "/refund-policy" },
                { label: "Cancellation Policy", href: "/cancellation-policy" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-slate-600 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                    <TranslatedText text={item.label} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-serif italic text-xl text-slate-900 mb-6 font-medium">Contact Details</h4>
            <ul className="space-y-5 font-outfit font-light">
              <li className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="text-slate-600">
                  <p className="font-medium text-slate-900">{settings.contactLocationLine1}</p>
                  <p className="text-sm opacity-80">{settings.contactLocationLine2}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="text-slate-600">
                  <p className="font-medium text-slate-900">{settings.contactPhone}</p>
                  <p className="text-sm opacity-80">Mon - Fri, 9am - 6pm</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="text-slate-600">
                  <p className="font-medium text-slate-900">{settings.contactEmail}</p>
                  <p className="text-sm opacity-80">Online 24/7</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary/10 pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <p className="text-slate-500 font-outfit font-light text-sm">
            &copy; {new Date().getFullYear()} VowNest — operated by Neere Business Group Ltd. <TranslatedText text="Celebrating Rwandan wedding traditions with pride." />
          </p>
          <div className="flex items-center gap-8 text-sm text-slate-400 font-outfit font-light">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}



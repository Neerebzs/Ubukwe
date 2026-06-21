"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone, ChevronDown } from "lucide-react";
import { TranslatedText } from "@/components/translated-text";
import { useSystemSettings } from "@/contexts/system-settings-context";
import { usePathname } from "next/navigation";

// ── Collapsible footer column (mobile only) ───────────────────────────────────
function FooterAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-t border-primary/8 md:border-0">
      {/* Mobile toggle header */}
      <button
        className="md:hidden w-full flex items-center justify-between py-4 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="font-serif italic text-base text-slate-900 font-medium">{title}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {/* Desktop: always visible heading */}
      <h4 className="hidden md:block font-serif italic text-xl text-slate-900 mb-6 font-medium">{title}</h4>
      {/* Content: visible on desktop, collapsible on mobile */}
      <div className={`overflow-hidden transition-all duration-300 md:block ${open ? "max-h-96 pb-4" : "max-h-0 md:max-h-none"}`}>
        {children}
      </div>
    </div>
  );
}

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
    <footer className={`bg-[#fcfbf9] border-t border-primary/10 pt-10 md:pt-16 pb-8 ${shouldHideOnMobile ? "hidden md:block" : ""}`}>
      <div className="container mx-auto px-4">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 md:gap-10 mb-0 md:mb-14">

          {/* Brand — always visible, no accordion */}
          <div className="space-y-4 pb-6 md:pb-0 border-b border-primary/8 md:border-0">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden">
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
              <span className="text-xl md:text-2xl font-serif italic text-slate-900 font-medium">VowNest</span>
            </Link>

            <p className="text-slate-500 leading-relaxed font-outfit font-light text-sm">
              <TranslatedText text="Connecting Rwandan couples with authentic wedding service providers." />
            </p>

            <div className="flex items-center gap-3 pt-1">
              {[
                { Icon: Instagram, href: "#" },
                { Icon: Facebook, href: "#" },
                { Icon: Twitter, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="p-2 rounded-full bg-white border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services — collapsible on mobile */}
          <FooterAccordion title="Services">
            <ul className="space-y-3 font-outfit font-light">
              {["Traditional Dancers", "Master of Ceremonies", "Decorations", "Catering"].map((item) => (
                <li key={item}>
                  <Link href="/services" className="text-slate-500 hover:text-primary transition-colors flex items-center gap-2 group text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors flex-shrink-0" />
                    <TranslatedText text={item} />
                  </Link>
                </li>
              ))}
            </ul>
          </FooterAccordion>

          {/* Support — collapsible on mobile */}
          <FooterAccordion title="Support">
            <ul className="space-y-3 font-outfit font-light">
              {[
                { label: "Contact Us", href: "/contact" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Refund Policy", href: "/refund-policy" },
                { label: "Cancellation Policy", href: "/cancellation-policy" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-slate-500 hover:text-primary transition-colors flex items-center gap-2 group text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors flex-shrink-0" />
                    <TranslatedText text={item.label} />
                  </Link>
                </li>
              ))}
            </ul>
          </FooterAccordion>

          {/* Contact — always visible, compact on mobile */}
          <div className="pt-4 md:pt-0 border-t border-primary/8 md:border-0">
            <h4 className="font-serif italic text-base md:text-xl text-slate-900 mb-4 md:mb-6 font-medium">Contact</h4>
            <ul className="space-y-4 font-outfit font-light">
              <li className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/5 text-primary flex-shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="text-slate-500 text-sm">
                  <p className="font-medium text-slate-800">{settings.contactLocationLine1}</p>
                  <p className="text-xs opacity-80">{settings.contactLocationLine2}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/5 text-primary flex-shrink-0 mt-0.5">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="text-slate-500 text-sm">
                  <p className="font-medium text-slate-800">{settings.contactPhone}</p>
                  <p className="text-xs opacity-80">Mon – Fri, 9am – 6pm</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/5 text-primary flex-shrink-0 mt-0.5">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="text-slate-500 text-sm">
                  <p className="font-medium text-slate-800">{settings.contactEmail}</p>
                  <p className="text-xs opacity-80">Online 24/7</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary/10 pt-6 mt-6 md:mt-0 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-slate-400 font-outfit font-light text-xs leading-relaxed">
            &copy; {new Date().getFullYear()} VowNest — Neere Business Group Ltd.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-400 font-outfit font-light">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

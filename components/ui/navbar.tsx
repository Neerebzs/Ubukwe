"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import Image from "next/image";
import { MenuIcon, XIcon, Home, Briefcase, Info, Calendar, LogOut, LayoutDashboard, ChevronDown, Ticket, Search } from "lucide-react";
import { Button } from "./button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { TranslatedText } from "@/components/translated-text";
import { useAuth } from "@/hooks/useAuth";
import { AISearch } from "@/components/ui/ai-search";
import { useMobileMenu } from "@/contexts/mobile-menu-context";
import { useSystemSettings } from "@/contexts/system-settings-context";

export function Navbar() {
  const isMobile = useIsMobile();
  const { isMenuOpen, toggleMenu } = useMobileMenu();
  const { user, isAuthenticated, logout } = useAuth();
  const { settings } = useSystemSettings();
  const [eventsDropdownOpen, setEventsDropdownOpen] = React.useState(false);
  const [mobileEventsOpen, setMobileEventsOpen] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setEventsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="w-full fixed top-0 z-50 bg-white">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between gap-12">
          {/* Logo / Brand — always show VOWNEST text in brand green, logo image alongside if set */}
          <Link href="/" className="flex items-center gap-1.5 flex-shrink-0 group transition-opacity hover:opacity-80">
            {settings.logoUrl && (
              <Image
                src={settings.logoUrl}
                alt="Vownest Logo"
                width={120}
                height={40}
                className="object-contain h-10 w-auto max-w-[120px]"
                priority
              />
            )}
            <span className="font-serif italic text-2xl font-bold tracking-tight text-[#668c65]">
              Vownest
            </span>
          </Link>

          {/* Search Bar - desktop only via CSS (avoids hydration flash from isMobile) */}
          <div className="flex-1 mx-8 max-w-xl hidden md:block">
            <AISearch />
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-8">
            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden md:flex items-center gap-10">
                <a href="/" className="font-serif italic text-[17px] text-(--primary) hover:text-(--primary)/60 transition-colors">
                  <TranslatedText text="Home" />
                </a>
                <a href="/services" className="font-serif italic text-[17px] text-(--primary) hover:text-(--primary)/60 transition-colors">
                  <TranslatedText text="Services" />
                </a>
                
                {/* Events Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setEventsDropdownOpen(!eventsDropdownOpen)}
                    className="font-serif italic text-[17px] text-(--primary) hover:text-(--primary)/60 transition-colors flex items-center gap-1.5"
                  >
                    <TranslatedText text="Events" />
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${eventsDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {eventsDropdownOpen && (
                    <div className="absolute top-full left-0 mt-5 w-52 bg-white rounded-xl border border-(--border) py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link
                        href="/events"
                        className="flex items-center px-5 py-3.5 text-sm text-(--primary) hover:bg-(--secondary) transition-all group"
                        onClick={() => setEventsDropdownOpen(false)}
                      >
                        <Calendar className="h-4 w-4 mr-3 text-(--primary)/30 group-hover:text-(--primary) transition-colors" />
                        <TranslatedText text="Browse Events" />
                      </Link>
                      <Link
                        href="/my-tickets"
                        className="flex items-center px-5 py-3.5 text-sm text-(--primary) hover:bg-(--secondary) transition-all group"
                        onClick={() => setEventsDropdownOpen(false)}
                      >
                        <Ticket className="h-4 w-4 mr-3 text-(--primary)/30 group-hover:text-(--primary) transition-colors" />
                        <TranslatedText text="My Tickets" />
                      </Link>
                    </div>
                  )}
                </div>
                
                <a href="/about" className="font-serif italic text-[17px] text-(--primary) hover:text-(--primary)/60 transition-colors">
                  <TranslatedText text="About" />
                </a>
              </nav>
            )}

            {!isMobile && <div className="h-7 w-px bg-(--primary)/10 hidden md:block" />}

            <div className="flex items-center gap-5">
              
              {/* Sign In / Get Started — desktop only */}
              {!isMobile && !isAuthenticated && (
                <>
                  <Link href="/auth/signin">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-(--primary) hover:text-(--primary)/60 transition-all cursor-pointer">
                      <TranslatedText text="Sign In" />
                    </span>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-(--primary) text-white text-[11px] font-bold uppercase tracking-[0.25em] px-8 h-12 rounded-full hover:bg-(--primary)/90 transition-all border-none shadow-none">
                      <TranslatedText text="Get Started" />
                    </Button>
                  </Link>
                </>
              )}

              {/* Dashboard + logout — desktop only */}
              {!isMobile && isAuthenticated && (
                <div className="flex items-center gap-3">
                  <Link href={
                    user?.role === 'admin' ? '/admin/dashboard' :
                      user?.role === 'service_provider' ? '/provider/dashboard' :
                        '/customer/dashboard'
                  }>
                    <Button className="bg-(--primary) text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-full px-5 h-11 shadow-none">
                      <LayoutDashboard className="h-4 w-4 mr-2 text-white/40" />
                      <TranslatedText text="Dashboard" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => logout()}
                    className="h-11 w-11 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile: search icon + hamburger */}
            {isMobile && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileSearchOpen(true)}
                  className="text-(--primary) focus:outline-none h-11 w-11 flex items-center justify-center rounded-full hover:bg-slate-50 transition-all active:scale-95"
                  aria-label="Open search"
                >
                  <Search className="h-4 w-4" />
                </button>
                <button
                  onClick={toggleMenu}
                  className="text-(--primary) focus:outline-none flex-shrink-0 h-11 w-11 flex items-center justify-center bg-white rounded-full transition-all active:scale-95"
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>
        </div>

      </header>

      {/* Mobile Search Overlay */}
      {isMobile && mobileSearchOpen && (
        <div className="fixed inset-0 z-[110] flex flex-col">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileSearchOpen(false)}
          />
          <div className="relative z-10 bg-white px-4 pt-4 pb-4 flex items-center gap-3 shadow-md">
            <div className="flex-1">
              {/* Pass open+onClose so the panel opens immediately without needing to click the trigger */}
              <AISearch open={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-(--primary)/10 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={toggleMenu}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-[88%] max-w-sm bg-white overflow-y-auto animate-in slide-in-from-right duration-500 ease-out flex flex-col shadow-none">
            <div className="p-8 space-y-12 flex-1">
              {/* Drawer brand name */}
              <div className="flex items-center justify-between pb-8">
                <span className="font-serif italic text-2xl font-bold tracking-tight text-[#668c65]">Vownest</span>
                <button
                  onClick={toggleMenu}
                  className="h-11 w-11 flex items-center justify-center bg-(--secondary) rounded-full transition-all text-(--primary)"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Navigation Narrative */}
              <div className="space-y-6">
                <p className="text-[9px] font-bold text-(--primary)/30 uppercase tracking-[0.5em] px-4">Collections</p>
                <nav className="space-y-4">
                  {[
                    { href: "/", label: "Home", icon: Home },
                    { href: "/services", label: "Services", icon: Briefcase },
                    { href: "/about", label: "About", icon: Info },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={toggleMenu}
                      className="flex items-center justify-between px-5 py-5 rounded-2xl bg-(--secondary)/50 hover:bg-(--secondary) transition-all group"
                    >
                      <div className="flex items-center space-x-5">
                        <item.icon className="h-4 w-4 text-(--primary)/30 group-hover:text-(--primary) transition-colors" />
                        <span className="font-serif italic text-xl text-(--primary)">
                          <TranslatedText text={item.label} />
                        </span>
                      </div>
                    </a>
                  ))}
                  
                  {/* Events for Mobile */}
                  <div className="space-y-4">
                    <button
                      onClick={() => setMobileEventsOpen(!mobileEventsOpen)}
                      className="w-full flex items-center justify-between px-5 py-5 rounded-2xl bg-(--secondary)/50 hover:bg-(--secondary) transition-all group text-left"
                    >
                      <div className="flex items-center space-x-5">
                        <Calendar className="h-4 w-4 text-(--primary)/30 group-hover:text-(--primary) transition-colors" />
                        <span className="font-serif italic text-xl text-(--primary)">
                          <TranslatedText text="Events" />
                        </span>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-(--primary)/30 transition-transform duration-300 ${mobileEventsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {mobileEventsOpen && (
                      <div className="ml-8 space-y-2 border-l border-(--primary)/10 pl-6 py-1 animate-in slide-in-from-top-3 duration-400">
                        <Link
                          href="/events"
                          onClick={toggleMenu}
                          className="block py-3"
                        >
                          <span className="text-sm font-bold uppercase tracking-[0.2em] text-(--primary)/60 active:text-(--primary)">
                            <TranslatedText text="Browse Events" />
                          </span>
                        </Link>
                        <Link
                          href="/my-tickets"
                          onClick={toggleMenu}
                          className="block py-3"
                        >
                          <span className="text-sm font-bold uppercase tracking-[0.2em] text-(--primary)/60 active:text-(--primary)">
                            <TranslatedText text="My Tickets" />
                          </span>
                        </Link>
                      </div>
                    )}
                  </div>
                </nav>
              </div>

            </div>

            {/* Auth Footer */}
            <div className="p-8 space-y-4">
              {!isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <Link href="/auth/signup" onClick={toggleMenu} className="block">
                    <Button className="w-full h-15 bg-(--primary) hover:bg-(--primary)/90 text-white text-xs font-bold uppercase tracking-[0.25em] rounded-full transition-all border-none shadow-none" size="lg">
                      <TranslatedText text="Join Collective" />
                    </Button>
                  </Link>
                  <Link href="/auth/signin" onClick={toggleMenu} className="block text-center">
                    <span className="inline-block py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-(--primary)/60 hover:text-(--primary)">
                      <TranslatedText text="Sign In to Account" />
                    </span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href={
                      user?.role === 'admin' ? '/admin/dashboard' :
                        user?.role === 'service_provider' ? '/provider/dashboard' :
                          '/customer/dashboard'
                    }
                    onClick={toggleMenu}
                    className="block"
                  >
                    <Button className="w-full h-15 bg-(--primary) text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full shadow-none" size="lg">
                      <LayoutDashboard className="h-4 w-4 mr-3 text-white/40" />
                      <TranslatedText text="Dashboard" />
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      logout();
                      toggleMenu();
                    }}
                    variant="ghost"
                    className="w-full h-15 text-red-600 hover:bg-red-50 hover:text-red-700 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full transition-all"
                    size="lg"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    <TranslatedText text="Logout" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

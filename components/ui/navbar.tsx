"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import Image from "next/image";
import { MenuIcon, XIcon, Home, Briefcase, Info, Calendar, LogOut, LayoutDashboard, ChevronDown, Ticket } from "lucide-react";
import { Button } from "./button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { TranslatedText } from "@/components/translated-text";
import { useAuth } from "@/hooks/useAuth";
import { AISearch } from "@/components/ui/ai-search";
import { useMobileMenu } from "@/contexts/mobile-menu-context";

export function Navbar() {
  const isMobile = useIsMobile();
  const { isMenuOpen, toggleMenu } = useMobileMenu();
  const { user, isAuthenticated, logout } = useAuth();
  const [eventsDropdownOpen, setEventsDropdownOpen] = React.useState(false);
  const [mobileEventsOpen, setMobileEventsOpen] = React.useState(false);
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
      <header className="w-full bg-white/70 backdrop-blur-xl z-50 top-0 fixed border-b border-slate-100/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center group flex-shrink-0 py-1">
            <div className="relative flex flex-shrink-0 items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="VowNest Collective Logo" 
                width={200} 
                height={70}
                className="object-contain h-12 sm:h-16 w-auto drop-shadow-sm group-hover:scale-[1.05] origin-left transition-transform duration-500"
                priority
              />
            </div>
          </Link>

          <AISearch className="relative flex-1 max-w-sm sm:max-w-md mx-3 sm:mx-6 lg:mx-12" />

          {/* Desktop Navigation */}
          {isMobile === false && (
            <div className="hidden md:flex items-center space-x-10">
              <nav className="flex space-x-8 items-center">
                <a href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-slate-900 transition-all relative group py-2">
                  <TranslatedText text="Home" />
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#668c65] group-hover:w-full transition-all duration-500" />
                </a>
                <a href="/services" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-slate-900 transition-all relative group py-2">
                  <TranslatedText text="Services" />
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#668c65] group-hover:w-full transition-all duration-500" />
                </a>
                
                {/* Events Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setEventsDropdownOpen(!eventsDropdownOpen)}
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-slate-900 transition-all relative group py-2 flex items-center space-x-1"
                  >
                    <TranslatedText text="Events" />
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${eventsDropdownOpen ? 'rotate-180' : ''}`} />
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#668c65] group-hover:w-full transition-all duration-500" />
                  </button>
                  
                  {eventsDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                      <Link
                        href="/events"
                        className="flex items-center px-4 py-3 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                        onClick={() => setEventsDropdownOpen(false)}
                      >
                        <Calendar className="h-4 w-4 mr-3 text-slate-400" />
                        <TranslatedText text="Browse Events" />
                      </Link>
                      <Link
                        href="/my-tickets"
                        className="flex items-center px-4 py-3 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                        onClick={() => setEventsDropdownOpen(false)}
                      >
                        <Ticket className="h-4 w-4 mr-3 text-slate-400" />
                        <TranslatedText text="My Tickets" />
                      </Link>
                    </div>
                  )}
                </div>
                
                <a href="/about" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-slate-900 transition-all relative group py-2">
                  <TranslatedText text="About" />
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#668c65] group-hover:w-full transition-all duration-500" />
                </a>
              </nav>

              <div className="h-6 w-[1px] bg-slate-100 mx-2" />

              <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                {!isAuthenticated ? (
                  <>
                    <Link href="/auth/signin">
                      <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 hover:bg-slate-50 px-6 h-11 rounded-xl transition-all">
                        <TranslatedText text="Sign In" />
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="sm" className="hover:bg-slate-900 text-white shadow-xl px-8 h-11 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500">
                        <TranslatedText text="Get Started" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href={
                      user?.role === 'admin' ? '/admin/dashboard' :
                        user?.role === 'service_provider' ? '/provider/dashboard' :
                          '/customer/dashboard'
                    }>
                      <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 hover:bg-slate-50 h-11 rounded-xl px-6">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        <TranslatedText text="Dashboard" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => logout()}
                      className="border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 h-11 rounded-xl px-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <TranslatedText text="Logout" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile === true && (
            <button
              onClick={toggleMenu}
              className="text-slate-900 focus:outline-none flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-xl sm:rounded-2xl transition-all duration-500 group"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <XIcon className="h-4 w-4 sm:h-5 sm:w-5" /> : <MenuIcon className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />}
            </button>
          )}
        </div>
      </header>
      {/* Mobile Menu Drawer */}
      {isMobile === true && isMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500"
            onClick={toggleMenu}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-[#fdfcfb] shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] overflow-y-auto animate-in slide-in-from-right duration-700 ease-out flex flex-col">
            <div className="p-8 space-y-10 flex-1">
              {/* Brand Header */}
              <div className="flex items-center justify-between pb-8 border-b border-slate-50">
                <div className="flex items-center py-2">
                  <div className="flex items-center justify-center">
                    <Image 
                      src="/logo.png" 
                      alt="VowNest Collective Logo" 
                      width={200} 
                      height={70}
                      className="object-contain h-12 sm:h-14 w-auto drop-shadow-sm origin-left"
                    />
                  </div>
                </div>
                <button
                  onClick={toggleMenu}
                  className="h-10 w-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-slate-500"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Navigation Narrative */}
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 px-6">Explore Portals</p>
                <nav className="space-y-1">
                  {[
                    { href: "/", label: "Home", icon: Home },
                    { href: "/services", label: "Services", icon: Briefcase },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={toggleMenu}
                      className="flex items-center justify-between px-6 py-5 rounded-2xl hover:bg-slate-50 transition-all group"
                    >
                      <div className="flex items-center space-x-4">
                        <item.icon className="h-4 w-4 text-slate-400 group-hover:text-[#668c65] transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 group-hover:text-slate-900">
                          <TranslatedText text={item.label} />
                        </span>
                      </div>
                      <div className="h-1 w-1 rounded-full bg-slate-200 group-hover:bg-[#668c65] transition-colors" />
                    </a>
                  ))}
                  
                  {/* Events Dropdown for Mobile */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setMobileEventsOpen(!mobileEventsOpen)}
                      className="w-full flex items-center justify-between px-6 py-5 rounded-2xl hover:bg-slate-50 transition-all group text-left"
                    >
                      <div className="flex items-center space-x-4">
                        <Calendar className="h-4 w-4 text-slate-400 group-hover:text-[#668c65] transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 group-hover:text-slate-900">
                          <TranslatedText text="Events" />
                        </span>
                      </div>
                      <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-300 ${mobileEventsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        mobileEventsOpen ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-10 space-y-1 border-l-2 border-[#668c65]/10 pl-4 py-2">
                        <Link
                          href="/events"
                          onClick={toggleMenu}
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-all group"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-[#668c65] transition-colors" />
                          <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 group-hover:text-slate-900">
                            <TranslatedText text="Browse Events" />
                          </span>
                        </Link>
                        <Link
                          href="/my-tickets"
                          onClick={toggleMenu}
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-all group"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-[#668c65] transition-colors" />
                          <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 group-hover:text-slate-900">
                            <TranslatedText text="My Tickets" />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <a
                    href="/about"
                    onClick={toggleMenu}
                    className="flex items-center justify-between px-6 py-5 rounded-2xl hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <Info className="h-4 w-4 text-slate-400 group-hover:text-[#668c65] transition-colors" />
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 group-hover:text-slate-900">
                        <TranslatedText text="About" />
                      </span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-slate-200 group-hover:bg-[#668c65] transition-colors" />
                  </a>
                </nav>
              </div>

              {/* Preferences */}
              <div className="space-y-4 pt-6 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] px-4">Preferences</p>
                <div className="px-4">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>

            {/* Auth Footer */}
            <div className="p-8 bg-slate-50/50 space-y-4">
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/auth/signin" onClick={toggleMenu} className="block">
                    <Button variant="outline" className="w-full h-14 border-slate-200 text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-white transition-all shadow-sm" size="lg">
                      <TranslatedText text="Sign In" />
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={toggleMenu} className="block">
                    <Button className="w-full h-14 hover:bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl" size="lg">
                      <TranslatedText text="Join" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link
                    href={
                      user?.role === 'admin' ? '/admin/dashboard' :
                        user?.role === 'service_provider' ? '/provider/dashboard' :
                          '/customer/dashboard'
                    }
                    onClick={toggleMenu}
                    className="block"
                  >
                    <Button variant="outline" className="w-full h-14 border-slate-200 text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-white transition-all" size="lg">
                      <LayoutDashboard className="h-4 w-4 mr-3 text-[#668c65]" />
                      <TranslatedText text="Dashboard" />
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      logout();
                      toggleMenu();
                    }}
                    variant="ghost"
                    className="w-full h-14 text-red-600 hover:bg-red-50 hover:text-red-700 text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl transition-all"
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



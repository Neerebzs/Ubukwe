"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MenuIcon, XIcon, Home, Briefcase, Info, LogIn, UserPlus, Calendar, Search, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "./button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { TranslatedText } from "@/components/translated-text";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <header className="w-full bg-white/70 backdrop-blur-xl z-50 top-0 fixed border-b border-slate-100/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-11 w-11 rounded-full bg-[#668c65] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
              <span className="text-white font-serif italic text-xl">U</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif italic tracking-tight text-[#668c65] leading-none">Ubukwe</span>
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-1">Rwanda Collective</span>
            </div>
          </Link>

          <div className="relative flex-1 max-w-md mx-12 hidden lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#668c65] transition-colors" />
            <input
              type="text"
              placeholder="Discover artisans & services..."
              className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-transparent rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:bg-white focus:border-[#668c65]/20 focus:ring-4 focus:ring-[#668c65]/5 transition-all duration-500"
            />
          </div>

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
                <a href="/events" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-slate-900 transition-all relative group py-2">
                  <TranslatedText text="Events" />
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#668c65] group-hover:w-full transition-all duration-500" />
                </a>
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
                      <Button size="sm" className="bg-[#668c65] hover:bg-slate-900 text-white shadow-xl px-8 h-11 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500">
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
              className="text-slate-900 focus:outline-none h-12 w-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all duration-500 group"
              aria-label="Toggle menu"
            >
              {menuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />}
            </button>
          )}
        </div>
      </header>
      {/* Mobile Menu Drawer */}
      {isMobile === true && menuOpen && (
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
                <div className="flex flex-col">
                  <span className="font-serif italic text-3xl text-[#668c65]">Ubukwe</span>
                  <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-400 mt-1">Rwanda Collective</span>
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
                    { href: "/events", label: "Events", icon: Calendar },
                    { href: "/about", label: "About", icon: Info },
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
                </nav>
              </div>

              {/* Mobile Search */}
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#668c65] transition-colors" />
                <input
                  type="text"
                  placeholder="Artisans, Venues, Magic..."
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:bg-white focus:border-[#668c65]/10 transition-all"
                />
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
                    <Button className="w-full h-14 bg-[#668c65] hover:bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl" size="lg">
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



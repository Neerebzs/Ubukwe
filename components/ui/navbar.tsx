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
      <header className="w-full bg-white backdrop-blur-sm z-50 top-0 fixed">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-gray-900">VowNest</span>
            <Badge className="text-xs hidden sm:inline-flex bg-primary/10 text-primary border-primary/20">
              Rwanda
            </Badge>
          </Link>
          <div className="relative flex-1 max-w-sm mx-8 hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Desktop Navigation */}
          {isMobile === false && (
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-6 items-center">
                <a href="/" className="text-gray-900 hover:text-primary transition-colors font-medium">
                  <TranslatedText text="Home" />
                </a>
                <a href="/services" className="text-gray-900 hover:text-primary transition-colors font-medium">
                  <TranslatedText text="Services" />
                </a>
                <a href="/events" className="text-gray-900 hover:text-primary transition-colors font-medium">
                  <TranslatedText text="Events" />
                </a>
                <a href="/about" className="text-gray-900 hover:text-primary transition-colors font-medium">
                  <TranslatedText text="About" />
                </a>
              </nav>
              <div className="flex items-center space-x-3 ml-4">
                <LanguageSwitcher />
                {!isAuthenticated ? (
                  <>
                    <Link href="/auth/signin">
                      <Button variant="ghost" size="sm" className="text-gray-900 hover:text-primary hover:bg-primary/5">
                        <TranslatedText text="Sign In" />
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-lg"><TranslatedText text="Get Started" /></Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href={
                      user?.role === 'admin' ? '/admin/dashboard' :
                        user?.role === 'service_provider' ? '/provider/dashboard' :
                          '/customer/dashboard'
                    }>
                      <Button variant="ghost" size="sm" className="text-gray-900 hover:text-primary hover:bg-primary/5">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        <TranslatedText text="Dashboard" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => logout()}
                      className="border-primary/20 text-primary hover:bg-primary/5"
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
              className="text-teal-600 focus:outline-none p-2 hover:bg-teal-50 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobile === true && menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={toggleMenu}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-72 bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-primary/20">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full">
                    <img src="/logo.png" alt="Ubukwe" className="h-full w-full object-cover rounded-full" />
                  </div>
                  <span className="font-bold text-lg text-primary">Ubukwe</span>
                </div>
                <button
                  onClick={toggleMenu}
                  className="p-2 hover:bg-primary/5 rounded-md transition-colors text-primary"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                <a
                  href="/"
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary/5 transition-colors text-gray-700 hover:text-primary"
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium"><TranslatedText text="Home" /></span>
                </a>
                <a
                  href="/services"
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-teal-50 transition-colors text-gray-700 hover:text-teal-600"
                >
                  <Briefcase className="h-5 w-5" />
                  <span className="font-medium"><TranslatedText text="Services" /></span>
                </a>
                <a
                  href="/events"
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-teal-50 transition-colors text-gray-700 hover:text-teal-600"
                >
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium"><TranslatedText text="Events" /></span>
                </a>
                <a
                  href="/about"
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-teal-50 transition-colors text-gray-700 hover:text-teal-600"
                >
                  <Info className="h-5 w-5" />
                  <span className="font-medium"><TranslatedText text="About" /></span>
                </a>
              </nav>

              {/* Mobile Search */}
              <div className="relative pt-4 px-2">
                <Search className="absolute left-5 top-[calc(1rem+1.35rem)] -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-primary/10 rounded-xl text-sm focus:outline-none"
                />
              </div>

              {/* Language Switcher */}
              <div className="pt-4 border-t border-primary/20">
                <div className="px-4 py-2">
                  <p className="text-xs text-primary mb-2 uppercase tracking-wider font-semibold">Language</p>
                  <LanguageSwitcher />
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="space-y-3 pt-4 border-t border-teal-200">
                {!isAuthenticated ? (
                  <>
                    <Link href="/auth/signin" onClick={toggleMenu} className="block">
                      <Button variant="outline" className="w-full justify-start border-primary/20 text-gray-700 hover:bg-primary/5 hover:text-primary hover:border-primary/40" size="lg">
                        <LogIn className="h-5 w-5 mr-3" />
                        <TranslatedText text="Sign In" />
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={toggleMenu} className="block">
                      <Button className="w-full justify-start bg-primary hover:bg-primary/90 text-white" size="lg">
                        <UserPlus className="h-5 w-5 mr-3" />
                        <TranslatedText text="Get Started" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={
                        user?.role === 'admin' ? '/admin/dashboard' :
                          user?.role === 'service_provider' ? '/provider/dashboard' :
                            '/customer/dashboard'
                      }
                      onClick={toggleMenu}
                      className="block"
                    >
                      <Button variant="outline" className="w-full justify-start border-primary/20 text-gray-700 hover:bg-primary/5 hover:text-primary hover:border-primary/40" size="lg">
                        <LayoutDashboard className="h-5 w-5 mr-3" />
                        <TranslatedText text="Dashboard" />
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        logout();
                        toggleMenu();
                      }}
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                      size="lg"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      <TranslatedText text="Logout" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



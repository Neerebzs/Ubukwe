"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MenuIcon, XIcon, Home, Briefcase, Info, LogIn, UserPlus } from "lucide-react";
import { Button } from "./button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { TranslatedText } from "@/components/translated-text";

export function Navbar() {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <header className="w-full bg-transparent backdrop-blur-sm z-50 top-0 fixed">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-rose-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-gray-900">VowNest</span>
            <Badge className="text-xs hidden sm:inline-flex bg-rose-100 text-rose-600 border-rose-200">
              Rwanda
            </Badge>
          </Link>

          {/* Desktop Navigation */}
          {isMobile === false && (
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-6 items-center">
                <a href="/" className="text-gray-900 hover:text-rose-600 transition-colors font-medium">
                  <TranslatedText text="Home" />
                </a>
                <a href="/services" className="text-gray-900 hover:text-rose-600 transition-colors font-medium">
                  <TranslatedText text="Services" />
                </a>
                <a href="/about" className="text-gray-900 hover:text-rose-600 transition-colors font-medium">
                  <TranslatedText text="About" />
                </a>
              </nav>
              <div className="flex items-center space-x-3 ml-4">
                <LanguageSwitcher />
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="text-gray-900 hover:text-rose-600 hover:bg-rose-50">
                    <TranslatedText text="Sign In" />
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white shadow-lg"><TranslatedText text="Get Started" /></Button>
                </Link>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile === true && (
            <button 
              onClick={toggleMenu} 
              className="text-rose-600 focus:outline-none p-2 hover:bg-rose-50 rounded-md transition-colors"
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
              <div className="flex items-center justify-between pb-4 border-b border-rose-200">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full">
                    <img src="/logo.png" alt="Ubukwe" className="h-full w-full object-cover rounded-full" />
                  </div>
                  <span className="font-bold text-lg text-rose-600">Ubukwe</span>
                </div>
                <button 
                  onClick={toggleMenu}
                  className="p-2 hover:bg-rose-50 rounded-md transition-colors text-rose-600"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                <a 
                  href="/" 
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-rose-50 transition-colors text-gray-700 hover:text-rose-600"
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium"><TranslatedText text="Home" /></span>
                </a>
                <a 
                  href="/services" 
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-rose-50 transition-colors text-gray-700 hover:text-rose-600"
                >
                  <Briefcase className="h-5 w-5" />
                  <span className="font-medium"><TranslatedText text="Services" /></span>
                </a>
                <a 
                  href="/about" 
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-rose-50 transition-colors text-gray-700 hover:text-rose-600"
                >
                  <Info className="h-5 w-5" />
                  <span className="font-medium"><TranslatedText text="About" /></span>
                </a>
              </nav>

              {/* Language Switcher */}
              <div className="pt-4 border-t border-rose-200">
                <div className="px-4 py-2">
                  <p className="text-xs text-rose-600 mb-2 uppercase tracking-wider font-semibold">Language</p>
                  <LanguageSwitcher />
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="space-y-3 pt-4 border-t border-rose-200">
                <Link href="/auth/signin" onClick={toggleMenu} className="block">
                  <Button variant="outline" className="w-full justify-start border-rose-200 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-400" size="lg">
                    <LogIn className="h-5 w-5 mr-3" />
                    <TranslatedText text="Sign In" />
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={toggleMenu} className="block">
                  <Button className="w-full justify-start bg-rose-500 hover:bg-rose-600 text-white" size="lg">
                    <UserPlus className="h-5 w-5 mr-3" />
                    <TranslatedText text="Get Started" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


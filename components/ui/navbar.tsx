"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  MenuIcon, XIcon, Home, Briefcase, Info, Calendar,
  LogOut, LayoutDashboard, ChevronDown, Ticket, Search,
} from "lucide-react";
import { TranslatedText } from "@/components/translated-text";
import { useAuth } from "@/hooks/useAuth";
import { AISearch } from "@/components/ui/ai-search";
import { useMobileMenu } from "@/contexts/mobile-menu-context";
import { useSystemSettings } from "@/contexts/system-settings-context";

// ─── constants ────────────────────────────────────────────────────────────────
const BRAND_GREEN = "#668c65";
const BRAND_DARK  = "#1a2e1a";

function getDashboard(role?: string) {
  if (role === "admin")            return "/admin/dashboard";
  if (role === "service_provider") return "/provider/dashboard";
  return "/customer/dashboard";
}

const NAV = [
  { href: "/",        label: "Home"     },
  { href: "/services",label: "Services" },
  { href: "/about",   label: "About"    },
];

// ─── component ────────────────────────────────────────────────────────────────
export function Navbar() {
  const isMobile    = useIsMobile();
  const pathname    = usePathname();
  const { isMenuOpen, toggleMenu } = useMobileMenu();
  const { user, isAuthenticated, logout, isLoading: isAuthLoading } = useAuth();
  const { settings } = useSystemSettings();

  const [scrolled,       setScrolled]       = React.useState(false);
  const [eventsOpen,     setEventsOpen]     = React.useState(false);
  const [userMenuOpen,   setUserMenuOpen]   = React.useState(false);
  const [mobileEventsOpen, setMobileEventsOpen] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

  const eventsRef  = React.useRef<HTMLDivElement>(null);
  const userRef    = React.useRef<HTMLDivElement>(null);

  // subtle shadow on scroll
  React.useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // close dropdowns on outside click
  React.useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!eventsRef.current?.contains(e.target as Node)) setEventsOpen(false);
      if (!userRef.current?.contains(e.target as Node))   setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // ── Avatar initials / image ───────────────────────────────────────────────
  const avatarSrc = user?.profile_image_url || user?.avatar;
  const initials  = (user?.full_name || user?.email || "U")[0].toUpperCase();
  const roleLabel =
    user?.role === "service_provider" ? "Artisan" :
    user?.role === "admin"            ? "Admin"   : "Customer";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ══════════════════════════ DESKTOP HEADER ══════════════════════════ */}
      <header
        className={`
          w-full fixed top-0 z-50 transition-all duration-200
          bg-white
          ${scrolled
            ? "shadow-[0_2px_24px_rgba(0,0,0,0.07)] border-b border-slate-100"
            : "border-b border-slate-100"}
        `}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-10 h-[68px] flex items-center gap-4 lg:gap-6">

          {/* ── Brand — desktop only ───────────────────────────────────────── */}
          <Link href="/" className="hidden md:flex items-center gap-2.5 flex-shrink-0 group mr-2">
            {settings.logoUrl && (
              <Image
                src={settings.logoUrl}
                alt="VowNest"
                width={36} height={36}
                className="object-contain h-9 w-auto"
                priority
              />
            )}
            <span
              className="font-serif italic text-[22px] font-bold tracking-tight"
              style={{ color: BRAND_GREEN }}
            >
              VowNest
            </span>
          </Link>

          {/* ── Search bar — desktop only ───────────────────────────────────── */}
          <div className="flex-1 min-w-0 max-w-[600px] hidden md:block">
            <AISearch />
          </div>

          {/* ── Mobile top bar: full-width search pill like Airbnb ──────────── */}
          <div className="flex md:hidden items-center gap-3 w-full">
            {/* Full-width search pill — tapping opens search overlay */}
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="flex-1 flex items-center gap-3 h-12 px-5 rounded-full border border-slate-200 bg-white shadow-sm active:scale-[0.98] transition-all"
            >
              <Search className="h-4 w-4 text-slate-500 flex-shrink-0" />
              <span className="text-[14px] text-slate-500 font-medium">Start your search</span>
            </button>

            {/* Menu icon — slim circle */}
            <button
              onClick={toggleMenu}
              className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all active:scale-95"
            >
              {isMenuOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
            </button>
          </div>
          <div className="hidden md:flex items-center gap-1 ml-auto flex-shrink-0">

            {/* Nav links */}
            <nav className="flex items-center">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`
                    relative px-3.5 py-2 text-[13.5px] font-semibold tracking-wide rounded-lg transition-colors
                    ${active(href)
                      ? "text-[#668c65]"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}
                  `}
                >
                  <TranslatedText text={label} />
                  {active(href) && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ background: BRAND_GREEN }}
                    />
                  )}
                </Link>
              ))}

              {/* Events dropdown */}
              <div className="relative" ref={eventsRef}>
                <button
                  onClick={() => setEventsOpen(v => !v)}
                  className={`
                    flex items-center gap-1 px-3.5 py-2 text-[13.5px] font-semibold tracking-wide rounded-lg transition-colors
                    ${eventsOpen ? "text-[#668c65] bg-[#668c65]/6" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}
                  `}
                >
                  <TranslatedText text="Events" />
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${eventsOpen ? "rotate-180" : ""}`} />
                </button>

                {eventsOpen && (
                  <div className="absolute top-[calc(100%+6px)] left-0 w-52 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-black/8 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {[
                      { href: "/events",     icon: Calendar, label: "Browse Events" },
                      { href: "/my-tickets", icon: Ticket,   label: "My Tickets"    },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setEventsOpen(false)}
                        className="flex items-center gap-3 mx-1.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group"
                      >
                        <div className="h-7 w-7 rounded-lg bg-slate-100 group-hover:bg-[#668c65]/12 flex items-center justify-center transition-colors flex-shrink-0">
                          <Icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#668c65] transition-colors" />
                        </div>
                        <TranslatedText text={label} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Divider */}
            <div className="h-5 w-px bg-slate-200 mx-3" />

            {/* Auth */}
            {isAuthLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-14 h-3.5 bg-slate-100 animate-pulse rounded-full" />
                <div className="w-28 h-9 bg-slate-100 animate-pulse rounded-full" />
              </div>
            ) : !isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-[13px] font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <TranslatedText text="Sign In" />
                </Link>
                <Link href="/auth/signup">
                  <button
                    className="h-9 px-5 rounded-full text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-all active:scale-95 shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${BRAND_GREEN}, #4a6b49)`, boxShadow: `0 2px 12px ${BRAND_GREEN}40` }}
                  >
                    <TranslatedText text="Get Started" />
                  </button>
                </Link>
              </div>
            ) : (
              /* Avatar button → dropdown */
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2.5 h-9 pl-1 pr-3 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all"
                >
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 text-white text-[11px] font-bold"
                    style={{ background: avatarSrc ? "transparent" : `linear-gradient(135deg, ${BRAND_GREEN}, #4a6b49)` }}
                  >
                    {avatarSrc
                      ? <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                      : initials
                    }
                  </div>
                  <span className="text-[13px] font-semibold text-slate-700 max-w-[90px] truncate hidden lg:block">
                    {user?.full_name?.split(" ")[0] || "Account"}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-[calc(100%+6px)] right-0 w-60 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-black/8 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Profile card */}
                    <div className="px-4 py-3 mb-1">
                      <p className="text-[13px] font-bold text-slate-800 truncate">{user?.full_name || "—"}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                      <span
                        className="inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white"
                        style={{ background: BRAND_GREEN }}
                      >
                        {roleLabel}
                      </span>
                    </div>
                    <div className="h-px bg-slate-100 mx-3 mb-1" />
                    <Link
                      href={getDashboard(user?.role)}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 mx-1.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors group"
                    >
                      <LayoutDashboard className="h-4 w-4 text-slate-400 group-hover:text-[#668c65] transition-colors" />
                      <TranslatedText text="Dashboard" />
                    </Link>
                    <div className="h-px bg-slate-100 mx-3 my-1" />
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-[calc(100%-12px)] mx-1.5 flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <TranslatedText text="Sign Out" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Mobile: search + hamburger ─────────────────────────────────── */}
          <div className="flex md:hidden items-center gap-1 ml-auto">
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-all active:scale-95"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={toggleMenu}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-700 transition-all active:scale-95"
            >
              {isMenuOpen ? <XIcon className="h-[18px] w-[18px]" /> : <MenuIcon className="h-[18px] w-[18px]" />}
            </button>
          </div>

        </div>
      </header>

      {/* ══════════════════════ MOBILE SEARCH OVERLAY ══════════════════════ */}
      {isMobile && mobileSearchOpen && (
        <div className="fixed inset-0 z-[110]">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileSearchOpen(false)}
          />
          <div className="relative z-10 bg-white px-4 pt-3 pb-3 border-b border-slate-100 shadow-md">
            <AISearch open={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} />
          </div>
        </div>
      )}

      {/* ════════════════════════ MOBILE DRAWER ════════════════════════════ */}
      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={toggleMenu}
          />

          <div className="fixed right-0 top-0 h-full w-[80%] max-w-[340px] bg-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 ease-out">

            {/* Drawer top */}
            <div className="flex items-center justify-between px-6 h-[70px] border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                {settings.logoUrl && (
                  <Image
                    src={settings.logoUrl}
                    alt="VowNest"
                    width={32} height={32}
                    className="object-contain h-8 w-auto"
                  />
                )}
                <span className="font-serif italic text-[20px] font-bold" style={{ color: BRAND_GREEN }}>VowNest</span>
              </div>
              <button
                onClick={toggleMenu}
                className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Logged-in user card */}
            {isAuthenticated && user && (
              <div className="mx-4 mt-4 p-4 rounded-2xl flex items-center gap-3 border border-slate-100 bg-slate-50">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 text-white text-[13px] font-bold"
                  style={{ background: avatarSrc ? "transparent" : `linear-gradient(135deg, ${BRAND_GREEN}, #4a6b49)` }}
                >
                  {avatarSrc
                    ? <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                    : initials
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-slate-800 truncate">{user.full_name || "—"}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
              {NAV.map(({ href, label }) => {
                const icons: Record<string, React.ElementType> = { "/": Home, "/services": Briefcase, "/about": Info };
                const Icon = icons[href] || Home;
                const isAct = active(href);
                return (
                  <a
                    key={href}
                    href={href}
                    onClick={toggleMenu}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all
                      ${isAct ? "bg-[#668c65]/8 text-[#668c65]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                  >
                    <Icon className={`h-[17px] w-[17px] flex-shrink-0 ${isAct ? "text-[#668c65]" : "text-slate-400"}`} />
                    <span className="text-[15px] font-semibold"><TranslatedText text={label} /></span>
                    {isAct && <div className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: BRAND_GREEN }} />}
                  </a>
                );
              })}

              {/* Events accordion */}
              <button
                onClick={() => setMobileEventsOpen(v => !v)}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all"
              >
                <Calendar className="h-[17px] w-[17px] text-slate-400 flex-shrink-0" />
                <span className="text-[15px] font-semibold flex-1 text-left"><TranslatedText text="Events" /></span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${mobileEventsOpen ? "rotate-180" : ""}`} />
              </button>

              {mobileEventsOpen && (
                <div className="ml-10 pl-4 border-l-2 border-slate-100 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                  {[{ href: "/events", label: "Browse Events" }, { href: "/my-tickets", label: "My Tickets" }].map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={toggleMenu}
                      className="block px-3 py-3 text-[14px] font-medium text-slate-500 hover:text-[#668c65] rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <TranslatedText text={item.label} />
                    </Link>
                  ))}
                </div>
              )}
            </nav>

            {/* Auth footer */}
            <div className="px-4 pt-4 pb-8 border-t border-slate-100 space-y-2.5 flex-shrink-0">
              {!isAuthenticated ? (
                <>
                  <Link href="/auth/signup" onClick={toggleMenu} className="block">
                    <button
                      className="w-full h-12 rounded-2xl text-white text-[12px] font-bold uppercase tracking-[0.12em] transition-all active:scale-[0.98]"
                      style={{ background: `linear-gradient(135deg, ${BRAND_GREEN}, #4a6b49)` }}
                    >
                      <TranslatedText text="Get Started" />
                    </button>
                  </Link>
                  <Link href="/auth/signin" onClick={toggleMenu} className="block text-center">
                    <span className="text-[12px] font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                      <TranslatedText text="Sign In" />
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href={getDashboard(user?.role)} onClick={toggleMenu} className="block">
                    <button
                      className="w-full h-12 rounded-2xl text-white text-[12px] font-bold uppercase tracking-[0.12em] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      style={{ background: `linear-gradient(135deg, ${BRAND_GREEN}, #4a6b49)` }}
                    >
                      <LayoutDashboard className="h-4 w-4 text-white/60" />
                      <TranslatedText text="Go to Dashboard" />
                    </button>
                  </Link>
                  <button
                    onClick={() => { logout(); toggleMenu(); }}
                    className="w-full h-12 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 text-[12px] font-bold uppercase tracking-[0.12em] transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <TranslatedText text="Sign Out" />
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

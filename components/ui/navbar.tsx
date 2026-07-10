"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  MenuIcon, XIcon, Home, Briefcase, Info, Calendar,
  LogOut, LayoutDashboard, ChevronDown, Ticket, Search,
  User, Settings, Bell,
} from "lucide-react";
import { Button } from "./button";
import { TranslatedText } from "@/components/translated-text";
import { useAuth } from "@/hooks/useAuth";
import { AISearch } from "@/components/ui/ai-search";
import { useMobileMenu } from "@/contexts/mobile-menu-context";
import { useSystemSettings } from "@/contexts/system-settings-context";

// ── helper ─────────────────────────────────────────────────────────────────
function getDashboard(role?: string) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "service_provider") return "/provider/dashboard";
  return "/customer/dashboard";
}

// ── nav items ──────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { isMenuOpen, toggleMenu } = useMobileMenu();
  const { user, isAuthenticated, logout, isLoading: isAuthLoading } = useAuth();
  const { settings } = useSystemSettings();

  const [scrolled, setScrolled] = React.useState(false);
  const [eventsOpen, setEventsOpen] = React.useState(false);
  const [mobileEventsOpen, setMobileEventsOpen] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const eventsRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // scroll shadow
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close dropdowns on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!eventsRef.current?.contains(e.target as Node)) setEventsOpen(false);
      if (!userMenuRef.current?.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── Main header ──────────────────────────────────────────────────── */}
      <header
        className={`w-full fixed top-0 z-50 transition-all duration-300
          ${scrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_1px_20px_rgba(0,0,0,0.06)] border-b border-slate-100"
            : "bg-white border-b border-slate-100/60"
          }`}
      >
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 h-[68px] flex items-center gap-6">

          {/* ── Brand ──────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0 group"
          >
            {settings.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt="Vownest"
                width={110}
                height={36}
                className="object-contain h-8 w-auto"
                priority
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#668c65] flex items-center justify-center shadow-sm">
                  <span className="font-serif italic text-white text-lg font-bold">V</span>
                </div>
                <span className="font-serif italic text-[22px] font-bold tracking-tight text-[#2d3f2d] group-hover:text-[#668c65] transition-colors">
                  VowNest
                </span>
              </div>
            )}
          </Link>

          {/* ── Search — grows to fill available space ──────────────────── */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <AISearch />
          </div>

          {/* ── Spacer pushes nav + auth to the right ───────────────────── */}
          <div className="flex-1 md:hidden" />

          {/* ── Desktop nav + auth ───────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">

            {/* Nav links */}
            <nav className="flex items-center mr-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-[13.5px] font-semibold tracking-wide transition-colors rounded-lg
                    ${isActive(link.href)
                      ? "text-[#668c65]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  <TranslatedText text={link.label} />
                  {isActive(link.href) && (
                    <span className="absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full bg-[#668c65]" />
                  )}
                </Link>
              ))}

              {/* Events dropdown */}
              <div className="relative" ref={eventsRef}>
                <button
                  onClick={() => setEventsOpen((v) => !v)}
                  className={`flex items-center gap-1 px-4 py-2 text-[13.5px] font-semibold tracking-wide rounded-lg transition-colors
                    ${eventsOpen ? "text-[#668c65] bg-[#668c65]/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
                >
                  <TranslatedText text="Events" />
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${eventsOpen ? "rotate-180 text-[#668c65]" : ""}`}
                  />
                </button>

                {eventsOpen && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-52 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link
                      href="/events"
                      onClick={() => setEventsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#668c65] transition-colors mx-1 rounded-xl group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-slate-100 group-hover:bg-[#668c65]/10 flex items-center justify-center transition-colors">
                        <Calendar className="h-4 w-4 text-slate-400 group-hover:text-[#668c65] transition-colors" />
                      </div>
                      <TranslatedText text="Browse Events" />
                    </Link>
                    <Link
                      href="/my-tickets"
                      onClick={() => setEventsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#668c65] transition-colors mx-1 rounded-xl group"
                    >
                      <div className="h-8 w-8 rounded-lg bg-slate-100 group-hover:bg-[#668c65]/10 flex items-center justify-center transition-colors">
                        <Ticket className="h-4 w-4 text-slate-400 group-hover:text-[#668c65] transition-colors" />
                      </div>
                      <TranslatedText text="My Tickets" />
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 mx-2" />

            {/* Auth */}
            {isAuthLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-14 h-4 bg-slate-100 animate-pulse rounded-full" />
                <div className="w-28 h-9 bg-slate-100 animate-pulse rounded-full" />
              </div>
            ) : !isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/signin"
                  className="text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
                >
                  <TranslatedText text="Sign In" />
                </Link>
                <Link href="/auth/signup">
                  <button className="h-9 px-5 rounded-full bg-[#668c65] hover:bg-[#527052] text-white text-[12px] font-bold uppercase tracking-[0.12em] transition-all shadow-sm shadow-[#668c65]/20 active:scale-95">
                    <TranslatedText text="Get Started" />
                  </button>
                </Link>
              </div>
            ) : (
              /* Authenticated: avatar dropdown */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2.5 h-9 px-3 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all group"
                >
                  {/* Avatar */}
                  <div className="h-6 w-6 rounded-full bg-[#668c65]/15 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user?.profile_image_url || user?.avatar ? (
                      <img
                        src={user.profile_image_url || user.avatar}
                        alt={user?.full_name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-[#668c65]">
                        {(user?.full_name || user?.email || "U")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-[13px] font-semibold text-slate-700 max-w-[100px] truncate hidden lg:block">
                    {user?.full_name?.split(" ")[0] || "Account"}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-[calc(100%+8px)] right-0 w-60 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-100 mb-1">
                      <p className="text-[13px] font-bold text-slate-800 truncate">{user?.full_name || "—"}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                      <span className="inline-flex mt-1.5 items-center gap-1 px-2 py-0.5 rounded-full bg-[#668c65]/10 text-[10px] font-bold text-[#668c65] uppercase tracking-wider">
                        {user?.role === "service_provider" ? "Artisan" :
                          user?.role === "admin" ? "Admin" : "Customer"}
                      </span>
                    </div>

                    <Link
                      href={getDashboard(user?.role)}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#668c65] transition-colors mx-1 rounded-xl group"
                    >
                      <LayoutDashboard className="h-4 w-4 text-slate-400 group-hover:text-[#668c65] transition-colors" />
                      <TranslatedText text="Dashboard" />
                    </Link>

                    <div className="h-px bg-slate-100 mx-3 my-1" />

                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors mx-1 rounded-xl group text-left"
                      style={{ width: "calc(100% - 8px)" }}
                    >
                      <LogOut className="h-4 w-4" />
                      <TranslatedText text="Sign Out" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Mobile controls ──────────────────────────────────────────── */}
          <div className="flex md:hidden items-center gap-1.5 ml-auto">
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-all active:scale-95"
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={toggleMenu}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-700 transition-all active:scale-95"
              aria-label="Menu"
            >
              {isMenuOpen ? <XIcon className="h-[18px] w-[18px]" /> : <MenuIcon className="h-[18px] w-[18px]" />}
            </button>
          </div>

        </div>
      </header>

      {/* ── Mobile search overlay ──────────────────────────────────────────── */}
      {isMobile && mobileSearchOpen && (
        <div className="fixed inset-0 z-[110]">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileSearchOpen(false)}
          />
          <div className="relative z-10 bg-white px-4 pt-4 pb-4 shadow-lg border-b border-slate-100">
            <AISearch open={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={toggleMenu}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-[82%] max-w-[360px] bg-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 ease-out">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#668c65] flex items-center justify-center">
                  <span className="font-serif italic text-white text-lg font-bold">V</span>
                </div>
                <span className="font-serif italic text-xl font-bold text-[#2d3f2d]">VowNest</span>
              </div>
              <button
                onClick={toggleMenu}
                className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Authenticated user card */}
            {isAuthenticated && user && (
              <div className="mx-4 mt-4 p-4 rounded-2xl bg-[#668c65]/6 border border-[#668c65]/15 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#668c65]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {user.profile_image_url || user.avatar ? (
                    <img src={user.profile_image_url || user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-[#668c65]">
                      {(user.full_name || user.email || "U")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-slate-800 truncate">{user.full_name || "—"}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {NAV_LINKS.map((item) => {
                const active = isActive(item.href);
                const icons: Record<string, React.ElementType> = { "/": Home, "/services": Briefcase, "/about": Info };
                const Icon = icons[item.href] || Home;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={toggleMenu}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all
                      ${active
                        ? "bg-[#668c65]/8 text-[#668c65]"
                        : "text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${active ? "text-[#668c65]" : "text-slate-400"}`} />
                    <span className="text-[15px] font-semibold">
                      <TranslatedText text={item.label} />
                    </span>
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#668c65]" />}
                  </a>
                );
              })}

              {/* Events accordion */}
              <button
                onClick={() => setMobileEventsOpen((v) => !v)}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-700 hover:bg-slate-50 transition-all"
              >
                <Calendar className="h-[18px] w-[18px] text-slate-400 flex-shrink-0" />
                <span className="text-[15px] font-semibold text-left flex-1">
                  <TranslatedText text="Events" />
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${mobileEventsOpen ? "rotate-180" : ""}`} />
              </button>

              {mobileEventsOpen && (
                <div className="ml-10 space-y-0.5 border-l-2 border-slate-100 pl-4 animate-in slide-in-from-top-2 duration-200">
                  {[{ href: "/events", label: "Browse Events" }, { href: "/my-tickets", label: "My Tickets" }].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={toggleMenu}
                      className="block px-3 py-3 text-[14px] font-medium text-slate-500 hover:text-[#668c65] transition-colors rounded-lg hover:bg-slate-50"
                    >
                      <TranslatedText text={item.label} />
                    </Link>
                  ))}
                </div>
              )}
            </nav>

            {/* Auth footer */}
            <div className="px-4 pb-8 pt-4 border-t border-slate-100 space-y-2.5">
              {!isAuthenticated ? (
                <>
                  <Link href="/auth/signup" onClick={toggleMenu} className="block">
                    <button className="w-full h-12 rounded-2xl bg-[#668c65] hover:bg-[#527052] text-white text-[12px] font-bold uppercase tracking-[0.15em] transition-all active:scale-[0.98] shadow-sm">
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
                    <button className="w-full h-12 rounded-2xl bg-[#668c65] hover:bg-[#527052] text-white text-[12px] font-bold uppercase tracking-[0.15em] transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2">
                      <LayoutDashboard className="h-4 w-4 text-white/60" />
                      <TranslatedText text="Go to Dashboard" />
                    </button>
                  </Link>
                  <button
                    onClick={() => { logout(); toggleMenu(); }}
                    className="w-full h-12 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 text-[12px] font-bold uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2"
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

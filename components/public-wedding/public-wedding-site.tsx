"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MapPin, Calendar, Gift, Camera, Mail, MessageSquare } from "lucide-react";
import { PublicWeddingSite, WeddingWebsiteSection } from "@/lib/api";

const THEME_STYLES: Record<string, { bg: string; text: string; accent: string; hero: string }> = {
  elegant_classic: { bg: "#f9fafc", text: "#0d182a", accent: "#668c65", hero: "linear-gradient(135deg, #0d182a 0%, #1a2d4a 100%)" },
  luxury_gold: { bg: "#0d182a", text: "#f9fafc", accent: "#c9a84c", hero: "linear-gradient(135deg, #0d182a 0%, #2a1f0a 100%)" },
  modern_minimal: { bg: "#ffffff", text: "#111827", accent: "#374151", hero: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)" },
  rustic_garden: { bg: "#faf7f2", text: "#3d2c1e", accent: "#6b7c3f", hero: "linear-gradient(135deg, #3d2c1e 0%, #5c4033 100%)" },
  beach: { bg: "#f0f9ff", text: "#0c4a6e", accent: "#0284c7", hero: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)" },
  traditional_african: { bg: "#fff8f0", text: "#1a0a00", accent: "#c0392b", hero: "linear-gradient(135deg, #1a0a00 0%, #4a1942 100%)" },
  royal: { bg: "#1a0a2e", text: "#f3e8ff", accent: "#a855f7", hero: "linear-gradient(135deg, #1a0a2e 0%, #3b0764 100%)" },
  dark_mode: { bg: "#0f172a", text: "#f1f5f9", accent: "#668c65", hero: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" },
};

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex justify-center gap-4 md:gap-8">
      {units.map((u) => (
        <div key={u.label} className="text-center">
          <div className="text-3xl md:text-5xl font-serif font-light tabular-nums">{u.value}</div>
          <div className="text-xs uppercase tracking-widest opacity-60 mt-1">{u.label}</div>
        </div>
      ))}
    </div>
  );
}

function SectionRenderer({
  section,
  site,
  styles,
}: {
  section: WeddingWebsiteSection;
  site: PublicWeddingSite;
  styles: (typeof THEME_STYLES)[string];
}) {
  const content = section.content || {};
  const coupleProfile = site.couple_profile || {};

  switch (section.section_type) {
    case "hero": {
      const photos = (coupleProfile.photos as Record<string, string | null>) || {};
      const couplePhoto =
        photos.couple ||
        (content.background_image as string) ||
        photos.bride ||
        photos.groom ||
        null;
      const secondaryPhoto =
        photos.bride && photos.bride !== couplePhoto
          ? photos.bride
          : photos.groom && photos.groom !== couplePhoto
            ? photos.groom
            : photos.groom || photos.bride || null;
      const displayName =
        (coupleProfile.display_names as string) ||
        (content.subheadline as string) ||
        site.wedding.couple_name;
      const headline =
        (content.headline as string) || "We're Getting Married";
      const loveStory =
        (coupleProfile.love_story as string) ||
        (coupleProfile.biography as string) ||
        `Join us as we celebrate our love and begin forever together.`;
      const storyPreview =
        loveStory.length > 180 ? `${loveStory.slice(0, 180).trim()}…` : loveStory;
      const dateLabel = site.wedding.wedding_date
        ? new Date(site.wedding.wedding_date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : null;
      const nameParts = displayName.split(/\s*&\s*/).map((p) => p.trim()).filter(Boolean);

      return (
        <section
          className="relative w-full overflow-hidden min-h-[85vh] py-12 lg:py-16"
          style={{ backgroundColor: styles.bg, color: styles.text }}
        >
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left — couple name + love story */}
              <div className="lg:col-span-6 space-y-8 lg:space-y-10 animate-in fade-in slide-in-from-left duration-1000">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-12" style={{ backgroundColor: styles.accent + "55" }} />
                    <span
                      className="font-bold tracking-[0.3em] uppercase text-[10px]"
                      style={{ color: styles.accent }}
                    >
                      {headline}
                    </span>
                  </div>

                  <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight">
                    {nameParts.length >= 2 ? (
                      <>
                        <span className="block font-light">{nameParts[0]}</span>
                        <span
                          className="block italic font-medium ml-2 md:ml-8"
                          style={{ color: styles.accent }}
                        >
                          &amp; {nameParts[1]}
                        </span>
                      </>
                    ) : (
                      <span className="block italic font-medium" style={{ color: styles.accent }}>
                        {displayName}
                      </span>
                    )}
                  </h1>

                  {dateLabel && (
                    <p className="text-sm md:text-base opacity-60 tracking-wide">{dateLabel}</p>
                  )}

                  <p className="text-base md:text-lg max-w-lg leading-relaxed font-light opacity-70">
                    {storyPreview}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href="#our-story"
                    className="inline-flex h-14 items-center px-8 rounded-full text-white font-semibold shadow-xl transition-opacity hover:opacity-90"
                    style={{ backgroundColor: styles.accent }}
                  >
                    Our Love Story
                    <Heart className="ml-2 h-4 w-4 fill-current" />
                  </a>
                  <Link
                    href={`/w/${site.slug}/rsvp`}
                    className="inline-flex h-14 items-center px-8 rounded-full border-2 font-semibold transition-colors"
                    style={{ borderColor: styles.accent, color: styles.accent }}
                  >
                    RSVP
                  </Link>
                </div>
              </div>

              {/* Right — couple image (landing-page arch layout) */}
              <div className="lg:col-span-6 relative min-h-[420px] md:min-h-[520px] lg:h-[600px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[260px] sm:w-[300px] md:w-[340px] lg:w-[380px] h-[400px] sm:h-[460px] md:h-[500px] lg:h-[540px] z-20 group">
                    <div
                      className="absolute inset-0 border rounded-[200px] -m-4 group-hover:m-0 transition-all duration-700"
                      style={{ borderColor: styles.text + "22" }}
                    />
                    <div className="w-full h-full overflow-hidden rounded-[200px] shadow-2xl border-8 border-white relative bg-slate-100">
                      {couplePhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={couplePhoto}
                          alt={displayName}
                          className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                          style={{ background: styles.hero, color: "#fff" }}
                        >
                          <Heart className="h-10 w-10 opacity-80" />
                          <p className="font-serif italic text-2xl px-6 text-center">{displayName}</p>
                        </div>
                      )}
                    </div>

                    <div className="absolute -right-4 sm:-right-10 top-16 sm:top-20 bg-white p-4 sm:p-6 rounded-3xl shadow-2xl animate-float z-30 border border-slate-50">
                      <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500 fill-rose-500 mb-1 sm:mb-2" />
                      <p className="font-serif italic text-lg sm:text-xl text-slate-900">Forever</p>
                    </div>
                  </div>

                  {secondaryPhoto && (
                    <div className="absolute left-2 sm:left-[-20px] lg:left-[-40px] bottom-6 sm:bottom-10 w-28 h-28 sm:w-40 sm:h-40 lg:w-48 lg:h-48 z-30 rounded-full overflow-hidden border-8 border-white shadow-xl hover:scale-110 transition-transform duration-500">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={secondaryPhoto}
                        alt="Couple portrait"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="absolute right-0 bottom-16 z-10 opacity-5 select-none pointer-events-none hidden md:block">
                    <span className="font-serif text-[120px] lg:text-[160px] leading-none">
                      Love
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    case "couple_profile":
    case "love_story": {
      const photos = (coupleProfile.photos as Record<string, string | null>) || {};
      const brideName = (coupleProfile.bride_name as string) || "";
      const groomName = (coupleProfile.groom_name as string) || "";
      const displayName =
        (coupleProfile.display_names as string) || site.wedding.couple_name || "";
      const hasPortraits = Boolean(photos.bride || photos.groom);
      const loveStory =
        (coupleProfile.love_story as string) ||
        (content.story as string) ||
        (content.intro as string) ||
        (coupleProfile.biography as string) ||
        "";

      return (
        <section
          id="our-story"
          className="py-20 md:py-28 px-6"
          style={{ backgroundColor: styles.bg, color: styles.text }}
        >
          <div className="max-w-3xl mx-auto text-center space-y-10">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-10" style={{ backgroundColor: styles.accent + "55" }} />
                <Heart className="h-5 w-5" style={{ color: styles.accent }} />
                <div className="h-px w-10" style={{ backgroundColor: styles.accent + "55" }} />
              </div>
              <h2 className="font-serif text-4xl md:text-5xl">
                {section.title || "Our Story"}
              </h2>
              {displayName && (
                <p className="text-base md:text-lg opacity-60 tracking-wide">{displayName}</p>
              )}
            </div>

            {hasPortraits && (
              <div className="flex flex-wrap items-end justify-center gap-10 md:gap-16">
                {photos.bride && (
                  <div className="space-y-3">
                    <div
                      className="mx-auto h-36 w-36 overflow-hidden rounded-full border-4 shadow-md md:h-44 md:w-44"
                      style={{ borderColor: styles.accent + "55" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photos.bride}
                        alt={brideName || "Bride"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {brideName && <p className="font-serif text-xl md:text-2xl">{brideName}</p>}
                  </div>
                )}
                {photos.bride && photos.groom && (
                  <Heart
                    className="mb-16 hidden h-6 w-6 shrink-0 sm:block"
                    style={{ color: styles.accent }}
                  />
                )}
                {photos.groom && (
                  <div className="space-y-3">
                    <div
                      className="mx-auto h-36 w-36 overflow-hidden rounded-full border-4 shadow-md md:h-44 md:w-44"
                      style={{ borderColor: styles.accent + "55" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photos.groom}
                        alt={groomName || "Groom"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {groomName && <p className="font-serif text-xl md:text-2xl">{groomName}</p>}
                  </div>
                )}
              </div>
            )}

            {loveStory ? (
              <p className="text-base md:text-lg leading-relaxed opacity-75 max-w-2xl mx-auto whitespace-pre-line">
                {loveStory}
              </p>
            ) : (
              <p className="text-lg italic opacity-50">
                Every love story is beautiful, but ours is our favorite.
              </p>
            )}

            <Link
              href={`/w/${site.slug}/story`}
              className="inline-block px-8 py-3 rounded-full text-white font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: styles.accent }}
            >
              Read Our Story
            </Link>
          </div>
        </section>
      );
    }

    case "countdown":
      return (
        <section className="py-16 px-6" style={{ backgroundColor: styles.accent + "15", color: styles.text }}>
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="font-serif text-3xl">Counting Down</h2>
            {(content.target_date as string) || site.wedding.wedding_date ? (
              <CountdownTimer
                targetDate={(content.target_date as string) || site.wedding.wedding_date!}
              />
            ) : (
              <p className="opacity-60">Wedding date coming soon</p>
            )}
          </div>
        </section>
      );

    case "venue":
      return (
        <section className="py-20 px-6" style={{ backgroundColor: styles.bg, color: styles.text }}>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <MapPin className="h-8 w-8 mx-auto" style={{ color: styles.accent }} />
            <h2 className="font-serif text-4xl">{section.title || "Venue"}</h2>
            <p className="text-xl font-medium">
              {(content.venue_name as string) || site.wedding.venue || "Venue TBA"}
            </p>
            {(content.address as string) && (
              <p className="opacity-70">{content.address as string}</p>
            )}
            <Link
              href={`/w/${site.slug}/venue`}
              className="inline-block px-8 py-3 rounded-full text-white font-medium"
              style={{ backgroundColor: styles.accent }}
            >
              Venue Details
            </Link>
          </div>
        </section>
      );

    case "rsvp":
      return (
        <section className="py-20 px-6" style={{ backgroundColor: styles.accent + "10", color: styles.text }}>
          <div className="max-w-xl mx-auto text-center space-y-6">
            <Mail className="h-8 w-8 mx-auto" style={{ color: styles.accent }} />
            <h2 className="font-serif text-4xl">{section.title || "RSVP"}</h2>
            <p className="opacity-70">We would be honoured by your presence</p>
            <Link
              href={`/w/${site.slug}/rsvp`}
              className="inline-block px-8 py-3 rounded-full text-white font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: styles.accent }}
            >
              Respond to Invitation
            </Link>
          </div>
        </section>
      );

    case "registry":
      return (
        <section className="py-20 px-6" style={{ backgroundColor: styles.bg, color: styles.text }}>
          <div className="max-w-xl mx-auto text-center space-y-6">
            <Gift className="h-8 w-8 mx-auto" style={{ color: styles.accent }} />
            <h2 className="font-serif text-4xl">{section.title || "Gift Registry"}</h2>
            <p className="opacity-70">Your presence is the greatest gift. Contributions are warmly welcomed.</p>
            <Link
              href={`/w/${site.slug}/gifts`}
              className="inline-block px-8 py-3 rounded-full border-2 font-medium transition-colors hover:bg-opacity-10"
              style={{ borderColor: styles.accent, color: styles.accent }}
            >
              Register a Gift
            </Link>
          </div>
        </section>
      );

    case "gallery":
      return (
        <section className="py-20 px-6" style={{ backgroundColor: styles.accent + "08", color: styles.text }}>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Camera className="h-8 w-8 mx-auto" style={{ color: styles.accent }} />
            <h2 className="font-serif text-4xl">{section.title || "Gallery"}</h2>
            <p className="opacity-70">Photos from our journey together</p>
            <Link
              href={`/w/${site.slug}/gallery`}
              className="inline-block px-8 py-3 rounded-full text-white font-medium"
              style={{ backgroundColor: styles.accent }}
            >
              View Gallery
            </Link>
          </div>
        </section>
      );

    case "event_schedule":
      return (
        <section className="py-20 px-6" style={{ backgroundColor: styles.bg, color: styles.text }}>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Calendar className="h-8 w-8 mx-auto" style={{ color: styles.accent }} />
            <h2 className="font-serif text-4xl">{section.title || "Schedule"}</h2>
            {site.wedding.wedding_date && (
              <p className="text-lg opacity-80">
                {new Date(site.wedding.wedding_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
            {site.wedding.venue && (
              <p className="opacity-60">{site.wedding.venue}</p>
            )}
            <Link
              href={`/w/${site.slug}/events`}
              className="inline-block px-8 py-3 rounded-full text-white font-medium"
              style={{ backgroundColor: styles.accent }}
            >
              View All Events
            </Link>
          </div>
        </section>
      );


    case "guestbook":
      return (
        <section className="py-20 px-6" style={{ backgroundColor: styles.bg, color: styles.text }}>
          <div className="max-w-xl mx-auto text-center space-y-6">
            <MessageSquare className="h-8 w-8 mx-auto" style={{ color: styles.accent }} />
            <h2 className="font-serif text-4xl">{section.title || "Guestbook"}</h2>
            <p className="opacity-70">Share your wishes with the couple</p>
            <Link
              href={`/w/${site.slug}/guestbook`}
              className="inline-block px-8 py-3 rounded-full text-white font-medium"
              style={{ backgroundColor: styles.accent }}
            >
              Leave a Message
            </Link>
          </div>
        </section>
      );

    case "footer":
      return (
        <footer
          className="py-12 px-6 text-center"
          style={{ backgroundColor: styles.text, color: styles.bg }}
        >
          <p className="font-serif text-2xl italic mb-2">{site.wedding.couple_name}</p>
          <p className="text-sm opacity-60">
            {site.wedding.wedding_date
              ? new Date(site.wedding.wedding_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
              : ""}
          </p>
          <p className="text-xs opacity-40 mt-6">Made with love on VowNests</p>
        </footer>
      );

    default:
      return null;
  }
}

interface PublicWeddingSiteViewProps {
  site: PublicWeddingSite;
}

export function PublicWeddingSiteView({ site }: PublicWeddingSiteViewProps) {
  const themeConfig = site.theme_config || {};
  const themeId = site.theme_id || "elegant_classic";
  const baseStyles = THEME_STYLES[themeId] || THEME_STYLES.elegant_classic;

  const styles = {
    ...baseStyles,
    accent: (themeConfig.accent_color as string) || baseStyles.accent,
    bg: (themeConfig.background_color as string) || baseStyles.bg,
    text: (themeConfig.primary_color as string) || baseStyles.text,
  };

  const sections = (site.sections || [])
    .filter((s) => s.is_visible && !s.deleted_at)
    .sort((a, b) => {
      const rank = (type: string) => {
        if (type === "hero") return 0;
        if (type === "couple_profile" || type === "love_story") return 1;
        return 2;
      };
      const ra = rank(a.section_type);
      const rb = rank(b.section_type);
      if (ra !== rb) return ra - rb;
      return a.sort_order - b.sort_order;
    });

  // Prefer a single story block under the hero when both section types exist
  const seenStory = new Set<string>();
  const orderedSections = sections.filter((s) => {
    if (s.section_type === "couple_profile" || s.section_type === "love_story") {
      if (seenStory.has("story")) return false;
      seenStory.add("story");
    }
    return true;
  });

  return (
    <div style={{ backgroundColor: styles.bg, color: styles.text, fontFamily: "Outfit, sans-serif" }}>
      <nav
        className="sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: styles.bg + "ee", borderColor: styles.text + "15" }}
      >
        <span className="font-serif text-lg italic">{site.wedding.couple_name}</span>
        <div className="hidden md:flex gap-6 text-sm">
          <a href="#our-story" className="opacity-70 hover:opacity-100">Our Story</a>
          <Link href={`/w/${site.slug}/events`} className="opacity-70 hover:opacity-100">Events</Link>
          <Link href={`/w/${site.slug}/venue`} className="opacity-70 hover:opacity-100">Venue</Link>
          <Link href={`/w/${site.slug}/rsvp`} className="opacity-70 hover:opacity-100">RSVP</Link>
          <Link href={`/w/${site.slug}/gifts`} className="opacity-70 hover:opacity-100">Gifts</Link>
          <Link href={`/w/${site.slug}/gallery`} className="opacity-70 hover:opacity-100">Gallery</Link>
          <Link href={`/w/${site.slug}/contact`} className="opacity-70 hover:opacity-100">Contact</Link>
        </div>
      </nav>

      {orderedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} site={site} styles={styles} />
      ))}
    </div>
  );
}

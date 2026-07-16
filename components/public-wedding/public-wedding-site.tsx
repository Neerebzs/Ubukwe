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
    case "hero":
      return (
        <section
          className="relative min-h-[70vh] flex items-center justify-center text-center px-6"
          style={{ background: styles.hero, color: "#ffffff" }}
        >
          <div className="relative z-10 max-w-3xl space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] opacity-80">
              {(content.headline as string) || "We're Getting Married"}
            </p>
            <h1 className="font-serif text-5xl md:text-7xl font-light italic">
              {(content.subheadline as string) || site.wedding.couple_name}
            </h1>
            {site.wedding.wedding_date && (
              <p className="text-lg opacity-80 mt-4">
                {new Date(site.wedding.wedding_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </section>
      );

    case "couple_profile":
      return (
        <section className="py-20 px-6" style={{ backgroundColor: styles.bg, color: styles.text }}>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Heart className="h-8 w-8 mx-auto" style={{ color: styles.accent }} />
            <h2 className="font-serif text-4xl">{section.title || "Our Story"}</h2>
            <p className="text-lg leading-relaxed opacity-80">
              {(coupleProfile.love_story as string) ||
                (content.story as string) ||
                (coupleProfile.biography as string) ||
                `Join us as ${site.wedding.couple_name} celebrate their love.`}
            </p>
          </div>
        </section>
      );

    case "love_story":
      return (
        <section className="py-20 px-6" style={{ backgroundColor: styles.bg, color: styles.text }}>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Heart className="h-8 w-8 mx-auto" style={{ color: styles.accent }} />
            <h2 className="font-serif text-4xl">{section.title || "Our Story"}</h2>
            <p className="opacity-70 max-w-lg mx-auto text-lg leading-relaxed">
              {(coupleProfile.love_story as string) ||
                (content.intro as string) ||
                (content.story as string) ||
                "Every love story is beautiful, but ours is our favorite."}
            </p>
            <Link
              href={`/w/${site.slug}/story`}
              className="inline-block px-8 py-3 rounded-full text-white font-medium"
              style={{ backgroundColor: styles.accent }}
            >
              Read Our Story
            </Link>
          </div>
        </section>
      );

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
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div style={{ backgroundColor: styles.bg, color: styles.text, fontFamily: "Outfit, sans-serif" }}>
      <nav
        className="sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: styles.bg + "ee", borderColor: styles.text + "15" }}
      >
        <span className="font-serif text-lg italic">{site.wedding.couple_name}</span>
        <div className="hidden md:flex gap-6 text-sm">
          <Link href={`/w/${site.slug}/story`} className="opacity-70 hover:opacity-100">Our Story</Link>
          <Link href={`/w/${site.slug}/events`} className="opacity-70 hover:opacity-100">Events</Link>
          <Link href={`/w/${site.slug}/venue`} className="opacity-70 hover:opacity-100">Venue</Link>
          <Link href={`/w/${site.slug}/rsvp`} className="opacity-70 hover:opacity-100">RSVP</Link>
          <Link href={`/w/${site.slug}/gifts`} className="opacity-70 hover:opacity-100">Gifts</Link>
          <Link href={`/w/${site.slug}/gallery`} className="opacity-70 hover:opacity-100">Gallery</Link>
          <Link href={`/w/${site.slug}/contact`} className="opacity-70 hover:opacity-100">Contact</Link>
        </div>
      </nav>

      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} site={site} styles={styles} />
      ))}
    </div>
  );
}

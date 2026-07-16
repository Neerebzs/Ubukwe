import { PublicWeddingSite } from "@/lib/api";

export function buildWeddingJsonLd(site: PublicWeddingSite, baseUrl: string) {
  const coupleName = site.wedding.couple_name || "Wedding";
  const eventDate = site.wedding.wedding_date;
  const ogImage = (site.seo_config?.og_image as string) || undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${coupleName} Wedding`,
    description: (site.seo_config?.meta_description as string) || `Join ${coupleName} in celebrating their wedding.`,
    startDate: eventDate || undefined,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: site.wedding.venue
      ? {
          "@type": "Place",
          name: site.wedding.venue,
        }
      : undefined,
    image: ogImage,
    url: `${baseUrl}/w/${site.slug}`,
    organizer: {
      "@type": "Person",
      name: coupleName,
    },
  };
}

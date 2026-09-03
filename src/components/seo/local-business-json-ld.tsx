import type { SiteSettingsData } from "@/lib/site-settings";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/seo";

const schemaDays = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

const schemaDayIndex = {
  FRIDAY: 6,
  MONDAY: 2,
  SATURDAY: 0,
  SUNDAY: 1,
  THURSDAY: 5,
  TUESDAY: 3,
  WEDNESDAY: 4,
} as const;

function toSchemaDays(startDay: keyof typeof schemaDayIndex, endDay: keyof typeof schemaDayIndex) {
  const startIndex = schemaDayIndex[startDay];
  const endIndex = schemaDayIndex[endDay];
  const lastIndex = endIndex >= startIndex ? endIndex : endIndex + schemaDays.length;

  return Array.from(
    { length: lastIndex - startIndex + 1 },
    (_, index) => schemaDays[(startIndex + index) % schemaDays.length],
  );
}

function serializeJsonLd(value: Record<string, unknown>) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function LocalBusinessJsonLd({ settings }: { settings: SiteSettingsData }) {
  const primaryAddress = settings.addresses[0];
  const socialUrls = [
    settings.instagramUrl,
    settings.rubikaUrl,
    settings.eitaaUrl,
    settings.whatsappUrl,
  ].filter(
    (url): url is string => Boolean(url),
  );
  const laboratoryName = settings.laboratoryName || "آزمایشگاه پاتولوژی پایش اکسین";
  const primaryPhone = settings.phoneNumbers[0]?.phone;
  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    image: toAbsoluteUrl("/background-hq.png"),
    logo: toAbsoluteUrl("/payeshlab-logo.png"),
    name: laboratoryName,
    url: getSiteUrl().toString(),
  };

  if (settings.shortDescription) structuredData.description = settings.shortDescription;
  if (primaryPhone) structuredData.telephone = primaryPhone;
  if (socialUrls.length > 0) structuredData.sameAs = socialUrls;

  if (primaryAddress) {
    structuredData.address = {
      "@type": "PostalAddress",
      ...(settings.city ? { addressLocality: settings.city } : {}),
      ...(settings.province ? { addressRegion: settings.province } : {}),
      addressCountry: "IR",
      streetAddress: primaryAddress.address,
    };
  }

  if (settings.latitude !== null && settings.longitude !== null) {
    structuredData.geo = {
      "@type": "GeoCoordinates",
      latitude: settings.latitude,
      longitude: settings.longitude,
    };
  }

  if (settings.workingHours.length > 0) {
    structuredData.openingHoursSpecification = settings.workingHours.map((workingHour) => ({
      "@type": "OpeningHoursSpecification",
      closes: workingHour.endTime,
      dayOfWeek: toSchemaDays(workingHour.startDay, workingHour.endDay),
      opens: workingHour.startTime,
    }));
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      type="application/ld+json"
    />
  );
}

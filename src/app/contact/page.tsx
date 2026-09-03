import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AtmosphereOrbs } from "@/components/decorative/atmosphere-orbs";
import { EitaaIcon } from "@/components/icons/eitaa-icon";
import { RubikaIcon } from "@/components/icons/rubika-icon";
import { SiteNavigation } from "@/components/navigation/site-navigation";
import { SiteFooter } from "@/components/site-footer";
import { getSelectedContentLocale } from "@/lib/content-locale-server";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";
import { createSeoMetadata } from "@/lib/seo";
import type { SiteSettingsData } from "@/lib/site-settings";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSelectedContentLocale();
  const dictionary = getDictionary(locale);

  return createSeoMetadata({
    description: translate(dictionary, "seo.contactDescription"),
    image: "/contact/reception-desk.jpg",
    keywords: dictionary["seo.keywords"].split(",").map((keyword) => keyword.trim()),
    locale,
    path: "/contact",
    title: translate(dictionary, "seo.contactTitle"),
  });
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M8.5 3.5 6.6 4.4c-.9.4-1.4 1.4-1.1 2.3 1.5 5.4 5.7 9.6 11.1 11.1.9.3 1.9-.2 2.3-1.1l.9-1.9c.4-.8.1-1.8-.7-2.3l-2.4-1.4a1.8 1.8 0 0 0-2.1.2l-1 1c-1.9-1-3.5-2.6-4.5-4.5l1-1a1.8 1.8 0 0 0 .2-2.1L9.8 4.2a1.8 1.8 0 0 0-1.3-.7Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M20 10c0 5-8 10.5-8 10.5S4 15 4 10a8 8 0 1 1 16 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ArrowUpLeftIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M18 6 6 18M8 6h10v10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <rect height="16" rx="4" stroke="currentColor" strokeWidth="1.8" width="16" x="4" y="4" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.9" fill="currentColor" r="1" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9.1 8.1c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.5.6c.5 1 1.2 1.7 2.2 2.2l.6-.5c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .6-.5.8-.4.2-.9.3-1.4.1-2.7-.9-4.8-3-5.7-5.7-.2-.5-.1-1 .1-1.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function cleanPhoneHref(phone: string) {
  return phone.replace(/[^+0-9]/g, "");
}

function getMapHref(settings: SiteSettingsData) {
  if (settings.latitude === null || settings.longitude === null) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${settings.latitude},${settings.longitude}`)}`;
}

function getMapEmbedUrl(settings: SiteSettingsData) {
  if (settings.latitude === null || settings.longitude === null) return null;

  const latitude = settings.latitude;
  const longitude = settings.longitude;
  const latitudeOffset = 0.008;
  const longitudeOffset = 0.011;
  const params = new URLSearchParams({
    bbox: `${longitude - longitudeOffset},${latitude - latitudeOffset},${longitude + longitudeOffset},${latitude + latitudeOffset}`,
    layer: "mapnik",
    marker: `${latitude},${longitude}`,
  });

  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

function SocialLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <a
      aria-label={label}
      className="inline-flex min-h-12 items-center gap-3 rounded-full bg-white/10 px-4 text-sm font-extrabold text-white transition duration-200 hover:bg-white hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {icon}
      {label}
      <ArrowUpLeftIcon />
    </a>
  );
}

export default async function ContactPage() {
  const [locale, settings] = await Promise.all([getSelectedContentLocale(), getSiteSettings()]);
  const dictionary = getDictionary(locale);
  const t = (key: string, values?: Record<string, number | string>) => translate(dictionary, key, values);
  const laboratoryName = settings.laboratoryName || t("brand.name");
  const locationName = [settings.city, settings.province]
    .filter((value): value is string => Boolean(value))
    .join("، ");
  const mapHref = getMapHref(settings);
  const mapEmbedUrl = getMapEmbedUrl(settings);
  const primaryPhone = settings.phoneNumbers[0];
  const socialLinks = [
    settings.instagramUrl
      ? { href: settings.instagramUrl, icon: <InstagramIcon />, label: t("footer.socialInstagram") }
      : null,
    settings.whatsappUrl
      ? { href: settings.whatsappUrl, icon: <WhatsAppIcon />, label: t("footer.socialWhatsapp") }
      : null,
    settings.rubikaUrl
      ? { href: settings.rubikaUrl, icon: <RubikaIcon />, label: t("footer.socialRubika") }
      : null,
    settings.eitaaUrl
      ? { href: settings.eitaaUrl, icon: <EitaaIcon />, label: t("footer.socialEitaa") }
      : null,
  ].filter(Boolean) as Array<{ href: string; icon: ReactNode; label: string }>;

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#f8fbfb] text-slate-950">
      <a
        className="sr-only fixed left-4 top-4 z-[60] bg-slate-950 px-4 py-3 text-sm font-bold text-white focus:not-sr-only focus:outline-2 focus:outline-offset-4 focus:outline-teal-400"
        href="#main-content"
      >
        {t("skipNavigation")}
      </a>
      <SiteNavigation />

      <section
        className="relative isolate overflow-hidden px-5 pb-0 pt-32 sm:px-10 sm:pt-40 lg:px-20 lg:pt-44"
        id="main-content"
      >
        <div aria-hidden="true" className="absolute left-0 top-20 -z-10 h-72 w-72 bg-teal-100 sm:h-[30rem] sm:w-[30rem]" />
        <AtmosphereOrbs className="absolute right-2 top-28 z-0 h-40 w-64 opacity-45 sm:right-8 sm:top-36 sm:h-52 sm:w-80" scale={1.18} />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-end lg:gap-16">
          <div className="pb-10 lg:pb-16">
            <p className="text-sm font-extrabold tracking-[0.16em] text-teal-500">{t("contact.kicker")}</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[1.08] tracking-[-0.08em] text-slate-950 sm:text-6xl lg:text-7xl">
              {t("contact.titleFirst")}
              <br />
              {t("contact.titleSecond")}
            </h1>
            <p className="mt-7 max-w-xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
              {t("contact.description", { laboratoryName })}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              {primaryPhone ? (
                <a
                  className="inline-flex min-h-12 items-center gap-3 rounded-full bg-teal-500 px-5 text-sm font-extrabold text-white transition duration-200 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
                  dir="ltr"
                  href={`tel:${cleanPhoneHref(primaryPhone.phone)}`}
                >
                  <PhoneIcon />
                  <span>{primaryPhone.phone}</span>
                </a>
              ) : (
                <a
                  className="inline-flex min-h-12 items-center rounded-full bg-teal-500 px-5 text-sm font-extrabold text-white transition duration-200 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
                  href="#contact-details"
                >
                  {t("contact.contactMethods")}
                </a>
              )}
              {mapHref ? (
                <a
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-extrabold text-white transition duration-200 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-950"
                  href={mapHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  {t("contact.getDirections")}
                  <ArrowUpLeftIcon />
                </a>
              ) : null}
            </div>
          </div>

          <div className="relative min-h-[22rem] overflow-hidden bg-teal-100 sm:min-h-[32rem] lg:min-h-[39rem]">
            <Image
              alt={t("contact.heroImageAlt")}
              className="object-cover object-[32%_center]"
              fill
              priority
              sizes="(min-width: 1024px) 54vw, 100vw"
              src="/contact/reception-desk.jpg"
            />
          </div>
        </div>
      </section>

      <section className="bg-teal-500 px-5 py-16 text-white sm:px-10 sm:py-24 lg:px-20" id="contact-details">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.72fr)] lg:gap-20">
          <div>
            <p className="text-sm font-extrabold tracking-[0.16em] text-teal-200">{t("contact.directKicker")}</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.06em] sm:text-5xl">
              {t("contact.directTitle")}
            </h2>
            {settings.phoneNumbers.length > 0 ? (
              <ul className="mt-10 grid gap-3 sm:grid-cols-2">
                {settings.phoneNumbers.map((phone) => (
                  <li key={phone.id}>
                    <a
                      className="group flex min-h-28 flex-col justify-between bg-white/10 p-5 transition duration-200 hover:bg-white hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                      href={`tel:${cleanPhoneHref(phone.phone)}`}
                    >
                      <span className="flex items-center justify-between gap-3 text-xs font-extrabold tracking-wide text-teal-100 group-hover:text-teal-500">
                        {phone.label || t("contact.phoneLabel")}
                        <PhoneIcon />
                      </span>
                      <span className="mt-4 text-right text-lg font-black tracking-tight sm:text-xl" dir="ltr">
                        {phone.phone}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-8 max-w-lg text-base font-medium leading-8 text-teal-50">
                {t("contact.noPhones")}
              </p>
            )}
          </div>

          <aside className="bg-teal-500 p-7 sm:p-8">
            <p className="text-sm font-extrabold tracking-[0.14em] text-teal-200">{t("contact.onlineKicker")}</p>
            <h3 className="mt-4 text-2xl font-black tracking-[-0.05em]">{t("contact.onlineTitle")}</h3>
            {socialLinks.length > 0 ? (
              <div className="mt-7 flex flex-wrap gap-2">
                {socialLinks.map((social) => (
                  <SocialLink {...social} key={social.label} />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm font-medium leading-7 text-teal-50">
                {t("contact.noSocial")}
              </p>
            )}
          </aside>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-10 sm:py-24 lg:px-20" id="location">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-start lg:gap-16">
            <div>
              <p className="text-sm font-extrabold tracking-[0.16em] text-teal-500">{t("contact.visitKicker")}</p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.06em] text-slate-950 sm:text-5xl">
                {t("contact.addressesTitle")}
              </h2>
              {locationName ? (
                <p className="mt-5 text-base font-bold text-teal-500">{locationName}</p>
              ) : null}
              {settings.addresses.length > 0 ? (
                <ul className="mt-9 grid gap-4">
                  {settings.addresses.map((address, index) => (
                    <li className="bg-[#eff8f7] p-6 sm:p-7" key={address.id}>
                      <div className="flex gap-4">
                        <span className="mt-0.5 shrink-0 text-teal-500">
                          <PinIcon />
                        </span>
                        <address className="text-sm font-medium leading-8 text-slate-700 not-italic sm:text-base">
                          <strong className="block text-base font-black text-slate-950">
                            {address.title || t("contact.branch", { number: index + 1 })}
                          </strong>
                          <span className="mt-2 block">{address.address}</span>
                        </address>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-8 max-w-lg text-base font-medium leading-8 text-slate-600">
                  {t("contact.noAddresses")}
                </p>
              )}
              {mapHref ? (
                <a
                  className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-teal-500 px-5 text-sm font-extrabold text-white transition duration-200 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
                  href={mapHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  {t("contact.openDirections")}
                  <ArrowUpLeftIcon />
                </a>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
              <div className="relative min-h-[19rem] overflow-hidden bg-teal-100 sm:min-h-[32rem]">
                <Image
                  alt={t("contact.entranceImageAlt")}
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 35vw, 100vw"
                  src="/contact/laboratory-entrance.jpg"
                />
              </div>
              <div className="relative min-h-[19rem] overflow-hidden bg-teal-100 sm:min-h-[32rem]">
                <Image
                  alt={t("contact.waitingImageAlt")}
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 42vw, 100vw"
                  src="/contact/waiting-room.jpg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#dff2ef] px-5 py-16 sm:px-10 sm:py-24 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-extrabold tracking-[0.16em] text-teal-500">{t("contact.mapKicker")}</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-slate-950 sm:text-5xl">{t("contact.mapTitle")}</h2>
            </div>
            {mapHref ? (
              <a
                className="inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-teal-500 transition hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
                href={mapHref}
                rel="noreferrer"
                target="_blank"
              >
                {t("contact.viewDirections")}
                <ArrowUpLeftIcon />
              </a>
            ) : null}
          </div>
          {mapEmbedUrl ? (
            <iframe
              className="h-[22rem] w-full border-0 bg-teal-100 sm:h-[32rem]"
              loading="lazy"
              src={mapEmbedUrl}
              title={t("contact.mapFrameTitle")}
            />
          ) : (
            <div className="grid min-h-[22rem] place-items-center bg-teal-100 p-8 text-center sm:min-h-[32rem]">
              <div className="max-w-md">
                <span className="mx-auto grid size-14 place-items-center bg-teal-500 text-white">
                  <PinIcon />
                </span>
                <p className="mt-5 text-lg font-black text-slate-950">{t("contact.mapPendingTitle")}</p>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                  {t("contact.mapPendingDescription")}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-950 px-5 py-14 text-white sm:px-10 sm:py-20 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-extrabold tracking-[0.16em] text-teal-300">{t("contact.brandKicker")}</p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] sm:text-3xl">{t("contact.finalCta")}</h2>
          </div>
          {primaryPhone ? (
            <a
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-white px-5 text-sm font-extrabold text-slate-950 transition duration-200 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              dir="ltr"
              href={`tel:${cleanPhoneHref(primaryPhone.phone)}`}
            >
              <PhoneIcon />
              {primaryPhone.phone}
            </a>
          ) : (
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-extrabold text-slate-950 transition duration-200 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              href="#contact-details"
            >
              {t("contact.contactMethods")}
            </Link>
          )}
        </div>
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FooterBackground, FooterReveal } from "@/components/motion/footer-motion";
import { EitaaIcon } from "@/components/icons/eitaa-icon";
import { RubikaIcon } from "@/components/icons/rubika-icon";
import { getSelectedContentLocale } from "@/lib/content-locale-server";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";
import type { SiteSettingsData } from "@/lib/site-settings";
import { formatWorkingHourRange } from "@/lib/working-hours";

function PhoneIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
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

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7.5V12l3 2"
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
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
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

function InstagramIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <rect
        height="16"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.8"
        width="16"
        x="4"
        y="4"
      />
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

function getMapEmbedUrl(settings: SiteSettingsData) {
  if (settings.latitude === null || settings.longitude === null) return null;

  const latitudeOffset = 0.0038;
  const longitudeOffset = 0.0054;
  const params = new URLSearchParams({
    bbox: `${settings.longitude - longitudeOffset},${settings.latitude - latitudeOffset},${settings.longitude + longitudeOffset},${settings.latitude + latitudeOffset}`,
    layer: "mapnik",
    marker: `${settings.latitude},${settings.longitude}`,
  });

  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

export async function SiteFooter({ settings }: { settings: SiteSettingsData }) {
  const locale = await getSelectedContentLocale();
  const dictionary = getDictionary(locale);
  const t = (key: string, values?: Record<string, number | string>) =>
    translate(dictionary, key, values);
  const laboratoryName =
    settings.laboratoryName || t("brand.name");
  const socialLinks = [
    settings.instagramUrl
      ? {
          href: settings.instagramUrl,
          icon: <InstagramIcon />,
          label: t("footer.socialInstagram"),
        }
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
  const mapHref =
    settings.latitude !== null && settings.longitude !== null
      ? `https://www.google.com/maps/search/?api=1&query=${settings.latitude},${settings.longitude}`
      : null;
  const mapEmbedUrl = getMapEmbedUrl(settings);
  return (
    <footer
      className="relative isolate overflow-hidden border-t border-teal-500/25 bg-teal-500 px-5 pb-5 pt-12 text-white sm:px-10 sm:pt-14 lg:px-20"
      id="contact"
    >
      <FooterBackground />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-10 border-b border-white/30 pb-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,1fr)] md:gap-8">
          <FooterReveal>
            <section>
            <Link
              className="inline-flex max-w-full rounded-2xl outline-none transition hover:text-teal-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-teal-500"
              href="/"
            >
              <span className="min-w-0 text-right text-lg font-black leading-7 text-white">
                {laboratoryName}
              </span>
            </Link>
            {settings.shortDescription ? (
              <p className="mt-4 max-w-md text-sm font-medium leading-7 text-teal-50/95">
                {settings.shortDescription}
              </p>
            ) : (
              <p className="mt-4 max-w-md text-sm font-medium leading-7 text-teal-50/95">
                {t("footer.summary")}
              </p>
            )}
            {socialLinks.length > 0 ? (
              <div
                aria-label={t("navigation.social")}
                className="mt-6 flex flex-wrap gap-2"
              >
                {socialLinks.map((social) => (
                  <a
                    aria-label={social.label}
                    className="grid size-11 place-items-center rounded-xl border border-white/45 text-white transition hover:border-white hover:bg-white hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
                    href={social.href}
                    key={social.label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            ) : null}
            </section>
          </FooterReveal>

          <FooterReveal>
            <section>
            <h2 className="text-sm font-black text-white">{t("footer.contact")}</h2>
            {settings.workingHours.length > 0 ? (
              <div className="mt-5">
                <h3 className="flex items-center gap-2 text-xs font-black text-white">
                  <ClockIcon />
                  {t("footer.workingHours")}
                </h3>
                <ul className="mt-3 grid gap-2 text-sm font-medium text-teal-50">
                  {settings.workingHours.map((workingHour) => (
                    <li className="font-bold leading-7 text-white" key={workingHour.id}>
                      {formatWorkingHourRange(workingHour, locale)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {settings.phoneNumbers.length > 0 ? (
              <ul className="mt-4 grid gap-3">
                {settings.phoneNumbers.map((phone) => (
                  <li key={phone.id}>
                    <a
                      className="group flex min-h-11 items-center justify-start gap-3 rounded-xl text-sm font-bold text-teal-50 transition hover:bg-teal-500 hover:px-2 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
                      href={`tel:${cleanPhoneHref(phone.phone)}`}
                    >
                      <span className="shrink-0 text-teal-500">
                        <PhoneIcon />
                      </span>
                      <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-right leading-6">
                        {phone.label ? <span>{phone.label}</span> : null}
                        <bdi className="inline-block whitespace-nowrap font-mono tabular-nums tracking-tight" dir="ltr">
                          {phone.phone}
                        </bdi>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm font-medium leading-7 text-teal-50/90">
                {t("footer.noContact")}
              </p>
            )}
            </section>
          </FooterReveal>

          <FooterReveal>
            <section>
            <h2 className="text-sm font-black text-white">{t("footer.address")}</h2>
            {settings.addresses.length > 0 ? (
              <ul className="mt-4 grid gap-4">
                {settings.addresses.map((item) => (
                  <li
                    className="flex gap-3 text-sm font-medium leading-7 text-teal-50"
                    key={item.id}
                  >
                    <span className="mt-1 shrink-0 text-teal-500">
                      <PinIcon />
                    </span>
                    <address className="not-italic">
                      <strong className="font-extrabold text-white">
                        {item.title || t("footer.defaultAddress")}
                      </strong>
                      <br />
                      {item.address}
                    </address>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm font-medium leading-7 text-teal-50/90">
                {t("footer.noAddress")}
              </p>
            )}
            {mapHref && mapEmbedUrl ? (
              <div className="group relative mt-6 h-32 overflow-hidden rounded-[1.4rem] border border-white/45 bg-teal-500/20 focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-3 focus-within:ring-offset-teal-500 sm:h-36">
                <iframe
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 size-full scale-110 saturate-[0.72] transition duration-300 group-hover:scale-[1.15] group-hover:saturate-100 motion-reduce:transition-none"
                  loading="lazy"
                  src={mapEmbedUrl}
                  tabIndex={-1}
                  title={t("footer.mapPreview")}
                />
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(95deg,rgba(13,148,136,0.94)_0%,rgba(13,148,136,0.72)_48%,rgba(13,148,136,0.16)_100%)]" />
                <div className="pointer-events-none absolute inset-x-4 bottom-3 flex items-center justify-between gap-3 text-white">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/20 backdrop-blur-sm">
                      <PinIcon />
                    </span>
                    <span className="text-sm font-black">{t("footer.location")}</span>
                  </span>
                  <span className="shrink-0 text-xs font-extrabold text-white/90">{t("footer.directions")}</span>
                </div>
                <a
                  aria-label={t("footer.viewLocation")}
                  className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white"
                  href={mapHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span className="sr-only">{t("footer.viewLocation")}</span>
                </a>
              </div>
            ) : null}
            </section>
          </FooterReveal>
        </div>
        <FooterReveal edge>
          <div className="flex flex-col gap-2 py-5 text-xs font-bold text-teal-50/90 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <p>
            © {new Date().getFullYear()} {laboratoryName}. {t("footer.rights")}
              </p>
              <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-white/65 sm:block" />
              <a
                aria-label={`${t("footer.designedBy")} ${t("footer.designedByCompany")}`}
                className="group inline-flex min-h-11 items-center gap-2 rounded-full px-1.5 py-1 text-teal-50 transition-[background-color,color,transform] duration-200 hover:-translate-y-px hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white active:translate-y-0"
                href="https://zilber.ir"
              >
                <span className="grid size-8 shrink-0 place-items-center">
                  <Image
                    alt=""
                    className="size-8 object-contain"
                    height={32}
                    src="/branding/zilber-logo-1.png"
                    width={32}
                  />
                </span>
                <span className="whitespace-nowrap leading-5">
                  {t("footer.designedBy")} <strong className="font-black text-white">{t("footer.designedByCompany")}</strong>
                </span>
                <svg aria-hidden="true" className="size-3.5 opacity-0 transition-[opacity,transform] duration-200 group-hover:-translate-x-0.5 group-hover:opacity-100" fill="none" viewBox="0 0 24 24">
                  <path d="M19 12H5m7-7-7 7 7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </a>
            </div>
          <Link
            className="w-fit rounded-lg text-white transition hover:text-teal-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
            href="/articles"
          >
            {t("footer.journal")}
          </Link>
          </div>
        </FooterReveal>
      </div>
    </footer>
  );
}

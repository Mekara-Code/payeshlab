import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AtmosphereOrbs } from "@/components/decorative/atmosphere-orbs";
import { SiteNavigation } from "@/components/navigation/site-navigation";
import { SiteFooter } from "@/components/site-footer";
import { getSelectedContentLocale } from "@/lib/content-locale-server";
import { getDictionary } from "@/lib/dictionaries";
import { translate, type TranslationValues } from "@/lib/dictionaries/types";
import { createSeoMetadata } from "@/lib/seo";
import { defaultCeoMessage } from "@/lib/site-settings-content";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSelectedContentLocale();
  const dictionary = getDictionary(locale);

  return createSeoMetadata({
    description: translate(dictionary, "seo.aboutDescription"),
    image: "/about/laboratory-entrance.jpg",
    keywords: dictionary["seo.keywords"].split(",").map((keyword) => keyword.trim()),
    locale,
    path: "/about",
    title: translate(dictionary, "seo.aboutTitle"),
  });
}

function PrecisionIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v2M22 12h-2M12 22v-2M2 12h2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function EquipmentIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M9 3h6M10 3v6.1L5.6 17a2.5 2.5 0 0 0 2.2 3.7h8.4a2.5 2.5 0 0 0 2.2-3.7L14 9.1V3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M8.5 15h7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PortraitIcon() {
  return (
    <svg aria-hidden="true" className="size-16" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4.5 20c.9-3.7 3.9-5.5 7.5-5.5s6.6 1.8 7.5 5.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="9" r="5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m8.5 14.5-1 7 4.5-2.2 4.5 2.2-1-7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function StethoscopeIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M6 3v5a4 4 0 0 0 8 0V3M6 3H4.5M6 3h1.5M14 3h1.5M14 3h-1.5M10 15.5v1a4.5 4.5 0 0 0 9 0V14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="19" cy="12" r="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 12v3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m8.2 12.2 2.4 2.4 5.2-5.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

const qualitySteps = [
  {
    descriptionKey: "about.beforeDescription",
    icon: <EquipmentIcon />,
    titleKey: "about.beforeTitle",
  },
  {
    descriptionKey: "about.duringDescription",
    icon: <PrecisionIcon />,
    titleKey: "about.duringTitle",
  },
  {
    descriptionKey: "about.afterDescription",
    icon: <CheckIcon />,
    titleKey: "about.afterTitle",
  },
];

export default async function AboutPage() {
  const [locale, settings] = await Promise.all([getSelectedContentLocale(), getSiteSettings()]);
  const dictionary = getDictionary(locale);
  const t = (key: string, values?: TranslationValues) =>
    translate(dictionary, key, values);
  const ceoMessage = settings.ceoMessage?.trim() || defaultCeoMessage;
  const technicalManagerName = settings.technicalManagerName?.trim();
  const technicalManagerBio = settings.technicalManagerBio?.trim();
  const technicalManagerLicenseCode = settings.technicalManagerLicenseCode?.trim();

  return (
    <main
      className="min-h-dvh overflow-x-hidden bg-[#f7fbfb] text-slate-950"
      id="about-page"
    >
      <SiteNavigation />

      <section className="relative isolate overflow-hidden px-5 pb-16 pt-32 sm:px-10 sm:pb-24 sm:pt-40 lg:px-20 lg:pb-32 lg:pt-44">
        <div
          aria-hidden="true"
          className="absolute -right-36 top-0 -z-10 size-[32rem] rounded-full bg-teal-200/55 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-48 -left-32 -z-10 size-[28rem] rounded-full bg-amber-100/65 blur-3xl"
        />
        <AtmosphereOrbs className="absolute right-2 top-12 z-0 h-40 w-64 opacity-45 sm:right-8 sm:top-16 sm:h-52 sm:w-80" scale={1.18} />
        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.93fr)_minmax(25rem,0.8fr)] lg:items-center lg:gap-16">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-teal-200 bg-white/85 px-4 py-2 text-xs font-extrabold tracking-wide text-teal-500 shadow-sm">
              {t("about.badge")}
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.2] tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl">
              {t("about.title")}
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
              {t("about.description")}
            </p>
            <a
              className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-teal-500 px-5 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(13,148,136,0.24)] transition hover:-translate-y-0.5 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
              href="#quality"
            >
              {t("about.qualityCta")}
            </a>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.25rem] border-8 border-white bg-slate-100 shadow-[0_28px_70px_rgba(15,23,42,0.17)]">
              <Image
                alt={t("about.heroImageAlt")}
                className="object-cover object-center"
                fill
                priority
                sizes="(min-width: 1024px) 38vw, (min-width: 640px) 28rem, calc(100vw - 2.5rem)"
                src="/about/laboratory-entrance.jpg"
              />
            </div>
            <div className="absolute -bottom-5 -left-4 hidden max-w-[15rem] rounded-2xl border border-white bg-white/95 px-4 py-3 shadow-[0_16px_36px_rgba(15,23,42,0.12)] backdrop-blur sm:block">
              <p className="text-xs font-extrabold tracking-wide text-teal-500">
                {t("about.heroCardTitle")}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-700">
                {t("about.heroCardDescription")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7fbfb] px-5 py-16 sm:px-10 sm:py-24 lg:px-20">
        <article
          className="mx-auto max-w-4xl rounded-[2rem] border border-teal-100 bg-white p-6 shadow-[0_22px_52px_rgba(15,23,42,0.08)] sm:p-10"
          dir="rtl"
          lang="fa"
        >
          <span className="inline-flex rounded-full bg-teal-100 px-4 py-2 text-xs font-extrabold tracking-wide text-teal-600">
            سخن مدیرعامل
          </span>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
            همراه شما در مسیر سلامت
          </h2>
          <p className="mt-6 max-w-prose whitespace-pre-line text-right text-base font-medium leading-8 text-slate-700 sm:text-lg sm:leading-9">
            {ceoMessage}
          </p>
        </article>
      </section>

      {technicalManagerName ? (
        <section
          aria-label={t("about.technicalManagerTitle")}
          className="scroll-mt-24 bg-[#f7fbfb] px-5 pb-16 sm:px-10 sm:pb-24 lg:px-20"
          id="technical-manager"
        >
          <article
            className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-teal-100 bg-white p-6 shadow-[0_22px_52px_rgba(15,23,42,0.08)] sm:p-10"
            dir="rtl"
            lang="fa"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-24 -top-28 size-64 rounded-full bg-teal-50 blur-3xl"
            />

            <div className="relative grid gap-8 sm:gap-10 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:items-center lg:gap-12">
              <figure className="relative mx-auto w-full max-w-[13rem] sm:max-w-[15rem] lg:mx-0 lg:max-w-none">
                <span
                  aria-hidden="true"
                  className="absolute -bottom-3 -left-3 size-24 rounded-[1.5rem] bg-teal-100 sm:-bottom-4 sm:-left-4 sm:size-32"
                />
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-slate-100 shadow-[0_20px_44px_rgba(15,23,42,0.16)] ring-1 ring-teal-100/70">
                  {settings.technicalManagerImageUrl ? (
                    <Image
                      alt={t("about.technicalManagerImageAlt", {
                        name: technicalManagerName,
                      })}
                      className="object-cover object-center"
                      fill
                      sizes="(min-width: 1024px) 17rem, (min-width: 640px) 15rem, 13rem"
                      src={settings.technicalManagerImageUrl}
                    />
                  ) : (
                    <span className="grid size-full place-items-center bg-[linear-gradient(140deg,#ccfbf1,#f0fdfa)] text-teal-500">
                      <PortraitIcon />
                    </span>
                  )}
                </div>
              </figure>

              <div className="min-w-0 text-center lg:text-right">
                <span className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-2 text-xs font-extrabold tracking-wide text-teal-600">
                  <StethoscopeIcon />
                  {t("about.technicalManagerBadge")}
                </span>
                <h2 className="mt-5 text-2xl font-black leading-[1.35] tracking-[-0.04em] text-slate-950 sm:text-3xl lg:text-4xl">
                  {technicalManagerName}
                </h2>
                {technicalManagerLicenseCode ? (
                  <p className="mt-4 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl bg-[#f7fbfb] px-4 py-2.5 ring-1 ring-teal-100">
                    <span className="text-teal-600">
                      <BadgeIcon />
                    </span>
                    <span className="text-sm font-extrabold text-slate-700">
                      {t("about.technicalManagerLicense")}
                    </span>
                    <bdi
                      className="font-mono text-base font-black text-slate-950"
                      dir="ltr"
                    >
                      {technicalManagerLicenseCode}
                    </bdi>
                  </p>
                ) : null}
                {technicalManagerBio ? (
                  <p className="mx-auto mt-5 max-w-prose whitespace-pre-line text-right text-sm font-medium leading-8 text-slate-700 sm:text-base sm:leading-9 lg:mx-0">
                    {technicalManagerBio}
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        </section>
      ) : null}

      <section
        className="scroll-mt-24 bg-white px-5 py-16 sm:px-10 sm:py-24 lg:px-20"
        id="quality"
      >
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-slate-100 shadow-[0_22px_52px_rgba(15,23,42,0.12)]">
              <Image
                alt={t("about.qualityImageAlt")}
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 40vw, calc(100vw - 2.5rem)"
                src="/about/laboratory-interior.jpg"
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute -bottom-4 -right-4 -z-10 h-32 w-32 rounded-[2rem] bg-teal-100 sm:h-44 sm:w-44"
            />
          </div>
          <div className="order-1 lg:order-2">
            <span className="inline-flex rounded-full bg-teal-100 px-4 py-2 text-xs font-extrabold tracking-wide text-teal-500">
              {t("about.qualityBadge")}
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">
              {t("about.qualityTitle")}
            </h2>
            <p className="mt-5 text-sm font-medium leading-8 text-slate-600 sm:text-base">
              {t("about.qualityDescription")}
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {qualitySteps.map((step) => (
                <article
                  className="rounded-2xl border border-slate-100 bg-[#f7fbfb] p-4"
                  key={step.titleKey}
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-teal-100 text-teal-500">
                    {step.icon}
                  </span>
                  <h3 className="mt-4 text-sm font-black text-slate-900">
                    {t(step.titleKey)}
                  </h3>
                  <p className="mt-2 text-xs font-medium leading-6 text-slate-600">
                    {t(step.descriptionKey)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-5 py-16 text-white sm:px-10 sm:py-24 lg:px-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold tracking-wide text-teal-100">
              {t("about.teamBadge")}
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] sm:text-4xl">
              {t("about.teamTitle")}
            </h2>
            <p className="mt-5 max-w-xl text-sm font-medium leading-8 text-slate-200 sm:text-base">
              {t("about.teamDescription")}
            </p>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/15">
              <Image
                alt={t("about.teamImageAlt")}
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 42vw, calc(100vw - 2.5rem)"
                src="/about/laboratory-reception.jpg"
              />
            </div>
            <div className="absolute -bottom-4 -left-2 rounded-2xl bg-teal-500 px-4 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(0,0,0,0.25)] sm:-left-5">
              {t("about.teamCallout")}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-teal-500 px-5 py-16 text-white sm:px-10 sm:py-24 lg:px-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)] lg:items-end">
          <div>
            <span className="inline-flex rounded-full border border-white/35 bg-white/10 px-4 py-2 text-xs font-extrabold tracking-wide text-teal-50">
              {t("about.commitmentBadge")}
            </span>
            <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.05em] sm:text-4xl">
              {t("about.commitmentTitle")}
            </h2>
            <p className="mt-5 max-w-3xl text-sm font-medium leading-8 text-teal-50 sm:text-base">
              {t("about.commitmentDescription")}
            </p>
          </div>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 text-sm font-extrabold text-teal-500 shadow-[0_14px_28px_rgba(4,47,46,0.2)] transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            href="/contact"
          >
            {t("about.contactCta")}
          </Link>
        </div>
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}

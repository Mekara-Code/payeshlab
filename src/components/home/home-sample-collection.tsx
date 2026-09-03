"use client";

import Image from "next/image";
import Link from "next/link";
import { AtmosphereOrbs } from "@/components/decorative/atmosphere-orbs";
import { useTranslations } from "@/components/i18n/dictionary-provider";
import { ScrollScene } from "@/components/motion/scroll-scene";
import { StaggerItem, StaggerScene } from "@/components/motion/stagger-scene";

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

export function HomeSampleCollection() {
  const { t } = useTranslations();

  return (
    <section
      aria-labelledby="home-sample-collection-heading"
      className="relative mt-16 overflow-hidden rounded-tr-[3rem] sm:mt-20"
      id="home-sample-collection"
    >
      <div className="relative grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <ScrollScene className="relative isolate flex flex-col justify-center overflow-hidden px-6 py-12 sm:px-10 sm:py-16 lg:order-2 lg:px-14 lg:py-20" distance={42}>
          <AtmosphereOrbs className="absolute -right-8 top-4 h-32 w-52 opacity-[0.42] sm:h-40 sm:w-64" scale={1.14} />
          <StaggerScene className="relative z-10">
            <StaggerItem>
              <p className="flex items-center gap-3 text-xs font-extrabold tracking-[0.16em] text-teal-500">
                <span aria-hidden="true" className="h-px w-8 bg-teal-500" />
                {t("sample.kicker")}
              </p>
            </StaggerItem>
            <StaggerItem className="mt-6">
              <h2
                className="max-w-lg text-4xl font-black leading-[1.12] tracking-[-0.07em] text-slate-950 sm:text-5xl"
                id="home-sample-collection-heading"
              >
                {t("sample.titleFirst")}
                <br />
                {t("sample.titleSecond")}
              </h2>
            </StaggerItem>
            <StaggerItem className="mt-6">
              <p className="max-w-md text-sm font-medium leading-8 text-slate-600 sm:text-base">
                {t("sample.description")}
              </p>
            </StaggerItem>

            <StaggerItem className="mt-9">
              <div className="grid max-w-md gap-5 sm:grid-cols-2">
                <div>
                  <span className="font-mono text-xs font-bold text-teal-500">01</span>
                  <p className="mt-2 text-sm font-black text-slate-950">{t("sample.stepOneTitle")}</p>
                  <p className="mt-1 text-xs font-medium leading-6 text-slate-500">{t("sample.stepOneDescription")}</p>
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-teal-500">02</span>
                  <p className="mt-2 text-sm font-black text-slate-950">{t("sample.stepTwoTitle")}</p>
                  <p className="mt-1 text-xs font-medium leading-6 text-slate-500">{t("sample.stepTwoDescription")}</p>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem className="mt-10">
              <Link
                className="inline-flex min-h-12 w-fit items-center gap-3 rounded-[1.75rem] bg-teal-500 px-5 text-sm font-extrabold text-white transition duration-200 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
                href="/contact"
              >
                {t("sample.cta")}
                <ArrowUpLeftIcon />
              </Link>
            </StaggerItem>
          </StaggerScene>
        </ScrollScene>

        <ScrollScene className="relative min-h-[22rem] sm:min-h-[30rem] lg:order-1 lg:min-h-full" direction="down" distance={42}>
          <Image
            alt={t("sample.imageAlt")}
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            src="/services/home-blood-collection.png"
          />
        </ScrollScene>
      </div>
    </section>
  );
}

"use client";

/* eslint-disable @next/next/no-img-element -- Insurance logos are administrator-configured external URLs. */

import "swiper/css";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { StaggerItem, StaggerScene } from "@/components/motion/stagger-scene";
import { useTranslations } from "@/components/i18n/dictionary-provider";
import type { InsurancePartner } from "@/lib/insurance-data";
import { InsurancePartnersModal } from "./insurance-partners-modal";

function ShieldIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="M12 3.5 19 6v5.1c0 4.3-2.8 7.9-7 9.4-4.2-1.5-7-5.1-7-9.4V6l7-2.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="m9.25 12 1.75 1.75 3.75-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function InsuranceLogo({ large, logoUrl, name }: { large: boolean; logoUrl: string | null; name: string }) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const sizeClass = large
    ? "h-24 w-full sm:h-32 lg:h-36"
    : "h-20 w-full sm:h-28 lg:h-32";

  useEffect(() => {
    const image = imageRef.current;

    if (!image?.complete) {
      return;
    }

    if (image.naturalWidth > 0) {
      setHasLoaded(true);
    } else {
      setHasError(true);
    }
  }, [logoUrl]);

  if (!logoUrl || hasError) {
    return (
      <span className={`flex items-center justify-center text-slate-400 ${sizeClass}`}>
        <ShieldIcon />
      </span>
    );
  }

  return (
    <span className={`relative flex items-center justify-center ${sizeClass}`}>
      {!hasLoaded ? <span aria-hidden="true" className="insurance-logo-skeleton absolute inset-1.5 rounded-[1.4rem]" /> : null}
      <img
        alt={name}
        className={`relative z-10 max-h-full max-w-full object-contain transition-[opacity,transform] duration-500 ease-out ${hasLoaded ? "scale-100 opacity-100" : "scale-[0.96] opacity-0"}`}
        loading="eager"
        onError={() => setHasError(true)}
        onLoad={() => setHasLoaded(true)}
        ref={imageRef}
        src={logoUrl}
      />
    </span>
  );
}

function getLoopableInsurances(insurances: InsurancePartner[]) {
  if (insurances.length === 0) {
    return [];
  }

  // Eight logos are visible on desktop. Keeping at least sixteen slides gives
  // Swiper enough content to maintain a seamless circular track as it advances.
  const minimumSlideCount = 16;

  return Array.from(
    { length: Math.max(minimumSlideCount, insurances.length) },
    (_, index) => insurances[index % insurances.length],
  );
}

export function InsuranceSlider({ insurances, large = false, variant = "light" }: { insurances: InsurancePartner[]; large?: boolean; variant?: "light" | "overlay" }) {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useTranslations();
  const isOverlay = variant === "overlay";
  const loopableInsurances = getLoopableInsurances(insurances);

  return (
    <section aria-label={t("insurance.title")} className={`mt-6 overflow-hidden border-t pt-5 ${isOverlay ? "border-white/20" : "border-slate-200/80"}`}>
      <StaggerScene>
        <StaggerItem className="mb-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <div>
              <h2 className={`font-black ${large ? "text-base sm:text-lg" : "text-sm"} ${isOverlay ? "text-white" : "text-slate-900"}`}>{t("insurance.title")}</h2>
              <p className={`mt-0.5 font-bold ${large ? "text-xs sm:text-sm" : "text-[11px]"} ${isOverlay ? "text-white/75" : "text-slate-500"}`}>{t("insurance.description")}</p>
            </div>
            <InsurancePartnersModal insurances={insurances} />
          </div>
        </StaggerItem>

        <StaggerItem>
          <Swiper
            aria-label={t("insurance.list")}
            allowTouchMove={false}
            autoplay={shouldReduceMotion ? false : { delay: 0, disableOnInteraction: false, pauseOnMouseEnter: false }}
            breakpoints={{
              480: { slidesPerGroup: 1, slidesPerView: 4, spaceBetween: 8 },
              640: { slidesPerGroup: 1, slidesPerView: 3, spaceBetween: large ? 16 : 20 },
              1024: { slidesPerGroup: 1, slidesPerView: 8, spaceBetween: 12 },
            }}
            className="insurance-marquee overflow-hidden"
            dir="rtl"
            modules={[Autoplay]}
            loop={loopableInsurances.length > 1}
            slidesPerGroup={1}
            slidesPerView={4}
            spaceBetween={8}
            speed={7000}
          >
            {loopableInsurances.map((insurance, index) => (
              <SwiperSlide key={`${insurance.id}-${index}`}>
                <article className={`flex min-h-24 items-center justify-center px-1 py-2 ${large ? "sm:min-h-32" : "sm:min-h-28"}`}>
                  <InsuranceLogo key={insurance.logoUrl ?? "empty-logo"} large={large} logoUrl={insurance.logoUrl} name={insurance.name} />
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </StaggerItem>
      </StaggerScene>
    </section>
  );
}

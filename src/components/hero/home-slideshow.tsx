"use client";

import Image from "next/image";
import "swiper/css";
import "swiper/css/effect-fade";
import { useReducedMotion } from "framer-motion";
import { Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { HeroContent } from "@/components/hero/hero-content";
import { LabAtmosphere } from "@/components/hero/lab-atmosphere";
import { LabSequence } from "@/app/lab-sequence";
import type { SlideshowSlideData } from "@/lib/slideshow-data";

export function HomeSlideshow({ slides }: { slides: SlideshowSlideData[] }) {
  const shouldReduceMotion = useReducedMotion();

  if (slides.length === 0) return null;

  return (
    <section aria-label="اسلایدهای معرفی آزمایشگاه" className="home-slideshow relative min-h-[48rem] overflow-hidden bg-slate-950 sm:min-h-[52rem] lg:min-h-dvh" id="main-content" tabIndex={-1}>
      <Swiper
        autoplay={shouldReduceMotion ? false : { delay: 5200, disableOnInteraction: false, pauseOnMouseEnter: true }}
        className="relative z-0 h-full min-h-[48rem] sm:min-h-[52rem] lg:min-h-dvh"
        effect="fade"
        loop={slides.length > 1}
        modules={[Autoplay, EffectFade]}
        speed={shouldReduceMotion ? 0 : 720}
      >
        {slides.map((slide, index) => (
          <SwiperSlide className="h-auto" key={slide.id}>
            <article className="relative flex min-h-[48rem] items-end overflow-hidden sm:min-h-[52rem] lg:min-h-dvh lg:items-center">
              <Image alt={slide.altText} className="object-cover" fill loading={index === 0 ? undefined : "lazy"} priority={index === 0} sizes="100vw" src={slide.imageUrl} />
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(96deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.8)_56%,rgba(255,255,255,0.7)_100%),linear-gradient(0deg,rgba(255,255,255,0.46)_0%,rgba(255,255,255,0.18)_55%,rgba(255,255,255,0.34)_100%)]" />
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
      <LabAtmosphere />
      <LabSequence />
      <div className="pointer-events-none absolute inset-0 z-30 mx-auto grid min-h-[48rem] max-w-[1536px] grid-cols-1 px-5 pb-24 pt-32 sm:min-h-[52rem] sm:px-10 sm:pb-28 sm:pt-40 lg:min-h-dvh lg:grid-cols-[45%_55%] lg:px-20 lg:py-24" dir="ltr">
        <div className="pointer-events-auto self-start lg:col-start-1 lg:self-center" dir="rtl">
          <HeroContent />
        </div>
      </div>
    </section>
  );
}

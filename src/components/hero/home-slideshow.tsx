"use client";

import Image from "next/image";
import "swiper/css";
import "swiper/css/effect-fade";
import { useReducedMotion } from "framer-motion";
import { Component, type ReactNode, useState } from "react";
import { Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { HeroContent, type HeroContactDetails } from "@/components/hero/hero-content";
import { LabAtmosphere } from "@/components/hero/lab-atmosphere";
import { useTranslations } from "@/components/i18n/dictionary-provider";
import { LabSequence } from "@/app/lab-sequence";
import type { SlideshowSlideData } from "@/lib/slideshow-data";

const FALLBACK_HERO_IMAGE = "/background.png";

type HeroCarouselBoundaryProps = {
  children: ReactNode;
  resetKey: string;
};

type HeroCarouselBoundaryState = {
  hasError: boolean;
};

class HeroCarouselBoundary extends Component<
  HeroCarouselBoundaryProps,
  HeroCarouselBoundaryState
> {
  state: HeroCarouselBoundaryState = { hasError: false };

  static getDerivedStateFromError(): HeroCarouselBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(previousProps: HeroCarouselBoundaryProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function HeroSlideImage({ alt, preload, src }: { alt: string; preload: boolean; src: string }) {
  const [imageSource, setImageSource] = useState(src || FALLBACK_HERO_IMAGE);

  return (
    <Image
      alt={alt}
      className="object-cover"
      fill
      loading={preload ? "eager" : "lazy"}
      onError={() => setImageSource((currentSource) => currentSource === FALLBACK_HERO_IMAGE ? currentSource : FALLBACK_HERO_IMAGE)}
      preload={preload}
      sizes="100vw"
      src={imageSource}
    />
  );
}

export function HomeSlideshow({
  contactDetails,
  slides,
}: {
  contactDetails: HeroContactDetails;
  slides: SlideshowSlideData[];
}) {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useTranslations();

  const slidesToRender: SlideshowSlideData[] =
    slides.length > 0
      ? slides
      : [
          {
            altText: t("defaults.slideAlt"),
            id: "hero-fallback-slide",
            imageUrl: FALLBACK_HERO_IMAGE,
            sortOrder: 0,
            subtitle: null,
            title: null,
          },
        ];
  const carouselKey = slidesToRender.map((slide) => `${slide.id}:${slide.imageUrl}`).join("|");

  return (
    <section
      aria-label={t("hero.slides")}
      className="home-slideshow relative min-h-[57rem] overflow-hidden bg-slate-950 sm:min-h-[58rem] lg:min-h-dvh"
      id="main-content"
      tabIndex={-1}
    >
      <div className="absolute inset-0 z-0">
        <Image
          alt=""
          aria-hidden="true"
          className="object-cover"
          fill
          preload
          sizes="100vw"
          src={FALLBACK_HERO_IMAGE}
        />
      </div>
      <HeroCarouselBoundary resetKey={carouselKey}>
        <Swiper
        autoplay={shouldReduceMotion ? false : { delay: 5200, disableOnInteraction: false, pauseOnMouseEnter: true }}
        className="relative z-[1] h-full min-h-[57rem] sm:min-h-[58rem] lg:min-h-dvh"
        effect="fade"
        loop={slidesToRender.length > 1}
        modules={[Autoplay, EffectFade]}
        speed={shouldReduceMotion ? 0 : 720}
      >
        {slidesToRender.map((slide, index) => (
          <SwiperSlide className="h-auto" key={slide.id}>
            <article className="relative flex min-h-[57rem] items-end overflow-hidden sm:min-h-[58rem] lg:min-h-dvh lg:items-center">
              <HeroSlideImage
                alt={slide.altText}
                preload={index < 2}
                src={slide.imageUrl}
              />
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(96deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.8)_56%,rgba(255,255,255,0.7)_100%),linear-gradient(0deg,rgba(255,255,255,0.46)_0%,rgba(255,255,255,0.18)_55%,rgba(255,255,255,0.34)_100%)]" />
            </article>
          </SwiperSlide>
        ))}
        </Swiper>
      </HeroCarouselBoundary>
      <LabAtmosphere />
      <LabSequence />
      <div className="pointer-events-none absolute inset-0 z-30 mx-auto grid min-h-[57rem] max-w-[1536px] grid-cols-1 px-5 pb-24 pt-52 sm:min-h-[58rem] sm:px-10 sm:pb-28 sm:pt-60 lg:min-h-dvh lg:grid-cols-[45%_55%] lg:px-20 lg:py-24" dir="ltr">
        <div className="pointer-events-auto self-start lg:col-start-1 lg:self-center lg:translate-y-24" dir="rtl">
          <HeroContent contactDetails={contactDetails} />
        </div>
      </div>
    </section>
  );
}

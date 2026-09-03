"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ScrollScene } from "@/components/motion/scroll-scene";
import { StaggerItem, StaggerScene } from "@/components/motion/stagger-scene";
import { useTranslations } from "@/components/i18n/dictionary-provider";

export type HeroContactDetails = {
  addresses: {
    address: string;
    id: string;
    title: string | null;
  }[];
  workingHours: {
    id: string;
    label: string;
  }[];
};

type Metric = {
  labelKey: string;
  prefix?: string;
  progress: number;
  suffix?: string;
  value: number;
};

const metrics: readonly Metric[] = [
  { labelKey: "stats.satisfaction", progress: 99, suffix: "%", value: 98 },
  { labelKey: "stats.homeService", progress: 100, suffix: "%", value: 100 },
  { labelKey: "stats.hygiene", progress: 100, suffix: "%", value: 100 },
] as const;

const numberFormatter = new Intl.NumberFormat("fa-IR");
const circleRadius = 44;
const circleCircumference = 2 * Math.PI * circleRadius;

function HeroClockIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
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

function HeroPinIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
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

function HeroContactDetails({ contactDetails }: { contactDetails: HeroContactDetails }) {
  const { t } = useTranslations();
  const hasAddresses = contactDetails.addresses.length > 0;
  const hasWorkingHours = contactDetails.workingHours.length > 0;

  if (!hasAddresses && !hasWorkingHours) return null;

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {hasAddresses ? (
        <div className="min-w-0 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
          <h2 className="flex items-center gap-2 text-xs font-extrabold text-slate-950">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-600">
              <HeroPinIcon />
            </span>
            {t("hero.address")}
          </h2>
          <ul className="mt-3 grid gap-2.5">
            {contactDetails.addresses.map((item) => (
              <li key={item.id}>
                <address className="text-xs font-medium leading-6 text-slate-700 not-italic" dir="auto">
                  {item.title ? (
                    <span className="mb-0.5 block font-extrabold text-slate-950">
                      {item.title}
                    </span>
                  ) : null}
                  {item.address}
                </address>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasWorkingHours ? (
        <div className="min-w-0 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
          <h2 className="flex items-center gap-2 text-xs font-extrabold text-slate-950">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-600">
              <HeroClockIcon />
            </span>
            {t("hero.workingHours")}
          </h2>
          <ul className="mt-3 grid gap-2.5">
            {contactDetails.workingHours.map((workingHour) => (
              <li className="text-xs font-semibold leading-6 text-slate-700" dir="auto" key={workingHour.id}>
                {workingHour.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function useCountUp({
  delay,
  isActive,
  shouldReduceMotion,
  target,
}: {
  delay: number;
  isActive: boolean;
  shouldReduceMotion: boolean | null;
  target: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    if (shouldReduceMotion) {
      const animationFrame = window.requestAnimationFrame(() => setCount(target));
      return () => window.cancelAnimationFrame(animationFrame);
    }

    let animationFrame = 0;
    const timer = window.setTimeout(() => {
      const startedAt = performance.now();
      const duration = 1_300;

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        setCount(Math.round(target * easedProgress));

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(tick);
        }
      };

      animationFrame = window.requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [delay, isActive, shouldReduceMotion, target]);

  return count;
}

function MetricPie({
  metric,
  index,
}: {
  metric: Metric;
  index: number;
}) {
  const metricRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslations();
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(metricRef, { amount: 0.6, once: true });
  const isActive = Boolean(shouldReduceMotion || isInView);
  const count = useCountUp({
    delay: index * 100,
    isActive,
    shouldReduceMotion,
    target: metric.value,
  });
  const completedOffset = circleCircumference * (1 - metric.progress / 100);
  const displayValue = `${metric.prefix ?? ""}${numberFormatter.format(count)}${metric.suffix ?? ""}`;

  return (
    <div className="flex justify-center" ref={metricRef}>
      <div className="relative grid aspect-square w-full max-w-[10rem] place-items-center sm:max-w-[12rem]">
        <svg
          aria-hidden="true"
          className="absolute inset-0 size-full -rotate-90"
          fill="none"
          viewBox="0 0 120 120"
        >
          <circle
            className="text-slate-200"
            cx="60"
            cy="60"
            r={circleRadius}
            stroke="currentColor"
            strokeWidth="8"
          />
          <motion.circle
            animate={{
              strokeDashoffset: isActive ? completedOffset : circleCircumference,
            }}
            className="text-teal-500"
            cx="60"
            cy="60"
            initial={{
              strokeDashoffset: shouldReduceMotion
                ? completedOffset
                : circleCircumference,
            }}
            r={circleRadius}
            stroke="currentColor"
            strokeDasharray={circleCircumference}
            strokeLinecap="round"
            strokeWidth="8"
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    delay: index * 0.1,
                    duration: 1.3,
                    ease: [0.16, 1, 0.3, 1],
                  }
            }
          />
        </svg>

        <div className="relative z-10 flex max-w-[82%] flex-col items-center text-center">
          <span
            aria-label={`${t(metric.labelKey)}: ${displayValue}`}
            className="whitespace-nowrap text-base font-black tracking-[-0.05em] text-teal-500 sm:text-2xl"
          >
            <bdi dir="ltr">{displayValue}</bdi>
          </span>
          <span className="mt-1 text-[9px] font-bold leading-3.5 text-slate-700 sm:text-xs sm:leading-5">
            {t(metric.labelKey)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function HeroContent({ contactDetails }: { contactDetails: HeroContactDetails }) {
  const { t } = useTranslations();

  return (
    <ScrollScene className="max-w-xl text-right" distance={30}>
      <StaggerScene>
        <StaggerItem>
          <span className="inline-flex rounded-full bg-white/75 px-4 py-2 text-sm font-bold text-slate-600 backdrop-blur-md">
            {t("hero.badge")}
          </span>
        </StaggerItem>

        <StaggerItem className="mt-7">
          <h1 className="text-[clamp(2.25rem,9vw,4.9rem)] font-black leading-[1.1] tracking-[-0.06em] text-slate-950 sm:text-[clamp(2.8rem,4.8vw,4.9rem)]">
            {t("hero.title")}
          </h1>
        </StaggerItem>

        <StaggerItem className="mt-7">
          <p className="max-w-lg text-base font-medium leading-9 text-slate-800 sm:text-lg sm:leading-9">
            {t("hero.description")}
          </p>
        </StaggerItem>

        <StaggerItem className="mt-7">
          <HeroContactDetails contactDetails={contactDetails} />
        </StaggerItem>

        <StaggerItem className="mt-8">
          <a
            className="inline-flex min-h-12 w-fit items-center justify-center gap-3 rounded-full bg-teal-500 px-6 py-3.5 text-base font-extrabold text-white shadow-[0_16px_34px_rgba(13,148,136,0.3)] transition hover:-translate-y-0.5 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
            href="#services"
          >
            {t("hero.cta")}
            <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5m7-7-7 7 7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </a>
        </StaggerItem>
      </StaggerScene>
    </ScrollScene>
  );
}

export function HeroStatistics() {
  const { t } = useTranslations();

  return (
    <ScrollScene distance={26}>
      <StaggerScene>
        <section
          aria-label={t("stats.label")}
          className="mx-auto max-w-3xl px-2 py-4 sm:px-6 sm:py-6"
        >
          <dl className="grid grid-cols-3 gap-1 sm:gap-6">
            {metrics.map((metric, index) => (
              <StaggerItem key={metric.labelKey}>
                <dt className="sr-only">{t(metric.labelKey)}</dt>
                <dd>
                  <MetricPie index={index} metric={metric} />
                </dd>
              </StaggerItem>
            ))}
          </dl>
        </section>
      </StaggerScene>
    </ScrollScene>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AtmosphereOrbs } from "@/components/decorative/atmosphere-orbs";
import { SidebarNavigation } from "@/components/navigation/sidebar-navigation";
import { SiteFooter } from "@/components/site-footer";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  description:
    "آشنایی با رویکرد کیفیت، تیم فنی و تعهد آزمایشگاه پاتولوژی پایش.",
  title: "درباره ما | آزمایشگاه پاتولوژی پایش",
};

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
    description: "پایش روزانه تجهیزات و آماده‌سازی دقیق پیش از شروع فرآیند.",
    icon: <EquipmentIcon />,
    title: "پیش از آزمایش",
  },
  {
    description: "کالیبراسیون منظم دستگاه‌ها و استفاده از کنترل‌های داخلی.",
    icon: <PrecisionIcon />,
    title: "حین انجام آزمایش",
  },
  {
    description: "ارزیابی خارجی کیفیت و بازبینی مستمر پیش از صدور پاسخ.",
    icon: <CheckIcon />,
    title: "پس از صدور پاسخ",
  },
];

function BrandLink() {
  return (
    <Link
      aria-label="بازگشت به صفحه نخست"
      className="inline-flex items-center gap-3 rounded-2xl outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-4"
      href="/"
    >
      <Image
        alt="لوگوی آزمایشگاه پاتولوژی پایش"
        className="size-12 object-contain"
        height={133}
        priority
        src="/payeshlab-logo.png"
        width={130}
      />
      <span className="text-right text-sm font-black leading-6 text-slate-950 sm:text-base">
        آزمایشگاه پاتولوژی پایش
      </span>
    </Link>
  );
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <main
      className="min-h-dvh overflow-x-hidden bg-[#f7fbfb] text-slate-950"
      id="about-page"
    >
      <SidebarNavigation />

      <header aria-hidden="true" className="hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <BrandLink />
          <nav
            aria-label="ناوبری درباره ما"
            className="flex shrink-0 items-center gap-1 sm:gap-2"
          >
            <Link
              className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-extrabold text-slate-700 transition hover:bg-teal-50 hover:text-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 sm:px-4"
              href="/"
            >
              صفحه نخست
            </Link>
            <Link
              className="hidden min-h-11 items-center rounded-xl px-4 text-sm font-extrabold text-teal-500 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 sm:inline-flex"
              href="/contact"
            >
              تماس با ما
            </Link>
          </nav>
        </div>
      </header>

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
              درباره آزمایشگاه پایش
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.2] tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl">
              دقت، کیفیت و اعتماد؛ در تمام مسیر پاسخ آزمایش
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
              در آزمایشگاه پاتولوژی پایش، هر مرحله با یک هدف روشن پیش می‌رود:
              ارائه نتیجه‌ای که پزشکان و بیماران بتوانند با اطمینان به آن تکیه
              کنند.
            </p>
            <a
              className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-teal-500 px-5 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(13,148,136,0.24)] transition hover:-translate-y-0.5 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
              href="#quality"
            >
              رویکرد کیفیت ما
            </a>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.25rem] border-8 border-white bg-slate-100 shadow-[0_28px_70px_rgba(15,23,42,0.17)]">
              <Image
                alt="نمای بیرونی و ورودی آزمایشگاه پاتولوژی پایش"
                className="object-cover object-center"
                fill
                priority
                sizes="(min-width: 1024px) 38vw, (min-width: 640px) 28rem, calc(100vw - 2.5rem)"
                src="/about/laboratory-entrance.jpg"
              />
            </div>
            <div className="absolute -bottom-5 -left-4 hidden max-w-[15rem] rounded-2xl border border-white bg-white/95 px-4 py-3 shadow-[0_16px_36px_rgba(15,23,42,0.12)] backdrop-blur sm:block">
              <p className="text-xs font-extrabold tracking-wide text-teal-500">
                آزمایشگاه پاتولوژی پایش
              </p>
              <p className="mt-1 text-sm font-bold text-slate-700">
                محیطی آرام، دقیق و حرفه‌ای
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-24 bg-white px-5 py-16 sm:px-10 sm:py-24 lg:px-20"
        id="quality"
      >
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-slate-100 shadow-[0_22px_52px_rgba(15,23,42,0.12)]">
              <Image
                alt="فضای داخلی آرام و مدرن آزمایشگاه پایش"
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
              کیفیت در هر مرحله
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">
              کنترل‌شده، پیوسته و قابل اتکا
            </h2>
            <p className="mt-5 text-sm font-medium leading-8 text-slate-600 sm:text-base">
              کنترل کیفیت در آزمایشگاه ما تنها به بررسی نتایج محدود نمی‌شود،
              بلکه تمامی مراحل پیش از آزمایش، حین انجام آزمایش و پس از صدور پاسخ
              را در بر می‌گیرد. پایش روزانه تجهیزات، کالیبراسیون منظم دستگاه‌ها،
              استفاده از کنترل‌های داخلی، مشارکت در برنامه‌های ارزیابی خارجی
              کیفیت و بازبینی مستمر فرآیندها، بخشی از اقدامات ما برای تضمین صحت
              و دقت نتایج است.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {qualitySteps.map((step) => (
                <article
                  className="rounded-2xl border border-slate-100 bg-[#f7fbfb] p-4"
                  key={step.title}
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-teal-100 text-teal-500">
                    {step.icon}
                  </span>
                  <h3 className="mt-4 text-sm font-black text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs font-medium leading-6 text-slate-600">
                    {step.description}
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
              دانش و تجربه
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] sm:text-4xl">
              تیم فنی متخصص
            </h2>
            <p className="mt-5 max-w-xl text-sm font-medium leading-8 text-slate-200 sm:text-base">
              سرمایه اصلی آزمایشگاه، تیم فنی آن است. حضور کارشناسان آموزش‌دیده،
              به‌روزرسانی مستمر دانش علمی، رعایت دقیق دستورالعمل‌های استاندارد و
              نظارت مستمر بر تمامی فرآیندها، موجب شده است که کیفیت خدمات در
              بالاترین سطح حفظ شود.
            </p>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/15">
              <Image
                alt="پذیرش و فضای داخلی آزمایشگاه پاتولوژی پایش"
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 42vw, calc(100vw - 2.5rem)"
                src="/about/laboratory-reception.jpg"
              />
            </div>
            <div className="absolute -bottom-4 -left-2 rounded-2xl bg-teal-500 px-4 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(0,0,0,0.25)] sm:-left-5">
              کیفیت، حاصل یک تیم هماهنگ
            </div>
          </div>
        </div>
      </section>

      <section className="bg-teal-500 px-5 py-16 text-white sm:px-10 sm:py-24 lg:px-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)] lg:items-end">
          <div>
            <span className="inline-flex rounded-full border border-white/35 bg-white/10 px-4 py-2 text-xs font-extrabold tracking-wide text-teal-50">
              برای هر پاسخ، یک تعهد
            </span>
            <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.05em] sm:text-4xl">
              تعهد ما
            </h2>
            <p className="mt-5 max-w-3xl text-sm font-medium leading-8 text-teal-50 sm:text-base">
              هدف ما تنها ارائه یک برگه پاسخ آزمایش نیست؛ بلکه ارائه نتایجی
              دقیق، قابل اعتماد و قابل استناد برای پزشکان و بیماران است. ما
              معتقدیم تشخیص صحیح، از یک فرآیند فنی دقیق و کنترل‌شده آغاز می‌شود
              و همین تعهد، مهم‌ترین ویژگی آزمایشگاه ماست.
            </p>
          </div>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 text-sm font-extrabold text-teal-500 shadow-[0_14px_28px_rgba(4,47,46,0.2)] transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            href="/contact"
          >
            ارتباط با آزمایشگاه
          </Link>
        </div>
      </section>
      <SiteFooter settings={settings} />
    </main>
  );
}

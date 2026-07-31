import Image from "next/image";
import Link from "next/link";
import { AtmosphereOrbs } from "@/components/decorative/atmosphere-orbs";
import { ScrollScene } from "@/components/motion/scroll-scene";

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
  return (
    <section
      aria-labelledby="home-sample-collection-heading"
      className="relative mt-16 overflow-hidden rounded-tr-[3rem] sm:mt-20"
      id="home-sample-collection"
    >
      <div className="relative grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <ScrollScene className="relative isolate flex flex-col justify-center overflow-hidden px-6 py-12 sm:px-10 sm:py-16 lg:order-2 lg:px-14 lg:py-20" distance={42}>
          <AtmosphereOrbs className="absolute -right-8 top-4 h-32 w-52 opacity-[0.42] sm:h-40 sm:w-64" scale={1.14} />
          <div className="relative z-10">
            <p className="flex items-center gap-3 text-xs font-extrabold tracking-[0.16em] text-teal-500">
              <span aria-hidden="true" className="h-px w-8 bg-teal-500" />
              خدمات در منزل
            </p>
            <h2
              className="mt-6 max-w-lg text-4xl font-black leading-[1.12] tracking-[-0.07em] text-slate-950 sm:text-5xl"
              id="home-sample-collection-heading"
            >
              نمونه‌گیری رایگان،
              <br />
              در آرامش خانه.
            </h2>
            <p className="mt-6 max-w-md text-sm font-medium leading-8 text-slate-600 sm:text-base">
              اگر رفت‌وآمد برای شما یا عزیزانتان دشوار است، هماهنگی نمونه‌گیری را از منزل انجام دهید؛ با همان دقت و احترامی که انتظار دارید.
            </p>

            <div className="mt-9 grid max-w-md gap-5 sm:grid-cols-2">
              <div>
                <span className="font-mono text-xs font-bold text-teal-500">01</span>
                <p className="mt-2 text-sm font-black text-slate-950">هماهنگی تلفنی</p>
                <p className="mt-1 text-xs font-medium leading-6 text-slate-500">زمان مناسب‌تان را مشخص کنید.</p>
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-teal-500">02</span>
                <p className="mt-2 text-sm font-black text-slate-950">مراجعه به آدرس شما</p>
                <p className="mt-1 text-xs font-medium leading-6 text-slate-500">بدون نیاز به مراجعه حضوری.</p>
              </div>
            </div>

            <Link
              className="mt-10 inline-flex min-h-12 w-fit items-center gap-3 rounded-[1.75rem] bg-teal-500 px-5 text-sm font-extrabold text-white transition duration-200 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
              href="/contact"
            >
              هماهنگی نمونه‌گیری در منزل
              <ArrowUpLeftIcon />
            </Link>
          </div>
        </ScrollScene>

        <ScrollScene className="relative min-h-[22rem] sm:min-h-[30rem] lg:order-1 lg:min-h-full" direction="down" distance={42}>
          <Image
            alt="نمونه‌گیری خون از سالمند در منزل توسط کارشناس آزمایشگاه"
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

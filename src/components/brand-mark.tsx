import Image from "next/image";
import Link from "next/link";

type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <Link
      aria-label="آزمایشگاه پاتولوژی پایش اکسین"
      className={`group inline-flex items-center gap-3 text-right ${className}`}
      href="/"
    >
      <Image
        alt="لوگوی آزمایشگاه پاتولوژی پایش اکسین"
        className="h-14 w-14 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105"
        height={133}
        priority
        src="/payeshlab-logo.png"
        width={130}
      />

      <span className="grid min-w-0 leading-tight">
        <span className="whitespace-nowrap text-[11px] font-extrabold tracking-[-0.04em] text-slate-950 sm:text-base sm:tracking-[-0.03em]">
          آزمایشگاه پاتولوژی پایش اکسین
        </span>
        <span className="mt-0.5 whitespace-nowrap text-[10px] font-medium text-slate-500 sm:mt-1 sm:text-xs">
          دقت امروز، سلامت فردا
        </span>
      </span>
    </Link>
  );
}

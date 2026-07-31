"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { signOutAdmin } from "@/app/admin/login/actions";
import { ArticleEditor } from "@/components/admin/article-editor";
import {
  AnnouncementManager,
  type ManagedAnnouncement,
} from "@/components/admin/announcement-manager";
import { InsuranceManager } from "@/components/admin/insurance-manager";
import { ServiceManager } from "@/components/admin/lab-department-manager";
import { SlideshowManager } from "@/components/admin/slideshow-manager";
import { SettingsManager } from "@/components/admin/settings-manager";
import { BrandMark } from "@/components/brand-mark";
import type { ManagedArticle } from "@/components/admin/article-editor";
import type { InsurancePartner } from "@/lib/insurance-data";
import type { LabDepartmentData } from "@/lib/lab-department-data";
import type { SlideshowSlideData } from "@/lib/slideshow-data";
import type { SiteSettingsData } from "@/lib/site-settings";

const navigationItems = [
  { id: "dashboard", label: "داشبورد" },
  { id: "articles", label: "مدیریت مقاله" },
  { id: "news", label: "مدیریت اخبار" },
  { id: "services", label: "مدیریت خدمات" },
  { id: "announcements", label: "مدیریت اطلاعیه‌ها" },
  { id: "insurances", label: "مدیریت بیمه‌ها" },
  { id: "slideshow", label: "مدیریت اسلایدشو" },
  { id: "settings", label: "تنظیمات سایت" },
] as const;

type NavigationId = (typeof navigationItems)[number]["id"];

type DashboardInsurance = InsurancePartner & {
  isActive: boolean;
  updatedAt: string;
};
type DashboardDepartment = LabDepartmentData & {
  isActive: boolean;
  updatedAt: string;
};
type DashboardSlide = SlideshowSlideData & {
  isActive: boolean;
  updatedAt: string;
};
type DashboardActivity = {
  id: string;
  label: string;
  target: NavigationId;
  title: string;
  updatedAt: string;
};

function formatNumber(value: number) {
  return value.toLocaleString("fa-IR");
}

function formatActivityDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function MenuIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M11 17H19M5 12H19M11 7H19"
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function NavigationIcon({ id }: { id: NavigationId }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: "1.8",
  };

  if (id === "dashboard") {
    return (
      <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
        <path
          {...common}
          d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"
        />
      </svg>
    );
  }
  if (id === "articles") {
    return (
      <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
        <path
          {...common}
          d="M5 3.5h10l4 4V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-15a1.5 1.5 0 0 1 1-1.5Z"
        />
        <path {...common} d="M14 3.5V8h5M8 12h8M8 16h6" />
      </svg>
    );
  }
  if (id === "news") {
    return (
      <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
        <path {...common} d="M4 5h16v14H4zM8 9h8M8 13h8M8 17h5" />
      </svg>
    );
  }
  if (id === "services") {
    return (
      <svg
        aria-hidden="true"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          {...common}
          d="M9 3h6M10 3v6.1L5.6 17a2.5 2.5 0 0 0 2.2 3.7h8.4a2.5 2.5 0 0 0 2.2-3.7L14 9.1V3"
        />
        <path {...common} d="M8.5 15h7" />
      </svg>
    );
  }
  if (id === "insurances") {
    return (
      <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
        <path
          {...common}
          d="M12 3.5 19 6v5.1c0 4.3-2.8 7.9-7 9.4-4.2-1.5-7-5.1-7-9.4V6l7-2.5Z"
        />
        <path {...common} d="m9.25 12 1.75 1.75 3.75-4" />
      </svg>
    );
  }
  if (id === "slideshow") {
    return (
      <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
        <rect {...common} height="14" rx="2" width="18" x="3" y="5" />
        <path {...common} d="m7 15 3-3 2.5 2.5 2-2L18 16M8 9h.01" />
      </svg>
    );
  }
  if (id === "settings") {
    return (
      <svg
        aria-hidden="true"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          {...common}
          d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.2 2.2-.1-.1a1.7 1.7 0 0 0-1.9-.3l-.6.3a1.7 1.7 0 0 0-1 1.5v.2h-4v-.2a1.7 1.7 0 0 0-1-1.5l-.6-.3a1.7 1.7 0 0 0-1.9.3l-.1.1-2.2-2.2.1-.1a1.7 1.7 0 0 0 .3-1.9l-.3-.6a1.7 1.7 0 0 0-1.5-1H2.6v-4h.2a1.7 1.7 0 0 0 1.5-1l.3-.6a1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.2-2.2.1.1a1.7 1.7 0 0 0 1.9.3l.6-.3a1.7 1.7 0 0 0 1-1.5v-.2h4v.2a1.7 1.7 0 0 0 1 1.5l.6.3a1.7 1.7 0 0 0 1.9-.3l.1-.1 2.2 2.2-.1.1a1.7 1.7 0 0 0-.3 1.9l.3.6a1.7 1.7 0 0 0 1.5 1h.2v4h-.2a1.7 1.7 0 0 0-1.5 1l-.3.6Z"
        />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path {...common} d="M6 3h12v18l-6-3-6 3z" />
    </svg>
  );
}

type SidebarContentProps = {
  activeItem: NavigationId;
  email: string;
  onNavigate: (id: NavigationId) => void;
  onClose?: () => void;
};

function SidebarContent({
  activeItem,
  email,
  onClose,
  onNavigate,
}: SidebarContentProps) {
  return (
    <div className="flex h-full min-h-0 flex-col p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-5">
        <BrandMark />
        {onClose && (
          <button
            aria-label="بستن منو"
            className="grid size-12 place-items-center rounded-2xl text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="size-5" />
          </button>
        )}
      </div>

      <nav aria-label="ناوبری مدیریت" className="mt-6 grid gap-1">
        <p className="px-3 pb-2 text-xs font-extrabold tracking-wide text-slate-500">
          مدیریت محتوا
        </p>
        {navigationItems.map((item) => {
          const isActive = item.id === activeItem;
          return (
            <button
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-2xl px-3 text-right text-sm font-extrabold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
                isActive
                  ? "bg-teal-500 text-white shadow-[0_10px_20px_rgba(13,148,136,0.18)]"
                  : "text-slate-700 hover:bg-teal-50 hover:text-teal-500"
              }`}
              key={item.id}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              <NavigationIcon id={item.id} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-5">
        <p className="truncate px-2 text-xs font-bold text-slate-500" dir="ltr">
          {email}
        </p>
        <form action={signOutAdmin} className="mt-3">
          <button
            className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-extrabold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
            type="submit"
          >
            خروج امن
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminDashboard({
  announcements,
  articles,
  departments,
  email,
  insurances,
  settings,
  slides,
}: {
  announcements: ManagedAnnouncement[];
  articles: Array<ManagedArticle & { type: "ARTICLE" | "NEWS" }>;
  departments: DashboardDepartment[];
  email: string;
  insurances: DashboardInsurance[];
  settings: SiteSettingsData;
  slides: DashboardSlide[];
}) {
  const [activeItem, setActiveItem] = useState<NavigationId>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const activeLabel =
    navigationItems.find((item) => item.id === activeItem)?.label ?? "داشبورد";
  const transition = {
    duration: shouldReduceMotion ? 0 : 0.22,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  const navigate = (id: NavigationId) => {
    setActiveItem(id);
    setIsMobileSidebarOpen(false);
  };

  const articleItems = articles.filter((article) => article.type === "ARTICLE");
  const newsItems = articles.filter((article) => article.type === "NEWS");
  const publishedArticles = articleItems.filter(
    (article) => article.status === "PUBLISHED",
  ).length;
  const publishedNews = newsItems.filter(
    (article) => article.status === "PUBLISHED",
  ).length;
  const activeDepartments = departments.filter(
    (department) => department.isActive,
  ).length;
  const activeAnnouncements = announcements.filter(
    (announcement) => announcement.isActive,
  ).length;
  const activeInsurances = insurances.filter(
    (insurance) => insurance.isActive,
  ).length;
  const activeSlides = slides.filter((slide) => slide.isActive).length;
  const overviewCards: Array<{
    detail: string;
    label: string;
    target: NavigationId;
    tone: string;
    value: number;
  }> = [
    {
      detail: `${formatNumber(publishedArticles)} منتشرشده`,
      label: "مقالات",
      target: "articles",
      tone: "bg-cyan-50 text-cyan-800",
      value: articleItems.length,
    },
    {
      detail: `${formatNumber(publishedNews)} منتشرشده`,
      label: "اخبار",
      target: "news",
      tone: "bg-teal-50 text-teal-500",
      value: newsItems.length,
    },
    {
      detail: `${formatNumber(activeDepartments)} فعال`,
      label: "خدمات",
      target: "services",
      tone: "bg-emerald-50 text-emerald-800",
      value: departments.length,
    },
    {
      detail: `${formatNumber(activeAnnouncements)} فعال`,
      label: "اطلاعیه‌ها",
      target: "announcements",
      tone: "bg-slate-100 text-slate-800",
      value: announcements.length,
    },
    {
      detail: `${formatNumber(activeInsurances)} فعال`,
      label: "بیمه‌ها",
      target: "insurances",
      tone: "bg-cyan-50 text-cyan-800",
      value: insurances.length,
    },
    {
      detail: `${formatNumber(activeSlides)} فعال`,
      label: "اسلایدها",
      target: "slideshow",
      tone: "bg-teal-50 text-teal-500",
      value: slides.length,
    },
  ];
  const readinessChecks = [
    {
      complete: Boolean(settings.laboratoryName && settings.shortDescription),
      label: "هویت آزمایشگاه",
    },
    {
      complete: settings.phoneNumbers.length > 0 && settings.addresses.length > 0,
      label: "راه‌های ارتباطی",
    },
    {
      complete: settings.workingHours.length > 0,
      label: "ساعات کاری",
    },
    {
      complete: activeSlides > 0 && activeDepartments > 0,
      label: "نمای صفحهٔ نخست",
    },
  ];
  const completedReadinessChecks = readinessChecks.filter(
    (check) => check.complete,
  ).length;
  const recentActivity: DashboardActivity[] = [
    ...articles.map((article) => ({
      id: `article-${article.id}`,
      label: article.type === "NEWS" ? "خبر به‌روزرسانی شد" : "مقاله به‌روزرسانی شد",
      target: (article.type === "NEWS" ? "news" : "articles") as NavigationId,
      title: article.title,
      updatedAt: article.updatedAt,
    })),
    ...announcements.map((announcement) => ({
      id: `announcement-${announcement.id}`,
      label: announcement.isActive ? "اطلاعیه فعال شد" : "اطلاعیه ویرایش شد",
      target: "announcements" as const,
      title: announcement.title,
      updatedAt: announcement.updatedAt,
    })),
    ...departments.map((department) => ({
      id: `department-${department.id}`,
      label: "خدمت آزمایشگاه به‌روزرسانی شد",
      target: "services" as const,
      title: department.title,
      updatedAt: department.updatedAt,
    })),
    ...insurances.map((insurance) => ({
      id: `insurance-${insurance.id}`,
      label: "بیمه به‌روزرسانی شد",
      target: "insurances" as const,
      title: insurance.name,
      updatedAt: insurance.updatedAt,
    })),
    ...slides.map((slide) => ({
      id: `slide-${slide.id}`,
      label: "اسلاید صفحهٔ نخست به‌روزرسانی شد",
      target: "slideshow" as const,
      title: slide.title ?? "اسلاید بدون عنوان",
      updatedAt: slide.updatedAt,
    })),
  ]
    .sort(
      (first, second) =>
        new Date(second.updatedAt).getTime() -
        new Date(first.updatedAt).getTime(),
    )
    .slice(0, 6);

  return (
    <main className="min-h-dvh bg-[#f4fbfa] text-slate-950 lg:pl-72">
      <aside
        aria-label="ناوبری مدیریت"
        className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white/95 shadow-[18px_0_50px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:block"
      >
        <SidebarContent
          activeItem={activeItem}
          email={email}
          onNavigate={navigate}
        />
      </aside>

      <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-slate-200/80 bg-[#f4fbfa]/90 px-4 backdrop-blur sm:px-6 lg:px-10">
        <div>
          <p className="text-xs font-extrabold tracking-wide text-teal-500">
            پنل مدیریت
          </p>
          <h1 className="mt-1 text-xl font-black tracking-[-0.04em] text-slate-950">
            {activeLabel}
          </h1>
        </div>
        <button
          aria-controls="admin-mobile-sidebar"
          aria-expanded={isMobileSidebarOpen}
          aria-label="باز کردن منوی مدیریت"
          className="grid size-14 place-items-center rounded-2xl text-slate-700 transition duration-200 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(true)}
          type="button"
        >
          <MenuIcon className="size-6" />
        </button>
      </header>

      <div className="p-4 sm:p-6 lg:p-10">
        {activeItem === "articles" ? (
          <ArticleEditor
            contentType="ARTICLE"
            items={articles.filter((article) => article.type === "ARTICLE")}
          />
        ) : activeItem === "news" ? (
          <ArticleEditor
            contentType="NEWS"
            items={articles.filter((article) => article.type === "NEWS")}
          />
        ) : activeItem === "announcements" ? (
          <AnnouncementManager announcements={announcements} />
        ) : activeItem === "services" ? (
          <ServiceManager departments={departments} />
        ) : activeItem === "insurances" ? (
          <InsuranceManager insurances={insurances} />
        ) : activeItem === "slideshow" ? (
          <SlideshowManager slides={slides} />
        ) : activeItem === "settings" ? (
          <SettingsManager settings={settings} />
        ) : (
          <>
            <section className="rounded-[1.75rem] border border-teal-100 bg-[linear-gradient(120deg,#ffffff,rgba(240,253,250,0.86))] p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <span className="inline-flex rounded-full bg-teal-500/10 px-3 py-1.5 text-xs font-extrabold text-teal-500">
                    نمای زندهٔ سامانه
                  </span>
                  <h2 className="mt-4 text-2xl font-black tracking-[-0.05em] text-slate-950 sm:text-3xl">
                    {settings.laboratoryName
                      ? `داشبورد ${settings.laboratoryName}`
                      : "داشبورد مدیریت آزمایشگاه"}
                  </h2>
                  <p className="mt-3 text-sm font-medium leading-7 text-slate-600 sm:text-base">
                    {formatNumber(
                      articles.length +
                        announcements.length +
                        departments.length +
                        insurances.length +
                        slides.length,
                    )} {" "}
                    آیتم قابل‌مدیریت در سامانه ثبت شده است. وضعیت انتشار و
                    آخرین تغییرات را از همین‌جا دنبال کنید.
                  </p>
                </div>
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-white px-4 text-sm font-extrabold text-teal-500 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500"
                  onClick={() => navigate("settings")}
                  type="button"
                >
                  آمادگی سایت: {formatNumber(completedReadinessChecks)} از {formatNumber(readinessChecks.length)}
                </button>
              </div>
            </section>

            <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {overviewCards.map((card) => (
                <button
                  aria-label={`مدیریت ${card.label}`}
                  className="group rounded-[1.5rem] border border-white bg-white p-5 text-right shadow-[0_14px_32px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-teal-100 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500"
                  key={card.label}
                  onClick={() => navigate(card.target)}
                  type="button"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex rounded-xl px-3 py-1.5 text-xs font-extrabold ${card.tone}`}
                    >
                      {card.label}
                    </span>
                    <span className="text-xs font-extrabold text-slate-400 transition group-hover:text-teal-500">
                      مدیریت ←
                    </span>
                  </span>
                  <p className="mt-5 text-3xl font-black tracking-[-0.05em] text-slate-950">
                    {formatNumber(card.value)}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {card.detail}
                  </p>
                </button>
              ))}
            </section>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.85fr)]">
              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-extrabold tracking-wide text-teal-500">
                      به‌روزرسانی‌های واقعی
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">
                      فعالیت‌های اخیر
                    </h2>
                  </div>
                  <span className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-500">
                    <svg
                      aria-hidden="true"
                      className="size-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 7v5l3 2"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </span>
                </div>

                {recentActivity.length > 0 ? (
                  <div className="mt-5 grid gap-2">
                    {recentActivity.map((activity) => (
                      <button
                        className="flex min-h-16 items-center gap-3 rounded-2xl px-3 text-right transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                        key={activity.id}
                        onClick={() => navigate(activity.target)}
                        type="button"
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                          <NavigationIcon id={activity.target} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-bold text-slate-500">
                            {activity.label}
                          </span>
                          <span className="mt-1 block truncate text-sm font-black text-slate-900">
                            {activity.title}
                          </span>
                        </span>
                        <time
                          className="shrink-0 text-xs font-bold text-slate-400"
                          dateTime={activity.updatedAt}
                        >
                          {formatActivityDate(activity.updatedAt)}
                        </time>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl bg-slate-50 px-5 py-8 text-center">
                    <p className="text-sm font-bold text-slate-600">
                      هنوز فعالیتی برای نمایش وجود ندارد.
                    </p>
                    <button
                      className="mt-3 text-sm font-extrabold text-teal-500 transition hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-500"
                      onClick={() => navigate("articles")}
                      type="button"
                    >
                      اولین مقاله را اضافه کنید
                    </button>
                  </div>
                )}
              </section>

              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)] sm:p-7">
                <p className="text-xs font-extrabold tracking-wide text-teal-500">
                  کنترل سریع
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  آمادگی انتشار
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                  بخش‌های ضروری سایت را پیش از انتشار بررسی کنید.
                </p>
                <div className="mt-5 grid gap-2">
                  {readinessChecks.map((check) => (
                    <div
                      className="flex min-h-12 items-center gap-3 rounded-xl bg-slate-50 px-3"
                      key={check.label}
                    >
                      <span
                        aria-hidden="true"
                        className={`grid size-6 shrink-0 place-items-center rounded-full ${check.complete ? "bg-teal-500 text-white" : "border border-slate-300 bg-white text-slate-300"}`}
                      >
                        {check.complete ? (
                          <svg className="size-3.5" fill="none" viewBox="0 0 24 24">
                            <path
                              d="m5.5 12.5 4 4 9-9"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                            />
                          </svg>
                        ) : null}
                      </span>
                      <span className="text-sm font-extrabold text-slate-700">
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  className="mt-5 inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-extrabold text-teal-500 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                  onClick={() => navigate("settings")}
                  type="button"
                >
                  تکمیل تنظیمات سایت ←
                </button>
              </section>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 lg:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={transition}
          >
            <button
              aria-label="بستن منو"
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]"
              onClick={() => setIsMobileSidebarOpen(false)}
              type="button"
            />
            <motion.aside
              animate={{ x: 0 }}
              aria-label="منوی مدیریت"
              aria-modal="true"
              className="absolute inset-y-0 left-0 w-[min(21.5rem,calc(100vw-1.25rem))] border-r border-slate-200 bg-white shadow-[20px_0_60px_rgba(15,23,42,0.22)]"
              exit={{ x: "-100%" }}
              id="admin-mobile-sidebar"
              initial={{ x: "-100%" }}
              role="dialog"
              transition={transition}
            >
              <SidebarContent
                activeItem={activeItem}
                email={email}
                onClose={() => setIsMobileSidebarOpen(false)}
                onNavigate={navigate}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

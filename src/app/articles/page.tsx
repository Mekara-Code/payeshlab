import { ArticlesMagazineHero } from "@/components/articles/articles-magazine-hero";
import { PayeshArticles } from "@/components/home/payesh-articles";
import { SidebarNavigation } from "@/components/navigation/sidebar-navigation";
import { SiteFooter } from "@/components/site-footer";
import { getPublishedArticles } from "@/lib/public-articles";
import { getSiteSettings } from "@/lib/site-settings";

export default async function ArticlesPage() {
  const [articles, settings] = await Promise.all([
    getPublishedArticles(48),
    getSiteSettings(),
  ]);
  const articleCount = new Intl.NumberFormat("fa-IR").format(articles.length);

  return (
    <main className="min-h-dvh bg-[#f7fbfb] text-slate-950">
      <SidebarNavigation />
      <h1 className="sr-only">مجلهٔ پایش</h1>

      <ArticlesMagazineHero articles={articles.slice(0, 5)} />

      <section
        aria-labelledby="magazine-overview-title"
        className="bg-white px-5 py-14 sm:px-10 sm:py-20 lg:px-20 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
          <div>
            <span className="inline-flex rounded-full bg-teal-500/10 px-4 py-2 text-sm font-extrabold text-teal-500">
              دانش برای سلامت
            </span>
            <h2
              className="mt-5 max-w-xl text-3xl font-black leading-[1.3] tracking-[-0.055em] text-slate-950 sm:text-4xl"
              id="magazine-overview-title"
            >
              برای انتخاب‌های آگاهانه‌تر، همراه شما هستیم.
            </h2>
            <p className="mt-5 max-w-xl text-sm font-medium leading-8 text-slate-600 sm:text-base">
              در مجلهٔ پایش، نکات کاربردی آزمایشگاهی، راهنمای آمادگی پیش از
              آزمایش و اطلاعاتی شفاف برای مراقبت بهتر از سلامت را مرور
              می‌کنیم.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-tr-[2.5rem] bg-teal-50 p-5 sm:p-6">
              <span className="font-mono text-xs font-bold text-teal-500">01</span>
              <h3 className="mt-7 text-base font-black text-slate-950">
                محتوای کاربردی
              </h3>
              <p className="mt-2 text-xs font-medium leading-6 text-slate-600">
                پاسخ‌های روشن برای پرسش‌های رایج پیش از مراجعه.
              </p>
            </article>
            <article className="rounded-tl-[2.5rem] bg-slate-950 p-5 text-white sm:p-6">
              <span className="font-mono text-xs font-bold text-teal-200">02</span>
              <h3 className="mt-7 text-base font-black">نگاه تخصصی</h3>
              <p className="mt-2 text-xs font-medium leading-6 text-slate-300">
                مرور موضوعات سلامت با زبانی دقیق و قابل‌فهم.
              </p>
            </article>
            <article className="rounded-bl-[2.5rem] bg-teal-500 p-5 text-white sm:p-6">
              <span className="font-mono text-xs font-bold text-teal-100">03</span>
              <h3 className="mt-7 text-base font-black">آرشیو مجله</h3>
              <p className="mt-2 text-xs font-medium leading-6 text-teal-50">
                {articleCount} مقاله برای همراهی در مسیر سلامت.
              </p>
            </article>
          </div>
        </div>
      </section>

      <PayeshArticles
        articleTitleOrbs
        articles={articles}
        maxArticles={articles.length}
        showAllLink={false}
        title="همه مقاله‌های مجلهٔ پایش"
      />
      <SiteFooter settings={settings} />
    </main>
  );
}

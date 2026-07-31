export type NewsItem = {
  excerpt: string;
  id: string;
  imageUrl: string | null;
  publishedAt: string;
  title: string;
};

export type AnnouncementItem = {
  date: string;
  description: string;
  id: string;
  title: string;
};

export const defaultAnnouncements: AnnouncementItem[] = [
  {
    date: "2026-07-27T00:00:00.000Z",
    description: "ساعت پذیرش و نمونه‌گیری در روزهای کاری به‌روزرسانی شده است. برای جلوگیری از انتظار، لطفاً پیش از مراجعه از طریق کانال‌های ارتباطی آزمایشگاه از زمان دقیق خدمت موردنظر خود مطمئن شوید.",
    id: "sample-announcement-hours",
    title: "به‌روزرسانی ساعت پذیرش و نمونه‌گیری آزمایشگاه",
  },
  {
    date: "2026-07-23T00:00:00.000Z",
    description: "راهنمای پذیرش بیمه‌های طرف قرارداد، مدارک موردنیاز و شرایط استفاده از پوشش بیمه‌ای به‌روزرسانی شده است. لطفاً هنگام مراجعه، کارت بیمه و مدرک شناسایی معتبر خود را همراه داشته باشید.",
    id: "sample-announcement-insurance",
    title: "راهنمای جدید پذیرش بیمه‌های طرف قرارداد منتشر شد",
  },
  {
    date: "2026-07-19T00:00:00.000Z",
    description: "سامانه جوابدهی آنلاین در روزهای تعطیل نیز برای مشاهده نتایج آماده استفاده است. دسترسی به پاسخ‌ها تنها با اطلاعات هویتی ثبت‌شده در زمان پذیرش امکان‌پذیر خواهد بود.",
    id: "sample-announcement-online-results",
    title: "پاسخ‌دهی آنلاین در روزهای تعطیل فعال است",
  },
];

export const defaultNews: NewsItem[] = [
  {
    excerpt: "چطور با آمادگی درست، نتیجه‌ای دقیق‌تر و قابل‌اعتمادتر از آزمایش خود دریافت کنیم.",
    id: "sample-news-preparation",
    imageUrl: "/background-hq.png",
    publishedAt: "2026-07-25T00:00:00.000Z",
    title: "راهنمای آمادگی پیش از انجام آزمایش‌های تخصصی",
  },
  {
    excerpt: "نگاهی کوتاه به مسیر کنترل کیفیتی که در تمام مراحل پذیرش تا گزارش نهایی دنبال می‌شود.",
    id: "sample-news-quality",
    imageUrl: "/background.png",
    publishedAt: "2026-07-18T00:00:00.000Z",
    title: "کیفیت؛ تعهد همیشگی در آزمایشگاه پایش",
  },
  {
    excerpt: "با چند نکته ساده، زمان پذیرش خود را کوتاه‌تر و دریافت پاسخ را آسان‌تر کنید.",
    id: "sample-news-online-results",
    imageUrl: "/background-hq.png",
    publishedAt: "2026-07-12T00:00:00.000Z",
    title: "دسترسی سریع و امن به جواب آزمایش به‌صورت آنلاین",
  },
];

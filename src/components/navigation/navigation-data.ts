export const navigationItems = [
  { href: "/", labelKey: "navigation.home" },
  { href: "/#services", labelKey: "navigation.services" },
  { href: "/#news-and-announcements", labelKey: "navigation.news" },
  { href: "/#articles", labelKey: "navigation.journal" },
  { href: "/tests", labelKey: "navigation.tests" },
  { href: "/gallery", labelKey: "navigation.gallery" },
  { href: "/about", labelKey: "navigation.about" },
  { href: "/contact", labelKey: "navigation.contact" },
] as const;

/** Patient results are the only online results service for now, so the header links straight to it. */
export const onlineAnswersHref = "/online-answers/patients";

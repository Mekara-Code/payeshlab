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

export const onlineAnswerItems = [
  { href: "#online-answers-patients", labelKey: "navigation.onlineAnswersPatients" },
  { href: "#online-answers-tests", labelKey: "navigation.onlineAnswersTests" },
  { href: "#online-answers-doctors", labelKey: "navigation.onlineAnswersDoctors" },
  {
    href: "#online-answers-partners",
    labelKey: "navigation.onlineAnswersPartners",
  },
] as const;

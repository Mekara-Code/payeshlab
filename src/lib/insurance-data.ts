export type InsurancePartner = {
  id: string;
  isActive?: boolean;
  logoUrl: string | null;
  name: string;
  slug: string;
  sortOrder: number;
};

export const defaultInsurances: InsurancePartner[] = [
  { id: "insurance-kosar", name: "بیمه کوثر", slug: "kosar-insurance", logoUrl: "/insurance-logos/kosar.webp", sortOrder: 10 },
  { id: "insurance-iran-assistance", name: "کمک رسان ایران", slug: "iran-assistance", logoUrl: "/insurance-logos/iran-assistance.png", sortOrder: 20 },
  { id: "insurance-novin", name: "بیمه نوین", slug: "novin-insurance", logoUrl: "/insurance-logos/novin.webp", sortOrder: 30 },
  { id: "insurance-iran", name: "بیمه ایران", slug: "iran-insurance", logoUrl: "/insurance-logos/iran.webp", sortOrder: 40 },
  { id: "insurance-asia", name: "بیمه آسیا", slug: "asia-insurance", logoUrl: "/insurance-logos/asia.webp", sortOrder: 50 },
  { id: "insurance-alborz", name: "بیمه البرز", slug: "alborz-insurance", logoUrl: "/insurance-logos/alborz.webp", sortOrder: 60 },
  { id: "insurance-dana", name: "بیمه دانا", slug: "dana-insurance", logoUrl: "/insurance-logos/dana.webp", sortOrder: 70 },
  { id: "insurance-dey", name: "بیمه دی", slug: "dey-insurance", logoUrl: "/insurance-logos/dey.webp", sortOrder: 80 },
  { id: "insurance-social-security", name: "بیمه تامین اجتماعی", slug: "social-security", logoUrl: "/insurance-logos/social-security.webp", sortOrder: 90 },
];

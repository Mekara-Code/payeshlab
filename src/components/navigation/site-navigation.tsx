import { getSelectedContentLocale } from "@/lib/content-locale-server";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/dictionaries/types";
import { defaultInsurances } from "@/lib/insurance-data";
import { getPrisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { SidebarNavigation, type SocialLink } from "./sidebar-navigation";

async function getInsuranceOptions() {
  try {
    const insurances = await getPrisma().insurance.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { name: true },
      where: { isActive: true },
    });

    if (insurances.length > 0) {
      return insurances.map((insurance) => insurance.name);
    }
  } catch {
    // The navigation still renders with the bundled insurance list.
  }

  return defaultInsurances.map((insurance) => insurance.name);
}

export async function SiteNavigation() {
  const [locale, settings, insuranceOptions] = await Promise.all([
    getSelectedContentLocale(),
    getSiteSettings(),
    getInsuranceOptions(),
  ]);
  const dictionary = getDictionary(locale);
  const t = (key: string) => translate(dictionary, key);
  const socialLinks = [
    settings.instagramUrl
      ? {
          href: settings.instagramUrl,
          kind: "instagram" as const,
          label: t("footer.socialInstagram"),
        }
      : null,
    settings.whatsappUrl
      ? {
          href: settings.whatsappUrl,
          kind: "whatsapp" as const,
          label: t("footer.socialWhatsapp"),
        }
      : null,
    settings.rubikaUrl
      ? {
          href: settings.rubikaUrl,
          kind: "rubika" as const,
          label: t("footer.socialRubika"),
        }
      : null,
    settings.eitaaUrl
      ? {
          href: settings.eitaaUrl,
          kind: "eitaa" as const,
          label: t("footer.socialEitaa"),
        }
      : null,
  ].filter((socialLink): socialLink is SocialLink => socialLink !== null);

  return (
    <SidebarNavigation
      insuranceOptions={insuranceOptions}
      laboratoryName={settings.laboratoryName}
      locale={locale}
      socialLinks={socialLinks}
    />
  );
}

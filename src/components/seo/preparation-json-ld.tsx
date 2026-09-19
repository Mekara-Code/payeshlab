import type { PublicArticle, PublicArticleDetail } from "@/lib/public-articles";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/seo";

const publisherName = "آزمایشگاه پاتولوژی پایش اکسین";

/** `<` is escaped so the payload can never close the surrounding script tag. */
function serializeJsonLd(value: Record<string, unknown>) {
  return JSON.stringify(value).replace(/</g, "\u003c");
}

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      type="application/ld+json"
    />
  );
}

export function preparationUrl(slug: string) {
  return new URL(
    `/test-preparation/${encodeURIComponent(slug)}`,
    getSiteUrl(),
  ).toString();
}

export function preparationListUrl(page: number) {
  return new URL(
    page > 1 ? `/test-preparation/page/${page}` : "/test-preparation",
    getSiteUrl(),
  ).toString();
}

function breadcrumbList(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: item.url,
      name: item.name,
      position: index + 1,
    })),
  };
}

const publisher = {
  "@type": "Organization",
  logo: { "@type": "ImageObject", url: toAbsoluteUrl("/payeshlab-logo.png") },
  name: publisherName,
};

/**
 * A single guide: `MedicalWebPage` describes the page itself while the
 * `Article` node carries the authorship and dates Google shows in results.
 */
export function PreparationJsonLd({
  homeLabel,
  listLabel,
  preparation,
}: {
  homeLabel: string;
  listLabel: string;
  preparation: PublicArticleDetail;
}) {
  const url = preparationUrl(preparation.slug);
  const image = toAbsoluteUrl(preparation.imageUrl ?? "/background-hq.png");
  // An empty string would be published as a blank description, so drop the key instead.
  const description = preparation.metaDescription || preparation.excerpt || undefined;

  return (
    <>
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          about: { "@type": "MedicalTest", name: preparation.title },
          audience: { "@type": "Patient" },
          dateModified: preparation.publishedAt,
          datePublished: preparation.publishedAt,
          description,
          headline: preparation.title,
          image: [image],
          inLanguage: "fa-IR",
          keywords: preparation.tags.join(", ") || undefined,
          mainEntityOfPage: { "@id": url, "@type": "WebPage" },
          name: preparation.title,
          publisher,
          url,
        }}
      />
      <JsonLdScript
        data={breadcrumbList([
          { name: homeLabel, url: new URL("/", getSiteUrl()).toString() },
          { name: listLabel, url: preparationListUrl(1) },
          { name: preparation.title, url },
        ])}
      />
    </>
  );
}

/** The archive: a `CollectionPage` whose `ItemList` names the guides on this page. */
export function PreparationListJsonLd({
  description,
  homeLabel,
  items,
  page,
  pageSize,
  title,
}: {
  description: string;
  homeLabel: string;
  items: PublicArticle[];
  page: number;
  pageSize: number;
  title: string;
}) {
  const url = preparationListUrl(page);

  return (
    <>
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          description,
          inLanguage: "fa-IR",
          mainEntity: {
            "@type": "ItemList",
            itemListElement: items.map((item, index) => ({
              "@type": "ListItem",
              name: item.title,
              position: (page - 1) * pageSize + index + 1,
              url: preparationUrl(item.slug),
            })),
            itemListOrder: "https://schema.org/ItemListOrderDescending",
            numberOfItems: items.length,
          },
          name: title,
          publisher,
          url,
        }}
      />
      <JsonLdScript
        data={breadcrumbList([
          { name: homeLabel, url: new URL("/", getSiteUrl()).toString() },
          { name: title, url },
        ])}
      />
    </>
  );
}

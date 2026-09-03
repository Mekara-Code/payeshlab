import type { PublicArticleDetail } from "@/lib/public-articles";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/seo";

function serializeJsonLd(value: Record<string, unknown>) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function ArticleJsonLd({ article }: { article: PublicArticleDetail }) {
  const articleUrl = new URL(`/articles/${encodeURIComponent(article.slug)}`, getSiteUrl()).toString();
  const image = toAbsoluteUrl(article.imageUrl ?? "/background-hq.png");
  const publisherName = "آزمایشگاه پاتولوژی پایش اکسین";
  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    author: { "@type": "Organization", name: publisherName },
    dateModified: article.publishedAt,
    datePublished: article.publishedAt,
    description: article.metaDescription ?? article.excerpt,
    headline: article.title,
    image: [image],
    mainEntityOfPage: { "@id": articleUrl, "@type": "WebPage" },
    publisher: {
      "@type": "Organization",
      logo: { "@type": "ImageObject", url: toAbsoluteUrl("/payeshlab-logo.png") },
      name: publisherName,
    },
  };

  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      type="application/ld+json"
    />
  );
}

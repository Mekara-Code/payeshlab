import type { PublicArticleBlock } from "@/lib/public-articles";

const allowedRichTextTags = new Set([
  "a",
  "b",
  "br",
  "div",
  "em",
  "i",
  "li",
  "ol",
  "p",
  "s",
  "span",
  "strike",
  "strong",
  "u",
  "ul",
]);

export function getPlainText(value: string) {
  return value
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<\/(?:p|div|li|h[1-6])>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isSafeHref(value: string) {
  return /^(https?:\/\/|mailto:|tel:|\/)/i.test(value);
}

function sanitizeRichText(value: string) {
  return value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(
      /<\s*(\/)?\s*([a-z0-9]+)([^>]*)>/gi,
      (_tag, closingSlash, rawName, rawAttributes) => {
        const tagName = rawName.toLowerCase();
        if (!allowedRichTextTags.has(tagName)) return "";
        if (closingSlash) return `</${tagName}>`;
        if (tagName === "br") return "<br />";
        if (tagName !== "a") return `<${tagName}>`;

        const hrefMatch = rawAttributes.match(
          /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
        );
        const href = (
          hrefMatch?.[1] ??
          hrefMatch?.[2] ??
          hrefMatch?.[3] ??
          ""
        ).trim();

        return href && isSafeHref(href)
          ? `<a href="${escapeAttribute(href)}" rel="noreferrer">`
          : "<a>";
      },
    );
}

function parseTableRows(value: string) {
  try {
    const rows = JSON.parse(value) as unknown;
    if (!Array.isArray(rows)) return [];

    return rows
      .filter((row): row is unknown[] => Array.isArray(row))
      .slice(0, 20)
      .map((row) =>
        row
          .slice(0, 12)
          .map((cell) => (typeof cell === "string" ? cell : "")),
      );
  } catch {
    return [];
  }
}

function ArticleRichText({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  const safeContent = sanitizeRichText(content);

  if (!safeContent || !getPlainText(safeContent)) return null;

  return (
    <div
      className={`w-full break-words [overflow-wrap:anywhere] text-base font-medium leading-9 text-slate-700 sm:text-lg sm:leading-9 [&_a]:font-extrabold [&_a]:text-teal-500 [&_a]:underline [&_a]:underline-offset-4 [&_div+_div]:mt-5 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pr-6 [&_p+_p]:mt-5 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pr-6 ${className}`}
      dangerouslySetInnerHTML={{ __html: safeContent }}
    />
  );
}

export function ArticleBody({ blocks }: { blocks: PublicArticleBlock[] }) {
  return (
    <div className="grid w-full gap-6 sm:gap-8 [&>*]:min-w-0">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const heading = getPlainText(block.content);
          return heading ? (
            <h2
              className="pt-4 text-2xl font-black leading-10 tracking-[-0.045em] text-slate-950 sm:pt-5 sm:text-3xl"
              key={block.id}
            >
              {heading}
            </h2>
          ) : null;
        }

        if (block.type === "quote") {
          return (
            <blockquote
              className="rounded-tr-[2.5rem] rounded-bl-[2.5rem] bg-teal-50 px-6 py-7 text-teal-500 sm:px-9 sm:py-9"
              key={block.id}
            >
              <span
                aria-hidden="true"
                className="block text-5xl font-black leading-none text-teal-500"
              >
                «
              </span>
              <ArticleRichText
                className="mt-3 font-extrabold text-teal-500"
                content={block.content}
              />
            </blockquote>
          );
        }

        if (block.type === "table") {
          const rows = parseTableRows(block.content);
          if (rows.length === 0) return null;

          const [header, ...body] = rows;
          return (
            <div className="w-full overflow-x-auto pb-1" key={block.id}>
              <table className="w-full min-w-[34rem] border-separate border-spacing-y-2 text-right text-sm sm:text-base">
                <thead>
                  <tr className="bg-teal-500 text-white">
                    {header.map((cell, cellIndex) => (
                      <th
                        className="px-4 py-3 text-right font-extrabold first:rounded-r-2xl last:rounded-l-2xl"
                        key={`${block.id}-header-${cellIndex}`}
                        scope="col"
                      >
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, rowIndex) => (
                    <tr
                      className="bg-slate-50 text-slate-700"
                      key={`${block.id}-row-${rowIndex}`}
                    >
                      {header.map((_, cellIndex) => (
                        <td
                          className="px-4 py-3 font-medium first:rounded-r-2xl last:rounded-l-2xl"
                          key={`${block.id}-${rowIndex}-${cellIndex}`}
                        >
                          {row[cellIndex] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <ArticleRichText content={block.content} key={`${block.id}-${index}`} />
        );
      })}
    </div>
  );
}

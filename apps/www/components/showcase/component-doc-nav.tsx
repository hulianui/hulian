import { ArrowLeft, ArrowRight, LayoutGrid } from "lucide-react";
import { DOCS_LOCALE, withDocsBasePath, type DocsLocale } from "../../lib/docs-locale";
import { CATEGORIES, componentMeta, manifest } from "../../lib/manifest";

const orderedComponents = CATEGORIES.flatMap((category) =>
  manifest.filter((item) => item.category === category.key),
);

const copy =
  DOCS_LOCALE === "en"
    ? { previous: "Previous", next: "Next", category: "Back to" }
    : { previous: "上一个", next: "下一个", category: "返回" };

export function localizeComponentMarkdownLinks(
  markdown: string | null | undefined,
  locale: DocsLocale = DOCS_LOCALE,
): string | null {
  if (!markdown) return null;
  return markdown.replace(
    /\]\(((?:https:\/\/hulianui\.haloritual\.com)?\/[^)\s]+)\)/g,
    (_match, href: string) => {
      const absolute = href.startsWith("https://");
      const parsed = new URL(href, "https://hulianui.haloritual.com");
      const localized = `${withDocsBasePath(parsed.pathname, locale)}${parsed.search}${
        parsed.hash
      }`;
      return `](${absolute ? `${parsed.origin}${localized}` : localized})`;
    },
  );
}

export function ComponentDocNav({ slug }: { slug: string }) {
  const index = orderedComponents.findIndex((item) => item.slug === slug);
  if (index < 0) return null;

  const current = orderedComponents[index];
  const previous = orderedComponents[index - 1];
  const next = orderedComponents[index + 1];
  const categoryLabel = componentMeta(current).categoryLabel;

  return (
    <nav
      aria-label={DOCS_LOCALE === "en" ? "Component documentation" : "组件文档导航"}
      className="grid gap-px overflow-hidden rounded-[var(--radius)] border border-border bg-border sm:grid-cols-3"
    >
      {previous ? (
        <DocLink
          href={withDocsBasePath(`/components/${previous.slug}`)}
          direction="previous"
          label={copy.previous}
          name={componentMeta(previous).shortName}
        />
      ) : (
        <span aria-hidden className="hidden bg-surface sm:block" />
      )}
      <a
        href={withDocsBasePath(`/components#${current.category}`)}
        aria-label={`${copy.category} ${categoryLabel}`}
        className="flex min-h-11 items-center justify-center gap-2 bg-surface px-4 py-3 text-sm text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <LayoutGrid className="size-4" aria-hidden />
        <span>{categoryLabel}</span>
      </a>
      {next ? (
        <DocLink
          href={withDocsBasePath(`/components/${next.slug}`)}
          direction="next"
          label={copy.next}
          name={componentMeta(next).shortName}
        />
      ) : (
        <span aria-hidden className="hidden bg-surface sm:block" />
      )}
    </nav>
  );
}

function DocLink({
  href,
  direction,
  label,
  name,
}: {
  href: string;
  direction: "previous" | "next";
  label: string;
  name: string;
}) {
  const previous = direction === "previous";
  return (
    <a
      href={href}
      aria-label={`${label} ${name}`}
      className={`flex min-h-11 items-center gap-3 bg-surface px-4 py-3 text-sm outline-none transition-colors hover:bg-surface-hover focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
        previous ? "justify-start" : "justify-end text-right"
      }`}
    >
      {previous && <ArrowLeft className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
      <span className="min-w-0">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span className="block truncate font-medium text-foreground">{name}</span>
      </span>
      {!previous && <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
    </a>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getIntlayer } from "next-intlayer";
import { THEME_NAV, themeMeta } from "../../lib/theme-manifest";
import { DocHeader, Section, Code } from "./_components/doc-kit";
import { DOCS_LOCALE } from "../../lib/docs-locale";

const content = getIntlayer("theme", DOCS_LOCALE).index;

export const metadata: Metadata = { title: `${content.title} · Hulian UI` };

const LAYERS = [
  {
    n: "01",
    name: content.primitive,
    file: "primitives.css",
    desc: content.primitiveDescription,
  },
  {
    n: "02",
    name: content.semantic,
    file: "semantic.css",
    desc: content.semanticDescription,
  },
  {
    n: "03",
    name: content.preset,
    file: "preset.css",
    desc: content.presetDescription,
  },
];

export default function ThemeOverviewPage() {
  const subPages = THEME_NAV.filter((n) => n.slug);
  return (
    <div>
      <DocHeader title={content.title} en={content.eyebrow} lede={content.lede} />

      <Section title={content.architecture} desc={content.architectureDescription}>
        <ol className="space-y-3">
          {LAYERS.map((l) => (
            <li
              key={l.n}
              className="flex gap-4 rounded-[var(--radius)] border border-border bg-surface p-5"
            >
              <span className="font-mono text-sm tabular-nums text-muted">{l.n}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="font-medium">{l.name}</h3>
                  <Code>@hulianui/tokens/{l.file}</Code>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{l.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title={content.consume} desc={content.consumeDescription}>
        <pre className="overflow-x-auto rounded-[var(--radius)] border border-border bg-surface p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
          <span className="text-muted">{"/* app/globals.css */"}</span>
          {"\n"}@import "@hulianui/tokens/tokens.css";{" "}
          <span className="text-muted">{`/* ${content.primitiveComment} */`}</span>
          {"\n"}@import "@hulianui/tokens/preset.css";{" "}
          <span className="text-muted">{`/* ${content.presetComment} */`}</span>
        </pre>
      </Section>

      <Section title={content.explore}>
        <div className="grid gap-2 sm:grid-cols-2">
          {subPages.map((p) => {
            const meta = themeMeta(p);
            return (
              <Link
                key={p.slug}
                href={`/theme/${p.slug}`}
                className="group flex items-center gap-3 rounded-[var(--radius)] border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-hover"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium">{meta.label}</span>
                    <span className="text-xs text-muted">{DOCS_LOCALE === "en" ? p.en : p.en}</span>
                  </div>
                  <p className="truncate text-sm text-muted">{meta.description}</p>
                </div>
                <ArrowRight
                  className="size-4 shrink-0 text-muted/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground"
                  aria-hidden
                />
              </Link>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

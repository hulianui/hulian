import type { Metadata } from "next";
import { getIntlayer } from "next-intlayer";
import { TYPE_SCALE, FONT_WEIGHTS } from "../../../lib/theme-manifest";
import { DocHeader, Section, Code } from "../_components/doc-kit";
import { DOCS_LOCALE } from "../../../lib/docs-locale";

const content = getIntlayer("theme", DOCS_LOCALE).typography;
export const metadata: Metadata = { title: `${content.title} · Hulian UI` };

export default function TypographyPage() {
  return (
    <div>
      <DocHeader
        title={content.title}
        en={content.eyebrow}
        lede={content.lede}
      />

      <Section title={content.sizes} desc={content.sizesDescription}>
        <div className="divide-y divide-border rounded-[var(--radius)] border border-border bg-surface">
          {TYPE_SCALE.map((t) => (
            <div key={t.name} className="flex items-baseline gap-4 px-5 py-3">
              <span
                className="min-w-0 flex-1 truncate font-medium text-foreground"
                style={{ fontSize: t.size, lineHeight: t.lineHeight }}
              >
                {content.sample}
              </span>
              <Code>{t.name}</Code>
              <span className="hidden w-16 shrink-0 text-right font-mono text-xs text-muted sm:block">
                {t.px}px
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title={content.weights}>
        <div className="divide-y divide-border rounded-[var(--radius)] border border-border bg-surface">
          {FONT_WEIGHTS.map((w) => (
            <div key={w.name} className="flex items-baseline gap-4 px-5 py-3">
              <span
                className="min-w-0 flex-1 text-lg text-foreground"
                style={{ fontWeight: w.value }}
              >
                {content.weightSample}
              </span>
              <span className="text-sm text-muted">{w.label}</span>
              <Code>{w.name}</Code>
              <span className="hidden w-10 shrink-0 text-right font-mono text-xs text-muted sm:block">
                {w.value}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title={content.stack}>
        <pre className="overflow-x-auto rounded-[var(--radius)] border border-border bg-surface p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
          font-family: ui-sans-serif, system-ui, -apple-system,{"\n"}
          {"  "}"PingFang SC", "Microsoft YaHei", sans-serif;
        </pre>
      </Section>
    </div>
  );
}

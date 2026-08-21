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
              <span className="hidden w-16 shrink-0 text-right font-mono text-xs text-muted-foreground sm:block">
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
              <span className="text-sm text-muted-foreground">{w.label}</span>
              <Code>{w.name}</Code>
              <span className="hidden w-10 shrink-0 text-right font-mono text-xs text-muted-foreground sm:block">
                {w.value}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title={content.stack} desc={content.stackDescription}>
        <Code>{`--hl-font-sans: Geist, ui-sans-serif, system-ui,
  "PingFang SC", "Microsoft YaHei", sans-serif;
--hl-font-mono: "Geist Mono", ui-monospace, Menlo, monospace;`}</Code>
      </Section>

      <Section title={content.customize} desc={content.customizeDescription}>
        <Code>{`:root {
  --hl-font-sans: "Your Sans", ui-sans-serif, system-ui, sans-serif;
  --hl-font-mono: "Your Mono", ui-monospace, monospace;
}`}</Code>
      </Section>

      <Section title={content.scoped} desc={content.scopedDescription}>
        <Code>{`{/* ${content.scopedMonoComment} */}
<div style={{ "--hl-font-mono": '"IBM Plex Mono", monospace' }}>
  <Snippet>pnpm add @hulianui/ui</Snippet>
</div>

{/* ${content.scopedSansComment} */}
<div className="font-sans" style={{ "--hl-font-sans": "Georgia, serif" }}>
  ${content.scopedSansSample}
</div>`}</Code>
      </Section>

      <Section title={content.cjkNote} desc={content.cjkNoteDescription}>
        <Code>{`/* ${content.stackComment} */
--hl-font-sans: Geist, "Noto Sans SC", ui-sans-serif, system-ui,
  "PingFang SC", "Microsoft YaHei", sans-serif;`}</Code>
      </Section>
    </div>
  );
}

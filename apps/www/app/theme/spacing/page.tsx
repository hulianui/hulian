import type { Metadata } from "next";
import { getIntlayer } from "next-intlayer";
import { SPACING_STEPS } from "../../../lib/theme-manifest";
import { DocHeader, Section, Code } from "../_components/doc-kit";
import { DOCS_LOCALE } from "../../../lib/docs-locale";

const content = getIntlayer("theme", DOCS_LOCALE).spacing;
export const metadata: Metadata = { title: `${content.title} · Hulian UI` };

export default function SpacingPage() {
  return (
    <div>
      <DocHeader
        title={content.title}
        en={content.eyebrow}
        lede={content.lede}
      />

      <Section title={content.scale} desc={content.scaleDescription}>
        <div className="divide-y divide-border rounded-[var(--radius)] border border-border bg-surface">
          {SPACING_STEPS.map((s) => (
            <div key={s.step} className="flex items-center gap-4 px-5 py-2.5">
              <span className="w-8 shrink-0 font-mono text-sm tabular-nums text-foreground">
                {s.step}
              </span>
              <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">{s.rem}</span>
              <span className="hidden w-12 shrink-0 font-mono text-xs text-muted-foreground sm:block">
                {s.px}px
              </span>
              <span className="flex min-w-0 flex-1 items-center">
                <span
                  className="h-3.5 rounded-[0.2rem] bg-primary"
                  style={{ width: s.rem }}
                  aria-hidden
                />
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title={content.usage}>
        <pre className="overflow-x-auto rounded-[var(--radius)] border border-border bg-surface p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
          <span className="text-muted-foreground">{`// ${content.comment}`}</span>
          {"\n"}{'<div className="p-4 space-y-2">'}
          {"\n"}{"  …"}
          {"\n"}{"</div>"}
        </pre>
      </Section>
    </div>
  );
}

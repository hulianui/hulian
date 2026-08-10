import type { Metadata } from "next";
import { getIntlayer } from "next-intlayer";
import { SHADOW_SCALE } from "../../../lib/theme-manifest";
import { DocHeader, Section, Code } from "../_components/doc-kit";
import { DOCS_LOCALE } from "../../../lib/docs-locale";

const content = getIntlayer("theme", DOCS_LOCALE).shadows;
export const metadata: Metadata = { title: `${content.title} · Hulian UI` };

export default function ShadowsPage() {
  return (
    <div>
      <DocHeader
        title={content.title}
        en={content.eyebrow}
        lede={content.lede}
      />

      <Section title={content.scale} desc={content.scaleDescription}>
        <div className="grid grid-cols-2 gap-5 rounded-[var(--radius)] bg-bg p-8 sm:grid-cols-3">
          {SHADOW_SCALE.map((s) => (
            <div key={s.name} className="text-center">
              <span
                className={`mx-auto block size-20 rounded-[var(--radius)] bg-surface ${s.name}`}
                aria-hidden
              />
              <span className="mt-3 block font-mono text-xs text-foreground">
                {s.name.replace("shadow-", "")}
              </span>
              <span className="mt-0.5 block text-[0.7rem] leading-snug text-muted-foreground">{s.use}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title={content.usage}>
        <pre className="overflow-x-auto rounded-[var(--radius)] border border-border bg-surface p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
          <span className="text-muted-foreground">{`// ${content.comment}`}</span>
          {"\n"}{'<div className="rounded-[var(--radius)] bg-surface shadow-sm">…</div>'}
        </pre>
      </Section>
    </div>
  );
}

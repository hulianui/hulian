import type { Metadata } from "next";
import { getIntlayer } from "next-intlayer";
import { RADIUS_TOKEN, RADIUS_SCALE } from "../../../lib/theme-manifest";
import { DocHeader, Section, Code } from "../_components/doc-kit";
import { DOCS_LOCALE } from "../../../lib/docs-locale";

const content = getIntlayer("theme", DOCS_LOCALE).radius;
export const metadata: Metadata = { title: `${content.title} · Hulian UI` };

export default function RadiusPage() {
  return (
    <div>
      <DocHeader
        title={content.title}
        en={content.eyebrow}
        lede={content.lede}
      />

      <Section title={content.base}>
        <div className="flex items-center gap-5 rounded-[var(--radius)] border border-border bg-surface p-5">
          <span
            className="size-20 shrink-0 border border-border bg-surface-hover"
            style={{ borderRadius: RADIUS_TOKEN.rem }}
            aria-hidden
          />
          <div>
            <Code>--radius</Code>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {RADIUS_TOKEN.rem} · {RADIUS_TOKEN.px}px
            </p>
          </div>
        </div>
      </Section>

      <Section title={content.scale} desc={content.scaleDescription}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {RADIUS_SCALE.map((r) => (
            <div key={r.name} className="text-center">
              <span
                className="mx-auto block size-20 border border-border bg-surface-hover"
                style={{ borderRadius: r.rem }}
                aria-hidden
              />
              <span className="mt-2 block truncate font-mono text-xs text-foreground">
                {r.name.replace("rounded-", "")}
              </span>
              <span className="block font-mono text-[0.65rem] text-muted-foreground">{r.rem}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

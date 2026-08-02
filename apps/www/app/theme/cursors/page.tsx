import type { Metadata } from "next";
import { getIntlayer } from "next-intlayer";
import { CURSORS } from "../../../lib/theme-manifest";
import { DocHeader, Section, Code } from "../_components/doc-kit";
import { DOCS_LOCALE } from "../../../lib/docs-locale";

const content = getIntlayer("theme", DOCS_LOCALE).cursors;
export const metadata: Metadata = { title: `${content.title} · Hulian UI` };

export default function CursorsPage() {
  return (
    <div>
      <DocHeader
        title={content.title}
        en={content.eyebrow}
        lede={content.lede}
      />

      <Section title={content.semantics} desc={content.semanticsDescription}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CURSORS.map((c) => (
            <div
              key={c.name}
              className={`flex items-center gap-3 rounded-[var(--radius)] border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-hover ${c.name}`}
            >
              <span className="size-8 shrink-0 rounded-[0.4rem] bg-surface-hover" aria-hidden />
              <div className="min-w-0">
                <Code>{c.name}</Code>
                <p className="mt-0.5 text-sm text-muted">{c.use}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

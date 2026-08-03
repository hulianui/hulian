import type { Metadata } from "next";
import { getIntlayer } from "next-intlayer";
import { AnimatedThemeToggler } from "@hulianui/ui";
import { DocHeader, Section, Code, Note } from "../_components/doc-kit";
import { DOCS_LOCALE } from "../../../lib/docs-locale";

const content = getIntlayer("theme", DOCS_LOCALE).darkMode;
export const metadata: Metadata = { title: `${content.title} · Hulian UI` };

// 一个迷你界面预览：放在 data-theme 作用域里即「就地」吃对应主题的语义 token
function MiniUI() {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-bg p-5">
      <div className="rounded-[var(--radius)] border border-border bg-surface p-4">
        <p className="text-sm font-semibold text-foreground">{content.cardTitle}</p>
        <p className="mt-1 text-xs text-muted">{content.cardDescription}</p>
        <div className="mt-3 flex gap-2">
          <span className="rounded-[var(--radius)] bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            {content.primaryButton}
          </span>
          <span className="rounded-[var(--radius)] border border-border px-3 py-1.5 text-xs text-foreground">
            {content.secondaryButton}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DarkModePage() {
  return (
    <div>
      <DocHeader title={content.title} en={content.eyebrow} lede={content.lede} />

      <Section title={content.switchTitle} desc={content.switchDescription}>
        <div className="flex items-center gap-4 rounded-[var(--radius)] border border-border bg-surface px-5 py-4">
          <AnimatedThemeToggler aria-label={content.toggleLabel} />
          <span className="text-sm text-muted">{content.switchAction}</span>
        </div>
      </Section>

      <Section title={content.scopeTitle} desc={content.scopeDescription}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-theme="light">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Light</p>
            <MiniUI />
          </div>
          <div data-theme="dark">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Dark</p>
            <MiniUI />
          </div>
        </div>
      </Section>

      <Section title={content.foucTitle}>
        <Note>
          <p>{content.foucDescription}</p>
        </Note>
      </Section>

      <Section title={content.codeTitle} desc={content.codeDescription}>
        <pre className="overflow-x-auto rounded-[var(--radius)] border border-border bg-surface p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
          <span className="text-muted">{`// ${content.readComment}`}</span>
          {"\n"}document.documentElement.dataset.theme;{" "}
          <span className="text-muted">{'// "light" | "dark"'}</span>
          {"\n\n"}
          <span className="text-muted">{`// ${content.writeComment}`}</span>
          {"\n"}document.documentElement.dataset.theme = "dark";
        </pre>
      </Section>
    </div>
  );
}

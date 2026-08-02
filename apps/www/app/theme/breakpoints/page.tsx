import type { Metadata } from "next";
import { getIntlayer } from "next-intlayer";
import { BREAKPOINTS } from "../../../lib/theme-manifest";
import { DocHeader, Section, Code, Note } from "../_components/doc-kit";
import { DOCS_LOCALE } from "../../../lib/docs-locale";

const content = getIntlayer("theme", DOCS_LOCALE).breakpoints;
export const metadata: Metadata = { title: `${content.title} · Hulian UI` };

export default function BreakpointsPage() {
  return (
    <div>
      <DocHeader
        title={content.title}
        en={content.eyebrow}
        lede={content.lede}
      />

      <Section title={content.live} desc={content.liveDescription}>
        <div className="flex flex-wrap gap-2 rounded-[var(--radius)] border border-border bg-surface p-5">
          {/* < sm：仅在最窄时高亮 */}
          <BpChip name="< sm" activeClass="inline-flex sm:hidden" idleClass="hidden sm:inline-flex" />
          <BpChip name="sm" activeClass="hidden sm:inline-flex md:hidden" idleClass="inline-flex sm:hidden md:inline-flex" />
          <BpChip name="md" activeClass="hidden md:inline-flex lg:hidden" idleClass="inline-flex md:hidden lg:inline-flex" />
          <BpChip name="lg" activeClass="hidden lg:inline-flex xl:hidden" idleClass="inline-flex lg:hidden xl:inline-flex" />
          <BpChip name="xl" activeClass="hidden xl:inline-flex 2xl:hidden" idleClass="inline-flex xl:hidden 2xl:inline-flex" />
          <BpChip name="2xl" activeClass="hidden 2xl:inline-flex" idleClass="inline-flex 2xl:hidden" />
        </div>
      </Section>

      <Section title={content.table}>
        <div className="overflow-hidden rounded-[var(--radius)] border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-2.5 font-medium">{content.prefix}</th>
                <th className="px-4 py-2.5 font-medium">{content.width}</th>
                <th className="px-4 py-2.5 font-medium">rem</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">{content.device}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {BREAKPOINTS.map((b) => (
                <tr key={b.name}>
                  <td className="px-4 py-2.5">
                    <Code>{b.prefix}</Code>
                  </td>
                  <td className="px-4 py-2.5 font-mono tabular-nums text-foreground">{b.px}px</td>
                  <td className="px-4 py-2.5 font-mono text-muted">{b.rem}</td>
                  <td className="hidden px-4 py-2.5 text-muted sm:table-cell">{b.device}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title={content.usage}
        desc={content.usageDescription}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="flex h-16 items-center justify-center rounded-[var(--radius)] border border-border bg-surface text-sm text-muted"
            >
              {content.card} {n}
            </div>
          ))}
        </div>
        <pre className="mt-4 overflow-x-auto rounded-[var(--radius)] border border-border bg-surface p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
          {'<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">'}
        </pre>
      </Section>

      <Section title={content.source}>
        <Note>
          <p>{content.sourceDescription}</p>
          <pre className="mt-3 overflow-x-auto font-mono text-[0.78rem] leading-relaxed text-foreground">
            @theme {"{"}
            {"\n"}  --breakpoint-sm: 40rem;  <span className="text-muted">{"/* 640px */"}</span>
            {"\n"}  --breakpoint-md: 48rem;  <span className="text-muted">{"/* 768px */"}</span>
            {"\n"}  --breakpoint-lg: 64rem;  <span className="text-muted">{"/* 1024px */"}</span>
            {"\n"}  --breakpoint-xl: 80rem;  <span className="text-muted">{"/* 1280px */"}</span>
            {"\n"}  --breakpoint-2xl: 96rem; <span className="text-muted">{"/* 1536px */"}</span>
            {"\n"}{"}"}
          </pre>
        </Note>
      </Section>
    </div>
  );
}

// 当前命中高亮：active 态显示主色实底，idle 态显示发丝线轮廓。靠纯 CSS 响应式类切换可见性。
function BpChip({
  name,
  activeClass,
  idleClass,
}: {
  name: string;
  activeClass: string;
  idleClass: string;
}) {
  return (
    <>
      <span
        className={`${activeClass} items-center rounded-[var(--radius)] bg-primary px-3 py-1.5 font-mono text-sm font-medium text-primary-foreground`}
      >
        {name}
      </span>
      <span
        className={`${idleClass} items-center rounded-[var(--radius)] border border-border px-3 py-1.5 font-mono text-sm text-muted`}
      >
        {name}
      </span>
    </>
  );
}

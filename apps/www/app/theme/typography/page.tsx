import type { Metadata } from "next";
import { TYPE_SCALE, FONT_WEIGHTS } from "../../../lib/theme-manifest";
import { DocHeader, Section, Code } from "../_components/doc-kit";

export const metadata: Metadata = { title: "排版 Typography · 瑚琏 Hulian" };

export default function TypographyPage() {
  return (
    <div>
      <DocHeader
        title="排版"
        en="Typography"
        lede={
          <>
            字体走系统无衬线栈（PingFang SC / 微软雅黑兜底），字号沿用 Tailwind v4 的{" "}
            <Code>text-*</Code> 比例。下面是全站实际使用的阶梯。
          </>
        }
      />

      <Section title="字号阶梯" desc="每行用其真实尺寸渲染。">
        <div className="divide-y divide-border rounded-[var(--radius)] border border-border bg-surface">
          {TYPE_SCALE.map((t) => (
            <div key={t.name} className="flex items-baseline gap-4 px-5 py-3">
              <span
                className="min-w-0 flex-1 truncate font-medium text-foreground"
                style={{ fontSize: t.size, lineHeight: t.lineHeight }}
              >
                颜值 + 好用 Aa
              </span>
              <Code>{t.name}</Code>
              <span className="hidden w-16 shrink-0 text-right font-mono text-xs text-muted sm:block">
                {t.px}px
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="字重">
        <div className="divide-y divide-border rounded-[var(--radius)] border border-border bg-surface">
          {FONT_WEIGHTS.map((w) => (
            <div key={w.name} className="flex items-baseline gap-4 px-5 py-3">
              <span
                className="min-w-0 flex-1 text-lg text-foreground"
                style={{ fontWeight: w.value }}
              >
                颜值 + 好用 Aa 123
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

      <Section title="字体栈">
        <pre className="overflow-x-auto rounded-[var(--radius)] border border-border bg-surface p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
          font-family: ui-sans-serif, system-ui, -apple-system,{"\n"}
          {"  "}"PingFang SC", "Microsoft YaHei", sans-serif;
        </pre>
      </Section>
    </div>
  );
}

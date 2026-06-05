import type { Metadata } from "next";
import { SPACING_STEPS } from "../../../lib/theme-manifest";
import { DocHeader, Section, Code } from "../_components/doc-kit";

export const metadata: Metadata = { title: "间距 Spacing · 瑚琏 Hulian" };

export default function SpacingPage() {
  return (
    <div>
      <DocHeader
        title="间距"
        en="Spacing"
        lede={
          <>
            间距基准为 <Code>0.25rem（4px）</Code>，所有 <Code>p-*</Code> / <Code>m-*</Code> /{" "}
            <Code>gap-*</Code> / <Code>space-*</Code> 工具类都是它的整数倍。统一基准让纵向节奏可预测。
          </>
        }
      />

      <Section title="阶梯" desc="数值 = 基准倍数；条形长度按真实尺寸绘制。">
        <div className="divide-y divide-border rounded-[var(--radius)] border border-border bg-surface">
          {SPACING_STEPS.map((s) => (
            <div key={s.step} className="flex items-center gap-4 px-5 py-2.5">
              <span className="w-8 shrink-0 font-mono text-sm tabular-nums text-foreground">
                {s.step}
              </span>
              <span className="w-16 shrink-0 font-mono text-xs text-muted">{s.rem}</span>
              <span className="hidden w-12 shrink-0 font-mono text-xs text-muted sm:block">
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

      <Section title="用法">
        <pre className="overflow-x-auto rounded-[var(--radius)] border border-border bg-surface p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
          <span className="text-muted">{"// 内边距 16px / 纵向间隔 8px"}</span>
          {"\n"}{'<div className="p-4 space-y-2">'}
          {"\n"}{"  …"}
          {"\n"}{"</div>"}
        </pre>
      </Section>
    </div>
  );
}

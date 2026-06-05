import type { Metadata } from "next";
import { BREAKPOINTS } from "../../../lib/theme-manifest";
import { DocHeader, Section, Code, Note } from "../_components/doc-kit";

export const metadata: Metadata = { title: "断点 Breakpoints · 瑚琏 Hulian" };

export default function BreakpointsPage() {
  return (
    <div>
      <DocHeader
        title="断点"
        en="Breakpoints"
        lede={
          <>
            响应式断点是一组 <strong className="text-foreground">min-width</strong> 阈值：当视口宽度{" "}
            ≥ 某断点时，对应的 <Code>sm:</Code> / <Code>md:</Code> … 工具类生效。瑚琏沿用 5 档，
            真源在 <Code>preset.css</Code>。
          </>
        }
      />

      <Section title="实时断点" desc="缩放浏览器窗口，下方高亮当前命中的最大断点。">
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

      <Section title="断点表">
        <div className="overflow-hidden rounded-[var(--radius)] border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-2.5 font-medium">前缀</th>
                <th className="px-4 py-2.5 font-medium">≥ 宽度</th>
                <th className="px-4 py-2.5 font-medium">rem</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">典型设备</th>
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
        title="响应式用法"
        desc={<>移动优先：基础类无前缀（最窄），更宽屏用前缀覆盖。下方栅格随窗口由 1 → 2 → 4 列。</>}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="flex h-16 items-center justify-center rounded-[var(--radius)] border border-border bg-surface text-sm text-muted"
            >
              卡片 {n}
            </div>
          ))}
        </div>
        <pre className="mt-4 overflow-x-auto rounded-[var(--radius)] border border-border bg-surface p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
          {'<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">'}
        </pre>
      </Section>

      <Section title="真源与定制">
        <Note>
          <p>
            5 档断点在 <Code>@hulian/tokens/preset.css</Code> 的 <Code>@theme</Code> 块里声明为{" "}
            <Code>--breakpoint-sm…2xl</Code>。改这里即同时改全站工具类断点 + 本页表格——单一真源。
          </p>
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

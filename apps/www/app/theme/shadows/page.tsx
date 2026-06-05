import type { Metadata } from "next";
import { SHADOW_SCALE } from "../../../lib/theme-manifest";
import { DocHeader, Section, Code } from "../_components/doc-kit";

export const metadata: Metadata = { title: "阴影 Shadows · 瑚琏 Hulian" };

export default function ShadowsPage() {
  return (
    <div>
      <DocHeader
        title="阴影"
        en="Shadows"
        lede={
          <>
            阴影表达<strong className="text-foreground">层级（elevation）</strong>：离页面越远投影越大。
            瑚琏沿用 Tailwind 的 <Code>shadow-*</Code> 比例，越往上的浮层用越重的投影。
          </>
        }
      />

      <Section title="层级阶梯" desc="在浅底上观察更直观；暗色下投影会自然减弱。">
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
              <span className="mt-0.5 block text-[0.7rem] leading-snug text-muted">{s.use}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="用法">
        <pre className="overflow-x-auto rounded-[var(--radius)] border border-border bg-surface p-4 font-mono text-[0.8rem] leading-relaxed text-foreground">
          <span className="text-muted">{"// 卡片用 sm，弹层用 lg，对话框用 xl"}</span>
          {"\n"}{'<div className="rounded-[var(--radius)] bg-surface shadow-sm">…</div>'}
        </pre>
      </Section>
    </div>
  );
}

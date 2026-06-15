"use client";
import { CodeBlock, type ExampleSpec } from "@hulianui/ui";

// Vant 式用法场景：每个示例「标题 + 说明 + 活预览 + 代码」上下排（预览在上、代码在下）。
export function ExamplesSection({ examples }: { examples: ExampleSpec[] }) {
  return (
    <div className="space-y-7">
      {examples.map((ex, i) => (
        <section key={i} id={`ex-${i}`} className="scroll-mt-6">
          <h3 className="text-[0.95rem] font-semibold">{ex.title}</h3>
          {ex.description && (
            <p className="mt-1 text-sm leading-relaxed text-muted">{ex.description}</p>
          )}
          <div className="mt-3 overflow-hidden rounded-[var(--radius)] border border-border">
            <div className="flex flex-wrap items-center gap-4 bg-bg p-8">{ex.render()}</div>
            <CodeBlock code={ex.code} lang="tsx" className="rounded-none border-0 border-t border-border" />
          </div>
        </section>
      ))}
    </div>
  );
}

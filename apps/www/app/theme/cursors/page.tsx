import type { Metadata } from "next";
import { CURSORS } from "../../../lib/theme-manifest";
import { DocHeader, Section, Code } from "../_components/doc-kit";

export const metadata: Metadata = { title: "光标 Cursors · 瑚琏 Hulian" };

export default function CursorsPage() {
  return (
    <div>
      <DocHeader
        title="光标"
        en="Cursors"
        lede={
          <>
            指针形状是一种<strong className="text-foreground">免费的可供性提示</strong>：悬停即暗示「能做什么」。
            把鼠标移到下面每个方块上感受对应 <Code>cursor-*</Code>。
          </>
        }
      />

      <Section title="语义对照" desc="悬停方块查看实际指针。">
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

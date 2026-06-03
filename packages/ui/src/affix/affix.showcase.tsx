"use client";
import { useRef, useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Affix } from "./affix";

const ROWS = Array.from({ length: 18 }, (_, i) => i + 1);

// 自带滚动容器的演示：window 在文档预览里不滚动，故用 target 指向本容器，吸附可见。
function AffixDemo({
  offsetTop,
  offsetBottom,
  affixedClassName,
}: {
  offsetTop?: number;
  offsetBottom?: number;
  affixedClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [affixed, setAffixed] = useState(false);
  const toBottom = offsetBottom != null;

  const bar = (
    <Affix
      target={() => ref.current}
      offsetTop={toBottom ? undefined : (offsetTop ?? 8)}
      offsetBottom={offsetBottom}
      onChange={setAffixed}
      affixedClassName={affixedClassName}
    >
      <div className="flex items-center justify-between rounded-[var(--radius)] border border-border bg-primary px-4 py-2 text-bg">
        <span className="text-sm font-medium">操作栏</span>
        <span className="text-xs opacity-80">{affixed ? "已吸附" : "未吸附"}</span>
      </div>
    </Affix>
  );

  return (
    <div
      ref={ref}
      className="h-64 w-80 overflow-auto rounded-[var(--radius)] border border-border bg-surface p-4"
    >
      <p className="mb-3 text-sm text-muted">
        {toBottom ? "向上滚动 ↑ 让操作栏吸底" : "向下滚动 ↓ 让操作栏吸顶"}
      </p>
      {!toBottom && bar}
      <div className="mt-3 space-y-2">
        {ROWS.map((n) => (
          <p key={n} className="text-sm text-muted">
            内容行 {n}
          </p>
        ))}
      </div>
      {toBottom && <div className="mt-3">{bar}</div>}
    </div>
  );
}

export const affixShowcase: ShowcaseSpec = {
  controls: [
    { prop: "offsetTop", type: "number", defaultValue: 8, label: "offsetTop" },
  ],
  states: [
    { name: "吸顶（offsetTop）", render: () => <AffixDemo offsetTop={8} /> },
    { name: "吸底（offsetBottom）", render: () => <AffixDemo offsetBottom={8} /> },
    {
      name: "吸附加阴影",
      render: () => <AffixDemo offsetTop={8} affixedClassName="shadow-lg" />,
    },
  ],
  renderWithProps: (p) => (
    <AffixDemo offsetTop={typeof p.offsetTop === "number" ? p.offsetTop : 8} />
  ),
  toCode: (p) =>
    `<Affix offsetTop={${typeof p.offsetTop === "number" ? p.offsetTop : 8}}>\n  <div>操作栏</div>\n</Affix>`,
};

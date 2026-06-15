"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ProgressiveBlur } from "./progressive-blur";

type Side = "top" | "bottom" | "left" | "right";

function Demo({ side = "bottom" }: { side?: Side }) {
  return (
    <div className="relative h-56 w-80 overflow-hidden rounded-[var(--radius)] border border-border">
      <div className="grid h-full grid-cols-6 gap-1 p-2">
        {Array.from({ length: 36 }).map((_, i) => (
          <span key={i} className="rounded-sm bg-gradient-to-br from-primary/40 to-chart-2/40" />
        ))}
      </div>
      <ProgressiveBlur side={side} />
      <span className="absolute bottom-3 left-3 text-sm font-medium text-foreground">渐进模糊 · {side}</span>
    </div>
  );
}

export const progressiveBlurShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "底部渐进模糊",
      description: "绝对覆盖在内容上，越靠底部越糊，常用于内容淡出/遮罩文案区。",
      code: `<div className="relative overflow-hidden rounded-[var(--radius)] border border-border">
  {/* content */}
  <ProgressiveBlur side="bottom" />
</div>`,
      render: () => <Demo side="bottom" />,
    },
    {
      title: "顶部渐进模糊",
      description: "side 切换模糊增强方向，顶部最糊适合顶栏吸附场景。",
      code: `<ProgressiveBlur side="top" />`,
      render: () => <Demo side="top" />,
    },
    {
      title: "横向 · 右侧渐糊",
      description: "left / right 做横向渐进模糊，常用于横滑列表的边缘暗示。",
      code: `<ProgressiveBlur side="right" />`,
      render: () => <Demo side="right" />,
    },
    {
      title: "更强分层",
      description: "layers 增加层数让过渡更平滑，blur 提升基础模糊量。",
      code: `<ProgressiveBlur side="bottom" layers={8} blur={2} />`,
      render: () => (
        <div className="relative h-56 w-80 overflow-hidden rounded-[var(--radius)] border border-border">
          <div className="grid h-full grid-cols-6 gap-1 p-2">
            {Array.from({ length: 36 }).map((_, i) => (
              <span key={i} className="rounded-sm bg-gradient-to-br from-primary/40 to-chart-2/40" />
            ))}
          </div>
          <ProgressiveBlur side="bottom" layers={8} blur={2} />
          <span className="absolute bottom-3 left-3 text-sm font-medium text-foreground">layers=8 · blur=2</span>
        </div>
      ),
    },
  ],
  controls: [
    { prop: "side", type: "select", options: ["top", "bottom", "left", "right"], defaultValue: "bottom" },
  ],
  states: [
    { name: "bottom", render: () => <Demo side="bottom" /> },
    { name: "top", render: () => <Demo side="top" /> },
  ],
  renderWithProps: (p) => <Demo side={(p.side as Side) ?? "bottom"} />,
  toCode: (p) =>
    `<div className="relative overflow-hidden">\n  {/* content */}\n  <ProgressiveBlur side="${(p.side as string) ?? "bottom"}" />\n</div>`,
};

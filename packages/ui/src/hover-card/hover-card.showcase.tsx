"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

function Demo({ side = "bottom", align = "center" }: { side?: Side; align?: Align }) {
  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <button
            type="button"
            className="font-medium text-primary underline decoration-dotted underline-offset-4 outline-none"
          >
            @瑚琏设计系统
          </button>
        }
      />
      <HoverCardContent side={side} align={align}>
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
            瑚
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">瑚琏设计系统</p>
            <p className="text-xs text-muted">吸取各家最佳实现，统一成一套瑚琏 API + 明暗 token。</p>
            <p className="text-xs text-muted">悬停展开 · 移出延迟关闭</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export const hoverCardShowcase: ShowcaseSpec = {
  controls: [
    { prop: "side", type: "select", options: ["top", "right", "bottom", "left"], defaultValue: "bottom" },
    { prop: "align", type: "select", options: ["start", "center", "end"], defaultValue: "center" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "top", render: () => <Demo side="top" /> },
    { name: "right", render: () => <Demo side="right" /> },
  ],
  renderWithProps: (p) => <Demo side={p.side as Side} align={p.align as Align} />,
  toCode: (p) =>
    `<HoverCard>\n  <HoverCardTrigger render={<a>@瑚琏</a>} />\n  <HoverCardContent side="${p.side}" align="${p.align}">\n    {/* 头像 + 简介 */}\n  </HoverCardContent>\n</HoverCard>`,
};

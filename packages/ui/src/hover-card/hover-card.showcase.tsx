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
  examples: [
    {
      title: "基础用法",
      description: "悬停链接/词条延迟展开信息卡，移出延迟关闭；非模态，不锁滚、不抢焦点。",
      code: `<HoverCard>
  <HoverCardTrigger render={<button type="button">@瑚琏设计系统</button>} />
  <HoverCardContent>
    <div className="flex gap-3">
      <div className="size-10 rounded-full bg-primary/12">瑚</div>
      <div>
        <p>瑚琏设计系统</p>
        <p>吸取各家最佳实现，统一成一套瑚琏 API + 明暗 token。</p>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>`,
      render: () => <Demo />,
    },
    {
      title: "弹出方位",
      description: "side 控制卡片相对触发器的方位，箭头自动续上对应边线。",
      code: `<>
  <HoverCard>
    <HoverCardTrigger render={<button type="button">向上展开</button>} />
    <HoverCardContent side="top">{/* 头像 + 简介 */}</HoverCardContent>
  </HoverCard>
  <HoverCard>
    <HoverCardTrigger render={<button type="button">向右展开</button>} />
    <HoverCardContent side="right">{/* 头像 + 简介 */}</HoverCardContent>
  </HoverCard>
</>`,
      render: () => (
        <div className="flex flex-wrap gap-8">
          <Demo side="top" />
          <Demo side="right" />
        </div>
      ),
    },
  ],
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

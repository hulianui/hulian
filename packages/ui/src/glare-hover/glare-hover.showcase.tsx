import type { ShowcaseSpec } from "../showcase/types";
import { GlareHover } from "./glare-hover";

export const glareHoverShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "包裹任意内容，悬停时一道斜向反光自左向右扫过。",
      code: `<GlareHover className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface">
  <span className="text-lg font-semibold text-foreground">悬停看反光</span>
</GlareHover>`,
      render: () => (
        <GlareHover className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface">
          <span className="text-lg font-semibold text-foreground">悬停看反光</span>
        </GlareHover>
      ),
    },
    {
      title: "扫光时长",
      description: "用 duration 控制反光扫过的快慢，慢扫更显高级质感。",
      code: `<GlareHover
  duration="1000ms"
  className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface"
>
  <span className="text-lg font-semibold text-foreground">缓慢扫光 1s</span>
</GlareHover>`,
      render: () => (
        <GlareHover
          duration="1000ms"
          className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface"
        >
          <span className="text-lg font-semibold text-foreground">缓慢扫光 1s</span>
        </GlareHover>
      ),
    },
    {
      title: "自定义反光色",
      description: "glareColor 覆盖默认半透明白，可染成品牌色调的光泽。",
      code: `<GlareHover
  glareColor="rgba(124,58,237,0.5)"
  className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface"
>
  <span className="text-lg font-semibold text-foreground">紫色光泽</span>
</GlareHover>`,
      render: () => (
        <GlareHover
          glareColor="rgba(124,58,237,0.5)"
          className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface"
        >
          <span className="text-lg font-semibold text-foreground">紫色光泽</span>
        </GlareHover>
      ),
    },
    {
      title: "套在图片卡上",
      description: "对图片/封面同样生效，反光让卡片更有交互生命力。",
      code: `<GlareHover className="h-40 w-72 overflow-hidden rounded-xl border border-border">
  <div className="flex h-full w-full items-end bg-gradient-to-br from-primary/60 to-chart-2/60 p-4">
    <span className="text-lg font-semibold text-white">精选作品</span>
  </div>
</GlareHover>`,
      render: () => (
        <GlareHover className="h-40 w-72 overflow-hidden rounded-xl border border-border">
          <div className="flex h-full w-full items-end bg-gradient-to-br from-primary/60 to-chart-2/60 p-4">
            <span className="text-lg font-semibold text-white">精选作品</span>
          </div>
        </GlareHover>
      ),
    },
  ],
  controls: [{ prop: "duration", type: "select", options: ["450ms", "650ms", "1000ms"], defaultValue: "650ms" }],
  states: [
    {
      name: "default（hover 反光斜扫）",
      render: () => (
        <GlareHover className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface">
          <span className="text-lg font-semibold text-foreground">悬停看反光</span>
        </GlareHover>
      ),
    },
  ],
  renderWithProps: (p) => (
    <GlareHover
      duration={p.duration as string}
      className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface"
    >
      <span className="text-lg font-semibold text-foreground">悬停看反光</span>
    </GlareHover>
  ),
  toCode: (p) => `<GlareHover duration="${p.duration}">...</GlareHover>`,
};

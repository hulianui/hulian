"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { AspectRatio } from "./aspect-ratio";

const Fill = ({ label }: { label: string }) => (
  <div className="flex h-full w-full items-center justify-center bg-surface-hover text-xs text-muted-foreground">
    {label}
  </div>
);

export const aspectRatioShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "16 / 9 宽屏",
      description: "用 ratio 锁定宽高比，容器宽度变化时高度按比例自适应（常用于视频/封面）。",
      code: `<div className="w-64">
  <AspectRatio ratio={16 / 9}>
    <img src="..." alt="..." />
  </AspectRatio>
</div>`,
      render: () => (
        <div className="w-64">
          <AspectRatio ratio={16 / 9} className="rounded-[var(--radius)] border border-border">
            <Fill label="16 / 9" />
          </AspectRatio>
        </div>
      ),
    },
    {
      title: "1 / 1 正方形",
      description: "ratio={1} 锁正方形，适合头像、缩略图、图标占位。",
      code: `<div className="w-40">
  <AspectRatio ratio={1}>
    <img src="..." alt="..." />
  </AspectRatio>
</div>`,
      render: () => (
        <div className="w-40">
          <AspectRatio ratio={1} className="rounded-[var(--radius)] border border-border">
            <Fill label="1 / 1" />
          </AspectRatio>
        </div>
      ),
    },
    {
      title: "竖向 3 / 4",
      description: "ratio 小于 1 即竖向比例，适合人像卡片 / 海报。",
      code: `<div className="w-40">
  <AspectRatio ratio={3 / 4}>
    <img src="..." alt="..." />
  </AspectRatio>
</div>`,
      render: () => (
        <div className="w-40">
          <AspectRatio ratio={3 / 4} className="rounded-[var(--radius)] border border-border">
            <Fill label="3 / 4" />
          </AspectRatio>
        </div>
      ),
    },
  ],
  controls: [{ prop: "ratio", type: "select", options: ["1", "1.7778", "1.3333", "0.75"], defaultValue: "1.7778" }],
  states: [
    {
      name: "16 / 9",
      render: () => (
        <div className="w-64">
          <AspectRatio ratio={16 / 9} className="rounded-[var(--radius)] border border-border">
            <Fill label="16 / 9" />
          </AspectRatio>
        </div>
      ),
    },
    {
      name: "1 / 1",
      render: () => (
        <div className="w-40">
          <AspectRatio ratio={1} className="rounded-[var(--radius)] border border-border">
            <Fill label="1 / 1" />
          </AspectRatio>
        </div>
      ),
    },
    {
      name: "4 / 3",
      render: () => (
        <div className="w-56">
          <AspectRatio ratio={4 / 3} className="rounded-[var(--radius)] border border-border">
            <Fill label="4 / 3" />
          </AspectRatio>
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="w-64">
      <AspectRatio ratio={Number(p.ratio ?? 1.7778)} className="rounded-[var(--radius)] border border-border">
        <Fill label={`ratio ${Number(p.ratio ?? 1.7778).toFixed(2)}`} />
      </AspectRatio>
    </div>
  ),
  toCode: (p) =>
    `<AspectRatio ratio={${Number(p.ratio ?? 1.7778).toFixed(4)}}>\n  <img src="..." alt="..." />\n</AspectRatio>`,
};

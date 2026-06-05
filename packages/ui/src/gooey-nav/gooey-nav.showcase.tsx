"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { GooeyNav } from "./gooey-nav";

const items = [
  { label: "首页", href: "#" },
  { label: "产品", href: "#" },
  { label: "文档", href: "#" },
  { label: "关于", href: "#" },
];

/** 深色底容器，让胶质粒子与药丸高亮清晰可见（点击切换可见迸射） */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-40 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.16 0.02 265)" }}
    >
      {children}
    </div>
  );
}

export const gooeyNavShowcase: ShowcaseSpec = {
  controls: [
    { prop: "particleCount", type: "number", defaultValue: 14, label: "粒子数" },
    { prop: "animationTime", type: "number", defaultValue: 600, label: "动画 ms" },
    { prop: "initialActiveIndex", type: "number", defaultValue: 0, label: "初始选中" },
  ],

  states: [
    {
      name: "default（点击切换看迸射）",
      render: () => (
        <Stage>
          <GooeyNav items={items} />
        </Stage>
      ),
    },
    {
      name: "更密集的粒子",
      render: () => (
        <Stage>
          <GooeyNav items={items} particleCount={24} particleDistances={[110, 14]} />
        </Stage>
      ),
    },
    {
      name: "暖色粒子调色板",
      render: () => (
        <Stage>
          <GooeyNav items={items} colors={[3, 4, 5, 3]} initialActiveIndex={1} />
        </Stage>
      ),
    },
    {
      name: "关闭粒子（仅药丸滑动）",
      render: () => (
        <Stage>
          <GooeyNav items={items} particleCount={0} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <GooeyNav
        items={items}
        particleCount={p.particleCount as number}
        animationTime={p.animationTime as number}
        initialActiveIndex={p.initialActiveIndex as number}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="flex h-40 items-center justify-center rounded-xl"`,
      `     style={{ background: "oklch(0.16 0.02 265)" }}>`,
      `  <GooeyNav`,
      `    items={[`,
      `      { label: "首页", href: "#" },`,
      `      { label: "产品", href: "#" },`,
      `      { label: "文档", href: "#" },`,
      `      { label: "关于", href: "#" },`,
      `    ]}`,
      `    particleCount={${p.particleCount}}`,
      `    animationTime={${p.animationTime}}`,
      `    initialActiveIndex={${p.initialActiveIndex}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};

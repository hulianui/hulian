"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { InfiniteMenu } from "./infinite-menu";
import type { InfiniteMenuItem } from "./infinite-menu.types";

/** 展示用深色底舞台，给球面卡片提供对比 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-80 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.16 0.02 255)" }}
    >
      {children}
    </div>
  );
}

const DEMO_ITEMS: InfiniteMenuItem[] = [
  { title: "概览", description: "项目全局视图", link: "https://example.com" },
  { title: "任务", description: "进行中的工作流" },
  { title: "成员", description: "团队与权限" },
  { title: "文档", description: "知识库与规范" },
  { title: "数据", description: "指标与报表" },
  { title: "设置", description: "偏好与集成" },
  { title: "通知", description: "消息中心" },
  { title: "归档", description: "历史记录" },
];

export const infiniteMenuShowcase: ShowcaseSpec = {
  controls: [
    { prop: "scale", type: "number", defaultValue: 1, label: "球体缩放" },
    { prop: "itemSize", type: "number", defaultValue: 88, label: "卡片直径 px" },
    { prop: "autoRotate", type: "number", defaultValue: 6, label: "自旋 度/秒" },
  ],

  states: [
    {
      name: "default（8 项 · 拖拽旋转）",
      render: () => (
        <Stage>
          <InfiniteMenu items={DEMO_ITEMS} />
        </Stage>
      ),
    },
    {
      name: "图片卡面",
      render: () => (
        <Stage>
          <InfiniteMenu
            items={Array.from({ length: 10 }, (_, i) => ({
              title: `画廊 ${i + 1}`,
              description: "可拖拽浏览",
              image: `https://picsum.photos/seed/hulian-${i}/200/200`,
              link: "https://example.com",
            }))}
          />
        </Stage>
      ),
    },
    {
      name: "大卡片 · 放大球",
      render: () => (
        <Stage>
          <InfiniteMenu items={DEMO_ITEMS} scale={1.15} itemSize={104} />
        </Stage>
      ),
    },
    {
      name: "关闭自动旋转（仅拖拽）",
      render: () => (
        <Stage>
          <InfiniteMenu items={DEMO_ITEMS} autoRotate={0} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <InfiniteMenu
        items={DEMO_ITEMS}
        scale={p.scale as number}
        itemSize={p.itemSize as number}
        autoRotate={p.autoRotate as number}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-80 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.16 0.02 255)" }}>`,
      `  <InfiniteMenu`,
      `    items={items}`,
      `    scale={${p.scale}}`,
      `    itemSize={${p.itemSize}}`,
      `    autoRotate={${p.autoRotate}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};

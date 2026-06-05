"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { CircularGallery } from "./circular-gallery";

/** 深色舞台容器，给 WebGL 卡片轨道足够对比与高度（拖拽 / 滚轮平移）。 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-72 w-full max-w-2xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

const SAMPLE = [
  { text: "瀚枢" },
  { text: "瀚舵" },
  { text: "瀚舰" },
  { text: "瀚付" },
  { text: "瀚播" },
  { text: "瀚云" },
  { text: "瀚库" },
  { text: "瀚审" },
];

export const circularGalleryShowcase: ShowcaseSpec = {
  controls: [
    { prop: "bend", type: "number", defaultValue: 3, label: "弧形强度" },
    { prop: "borderRadius", type: "number", defaultValue: 0.05, label: "卡片圆角" },
    { prop: "scrollSpeed", type: "number", defaultValue: 2, label: "滚动灵敏度" },
    { prop: "scrollEase", type: "number", defaultValue: 0.05, label: "惯性缓动" },
  ],

  states: [
    {
      name: "default（内置占位卡 · 向下凹弧）",
      render: () => (
        <Stage>
          <CircularGallery />
        </Stage>
      ),
    },
    {
      name: "平直排列（bend=0）",
      render: () => (
        <Stage>
          <CircularGallery bend={0} items={SAMPLE} />
        </Stage>
      ),
    },
    {
      name: "向上凸弧（bend=-4）+ 圆角卡",
      render: () => (
        <Stage>
          <CircularGallery bend={-4} borderRadius={0.18} items={SAMPLE} />
        </Stage>
      ),
    },
    {
      name: "自定义标题色（chart-2）",
      render: () => (
        <Stage>
          <CircularGallery
            textColor="var(--color-chart-2)"
            items={SAMPLE}
            bend={4}
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <CircularGallery
        bend={p.bend as number}
        borderRadius={p.borderRadius as number}
        scrollSpeed={p.scrollSpeed as number}
        scrollEase={p.scrollEase as number}
        items={SAMPLE}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-72 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <CircularGallery`,
      `    bend={${p.bend}}`,
      `    borderRadius={${p.borderRadius}}`,
      `    scrollSpeed={${p.scrollSpeed}}`,
      `    scrollEase={${p.scrollEase}}`,
      `    items={[{ text: "瀚枢" }, { text: "瀚舵" }]}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};

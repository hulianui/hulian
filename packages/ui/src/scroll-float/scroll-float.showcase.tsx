"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ScrollFloat } from "./scroll-float";

/**
 * 滚动舞台：内部可滚动容器（组件会自动绑定最近可滚动祖先，无需手动传 scrollContainerRef）。
 * 顶部留白收到 h-40：首帧标题已部分拔起、清晰可辨，向下滚动可看完整逐字符浮现。
 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative max-h-72 w-full max-w-xl overflow-auto rounded-xl border border-border bg-surface p-6">
      <p className="flex h-40 items-end justify-center pb-6 text-sm text-muted">
        ↓ 滚动此区域，标题逐字符拔起
      </p>
      {children}
      <div className="h-56" />
    </div>
  );
}

export const scrollFloatShowcase: ShowcaseSpec = {
  controls: [
    { prop: "stagger", type: "number", defaultValue: 0.4, label: "字符错峰 0~1" },
    { prop: "yPercent", type: "number", defaultValue: 120, label: "初始下沉 %" },
    { prop: "scaleY", type: "number", defaultValue: 2.3, label: "初始纵向拉伸" },
    { prop: "scaleX", type: "number", defaultValue: 0.7, label: "初始横向压扁" },
  ],

  states: [
    {
      name: "default（滚动逐字符拔起）",
      render: () => (
        <Stage>
          <ScrollFloat>瑚琏组件库</ScrollFloat>
        </Stage>
      ),
    },
    {
      name: "英文长标题",
      render: () => (
        <Stage>
          <ScrollFloat textClassName="text-3xl md:text-5xl">Scroll Float</ScrollFloat>
        </Stage>
      ),
    },
    {
      name: "强错峰 + 主色文本",
      render: () => (
        <Stage>
          <ScrollFloat stagger={0.7} textClassName="text-primary text-3xl md:text-5xl">
            HULIAN
          </ScrollFloat>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <ScrollFloat
        stagger={p.stagger as number}
        yPercent={p.yPercent as number}
        scaleY={p.scaleY as number}
        scaleX={p.scaleX as number}
      >
        瑚琏组件库
      </ScrollFloat>
    </Stage>
  ),

  toCode: (p) =>
    [
      `{/* 组件自动绑定最近可滚动祖先；无任何滚动上下文时降级为进入视口自动浮现 */}`,
      `<div className="max-h-72 overflow-auto p-6">`,
      `  <div className="h-40" />`,
      `  <ScrollFloat`,
      `    stagger={${p.stagger}}`,
      `    yPercent={${p.yPercent}}`,
      `    scaleY={${p.scaleY}}`,
      `    scaleX={${p.scaleX}}`,
      `  >`,
      `    瑚琏组件库`,
      `  </ScrollFloat>`,
      `  <div className="h-56" />`,
      `</div>`,
    ].join("\n"),
};

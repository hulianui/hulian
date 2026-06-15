"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { TargetCursor } from "./target-cursor";

// 展示用深色舞台：放几个 .cursor-target 命中块，移入即被四角准星框住。
// 组件默认容器作用域（absolute 锚到父容器、只响应容器内指针、离开即隐藏），
// 画廊多 state 多实例互不干扰；hideDefaultCursor 只隐藏舞台内的系统光标，可放心保持默认。
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex h-64 w-full max-w-xl flex-wrap items-center justify-center gap-4 overflow-hidden rounded-xl border border-border p-6"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

function Target({ label }: { label: string }) {
  return (
    <div className="cursor-target rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white/80">
      {label}
    </div>
  );
}

export const targetCursorShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "容器作用域：根节点 absolute 锚到父容器，指针进入即现身，移到 .cursor-target 元素上四角准星展开包裹其包围盒。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl border">
  <button className="cursor-target rounded-lg border px-5 py-3">瞄准我</button>
  <button className="cursor-target rounded-lg border px-5 py-3">也试试这个</button>
  <TargetCursor />
</div>`,
      render: () => (
        <Stage>
          <Target label="瞄准我" />
          <Target label="也试试这个" />
          <TargetCursor />
        </Stage>
      ),
    },
    {
      title: "主色光标 · 快速自转",
      description: "color 传 token 改光标主色，spinDuration 越小四角自转越快。",
      code: `<div className="relative">
  <button className="cursor-target">primary</button>
  <TargetCursor color="var(--color-primary)" spinDuration={0.8} />
</div>`,
      render: () => (
        <Stage>
          <Target label="primary" />
          <Target label="spin 0.8s" />
          <TargetCursor color="var(--color-primary)" spinDuration={0.8} />
        </Stage>
      ),
    },
    {
      title: "黏性包裹",
      description: "hoverDuration 越大，四角包裹目标的缓动越「黏」，吸附手感更慢更顺。",
      code: `<div className="relative">
  <button className="cursor-target">慢慢黏过来</button>
  <TargetCursor color="var(--color-chart-1)" hoverDuration={0.6} />
</div>`,
      render: () => (
        <Stage>
          <Target label="慢慢黏过来" />
          <TargetCursor color="var(--color-chart-1)" hoverDuration={0.6} />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "spinDuration", type: "number", defaultValue: 2, label: "自转秒数" },
    { prop: "hoverDuration", type: "number", defaultValue: 0.2, label: "包裹缓动秒" },
    {
      prop: "color",
      type: "select",
      options: [
        "var(--color-foreground)",
        "var(--color-primary)",
        "var(--color-chart-1)",
      ],
      defaultValue: "var(--color-foreground)",
      label: "光标主色",
    },
  ],

  states: [
    {
      name: "default（移入方块被准星框住）",
      render: () => (
        <Stage>
          <Target label="瞄准我" />
          <Target label="也试试这个" />
          <TargetCursor />
        </Stage>
      ),
    },
    {
      name: "主色光标 · 快速自转",
      render: () => (
        <Stage>
          <Target label="primary" />
          <Target label="spin 0.8s" />
          <TargetCursor color="var(--color-primary)" spinDuration={0.8} />
        </Stage>
      ),
    },
    {
      name: "黏性包裹（hoverDuration 大）",
      render: () => (
        <Stage>
          <Target label="慢慢黏过来" />
          <TargetCursor color="var(--color-chart-1)" hoverDuration={0.6} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Target label="瞄准我" />
      <Target label="再来一个" />
      <TargetCursor
        spinDuration={p.spinDuration as number}
        hoverDuration={p.hoverDuration as number}
        color={p.color as string}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative">`,
      `  <button className="cursor-target">瞄准我</button>`,
      `  <TargetCursor`,
      `    spinDuration={${p.spinDuration}}`,
      `    hoverDuration={${p.hoverDuration}}`,
      `    color="${p.color}"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};

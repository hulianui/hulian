"use client";
import { useEffect, useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button/button";
import { Spin } from "./spin";

// 示例内容盒（被遮罩包裹的内容区）
function SampleBox() {
  return (
    <div className="w-56 rounded-[var(--radius)] border border-border bg-surface p-4 text-sm text-foreground">
      <div className="font-medium">月度报表</div>
      <p className="mt-1 text-muted">数据正在计算中，请稍候。这里是被遮罩覆盖的内容区。</p>
    </div>
  );
}

// fullscreen 需要本地 state 切换 → 局部组件承载（showcase state 渲染函数本身无状态）
function FullscreenDemo() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (on) {
      const t = setTimeout(() => setOn(false), 2000);
      return () => clearTimeout(t);
    }
  }, [on]);
  return (
    <>
      <Button variant="outline" onClick={() => setOn(true)}>
        开整页遮罩(2s)
      </Button>
      {on && <Spin fullscreen tip="加载中…" />}
    </>
  );
}

export const spinShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "包裹内容",
      description: "spinning 时给被包裹的内容盖一层半透明遮罩 + 居中指示器，内容降透明且不可交互。",
      code: `<Spin spinning tip="加载中…">
  <YourContent />
</Spin>`,
      render: () => (
        <Spin spinning tip="加载中…">
          <SampleBox />
        </Spin>
      ),
    },
    {
      title: "加载完成（直出内容）",
      description: "spinning=false 时不渲染遮罩，children 正常显示。",
      code: `<Spin spinning={false}>
  <YourContent />
</Spin>`,
      render: () => (
        <Spin spinning={false}>
          <SampleBox />
        </Spin>
      ),
    },
    {
      title: "纯指示器",
      description: "不传 children 时 Spin 作为独立加载指示器（无遮罩），可带提示文案。",
      code: `<Spin spinning tip="处理中" />`,
      render: () => <Spin spinning tip="处理中" />,
    },
    {
      title: "三尺寸",
      description: "size 透传内部 Spinner，控制指示器大小。",
      code: `<>
  <Spin spinning size="sm" />
  <Spin spinning size="md" />
  <Spin spinning size="lg" />
</>`,
      render: () => (
        <div className="flex items-center gap-8">
          <Spin spinning size="sm" />
          <Spin spinning size="md" />
          <Spin spinning size="lg" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "spinning", type: "boolean", defaultValue: true, label: "加载中" },
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md", label: "尺寸" },
    { prop: "tip", type: "text", defaultValue: "加载中…", label: "提示文案" },
    { prop: "delay", type: "number", defaultValue: 0, label: "延迟显示(ms)" },
  ],
  states: [
    {
      name: "包裹内容(遮罩)",
      render: () => (
        <Spin spinning tip="加载中…">
          <SampleBox />
        </Spin>
      ),
    },
    {
      name: "未加载(直出内容)",
      render: () => (
        <Spin spinning={false}>
          <SampleBox />
        </Spin>
      ),
    },
    {
      name: "纯指示器",
      render: () => <Spin spinning tip="处理中" />,
    },
    {
      name: "三尺寸",
      render: () => (
        <div className="flex items-center gap-8">
          <Spin spinning size="sm" />
          <Spin spinning size="md" />
          <Spin spinning size="lg" />
        </div>
      ),
    },
    {
      name: "整页遮罩",
      render: () => <FullscreenDemo />,
    },
  ],
  renderWithProps: (p) => (
    <Spin
      spinning={p.spinning as boolean}
      size={p.size as "sm" | "md" | "lg"}
      tip={p.tip as string}
      delay={p.delay as number}
    >
      <SampleBox />
    </Spin>
  ),
  toCode: (p) =>
    `<Spin spinning={${p.spinning}} size="${p.size}" tip="${p.tip}" delay={${p.delay}}>\n  {children}\n</Spin>`,
};

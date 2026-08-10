"use client";
import { useRef, useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { Tour } from "./tour";
import type { TourStep } from "./tour.types";

// 自包含演示：渲染若干带 ref 的目标 + 「开始引导」按钮；点击后 Tour 高亮逐步走查。
// Tour 是全屏 overlay（Portal 到 body）→ 截图口径「先点开始再截」（同 Drawer/Popover/Toast）。
function Demo({ maskClosable = false }: { maskClosable?: boolean }) {
  const searchRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLButtonElement>(null);
  const newRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  const steps: TourStep[] = [
    {
      title: "欢迎使用瑚琏",
      description: "30 秒带你认识这个工作台的三处核心功能。",
      // 无 target → 居中开场
    },
    {
      target: () => searchRef.current,
      title: "全局搜索",
      description: "在这里按关键字快速定位任意资源，支持拼音与首字母。",
      placement: "bottom",
    },
    {
      target: () => filterRef.current,
      title: "条件筛选",
      description: "组合多个维度精确过滤当前列表，筛选条会被记住。",
      placement: "bottom",
    },
    {
      target: () => newRef.current,
      title: "新建一条",
      description: "随时从这里创建新记录，快捷键 N 也可触发。",
      placement: "left",
    },
  ];

  const start = () => {
    setCurrent(0);
    setOpen(true);
  };

  return (
    <div className="w-full max-w-xl rounded-[var(--radius)] border border-border bg-surface p-4">
      {/* 模拟工具栏 */}
      <div className="flex items-center gap-3">
        <div
          ref={searchRef}
          className="flex h-9 flex-1 items-center rounded-[var(--radius)] border border-border bg-bg px-3 text-sm text-muted-foreground"
        >
          搜索资源…
        </div>
        <button
          ref={filterRef}
          type="button"
          className="h-9 rounded-[var(--radius)] border border-border bg-bg px-3 text-sm text-foreground"
        >
          筛选
        </button>
        <button
          ref={newRef}
          type="button"
          className="h-9 rounded-[var(--radius)] bg-primary px-3 text-sm text-primary-foreground"
        >
          新建
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">点下方按钮开始新手引导。</p>
        <Button size="sm" onClick={start}>
          开始引导
        </Button>
      </div>

      <Tour
        steps={steps}
        open={open}
        current={current}
        onChange={setCurrent}
        onClose={() => setOpen(false)}
        maskClosable={maskClosable}
      />
    </div>
  );
}

export const tourShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础引导",
      description: "受控 open + current；steps 用 target 函数返回 ref 元素，逐步高亮走查（含无 target 的居中开场步）。点「开始引导」试。",
      code: `const searchRef = useRef<HTMLDivElement>(null);
const [open, setOpen] = useState(false);
const [current, setCurrent] = useState(0);

const steps = [
  { title: "欢迎使用瑚琏", description: "30 秒带你认识三处核心功能。" },
  {
    target: () => searchRef.current,
    title: "全局搜索",
    description: "按关键字快速定位任意资源。",
    placement: "bottom",
  },
];

<>
  <div ref={searchRef}>搜索资源…</div>
  <Button onClick={() => { setCurrent(0); setOpen(true); }}>开始引导</Button>
  <Tour
    steps={steps}
    open={open}
    current={current}
    onChange={setCurrent}
    onClose={() => setOpen(false)}
  />
</>`,
      render: () => <Demo />,
    },
    {
      title: "点遮罩关闭",
      description: "maskClosable 允许点暗色遮罩区直接结束引导（默认 false，防误触）。",
      code: `<Tour
  steps={steps}
  open={open}
  current={current}
  onChange={setCurrent}
  onClose={() => setOpen(false)}
  maskClosable
/>`,
      render: () => <Demo maskClosable />,
    },
  ],
  controls: [
    { prop: "maskClosable", type: "boolean", defaultValue: false, label: "点遮罩关闭" },
  ],
  states: [
    { name: "基础引导（4 步 · 含居中开场）", render: () => <Demo /> },
    { name: "点遮罩可关闭", render: () => <Demo maskClosable /> },
  ],
  renderWithProps: (p) => <Demo maskClosable={Boolean(p.maskClosable)} />,
  toCode: (p) =>
    `const [open, setOpen] = useState(false);\nconst [current, setCurrent] = useState(0);\n\n<Tour\n  open={open}\n  current={current}\n  onChange={setCurrent}\n  onClose={() => setOpen(false)}${p.maskClosable ? "\n  maskClosable" : ""}\n  steps={[\n    { title: \"欢迎\", description: \"开场居中…\" },\n    { target: () => searchRef.current, title: \"全局搜索\", description: \"…\", placement: \"bottom\" },\n    { target: \"#new-btn\", title: \"新建一条\", description: \"…\", placement: \"left\" },\n  ]}\n/>`,
};

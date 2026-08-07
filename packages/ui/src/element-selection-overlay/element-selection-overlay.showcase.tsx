"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { ElementSelectionOverlay } from "./element-selection-overlay";

// 预览区刻意用「裸 DOM + 标记属性」而不是瑚琏组件：本件要展示的就是「在别人的树上选元素」，
// 标记属性怎么打、打了和没打分别是什么路径，才是消费方要看的东西。

/**
 * 「宿主页面上的按钮」对照组：它在 target 之外，选择模式开着时也必须照常可点。
 * 拦截范围一旦再次越界（#109/#113），这里的计数就停住 —— 肉眼可见的回归哨兵。
 */
function HostControl() {
  const [n, setN] = useState(0);
  return (
    <div className="flex items-center gap-2 text-xs text-muted">
      <button
        type="button"
        onClick={() => setN((v) => v + 1)}
        className="rounded-[min(var(--radius),0.375rem)] border border-border bg-surface px-2.5 py-1 text-foreground transition-colors hover:bg-surface-hover"
      >
        宿主页面上的按钮
      </button>
      <span>
        被点击 <span className="tabular-nums text-foreground">{n}</span> 次（选择模式开着时也应该能加）
      </span>
    </div>
  );
}

function PathBar({ selected, hovered }: { selected: string | null; hovered: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
      <span>
        选中：
        <code className="ml-1 rounded-[min(var(--radius),0.25rem)] bg-surface-hover px-1 py-0.5 text-foreground">
          {selected ?? "—"}
        </code>
      </span>
      <span>
        悬停：
        <code className="ml-1 rounded-[min(var(--radius),0.25rem)] bg-surface-hover px-1 py-0.5 text-foreground">
          {hovered ?? "—"}
        </code>
      </span>
    </div>
  );
}

function MarkedDemo({
  showLabel = true,
  enabled = true,
  highlightSelector = "[data-hulian-component]",
}: {
  showLabel?: boolean;
  enabled?: boolean;
  highlightSelector?: string;
}) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full space-y-3">
      <div
        ref={setRoot}
        className="space-y-3 rounded-[calc(var(--radius)+0.25rem)] border border-border bg-bg p-4"
      >
        <div
          data-hulian-component="Hero"
          data-hulian-path="App/Hero"
          className="rounded-[var(--radius)] bg-surface p-4"
        >
          <p className="text-base font-semibold text-foreground">指向编辑预览区</p>
          <p className="mt-1 text-sm text-muted">把指针移进来，点任意一块即可选中。</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div
            data-hulian-component="StatCard"
            data-hulian-path="App/Stats/Revenue"
            className="rounded-[var(--radius)] bg-surface p-3"
          >
            <p className="text-xs text-muted">本月收入</p>
            <p className="text-lg font-semibold tabular-nums text-foreground">¥ 128,400</p>
          </div>
          <div
            data-hulian-component="StatCard"
            data-hulian-path="App/Stats/Orders"
            className="rounded-[var(--radius)] bg-surface p-3"
          >
            <p className="text-xs text-muted">订单数</p>
            <p className="text-lg font-semibold tabular-nums text-foreground">1,204</p>
          </div>
        </div>
        <div
          data-hulian-component="CtaBar"
          data-hulian-path="App/Cta"
          className="flex items-center justify-between rounded-[var(--radius)] bg-surface p-3"
        >
          <span className="text-sm text-foreground">升级到专业版</span>
          <span className="rounded-[min(var(--radius),0.375rem)] bg-primary px-2.5 py-1 text-xs text-primary-foreground">
            立即升级
          </span>
        </div>
      </div>
      <ElementSelectionOverlay
        target={root}
        enabled={enabled}
        showLabel={showLabel}
        highlightSelector={highlightSelector || undefined}
        selectedPath={selected}
        onSelect={(path) => setSelected(path)}
        onClear={() => setSelected(null)}
        onHover={(path) => setHovered(path)}
      />
      <PathBar selected={selected} hovered={hovered} />
      <HostControl />
    </div>
  );
}

function StructuralDemo() {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full space-y-3">
      <div
        ref={setRoot}
        className="space-y-2 rounded-[calc(var(--radius)+0.25rem)] border border-border bg-bg p-4"
      >
        <section className="rounded-[var(--radius)] bg-surface p-3 text-sm text-foreground">
          第一段（未打任何标记）
        </section>
        <section className="rounded-[var(--radius)] bg-surface p-3">
          <p className="text-sm text-foreground">第二段里有一个按钮：</p>
          <button
            type="button"
            className="mt-2 rounded-[min(var(--radius),0.375rem)] border border-border px-2.5 py-1 text-xs text-foreground"
          >
            我是按钮
          </button>
        </section>
      </div>
      <ElementSelectionOverlay
        target={root}
        selectedPath={selected}
        onSelect={(path) => setSelected(path)}
        onClear={() => setSelected(null)}
        onHover={(path) => setHovered(path)}
      />
      <PathBar selected={selected} hovered={hovered} />
    </div>
  );
}

const FRAME_DOC = `<!doctype html><html><body style="margin:0;font:14px/1.5 system-ui;background:#fff;color:#111">
<div data-hulian-component="Nav" data-hulian-path="Site/Nav" style="padding:12px 16px;border-bottom:1px solid #e5e7eb">导航栏</div>
<div data-hulian-component="Article" data-hulian-path="Site/Article" style="padding:16px">
  <h1 style="margin:0 0 8px;font-size:18px">iframe 里的文章标题</h1>
  <p style="margin:0;color:#6b7280">这段内容在同源 iframe 内，叠加层依然能选中它。</p>
</div>
</body></html>`;

function IframeDemo() {
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full space-y-3">
      <iframe
        ref={setFrame}
        title="同源预览"
        srcDoc={FRAME_DOC}
        className="h-48 w-full rounded-[calc(var(--radius)+0.25rem)] border border-border bg-bg"
      />
      <ElementSelectionOverlay
        target={frame}
        selectedPath={selected}
        onSelect={(path) => setSelected(path)}
        onClear={() => setSelected(null)}
        onHover={(path) => setHovered(path)}
      />
      <PathBar selected={selected} hovered={hovered} />
    </div>
  );
}

export const elementSelectionOverlayShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法（标记驱动）",
      description:
        "预览树自己打了 data-hulian-path / data-hulian-component，选中即回吐标记路径；highlightSelector 把选择粒度限定到组件级。",
      code: `const [root, setRoot] = useState<HTMLDivElement | null>(null);
const [selected, setSelected] = useState<string | null>(null);

<div ref={setRoot}>
  <div data-hulian-component="Hero" data-hulian-path="App/Hero">…</div>
  <div data-hulian-component="CtaBar" data-hulian-path="App/Cta">…</div>
</div>

<ElementSelectionOverlay
  target={root}
  highlightSelector="[data-hulian-component]"
  selectedPath={selected}
  onSelect={(path) => setSelected(path)}
  onClear={() => setSelected(null)}
/>`,
      render: () => <MarkedDemo />,
    },
    {
      title: "无标记回退结构化路径",
      description:
        "预览树没打标记时，路径退化为可被 querySelector 反查的 CSS 选择器（div > section:nth-of-type(2) > button）。",
      code: `<ElementSelectionOverlay
  target={root}
  selectedPath={selected}
  onSelect={(path) => setSelected(path)}
/>`,
      render: () => <StructuralDemo />,
    },
    {
      title: "同源 iframe 预览",
      description:
        "target 传 iframe 元素即可接管其文档；框画在宿主层，坐标已叠加 iframe 偏移。跨源 iframe 不支持，会走 onError。",
      code: `const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);

<iframe ref={setFrame} srcDoc={html} title="预览" />
<ElementSelectionOverlay
  target={frame}
  onSelect={(path) => setSelected(path)}
  onError={(e) => console.warn(e.code, e.message)}
/>`,
      render: () => <IframeDemo />,
    },
    {
      title: "关掉标签 / 退出选择模式",
      description: "showLabel=false 只留框；enabled=false 停止拾取与点击拦截，已选中的框仍保留。",
      code: `<ElementSelectionOverlay target={root} showLabel={false} enabled={false} />`,
      render: () => <MarkedDemo showLabel={false} enabled={false} />,
    },
  ],
  controls: [
    { prop: "enabled", type: "boolean", defaultValue: true, label: "选择模式" },
    { prop: "showLabel", type: "boolean", defaultValue: true, label: "显示标签" },
    {
      prop: "highlightSelector",
      type: "text",
      defaultValue: "[data-hulian-component]",
      label: "可选中范围",
    },
  ],
  states: [
    { name: "组件级选择（标记驱动）", render: () => <MarkedDemo /> },
    { name: "任意元素（结构化路径）", render: () => <StructuralDemo /> },
    { name: "同源 iframe", render: () => <IframeDemo /> },
  ],
  renderWithProps: (p) => (
    <MarkedDemo
      enabled={p.enabled as boolean}
      showLabel={p.showLabel as boolean}
      highlightSelector={p.highlightSelector as string}
    />
  ),
  toCode: () => `<ElementSelectionOverlay
  target={previewRoot}
  highlightSelector="[data-hulian-component]"
  selectedPath={selected}
  onSelect={(path, detail) => setSelected(path)}
/>`,
};

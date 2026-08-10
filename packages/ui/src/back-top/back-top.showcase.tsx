"use client";
import { useRef, type ReactNode } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { BackTop } from "./back-top";

// BackTop 默认 fixed 贴视口右下，gallery 里会飘到整页角落；故 demo 用一个滚动框作 target，
// 并 className 覆盖 fixed→absolute 把按钮收进框内（twMerge 同组覆盖），滚动超阈值才淡入。
function BackTopBox({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="relative w-full max-w-md">
      <div
        ref={ref}
        className="h-44 overflow-y-auto rounded-[var(--radius)] border border-border p-4"
      >
        <div className="space-y-3">
          {Array.from({ length: 24 }).map((_, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              滚动内容行 {i + 1} —— 向下滚动 80px 后右下角出现回顶按钮。
            </p>
          ))}
        </div>
      </div>
      <BackTop target={() => ref.current} visibilityHeight={80} className="absolute bottom-3 right-3">
        {children}
      </BackTop>
    </div>
  );
}

export const backTopShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "默认监听 window，滚动超过 visibilityHeight 后右下角淡入回顶钮，点击平滑滚回顶部。",
      code: `<BackTop visibilityHeight={400} />`,
      render: () => <BackTopBox />,
    },
    {
      title: "自定义内容",
      description: "children 替换默认上箭头图标，可放文字或自定义节点。",
      code: `<BackTop visibilityHeight={400}>
  <span className="px-2 text-xs font-medium">顶部</span>
</BackTop>`,
      render: () => (
        <BackTopBox>
          <span className="px-2 text-xs font-medium">顶部</span>
        </BackTopBox>
      ),
    },
    {
      title: "指定滚动容器",
      description:
        "页面滚动体不是 window 时，target 返回该容器元素，监听与回顶都落到它身上。",
      code: `const ref = useRef<HTMLDivElement>(null);

<div ref={ref} className="h-44 overflow-y-auto">{/* 长内容 */}</div>
<BackTop target={() => ref.current} visibilityHeight={80} />`,
      render: () => <BackTopBox />,
    },
  ],
  controls: [],
  states: [
    { name: "默认（滚动框内）", render: () => <BackTopBox /> },
    {
      name: "自定义内容",
      render: () => (
        <BackTopBox>
          <span className="px-2 text-xs font-medium">顶部</span>
        </BackTopBox>
      ),
    },
  ],
  renderWithProps: () => <BackTopBox />,
  toCode: () => `<BackTop visibilityHeight={400} />`,
};

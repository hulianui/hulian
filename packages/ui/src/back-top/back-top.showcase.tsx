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
            <p key={i} className="text-sm text-muted">
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

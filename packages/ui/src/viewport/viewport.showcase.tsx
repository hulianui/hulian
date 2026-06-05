"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Viewport } from "./viewport";

// 内部布局全用「容器变体」(@md/@5xl)，故响应的是 Viewport 容器宽度而非页面：
// 手机→单列 + 头部纵向堆叠；平板→两列 + 头部横向；web(够宽)→三列。
function ResponsiveDemo() {
  const cards = ["访问量", "转化率", "客单价", "留存率", "活跃数", "收入"];
  return (
    <div className="flex min-h-[16rem] flex-col gap-4 p-4">
      <header className="flex flex-col gap-2 @md:flex-row @md:items-center @md:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">数据看板</p>
          <p className="text-xs text-muted">容器越宽，布局越展开</p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-[var(--radius)] bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            新建
          </span>
          <span className="rounded-[var(--radius)] border border-border px-3 py-1 text-xs text-foreground">
            导出
          </span>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @5xl:grid-cols-3">
        {cards.map((t, i) => (
          <div key={t} className="rounded-[var(--radius)] border border-border bg-surface-hover/40 p-3">
            <p className="text-xs text-muted">{t}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{(i + 1) * 123}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const viewportShowcase: ShowcaseSpec = {
  controls: [],
  states: [
    {
      name: "设备切换器（点 web/平板/手机 看容器内重排）",
      render: () => (
        <Viewport controls defaultDevice="phone">
          <ResponsiveDemo />
        </Viewport>
      ),
    },
    {
      name: "手机 390 → 单列纵向",
      render: () => (
        <Viewport device="phone">
          <ResponsiveDemo />
        </Viewport>
      ),
    },
    {
      name: "更宽容器 600 → 自动两列横向",
      render: () => (
        <Viewport width={600} framed={false}>
          <ResponsiveDemo />
        </Viewport>
      ),
    },
  ],
  renderWithProps: () => (
    <Viewport controls defaultDevice="phone">
      <ResponsiveDemo />
    </Viewport>
  ),
  toCode: () =>
    `<Viewport controls defaultDevice="phone">\n  {/* 内部用 @md/@5xl 等容器变体即按容器宽度自适应 */}\n  <div className="grid grid-cols-1 @md:grid-cols-2 @5xl:grid-cols-3">…</div>\n</Viewport>`,
};

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ScrollArea } from "./scroll-area";

describe("ScrollArea", () => {
  it("渲染 children", () => {
    const { getByText } = render(
      <ScrollArea className="h-32 w-48">
        <div>滚动内容</div>
      </ScrollArea>,
    );
    expect(getByText("滚动内容")).toBeTruthy();
  });

  it("默认 vertical：渲染竖向滚动条", () => {
    const { container } = render(
      <ScrollArea className="h-32">
        <div style={{ height: 600 }}>x</div>
      </ScrollArea>,
    );
    expect(container.querySelector('[data-orientation="vertical"]')).toBeTruthy();
  });

  it("horizontal：渲染横向滚动条", () => {
    const { container } = render(
      <ScrollArea orientation="horizontal" className="w-32">
        <div style={{ width: 600 }}>x</div>
      </ScrollArea>,
    );
    expect(container.querySelector('[data-orientation="horizontal"]')).toBeTruthy();
  });

  // #287：Base UI 给 Viewport 内联 overflow:scroll，两轴都能滚；声明了单一方向就要把另一轴锁死，
  // 否则内容宽 1px 也能被触控板横扫且没有滚动条提示。内联样式压不过 → 类名必须带 `!`。
  it("vertical：viewport 锁死横向 overflow（overflow-x-hidden!）", () => {
    const { container } = render(
      <ScrollArea className="h-32">
        <div style={{ height: 600 }}>x</div>
      </ScrollArea>,
    );
    const viewport = container.querySelector(".base-ui-disable-scrollbar");
    expect(viewport?.className).toContain("overflow-x-hidden!");
    expect(viewport?.className).not.toContain("overflow-y-hidden!");
  });

  it("horizontal：viewport 锁死纵向 overflow；both 两轴都不锁", () => {
    const h = render(
      <ScrollArea orientation="horizontal" className="w-32">
        <div style={{ width: 600 }}>x</div>
      </ScrollArea>,
    );
    const hv = h.container.querySelector(".base-ui-disable-scrollbar");
    expect(hv?.className).toContain("overflow-y-hidden!");
    expect(hv?.className).not.toContain("overflow-x-hidden!");
    h.unmount();
    const b = render(
      <ScrollArea orientation="both" className="size-32">
        <div style={{ width: 600, height: 600 }}>x</div>
      </ScrollArea>,
    );
    const bv = b.container.querySelector(".base-ui-disable-scrollbar");
    expect(bv?.className).not.toMatch(/overflow-[xy]-hidden!/);
  });

  it("both：双向滚动条都渲染", () => {
    const { container } = render(
      <ScrollArea orientation="both" className="size-32">
        <div style={{ width: 600, height: 600 }}>x</div>
      </ScrollArea>,
    );
    expect(container.querySelector('[data-orientation="vertical"]')).toBeTruthy();
    expect(container.querySelector('[data-orientation="horizontal"]')).toBeTruthy();
  });

  it("透传 className 到 Root", () => {
    const { container } = render(
      <ScrollArea className="my-sa">
        <div>x</div>
      </ScrollArea>,
    );
    expect(container.querySelector(".my-sa")).toBeTruthy();
  });

  // #340：className 落在 Root 上，裁剪发生在视口 —— 贴边控件的焦点环被整条切掉时，
  // 消费方此前没有任何干净办法给视口留白。
  it("viewportClassName 落到视口上，且能覆盖轴锁", () => {
    const { container } = render(
      <ScrollArea className="h-32" viewportClassName="px-1.5">
        <div style={{ height: 600 }}>x</div>
      </ScrollArea>,
    );
    const viewport = container.querySelector(".base-ui-disable-scrollbar");
    expect(viewport?.className).toContain("px-1.5");
    // 轴锁仍在（消费方没要求去掉）
    expect(viewport?.className).toContain("overflow-x-hidden!");
  });

  it("不传 viewportClassName 时视口类名不变（不塞默认留白）", () => {
    const { container } = render(
      <ScrollArea className="h-32">
        <div style={{ height: 600 }}>x</div>
      </ScrollArea>,
    );
    const viewport = container.querySelector(".base-ui-disable-scrollbar");
    expect(viewport?.className).not.toMatch(/\bpx-/);
  });

  // #342：视口的 height:100% 在只有 max-height 的父层下塌成 auto，于是不滚而是被 Root 裁掉。
  // jsdom 没有布局，测不出「能不能滚」，只能锁住这个类不被后人顺手删掉（真实滚动由浏览器门禁验）。
  it("视口继承 Root 的 max-height，长则封顶滚动、短则紧凑", () => {
    const { container } = render(
      <ScrollArea className="max-h-40">
        <div style={{ height: 600 }}>x</div>
      </ScrollArea>,
    );
    const viewport = container.querySelector(".base-ui-disable-scrollbar");
    expect(viewport?.className).toContain("max-h-[inherit]");
  });
});

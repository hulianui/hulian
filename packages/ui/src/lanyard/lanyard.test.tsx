import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Lanyard } from "./lanyard";

// 结构：根容器 > 锚点钉 + 挂绳 SVG(path) + 工牌(motion div)。
// jsdom 无真实 RAF 物理，仅断言静态渲染 / token 类 / 透传 / 占位内容。
describe("Lanyard", () => {
  it("渲染根容器 + 挂绳 SVG path，不抛错", () => {
    const { container } = render(<Lanyard />);
    expect(container.firstElementChild).not.toBeNull();
    const path = container.querySelector("svg path");
    expect(path).not.toBeNull();
    // path 起点在锚点 (0 0)，证明曲线已绘制。
    expect(path?.getAttribute("d")).toContain("M 0 0 Q");
  });

  it("未传 children 时渲染默认占位工牌标题/副标题", () => {
    const { getByText } = render(<Lanyard title="自定义标题" subtitle="副标题文案" />);
    expect(getByText("自定义标题")).not.toBeNull();
    expect(getByText("副标题文案")).not.toBeNull();
  });

  it("传入 children 时渲染自定义工牌内容，覆盖占位", () => {
    const { getByText, queryByText } = render(
      <Lanyard>
        <span>我的工牌</span>
      </Lanyard>,
    );
    expect(getByText("我的工牌")).not.toBeNull();
    expect(queryByText("瑚琏 · HULIAN")).toBeNull();
  });

  it("ropeColor 透传到挂绳 stroke；默认取 primary token", () => {
    const { container: c1 } = render(<Lanyard />);
    expect(c1.querySelector("svg path")?.getAttribute("stroke")).toBe("var(--color-primary)");

    const { container: c2 } = render(<Lanyard ropeColor="oklch(0.7 0.2 30)" />);
    expect(c2.querySelector("svg path")?.getAttribute("stroke")).toBe("oklch(0.7 0.2 30)");
  });

  it("className / token 类透传到根容器，工牌默认走 surface/border token", () => {
    const { container } = render(<Lanyard className="test-lanyard-class" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-lanyard-class");
    expect(root.className).toContain("select-none");
    // 占位工牌使用 token 背景与描边。
    expect(container.querySelector(".bg-surface.border-border")).not.toBeNull();
  });

  it("拖拽中卸载组件，不泄漏 window 上的 pointermove/pointerup 监听", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { container, unmount } = render(<Lanyard />);
    const card = container.querySelector('[class*="cursor-grab"]') as HTMLElement;
    expect(card).not.toBeNull();

    // 按下抓取：组件在 window 挂 move/up 监听，但未松手（onUp 不触发）。
    fireEvent.pointerDown(card, { clientX: 0 });

    const movesAdded = addSpy.mock.calls.filter(([t]) => t === "pointermove").length;
    const upsAdded = addSpy.mock.calls.filter(([t]) => t === "pointerup").length;
    expect(movesAdded).toBe(1);
    expect(upsAdded).toBe(1);

    // 拖拽途中卸载：unmount cleanup 必须卸掉残留监听，否则泄漏。
    unmount();

    const movesRemoved = removeSpy.mock.calls.filter(([t]) => t === "pointermove").length;
    const upsRemoved = removeSpy.mock.calls.filter(([t]) => t === "pointerup").length;
    expect(movesRemoved).toBeGreaterThanOrEqual(movesAdded);
    expect(upsRemoved).toBeGreaterThanOrEqual(upsAdded);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});

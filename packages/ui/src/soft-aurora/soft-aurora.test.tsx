import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { SoftAurora } from "./soft-aurora";

// jsdom 无真实 WebGL：useGlCanvas 的 setup 会因 getContext 返回 null 而被静默兜底，
// 不抛错；根 div（GL 容器）仍正常渲染。reduced-motion 路径通过 mock matchMedia 触发。

function mockMatchMedia(reduce: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: reduce,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("SoftAurora", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  it("默认渲染根容器（aria-hidden 的 GL 挂载点），不抛错", () => {
    const { container } = render(<SoftAurora />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.getAttribute("aria-hidden")).toBe("true");
    // 默认尺寸类：填满容器
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
  });

  it("className 透传到根容器", () => {
    const { container } = render(<SoftAurora className="test-soft-aurora" />);
    expect(container.firstElementChild?.className).toContain("test-soft-aurora");
  });

  it("style 透传到根容器", () => {
    const { container } = render(<SoftAurora style={{ opacity: 0.5 }} />);
    expect((container.firstElementChild as HTMLElement).style.opacity).toBe("0.5");
  });

  it("reduced-motion 时渲染静态 token 渐变层 + fallback 内容，DOM 不消失", () => {
    mockMatchMedia(true);
    const { container, getByText } = render(
      <SoftAurora fallback={<span>柔光极光</span>} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    // 静态降级层：吃 chart token 的渐变，pointer-events-none
    const layer = container.querySelector("[aria-hidden]") as HTMLElement;
    expect(layer).not.toBeNull();
    expect(layer.className).toContain("var(--color-chart-1)");
    expect(layer.className).toContain("pointer-events-none");
    // fallback 内容仍渲染（reduced 不卸载内容）
    expect(getByText("柔光极光")).not.toBeNull();
  });

  it("reduced-motion 降级层 className 透传到根容器", () => {
    mockMatchMedia(true);
    const { container } = render(<SoftAurora className="reduced-pass" />);
    expect(container.firstElementChild?.className).toContain("reduced-pass");
  });
});

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { PixelCard } from "./pixel-card";

// jsdom 下 HTMLCanvasElement.getContext 默认返回 null，组件 effect 命中 guard 静默退出，
// 不会抛错；这里只断言 DOM 结构 / token 类 / prop 透传 / reduced-motion 路径。
vi.mock("motion/react", () => ({
  useReducedMotion: () => false,
}));

const canvasOf = (c: HTMLElement) => c.querySelector("canvas") as HTMLCanvasElement;

describe("PixelCard", () => {
  it("渲染 根容器 + aria-hidden canvas，getContext 为 null 也不抛错", () => {
    const { container } = render(<PixelCard />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    const canvas = canvasOf(container);
    expect(canvas).not.toBeNull();
    expect(canvas.getAttribute("aria-hidden")).toBe("true");
  });

  it("根容器带瑚琏 token 类（border-border / bg-surface / overflow-hidden）", () => {
    const { container } = render(<PixelCard />);
    const cls = (container.firstElementChild as HTMLElement).className;
    expect(cls).toContain("border-border");
    expect(cls).toContain("bg-surface");
    expect(cls).toContain("overflow-hidden");
  });

  it("children 渲染在像素层上方的 relative z-10 容器中", () => {
    const { getByText } = render(
      <PixelCard>
        <span>Hello Pixel</span>
      </PixelCard>,
    );
    const wrapper = getByText("Hello Pixel").closest("div");
    expect(wrapper?.className).toContain("relative");
    expect(wrapper?.className).toContain("z-10");
  });

  it("noFocus 控制 tabIndex：默认可聚焦(0)，noFocus 时不可聚焦(-1)", () => {
    const { container: c1 } = render(<PixelCard />);
    expect((c1.firstElementChild as HTMLElement).getAttribute("tabindex")).toBe("0");
    const { container: c2 } = render(<PixelCard noFocus />);
    expect((c2.firstElementChild as HTMLElement).getAttribute("tabindex")).toBe("-1");
    // pink 变体默认 noFocus
    const { container: c3 } = render(<PixelCard variant="pink" />);
    expect((c3.firstElementChild as HTMLElement).getAttribute("tabindex")).toBe("-1");
  });

  it("className 与 style 透传到根容器", () => {
    const { container } = render(
      <PixelCard className="test-pixel-class" style={{ width: 200 }} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-pixel-class");
    expect(root.style.width).toBe("200px");
  });
});

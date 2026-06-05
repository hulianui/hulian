import { describe, it, expect, vi, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { DotField } from "./dot-field";

// jsdom 下 canvas.getContext("2d") 通常返回 null（无 canvas 原生绑定），
// 组件内 `if (!ctx) return` 早退，effect 不抛错。这里断言根渲染 + canvas + token/透传。
const canvasOf = (c: HTMLElement) => c.querySelector("canvas") as HTMLCanvasElement | null;

beforeAll(() => {
  // matchMedia stub（useReducedMotion 内部依赖）：默认 reduced=false，走完整动画路径分支。
  if (!globalThis.matchMedia) {
    globalThis.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

describe("DotField", () => {
  it("渲染根容器 + 单个 canvas，不抛错（jsdom 无 2d context 走早退）", () => {
    const { container } = render(<DotField />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.tagName).toBe("DIV");
    expect(canvasOf(container)).not.toBeNull();
  });

  it("根容器为装饰层：aria-hidden + overflow-hidden + relative", () => {
    const { container } = render(<DotField />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toContain("overflow-hidden");
    expect(root.className).toContain("relative");
  });

  it("canvas 绝对铺满容器（absolute inset-0 block）", () => {
    const { container } = render(<DotField />);
    const cv = canvasOf(container)!;
    expect(cv.className).toContain("absolute");
    expect(cv.className).toContain("inset-0");
    expect(cv.className).toContain("h-full");
  });

  it("className 与 style 透传到根容器", () => {
    const { container } = render(
      <DotField className="test-dot-field" style={{ opacity: 0.7 }} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-dot-field");
    expect(root.style.opacity).toBe("0.7");
  });

  it("自定义 prop（dotSpacing / waveAmplitude / sparkle）不影响渲染稳定性", () => {
    const { container } = render(
      <DotField dotSpacing={24} waveAmplitude={4} sparkle color="oklch(0.7 0.2 30)" />,
    );
    expect(container.firstElementChild).not.toBeNull();
    expect(canvasOf(container)).not.toBeNull();
  });
});

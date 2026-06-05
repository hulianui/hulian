import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { WavyBackground } from "./wavy-background";
import { valueNoise2D } from "./wavy-background";

afterEach(cleanup);

// jsdom 无 canvas 2d context；getContext("2d") 返回 null。
// 所有测试断言 DOM 结构、prop 透传、不抛错即可。

describe("WavyBackground — 渲染结构", () => {
  it("渲染 canvas + 内容容器，children 可见", () => {
    const { container, getByText } = render(
      <WavyBackground>
        <span>Hello Waves</span>
      </WavyBackground>,
    );
    // canvas 存在
    expect(container.querySelector("canvas")).not.toBeNull();
    // children 渲染
    expect(getByText("Hello Waves")).toBeTruthy();
  });

  it("无 children 时不抛错", () => {
    expect(() => render(<WavyBackground />)).not.toThrow();
  });

  it("containerClassName 透传到外层根 div", () => {
    const { container } = render(
      <WavyBackground containerClassName="test-container-cls" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-container-cls");
  });

  it("className 透传到内容层 div（z-10）", () => {
    const { container } = render(
      <WavyBackground className="test-content-cls">text</WavyBackground>,
    );
    const contentDiv = container.querySelector(".test-content-cls");
    expect(contentDiv).not.toBeNull();
  });

  it("canvas 带 aria-hidden 且绝对定位类", () => {
    const { container } = render(<WavyBackground />);
    const canvas = container.querySelector("canvas")!;
    expect(canvas.getAttribute("aria-hidden")).toBe("true");
    expect(canvas.className).toContain("absolute");
  });
});

describe("WavyBackground — blur prop → CSS filter", () => {
  it("blur > 0 时 canvas 携带 filter style", () => {
    const { container } = render(<WavyBackground blur={12} />);
    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    // 注意：jsdom 中内联 style 属性
    expect(canvas.style.filter).toBe("blur(12px)");
  });

  it("blur = 0 时 canvas 无 filter", () => {
    const { container } = render(<WavyBackground blur={0} />);
    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas.style.filter).toBe("");
  });
});

describe("WavyBackground — reduced-motion 不崩溃", () => {
  it("prefers-reduced-motion: reduce 下渲染不抛错", () => {
    // mock matchMedia 返回 reduce
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    expect(() => render(<WavyBackground><span>reduce</span></WavyBackground>)).not.toThrow();
    window.matchMedia = original;
  });
});

describe("WavyBackground — prop 边界不报错", () => {
  it("speed=slow 不报错", () => {
    expect(() => render(<WavyBackground speed="slow" />)).not.toThrow();
  });

  it("waveOpacity=0 不报错", () => {
    expect(() => render(<WavyBackground waveOpacity={0} />)).not.toThrow();
  });

  it("colors=[] 不报错", () => {
    expect(() => render(<WavyBackground colors={[]} />)).not.toThrow();
  });

  it("自定义 backgroundFill 不报错", () => {
    expect(() =>
      render(<WavyBackground backgroundFill="#000000" />),
    ).not.toThrow();
  });

  it("containerProps 透传 data 属性到根 div", () => {
    const { container } = render(
      <WavyBackground containerProps={{ "data-testid": "wavy-root" }} />,
    );
    const root = container.querySelector('[data-testid="wavy-root"]');
    expect(root).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 内联 valueNoise2D 纯函数单元测试
// ---------------------------------------------------------------------------
describe("valueNoise2D — 内联噪声纯函数", () => {
  it("给定任意输入输出有界 [-1, 1] 附近（宽松 ±1.05 以覆盖浮点抖动）", () => {
    const samples = [
      [0, 0],
      [1, 1],
      [-1, -1],
      [0.5, 0.5],
      [3.14, 2.71],
      [100, 200],
      [0.001, 999.999],
    ];
    for (const [x, y] of samples) {
      const v = valueNoise2D(x, y);
      expect(v).toBeGreaterThanOrEqual(-1.05);
      expect(v).toBeLessThanOrEqual(1.05);
    }
  });

  it("同一输入确定性——多次调用结果相同", () => {
    const v1 = valueNoise2D(1.5, 2.3);
    const v2 = valueNoise2D(1.5, 2.3);
    expect(v1).toBe(v2);
  });

  it("不同输入产生不同输出（非常数函数）", () => {
    const vals = [
      valueNoise2D(0, 0),
      valueNoise2D(0.7, 0),
      valueNoise2D(0, 0.7),
      valueNoise2D(1.4, 0.7),
    ];
    // 至少两个不同值
    const unique = new Set(vals);
    expect(unique.size).toBeGreaterThan(1);
  });

  it("整数格点附近平滑（相邻差值不超过 0.4）", () => {
    const epsilon = 0.01;
    const v0 = valueNoise2D(1, 1);
    const v1 = valueNoise2D(1 + epsilon, 1);
    const v2 = valueNoise2D(1, 1 + epsilon);
    expect(Math.abs(v0 - v1)).toBeLessThan(0.4);
    expect(Math.abs(v0 - v2)).toBeLessThan(0.4);
  });
});

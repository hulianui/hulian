import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Hyperspeed } from "./hyperspeed";

// jsdom 无真实 WebGL：useGlCanvas 的 GL 建场景在 effect 内、且 ogl 懒加载，
// 失败会被静默 catch，不影响这里对 DOM 结构 / token 类 / prop 透传的断言。
// 默认（matchMedia 在 jsdom 返回 undefined → reduced=false）渲染 canvas 容器分支。

describe("Hyperspeed", () => {
  it("默认渲染单个根 div（canvas 容器分支），aria-hidden，不抛错", () => {
    const { container } = render(<Hyperspeed />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.tagName).toBe("DIV");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("根容器带 block h-full w-full 尺寸类（由父容器控尺寸）", () => {
    const { container } = render(<Hyperspeed />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("block");
    expect(root.className).toContain("h-full");
    expect(root.className).toContain("w-full");
  });

  it("className 透传到根容器", () => {
    const { container } = render(<Hyperspeed className="test-hyperspeed-class" />);
    expect(container.firstElementChild?.className).toContain("test-hyperspeed-class");
  });

  it("style 透传到根容器", () => {
    const { container } = render(<Hyperspeed style={{ opacity: 0.5 }} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.opacity).toBe("0.5");
  });

  it("自定义 speed/density/distortion/fade/颜色 prop 不抛错且仍渲染根容器", () => {
    const { container } = render(
      <Hyperspeed
        speed={2.5}
        density={80}
        distortion={1.5}
        fade={0.8}
        leftColor="oklch(0.7 0.2 30)"
        rightColor="oklch(0.6 0.18 200)"
      />,
    );
    expect(container.firstElementChild).not.toBeNull();
    expect((container.firstElementChild as HTMLElement).getAttribute("aria-hidden")).toBe("true");
  });
});

import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { CurvedLoop, resolveReleaseDirection } from "./curved-loop";

// jsdom 不实现 SVG getComputedTextLength；mock 它让 ready 路径也能被覆盖
beforeAll(() => {
  // @ts-expect-error jsdom 缺该方法，补一个固定宽度
  SVGElement.prototype.getComputedTextLength = function () {
    return 120;
  };
});

describe("CurvedLoop", () => {
  it("渲染根容器 + SVG + token 类（fill-current / text-foreground）", () => {
    const { container } = render(<CurvedLoop text="HULIAN " />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeTruthy();
    const svg = root.querySelector("svg")!;
    const cls = svg.getAttribute("class")!;
    expect(cls).toContain("fill-current");
    expect(cls).toContain("text-foreground");
  });

  it("测量就绪后渲染 textPath 引用内部 path id", () => {
    const { container } = render(<CurvedLoop text="瑚琏 " />);
    const path = container.querySelector("defs path")!;
    const id = path.getAttribute("id")!;
    expect(id).toMatch(/^hl-curve-/);
    const textPath = container.querySelector("textPath")!;
    expect(textPath.getAttribute("href")).toBe(`#${id}`);
  });

  it("curveAmount 改变曲线控制点 d 属性", () => {
    const { container } = render(<CurvedLoop curveAmount={500} />);
    const d = container.querySelector("defs path")!.getAttribute("d")!;
    expect(d).toContain("540"); // 40 + 500
  });

  it("interactive=false → 容器为 cursor-auto", () => {
    const { container } = render(<CurvedLoop interactive={false} />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("cursor-auto");
  });

  it("className / props 透传到 svg", () => {
    const { container } = render(
      <CurvedLoop className="text-primary" data-testid="cl" />,
    );
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("class")).toContain("text-primary");
    expect(svg.getAttribute("data-testid")).toBe("cl");
  });

  describe("resolveReleaseDirection（松手续滚方向）", () => {
    it("纯点击（vel=0）保持当前方向，不翻转 right→left", () => {
      // 这是被修复的 bug：原实现用 vel>0 判方向，vel=0 会强制设成 left，
      // 把自动右滚翻转成左滚。
      expect(resolveReleaseDirection(0, "right")).toBe("right");
      expect(resolveReleaseDirection(0, "left")).toBe("left");
    });

    it("向右拖（vel>0）→ right；向左拖（vel<0）→ left", () => {
      expect(resolveReleaseDirection(8, "left")).toBe("right");
      expect(resolveReleaseDirection(-8, "right")).toBe("left");
    });
  });
});

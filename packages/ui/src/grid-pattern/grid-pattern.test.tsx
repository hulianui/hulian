import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GridPattern } from "./grid-pattern";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("GridPattern", () => {
  it("渲染 svg 且含 pattern + path", () => {
    const { container } = render(<GridPattern />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelector("pattern")).not.toBeNull();
    expect(container.querySelector("path")).not.toBeNull();
  });
  it("width/height 落 pattern；path 用 width/height 构造网格线段", () => {
    const { container } = render(<GridPattern width={50} height={30} />);
    const pattern = container.querySelector("pattern")!;
    expect(pattern.getAttribute("width")).toBe("50");
    expect(pattern.getAttribute("height")).toBe("30");
    expect(container.querySelector("path")!.getAttribute("d")).toBe("M 50 0 L 0 0 0 30");
  });
  it("线走 currentColor（根 stroke-current + text-border），fill=none", () => {
    const { container } = render(<GridPattern />);
    expect(container.querySelector("svg")!.getAttribute("class")).toContain("stroke-current");
    expect(container.querySelector("svg")!.getAttribute("class")).toContain("text-border");
    expect(container.querySelector("path")!.getAttribute("fill")).toBe("none");
  });
  it("strokeDasharray 透传到 path（虚线模式）", () => {
    const { container } = render(<GridPattern strokeDasharray="4 2" />);
    expect(container.querySelector("path")!.getAttribute("stroke-dasharray")).toBe("4 2");
  });
  it("背景层语义：absolute inset-0 + pointer-events-none + aria-hidden", () => {
    const { container } = render(<GridPattern />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("class")).toContain("absolute");
    expect(svg.getAttribute("class")).toContain("inset-0");
    expect(svg.getAttribute("class")).toContain("pointer-events-none");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });
  it("多实例 id 不撞车 + className 透传", () => {
    const { container } = render(
      <>
        <GridPattern className="text-muted" />
        <GridPattern />
      </>,
    );
    const ids = Array.from(container.querySelectorAll("pattern")).map((p) => p.id);
    expect(ids[0]).not.toBe(ids[1]);
    expect(container.querySelector("svg")!.getAttribute("class")).toContain("text-muted");
  });
});

// 见 hulianui/hulian#89：稳定父更新时整棵子树必须 bail out。
describe("GridPattern · memo", () => {
  it("稳定父更新时跳过底纹子树", async () => {
    await expectMemoSkipsSubtree(() => <GridPattern width={20} height={20} />);
  });
});

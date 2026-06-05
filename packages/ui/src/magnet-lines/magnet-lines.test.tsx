import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MagnetLines } from "./magnet-lines";

// jsdom 下 getBoundingClientRect 返回全 0（不抛错），pointermove 监听挂载也安全。
describe("MagnetLines", () => {
  it("渲染 rows×columns 条线段（默认 9×9 = 81）且不抛错", () => {
    const { container } = render(<MagnetLines />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.querySelectorAll("span").length).toBe(81);
  });

  it("rows/columns 控制线段总数与 grid 模板", () => {
    const { container } = render(<MagnetLines rows={3} columns={4} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.querySelectorAll("span").length).toBe(12);
    expect(root.style.gridTemplateColumns).toBe("repeat(4, 1fr)");
    expect(root.style.gridTemplateRows).toBe("repeat(3, 1fr)");
  });

  it("线段吃 token 旋转变量 + will-change，根容器 grid 类", () => {
    const { container } = render(<MagnetLines />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("grid");
    const span = root.querySelector("span") as HTMLElement;
    expect(span.className).toContain("will-change-transform");
    expect(span.className).toContain("[transform:rotate(var(--hulian-magnet-rotate))]");
  });

  it("baseAngle / lineColor / 尺寸 prop 落到内联样式", () => {
    const { container } = render(
      <MagnetLines baseAngle={30} lineColor="oklch(0.7 0.2 30)" lineWidth="2px" lineHeight="20px" containerSize="200px" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe("200px");
    const span = root.querySelector("span") as HTMLElement;
    expect(span.style.getPropertyValue("--hulian-magnet-rotate")).toBe("30deg");
    expect(span.style.backgroundColor).toBe("oklch(0.7 0.2 30)");
    expect(span.style.width).toBe("2px");
    expect(span.style.height).toBe("20px");
  });

  it("className 透传 + 默认线色走 foreground token", () => {
    const { container } = render(<MagnetLines className="test-magnet" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-magnet");
    const span = root.querySelector("span") as HTMLElement;
    expect(span.style.backgroundColor).toContain("var(--color-foreground)");
  });
});

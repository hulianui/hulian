import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GridMotion } from "./grid-motion";

// 网格结构：根容器 > section(径向光晕) > 倾斜网格容器 > 行轨道(translate) > 单元格。
const sectionOf = (c: HTMLElement) =>
  c.querySelector("section") as HTMLElement;
const gridOf = (c: HTMLElement) =>
  c.querySelector("section > div") as HTMLElement;

describe("GridMotion", () => {
  it("默认渲染 4×7=28 个单元（占位文字 Item N），不抛错", () => {
    const { container, getByText } = render(<GridMotion />);
    expect(container.firstElementChild).not.toBeNull();
    expect(sectionOf(container)).not.toBeNull();
    // 倾斜网格容器下应有 4 行轨道
    expect(gridOf(container).children.length).toBe(4);
    expect(getByText("Item 1")).not.toBeNull();
    expect(getByText("Item 28")).not.toBeNull();
  });

  it("rows/columns 自定义维度生效：3×5=15 单元，末位 Item 15 存在", () => {
    const { container, getByText, queryByText } = render(
      <GridMotion rows={3} columns={5} />,
    );
    expect(gridOf(container).children.length).toBe(3);
    expect(getByText("Item 15")).not.toBeNull();
    expect(queryByText("Item 16")).toBeNull();
  });

  it("items 透传：自定义内容渲染，超出部分截断", () => {
    const { getByText, queryByText } = render(
      <GridMotion rows={2} columns={2} items={["甲", "乙", "丙", "丁", "戊"]} />,
    );
    expect(getByText("甲")).not.toBeNull();
    expect(getByText("丁")).not.toBeNull();
    // 第 5 项超出 2×2 容量被截断
    expect(queryByText("戊")).toBeNull();
  });

  it("gradientColor token 写入 section 径向光晕背景", () => {
    const { container } = render(
      <GridMotion gradientColor="var(--color-chart-2)" />,
    );
    expect(sectionOf(container).style.background).toContain(
      "var(--color-chart-2)",
    );
  });

  it("单元格用 token 类（bg-surface / text-foreground / border-border），无写死颜色", () => {
    const { container } = render(<GridMotion />);
    const cell = container.querySelector("section > div > div > div > div");
    expect(cell?.className).toContain("bg-surface");
    expect(cell?.className).toContain("text-foreground");
    expect(cell?.className).toContain("border-border");
  });

  it("className / rotate 透传到根容器与网格容器", () => {
    const { container } = render(
      <GridMotion className="test-grid-motion" rotate={-22} />,
    );
    expect(container.firstElementChild?.className).toContain(
      "test-grid-motion",
    );
    expect(gridOf(container).style.transform).toContain("rotate(-22deg)");
  });
});
// 见 hulianui/hulian#107：解构默认只认 undefined，null 须显式回落。
describe("GridMotion · null 回落", () => {
  it("items 传 null 不抛错，回落内置占位", () => {
    const { container } = render(<GridMotion items={null as never} />);
    expect(container.firstElementChild).not.toBeNull();
  });
});

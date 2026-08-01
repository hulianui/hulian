import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Grid, GridItem } from "./grid";

describe("Grid", () => {
  it("默认 grid + 1 列", () => {
    const { container } = render(<Grid />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains("grid")).toBe(true);
    expect(el.style.gridTemplateColumns).toBe("repeat(1, minmax(0, 1fr))");
  });

  it("cols 写入 gridTemplateColumns", () => {
    const { container } = render(<Grid cols={4} />);
    expect((container.firstElementChild as HTMLElement).style.gridTemplateColumns).toBe(
      "repeat(4, minmax(0, 1fr))",
    );
  });

  it("gap 换算 rem 并写到行列两侧", () => {
    const { container } = render(<Grid gap={4} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.columnGap).toBe("1rem");
    expect(el.style.rowGap).toBe("1rem");
  });

  it("colGap/rowGap 覆盖 gap", () => {
    const { container } = render(<Grid gap={4} colGap={2} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.columnGap).toBe("0.5rem");
    expect(el.style.rowGap).toBe("1rem");
  });

  it("inline → inline-grid", () => {
    const { container } = render(<Grid inline />);
    expect((container.firstElementChild as HTMLElement).classList.contains("inline-grid")).toBe(true);
  });

  it("GridItem colSpan/rowSpan 写 grid-column/row", () => {
    const { container } = render(<GridItem colSpan={2} rowSpan={3} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.gridColumn).toBe("span 2 / span 2");
    expect(el.style.gridRow).toBe("span 3 / span 3");
  });

  it("响应式 cols 出断点类、不写 inline 模板列", () => {
    const { container } = render(<Grid cols={{ base: 1, sm: 2 }} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("grid-cols-1");
    expect(el.className).toContain("sm:grid-cols-2");
    expect(el.style.gridTemplateColumns).toBe("");
  });
});

describe("Grid 响应式断点（hulianui/hulian#61）", () => {
  it("cols 支持 xl / 2xl 档", () => {
    const { container } = render(<Grid cols={{ base: 1, lg: 3, xl: 4, "2xl": 6 }} />);
    const cls = (container.firstElementChild as HTMLElement).className;
    expect(cls).toContain("lg:grid-cols-3");
    expect(cls).toContain("xl:grid-cols-4");
    expect(cls).toContain("2xl:grid-cols-6");
  });
});

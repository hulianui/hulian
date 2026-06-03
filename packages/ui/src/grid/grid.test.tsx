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
});

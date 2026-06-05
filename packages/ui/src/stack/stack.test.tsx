import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Stack } from "./stack";

describe("Stack", () => {
  it("默认 column flex", () => {
    const { container } = render(<Stack />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains("flex")).toBe(true);
    expect(el.classList.contains("flex-col")).toBe(true);
  });

  it("direction=row → flex-row", () => {
    const { container } = render(<Stack direction="row" />);
    expect((container.firstElementChild as HTMLElement).classList.contains("flex-row")).toBe(true);
  });

  it("gap 换算为 rem（× 0.25）", () => {
    const { container } = render(<Stack gap={4} />);
    expect((container.firstElementChild as HTMLElement).style.gap).toBe("1rem");
  });

  it("gap=0 不写 inline gap", () => {
    const { container } = render(<Stack gap={0} />);
    expect((container.firstElementChild as HTMLElement).style.gap).toBe("");
  });

  it("align/justify 映射到 Tailwind 类", () => {
    const { container } = render(<Stack align="center" justify="between" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains("items-center")).toBe(true);
    expect(el.classList.contains("justify-between")).toBe(true);
  });

  it("inline → inline-flex 而非 flex", () => {
    const { container } = render(<Stack inline />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains("inline-flex")).toBe(true);
    expect(el.classList.contains("flex")).toBe(false);
  });

  it("as 透传渲染标签", () => {
    const { container } = render(<Stack as="section" />);
    expect(container.firstElementChild!.tagName).toBe("SECTION");
  });

  it("响应式 direction 出断点类", () => {
    const { container } = render(<Stack direction={{ base: "column", sm: "row" }} />);
    const cls = container.firstElementChild!.className;
    expect(cls).toContain("flex-col");
    expect(cls).toContain("sm:flex-row");
  });
});

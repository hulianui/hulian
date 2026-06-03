import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Spacer } from "./spacer";

describe("Spacer", () => {
  it("默认 x=1 y=1 → 0.25rem 宽高", () => {
    const { container } = render(<Spacer />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe("0.25rem");
    expect(el.style.height).toBe("0.25rem");
  });

  it("x/y 换算为 rem（× 0.25）", () => {
    const { container } = render(<Spacer x={8} y={4} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe("2rem");
    expect(el.style.height).toBe("1rem");
  });

  it("aria-hidden 不进无障碍树", () => {
    const { container } = render(<Spacer />);
    expect(container.firstElementChild!.getAttribute("aria-hidden")).toBe("true");
  });

  it("透传 className", () => {
    const { container } = render(<Spacer className="my-spacer" />);
    expect(container.firstElementChild!.classList.contains("my-spacer")).toBe(true);
  });
});

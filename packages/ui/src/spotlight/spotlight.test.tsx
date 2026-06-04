import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Spotlight } from "./spotlight";

describe("Spotlight", () => {
  it("背景层语义：absolute inset-0 + pointer-events-none + aria-hidden", () => {
    const { container } = render(<Spotlight />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute("class")).toContain("absolute");
    expect(el.getAttribute("class")).toContain("inset-0");
    expect(el.getAttribute("class")).toContain("pointer-events-none");
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("默认径向辉光：primary 渐隐到 bg", () => {
    const { container } = render(<Spotlight />);
    const bg = (container.firstElementChild as HTMLElement).style.background;
    expect(bg).toContain("radial-gradient");
    expect(bg).toContain("var(--color-primary)");
    expect(bg).toContain("var(--color-bg)");
  });

  it("color/intensity/x/y/size/fade 落到渐变参数", () => {
    const { container } = render(
      <Spotlight color="var(--color-success)" intensity={20} x="20%" y="10%" size="100%" fade={40} />,
    );
    const bg = (container.firstElementChild as HTMLElement).style.background;
    expect(bg).toContain("var(--color-success) 20%");
    expect(bg).toContain("at 20% 10%");
    expect(bg).toContain("100% 100%");
    expect(bg).toContain("var(--color-bg) 40%");
  });

  it("className 与 props 透传，style 可叠加", () => {
    const { container } = render(<Spotlight className="opacity-80" data-testid="sp" style={{ zIndex: 1 }} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute("class")).toContain("opacity-80");
    expect(el.getAttribute("data-testid")).toBe("sp");
    expect(el.style.zIndex).toBe("1");
  });
});

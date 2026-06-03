import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { IPhone } from "./iphone";

describe("IPhone", () => {
  it("渲染机身（圆角粗边 foreground）+ 灵动岛", () => {
    const { container } = render(<IPhone />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("rounded-[3rem]");
    expect(root.getAttribute("class")).toContain("border-foreground");
    // 灵动岛
    expect(root.querySelector(".rounded-full")).not.toBeNull();
  });
  it("width 落 style + 9/19.5 比例", () => {
    const { container } = render(<IPhone width={320} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe("320px");
    expect(root.style.aspectRatio).toBe("9 / 19.5");
  });
  it("imageSrc 优先渲染 img；否则 children", () => {
    const withImg = render(<IPhone imageSrc="/s.png" />);
    expect(withImg.container.querySelector("img")?.getAttribute("src")).toBe("/s.png");
    const withChild = render(<IPhone>屏幕</IPhone>);
    expect(withChild.container.textContent).toContain("屏幕");
  });
  it("className/props 透传", () => {
    const { container } = render(<IPhone className="mx-auto" data-testid="ip" />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("mx-auto");
    expect(root.getAttribute("data-testid")).toBe("ip");
  });
});

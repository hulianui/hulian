import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Android } from "./android";

describe("Android", () => {
  it("渲染机身（圆角边框 foreground）+ 打孔摄像头", () => {
    const { container } = render(<Android />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("rounded-[2rem]");
    expect(root.getAttribute("class")).toContain("border-foreground");
    // 摄像头 punch-hole（屏幕内 size-2.5 圆点）
    expect(root.querySelector(".size-2\\.5")).not.toBeNull();
  });
  it("width 落 style + 9/19.5 比例", () => {
    const { container } = render(<Android width={300} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe("300px");
    expect(root.style.aspectRatio).toBe("9 / 19.5");
  });
  it("imageSrc 优先渲染 img；否则 children", () => {
    const withImg = render(<Android imageSrc="/a.png" />);
    expect(withImg.container.querySelector("img")?.getAttribute("src")).toBe("/a.png");
    const withChild = render(<Android>安卓屏</Android>);
    expect(withChild.container.textContent).toContain("安卓屏");
  });
  it("className/props 透传", () => {
    const { container } = render(<Android className="mx-auto" data-testid="ad" />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("mx-auto");
    expect(root.getAttribute("data-testid")).toBe("ad");
  });
});

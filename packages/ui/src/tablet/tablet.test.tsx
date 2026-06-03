import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Tablet } from "./tablet";

describe("Tablet", () => {
  it("渲染机身（圆角边框 foreground）+ 前置摄像头", () => {
    const { container } = render(<Tablet />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("rounded-[1.8rem]");
    expect(root.getAttribute("class")).toContain("border-foreground");
    // 摄像头圆点
    expect(root.querySelector(".rounded-full")).not.toBeNull();
  });
  it("width 落 style；默认机身比例 3/4.2", () => {
    const { container } = render(<Tablet width={400} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe("400px");
    expect(root.style.aspectRatio).toBe("3 / 4.2");
  });
  it("model 预设决定宽度与比例；width 显式传入时优先覆盖宽度", () => {
    const preset = render(<Tablet model="ipad-mini" />);
    const root = preset.container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe("250px");
    expect(root.style.aspectRatio).toBe("3 / 4.55");
    const override = render(<Tablet model="ipad-mini" width={500} />);
    expect((override.container.firstElementChild as HTMLElement).style.width).toBe("500px");
  });
  it("imageSrc 优先渲染 img；否则 children", () => {
    const withImg = render(<Tablet imageSrc="/t.png" />);
    expect(withImg.container.querySelector("img")?.getAttribute("src")).toBe("/t.png");
    const withChild = render(<Tablet>平板屏</Tablet>);
    expect(withChild.container.textContent).toContain("平板屏");
  });
  it("className/props 透传", () => {
    const { container } = render(<Tablet className="mx-auto" data-testid="tb" />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("mx-auto");
    expect(root.getAttribute("data-testid")).toBe("tb");
  });
});

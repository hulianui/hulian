import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CircularText } from "./circular-text";

describe("CircularText", () => {
  it("整段 aria-label，各字 aria-hidden", () => {
    const { container } = render(<CircularText text="ABCD" />);
    const el = container.firstElementChild!;
    expect(el.getAttribute("aria-label")).toBe("ABCD");
    expect(el.querySelectorAll('[aria-hidden="true"]').length).toBe(4);
  });
  it("每字按等分角排布（rotate 步进 90deg / 4 字）", () => {
    const { container } = render(<CircularText text="ABCD" />);
    const spans = container.querySelectorAll<HTMLElement>("span");
    expect(spans[1].style.transform).toContain("rotate(90deg)");
    expect(spans[2].style.transform).toContain("rotate(180deg)");
  });
  it("方形画布尺寸 = 2×radius", () => {
    const { container } = render(<CircularText text="A" radius={60} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe("120px");
    expect(el.style.height).toBe("120px");
  });
  it("className（token）+ 任意 DOM 属性透传到根容器", () => {
    const { container } = render(
      <CircularText text="AB" className="text-primary" data-testid="ct" />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("text-primary");
    expect(el.className).toContain("relative");
    expect(el.getAttribute("data-testid")).toBe("ct");
  });
  it("空文本不抛错且不渲染字符", () => {
    const { container } = render(<CircularText text="" />);
    expect(container.firstElementChild).not.toBeNull();
    expect(container.querySelectorAll("span").length).toBe(0);
  });
});

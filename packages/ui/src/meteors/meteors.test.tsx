import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Meteors } from "./meteors";

describe("Meteors", () => {
  it("useEffect 后渲染 number 颗流星 span（默认 20）", () => {
    const { container } = render(<Meteors number={12} />);
    expect(container.querySelectorAll("span").length).toBe(12);
  });
  it("每颗带 meteor 动画类 + motion-reduce:hidden + 拖尾 div", () => {
    const { container } = render(<Meteors number={3} />);
    const span = container.querySelector("span")!;
    expect(span.getAttribute("class")).toContain("[animation:hulian-meteor");
    expect(span.getAttribute("class")).toContain("motion-reduce:hidden");
    expect(span.querySelector("div")).not.toBeNull();
  });
  it("angle 落 --hulian-meteor-angle（取负）+ 随机 left/duration 落 style", () => {
    const { container } = render(<Meteors number={1} angle={200} />);
    const span = container.querySelector("span") as HTMLElement;
    expect(span.style.getPropertyValue("--hulian-meteor-angle")).toBe("-200deg");
    expect(span.style.left).toMatch(/%$/);
    expect(span.style.animationDuration).toMatch(/s$/);
  });
  it("currentColor 头(bg-current text-muted-foreground) + className 透传", () => {
    const { container } = render(<Meteors number={1} className="text-primary" />);
    const span = container.querySelector("span")!;
    expect(span.getAttribute("class")).toContain("bg-current");
    expect(span.getAttribute("class")).toContain("text-primary");
  });
});

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AccentScope } from "./accent-scope";

describe("AccentScope", () => {
  it("写 data-accent-scope 标记与色相变量", () => {
    const { container } = render(<AccentScope hue={165}>x</AccentScope>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.hasAttribute("data-accent-scope")).toBe(true);
    expect(el.style.getPropertyValue("--hl-accent-hue")).toBe("165");
  });

  it("不传 hue 时不写变量（继承 tokens 注册的初值），默认无过渡", () => {
    const { container } = render(<AccentScope>x</AccentScope>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue("--hl-accent-hue")).toBe("");
    expect(el.style.transition).toBe("");
  });

  it("transition 过渡色相变量；theme 写到同一元素", () => {
    const { container } = render(
      <AccentScope hue={25} transition={900} theme="light">
        x
      </AccentScope>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.transition).toContain("--hl-accent-hue 900ms");
    expect(el.getAttribute("data-theme")).toBe("light");
  });

  it("className / style / 其余属性透传，style 后写者胜", () => {
    const { container } = render(
      <AccentScope hue={10} className="p-4" style={{ color: "red" }} aria-label="区域">
        x
      </AccentScope>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("p-4");
    expect(el.style.color).toBe("red");
    expect(el.getAttribute("aria-label")).toBe("区域");
  });
});

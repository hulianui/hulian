import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { RippleButton } from "./ripple-button";

describe("RippleButton", () => {
  it("渲染 button + children", () => {
    const { container } = render(<RippleButton>点击</RippleButton>);
    expect(container.querySelector("button")!.textContent).toContain("点击");
  });
  it("overflow-hidden（裁切波纹）+ duration 变量", () => {
    const { container } = render(<RippleButton duration="800ms">x</RippleButton>);
    const btn = container.querySelector("button") as HTMLButtonElement;
    expect(btn.getAttribute("class")).toContain("overflow-hidden");
    expect(btn.style.getPropertyValue("--hulian-ripple-duration")).toBe("800ms");
  });
  it("点击后生成一个波纹 span（带 button-ripple 动画类）", () => {
    const { container } = render(<RippleButton>x</RippleButton>);
    const btn = container.querySelector("button")!;
    expect(container.querySelector('[class*="hulian-button-ripple"]')).toBeNull();
    fireEvent.click(btn);
    const ripple = container.querySelector('[class*="hulian-button-ripple"]');
    expect(ripple).not.toBeNull();
    expect(ripple!.getAttribute("class")).toContain("motion-reduce:hidden");
  });
  it("透传原 onClick + className", () => {
    const onClick = vi.fn();
    const { container } = render(<RippleButton onClick={onClick} className="w-40">x</RippleButton>);
    const btn = container.querySelector("button")!;
    expect(btn.getAttribute("class")).toContain("w-40");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

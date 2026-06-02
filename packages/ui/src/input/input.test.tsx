import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { inputShellVariants, Input } from "./input";

describe("inputShellVariants", () => {
  it("默认 md（h-10）", () => {
    expect(inputShellVariants({})).toContain("h-10");
  });
  it("size 变体改高度", () => {
    expect(inputShellVariants({ size: "sm" })).toContain("h-8");
    expect(inputShellVariants({ size: "lg" })).toContain("h-12");
  });
  it("外壳带 invalid/focus-within 钩子", () => {
    const c = inputShellVariants({});
    expect(c).toContain("has-[[data-invalid]]:border-danger");
    expect(c).toContain("focus-within:ring-ring");
  });
});

describe("Input", () => {
  it("invalid 先 destructure 再翻译成 data-invalid + aria-invalid，不裸传 invalid 属性", () => {
    const { container } = render(<Input invalid placeholder="x" />);
    const input = container.querySelector("input")!;
    expect(input.getAttribute("data-invalid")).toBe("");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.hasAttribute("invalid")).toBe(false); // 关键：自定义 invalid 不渲到 DOM
  });
  it("无 invalid / invalid={false} 都不加 data-invalid", () => {
    const a = render(<Input placeholder="x" />);
    expect(a.container.querySelector("input")!.hasAttribute("data-invalid")).toBe(false);
    const b = render(<Input invalid={false} placeholder="x" />);
    expect(b.container.querySelector("input")!.hasAttribute("data-invalid")).toBe(false);
    expect(b.container.querySelector("input")!.hasAttribute("invalid")).toBe(false);
  });
  it("disabled 透传到内层 input（驱动外壳 has-[:disabled]）", () => {
    const { container } = render(<Input disabled placeholder="x" />);
    expect(container.querySelector("input")!.disabled).toBe(true);
  });
  it("渲染前后缀", () => {
    const { getByText } = render(<Input prefix="¥" suffix=".00" />);
    expect(getByText("¥")).toBeTruthy();
    expect(getByText(".00")).toBeTruthy();
  });
});

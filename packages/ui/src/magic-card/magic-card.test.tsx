import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { MagicCard } from "./magic-card";

describe("MagicCard", () => {
  it("渲染 children（z-10 内容层）+ 高光覆盖层", () => {
    const { container } = render(<MagicCard>内容</MagicCard>);
    expect(container.textContent).toContain("内容");
    // 覆盖层 aria-hidden
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
  it("group + surface/border 皮肤 + gradientOpacity 落变量", () => {
    const { container } = render(<MagicCard gradientOpacity={0.3}>x</MagicCard>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("class")).toContain("group");
    expect(root.getAttribute("class")).toContain("bg-surface");
    expect(root.style.getPropertyValue("--hulian-magic-opacity")).toBe("0.3");
  });
  it("group-hover 高光透明度类引用变量", () => {
    const { container } = render(<MagicCard>x</MagicCard>);
    const overlay = container.querySelector('[aria-hidden="true"]')!;
    expect(overlay.getAttribute("class")).toContain("group-hover:opacity-[var(--hulian-magic-opacity)]");
  });
  it("鼠标移动不报错 + className/props 透传", () => {
    const { container } = render(<MagicCard className="w-72" data-testid="mc">x</MagicCard>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("class")).toContain("w-72");
    expect(root.getAttribute("data-testid")).toBe("mc");
    fireEvent.mouseMove(root, { clientX: 10, clientY: 10 });
    fireEvent.mouseLeave(root);
    expect(root).toBeTruthy();
  });
});

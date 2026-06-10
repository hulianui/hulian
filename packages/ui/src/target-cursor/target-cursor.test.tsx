import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TargetCursor } from "./target-cursor";

// jsdom 安全：无真实 rAF 视觉，仅断言根节点渲染、token/动画类、结构、prop 透传。
describe("TargetCursor", () => {
  it("默认容器作用域：根为 absolute 指针图层 + 圆点 + 四角，初始隐藏，不抛错", () => {
    const { container } = render(<TargetCursor />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("absolute");
    expect(root.className).not.toContain("fixed");
    expect(root.className).toContain("pointer-events-none");
    // 容器作用域初始隐藏，指针进入容器才现身
    expect(root.style.opacity).toBe("0");
    // 圆点 1 + 四角 4 = 5 个子 div
    expect(root.querySelectorAll(":scope > div").length).toBe(5);
  });

  it("fullScreen 模式：根为 fixed 全屏图层且不强制初始隐藏", () => {
    const { container } = render(<TargetCursor fullScreen />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("fixed");
    expect(root.className).not.toContain("absolute z-50");
    expect(root.style.opacity).toBe("");
  });

  it("自转动画类 + 目标态暂停 + motion-reduce 禁用类", () => {
    const { container } = render(<TargetCursor />);
    const cls = (container.firstElementChild as HTMLElement).className;
    expect(cls).toContain("[animation:hulian-target-cursor");
    expect(cls).toContain("data-[active=true]:[animation-play-state:paused]");
    expect(cls).toContain("motion-reduce:[animation:none]");
  });

  it("color / spinDuration 落 CSS 变量（token 前缀）", () => {
    const { container } = render(
      <TargetCursor color="var(--color-primary)" spinDuration={4} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--hulian-tc-color")).toBe("var(--color-primary)");
    expect(root.style.getPropertyValue("--hulian-tc-spin")).toBe("4s");
  });

  it("默认 color 为 foreground token，四角描边吃该变量", () => {
    const { container } = render(<TargetCursor />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--hulian-tc-color")).toBe("var(--color-foreground)");
    const corner = root.querySelectorAll(":scope > div")[1] as HTMLElement;
    expect(corner.className).toContain("var(--hulian-tc-color)");
  });

  it("className / style 透传到根，根带 aria-hidden", () => {
    const { container } = render(
      <TargetCursor className="test-tc" style={{ opacity: 0.5 }} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-tc");
    expect(root.style.opacity).toBe("0.5");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });
});

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { CardSwap } from "./card-swap";

// jsdom 无真实 3D / requestAnimationFrame 排程：useAnimate 在测试环境 no-op，
// 这里只断言结构、token 类、prop 透传与 reduced-motion 路径不抛错。

describe("CardSwap", () => {
  it("渲染根容器 + 透视/锚点 token 类，不抛错", () => {
    const { container } = render(
      <CardSwap>
        <CardSwap.Card>A</CardSwap.Card>
        <CardSwap.Card>B</CardSwap.Card>
        <CardSwap.Card>C</CardSwap.Card>
      </CardSwap>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("[perspective:900px]");
    expect(root.className).toContain("origin-bottom-right");
    // 三张卡片均渲染
    expect(container.querySelectorAll("[class*='bg-surface']").length).toBe(3);
  });

  it("CardSwap.Card 用语义 token 皮肤 + 3D 保留样式", () => {
    const { container } = render(
      <CardSwap>
        <CardSwap.Card>only</CardSwap.Card>
        <CardSwap.Card>two</CardSwap.Card>
      </CardSwap>,
    );
    const card = container.querySelector("[class*='bg-surface']") as HTMLElement;
    expect(card.className).toContain("border-border");
    expect(card.className).toContain("text-foreground");
    expect(card.style.transformStyle).toBe("preserve-3d");
  });

  it("width/height 落到每张卡片内联样式", () => {
    const { container } = render(
      <CardSwap width={320} height={200}>
        <CardSwap.Card>A</CardSwap.Card>
        <CardSwap.Card>B</CardSwap.Card>
      </CardSwap>,
    );
    const card = container.querySelector("[class*='bg-surface']") as HTMLElement;
    expect(card.style.width).toBe("320px");
    expect(card.style.height).toBe("200px");
  });

  it("onCardClick 透传原始索引", () => {
    const onCardClick = vi.fn();
    const { container } = render(
      <CardSwap onCardClick={onCardClick}>
        <CardSwap.Card>A</CardSwap.Card>
        <CardSwap.Card>B</CardSwap.Card>
      </CardSwap>,
    );
    const cards = container.querySelectorAll("[class*='bg-surface']");
    (cards[1] as HTMLElement).click();
    expect(onCardClick).toHaveBeenCalledWith(1);
  });

  it("className/style 透传根容器；单卡片不轮换也不抛错", () => {
    const { container } = render(
      <CardSwap className="test-card-swap" style={{ opacity: 0.5 }}>
        <CardSwap.Card>solo</CardSwap.Card>
      </CardSwap>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-card-swap");
    expect(root.style.opacity).toBe("0.5");
  });
});

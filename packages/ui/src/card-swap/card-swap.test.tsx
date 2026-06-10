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

  it("width/height 落到组件自有的槽位 wrapper（卡片填满 wrapper）", () => {
    const { container } = render(
      <CardSwap width={320} height={200}>
        <CardSwap.Card>A</CardSwap.Card>
        <CardSwap.Card>B</CardSwap.Card>
      </CardSwap>,
    );
    const card = container.querySelector("[class*='bg-surface']") as HTMLElement;
    const wrapper = card.parentElement as HTMLElement;
    expect(wrapper.style.width).toBe("320px");
    expect(wrapper.style.height).toBe("200px");
    // 负 margin 自居中由 wrapper 承担
    expect(wrapper.style.marginLeft).toBe("-160px");
    expect(wrapper.style.marginTop).toBe("-100px");
    // 卡片本体填满槽位
    expect(card.className).toContain("h-full");
    expect(card.className).toContain("w-full");
  });

  it("children 是不转发 ref 的包装组件时，仍有组件自有 wrapper 承载定位（轮换不依赖 children 配合）", () => {
    function Wrapped({ label }: { label: string }) {
      return <CardSwap.Card>{label}</CardSwap.Card>;
    }
    const { container } = render(
      <CardSwap width={300} height={180}>
        <Wrapped label="A" />
        <Wrapped label="B" />
        <Wrapped label="C" />
      </CardSwap>,
    );
    const root = container.firstElementChild as HTMLElement;
    // 每个 child 外面都有一个组件自有的 absolute wrapper，宽高/居中 margin 齐备
    const wrappers = Array.from(root.children) as HTMLElement[];
    expect(wrappers.length).toBe(3);
    for (const w of wrappers) {
      expect(w.className).toContain("absolute");
      expect(w.style.width).toBe("300px");
      expect(w.style.marginLeft).toBe("-150px");
    }
  });

  it("Fragment 包裹的多张卡被展开为多个槽位 wrapper（total 数对、轮换门控不被骗过）", () => {
    const { container } = render(
      <CardSwap width={300} height={180}>
        <>
          <CardSwap.Card>A</CardSwap.Card>
          <CardSwap.Card>B</CardSwap.Card>
          <CardSwap.Card>C</CardSwap.Card>
        </>
      </CardSwap>,
    );
    const root = container.firstElementChild as HTMLElement;
    // Children.toArray 不拆 Fragment，组件须自行展开：3 张卡 = 3 个独立 wrapper
    expect(root.children.length).toBe(3);
    for (const w of Array.from(root.children) as HTMLElement[]) {
      expect(w.className).toContain("absolute");
      expect(w.style.width).toBe("300px");
    }
  });

  it('placement="center" 按错位距离把整摞包围盒居中（默认仍为右下锚定）', () => {
    const { container } = render(
      <CardSwap placement="center" cardDistance={56} verticalDistance={64}>
        <CardSwap.Card>A</CardSwap.Card>
        <CardSwap.Card>B</CardSwap.Card>
        <CardSwap.Card>C</CardSwap.Card>
      </CardSwap>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("left-1/2");
    expect(root.className).toContain("top-1/2");
    expect(root.className).not.toContain("origin-bottom-right");
    // spreadX = 2*56 = 112 → -56px；spreadY = 2*64 = 128 → +64px
    expect(root.style.transform).toBe("translate(calc(-50% - 56px), calc(-50% + 64px))");
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

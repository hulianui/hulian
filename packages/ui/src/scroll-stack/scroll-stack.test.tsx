import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ScrollStack, ScrollStackItem } from "./scroll-stack";

describe("ScrollStack", () => {
  it("渲染滚动容器 + token 类（overflow-y-auto / overscroll-contain）", () => {
    const { container } = render(
      <ScrollStack>
        <ScrollStackItem>卡片 A</ScrollStackItem>
        <ScrollStackItem>卡片 B</ScrollStackItem>
      </ScrollStack>,
    );
    const root = container.firstElementChild!;
    const cls = root.getAttribute("class")!;
    expect(cls).toContain("overflow-y-auto");
    expect(cls).toContain("[overscroll-behavior:contain]");
  });

  it("ScrollStackItem 带识别标记 + token 皮肤类，且渲染内容", () => {
    const { container, getByText } = render(
      <ScrollStack>
        <ScrollStackItem>内容卡</ScrollStackItem>
      </ScrollStack>,
    );
    expect(getByText("内容卡")).toBeTruthy();
    const card = container.querySelector("[data-scroll-stack-card]")!;
    const cls = card.getAttribute("class")!;
    expect(cls).toContain("bg-surface");
    expect(cls).toContain("border-border");
    expect(cls).toContain("shadow-lg");
  });

  it("末尾占位元素存在（钉住释放用）", () => {
    const { container } = render(
      <ScrollStack>
        <ScrollStackItem>x</ScrollStackItem>
      </ScrollStack>,
    );
    expect(container.querySelector("[data-scroll-stack-end]")).toBeTruthy();
  });

  it("className / style 透传到根容器", () => {
    const { container } = render(
      <ScrollStack className="ring-1" style={{ height: "300px" }}>
        <ScrollStackItem>x</ScrollStackItem>
      </ScrollStack>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("class")).toContain("ring-1");
    expect(root.style.height).toBe("300px");
  });

  it("itemClassName 追加到单卡，多卡均被标记", () => {
    const { container } = render(
      <ScrollStack>
        <ScrollStackItem itemClassName="custom-card">A</ScrollStackItem>
        <ScrollStackItem>B</ScrollStackItem>
      </ScrollStack>,
    );
    const cards = container.querySelectorAll("[data-scroll-stack-card]");
    expect(cards.length).toBe(2);
    expect(cards[0].getAttribute("class")).toContain("custom-card");
  });
});

import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { MagicBento } from "./magic-bento";

// jsdom 无真实布局：getBoundingClientRect 返回全 0，pointer 计算得 NaN/0% 也不应抛错。
const cardsOf = (c: HTMLElement) =>
  Array.from(c.querySelectorAll("[data-magic-bento-card]")) as HTMLElement[];

describe("MagicBento", () => {
  it("默认渲染内置示例卡片（6 张），根容器为 grid，不抛错", () => {
    const { container } = render(<MagicBento />);
    expect(container.firstElementChild?.className).toContain("grid");
    expect(cardsOf(container).length).toBe(6);
  });

  it("items prop 生效：卡片数量与 label/title/description 文案渲染", () => {
    const { container, getByText } = render(
      <MagicBento
        items={[
          { label: "标签", title: "标题", description: "描述文案" },
          { label: "B", title: "T2", description: "D2" },
        ]}
      />,
    );
    expect(cardsOf(container).length).toBe(2);
    expect(getByText("标题")).toBeTruthy();
    expect(getByText("描述文案")).toBeTruthy();
  });

  it("token 类存在：卡片带 border-border / bg-surface / text token，描边光呼吸关键帧默认开启", () => {
    const { container } = render(<MagicBento />);
    const card = cardsOf(container)[0]!;
    expect(card.className).toContain("border-border");
    expect(card.className).toContain("bg-surface");
    expect(card.className).toContain("[animation:hulian-magic-bento");
    expect(card.className).toContain("motion-reduce:[animation:none]");
  });

  it("glowColor 与 spotlightRadius 写入卡片 CSS 变量", () => {
    const { container } = render(
      <MagicBento glowColor="var(--color-chart-2)" spotlightRadius={420} />,
    );
    const card = cardsOf(container)[0]!;
    expect(card.style.getPropertyValue("--hl-mb-glow")).toBe("var(--color-chart-2)");
    expect(card.style.getPropertyValue("--hl-mb-radius")).toBe("420px");
  });

  it("pointer 交互更新光晕 CSS 变量，jsdom 下不抛错", () => {
    const { container } = render(<MagicBento />);
    const card = cardsOf(container)[0]!;
    expect(() => {
      fireEvent.pointerMove(card, { clientX: 10, clientY: 10 });
      fireEvent.pointerLeave(card);
    }).not.toThrow();
    // 离开后强度归零
    expect(card.style.getPropertyValue("--hl-mb-glow-intensity")).toBe("0");
  });

  it("disableAnimations 时不绑定 pointer 处理（DOM 仍渲染全部卡片）", () => {
    const { container } = render(<MagicBento disableAnimations />);
    const card = cardsOf(container)[0]!;
    // 关闭交互后 pointerMove 不写入坐标变量
    fireEvent.pointerMove(card, { clientX: 5, clientY: 5 });
    expect(card.style.getPropertyValue("--hl-mb-x")).toBe("");
    expect(cardsOf(container).length).toBe(6);
  });

  it("className 与 columns 透传到根容器", () => {
    const { container } = render(
      <MagicBento className="test-mb-class" columns={3} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-mb-class");
    expect(root.style.gridTemplateColumns).toContain("repeat(3");
  });
});

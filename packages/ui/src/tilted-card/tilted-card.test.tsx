import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { TiltedCard } from "./tilted-card";

describe("TiltedCard", () => {
  it("渲染根 figure + perspective + className/props 透传", () => {
    const { container } = render(
      <TiltedCard className="my-card" data-testid="tc" captionText="提示" />,
    );
    const fig = container.querySelector("figure")!;
    expect(fig).toBeTruthy();
    const cls = fig.getAttribute("class")!;
    expect(cls).toContain("[perspective:800px]");
    expect(cls).toContain("my-card");
    expect(fig.getAttribute("data-testid")).toBe("tc");
  });

  it("传 imageSrc 渲染 img；children 用 token 卡面", () => {
    const { container, rerender } = render(
      <TiltedCard imageSrc="/x.png" altText="封面" />,
    );
    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("/x.png");
    expect(img.getAttribute("alt")).toBe("封面");

    rerender(
      <TiltedCard>
        <span>卡面内容</span>
      </TiltedCard>,
    );
    expect(container.textContent).toContain("卡面内容");
    expect(container.querySelector(".bg-surface")).toBeTruthy();
  });

  it("showTooltip 控制提示气泡；overlay 受 display 开关", () => {
    const { container, rerender } = render(
      <TiltedCard captionText="hi" showTooltip={false} />,
    );
    expect(container.querySelector("figcaption")).toBeNull();

    rerender(
      <TiltedCard
        overlayContent={<b>角标</b>}
        displayOverlayContent
        showTooltip
        captionText="hi"
      />,
    );
    expect(container.querySelector("figcaption")).toBeTruthy();
    expect(container.textContent).toContain("角标");
  });

  it("指针移动/进入/离开不抛错（jsdom 无真实布局也安全）", () => {
    const { container } = render(<TiltedCard captionText="提示" />);
    const fig = container.querySelector("figure")!;
    expect(() => {
      fireEvent.pointerEnter(fig);
      fireEvent.pointerMove(fig, { clientX: 40, clientY: 30 });
      fireEvent.pointerLeave(fig);
    }).not.toThrow();
  });
});

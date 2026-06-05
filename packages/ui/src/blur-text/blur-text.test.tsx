import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BlurText } from "./blur-text";

describe("BlurText", () => {
  it("根为 <p> 且整段挂 aria-label（屏幕阅读器读整句）", () => {
    const { container } = render(<BlurText text="瑚琏出品" />);
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("P");
    expect(root.getAttribute("aria-label")).toBe("瑚琏出品");
  });

  it("word 模式按空白切并原样保留空白（文本完整）", () => {
    const { container } = render(<BlurText text="hi there world" />);
    expect(container.textContent).toBe("hi there world");
  });

  it("char 模式逐字 → 三字三段，各段 aria-hidden", () => {
    const { container } = render(<BlurText text="一二三" splitType="char" />);
    const hidden = container.querySelectorAll('[aria-hidden="true"]');
    expect(hidden.length).toBe(3);
  });

  it("各段带 will-change（GPU 合成）且 className/props 透传根节点", () => {
    const { container } = render(
      <BlurText text="x y" className="text-xl" data-testid="bt" />,
    );
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("text-xl");
    expect(root.getAttribute("data-testid")).toBe("bt");
    // 至少一个可见段带 will-change（性能：只动 transform/filter/opacity）
    const spans = Array.from(container.querySelectorAll("span"));
    const hasWillChange = spans.some((s) =>
      (s.getAttribute("class") ?? "").includes("will-change-[transform,filter,opacity]"),
    );
    expect(hasWillChange).toBe(true);
  });

  it("reduced-motion 下内容仍完整渲染（DOM 两态一致，不卸载）", () => {
    const { container } = render(<BlurText text="无障碍可读" splitType="char" />);
    expect(container.textContent).toBe("无障碍可读");
  });
});

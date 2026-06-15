import { describe, it, expect } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import { TrueFocus } from "./true-focus";

const wordSpans = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>("span")).filter((s) => s.textContent);

describe("TrueFocus", () => {
  it("按空白切词渲染（三词）", () => {
    const { container } = render(<TrueFocus sentence="one two three" />);
    expect(container.textContent).toContain("one");
    expect(container.textContent).toContain("three");
  });
  it("首词默认聚焦（blur 0），余词模糊", () => {
    const { container } = render(<TrueFocus sentence="a b" blurAmount={5} />);
    const spans = container.querySelectorAll<HTMLElement>(":scope > span");
    expect(spans[0].style.filter).toBe("blur(0px)");
    expect(spans[1].style.filter).toBe("blur(5px)");
  });
  it("borderColor 落到 --hulian-focus-border 变量", () => {
    const { container } = render(<TrueFocus sentence="a b" borderColor="var(--color-primary)" />);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--hulian-focus-border")).toBe("var(--color-primary)");
  });
  it("className / props 透传到根 div + 自定义 separator 切词", () => {
    const { container } = render(
      <TrueFocus sentence="a|b|c" separator="|" className="text-foreground" data-testid="tf" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("text-foreground");
    expect(root.getAttribute("data-testid")).toBe("tf");
    // 只数「词」span：四角框 Corner 也是 span 但文本为空，按非空文本过滤排除
    //（nwsapi 对 :scope > span 锚点处理偏宽松，会把 frame 内的 Corner span 一并计入）。
    const wordSpans = Array.from(root.querySelectorAll("span")).filter((s) => s.textContent);
    expect(wordSpans.length).toBe(3);
  });
  it("受控 sentence 变短：旧 index 越界时收敛，焦点不悬空（手动模式）", () => {
    const { container, rerender } = render(
      <TrueFocus manualMode sentence="a b c d e" />,
    );
    const root = container.firstElementChild as HTMLElement;
    // 手动对焦到末词（index=4）
    act(() => {
      fireEvent.mouseEnter(wordSpans(root)[4]);
    });
    expect(wordSpans(root)[4].style.filter).toBe("blur(0px)");
    // sentence 缩到 2 词：index=4 越界。修复后应收敛到末词（index=1），
    // 始终恰有 1 个聚焦词（blur 0px），不会因越界全部模糊 / 焦点框悬空。
    rerender(<TrueFocus manualMode sentence="a b" />);
    const after = wordSpans(root);
    expect(after.length).toBe(2);
    const focusedCount = after.filter((s) => s.style.filter === "blur(0px)").length;
    expect(focusedCount).toBe(1);
    expect(after[1].style.filter).toBe("blur(0px)");
  });
  it("无 sentence 时用默认句且不抛错（jsdom 无 layout 也安全）", () => {
    const { container } = render(<TrueFocus />);
    expect(container.firstElementChild).not.toBeNull();
    expect(container.textContent).toContain("True");
  });
});

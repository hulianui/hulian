import { describe, it, expect } from "vitest";
import { act, render } from "@testing-library/react";
import { TextCursor } from "./text-cursor";

// jsdom 无真实布局：getBoundingClientRect 返回 0，mousemove 的几何按 0 基准算，
// 但拖尾首个点恒会落下（length===0 分支），足以断言渲染管线。
function move(el: Element, x: number, y: number) {
  el.dispatchEvent(
    new MouseEvent("mousemove", { clientX: x, clientY: y, bubbles: true }),
  );
}

describe("TextCursor", () => {
  it("渲染容器根 + border-border token 类 + props 透传", () => {
    const { container } = render(
      <TextCursor data-testid="tc" className="h-40" />,
    );
    const root = container.firstElementChild!;
    const cls = root.getAttribute("class")!;
    expect(cls).toContain("border-border");
    expect(cls).toContain("overflow-hidden");
    expect(cls).toContain("h-40");
    expect(root.getAttribute("data-testid")).toBe("tc");
  });

  it("光标移动后落下字形（text-foreground token）", () => {
    const { container } = render(<TextCursor text="瑚" />);
    const root = container.firstElementChild!;
    act(() => move(root, 12, 8));
    const glyph = container.querySelector(".text-foreground");
    expect(glyph).not.toBeNull();
    expect(glyph!.textContent).toBe("瑚");
  });

  it("fontSize / text 自定义生效", () => {
    const { container } = render(<TextCursor text="✨" fontSize="3rem" />);
    const root = container.firstElementChild!;
    act(() => move(root, 5, 5));
    const glyph = container.querySelector(".text-foreground") as HTMLElement;
    expect(glyph.textContent).toBe("✨");
    expect(glyph.style.fontSize).toBe("3rem");
  });

  it("children 居中槽渲染", () => {
    const { getByText } = render(
      <TextCursor>
        <span>提示语</span>
      </TextCursor>,
    );
    expect(getByText("提示语")).toBeTruthy();
  });

  it("无残留监听：卸载不抛错", () => {
    const { unmount } = render(<TextCursor removalInterval={20} />);
    expect(() => unmount()).not.toThrow();
  });
});

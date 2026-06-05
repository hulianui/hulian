import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TextPressure } from "./text-pressure";

describe("TextPressure", () => {
  it("逐字符渲染文本到 span（含空格不丢字）", () => {
    const { container } = render(<TextPressure text="Hi" />);
    const spans = container.querySelectorAll("h1 > span");
    expect(spans.length).toBe(2);
    expect(spans[0]!.textContent).toBe("H");
    expect(spans[1]!.textContent).toBe("i");
    // 每个 span 带 data-char（描边 ::after 复制用）
    expect(spans[0]!.getAttribute("data-char")).toBe("H");
  });

  it("文字色默认走 token var(--color-foreground)，非写死白", () => {
    const { container } = render(<TextPressure text="Ab" />);
    const title = container.querySelector("h1") as HTMLElement;
    expect(title.style.color).toContain("--color-foreground");
  });

  it("flex 默认开启 → 标题带 flex / justify-between", () => {
    const { container } = render(<TextPressure text="X" />);
    const cls = container.querySelector("h1")!.getAttribute("class")!;
    expect(cls).toContain("flex");
    expect(cls).toContain("justify-between");
  });

  it("className 透传到根节点 + 默认不注入远程 @font-face", () => {
    const { container } = render(<TextPressure className="my-stage" text="Z" />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("my-stage");
    // 默认无 fontUrl → 不应注入 <style>（无远程字体请求）
    expect(container.querySelector("style")).toBeNull();
  });

  it("传入 fontUrl 时注入 @font-face（本地/自托管字体）", () => {
    const { container } = render(
      <TextPressure text="Q" fontFamily="MyVF" fontUrl="/fonts/my.woff2" />,
    );
    const style = container.querySelector("style");
    expect(style).not.toBeNull();
    expect(style!.innerHTML).toContain("@font-face");
    expect(style!.innerHTML).toContain("/fonts/my.woff2");
  });
});

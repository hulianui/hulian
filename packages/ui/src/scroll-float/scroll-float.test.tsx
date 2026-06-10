import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ScrollFloat } from "./scroll-float";

describe("ScrollFloat", () => {
  it("逐字符拆分（读屏可读完整标题文本）", () => {
    const { container } = render(<ScrollFloat>abc</ScrollFloat>);
    expect(container.textContent).toBe("abc");
    // 三字符 → 三个 inline-block char 包裹
    const chars = container.querySelectorAll("span.inline-block.will-change-transform");
    expect(chars.length).toBe(3);
  });

  it("空格转为 NBSP，避免 inline-block 折叠", () => {
    const { container } = render(<ScrollFloat>a b</ScrollFloat>);
    // a + 空格 + b → 三个 char 包裹；中间那个内容为不换行空格
    const chars = container.querySelectorAll("span.will-change-transform");
    expect(chars.length).toBe(3);
    expect(chars[1].textContent).toBe(" ");
  });

  it("根 h2 带裁切 + text-foreground token，文本层默认字号字重类", () => {
    const { container } = render(<ScrollFloat>X</ScrollFloat>);
    const h2 = container.firstElementChild!;
    expect(h2.tagName).toBe("H2");
    expect(h2.getAttribute("class")).toContain("overflow-hidden");
    expect(h2.getAttribute("class")).toContain("text-foreground");
    const textLayer = h2.firstElementChild!;
    expect(textLayer.getAttribute("class")).toContain("font-black");
  });

  it("className / containerClassName / textClassName / props 透传", () => {
    const { container } = render(
      <ScrollFloat
        className="my-root"
        containerClassName="my-container"
        textClassName="text-2xl"
        data-testid="sf"
      >
        Hi
      </ScrollFloat>,
    );
    const h2 = container.firstElementChild!;
    expect(h2.getAttribute("class")).toContain("my-root");
    expect(h2.getAttribute("class")).toContain("my-container");
    expect(h2.getAttribute("data-testid")).toBe("sf");
    expect(h2.firstElementChild!.getAttribute("class")).toContain("text-2xl");
  });

  it("显式传 scrollContainerRef 不抛错，结构不变", () => {
    const containerRef = { current: document.createElement("div") };
    const { container } = render(<ScrollFloat scrollContainerRef={containerRef}>ab</ScrollFloat>);
    expect(container.textContent).toBe("ab");
    expect(container.querySelectorAll("span.will-change-transform").length).toBe(2);
  });

  it("放进可滚动祖先时自动探测绑定该容器（不抛错、文本完整）", () => {
    const host = document.createElement("div");
    host.style.overflowY = "auto";
    Object.defineProperty(host, "scrollHeight", { value: 400, configurable: true });
    Object.defineProperty(host, "clientHeight", { value: 100, configurable: true });
    document.body.appendChild(host);
    const { container } = render(<ScrollFloat>滚动</ScrollFloat>, { container: host });
    expect(container.textContent).toBe("滚动");
    document.body.removeChild(host);
  });

  it("reduced-motion：渲染清晰标题且文本两态一致，不抛错", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((q: string) => ({
        matches: q.includes("reduce"),
        media: q,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    const { container } = render(<ScrollFloat>abc</ScrollFloat>);
    expect(container.textContent).toBe("abc");
    expect(container.firstElementChild!.tagName).toBe("H2");
    vi.unstubAllGlobals();
  });
});

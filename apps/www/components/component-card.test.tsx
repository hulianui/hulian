import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { ComponentCard } from "./component-card";

// jsdom 没有 ResizeObserver。仓库既有惯例是在测试里桩掉（真实浏览器一律支持，
// 组件里加降级分支只会是永不执行的死代码）——与 preview-thumbnail.test.tsx 同一套。
const RO = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
beforeAll(() => vi.stubGlobal("ResizeObserver", RO));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.stubGlobal("ResizeObserver", RO);
});

const base = {
  slug: "button",
  name: "Button",
  description: "按钮 · CVA 变体 + press 动效",
  categoryKey: "forms",
};

describe("ComponentCard", () => {
  // 这是本组件存在的理由，改坏了画廊会在 hydration 期整片报错。
  it("整卡不是 <a>：链接是绝对定位覆盖层，不做预览内容的祖先", () => {
    const { container } = render(<ComponentCard {...base} />);
    const card = container.querySelector("[data-component-card]")!;
    expect(card.tagName).toBe("DIV");

    const link = card.querySelector("a")!;
    expect(link.className).toContain("absolute");
    expect(link.getAttribute("aria-label")).toBe("Button");
    // 覆盖层里不该再有任何内容（预览和文字都是它的兄弟节点，不是子节点）
    expect(link.children.length).toBe(0);
  });

  it("预览里的交互元素没有被嵌进链接", () => {
    const { container } = render(<ComponentCard {...base} />);
    expect(container.querySelectorAll("a a").length).toBe(0);
    expect(container.querySelectorAll("a button").length).toBe(0);
  });

  it("装饰件不渲染缩略图", () => {
    const { container } = render(
      <ComponentCard {...base} slug="aurora" name="Aurora" categoryKey="decoration" />,
    );
    expect(container.querySelector("[data-component-thumbnail]")).toBeNull();
  });

  it("非装饰件渲染缩略图", () => {
    const { container } = render(<ComponentCard {...base} />);
    expect(container.querySelector("[data-component-thumbnail]")).toBeTruthy();
  });

  it("描述夹断在两行，避免同排卡片高度参差", () => {
    const { container } = render(<ComponentCard {...base} />);
    const p = container.querySelector("p")!;
    expect(p.className).toContain("line-clamp-2");
  });
});

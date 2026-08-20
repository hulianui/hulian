import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComponentThumbnail } from "./component-thumbnail";
import { canPreviewCategory } from "../lib/gallery-preview";
import { CATEGORIES } from "../lib/manifest";

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

// jsdom 没有 IntersectionObserver。useLazyMount 对此的约定是「直接挂载」
// （宁可多渲染也不能让画廊空着），所以下面的用例默认拿到已挂载态。
describe("canPreviewCategory", () => {
  it("装饰件不上活预览（WebGL context 有上限，且缩进小框看不出）", () => {
    expect(canPreviewCategory("decoration")).toBe(false);
  });

  it("其余分类一律上活预览", () => {
    const others = CATEGORIES.map((c) => c.key).filter((k) => k !== "decoration");
    expect(others.length).toBeGreaterThan(0);
    for (const key of others) expect(canPreviewCategory(key)).toBe(true);
  });
});

describe("ComponentThumbnail", () => {
  it("渲染该组件 showcase 的第一个示例", () => {
    render(<ComponentThumbnail slug="button" />);
    // button 的 examples[0] 是「基础用法」那五个变体
    expect(screen.getByText("默认")).toBeTruthy();
  });

  it("纯视觉：不入无障碍树、不可交互", () => {
    const { container } = render(<ComponentThumbnail slug="button" />);
    const host = container.querySelector("[data-component-thumbnail]")!;
    expect(host.getAttribute("aria-hidden")).toBe("true");
    expect(host.className).toContain("pointer-events-none");
  });

  it("未知 slug 不炸，只渲染占位", () => {
    const { container } = render(<ComponentThumbnail slug="not-a-real-component" />);
    const host = container.querySelector("[data-component-thumbnail]")!;
    expect(host).toBeTruthy();
    expect(host.textContent).toBe("");
  });

  it("有 IntersectionObserver 时，进入视口前不渲染示例", () => {
    // 只登记 observe、永不回调 → 停在未挂载态
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    );
    const { container } = render(<ComponentThumbnail slug="button" />);
    const host = container.querySelector("[data-component-thumbnail]")!;
    expect(host.getAttribute("data-mounted")).toBe(null);
    expect(screen.queryByText("默认")).toBeNull();
  });
});

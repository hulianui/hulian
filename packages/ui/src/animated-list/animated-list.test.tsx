import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AnimatedList } from "./animated-list";

// jsdom 无 IntersectionObserver → 给永不触发的桩（同 NumberTicker/TypingAnimation），
// motion 的 whileInView 不崩、停在 initial 态；子项仍在 DOM 可断言渲染。
globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
} as unknown as typeof IntersectionObserver;

describe("AnimatedList", () => {
  it("渲染所有子项", () => {
    const { getByText } = render(
      <AnimatedList>
        <span>一</span>
        <span>二</span>
        <span>三</span>
      </AnimatedList>,
    );
    expect(getByText("一")).toBeTruthy();
    expect(getByText("二")).toBeTruthy();
    expect(getByText("三")).toBeTruthy();
  });

  it("每个子项各自包一层（数量对应）", () => {
    const { container } = render(
      <AnimatedList>
        <span>a</span>
        <span>b</span>
      </AnimatedList>,
    );
    expect(container.firstElementChild!.children).toHaveLength(2);
  });

  it("透传 className 到外壳", () => {
    const { container } = render(
      <AnimatedList className="my-list">
        <span>a</span>
      </AnimatedList>,
    );
    expect(container.firstElementChild!.classList.contains("my-list")).toBe(true);
  });
});

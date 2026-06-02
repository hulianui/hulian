import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { NumberTicker, formatTicker } from "./number-ticker";

// jsdom 无 IntersectionObserver：给永不触发的桩，让 useInView 恒 false（停在起始值，可稳定断言静态渲染）。
// 注：motion 的 useReducedMotion 已内建 `if (window.matchMedia)` 守卫，jsdom 无 matchMedia 不崩，无需打桩。
beforeAll(() => {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
});

describe("formatTicker", () => {
  it("整数千分位", () => {
    expect(formatTicker(1234, 0)).toBe("1,234");
    expect(formatTicker(1234567, 0)).toBe("1,234,567");
  });
  it("零与负数", () => {
    expect(formatTicker(0, 0)).toBe("0");
    expect(formatTicker(-1234, 0)).toBe("-1,234");
  });
  it("小数位", () => {
    expect(formatTicker(99.9, 1)).toBe("99.9");
    expect(formatTicker(3.14159, 2)).toBe("3.14");
    expect(formatTicker(1000, 2)).toBe("1,000.00");
  });
});

describe("NumberTicker", () => {
  it("初始渲染显示格式化的 startValue（IO 桩不触发 → 停在起始值）", () => {
    const { container } = render(<NumberTicker value={1234} startValue={0} />);
    expect(container.querySelector("span")!.textContent).toBe("0");
  });
  it("startValue 带千分位也正确格式化", () => {
    const { container } = render(<NumberTicker value={0} startValue={1000} />);
    expect(container.querySelector("span")!.textContent).toBe("1,000");
  });
  it("含 tabular-nums + text-foreground 皮肤类", () => {
    const { container } = render(<NumberTicker value={1} />);
    const cls = container.querySelector("span")!.className;
    expect(cls).toContain("tabular-nums");
    expect(cls).toContain("text-foreground");
  });
  it("className 与 props（aria-label/data-*）透传", () => {
    const { container } = render(
      <NumberTicker value={1} className="text-2xl" aria-label="计数" data-testid="t" />,
    );
    const span = container.querySelector("span")!;
    expect(span.className).toContain("text-2xl");
    expect(span.getAttribute("aria-label")).toBe("计数");
    expect(span.getAttribute("data-testid")).toBe("t");
  });
});

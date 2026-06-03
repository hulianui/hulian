import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

// 模块级打桩：强制 useReducedMotion 恒 true。
// 必须独立文件——motion 的 useReducedMotion 用全局单例缓存首次结果，
// 同文件后置改 window.matchMedia 已无效（见 carousel.test.tsx 注释）。
vi.mock("motion/react", () => ({ useReducedMotion: () => true }));

import { Carousel } from "./carousel";

beforeAll(() => {
  Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo;
});

describe("Carousel · reduced-motion", () => {
  it("reduced-motion 下 autoplay 强制关闭", () => {
    vi.useFakeTimers();
    const onSelect = vi.fn();
    render(
      <Carousel autoplay autoplayInterval={1000} onSelect={onSelect}>
        <div>一</div>
        <div>二</div>
        <div>三</div>
      </Carousel>,
    );
    vi.advanceTimersByTime(5000);
    expect(onSelect).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("reduced-motion 下手动切换仍可用（无动画但功能在）", () => {
    const onSelect = vi.fn();
    render(
      <Carousel onSelect={onSelect}>
        <div>一</div>
        <div>二</div>
      </Carousel>,
    );
    fireEvent.click(screen.getByRole("button", { name: "下一张" }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});

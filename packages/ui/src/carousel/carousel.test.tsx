import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Carousel } from "./carousel";

// jsdom 无布局：scrollTo 未实现（调用即抛）→ 桩成 noop，让挂载 effect 不崩。
// 指针捕获同理（drag 路径用到，但 jsdom 无），组件已用可选链兜底，这里补桩更稳。
beforeAll(() => {
  Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo;
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
});

afterEach(cleanup);

// 幻灯片作为「多个直接 children」传入（数组会被 Children.toArray 展平成 n 张）。
const slides = (n = 3) =>
  Array.from({ length: n }, (_, i) => <div key={i}>幻灯片 {i + 1}</div>);

const dotsOf = () => screen.getAllByRole("button", { name: /转到第/ });

describe("Carousel", () => {
  it("渲染 region 语义 + 全部幻灯片", () => {
    render(
      <Carousel aria-label="特性轮播">{slides(3)}</Carousel>,
    );
    const region = screen.getByRole("region", { name: "特性轮播" });
    expect(region.getAttribute("aria-roledescription")).toBe("carousel");
    const slideEls = screen
      .getAllByRole("group")
      .filter((el) => el.getAttribute("aria-roledescription") === "slide");
    expect(slideEls).toHaveLength(3);
    expect(screen.getByText("幻灯片 1")).toBeTruthy();
    expect(screen.getByText("幻灯片 3")).toBeTruthy();
  });

  it("渲染圆点指示器：数量=幻灯片数，首个为当前", () => {
    render(
      <Carousel>{slides(4)}</Carousel>,
    );
    const dots = dotsOf();
    expect(dots).toHaveLength(4);
    expect(dots[0].getAttribute("aria-current")).toBe("true");
    expect(dots[1].hasAttribute("aria-current")).toBe(false);
  });

  it("渲染上一张/下一张箭头", () => {
    render(
      <Carousel>{slides(3)}</Carousel>,
    );
    expect(screen.getByRole("button", { name: "上一张" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "下一张" })).toBeTruthy();
  });

  it("非受控：点下一张推进当前圆点", () => {
    render(
      <Carousel>{slides(3)}</Carousel>,
    );
    fireEvent.click(screen.getByRole("button", { name: "下一张" }));
    const dots = dotsOf();
    expect(dots[1].getAttribute("aria-current")).toBe("true");
    expect(dots[0].hasAttribute("aria-current")).toBe(false);
  });

  it("受控：current 决定当前态，点击只回调不自走", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <Carousel current={1} onSelect={onSelect}>{slides(3)}</Carousel>,
    );
    expect(dotsOf()[1].getAttribute("aria-current")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "下一张" }));
    expect(onSelect).toHaveBeenCalledWith(2);
    // 受控未 rerender → 仍停在 1
    expect(dotsOf()[1].getAttribute("aria-current")).toBe("true");

    rerender(
      <Carousel current={2} onSelect={onSelect}>{slides(3)}</Carousel>,
    );
    expect(dotsOf()[2].getAttribute("aria-current")).toBe("true");
  });

  it("点圆点跳到对应索引", () => {
    const onSelect = vi.fn();
    render(
      <Carousel onSelect={onSelect}>{slides(4)}</Carousel>,
    );
    fireEvent.click(screen.getByRole("button", { name: "转到第 3 张" }));
    expect(onSelect).toHaveBeenCalledWith(2);
    expect(dotsOf()[2].getAttribute("aria-current")).toBe("true");
  });

  it("无 loop：边界处箭头禁用、不回调", () => {
    const onSelect = vi.fn();
    render(
      <Carousel onSelect={onSelect}>{slides(3)}</Carousel>,
    );
    const prev = screen.getByRole("button", { name: "上一张" }) as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
    fireEvent.click(prev);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("loop：末尾下一张回绕到首张，箭头不禁用", () => {
    const onSelect = vi.fn();
    render(
      <Carousel loop current={2} onSelect={onSelect}>{slides(3)}</Carousel>,
    );
    const next = screen.getByRole("button", { name: "下一张" }) as HTMLButtonElement;
    expect(next.disabled).toBe(false);
    fireEvent.click(next);
    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it("键盘左右方向键切换", () => {
    const onSelect = vi.fn();
    render(
      <Carousel current={1} onSelect={onSelect}>{slides(3)}</Carousel>,
    );
    const region = screen.getByRole("region");
    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(onSelect).toHaveBeenLastCalledWith(2);
    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(onSelect).toHaveBeenLastCalledWith(0);
  });

  it("autoplay：到点自动推进", () => {
    vi.useFakeTimers();
    const onSelect = vi.fn();
    render(
      <Carousel autoplay autoplayInterval={1000} onSelect={onSelect}>{slides(3)}</Carousel>,
    );
    vi.advanceTimersByTime(1000);
    expect(onSelect).toHaveBeenCalledWith(1);
    vi.useRealTimers();
  });

  it("autoplay 无 loop：停在末张不再推进", () => {
    vi.useFakeTimers();
    const onSelect = vi.fn();
    render(
      <Carousel autoplay autoplayInterval={1000} current={2} onSelect={onSelect}>{slides(3)}</Carousel>,
    );
    vi.advanceTimersByTime(3000);
    expect(onSelect).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("showArrows / showDots 可关闭", () => {
    render(
      <Carousel showArrows={false} showDots={false}>{slides(3)}</Carousel>,
    );
    expect(screen.queryByRole("button", { name: "下一张" })).toBeNull();
    expect(screen.queryByRole("button", { name: /转到第/ })).toBeNull();
  });

  it("单张：不渲染箭头与圆点", () => {
    render(
      <Carousel>
        <div>唯一一张</div>
      </Carousel>,
    );
    expect(screen.queryByRole("button", { name: "下一张" })).toBeNull();
    expect(screen.queryByRole("button", { name: /转到第/ })).toBeNull();
  });

  // reduced-motion 下 autoplay 关闭：见独立文件 carousel.reduced-motion.test.tsx
  // （motion 的 useReducedMotion 单例缓存，须用模块级 vi.mock 隔离，不能同文件后置打桩）

  it("region aria-label 默认值为「轮播」", () => {
    render(
      <Carousel>{slides(2)}</Carousel>,
    );
    expect(screen.getByRole("region").getAttribute("aria-label")).toBe("轮播");
  });

  it("hover 暂停 autoplay，移开恢复", () => {
    vi.useFakeTimers();
    const onSelect = vi.fn();
    render(
      <Carousel autoplay autoplayInterval={1000} onSelect={onSelect}>{slides(3)}</Carousel>,
    );
    const region = screen.getByRole("region");
    fireEvent.pointerEnter(region);
    vi.advanceTimersByTime(3000);
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.pointerLeave(region);
    vi.advanceTimersByTime(1000);
    expect(onSelect).toHaveBeenCalledWith(1);
    vi.useRealTimers();
  });
});

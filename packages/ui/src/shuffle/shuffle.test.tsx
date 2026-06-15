import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Shuffle } from "./shuffle";

// jsdom 下 rAF 存在但帧时序不真实；不依赖动画推进，只断言：
// 根渲染 + token 类 + aria 保真 + prop 透传 + reduced-motion 直落终态。
describe("Shuffle", () => {
  beforeEach(() => {
    // 默认非 reduced-motion
    window.matchMedia = vi.fn().mockImplementation((q: string) => ({
      matches: false,
      media: q,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });
  afterEach(() => vi.restoreAllMocks());

  it("渲染根标签 + 终态文本走 aria-label（乱码态对读屏保真）", () => {
    const { container } = render(
      <Shuffle text="HULIAN" triggerOnView={false} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.tagName).toBe("P"); // 默认 tag=p
    expect(root.getAttribute("aria-label")).toBe("HULIAN");
  });

  it("带 token 类：font-mono + text-foreground，可视字符在 aria-hidden span 内", () => {
    const { container } = render(
      <Shuffle text="x" triggerOnView={false} />,
    );
    const root = container.firstElementChild as HTMLElement;
    const cls = root.getAttribute("class")!;
    expect(cls).toContain("font-mono");
    expect(cls).toContain("text-foreground");
    const visible = root.querySelector("[aria-hidden]");
    expect(visible).not.toBeNull();
  });

  it("tag / className / textAlign prop 透传", () => {
    const { container } = render(
      <Shuffle
        text="Hi"
        tag="h2"
        className="test-shuffle-class"
        textAlign="left"
        triggerOnView={false}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("H2");
    expect(root.getAttribute("class")).toContain("test-shuffle-class");
    expect(root.style.textAlign).toBe("left");
  });

  it("reduced-motion：直接落终态文本并触发 onShuffleComplete", async () => {
    window.matchMedia = vi.fn().mockImplementation((q: string) => ({
      matches: true, // prefers-reduced-motion: reduce
      media: q,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    const onDone = vi.fn();
    const { container } = render(
      <Shuffle
        text="DECRYPT"
        triggerOnView={false}
        onShuffleComplete={onDone}
      />,
    );
    const visible = container.querySelector("[aria-hidden]") as HTMLElement;
    // 终态文本立即可见（DOM 字符与动画终态一致）
    expect(visible.textContent).toBe("DECRYPT");
    expect(onDone).toHaveBeenCalled();
  });

  it("triggerOnView=true 且未进入视口时不抛错（useInView 默认 false）", () => {
    expect(() =>
      render(<Shuffle text="LAZY" triggerOnView />),
    ).not.toThrow();
  });

  it("loop 模式 loopDelay 等待窗口内 hover 不启动并发 run（runningRef 仍为忙）", () => {
    vi.useFakeTimers();
    // 冻结时间，使 rAF 单帧即把 progress 拉满：start 取 now=0，回调时 now 远大于 totalMs
    let clock = 0;
    vi.spyOn(performance, "now").mockImplementation(() => clock);
    // rAF 一拍即推进到完成：单帧把 progress 拉满，落终态并排 loop 定时器
    const rafSpy = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb: FrameRequestCallback) => {
        clock += 1e6; // 推进时钟，保证下一次 tick 的 progress>=1
        cb(clock);
        return 1;
      });
    try {
      const { container } = render(
        <Shuffle
          text="LOOP"
          duration={0.0001}
          loop
          loopDelay={5}
          triggerOnView={false}
          triggerOnHover
        />,
      );
      // 初次 run 完成后排了 loopDelay 定时器；记录此刻 rAF 调用次数
      const callsAfterFirstRun = rafSpy.mock.calls.length;
      const root = container.firstElementChild as HTMLElement;
      // 等待窗口内 hover：应被 runningRef 守卫挡掉，不得再触发新一轮 rAF
      // （buggy 版本此处 runningRef 已被置 false，hover 会启动并发 run → rAF 增多）
      fireEvent.mouseEnter(root);
      expect(rafSpy.mock.calls.length).toBe(callsAfterFirstRun);
    } finally {
      rafSpy.mockRestore();
      vi.useRealTimers();
    }
  });
});

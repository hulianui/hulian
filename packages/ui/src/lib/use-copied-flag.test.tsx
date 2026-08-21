import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCopiedFlag } from "./use-copied-flag";

function Probe({ resetAfterMs }: { resetAfterMs?: number }) {
  const [copied, markCopied] = useCopiedFlag(resetAfterMs);
  return (
    <button type="button" onClick={markCopied}>
      {copied ? "已复制" : "复制"}
    </button>
  );
}

describe("useCopiedFlag", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("标记后置位，到点自动复位", () => {
    render(<Probe />);
    expect(screen.getByRole("button").textContent).toBe("复制");

    act(() => screen.getByRole("button").click());
    expect(screen.getByRole("button").textContent).toBe("已复制");

    act(() => void vi.advanceTimersByTime(1499));
    expect(screen.getByRole("button").textContent).toBe("已复制");

    act(() => void vi.advanceTimersByTime(1));
    expect(screen.getByRole("button").textContent).toBe("复制");
  });

  // 这是原来那份内联写法的第二个缺陷：连点两次，第一个 timer 会把第二次的反馈提前抹掉。
  it("重复标记时重新计时，而不是被上一次的定时器提前抹掉", () => {
    render(<Probe />);
    act(() => screen.getByRole("button").click());
    act(() => void vi.advanceTimersByTime(1000));
    act(() => screen.getByRole("button").click());

    // 距第一次点击已 1500ms，若旧 timer 还在就会在此刻复位
    act(() => void vi.advanceTimersByTime(500));
    expect(screen.getByRole("button").textContent).toBe("已复制");

    act(() => void vi.advanceTimersByTime(1000));
    expect(screen.getByRole("button").textContent).toBe("复制");
  });

  // #310 的本体：卸载后 timer 仍会触发 setState。在 jsdom 里表现为环境拆掉之后抛
  // `ReferenceError: window is not defined`，让 CI 偶发变红且看起来像测试挂了。
  it("卸载时清掉未到点的定时器，不再对已卸载组件 setState", () => {
    const onError = vi.fn();
    const { unmount } = render(<Probe />);
    act(() => screen.getByRole("button").click());
    unmount();

    expect(vi.getTimerCount()).toBe(0);

    window.addEventListener("error", onError);
    act(() => void vi.advanceTimersByTime(5000));
    window.removeEventListener("error", onError);
    expect(onError).not.toHaveBeenCalled();
  });

  it("复位时长可调", () => {
    render(<Probe resetAfterMs={400} />);
    act(() => screen.getByRole("button").click());
    act(() => void vi.advanceTimersByTime(400));
    expect(screen.getByRole("button").textContent).toBe("复制");
  });
});

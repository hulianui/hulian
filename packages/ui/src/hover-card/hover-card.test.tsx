import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card";

function Demo({ openDelay = 300, closeDelay = 150 }: { openDelay?: number; closeDelay?: number }) {
  return (
    <HoverCard openDelay={openDelay} closeDelay={closeDelay}>
      <HoverCardTrigger render={<button>@瑚琏</button>} />
      <HoverCardContent>
        <p>简介卡片</p>
      </HoverCardContent>
    </HoverCard>
  );
}

describe("HoverCard", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("闭合态: 触发器在, 卡片内容不在 DOM", () => {
    render(<Demo />);
    expect(screen.getByText("@瑚琏")).toBeTruthy();
    expect(screen.queryByText("简介卡片")).toBeNull();
  });

  it("hover 触发器 + 经过 openDelay 后打开卡片 + surface 皮肤", () => {
    render(<Demo openDelay={300} />);
    fireEvent.mouseEnter(screen.getByText("@瑚琏"));
    // 未到 delay 前不开
    act(() => void vi.advanceTimersByTime(200));
    expect(screen.queryByText("简介卡片")).toBeNull();
    // 越过 delay 后打开
    act(() => void vi.advanceTimersByTime(150));
    expect(screen.getByText("简介卡片")).toBeTruthy();
    expect(document.querySelector(".bg-surface.border-hairline")).not.toBeNull();
  });

  it("移出后经过 closeDelay 关闭卡片", () => {
    render(<Demo openDelay={0} closeDelay={150} />);
    fireEvent.mouseEnter(screen.getByText("@瑚琏"));
    act(() => void vi.advanceTimersByTime(0));
    expect(screen.getByText("简介卡片")).toBeTruthy();
    fireEvent.mouseLeave(screen.getByText("@瑚琏"));
    act(() => void vi.advanceTimersByTime(150));
    expect(screen.queryByText("简介卡片")).toBeNull();
  });
});

describe("HoverCardContent 透传 div 属性（#201）", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function open(content: React.ReactNode) {
    render(
      <HoverCard openDelay={0} closeDelay={150}>
        <HoverCardTrigger render={<button>@瑚琏</button>} />
        {content}
      </HoverCard>,
    );
    fireEvent.mouseEnter(screen.getByText("@瑚琏"));
    act(() => void vi.advanceTimersByTime(0));
  }

  it("data-testid / role 等原生属性落到卡片根", () => {
    open(
      <HoverCardContent data-testid="profile-card" role="note">
        <p>简介卡片</p>
      </HoverCardContent>,
    );
    const card = document.querySelector('[data-testid="profile-card"]')!;
    expect(card).not.toBeNull();
    expect(card.getAttribute("role")).toBe("note");
  });

  it("onClick 可挂：卡片内点击能被 stopPropagation 拦在整行 onClick 之前", () => {
    const rowClick = vi.fn();
    render(
      <button type="button" onClick={rowClick}>
        <HoverCard openDelay={0}>
          {/* 外层已是 <button>，触发器只能是非 button 元素 */}
          <HoverCardTrigger nativeButton={false} render={<span>@瑚琏</span>} />
          <HoverCardContent onClick={(e) => e.stopPropagation()} data-testid="c">
            <p>简介卡片</p>
          </HoverCardContent>
        </HoverCard>
      </button>,
    );
    fireEvent.mouseEnter(screen.getByText("@瑚琏"));
    act(() => void vi.advanceTimersByTime(0));
    fireEvent.click(screen.getByText("简介卡片"));
    // 卡片被 portal 出去，但合成事件仍沿 React 树冒泡回外层按钮——没有 stopPropagation 就会误触发
    expect(rowClick).not.toHaveBeenCalled();
  });

  it("消费方的 onMouseEnter/onMouseLeave 与内部计时器合并而不是覆盖它", () => {
    const onEnter = vi.fn();
    open(
      <HoverCardContent onMouseEnter={onEnter} data-testid="c">
        <p>简介卡片</p>
      </HoverCardContent>,
    );
    // 先移出触发器（进入关闭倒计时），再移入卡片——内部逻辑要能把它救回来
    fireEvent.mouseLeave(screen.getByText("@瑚琏"));
    fireEvent.mouseEnter(document.querySelector('[data-testid="c"]')!);
    act(() => void vi.advanceTimersByTime(300));
    expect(onEnter).toHaveBeenCalled();
    expect(screen.queryByText("简介卡片")).toBeTruthy();
  });

  // #229：与 Popover 同一个 Base UI Positioner，anchor 一并开。jsdom 量不到真实坐标，
  // 钉的是「anchor 确实透到了定位层」——虚拟元素的 getBoundingClientRect 被读过即成立。
  it("anchor: 卡片按传入的虚拟锚点定位（触发器仍负责打开）", async () => {
    const getBoundingClientRect = vi.fn(
      () =>
        ({
          x: 40,
          y: 20,
          width: 8,
          height: 8,
          top: 20,
          left: 40,
          right: 48,
          bottom: 28,
        }) as DOMRect,
    );
    open(
      <HoverCardContent anchor={{ getBoundingClientRect }} data-testid="c">
        <p>简介卡片</p>
      </HoverCardContent>,
    );
    expect(screen.getByText("简介卡片")).toBeTruthy();
    // 定位是 Floating UI 的 promise 链，要放掉一轮微任务才落地（本用例在假定时器下，
    // waitFor 的轮询用不了，故直接 await 一次 act）。
    await act(async () => {});
    expect(getBoundingClientRect).toHaveBeenCalled();
  });

  it("消费方 style 与内部过渡样式合并", () => {
    open(
      <HoverCardContent style={{ width: "30rem" }} data-testid="c">
        <p>简介卡片</p>
      </HoverCardContent>,
    );
    const card = document.querySelector('[data-testid="c"]') as HTMLElement;
    expect(card.style.width).toBe("30rem");
    expect(card.style.transition).toContain("opacity");
  });
});

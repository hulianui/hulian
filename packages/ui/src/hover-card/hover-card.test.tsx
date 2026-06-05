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

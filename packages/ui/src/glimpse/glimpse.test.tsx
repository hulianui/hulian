import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { Glimpse } from "./glimpse";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("Glimpse", () => {
  it("有 href 时触发器渲染为新标签外链", () => {
    const { getByText } = render(
      <Glimpse href="https://example.com/docs" title="文档">
        示例链接
      </Glimpse>,
    );
    const trigger = getByText("示例链接").closest("a")!;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute("href")).toBe("https://example.com/docs");
    expect(trigger.getAttribute("target")).toBe("_blank");
    expect(trigger.getAttribute("rel")).toContain("noreferrer");
  });

  it("无 href 时触发器为 span（非链接）", () => {
    const { getByText } = render(<Glimpse title="术语">行内词</Glimpse>);
    const el = getByText("行内词");
    expect(el.closest("a")).toBeNull();
    expect(el.tagName.toLowerCase()).toBe("span");
  });

  it("透传触发器 className", () => {
    const { getByText } = render(<Glimpse className="my-trigger">触发</Glimpse>);
    expect(getByText("触发").className).toContain("my-trigger");
  });

  it("悬停后浮层打开并渲染预览内容", () => {
    const { getByText, queryByText } = render(
      <Glimpse href="https://example.com" image="/x.png" title="预览标题" description="一段描述">
        悬停我
      </Glimpse>,
    );
    expect(queryByText("预览标题")).toBeNull();
    act(() => {
      fireEvent.mouseEnter(getByText("悬停我"));
    });
    act(() => {
      vi.advanceTimersByTime(350); // openDelay 默认 300ms
    });
    expect(getByText("预览标题")).toBeTruthy();
    expect(getByText("一段描述")).toBeTruthy();
    expect(getByText("example.com")).toBeTruthy();
  });
});

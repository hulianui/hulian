import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { MessageActions } from "./message-actions";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("MessageActions", () => {
  it("仅渲染有回调/content 的键", () => {
    const { getByLabelText, queryByLabelText } = render(
      <MessageActions content="文本" onRegenerate={() => {}} />,
    );
    expect(getByLabelText("复制")).toBeTruthy();
    expect(getByLabelText("重新生成")).toBeTruthy();
    expect(queryByLabelText("赞")).toBeNull();
    expect(queryByLabelText("踩")).toBeNull();
  });
  it("点赞/踩触发回调", () => {
    const onLike = vi.fn();
    const onDislike = vi.fn();
    const { getByLabelText } = render(
      <MessageActions onLike={onLike} onDislike={onDislike} />,
    );
    fireEvent.click(getByLabelText("赞"));
    fireEvent.click(getByLabelText("踩"));
    expect(onLike).toHaveBeenCalled();
    expect(onDislike).toHaveBeenCalled();
  });
  it("无任何 content/回调时不渲染复制键", () => {
    const { queryByLabelText } = render(<MessageActions />);
    expect(queryByLabelText("复制")).toBeNull();
  });
  it("复制后 1.5s 内卸载不应对已卸载组件 setState（计时器被清理）", async () => {
    vi.useFakeTimers();
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const { getByLabelText, unmount } = render(
      <MessageActions content="文本" />,
    );
    await act(async () => {
      fireEvent.click(getByLabelText("复制"));
    });
    // 反馈复位计时器尚在挂起态时卸载组件
    unmount();
    // 推进到计时器原本会触发 setCopied(false) 的时刻
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    // 计时器已在卸载时清理，不应触发任何 setState-after-unmount 报错
    expect(errSpy).not.toHaveBeenCalled();
  });
});

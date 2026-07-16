import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { VoiceRecord } from "./voice-record";

describe("VoiceRecord", () => {
  it("renders idle state", () => {
    render(<VoiceRecord status="idle" />);
    expect(screen.getByLabelText("按住说话")).toBeTruthy();
    expect(screen.getByText("按住说话")).toBeTruthy();
  });

  it("renders recording state", () => {
    render(<VoiceRecord status="recording" />);
    expect(screen.getByLabelText("松开结束录音")).toBeTruthy();
    expect(screen.getByText("松开结束")).toBeTruthy();
  });

  it("renders processing state", () => {
    render(<VoiceRecord status="processing" />);
    expect(screen.getByLabelText("处理中")).toBeTruthy();
  });

  // ── 按住说话（pressAndHold）交互回归 ──
  // 背景：真机上一次点按会把按钮顶进录音态且出不来。根因是触屏双触发 +
  // 漏听 pointercancel + 松手依赖异步 status 回环。以下测试把这三点钉死。

  it("触屏按下只发一次 start（pointerdown 与 touchstart 不再各触发一次）", () => {
    const onToggle = vi.fn();
    const onPress = vi.fn();
    render(<VoiceRecord status="idle" onToggle={onToggle} onPress={onPress} />);
    const btn = screen.getByRole("button");

    fireEvent.pointerDown(btn, { pointerType: "touch", pointerId: 1 });
    // 真机会紧接着补一个 touchstart —— 旧代码会再触发一次 start
    fireEvent.touchStart(btn, { touches: [{ clientX: 0, clientY: 0 }] });

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith("idle");
  });

  it("松手（pointerup）触发停止，且不依赖 status 已回环到 recording", () => {
    const onToggle = vi.fn();
    const onRelease = vi.fn();
    // 关键：status 仍是 idle（模拟父组件异步状态尚未回来）
    render(<VoiceRecord status="idle" onToggle={onToggle} onRelease={onRelease} />);
    const btn = screen.getByRole("button");

    fireEvent.pointerDown(btn, { pointerType: "touch", pointerId: 1 });
    onToggle.mockClear();
    fireEvent.pointerUp(btn, { pointerType: "touch", pointerId: 1 });

    expect(onRelease).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith("recording");
  });

  it("手势被打断（pointercancel）也能触发停止，避免死锁在录音态", () => {
    const onToggle = vi.fn();
    const onRelease = vi.fn();
    render(<VoiceRecord status="idle" onToggle={onToggle} onRelease={onRelease} />);
    const btn = screen.getByRole("button");

    fireEvent.pointerDown(btn, { pointerType: "touch", pointerId: 1 });
    onToggle.mockClear();
    // iOS 手势被系统打断时派发的是 pointercancel 而非 pointerup
    fireEvent.pointerCancel(btn, { pointerType: "touch", pointerId: 1 });

    expect(onRelease).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith("recording");
  });

  it("松手只结束一次：pointerup 后再来的 pointerleave/cancel 不重复触发", () => {
    const onRelease = vi.fn();
    render(<VoiceRecord status="idle" onRelease={onRelease} />);
    const btn = screen.getByRole("button");

    fireEvent.pointerDown(btn, { pointerType: "touch", pointerId: 1 });
    fireEvent.pointerUp(btn, { pointerType: "touch", pointerId: 1 });
    fireEvent.pointerLeave(btn, { pointerType: "touch", pointerId: 1 });
    fireEvent.pointerCancel(btn, { pointerType: "touch", pointerId: 1 });

    expect(onRelease).toHaveBeenCalledTimes(1);
  });

  it("非 idle 态按下不重复发起录音", () => {
    const onToggle = vi.fn();
    render(<VoiceRecord status="recording" onToggle={onToggle} />);
    const btn = screen.getByRole("button");

    fireEvent.pointerDown(btn, { pointerType: "touch", pointerId: 1 });

    expect(onToggle).not.toHaveBeenCalled();
  });

  it("点击切换模式（pressAndHold=false）：click 上报当前 status", () => {
    const onToggle = vi.fn();
    render(<VoiceRecord status="idle" pressAndHold={false} onToggle={onToggle} />);
    const btn = screen.getByRole("button");

    fireEvent.pointerDown(btn, { pointerType: "touch", pointerId: 1 });
    // 按住模式的 press 不应触发
    expect(onToggle).not.toHaveBeenCalled();
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalledWith("idle");
  });
});

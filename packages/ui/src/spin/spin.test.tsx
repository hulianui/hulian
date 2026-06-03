import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Spin } from "./spin";

afterEach(cleanup);

describe("Spin", () => {
  it("spinning 包裹 children：渲遮罩(role=status) + 内容降透明 + aria-busy", () => {
    const { container } = render(
      <Spin spinning tip="加载中">
        <div>内容区</div>
      </Spin>,
    );
    expect(screen.getByText("内容区")).toBeTruthy();
    expect(screen.getByText("加载中")).toBeTruthy();
    expect(container.querySelector('[role="status"]')).not.toBeNull();
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    // 内容包裹层降透明
    expect(container.querySelector(".opacity-50")).not.toBeNull();
  });

  it("spinning=false：直出内容，无遮罩", () => {
    const { container } = render(
      <Spin spinning={false}>
        <div>内容区</div>
      </Spin>,
    );
    expect(screen.getByText("内容区")).toBeTruthy();
    expect(container.querySelector('[role="status"]')).toBeNull();
    expect(container.querySelector(".opacity-50")).toBeNull();
  });

  it("无 children：作纯指示器（spinning 时渲 Spinner）", () => {
    const { container } = render(<Spin spinning />);
    expect(container.querySelector('[role="status"]')).not.toBeNull();
    // Spinner 自身带 role=status + aria-label
    expect(container.querySelector('[aria-label="加载中"]')).not.toBeNull();
  });

  it("纯指示器 spinning=false：不渲染", () => {
    const { container } = render(<Spin spinning={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("fullscreen：渲 fixed 整页遮罩", () => {
    const { container } = render(<Spin spinning fullscreen tip="整页" />);
    const overlay = container.querySelector('[role="status"]') as HTMLElement;
    expect(overlay).not.toBeNull();
    expect(overlay.className).toContain("fixed");
    expect(overlay.className).toContain("inset-0");
  });

  it("delay：spinning 后未到 delay 不显示，到点才显示", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(
        <Spin spinning delay={300}>
          <div>内容区</div>
        </Spin>,
      );
      // 等待期：无遮罩
      expect(container.querySelector('[role="status"]')).toBeNull();
      act(() => {
        vi.advanceTimersByTime(300);
      });
      // 到点：遮罩出现
      expect(container.querySelector('[role="status"]')).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { notification, NotificationProvider } from "./notification";

afterEach(cleanup);

/** 取带指定皮肤类的元素（用唯一标题隔离）。 */
function cardOf(title: string) {
  return screen.getByText(title).closest("[class*='bg-surface']") as HTMLElement;
}

describe("Notification（命令式）", () => {
  it("notification.success 渲出标题/描述 + success 左边条", () => {
    render(<NotificationProvider />);
    act(() => {
      notification.success({ title: "成功标题-唯一", description: "描述文案", duration: 0 });
    });
    expect(screen.getByText("成功标题-唯一")).toBeTruthy();
    expect(screen.getByText("描述文案")).toBeTruthy();
    expect(cardOf("成功标题-唯一").className).toContain("border-l-success");
  });

  it("error 类型：danger 左边条 + role=alert", () => {
    render(<NotificationProvider />);
    act(() => {
      notification.error({ title: "错误标题-唯一", duration: 0 });
    });
    const card = cardOf("错误标题-唯一");
    expect(card.className).toContain("border-l-danger");
    expect(card.getAttribute("role")).toBe("alert");
  });

  it("info 左边条用 primary token（名同 Alert）", () => {
    render(<NotificationProvider />);
    act(() => {
      notification.info({ title: "信息标题-唯一", duration: 0 });
    });
    expect(cardOf("信息标题-唯一").className).toContain("border-l-primary");
  });

  it("placement=bottomLeft 落在对应 viewport（flex-col-reverse + 左下定位）", () => {
    render(<NotificationProvider />);
    act(() => {
      notification.open({ title: "左下标题-唯一", placement: "bottomLeft", duration: 0 });
    });
    const viewport = cardOf("左下标题-唯一").parentElement as HTMLElement;
    expect(viewport.className).toContain("bottom-4");
    expect(viewport.className).toContain("left-4");
    expect(viewport.className).toContain("flex-col-reverse");
  });

  it("btn 操作区渲染在卡片内", () => {
    render(<NotificationProvider />);
    act(() => {
      notification.open({
        title: "带操作-唯一",
        duration: 0,
        btn: <button type="button">查看详情</button>,
      });
    });
    expect(cardOf("带操作-唯一").querySelector("button")).toBeTruthy();
    expect(screen.getByText("查看详情")).toBeTruthy();
  });

  it("点关闭按钮触发 onClose 并移除", async () => {
    const onClose = vi.fn();
    render(<NotificationProvider />);
    act(() => {
      notification.open({ title: "可关闭-唯一", duration: 0, onClose });
    });
    const closeBtn = cardOf("可关闭-唯一").querySelector('button[aria-label="关闭"]') as HTMLButtonElement;
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByText("可关闭-唯一")).toBeNull());
  });

  it("duration>0 到点自动关闭", async () => {
    vi.useFakeTimers();
    try {
      render(<NotificationProvider />);
      act(() => {
        notification.info({ title: "自动关-唯一", duration: 2000 });
      });
      expect(screen.getByText("自动关-唯一")).toBeTruthy();
      act(() => {
        vi.advanceTimersByTime(2000); // duration 到点 → 触发关闭(open=false)
      });
      act(() => {
        vi.advanceTimersByTime(300); // 出场时长后兜底移除
      });
      expect(screen.queryByText("自动关-唯一")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("duration=0 不自动关（推进 10s 仍在）", () => {
    vi.useFakeTimers();
    try {
      render(<NotificationProvider />);
      act(() => {
        notification.open({ title: "常驻-唯一", duration: 0 });
      });
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(screen.getByText("常驻-唯一")).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("destroy() 主动关闭", async () => {
    render(<NotificationProvider />);
    let inst: { destroy: () => void } | undefined;
    act(() => {
      inst = notification.open({ title: "主动关-唯一", duration: 0 });
    });
    act(() => {
      inst?.destroy();
    });
    await waitFor(() => expect(screen.queryByText("主动关-唯一")).toBeNull());
  });
});

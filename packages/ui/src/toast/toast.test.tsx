import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toast, ToastProvider } from "./toast";
import { ConfigProvider } from "../config/config-provider";
import { enUS, zhCN } from "../config/locale";

// 全局单例 manager 跨测试持有 toast；RTL render 跨测试累积 DOM → 每个用例后清掉挂载。
// 各用例用唯一 title 文案隔离（limit=3 会挤出旧条，最新条始终可查）。
// Base UI 另渲一份 aria-live 播报副本 → title 文案出现两次，用 queryAllByText 取带皮肤的 <h2>。
afterEach(cleanup);

/** 取带指定皮肤类的标题元素（跳过 aria-live 播报副本）；不存在返回 undefined。 */
function titleEl(text: string, mustContain: string) {
  return screen.queryAllByText(text).find((el) => el.className.includes(mustContain));
}

describe("Toast", () => {
  it("关闭按钮随 enUS 本地化，缺 Provider 与 legacy locale 保持精确中文", () => {
    const assertClose = (label: string, title: string) => {
      act(() => { toast({ title, timeout: 0 }); });
      const root = titleEl(title, "text-foreground")!.closest("[class*='bg-surface']")!;
      expect(root.querySelector(`button[aria-label="${label}"]`)).toBeTruthy();
    };

    const first = render(<ToastProvider />);
    assertClose("关闭", "默认关闭标签");
    first.unmount();

    const second = render(<ConfigProvider locale={enUS}><ToastProvider /></ConfigProvider>);
    assertClose("Close", "English close label");
    second.unmount();

    render(<ConfigProvider locale={{ ...zhCN, components: undefined }}><ToastProvider /></ConfigProvider>);
    assertClose("关闭", "旧 locale 关闭标签");
  });
  it("toast() 触发后 Provider 渲出 title 与 description", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "已保存", description: "更改已成功同步。" });
    });
    expect(screen.getAllByText("已保存").length).toBeGreaterThan(0);
    expect(screen.getAllByText("更改已成功同步。").length).toBeGreaterThan(0);
  });

  it("danger tone：标题 text-danger + 容器 border-l-danger", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "出错了", tone: "danger" });
    });
    const title = titleEl("出错了", "text-danger");
    expect(title).toBeTruthy();
    // 容器（Toast.Root）带 danger 左边条
    expect(title!.closest("[class*='border-l-danger']")).not.toBeNull();
  });

  it("success tone：标题 text-success + 容器 border-l-success", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "已保存成功", tone: "success" });
    });
    const title = titleEl("已保存成功", "text-success");
    expect(title).toBeTruthy();
    expect(title!.closest("[class*='border-l-success']")).not.toBeNull();
  });

  it("warning tone：标题 text-warning + 容器 border-l-warning", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "部分失败", tone: "warning" });
    });
    const title = titleEl("部分失败", "text-warning");
    expect(title).toBeTruthy();
    expect(title!.closest("[class*='border-l-warning']")).not.toBeNull();
  });

  it("info tone：标题 text-info", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "提示", tone: "info" });
    });
    expect(titleEl("提示", "text-info")).toBeTruthy();
  });

  it("默认 tone=neutral：标题 text-foreground", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "普通" });
    });
    expect(titleEl("普通", "text-foreground")).toBeTruthy();
  });

  it("点 Close 按钮后该 toast 移除", async () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "可关闭项", timeout: 0 }); // 0=不自动消失，隔离计时干扰
    });
    const title = titleEl("可关闭项", "text-foreground");
    expect(title).toBeTruthy();
    const root = title!.closest("[class*='bg-surface']") as HTMLElement;
    // Base UI 在 toast 未聚焦时给 Close 加 aria-hidden（移出 a11y 树）→ getByRole 找不到，直接查 DOM。
    const closeBtn = root.querySelector('button[aria-label="关闭"]') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    fireEvent.click(closeBtn);
    await waitFor(() => expect(titleEl("可关闭项", "text-foreground")).toBeFalsy());
  });

  it("ToastProvider 透传渲染 children（包裹式写法不吞子树）", () => {
    render(
      <ToastProvider>
        <div>应用内容</div>
      </ToastProvider>,
    );
    expect(screen.getByText("应用内容")).toBeTruthy();
    // children 存在时命令式触发照常工作
    act(() => {
      toast({ title: "包裹式触发" });
    });
    expect(screen.getAllByText("包裹式触发").length).toBeGreaterThan(0);
  });

  it("timeout:0 不自动消失（fake timers 推进 10s 仍在）", () => {
    vi.useFakeTimers();
    try {
      render(<ToastProvider />);
      act(() => {
        toast({ title: "常驻项", timeout: 0 });
      });
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(titleEl("常驻项", "text-foreground")).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });
});

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { toast, ToastProvider } from "./toast";

// 全局单例 manager 跨测试持有 toast；RTL render 跨测试累积 DOM → 每个用例后清掉挂载。
// 各用例用唯一 title 文案隔离（limit=3 会挤出旧条，最新条始终可查）。
// Base UI 另渲一份 aria-live 播报副本 → title 文案出现两次，用 getAllByText 取带皮肤的 <h2>。
afterEach(cleanup);

function titleEl(text: string, mustContain: string) {
  const matches = screen.getAllByText(text);
  return matches.find((el) => el.className.includes(mustContain));
}

describe("Toast", () => {
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

  it("info tone：标题 text-primary", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "提示", tone: "info" });
    });
    expect(titleEl("提示", "text-primary")).toBeTruthy();
  });

  it("默认 tone=neutral：标题 text-foreground", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "普通" });
    });
    expect(titleEl("普通", "text-foreground")).toBeTruthy();
  });
});

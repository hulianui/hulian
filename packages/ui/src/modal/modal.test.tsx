import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { modal, ModalProvider } from "./modal";

// 全局单例 manager 跨测试持有记录；每用例后清掉挂载，并用唯一标题隔离。
afterEach(cleanup);

describe("Modal（命令式）", () => {
  it("modal.confirm 渲出标题/内容 + 确定 + 取消两键", () => {
    render(<ModalProvider />);
    act(() => {
      modal.confirm({ title: "确认删除该项？", content: "不可恢复。" });
    });
    expect(screen.getByText("确认删除该项？")).toBeTruthy();
    expect(screen.getByText("不可恢复。")).toBeTruthy();
    expect(screen.getByRole("button", { name: "确定" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "取消" })).toBeTruthy();
  });

  it("info 类型只渲确定键（无取消）", () => {
    render(<ModalProvider />);
    act(() => {
      modal.info({ title: "纯信息提示" });
    });
    expect(screen.getByText("纯信息提示")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "取消" })).toBeNull();
    expect(screen.getByRole("button", { name: "确定" })).toBeTruthy();
  });

  it("error 类型派生 danger 主色图标", () => {
    render(<ModalProvider />);
    act(() => {
      modal.error({ title: "出错了-唯一" });
    });
    const popup = screen.getByText("出错了-唯一").closest("[class*='bg-surface']") as HTMLElement;
    expect(popup.querySelector(".text-danger")).not.toBeNull();
  });

  it("点取消触发 onCancel 并关闭", async () => {
    const onCancel = vi.fn();
    render(<ModalProvider />);
    act(() => {
      modal.confirm({ title: "可取消项-唯一", onCancel });
    });
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    expect(onCancel).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByText("可取消项-唯一")).toBeNull());
  });

  it("同步 onOk 点确定后关闭", async () => {
    const onOk = vi.fn();
    render(<ModalProvider />);
    act(() => {
      modal.confirm({ title: "同步确定-唯一", onOk });
    });
    fireEvent.click(screen.getByRole("button", { name: "确定" }));
    expect(onOk).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByText("同步确定-唯一")).toBeNull());
  });

  it("onOk 返回 pending Promise 时确定键进 loading 且对话框保持打开", async () => {
    let resolveFn: (() => void) | undefined;
    const onOk = () => new Promise<void>((resolve) => (resolveFn = resolve));
    render(<ModalProvider />);
    act(() => {
      modal.confirm({ title: "异步确定-唯一", onOk });
    });
    const okBtn = screen.getByRole("button", { name: "确定" }) as HTMLButtonElement;
    fireEvent.click(okBtn);
    await waitFor(() => expect(okBtn.disabled).toBe(true)); // loading → disabled
    expect(screen.getByText("异步确定-唯一")).toBeTruthy();
    await act(async () => {
      resolveFn?.();
    });
    await waitFor(() => expect(screen.queryByText("异步确定-唯一")).toBeNull());
  });

  it("destroy() 主动关闭对话框", async () => {
    render(<ModalProvider />);
    let inst: { destroy: () => void } | undefined;
    act(() => {
      inst = modal.info({ title: "主动销毁-唯一" });
    });
    expect(screen.getByText("主动销毁-唯一")).toBeTruthy();
    act(() => {
      inst?.destroy();
    });
    await waitFor(() => expect(screen.queryByText("主动销毁-唯一")).toBeNull());
  });

  it("update() 改写已打开对话框的标题", () => {
    render(<ModalProvider />);
    let inst: { update: (n: { title: string }) => void } | undefined;
    act(() => {
      inst = modal.info({ title: "旧标题-唯一" });
    });
    act(() => {
      inst?.update({ title: "新标题-唯一" });
    });
    expect(screen.queryByText("旧标题-唯一")).toBeNull();
    expect(screen.getByText("新标题-唯一")).toBeTruthy();
  });
});

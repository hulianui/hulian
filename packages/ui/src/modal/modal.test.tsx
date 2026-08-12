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

  it("danger：确定键落在 danger tone（#231）", () => {
    render(<ModalProvider />);
    act(() => {
      modal.confirm({ title: "删除这条记录？危险档", content: "删除后不可恢复。", danger: true });
    });
    // 精确切词：substring 查 "bg-danger" 会被 "bg-danger-hover"（同串里就有）撞上，
    // 那样即使按钮只保留了 hover 态也算通过，等于没测到静息色。
    const ok = screen.getByRole("button", { name: "确定" });
    const cls = ok.className.split(/\s+/);
    expect(cls).toContain("bg-danger");
    expect(cls).toContain("text-danger-foreground");
    expect(cls).not.toContain("bg-primary"); // 主色档必须让位，否则和「保存」同色
  });

  it("不传 danger：确定键仍是主色档（既有调用点零影响）", () => {
    render(<ModalProvider />);
    act(() => {
      modal.confirm({ title: "普通确认-唯一" });
    });
    const cls = screen.getByRole("button", { name: "确定" }).className.split(/\s+/);
    expect(cls).not.toContain("bg-danger");
  });

  it("danger 覆盖图标色但不换字形：confirm 的问号图标转 text-danger", () => {
    render(<ModalProvider />);
    act(() => {
      modal.confirm({ title: "危险图标色-唯一", danger: true });
    });
    const popup = screen.getByText("危险图标色-唯一").closest("[class*='bg-surface']") as HTMLElement;
    const icon = popup.querySelector("svg")!;
    expect(icon.getAttribute("class")!.split(/\s+/)).toContain("text-danger");
    // type=confirm 的默认主色不再出现在图标上
    expect(icon.getAttribute("class")!.split(/\s+/)).not.toContain("text-primary");
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
